"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, HelpCircle, ArrowLeft } from 'lucide-react';

// Types (Assume these might come from a get_results.php call or are reconstructed)
interface QuestionOption {
  id: string | number;
  text: string;
}
interface ReviewQuestion extends Question {
  selected_option: string | number | null;
  is_correct: boolean;
}
interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
  correct_answer: string | number;
}


interface TestResultDetails {
  testId: number;
  testTitle: string;
  score: string; // Percentage as string e.g., "80"
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  questions: ReviewQuestion[]; // Includes user's selection and correctness
}

function ReviewPageComponent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string;

  const [resultDetails, setResultDetails] = useState<TestResultDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract summary data from query params (passed from quiz page)
  const score = searchParams.get('score') ?? 'N/A';
  const correct = searchParams.get('correct') ?? 'N/A';
  const incorrect = searchParams.get('incorrect') ?? 'N/A';
  const total = searchParams.get('total') ?? 'N/A';

  useEffect(() => {
    if (!testId) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to get_results.php?id=Y
        // This endpoint should return the test details along with the user's answers and correctness for each question.
        // For now, we'll mock this data. The structure should match TestResultDetails.
        console.log(`Fetching results for test ID: ${testId}`);
        await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay

        // --- MOCK API RESPONSE ---
        // Ideally, this data comes from the backend based on the submitted answers.
        // We need the original questions, options, correct answer, and what the user selected.
         const mockQuestionsData: Record<string, {title: string, questions: ReviewQuestion[]}> = {
            "101": { // Example Practice Test Result
                title: "Practice Test 1 Results",
                questions: [
                    { id: 1011, question: "What does NAV stand for?", options: [{id: 'a', text: 'Net Asset Value'}, {id: 'b', text:'New Account Volume'}, {id: 'c', text:'National Association of Ventures'}], correct_answer: 'a', selected_option: 'a', is_correct: true },
                    { id: 1012, question: "Which fund type aims to replicate a market index?", options: [{id: 'a', text:'Actively Managed Fund'}, {id: 'b', text:'Index Fund'}, {id: 'c', text:'Hedge Fund'}], correct_answer: 'b', selected_option: 'c', is_correct: false },
                ]
            },
             "106": { // Example Final Test Result
                title: "Final Mock Test Results",
                questions: [
                    { id: 1061, question: "What is a primary market?", options: [{id: 'a', text:'Where existing securities are traded'}, {id: 'b', text:'Where new securities are issued'}, {id: 'c', text:'A type of supermarket'}], correct_answer: 'b', selected_option: 'b', is_correct: true },
                    { id: 1062, question: "What is SIP?", options: [{id: 'a', text:'Stock Incentive Plan'}, {id: 'b', text:'Systematic Investment Plan'}, {id: 'c', text:'Securities Issuance Protocol'}], correct_answer: 'b', selected_option: 'b', is_correct: true },
                    { id: 1063, question: "Which document is used in IPO filing?", options: [{id: 'a', text:"Red Herring Prospectus"}, {id: 'b', text:"NAV Statement"}, {id: 'c', text:"Offer Note"}, {id: 'd', text:"KYC Form"}], correct_answer: "a", selected_option: 'c', is_correct: false }
                ]
            },
             // Add more mocks matching test IDs from dashboard/quiz...
         };

        const fetchedData = mockQuestionsData[testId];
        // --- END MOCK API RESPONSE ---

        if (fetchedData && total !== 'N/A') {
          const result: TestResultDetails = {
            testId: parseInt(testId, 10),
            testTitle: fetchedData.title,
            score: score,
            correctAnswers: parseInt(correct, 10),
            incorrectAnswers: parseInt(incorrect, 10),
            totalQuestions: parseInt(total, 10),
            questions: fetchedData.questions,
          };
          setResultDetails(result);
        } else {
           throw new Error("Result data not found or summary data missing.");
        }
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError("Could not load the test results. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [testId, score, correct, incorrect, total]);


   const getOptionText = (question: ReviewQuestion, optionId: string | number | null): string => {
      if(optionId === null) return "Not Answered";
      const option = question.options.find(opt => opt.id === optionId);
      return option?.text ?? "Unknown Option";
   }

  // Loading State
  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-1/2 mb-4" />
         <Skeleton className="h-6 w-1/4 mb-8" />
         <Card className="mb-6">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
               <Skeleton className="h-16 w-full" />
               <Skeleton className="h-16 w-full" />
               <Skeleton className="h-16 w-full" />
            </CardContent>
         </Card>
         <Skeleton className="h-6 w-1/4 mb-4" />
         <div className="space-y-4">
             <Skeleton className="h-40 w-full" />
             <Skeleton className="h-40 w-full" />
             <Skeleton className="h-40 w-full" />
         </div>
      </div>
    );
  }

  // Error State
  if (error) {
     return (
       <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Alert variant="destructive" className="max-w-lg">
             <AlertTitle>Error Loading Results</AlertTitle>
             <AlertDescription>
                {error} <Button variant="link" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
             </AlertDescription>
          </Alert>
       </div>
    );
  }

  // Results Display
  return (
    <div className="container py-8">
       <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-6">
         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
       </Button>

       <h1 className="text-3xl font-bold mb-2">{resultDetails?.testTitle ?? 'Test Review'}</h1>
       <p className="text-muted-foreground mb-6">Review your performance for this test.</p>

       {/* Summary Card */}
       <Card className="mb-8 bg-secondary">
         <CardHeader>
            <CardTitle>Summary</CardTitle>
         </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-md bg-background shadow-sm">
                <p className="text-4xl font-bold text-primary">{resultDetails?.score}%</p>
                <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
             <div className="p-4 rounded-md bg-background shadow-sm">
                <p className="text-4xl font-bold text-green-600">{resultDetails?.correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
             <div className="p-4 rounded-md bg-background shadow-sm">
                <p className="text-4xl font-bold text-red-600">{resultDetails?.incorrectAnswers}</p>
                <p className="text-sm text-muted-foreground">Incorrect Answers</p>
            </div>
         </CardContent>
         <CardFooter className="text-center justify-center text-muted-foreground">
             Total Questions: {resultDetails?.totalQuestions}
         </CardFooter>
       </Card>

       <h2 className="text-2xl font-semibold mb-4">Detailed Review</h2>

        {/* Questions Review */}
       <div className="space-y-6">
         {resultDetails?.questions.map((q, index) => (
           <Card key={q.id} className={q.is_correct ? 'border-green-300' : 'border-red-300'}>
             <CardHeader>
               <CardTitle className="flex justify-between items-start">
                 <span>Question {index + 1}</span>
                  {q.is_correct ? (
                    <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                  ) : q.selected_option === null ? (
                    <HelpCircle className="h-6 w-6 text-yellow-600 shrink-0" /> // Indicate not answered
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                  )}
               </CardTitle>
               <CardDescription className="pt-2 text-base text-foreground">{q.question}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
               {q.options.map(option => {
                 const isSelected = q.selected_option === option.id;
                 const isCorrectAnswer = q.correct_answer === option.id;
                 let highlightClass = "border-transparent"; // Default

                 if (isCorrectAnswer) {
                    highlightClass = "border-green-500 bg-green-100/50 font-medium"; // Highlight correct answer
                 }
                  if (isSelected && !q.is_correct) {
                     highlightClass = "border-red-500 bg-red-100/50"; // Highlight user's wrong selection
                 }
                 if (isSelected && q.is_correct){
                     highlightClass = "border-green-500 bg-green-100/50 font-medium"; // Correct selection matches correct answer
                 }


                 return (
                   <div key={option.id} className={`p-3 border rounded-md ${highlightClass}`}>
                      {option.text}
                      {isSelected && <span className="text-xs font-semibold ml-2 text-muted-foreground"> (Your Answer)</span>}
                      {isCorrectAnswer && !isSelected && q.selected_option !== null && <span className="text-xs font-semibold ml-2 text-green-700"> (Correct Answer)</span>}
                      {q.selected_option === null && isCorrectAnswer && <span className="text-xs font-semibold ml-2 text-green-700"> (Correct Answer)</span>}
                   </div>
                 );
               })}
                {q.selected_option === null && (
                    <p className="text-sm text-yellow-700 font-medium mt-3">You did not answer this question.</p>
                )}
             </CardContent>
           </Card>
         ))}
       </div>

        <div className="mt-8 flex justify-center">
             <Button asChild>
                 <Link href="/dashboard">Finish Review</Link>
             </Button>
        </div>
    </div>
  );
}


// Use Suspense to handle client-side data fetching states gracefully
export default function ReviewPage() {
    return (
        <Suspense fallback={<ReviewPageLoadingSkeleton />}>
            <ReviewPageComponent />
        </Suspense>
    );
}

// Separate Skeleton component for Suspense fallback
function ReviewPageLoadingSkeleton() {
     return (
      <div className="container py-8 animate-pulse">
        <Skeleton className="h-10 w-48 mb-6" /> {/* Back Button */}
        <Skeleton className="h-8 w-1/2 mb-2" /> {/* Title */}
         <Skeleton className="h-6 w-1/4 mb-8" /> {/* Subtitle */}
         <Card className="mb-8">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Skeleton className="h-24 w-full" />
               <Skeleton className="h-24 w-full" />
               <Skeleton className="h-24 w-full" />
            </CardContent>
             <CardFooter className="justify-center"><Skeleton className="h-4 w-1/4" /></CardFooter>
         </Card>
         <Skeleton className="h-6 w-1/4 mb-4" /> {/* Detailed Review Title */}
         <div className="space-y-6">
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-48 w-full" />
         </div>
         <div className="mt-8 flex justify-center">
            <Skeleton className="h-10 w-32" /> {/* Finish Button */}
         </div>
      </div>
    );
}
