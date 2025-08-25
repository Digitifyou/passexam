import { NextRequest, NextResponse } from 'next/server';
import { readUsers, writeUsers } from '@/lib/db';
import { User } from '@/lib/types';
import bcrypt from 'bcrypt';

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
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
  };

  users.push(newUser);
  writeUsers(users);

  const { password: _, ...userWithoutPassword } = newUser;

  return NextResponse.json(userWithoutPassword, { status: 201 });
}