"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardDescription, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge"; // <-- Badge import removed/commented out
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import './dashboard.css';
import { UserTestResult } from "@/lib/types";


// Define types for the data fetched from the API
interface Test {
  id: number;
  title: string;
  test_type: 'practice' | 'final';
  duration?: number;
}

interface Section {
  id: number;
  title: string;
  subtopics: string[]; // Keep subtopics data if needed elsewhere, just don't display
  tests: Test[];
}

export default function DashboardPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [testResults, setTestResults] = useState<UserTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setSections(data.sections);
        setTestResults(data.userHistory);
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
  const completedTestIds = new Set(testResults.map(r => r.testId));
  const totalCompleted = completedTestIds.size;
  const activeTests = totalTests - totalCompleted;

  const totalScore = testResults.reduce((acc, curr) => acc + curr.score, 0);
  const percentageRate = totalCompleted > 0 ? Math.round(totalScore / totalCompleted) : 0;

  const renderSkeletons = () => (
    <>
      {/* Skeleton for Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Skeletons for Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`skeleton-${index}`}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              {/* Removed Skeleton for Badges */}
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, testIndex) => (
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
      {isLoading ? (
        renderSkeletons()
      ) : (
        <>
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
                <i className="fa-solid fa-calendar-check"></i>
                <p>Total Completed</p>
                <p className="text-xl font-bold">{totalCompleted}</p>
              </div>
              <div className="flex items-center gap-2 p-1 progress-item">
                <i className="fa-solid fa-percent"></i>
                <p>Percentage Rate</p>
                <p className="text-xl font-bold">{percentageRate}%</p>
              </div>
            </div>
          </div>

          {error && (
            <Card className="bg-destructive/10 border-destructive mb-6">
              <CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader>
              <CardContent><p>{error}</p></CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Card key={section.id} className="flex flex-col">
                <CardHeader>
                  <h3><b>{section.title}</b></h3>
                  {/* --- Removed Badge Display ---
                  {section.subtopics && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {section.subtopics.map((topic, index) => (
                        <Badge key={index} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                  )}
                  */}
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  {section.tests.filter(t => t.test_type === 'practice').map((test) => {
                    const isCompleted = completedTestIds.has(test.id);
                    return (
                      <Link href={`/quiz/${test.id}`} key={test.id} passHref legacyBehavior>
                        <Button
                          asChild // Use asChild to make the whole Button clickable link
                          variant="outline"
                          className={cn(
                            "w-full justify-between group h-auto py-2", // Adjust height and padding
                            isCompleted ? "border-green-500 bg-green-50/50 hover:bg-green-100/60" : "border-primary hover:bg-primary/10"
                          )}
                        >
                          {/* Wrap content in a div for layout control */}
                          <div className='flex items-center justify-between w-full'>
                            <span className={cn("text-left whitespace-normal", // Allow wrapping
                                isCompleted ? "completed-test-text" : "text-primary-foreground not-completed-test-text")}>
                                    {test.title}
                            </span>
                            {isCompleted && <CheckCircle className="h-4 w-4 text-green-600 shrink-0 ml-2" />}
                          </div>
                        </Button>
                      </Link>
                    );
                  })}
                </CardContent>
                <CardFooter>
                  {section.tests.filter(t => t.test_type === 'final').map(finalTest => {
                    const isCompleted = completedTestIds.has(finalTest.id);
                    return (
                      <Link href={`/quiz/${finalTest.id}`} key={finalTest.id} passHref legacyBehavior>
                        <Button
                          asChild // Use asChild here too
                          variant={isCompleted ? "outline" : "destructive"}
                           className={cn(
                            "w-full justify-center group h-auto py-2", // Adjust height and padding
                            isCompleted ? "border-green-500 bg-green-50/50 hover:bg-green-100/60" : "bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                          )}
                        >
                          <div className='flex items-center justify-center gap-2'>
                            <span className={cn("text-sm whitespace-normal", isCompleted ? "completed-test-text" : "")}>
                                {finalTest.title} {/* Display the actual final test title */}
                            </span>
                             {isCompleted && <CheckCircle className="h-4 w-4 text-green-600 shrink-0 ml-2" />}
                          </div>
                        </Button>
                      </Link>
                    );
                  })}
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}