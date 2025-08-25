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
import { LogOut, Check, X, BarChart } from "lucide-react";
import { format } from 'date-fns';
import { User as UserType } from '@/lib/types';
import type { UserTestResult } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserType | null>(null);
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
        const response = await fetch('/api/session');
        if (response.ok) {
          const userData = await response.json();
          setUserProfile(userData);
        } else {
          throw new Error('Failed to fetch user session');
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Could not load user profile.");
        router.push('/login'); // Redirect if not authenticated
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // Fetch Test Results Data
    const fetchResults = async () => {
      setIsLoadingResults(true);
      try {
        const response = await fetch('/api/history');
        if (response.ok) {
          const resultsData = await response.json();
          setTestResults(resultsData);
        } else {
           throw new Error('Failed to fetch test history');
        }
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError(prev => prev ? `${prev} Also failed to load test results.` : `Could not load test results.`);
      } finally {
        setIsLoadingResults(false);
      }
    };

    fetchProfile();
    fetchResults();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      window.location.href = '/login';
    } catch (error) {
       toast({
        variant: 'destructive',
        title: "Logout Failed",
        description: "Could not log out. Please try again.",
      });
    }
  };

   const getUserInitials = (name: string | undefined): string => {
     if (!name) return "..";
     return name
       .split(' ')
       .map(n => n[0])
       .slice(0, 2)
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
             {isLoadingProfile ? (
                <Skeleton className="h-16 w-16 rounded-full" />
             ) : (
               <Avatar className="h-16 w-16 text-xl">
                  <AvatarImage src="/placeholder-user.jpg" alt={userProfile?.name} />
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
                   {isLoadingResults ? (
                     <Skeleton className="h-5 w-8 inline-block"/>
                   ) : (
                     <p className="font-semibold">{completedPracticeTests}</p>
                   )}
                   <p className="text-sm text-muted-foreground">Practice Tests Completed</p>
               </div>
           </div>
           <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
               <X className="h-6 w-6 text-red-600 shrink-0"/>
               <div>
                  {isLoadingResults ? (
                    <Skeleton className="h-5 w-8 inline-block"/>
                  ) : (
                    <p className="font-semibold">{completedFinalTests}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Final Tests Completed</p>
               </div>
           </div>
           <div className="flex items-center gap-3 p-3 bg-secondary rounded-md">
               <BarChart className="h-6 w-6 text-blue-600 shrink-0"/>
                <div>
                    {isLoadingResults ? (
                       <Skeleton className="h-5 w-8 inline-block"/>
                     ) : (
                       <p className="font-semibold">--</p>
                    )}
                   <p className="text-sm text-muted-foreground">Average Score</p>
               </div>
           </div>
        </CardContent>
      </Card>

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