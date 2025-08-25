import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs';
import { readHistory, writeHistory } from '@/lib/db';
import { User, UserTestResult } from '@/lib/types';

// Define structures for quiz data
interface Question {
  id: number | string;
  correct_answer: string | number;
}

interface TestDetails {
  id: number;
  title: string;
  test_type: 'practice' | 'final';
  questions: Question[];
}

type QuizDatabase = Record<string, TestDetails>;

interface Answer {
  questionId: number;
  selectedOption: string | number | null;
}

// Path to your quiz data
const quizFilePath = path.resolve(process.cwd(), 'src/data/quiz-questions.json');

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('user-session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user: User = JSON.parse(sessionCookie.value);
    const { testId, answers, shuffledQuestions } = await req.json();

    if (!testId || !answers || !shuffledQuestions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Read the entire quiz database to find the correct answers
    const fileContent = fs.readFileSync(quizFilePath, 'utf-8');
    const quizData: QuizDatabase = JSON.parse(fileContent);
    const testDetails = quizData[testId];

    if (!testDetails) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    // Create a map of correct answers for easy lookup
    const correctAnswersMap = new Map<number | string, string | number>();
    testDetails.questions.forEach(q => {
        correctAnswersMap.set(q.id, q.correct_answer);
    });

    // Calculate score
    let correctCount = 0;
    const submittedAnswers: Record<number, Answer> = answers;

    shuffledQuestions.forEach((q: Question) => {
      const userAnswer = submittedAnswers[Number(q.id)];
      const correctAnswer = correctAnswersMap.get(q.id);
      
      if (userAnswer && userAnswer.selectedOption !== null && String(userAnswer.selectedOption) === String(correctAnswer)) {
        correctCount++;
      }
    });

    const totalQuestions = shuffledQuestions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const incorrectCount = totalQuestions - correctCount;

    // Save the result to history
    const history = readHistory();
    const newHistoryEntry: UserTestResult = {
      id: history.length + 1,
      userId: user.id,
      testId: Number(testId),
      testName: testDetails.title,
      sectionTitle: "TBD", // You can enhance this later
      testType: testDetails.test_type,
      score,
      correctCount,
      totalQuestions,
      submittedAt: new Date().toISOString(),
    };
    history.push(newHistoryEntry);
    writeHistory(history);

    // Return the result
    return NextResponse.json({
      score,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      totalQuestions,
    });

  } catch (error) {
    console.error('Failed to submit quiz:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}