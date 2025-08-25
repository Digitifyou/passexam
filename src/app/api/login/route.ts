import { NextRequest, NextResponse } from 'next/server';
import { readUsers } from '@/lib/db';
import bcrypt from 'bcrypt';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  const users = readUsers();
  const user = users.find(user => user.email === email);

  if (!user || !user.password) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const { password: _, ...userWithoutPassword } = user;

  const response = NextResponse.json(userWithoutPassword);

  // Set a session cookie
  response.cookies.set('user-session', JSON.stringify(userWithoutPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  return response;
}