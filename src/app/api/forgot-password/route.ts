import { NextRequest, NextResponse } from 'next/server';
import { readUsers } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const users = readUsers();
  const userExists = users.some(user => user.email === email);

  if (!userExists) {
    console.log(`Password reset attempt for non-existent email: ${email}`);
    return NextResponse.json({ message: 'If a user with that email exists, a reset link has been sent.' });
  }

  // --- THIS IS THE UPDATED PART ---
  // Use the environment variable for the base URL. Fallback to localhost for safety.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
  const resetLink = `${baseUrl}/reset-password?email=${encodeURIComponent(email)}`;
  // --- END OF UPDATE ---

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `PassExam <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Password Reset Link for PassExam',
      html: `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because a password reset request was made for your account.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank" style="padding: 10px 20px; background-color: #419D45; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    });

    return NextResponse.json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ message: 'Failed to send password reset email.' }, { status: 500 });
  }
}