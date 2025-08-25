import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Define the structure of your quiz data
interface TestDetails {
  id: number;
  title: string;
  test_type: 'practice' | 'final';
  duration?: number;
  questions: any[]; 
}

// Define the structure of the entire quiz database
type QuizDatabase = Record<string, TestDetails>;

// Path to your quiz data
const quizFilePath = path.resolve(process.cwd(), 'src/data/quiz-questions.json');

// The signature of the GET function has been updated to fix the error
export async function GET(
  req: NextRequest,
  context: { params: { testId: string } }
) {
  // Destructure params from the context object
  const { params } = context;
  const { testId } = params;

  if (!testId) {
    return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
  }

  try {
    const fileContent = fs.readFileSync(quizFilePath, 'utf-8');
    const quizData: QuizDatabase = JSON.parse(fileContent);

    const testDetails = quizData[testId];

    if (!testDetails) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json(testDetails);
  } catch (error) {
    console.error('Failed to read or parse quiz data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}