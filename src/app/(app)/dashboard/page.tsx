"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

// Define types for API data (replace with actual types from backend)
interface Test {
  id: number;
  title: string;
  test_type: 'practice' | 'final';
  duration?: number; // in seconds for final tests
}

interface Section {
  id: number;
  title: string;
  tests: Test[];
}

export default function DashboardPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectionsAndTests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to get_sections.php and get_tests.php
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // --- MOCK API RESPONSE ---
        const mockSections: Omit<Section, 'tests'>[] = [
          { id: 1, title: "Mutual Funds Basics" },
          { id: 2, title: "Derivatives Explained" },
          { id: 3, title: "Equity Markets Overview" },
        ];

        const mockTests: Record<number, Test[]> = {
          1: [
            { id: 101, title: "Practice Test 1", test_type: 'practice' },
            { id: 102, title: "Practice Test 2", test_type: 'practice' },
            { id: 103, title: "Practice Test 3", test_type: 'practice' },
            { id: 104, title: "Practice Test 4", test_type: 'practice' },
            { id: 105, title: "Practice Test 5", test_type: 'practice' },
            { id: 106, title: "Final Mock Test", test_type: 'final', duration: 1800 }, // 30 mins
          ],
          2: [
             { id: 201, title: "Options Practice 1", test_type: 'practice' },
             { id: 202, title: "Futures Practice 1", test_type: 'practice' },
             { id: 203, title: "Options Practice 2", test_type: 'practice' },
             { id: 204, title: "Futures Practice 2", test_type: 'practice' },
             { id: 205, title: "Derivatives Combo", test_type: 'practice' },
             { id: 206, title: "Final Mock Derivatives", test_type: 'final', duration: 2400 }, // 40 mins
           ],
          3: [
             { id: 301, title: "Market Concepts PT 1", test_type: 'practice' },
             { id: 302, title: "Trading Strategies PT 1", test_type: 'practice' },
             { id: 303, title: "Market Concepts PT 2", test_type: 'practice' },
             { id: 304, title: "Trading Strategies PT 2", test_type: 'practice' },
             { id: 305, title: "Equity Valuation Basics", test_type: 'practice' },
             { id: 306, title: "Final Mock Equity", test_type: 'final', duration: 1800 }, // 30 mins
           ]
        };

        const fetchedSections: Section[] = mockSections.map(section => ({
          ...section,
          tests: mockTests[section.id] || []
        }));
        // --- END MOCK API RESPONSE ---

        setSections(fetchedSections);
      } catch (err) {
        console.error("Failed to fetch sections:", err);
        setError("Could not load quiz sections. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectionsAndTests();
  }, []);

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <Card key={`skeleton-${index}`}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, testIndex) => (
             <Skeleton key={`test-skel-${index}-${testIndex}`} className="h-10 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Quiz Dashboard</h1>

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
              <CardDescription>Practice tests and a final mock test for this section.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              {section.tests.map((test) => (
                <Link href={`/quiz/${test.id}`} key={test.id} legacyBehavior>
                  <a className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between border-primary hover:bg-primary/10 group"
                    >
                      <div className="flex items-center gap-2">
                         <Badge variant={test.test_type === 'final' ? 'destructive' : 'secondary'} className="shrink-0">
                           {test.test_type === 'final' ? 'Final' : 'Practice'}
                         </Badge>
                         <span className="text-left">{test.title}</span>
                      </div>
                       <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                  </a>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
