import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs';
import { readHistory } from '@/lib/db';
import { User } from '@/lib/types';

// Define the structure of the entire quiz database
type QuizDatabase = Record<string, { id: number; title: string; test_type: 'practice' | 'final'; duration?: number }>;

// Path to your quiz data
const quizFilePath = path.resolve(process.cwd(), 'src/data/quiz-questions.json');

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('user-session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user: User = JSON.parse(sessionCookie.value);
    
    // Read all available tests
    const fileContent = fs.readFileSync(quizFilePath, 'utf-8');
    const quizData: QuizDatabase = JSON.parse(fileContent);

    // Manually define sections and associate tests from the quizData
    const sections = [
      { id: 1, title: "Mutual Funds Basics", subtopics: ["Mutual Funds"], tests: [quizData['101'], quizData['102'], quizData['103'], quizData['104'], quizData['105'], quizData['106']] },
      { id: 2, title: "Derivatives Explained", subtopics: ["Options", "Futures", "Derivatives"], tests: [quizData['201'], quizData['202'], quizData['203'], quizData['204'], quizData['205'], quizData['206']] },
      { id: 3, title: "Equity Markets Overview", subtopics: ["Market Concepts", "Trading Strategies", "Equity Valuation Basics"], tests: [quizData['301'], quizData['302'], quizData['303'], quizData['304'], quizData['305'], quizData['306']] },
    ].filter(section => section.tests.every(test => test)); // Filter out sections with missing tests

    // Read user's test history
    const allHistory = readHistory();
    const userHistory = allHistory.filter(record => record.userId === user.id);

    return NextResponse.json({ sections, userHistory });

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}