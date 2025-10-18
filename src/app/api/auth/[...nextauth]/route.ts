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
          // User exists but might be Google-only signup without password set
          console.warn(`Credentials login attempt for user without password: ${credentials.email}`);
          return null; // Don't allow password login if password isn't set
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        const { password, ...userWithoutPassword } = user;
        // Ensure the returned object matches the structure expected by JWT/Session callbacks
        // It needs at least id, name, email. We also add mobile.
        return {
             id: user.id.toString(), // Needs to be string for NextAuth User type
             name: user.name,
             email: user.email,
             mobile: user.mobile, // Include mobile here
             // image is optional, can be null
        };
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      const users = readUsers();
      let dbUser = users.find(u => u.email === user.email);

      if (account?.provider === 'google') {
        if (!dbUser) {
          // New Google sign-in
          const newUser: User = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name: user.name!,
            email: user.email!,
            // Mobile is not provided by Google, maybe prompt later?
            // mobile: undefined // Explicitly undefined or leave out
          };
          users.push(newUser);
          writeUsers(users);
          dbUser = newUser;

          // Send welcome email... (code remains the same)
          sendEmail({
            to: newUser.email,
            subject: 'Welcome to QuizMaster Pro!',
            html: `<h1>Welcome, ${newUser.name}!</h1>...`
          });
        }
        // Attach your internal DB user ID and potentially mobile to the user object for the session/jwt step
        user.id = dbUser.id.toString();
        // Add mobile if it exists in db (e.g., if they added it later)
        (user as any).mobile = dbUser.mobile;
      } else if (account?.provider === 'credentials') {
          // For credentials, user object comes from `authorize`. We need dbUser for JWT.
           if (!dbUser) return false; // Should not happen if authorize succeeded
           // Ensure the user object passed to JWT has the mobile number from authorize/db
           (user as any).mobile = dbUser.mobile;
      }
      return true; // Allow sign in
    },
    async jwt({ token, user, account }) {
      // The 'user' object here is available on initial sign in
      if (account && user) {
        token.id = Number(user.id); // Internal DB ID
        // Add mobile to the token
        token.mobile = (user as any).mobile;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Add properties from the token to the session object
        (session.user as any).id = token.id;
        (session.user as any).mobile = token.mobile; // <-- Add mobile to session
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };