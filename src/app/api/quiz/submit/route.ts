// src/app/api/quiz/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import path from 'path';
import fs from 'fs';
import { readHistory, writeHistory, readUsers } from '@/lib/db';
import { User, UserTestResult } from '@/lib/types';

// --- Configuration ---
const dataDir = path.resolve(process.cwd(), 'src/data/questions'); // Updated path
const excludedFiles = ['placeholder.json']; // Adjust if needed
const FINAL_TEST_ID_SUFFIX = 6;
// --- End Configuration ---

interface QuestionOption { id: string | number; text: string; }
interface Question { id: number | string; question: string; options: QuestionOption[]; correct_answer: string | number; }
interface Answer { questionId: number | string; selectedOption: string | number | null; }

// --- Module Name Mapping (Same as Dashboard/Quiz API) ---
// Ideally import from a shared file
const moduleNameMapping: Record<string, string> = {
    "I - Currency Derivatives": "Currency Derivatives",
    "II-A": "Securities Market Overview",
    "II-B_RTA MF_December 2024": "RTA MF December 2024",
    "III-A Securities Intermediaries Compliance Non Fund Final V September 2024a": "Securities Intermediaries Compliance",
    "IV - Interest Rate Derivatives": "Interest Rate Derivatives",
    "IX-Merchant Banking": "Merchant Banking",
    "SEBI - Investor Certification Examination ...": "SEBI Investor Certification",
    "Series VI-Depository Operations-Ver-Dec ...": "Depository Operations",
    "Social Impact Assessors Certification Exa...": "Social Impact Assessors",
    "V-A MFD Workbook v December 2024": "MFD Workbook Dec 2024",
    "V-B_MFF": "Mutual Fund Foundation",
    "VIII - Equity Derivatives": "Equity Derivatives",
    "VII-SORM": "Securities Operations and Risk Management",
    "XA Investment Adviser Level 1": "Investment Adviser Level 1",
    "XB Level 2": "Investment Adviser Level 2",
    "XII_Securities Markets Foundation": "Securities Markets Foundation",
    "XIX-A_AIF (Category I and II)": "AIF (Category I and II)",
    "XIX-B_AIF": "AIF Module B",
    "XIX-C_AIF Managers_Version-Dec-2024_7...": "AIF Managers Dec 2024",
    "XVI - Commodity Derivatives": "Commodity Derivatives",
    "XVII Retirement Adviser": "Retirement Adviser",
    "XV-ResearchAnalyst": "Research Analyst",
    "XXIA PMS DISTRIBUTORS": "PMS Distributors",
    "XXI-B_Portfolio Managers": "Portfolio Managers",
    "XXII-Fixed Income Securities": "Fixed Income Securities"
    // Add ALL others
};
// --- End Mapping ---

// Function to get the verified module name using the mapping
const getVerifiedModuleName = (filename: string): string => {
    const key = filename.replace('.json', '');
    return moduleNameMapping[key] || key.replace(/[-_]/g, ' '); // Fallback
};

// Helper to find the correct module filename based on testId (Same as Quiz API)
const findModuleFile = (testIdNum: number): string | null => {
    // Corrected logic
    const moduleIndex = Math.floor((testIdNum - 101) / 100);
    if (moduleIndex < 0) return null;
     try {
        const filenames = fs.readdirSync(dataDir).filter(
          file => file.endsWith('.json') && !excludedFiles.includes(file)
        );
        // filenames.sort((a, b) => a.localeCompare(b)); // Apply same sorting as dashboard if needed
        return filenames[moduleIndex] || null;
    } catch (error) {
        console.error("Error reading data directory:", error);
        return null;
    }
};


export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const userId = (session?.user as any)?.id ?? null;
  let dbUserId: number | null = userId;

  if (!dbUserId && userEmail) {
    try {
      const allUsers = readUsers();
      const user = allUsers.find(u => u.email === userEmail);
      dbUserId = user?.id ?? null;
    } catch (err) { console.error("Error reading users:", err); }
  }


  if (!dbUserId) {
    return NextResponse.json({ error: 'Not authenticated or user data missing' }, { status: 401 });
  }


  try {
    // shuffledQuestions: Array of question objects *that were presented*
    // answers: Array of answer objects { questionId: ..., selectedOption: ... } from user
    const { testId, answers, shuffledQuestions } = await req.json();
    const testIdNum = parseInt(testId, 10);

    // Validate incoming data
    if (!testIdNum || !answers || !Array.isArray(answers) || !Array.isArray(shuffledQuestions)) {
      return NextResponse.json({ error: 'Missing or invalid fields (testId, answers array, shuffledQuestions array required)' }, { status: 400 });
    }

    const moduleFilename = findModuleFile(testIdNum);
    if (!moduleFilename) {
        console.error(`Submit API: Module file not found for Test ID: ${testIdNum}`);
        return NextResponse.json({ error: 'Test data configuration error: Module file not found' }, { status: 404 });
    }

    // Read the *entire* question list from the correct module file to get correct answers
    const moduleFilePath = path.join(dataDir, moduleFilename);
    const fileContent = fs.readFileSync(moduleFilePath, 'utf-8');
    const allModuleQuestions: Question[] = JSON.parse(fileContent);

    if (!Array.isArray(allModuleQuestions)) {
        throw new Error(`Invalid format in ${moduleFilename}, expected an array of questions.`);
    }

    // Create a map of correct answers for *all* questions in the module using STRING IDs
    const correctAnswersMap = new Map<string, string | number>();
    allModuleQuestions.forEach(q => {
        if (q.id !== undefined && q.id !== null) {
            correctAnswersMap.set(String(q.id), q.correct_answer);
        } else {
            console.warn(`Question missing ID in file ${moduleFilename} during submission:`, q.question);
        }
    });

    // Calculate score based on the *shuffledQuestions* (the ones actually presented)
    let correctCount = 0;
    const submittedAnswersMap = new Map<string, string | number | null>(); // Use string ID as key
    answers.forEach((ans: Answer) => { // Type the ans parameter
        if (ans.questionId !== undefined && ans.questionId !== null) {
             submittedAnswersMap.set(String(ans.questionId), ans.selectedOption);
        }
    });

    // Iterate ONLY over the questions that were presented to the user
    shuffledQuestions.forEach((q: Question) => {
      if (q.id === undefined || q.id === null) {
          console.warn('Skipping scoring for presented question without ID:', q.question);
          return; // Skip this question
      }
      const questionIdStr = String(q.id);
      const userAnswerSelection = submittedAnswersMap.get(questionIdStr);
      const correctAnswer = correctAnswersMap.get(questionIdStr);

      if (userAnswerSelection !== undefined && userAnswerSelection !== null && correctAnswer !== undefined) {
          if (String(userAnswerSelection) === String(correctAnswer)) {
              correctCount++;
          }
      } else if (correctAnswer === undefined) {
          // This indicates a mismatch between shuffledQuestions and the master list, shouldn't happen ideally
          console.warn(`Correct answer not found in map for presented question ID: ${questionIdStr}. Question: ${q.question}`);
      }
    });

    const totalQuestionsPresented = shuffledQuestions.length;
    const score = totalQuestionsPresented > 0 ? Math.round((correctCount / totalQuestionsPresented) * 100) : 0;
    const incorrectCount = totalQuestionsPresented - correctCount;

    // --- Save the result to history ---
     const moduleName = getVerifiedModuleName(moduleFilename); // Use the mapping
     const testNumber = testIdNum % 100;
     const isFinalTest = testNumber === FINAL_TEST_ID_SUFFIX;
     const testType = isFinalTest ? 'final' : 'practice';
     let testTitle = isFinalTest ? `${moduleName} - Final Mock Test` : `${moduleName} - Practice ${testNumber}`;

    const history = readHistory(); // Reads from src/data/user-test-history.json
    const newHistoryEntry: UserTestResult = {
      id: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1,
      userId: dbUserId,
      testId: testIdNum,
      testName: testTitle, // Use derived title with verified name
      sectionTitle: moduleName, // Use verified module name
      testType: testType,
      score,
      correctCount,
      totalQuestions: totalQuestionsPresented, // Use the count actually presented
      submittedAt: new Date().toISOString(),
    };
    history.push(newHistoryEntry);
    writeHistory(history); // Writes to src/data/user-test-history.json
    // --- End History Saving ---

    // --- Return the result ---
    return NextResponse.json({
      score,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      totalQuestions: totalQuestionsPresented,
    });

  } catch (error) {
    console.error('Failed to submit quiz:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred processing submission.';
     if (error instanceof SyntaxError) {
         return NextResponse.json({ error: `Invalid JSON format in module file during submission.` }, { status: 500 });
     }
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json({ error: 'Module data file not found during submission.' }, { status: 404 });
     }
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}