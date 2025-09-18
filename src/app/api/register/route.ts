import { NextRequest, NextResponse } from 'next/server';
import { readUsers, writeUsers } from '@/lib/db';
import { User } from '@/lib/types';
import bcrypt from 'bcrypt';
import { sendEmail } from '@/lib/email'; // Import the new email function

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  const users = readUsers();
  const userExists = users.some(user => user.email === email);

  if (userExists) {
    return NextResponse.json({ message: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email,
    password: hashedPassword,
  };

  users.push(newUser);
  writeUsers(users);

  // Send a welcome email (don't wait for it to complete)
  sendEmail({
    to: newUser.email,
    subject: 'Welcome to QuizMaster Pro!',
    html: `
      <h1>Welcome, ${newUser.name}!</h1>
      <p>Thank you for signing up for QuizMaster Pro. You can now log in and start practicing for your exams.</p>
      <p>Best of luck!</p>
      <p>The QuizMaster Pro Team</p>
    `
  });

  const { password: _, ...userWithoutPassword } = newUser;

  return NextResponse.json(userWithoutPassword, { status: 201 });
}