export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Make password optional as we don't want to send it to the client
  mobile?: string; // <-- Add optional mobile field
}

export interface UserTestResult {
  id: number;
  userId: number;
  testId: number;
  testName: string;
  sectionTitle: string;
  testType: 'practice' | 'final';
  score: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
}