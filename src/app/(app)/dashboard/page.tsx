// src/app/(app)/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, X, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import './dashboard.css';

// Define types for API data
interface Test {
  id: number;
  title: string;
  test_type: 'practice' | 'final';
  duration?: number; // in seconds for final tests
}

interface Section {
  id: number;
  title: string;
  subtopics: string[]; // Added subtopics to match design
  tests: Test[];
}

// Re-use the TestResult type from profile/page.tsx for consistency
interface UserTestResult {
  id: number;
  testId: number;
  testName: string;
  sectionTitle: string;
  testType: 'practice' | 'final';
  score: number; // Percentage
  correctCount: number;
  totalQuestions: number;
  submittedAt: string; // ISO date string
}

export default function DashboardPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [testResults, setTestResults] = useState<UserTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching sections and test results simultaneously
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockSections: Omit<Section, 'tests'>[] = [
          { id: 1, title: "Mutual Funds Basics", subtopics: ["Mutual Funds"] },
          { id: 2, title: "Derivatives Explained", subtopics: ["Options", "Futures", "Derivatives"] },
          { id: 3, title: "Equity Markets Overview", subtopics: ["Market Concepts", "Trading Strategies", "Equity Valuation Basics"] },
        ];

        const mockTests: Record<number, Test[]> = {
          1: [
            { id: 101, title: "Practice Test 1", test_type: 'practice' },
            { id: 102, title: "Practice Test 2", test_type: 'practice' },
            { id: 103, title: "Practice Test 3", test_type: 'practice' },
            { id: 104, title: "Practice Test 4", test_type: 'practice' },
            { id: 105, title: "Practice Test 5", test_type: 'practice' },
            { id: 106, title: "Final Mock Test", test_type: 'final', duration: 1800 },
          ],
          2: [
             { id: 201, title: "Options Practice 1", test_type: 'practice' },
             { id: 202, title: "Futures Practice 1", test_type: 'practice' },
             { id: 203, title: "Options Practice 2", test_type: 'practice' },
             { id: 204, title: "Futures Practice 2", test_type: 'practice' },
             { id: 205, title: "Derivatives Combo", test_type: 'practice' },
             { id: 206, title: "Final Mock Derivatives", test_type: 'final', duration: 2400 },
           ],
          3: [
             { id: 301, title: "Market Concepts PT 1", test_type: 'practice' },
             { id: 302, title: "Trading Strategies PT 1", test_type: 'practice' },
             { id: 303, title: "Market Concepts PT 2", test_type: 'practice' },
             { id: 304, title: "Trading Strategies PT 2", test_type: 'practice' },
             { id: 305, title: "Equity Valuation Basics", test_type: 'practice' },
             { id: 306, title: "Final Mock Equity", test_type: 'final', duration: 1800 },
           ]
        };
        
        const mockResults: UserTestResult[] = [
          { id: 1, testId: 106, testName: "Final Mock Test", sectionTitle: "Mutual Funds Basics", testType: 'final', score: 67, correctCount: 2, totalQuestions: 3, submittedAt: "2024-07-28T10:30:00Z" },
          { id: 2, testId: 101, testName: "Practice Test 1", sectionTitle: "Mutual Funds Basics", testType: 'practice', score: 50, correctCount: 1, totalQuestions: 2, submittedAt: "2024-07-27T15:00:00Z" },
          { id: 3, testId: 201, testName: "Options Practice 1", sectionTitle: "Derivatives Explained", testType: 'practice', score: 100, correctCount: 1, totalQuestions: 1, submittedAt: "2024-07-26T09:15:00Z" },
        ];
        
        const fetchedSections: Section[] = mockSections.map(section => ({
          ...section,
          tests: mockTests[section.id] || []
        }));

        setSections(fetchedSections);
        setTestResults(mockResults);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalTests = sections.flatMap(s => s.tests).length;
  const totalCompleted = testResults.length;
  const activeTests = totalTests - totalCompleted;
  const totalScore = testResults.reduce((acc, curr) => acc + curr.score, 0);
  const percentageRate = totalCompleted > 0 ? Math.round(totalScore / totalCompleted) : 0;


  const renderSkeletons = () => (
    <>
      {/* Skeleton for Summary Bar */}
      <Skeleton className="h-24 w-full rounded-md mb-6" />

      {/* Skeletons for Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`skeleton-${index}`}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, testIndex) => (
                <Skeleton key={`test-skel-${index}-${testIndex}`} className="h-9 w-full rounded-md" />
              ))}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );


  return (
    <div className="container py-8">
      {/* Progress Summary Bar */}
      <div className={cn(
        "bg-primary text-primary-foreground p-4 rounded-lg mb-8 shadow-md",
        "flex flex-col md:flex-row items-center justify-between gap-4"
      )}>
        <div className="flex items-center gap-2 font-bold text-xl md:text-2xl">
          Your Progress
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left text-sm">
          <div className="flex items-center gap-2 p-1 progress-item">
            <i className="fa-solid fa-book"></i>
            <p>Active Tests</p>
            <p className="text-xl font-bold">{activeTests}</p>
          </div>
          <div className="flex items-center gap-2 p-1 progress-item">
            <X className="h-6 w-6 text-red-300" />
              <p>Total Completed</p>
              <p className="text-xl font-bold">{totalCompleted}</p>
          </div>
          <div className="flex items-center gap-2 p-1 progress-item">
            <BarChart className="h-6 w-6 text-blue-300" />
              <p>Percentage Rate</p>
              <p className="text-xl font-bold">{percentageRate}%</p>
          </div>
        </div>
      </div>
      
      {error && (
        <Card className="bg-destructive/10 border-destructive mb-6">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? renderSkeletons() : sections.map((section) => (
          <Card key={section.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.subtopics && section.subtopics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {section.subtopics.map((topic, index) => (
                    <Badge key={index} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              {section.tests.filter(t => t.test_type === 'practice').map((test) => (
                <Link href={`/quiz/${test.id}`} key={test.id} passHref legacyBehavior>
                  <Button asChild variant="outline" className="w-full justify-between border-primary hover:bg-primary/10 group">
                    <div>
                      <span className="text-left">{test.title}</span>
                    </div>
                  </Button>
                </Link>
              ))}
            </CardContent>
            <CardFooter>
              {section.tests.filter(t => t.test_type === 'final').map(finalTest => (
                 <Link href={`/quiz/${finalTest.id}`} key={finalTest.id} passHref legacyBehavior>
                   <Button asChild variant="destructive" className="w-full justify-center bg-destructive/80 hover:bg-destructive text-destructive-foreground">
                      <div>Final Test</div>
                   </Button>
                 </Link>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}