// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readHistory, readUsers } from '@/lib/db';
import { User, UserTestResult } from '@/lib/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

interface TestSummary {
  id: number;
  title: string;
  test_type: 'practice' | 'final';
  duration?: number;
  module: string; // Module name derived from filename/mapping
}

interface Section {
  id: string; // Module identifier (e.g., 'currency-derivatives')
  title: string; // Verified Module name (e.g., 'Currency Derivatives')
  tests: TestSummary[];
}

// --- Configuration ---
const dataDir = path.resolve(process.cwd(), 'src/data/questions'); // Updated path
const excludedFiles = ['placeholder.json']; // Files to ignore within the questions folder
const PRACTICE_TESTS_PER_MODULE = 5;
const FINAL_TEST_ID_SUFFIX = 6; // e.g., 106, 206 will be final tests
// --- End Configuration ---

// --- Module Name Mapping ---
// Ensure this mapping covers ALL your JSON files in src/data/questions/
const moduleNameMapping: Record<string, string> = // src/data/module_mapping.json
{
  "I - Currency Derivatives": "NISM Series I: Currency Derivatives Certification Examination",
  "II-A": "NISM Series II-A: Registrars to an Issue & Share Transfer Agents – Corporate Certification Examination",
  "II-B_RTA MF_December 2024": "NISM Series II-B: Registrars to an Issue & Share Transfer Agents – Mutual Fund Certification Examination",
  "III-A Securities Intermediaries Compliance Non Fund Final V September 2024a": "NISM Series III-A: Securities Intermediaries Compliance (Non-Fund) Certification Examination",
  "IV - Interest Rate Derivatives": "NISM Series IV: Interest Rate Derivatives Certification Examination",
  "IX-Merchant Banking": "NISM Series IX: Merchant Banking Certification Examination",
  "SEBI - Investor Certification Examination ...": "SEBI Investor Certification Examination – Financial Education Booklet", // Adjust key if filename differs
  "Series VI-Depository Operations-Ver-Dec ...": "NISM Series VI: Depository Operations Certification Examination", // Adjust key if filename differs
  "Social Impact Assessors Certification Exa...": "NISM Series XXIII: Social Impact Assessors Certification Examination", // Adjust key if filename differs
  "V-A MFD Workbook v December 2024": "NISM Series V-A: Mutual Fund Distributors Certification Examination", // Assuming this is V-A MFD
  "V-B_MFF": "NISM Series V-B: Mutual Fund Foundation Certification Examination",
  "VIII - Equity Derivatives": "NISM Series VIII: Equity Derivatives Certification Examination",
  "VII-SORM": "NISM Series VII: Securities Operations & Risk Management Certification Examination",
  "XA Investment Adviser Level 1": "NISM Series X-A: Investment Adviser (Level 1) Certification Examination",
  "XB Level 2": "NISM Series X-B: Investment Adviser (Level 2) Certification Examination",
  "XII_Securities Markets Foundation": "NISM Series XII: Securities Markets Foundation Certification Examination",
  "XIX-A_AIF (Category I and II)": "NISM Series XIX-A: Alternative Investment Funds (Category I & II) Distributors Certification Examination",
  "XIX-B_AIF": "NISM Series XIX-B: Alternative Investment Funds (Category III) Distributors Certification Examination",
  "XIX-C_AIF Managers_Version-Dec-2024_7...": "NISM Series XIX-C: Alternative Investment Fund Managers Certification Examination", // Adjust key if filename differs
  "XVI - Commodity Derivatives": "NISM Series XVI: Commodity Derivatives Certification Examination",
  "XVII Retirement Adviser": "NISM Series XVII: Retirement Adviser Certification Examination",
  "XV-ResearchAnalyst": "NISM Series XV: Research Analyst Certification Examination",
  "XXIA PMS DISTRIBUTORS": "NISM Series XXI-A: Portfolio Management Services (PMS) Distributors Certification Examination", // Assuming XXIA is XXI-A
  "XXI-B_Portfolio Managers": "NISM Series XXI-B: Portfolio Managers Certification Examination",
  "XXII-Fixed Income Securities": "NISM Series XXII: Fixed Income Securities (Discontinued as of 1 October 2024)"
  // Add any other files if they exist in src/data/questions/
};
// --- End Mapping ---

