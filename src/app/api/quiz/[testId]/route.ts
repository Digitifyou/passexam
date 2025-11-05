// src/app/api/quiz/[testId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// --- Configuration ---
const dataDir = path.resolve(process.cwd(), 'src/data/questions'); // Updated path
const excludedFiles = ['placeholder.json']; // Adjust if needed
const PRACTICE_TESTS_PER_MODULE = 5;
const FINAL_TEST_ID_SUFFIX = 6;
const QUESTIONS_PER_PRACTICE = 25;
const QUESTIONS_PER_FINAL = 50;
// --- End Configuration ---

interface QuestionOption { id: string | number; text: string; }
interface Question { id: number; question: string; options: QuestionOption[]; correct_answer: string | number; }
interface TestDetails { id: number; title: string; test_type: 'practice' | 'final'; duration?: number; questions: Question[]; module: string; }

// --- Module Name Mapping (Same as Dashboard API) ---
// It's better to put this in a shared file (e.g., src/lib/moduleUtils.ts) and import it
const moduleNameMapping: Record<string, string> = // src/data/module_mapping.json
{
  "I - Currency Derivatives": "NISM Series I: Currency Derivatives Certification Examination",
  "II-A": "NISM Series II-A: Registrars to an Issue & Share Transfer Agents – Corporate Certification Examination",
  "II-B_RTA MF_December 2024": "NISM Series II-B: Registrars to an Issue & Share Transfer Agents – Mutual Fund Certification Examination",
  "III-A Securities Intermediaries Compliance Non Fund Final V September 2024a": "NISM Series III-A: Securities Intermediaries Compliance (Non-Fund) Certification Examination",
  "IV - Interest Rate Derivatives": "NISM Series IV: Interest Rate Derivatives Certification Examination",
  "IX-Merchant Banking": "NISM Series IX: Merchant Banking Certification Examination",
  "SEBI - Investor Certification Examination ...": "SEBI Investor Certification Examination – Financial Education Booklet", // Adjust key if filename differs
  "Series VI-Depository Operations-Ver-Dec ...": "NISM Series VI: Depository Operations Certification Examination", // Adjust key if filename differs
  "Social Impact Assessors Certification Exa...": "NISM Series XXIII: Social Impact Assessors Certification Examination", // Adjust key if filename differs
  "V-A MFD Workbook v December 2024": "NISM Series V-A: Mutual Fund Distributors Certification Examination", // Assuming this is V-A MFD
  "V-B_MFF": "NISM Series V-B: Mutual Fund Foundation Certification Examination",
  "VIII - Equity Derivatives": "NISM Series VIII: Equity Derivatives Certification Examination",
  "VII-SORM": "NISM Series VII: Securities Operations & Risk Management Certification Examination",
  "XA Investment Adviser Level 1": "NISM Series X-A: Investment Adviser (Level 1) Certification Examination",
  "XB Level 2": "NISM Series X-B: Investment Adviser (Level 2) Certification Examination",
  "XII_Securities Markets Foundation": "NISM Series XII: Securities Markets Foundation Certification Examination",
  "XIX-A_AIF (Category I and II)": "NISM Series XIX-A: Alternative Investment Funds (Category I & II) Distributors Certification Examination",
  "XIX-B_AIF": "NISM Series XIX-B: Alternative Investment Funds (Category III) Distributors Certification Examination",
  "XIX-C_AIF Managers_Version-Dec-2024_7...": "NISM Series XIX-C: Alternative Investment Fund Managers Certification Examination", // Adjust key if filename differs
  "XVI - Commodity Derivatives": "NISM Series XVI: Commodity Derivatives Certification Examination",
  "XVII Retirement Adviser": "NISM Series XVII: Retirement Adviser Certification Examination",
  "XV-ResearchAnalyst": "NISM Series XV: Research Analyst Certification Examination",
  "XXIA PMS DISTRIBUTORS": "NISM Series XXI-A: Portfolio Management Services (PMS) Distributors Certification Examination", // Assuming XXIA is XXI-A
  "XXI-B_Portfolio Managers": "NISM Series XXI-B: Portfolio Managers Certification Examination",
  "XXII-Fixed Income Securities": "NISM Series XXII: Fixed Income Securities (Discontinued as of 1 October 2024)"
  // Add any other files if they exist in src/data/questions/
};
// --- End Mapping ---

// Function to get the verified module name using the mapping
const getVerifiedModuleName = (filename: string): string => {
    const key = filename.replace('.json', '');
    return moduleNameMapping[key] || key.replace(/[-_]/g, ' '); // Fallback
};

// Helper to find the correct module filename based on testId
const findModuleFile = (testIdNum: number): string | null => {
    // Corrected logic: Module Index 0 for 101-106, Index 1 for 201-206 etc.
    const moduleIndex = Math.floor((testIdNum - 101) / 100);
    if (moduleIndex < 0) return null; // Handle invalid IDs like < 101

    try {
        const filenames = fs.readdirSync(dataDir).filter(
          file => file.endsWith('.json') && !excludedFiles.includes(file)
        );
        // Ensure consistent sorting if used in dashboard API
        // filenames.sort((a, b) => a.localeCompare(b));
        return filenames[moduleIndex] || null; // Get the file at the calculated index
    } catch (error) {
        console.error("Error reading data directory:", error);
        return null;
    }
};

// Simple shuffle function (Fisher-Yates)
const shuffleArray = <T>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export async function GET(
  req: NextRequest,
  context: { params: { testId: string } }
) {
  // IMPORTANT: Await params to prevent the build warning/error
  const { params } = context; // Params is directly available, no need to await
  const { testId } = params;
  const testIdNum = parseInt(testId, 10);

  if (!testId || isNaN(testIdNum)) {
    return NextResponse.json({ error: 'Valid Test ID is required' }, { status: 400 });
  }

  try {
    const moduleFilename = findModuleFile(testIdNum);
    if (!moduleFilename) {
        console.error(`Module file not found for Test ID: ${testIdNum}`);
        return NextResponse.json({ error: 'Test data configuration error: Module file not found' }, { status: 404 });
    }

    const moduleFilePath = path.join(dataDir, moduleFilename);
    const fileContent = fs.readFileSync(moduleFilePath, 'utf-8');
    // Ensure the JSON contains an array of questions directly
    const allModuleQuestions: Question[] = JSON.parse(fileContent);

    // **Crucial Validation:** Check the format of the FIRST question AFTER parsing
    if (allModuleQuestions.length > 0) {
        const firstQ = allModuleQuestions[0];
        if (typeof firstQ.id !== 'number' || typeof firstQ.question !== 'string' || !Array.isArray(firstQ.options) || typeof firstQ.correct_answer !== 'string' || firstQ.options.length === 0 || typeof firstQ.options[0] !== 'object' || typeof firstQ.options[0].id === 'undefined' || typeof firstQ.options[0].text === 'undefined') {
             console.error(`ERROR: Invalid question format detected in ${moduleFilename}. Example:`, JSON.stringify(firstQ));
             throw new Error(`Invalid question format in ${moduleFilename}. Please ensure questions have a numerical 'id', 'options' is an array of {id: 'a', text: '...'}, and 'correct_answer' is the option id ('a', 'b', 'c', 'd').`);
        }
    } else {
        console.warn(`Warning: Module file ${moduleFilename} is empty or contains no questions.`);
        // Decide if an empty test is an error or not
        // return NextResponse.json({ error: `No questions found in module file ${moduleFilename}` }, { status: 404 });
    }


    const moduleName = getVerifiedModuleName(moduleFilename);
    const testNumber = testIdNum % 100; // 101 -> 1, 106 -> 6, 201 -> 1
    const isFinalTest = testNumber === FINAL_TEST_ID_SUFFIX;
    const testType = isFinalTest ? 'final' : 'practice';

    let selectedQuestions: Question[] = [];
    let testTitle = "";

    if (isFinalTest) {
      testTitle = `${moduleName} - Final Mock`;
      const shuffledAll = shuffleArray([...allModuleQuestions]);
      selectedQuestions = shuffledAll.slice(0, Math.min(QUESTIONS_PER_FINAL, shuffledAll.length));
    } else if (testNumber >= 1 && testNumber <= PRACTICE_TESTS_PER_MODULE) {
      testTitle = `${moduleName} - Practice ${testNumber}`;
      const totalQuestionsInModule = allModuleQuestions.length;

      // Calculate start and end index more robustly for practice tests
      const baseQuestionsPerPractice = Math.floor(totalQuestionsInModule / PRACTICE_TESTS_PER_MODULE);
      const extraQuestions = totalQuestionsInModule % PRACTICE_TESTS_PER_MODULE;

      let startIndex = 0;
      for (let i = 1; i < testNumber; i++) {
        startIndex += baseQuestionsPerPractice + (i <= extraQuestions ? 1 : 0);
      }
      const questionsInThisTest = baseQuestionsPerPractice + (testNumber <= extraQuestions ? 1 : 0);
      const endIndex = startIndex + questionsInThisTest;


      const questionSlice = allModuleQuestions.slice(startIndex, endIndex);

      if(questionSlice.length === 0 && totalQuestionsInModule > 0) {
         console.warn(`Calculated empty slice for ${testTitle} (startIndex: ${startIndex}, endIndex: ${endIndex}). Check question distribution.`);
      }

      const shuffledSlice = shuffleArray([...questionSlice]);
      // Take the target number of questions (e.g., 25) from the shuffled slice
      selectedQuestions = shuffledSlice.slice(0, Math.min(QUESTIONS_PER_PRACTICE, shuffledSlice.length));

    } else {
        console.error(`Invalid test number ${testNumber} derived from ID ${testIdNum}`);
        return NextResponse.json({ error: 'Invalid Test number derived from ID' }, { status: 400 });
    }

     // Add logging and warnings
     const targetCount = isFinalTest ? QUESTIONS_PER_FINAL : QUESTIONS_PER_PRACTICE;
     console.log(`--- Debugging Test ID: ${testIdNum} ---`);
     console.log(`Module Filename: ${moduleFilename}`);
     console.log(`Is Final Test: ${isFinalTest}`);
     console.log(`Test Number (1-6): ${testNumber}`);
     console.log(`Total questions found in module file: ${allModuleQuestions.length}`);
     if (!isFinalTest && testNumber >= 1 && testNumber <= PRACTICE_TESTS_PER_MODULE) {
          const baseQuestionsPerPractice = Math.floor(allModuleQuestions.length / PRACTICE_TESTS_PER_MODULE);
          const extraQuestions = allModuleQuestions.length % PRACTICE_TESTS_PER_MODULE;
          let startIndex = 0;
          for (let i = 1; i < testNumber; i++) { startIndex += baseQuestionsPerPractice + (i <= extraQuestions ? 1 : 0); }
          const questionsInThisTest = baseQuestionsPerPractice + (testNumber <= extraQuestions ? 1 : 0);
          const endIndex = startIndex + questionsInThisTest;
         console.log(`Calculated Slice Indices: startIndex=${startIndex}, endIndex=${endIndex}`);
     }
     console.log(`Target questions for test type: ${targetCount}`);
     console.log(`Number of questions selected: ${selectedQuestions.length}`);

     if (selectedQuestions.length < targetCount && allModuleQuestions.length >= targetCount) {
         console.warn(`WARNING: Selected fewer questions (${selectedQuestions.length}) than target (${targetCount}).`);
     } else if (selectedQuestions.length === 0 && allModuleQuestions.length > 0) {
         console.error(`ERROR: No questions were selected for test ${testIdNum}.`);
         // Return error because an empty test is likely not intended
         return NextResponse.json({ error: `No questions could be selected for test ${testIdNum}. Check JSON file and slicing logic.` }, { status: 500 });
     } else if (selectedQuestions.length > 0) {
         console.log("First selected question sample:", JSON.stringify(selectedQuestions[0]));
     }
      console.log(`--- End Debugging Test ID: ${testIdNum} ---`);


    const testDetails: TestDetails = {
      id: testIdNum,
      title: testTitle,
      test_type: testType,
      duration: isFinalTest ? 1800 : undefined,
      questions: selectedQuestions,
      module: moduleName
    };

    return NextResponse.json(testDetails);

  } catch (error) {
    console.error(`Failed to GET quiz data for Test ID ${testId}:`, error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json({ error: 'Module data file not found.' }, { status: 404 });
    }
     if (error instanceof SyntaxError) {
         return NextResponse.json({ error: `Invalid JSON format in module file for Test ID ${testId}.` }, { status: 500 });
     }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}