"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Check, X, BarChart, Edit, Phone } from "lucide-react"; // <-- Import Edit and Phone icons
import { format } from 'date-fns';
import { UserTestResult } from "@/lib/types";
import { useRouter } from "next/navigation";

// Extend the session user type locally if needed, or cast when using
interface UserWithMobile extends Record<string, any> {
    id?: number;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    mobile?: string | null; // Add mobile here
}


export default function ProfilePage() {
  const { data: session, status, update } = useSession(); // Added 'update' to potentially refresh session later
  const router = useRouter();
  const { toast } = useToast();
  // Cast the user to include the mobile number potentially
  const user = session?.user as UserWithMobile | undefined;

  const [testResults, setTestResults] = useState<UserTestResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);

  // State for editing (basic setup, not fully functional yet)
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name ?? '');
  const [editedMobile, setEditedMobile] = useState(user?.mobile ?? '');


  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push('/login');
    }

    // Fetch Test Results only when the session is loaded
    if (status === "authenticated") {
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
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load your test history.'
          });
        } finally {
          setIsLoadingResults(false);
        }
      };
      fetchResults();
       // Update edit form state when session loads/changes
       setEditedName(user?.name ?? '');
       setEditedMobile(user?.mobile ?? '');
    }
  }, [status, router, toast, user?.name, user?.mobile]); // Add user name/mobile deps

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const getUserInitials = (name: string | undefined | null): string => {
    if (!name) return "..";
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // --- Basic Edit Handling (Needs API) ---
  const handleEditToggle = () => {
      if (isEditing) {
          // If cancelling edit, reset fields to original values
          setEditedName(user?.name ?? '');
          setEditedMobile(user?.mobile ?? '');
      }
      setIsEditing(!isEditing);
  }

  const handleSaveProfile = async () => {
      // **PLACEHOLDER:** Implement API call here
      console.log("Saving:", { name: editedName, mobile: editedMobile });
      toast({
          title: "Save Action (Placeholder)",
          description: "API call to save profile needs to be implemented.",
      });
      // Example on successful save:
      // await update({ name: editedName, mobile: editedMobile }); // Update session
      // setIsEditing(false);
      // toast({ title: "Profile Updated"});
  }
  // --- End Edit Handling ---

  const completedPracticeTests = testResults.filter(r => r.testType === 'practice').length;
  const completedFinalTests = testResults.filter(r => r.testType === 'final').length;

  // Loading state... (remains the same)
   if (status === "loading") {
    return (
        <div className="container py-8">
            {/* Skeletons... */}
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-28" />
            </div>
            <Card className="mb-8">
                <CardHeader>
                    <Skeleton className="h-16 w-full" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
             {/* Skeleton for Test History */}
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                     <div className="space-y-2">
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-10 w-full" />
                     </div>
                </CardContent>
             </Card>
        </div>
    );
  }


  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Profile</h1>
         {/* Edit/Save/Cancel Buttons */}
         <div className="flex gap-2">
            {isEditing ? (
                <>
                    <Button variant="outline" onClick={handleEditToggle}>Cancel</Button>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                </>
            ) : (
                <Button variant="outline" onClick={handleEditToggle}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 text-xl shrink-0">
              {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
              <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-grow">
               {isEditing ? (
                    <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-2xl font-semibold p-1 border rounded w-full"
                        placeholder="Name"
                    />
               ) : (
                    <p className="text-2xl font-semibold">{user?.name ?? 'User Name'}</p>
               )}

              <p className="text-sm text-muted-foreground">{user?.email ?? 'user@email.com'}</p>

              {/* Display or Edit Mobile */}
              <div className="flex items-center text-sm text-muted-foreground pt-1">
                 <Phone className="h-4 w-4 mr-2"/>
                 {isEditing ? (
                    <input
                        type="tel"
                        value={editedMobile}
                        onChange={(e) => setEditedMobile(e.target.value)}
                        className="p-1 border rounded w-full sm:w-auto"
                        placeholder="Mobile Number"
                        maxLength={10}
                    />
                 ) : (
                    <span>{user?.mobile ?? 'No mobile number'}</span>
                 )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        {/* Statistics Section (remains the same) */}
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
                   <p className="font-semibold">--</p> {/* Placeholder for Average Score */}
                   <p className="text-sm text-muted-foreground">Average Score</p>
               </div>
           </div>
        </CardContent>
      </Card>

       {/* Test History Card (remains the same) */}
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
                    <TableCell>
                      <Badge variant={result.testType === 'final' ? 'destructive' : 'secondary'}>
                        {result.testType === 'final' ? 'Final' : 'Practice'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <span className={`font-semibold ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {result.score}%
                        </span>
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