// Function to get the verified module name using the mapping
const getVerifiedModuleName = (filename: string): string => {
    const key = filename.replace('.json', ''); // Use filename without extension as key
    return moduleNameMapping[key] || key.replace(/[-_]/g, ' '); // Return mapped name or cleaned key as fallback
};

// Function to generate test IDs (remains the same)
const getTestId = (moduleIndex: number, testNumber: number): number => {
  // Module Index 0 -> IDs 101-106
  // Module Index 1 -> IDs 201-206 etc.
  return (moduleIndex + 1) * 100 + testNumber;
};


// --- API Route Handler (GET function) ---
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  // Assuming session.user includes 'id' from your DB via callbacks
  const userId = (session?.user as any)?.id ?? null;
  let dbUserId: number | null = userId;

   // Fallback: If ID not in session, find user by email
   if (!dbUserId && userEmail) {
     try {
       const allUsers = readUsers(); // Reads from src/data/users.json
       const user = allUsers.find(u => u.email === userEmail);
       dbUserId = user?.id ?? null;
     } catch (err) { console.error("Error reading users:", err); }
   }

  // If we still don't have a user ID, authentication fails
  if (!dbUserId) {
    console.error("Authentication failed or user ID not found for email:", userEmail);
    return NextResponse.json({ error: 'Not authenticated or user data missing' }, { status: 401 });
  }

  try {
    const filenames = fs.readdirSync(dataDir).filter(
      file => file.endsWith('.json') && !excludedFiles.includes(file)
    );

    // Optional: Sort filenames if needed for consistent module order.
    // Ensure this sort order is consistent across all APIs if you use it.
    // filenames.sort((a, b) => a.localeCompare(b)); // Simple alphabetical sort

    const sections: Section[] = filenames.map((filename, moduleIndex) => {
      // Use the new function to get the verified module name
      const moduleName = getVerifiedModuleName(filename);
      const tests: TestSummary[] = [];

      // Create Practice Tests
      for (let i = 1; i <= PRACTICE_TESTS_PER_MODULE; i++) {
        tests.push({
          id: getTestId(moduleIndex, i),
          title: `Practice ${i}`, // Simplified title shown within the card
          test_type: 'practice',
          module: moduleName, // Store the verified module name
        });
      }

      // Create Final Mock Test
      tests.push({
        id: getTestId(moduleIndex, FINAL_TEST_ID_SUFFIX),
        title: `Final Mock Test`, // Simplified title shown within the card
        test_type: 'final',
        duration: 1800, // Default duration, adjust if needed
        module: moduleName, // Store the verified module name
      });

      return {
        // Use module name for ID, make it URL-friendly
        id: moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `module-${moduleIndex}`,
        title: moduleName, // Use the verified module name for the card title
        tests: tests,
      };
    });

    // Read user's test history
    let userHistory: UserTestResult[] = [];
     try {
       const allHistory = readHistory(); // Reads from src/data/user-test-history.json
       userHistory = allHistory.filter(record => record.userId === dbUserId);
     } catch (err) {
         console.error("Error reading history:", err);
         userHistory = []; // Return empty history on error
     }

    return NextResponse.json({ sections, userHistory });

  } catch (error) {
     console.error('Failed to fetch dashboard data:', error);
     // Check if the error is due to the directory not existing
     if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
         return NextResponse.json({ error: `Questions directory not found at ${dataDir}` }, { status: 404 });
     }
     return NextResponse.json({ error: 'Internal Server Error reading module files' }, { status: 500 });
  }
}