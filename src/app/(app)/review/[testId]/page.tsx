
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, HelpCircle, ArrowLeft } from 'lucide-react';
import quizData from '@/data/quiz-questions.json'; // Import the JSON data

// Types (derive from JSON structure if possible, or define explicitly)
interface QuestionOption {
  id: string | number;
  text: string;
}
interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
  correct_answer: string | number; // The ID of the correct option
}
interface ReviewQuestion extends Question {
  selected_option: string | number | null; // User's selected answer for this question
  is_correct: boolean; // Was the user's answer correct?
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

// Type assertion for the imported JSON data
const testsDatabase: Record<string, Omit<TestResultDetails, 'score' | 'correctAnswers' | 'incorrectAnswers' | 'questions'> & { questions: Question[] }> = quizData;


// Helper to simulate user answers based on the fetched questions and score
// In a real app, user answers would ideally come from the backend or be stored/passed securely.
// This simulation is for demonstration purposes.
const simulateUserAnswers = (baseQuestions: Question[], scorePercent: number): ReviewQuestion[] => {
  const totalQuestions = baseQuestions.length;
  // Calculate the target number of correct answers based on the score
  const targetCorrectCount = Math.round((scorePercent / 100) * totalQuestions);
  let currentCorrectCount = 0;

  // Shuffle questions to randomize which ones are answered correctly/incorrectly
  const shuffledQuestions = [...baseQuestions].sort(() => Math.random() - 0.5);

  const reviewQuestions = shuffledQuestions.map(q => {
    let selected_option: string | number | null = null;
    let is_correct = false;
    const shouldAttemptAnswer = Math.random() < 0.98; // Simulate 2% unanswered rate

    if (shouldAttemptAnswer) {
      // Decide if this answer should be correct based on remaining needed correct answers
      const remainingQuestions = totalQuestions - (reviewQuestions ? reviewQuestions.length : 0);
      const remainingCorrectNeeded = targetCorrectCount - currentCorrectCount;
      const probabilityCorrect = remainingQuestions > 0 ? remainingCorrectNeeded / remainingQuestions : 0;

      if (Math.random() < probabilityCorrect && currentCorrectCount < targetCorrectCount) {
        // Mark as correct
        selected_option = q.correct_answer;
        is_correct = true;
        currentCorrectCount++;
      } else {
        // Mark as incorrect
        const incorrectOptions = q.options.filter(opt => String(opt.id) !== String(q.correct_answer));
        if (incorrectOptions.length > 0) {
          selected_option = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)].id;
        } else {
          // Fallback if only correct option exists (edge case)
          selected_option = q.correct_answer;
        }
        is_correct = false;
      }
    } else {
      // Mark as unanswered
      selected_option = null;
      is_correct = false; // Unanswered is incorrect
    }

    return {
      ...q,
      selected_option: selected_option,
      is_correct: is_correct,
    };
  });

   // Re-sort questions back to their original order based on ID
   reviewQuestions.sort((a, b) => a.id - b.id);

  return reviewQuestions;
};


