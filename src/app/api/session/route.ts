import { NextRequest, NextResponse } from 'next/server';
// No longer need to import 'cookies' from 'next/headers'
import { User } from '@/lib/types';

export async function GET(req: NextRequest) {
  // Get cookies directly from the request object
  const sessionCookie = req.cookies.get('user-session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = JSON.parse(sessionCookie.value) as User;
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session cookie' }, { status: 401 });
  }
}