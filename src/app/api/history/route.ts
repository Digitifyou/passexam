import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { readHistory, readUsers } from '@/lib/db';
import { User } from '@/lib/types';

// Define authOptions based on your [...nextauth]/route.ts file
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  // Use getServerSession to get the authenticated user
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const allUsers = readUsers();
    // Find the user from your db based on the session email
    const currentUser = session.user?.email
      ? allUsers.find(u => u.email === session.user!.email)
      : undefined;

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const allHistory = readHistory();
    // Filter history for the logged-in user using their ID from your db
    const userHistory = allHistory.filter(record => record.userId === currentUser.id);

    return NextResponse.json(userHistory);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}