function ReviewPageComponent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string;

  const [resultDetails, setResultDetails] = useState<TestResultDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract summary data from query params
  const score = searchParams.get('score');
  const correct = searchParams.get('correct');
  const incorrect = searchParams.get('incorrect');
  const total = searchParams.get('total');

   // Validate that we have all necessary query params
   const hasQueryParams = score !== null && correct !== null && incorrect !== null && total !== null;


  useEffect(() => {
    if (!testId || !hasQueryParams) {
        setError("Missing necessary result data to display the review.");
        setIsLoading(false);
        return;
    }

    const loadResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
         // Simulate potential async loading if needed
        await new Promise(resolve => setTimeout(resolve, 50)); // Short delay

        const baseData = testsDatabase[testId];

        if (baseData && hasQueryParams) {
           // Simulate user answers based on the fetched base questions and the passed score
           const scorePercentage = parseInt(score!, 10); // Use actual score from query params
           const reviewQuestions = simulateUserAnswers(baseData.questions, scorePercentage);

           // Verify the simulated answers match the counts from query params (optional sanity check)
            const calculatedCorrect = reviewQuestions.filter(q => q.is_correct).length;
            if (calculatedCorrect !== parseInt(correct!, 10)) {
                console.warn(`Simulated correct count (${calculatedCorrect}) does not match query param (${correct}). Adjusting simulation or review logic may be needed.`);
                // Depending on requirements, you might adjust simulation or trust query params.
                // For now, we proceed using the query params for the summary card,
                // but the detailed view uses the simulated answers.
            }

           // Construct the final result details object
          const result: TestResultDetails = {
            testId: parseInt(testId, 10),
            testTitle: `${baseData.title} Review`,
            score: score!, // Use score from query param
            correctAnswers: parseInt(correct!, 10), // Use correct count from query param
            incorrectAnswers: parseInt(incorrect!, 10), // Use incorrect count from query param
            totalQuestions: parseInt(total!, 10), // Use total from query param
            questions: reviewQuestions, // Use the questions with simulated answers & correctness
          };
          setResultDetails(result);
        } else {
           console.error(`Base data for test ID ${testId} not found or query params missing.`);
           setError(`Could not find test details for ID ${testId}.`);
        }
      } catch (err) {
        console.error("Failed to process results:", err);
         const message = err instanceof Error ? err.message : "Could not load the test results.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [testId, score, correct, incorrect, total, hasQueryParams]); // Dependencies


   const getOptionText = (question: ReviewQuestion, optionId: string | number | null): string => {
      if(optionId === null) return "Not Answered";
      const option = question.options.find(opt => String(opt.id) === String(optionId)); // Compare as strings
      return option?.text ?? "Unknown Option";
   }

  // Loading State
  if (isLoading) {
    return <ReviewPageLoadingSkeleton />;
  }

  // Error State
  if (error || !resultDetails) {
     return (
       <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Alert variant="destructive" className="max-w-lg">
             <AlertTitle>Error Loading Results</AlertTitle>
             <AlertDescription>
                {error || "Could not load result details."}
                 <Button variant="link" className="p-0 h-auto mt-2" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
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

       <h1 className="text-3xl font-bold mb-2">{resultDetails.testTitle}</h1>
       <p className="text-muted-foreground mb-6">Review your performance for this test.</p>

       {/* Summary Card - Uses data directly from query params */}
       <Card className="mb-8 bg-secondary/50 dark:bg-secondary/20">
         <CardHeader>
            <CardTitle>Summary</CardTitle>
         </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-md bg-background shadow-sm border">
                <p className="text-4xl font-bold text-primary">{resultDetails.score}%</p>
                <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
             <div className="p-4 rounded-md bg-background shadow-sm border">
                <p className="text-4xl font-bold text-green-600">{resultDetails.correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
             <div className="p-4 rounded-md bg-background shadow-sm border">
                <p className="text-4xl font-bold text-red-600">{resultDetails.incorrectAnswers}</p>
                <p className="text-sm text-muted-foreground">Incorrect Answers</p>
            </div>
         </CardContent>
         <CardFooter className="text-center justify-center text-muted-foreground pt-4">
             Total Questions: {resultDetails.totalQuestions}
         </CardFooter>
       </Card>

       <h2 className="text-2xl font-semibold mb-4">Detailed Review</h2>

        {/* Questions Review - Uses simulated answer data */}
       <div className="space-y-6">
         {resultDetails.questions.map((q, index) => (
           <Card key={q.id} className={`border-l-4 ${q.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
             <CardHeader>
               <CardTitle className="flex justify-between items-start">
                 <span className="text-xl">Question {index + 1}</span>
                  {q.is_correct ? (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="mr-1 h-4 w-4" /> Correct
                    </Badge>
                  ) : q.selected_option === null ? (
                     <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black dark:text-white">
                        <HelpCircle className="mr-1 h-4 w-4" /> Not Answered
                    </Badge>
                  ) : (
                     <Badge variant="destructive">
                       <XCircle className="mr-1 h-4 w-4" /> Incorrect
                     </Badge>
                  )}
               </CardTitle>
               <CardDescription className="pt-3 text-base text-foreground">{q.question}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
               {q.options.map(option => {
                 const isSelected = String(q.selected_option) === String(option.id);
                 const isCorrectAnswer = String(q.correct_answer) === String(option.id);
                 let highlightClass = "border-muted bg-background"; // Default

                 // Style for the correct answer (always highlighted green unless it was the incorrect selection)
                  if (isCorrectAnswer) {
                    highlightClass = "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 font-medium";
                  }
                  // Style for the user's incorrect selection (red)
                  if (isSelected && !q.is_correct) {
                      highlightClass = "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30"; // Removed line-through
                  }
                   // Style for user's correct selection (stronger green highlight)
                  if (isSelected && q.is_correct){
                      highlightClass = "border-green-400 dark:border-green-600 bg-green-100 dark:bg-green-800/40 font-medium ring-2 ring-green-500/50";
                  }

                 return (
                   <div key={option.id} className={`relative p-3 border rounded-md ${highlightClass} transition-colors duration-150`}>
                      {option.text}
                      {/* Indicators */}
                      {isSelected && !q.is_correct && (
                        <span className="absolute top-1 right-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"> Your Answer </span>
                      )}
                      {isSelected && q.is_correct && (
                        <span className="absolute top-1 right-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"> Your Answer </span>
                      )}
                       {isCorrectAnswer && !isSelected && (
                          <span className="absolute top-1 right-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"> Correct Answer </span>
                       )}
                   </div>
                 );
               })}
                {q.selected_option === null && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-500 font-medium mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700">You did not answer this question. The correct answer is highlighted above.</p>
                )}
                {/* Potential future Explanation Box */}
                {/* <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md"> ... </div> */}
             </CardContent>
           </Card>
         ))}
       </div>

        <div className="mt-8 flex justify-center">
             <Button asChild size="lg">
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
        <Skeleton className="h-8 w-3/4 mb-2" /> {/* Title */}
         <Skeleton className="h-6 w-1/2 mb-8" /> {/* Subtitle */}
         <Card className="mb-8">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Skeleton className="h-24 w-full rounded-md" />
               <Skeleton className="h-24 w-full rounded-md" />
               <Skeleton className="h-24 w-full rounded-md" />
            </CardContent>
             <CardFooter className="justify-center"><Skeleton className="h-4 w-1/4" /></CardFooter>
         </Card>
         <Skeleton className="h-6 w-1/4 mb-4" /> {/* Detailed Review Title */}
         <div className="space-y-6">
             <Skeleton className="h-48 w-full rounded-lg" />
             <Skeleton className="h-48 w-full rounded-lg" />
             <Skeleton className="h-48 w-full rounded-lg" />
         </div>
         <div className="mt-8 flex justify-center">
            <Skeleton className="h-12 w-36 rounded-md" /> {/* Finish Button */}
         </div>
      </div>
    );
}

