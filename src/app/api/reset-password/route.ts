import { NextRequest, NextResponse } from 'next/server';
import { readUsers, writeUsers } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and new password are required' }, { status: 400 });
  }

  try {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    users[userIndex].password = hashedPassword;

    // Save the updated users array back to the file
    writeUsers(users);

    return NextResponse.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}