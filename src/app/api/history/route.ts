import { NextRequest, NextResponse } from 'next/server';
import { readHistory } from '@/lib/db';
import { User } from '@/lib/types';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('user-session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = JSON.parse(sessionCookie.value) as User;
    const allHistory = readHistory();
    
    // Filter the history to return only the records for the logged-in user
    const userHistory = allHistory.filter(record => record.userId === user.id);

    return NextResponse.json(userHistory);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session cookie' }, { status: 401 });
  }
}