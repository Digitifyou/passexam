"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { LogOut, UserCircle, Check, X, BarChart, Clock } from "lucide-react";
import { format } from 'date-fns';

// Types (replace with actual types from backend)
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

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

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [testResults, setTestResults] = useState<UserTestResult[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch User Profile Data
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to get_user.php (uses session)
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate fetch
        // --- MOCK PROFILE RESPONSE ---
        const mockProfile: UserProfile = {
          id: 1,
          name: "John Doe",
          email: "user@example.com",
        };
        // --- END MOCK PROFILE RESPONSE ---
        setUserProfile(mockProfile);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Could not load user profile.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // Fetch Test Results Data
    const fetchResults = async () => {
      setIsLoadingResults(true);
      // setError(null); // Don't reset error if profile failed
      try {
        // TODO: Replace with actual API call to get_user_results.php (uses session)
         await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate fetch
        // --- MOCK RESULTS RESPONSE ---
        const mockResults: UserTestResult[] = [
          { id: 1, testId: 106, testName: "Final Mock Test", sectionTitle: "Mutual Funds Basics", testType: 'final', score: 67, correctCount: 2, totalQuestions: 3, submittedAt: "2024-07-28T10:30:00Z" },
          { id: 2, testId: 101, testName: "Practice Test 1", sectionTitle: "Mutual Funds Basics", testType: 'practice', score: 50, correctCount: 1, totalQuestions: 2, submittedAt: "2024-07-27T15:00:00Z" },
          { id: 3, testId: 201, testName: "Options Practice 1", sectionTitle: "Derivatives Explained", testType: 'practice', score: 100, correctCount: 1, totalQuestions: 1, submittedAt: "2024-07-26T09:15:00Z" },
        ];
        // --- END MOCK RESULTS RESPONSE ---
        setTestResults(mockResults);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError(prev => prev ? prev + " Also failed to load test results." : "Could not load test results.");
      } finally {
        setIsLoadingResults(false);
      }
    };

    fetchProfile();
    fetchResults();
  }, []);

  const handleLogout = async () => {
    // TODO: Replace with actual API call to logout.php
    console.log("Logging out...");
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

   const getUserInitials = (name: string | undefined): string => {
     if (!name) return "..";
     return name
       .split(' ')
       .map(n => n[0])
       .slice(0, 2) // Max 2 initials
       .join('')
       .toUpperCase();
   }

  const completedPracticeTests = testResults.filter(r => r.testType === 'practice').length;
  const completedFinalTests = testResults.filter(r => r.testType === 'final').length;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
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

      {/* Profile Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
             {isLoadingProfile ? (
                <Skeleton className="h-16 w-16 rounded-full" />
             ) : (
               <Avatar className="h-16 w-16 text-xl">
                  <AvatarImage src="/placeholder-user.jpg" alt={userProfile?.name} data-ai-hint="user avatar large"/>
                  <AvatarFallback>{getUserInitials(userProfile?.name)}</AvatarFallback>
               </Avatar>
             )}
            <div className="space-y-1">
               {isLoadingProfile ? (
                  <>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </>
               ) : (
                  <>
                     <p className="text-2xl font-semibold">{userProfile?.name ?? 'User Name'}</p>
                     <p className="text-sm text-muted-foreground">{userProfile?.email ?? 'user@email.com'}</p>
                  </>
               )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
           <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
               <Check className="h-6 w-6 text-green-600 shrink-0"/>
               <div>
                   <p className="font-semibold">{isLoadingResults ? <Skeleton className="h-5 w-8 inline-block"/> : completedPracticeTests}</p>
                   <p className="text-sm text-muted-foreground">Practice Tests Completed</p>
               </div>
           </div>
           <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
               <X className="h-6 w-6 text-red-600 shrink-0"/>
               <div>
                   <p className="font-semibold">{isLoadingResults ? <Skeleton className="h-5 w-8 inline-block"/> : completedFinalTests}</p>
                   <p className="text-sm text-muted-foreground">Final Tests Completed</p>
               </div>
           </div>
           <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
               <BarChart className="h-6 w-6 text-blue-600 shrink-0"/>
                <div>
                   {/* Placeholder for potential future stats */}
                   <p className="font-semibold">--</p>
                   <p className="text-sm text-muted-foreground">Average Score</p>
               </div>
           </div>
        </CardContent>
      </Card>

      {/* Test History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
          <CardDescription>Your previously completed tests and scores.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingResults ? (
             <div className="space-y-2">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
             </div>
          ) : testResults.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">You haven't completed any tests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Section</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Date</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.testName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{result.sectionTitle}</TableCell>
                    <TableCell>
                      <Badge variant={result.testType === 'final' ? 'destructive' : 'secondary'}>
                        {result.testType === 'final' ? 'Final' : 'Practice'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <span className={`font-semibold ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {result.score}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">({result.correctCount}/{result.totalQuestions})</span>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                         {format(new Date(result.submittedAt), 'PP p')}
                    </TableCell>
                    <TableCell className="text-right">
                       {/* Optional: Retake Button */}
                       {/* <Button variant="ghost" size="sm" disabled>Retake</Button> */}
                       {/* Optional: View Results Button - Needs linking to review page with results */}
                       <Button variant="ghost" size="sm" onClick={() => router.push(`/review/${result.testId}?score=${result.score}&correct=${result.correctCount}&incorrect=${result.totalQuestions - result.correctCount}&total=${result.totalQuestions}`)}>
                          View
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
