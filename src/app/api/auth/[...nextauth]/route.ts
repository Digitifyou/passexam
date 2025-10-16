// In src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { readUsers, writeUsers } from '@/lib/db';
import bcrypt from 'bcrypt';
import { User } from '@/lib/types';
import { sendEmail } from '@/lib/email';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const users = readUsers();
        const user = users.find(u => u.email === credentials.email);

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const users = readUsers();
        let dbUser = users.find(u => u.email === user.email);

        if (!dbUser) {
          const newUser: User = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name: user.name!,
            email: user.email!,
          };
          users.push(newUser);
          writeUsers(users);
          dbUser = newUser;

          // Send a welcome email to the new Google user
          sendEmail({
            to: newUser.email,
            subject: 'Welcome to QuizMaster Pro!',
            html: `
              <h1>Welcome, ${newUser.name}!</h1>
              <p>Thank you for signing up for QuizMaster Pro with your Google account.</p>
              <p>You can now start taking quizzes to level up your knowledge.</p>
              <p>Best of luck!</p>
              <p>The QuizMaster Pro Team</p>
            `
          });
        }
        // Attach your internal DB user ID to the user object for the session
        user.id = dbUser.id.toString();
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // The user object passed here has the ID from your database
        token.id = Number(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Add the internal ID to the session object
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  // ADD THIS PAGES CONFIGURATION
  pages: {
    signIn: '/login',
    // On sign-in error, you can redirect to a specific page
    // error: '/auth/error', 
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };