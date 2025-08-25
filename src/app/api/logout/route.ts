import { NextResponse } from 'next/server';
// No longer need to import 'cookies' from 'next/headers'

export async function POST() {
  // Create a response object
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Delete the cookie on the response object
  response.cookies.delete('user-session');

  return response;
}