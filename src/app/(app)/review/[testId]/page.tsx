// src/app/(app)/review/[testId]/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, HelpCircle, ArrowLeft, AlertCircle } from 'lucide-react';
// --- CORRECTED IMPORT ---
import { shuffleArray } from '@/lib/utils'; // Import from client-safe utils file

// Types
interface QuestionOption { id: string | number; text: string; }
interface Question { id: number; question: string; options: QuestionOption[]; correct_answer: string | number; }
interface ReviewQuestion extends Question { selected_option: string | number | null; is_correct: boolean; }
interface TestDetailsFromAPI { id: number; title: string; test_type: 'practice' | 'final'; duration?: number; questions: Question[]; module: string; }
interface TestResultDetails { testId: number; testTitle: string; score: string; correctAnswers: number; incorrectAnswers: number; totalQuestions: number; questions: ReviewQuestion[]; }

// --- Main Review Page Component ---
function ReviewPageComponent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string;

  const [resultDetails, setResultDetails] = useState<TestResultDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const score = searchParams.get('score');
  const correct = searchParams.get('correct');
  const incorrect = searchParams.get('incorrect');
  const total = searchParams.get('total');
  const hasQueryParams = score !== null && correct !== null && incorrect !== null && total !== null;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !testId || !hasQueryParams) {
        if (isClient && (!testId || !hasQueryParams)) {
           setError("Missing necessary result data or test ID to display the review.");
           setIsLoading(false);
        }
        return;
    }

    const loadResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- Fetch Test Questions from API ---
        console.log(`Review Page: Fetching questions for test ID: ${testId}`);
        const response = await fetch(`/api/quiz/${testId}`); // Fetch from API
        if (!response.ok) {
           const errorData = await response.json();
           console.error(`Review Page: API error fetching questions for ${testId}:`, errorData);
          throw new Error(errorData.error || `Failed to fetch base test data (status: ${response.status})`);
        }
        const baseData: TestDetailsFromAPI = await response.json();
        console.log(`Review Page: Received base data for ${testId}`, baseData);

        // --- Validation ---
         if (!baseData || !Array.isArray(baseData.questions) || baseData.questions.length === 0) {
            console.error(`Review Page: Invalid or empty questions array received from API for ${testId}`);
            throw new Error(`Base data for test ID ${testId} is invalid or missing questions.`);
         }
         // Validate question format
         const firstQ = baseData.questions[0];
         if (typeof firstQ.id !== 'number' || typeof firstQ.question !== 'string' || !Array.isArray(firstQ.options) || (typeof firstQ.correct_answer !== 'string' && typeof firstQ.correct_answer !== 'number') || firstQ.options.length === 0 || typeof firstQ.options[0] !== 'object' || typeof firstQ.options[0].id === 'undefined' || typeof firstQ.options[0].text === 'undefined') {
              console.error(`Review Page: Invalid question format received from API for ${testId}. Example:`, JSON.stringify(firstQ));
              // Check for the specific 'null' error
              if (firstQ.correct_answer === null) {
                  throw new Error(`Invalid question format: 'correct_answer' is null. Please fix the JSON data to be the option ID (e.g., "a", "b").`);
              }
              throw new Error(`Invalid question format received from API. Cannot process review.`);
         }


        // --- Reconstruct Review Questions (Simulate answers based on score) ---
        const scorePercentage = parseInt(score!, 10);
        const actualTotalFromParams = parseInt(total!, 10);

        if (baseData.questions.length !== actualTotalFromParams) {
             console.warn(`Review Page: Mismatch! API returned ${baseData.questions.length} questions for test ${testId}, but URL params indicate ${actualTotalFromParams} total questions were presented.`);
        }

        // Simulate answers based on the *fetched* questions
        // We pass the imported shuffleArray function to the simulation
        const reviewQuestions = simulateUserAnswersReview(baseData.questions, scorePercentage, actualTotalFromParams, shuffleArray);

        // Check simulation consistency
        const calculatedCorrect = reviewQuestions.filter(q => q.is_correct).length;
        const expectedCorrect = parseInt(correct!, 10);
        if (Math.abs(calculatedCorrect - expectedCorrect) > 1) { // Allow deviation of 1
            console.warn(`Review Page Simulation Check: Simulated ${calculatedCorrect} correct, expected ${expectedCorrect} from params for test ${testId}.`);
        }

        // --- Construct Final Result Details ---
        const result: TestResultDetails = {
          testId: parseInt(testId, 10),
          testTitle: `${baseData.title} Review`, // Use title from fetched data
          score: score!,
          correctAnswers: parseInt(correct!, 10),
          incorrectAnswers: parseInt(incorrect!, 10),
          totalQuestions: actualTotalFromParams, // Use total from params
          questions: reviewQuestions, // Use simulated questions
        };
        setResultDetails(result);

      } catch (err) {
        console.error("Review Page: Failed to load results:", err);
         const message = err instanceof Error ? err.message : "Could not load the test results.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [isClient, testId, score, correct, incorrect, total, hasQueryParams]);

  // Helper function to get option text
  const getOptionText = (question: ReviewQuestion, optionId: string | number | null): string => {
    if(optionId === null) return "Not Answered";
    if (!Array.isArray(question.options)) {
        console.error("Question options are not an array:", question);
        return "Invalid Options";
    }
    const option = question.options.find(opt => String(opt.id) === String(optionId));
    return option?.text ?? "Unknown Option";
  }

  // --- Render Logic (Loading, Error, Success) ---
  if (isLoading || !isClient) {
    return <ReviewPageLoadingSkeleton />;
  }

  if (error || !resultDetails || !resultDetails.questions || resultDetails.questions.length === 0) {
     return (
       <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Alert variant="destructive" className="max-w-lg">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error Loading Results</AlertTitle>
             <AlertDescription>
                 {error || "Could not load result details, or no questions were found for this review."}
                 <Button variant="link" className="p-0 h-auto mt-2 text-destructive dark:text-destructive" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
             </AlertDescription>
          </Alert>
       </div>
    );
  }

  // --- Success: Render Results ---
  return (
    <div className="container py-8">
       <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-6">
         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
       </Button>

       <h1 className="text-3xl font-bold mb-2">{resultDetails.testTitle}</h1>
       <p className="text-muted-foreground mb-6">Review your performance for this test.</p>

       {/* Summary Card */}
       <Card className="mb-8 bg-secondary/50 dark:bg-secondary/20 border border-border">
         <CardHeader>
            <CardTitle>Summary</CardTitle>
         </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-md bg-background shadow-sm border">
                 <p className={`text-4xl font-bold ${parseInt(resultDetails.score) >= 70 ? 'text-green-600' : parseInt(resultDetails.score) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {resultDetails.score}%
                 </p>
                 <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
            </div>
             <div className="p-4 rounded-md bg-background shadow-sm border">
                <p className="text-4xl font-bold text-green-600">{resultDetails.correctAnswers}</p>
                <p className="text-sm text-muted-foreground mt-1">Correct Answers</p>
            </div>
             <div className="p-4 rounded-md bg-background shadow-sm border">
                <p className="text-4xl font-bold text-red-600">{resultDetails.incorrectAnswers}</p>
                <p className="text-sm text-muted-foreground mt-1">Incorrect Answers</p>
            </div>
         </CardContent>
         <CardFooter className="text-center justify-center text-muted-foreground pt-4">
             Total Questions Presented: {resultDetails.totalQuestions}
         </CardFooter>
       </Card>

       <h2 className="text-2xl font-semibold mb-4">Detailed Review</h2>

       {/* Questions Review */}
       <div className="space-y-6">
         {resultDetails.questions.map((q, index) => (
            <Card key={`${q.id}-${index}`} className={`border-l-4 ${q.is_correct ? 'border-green-500 dark:border-green-600' : q.selected_option === null ? 'border-yellow-500 dark:border-yellow-600' : 'border-red-500 dark:border-red-600'} transition-colors duration-150 overflow-hidden`}>
             <CardHeader>
               <CardTitle className="flex justify-between items-start gap-2">
                 <span className="text-xl font-medium">Question {index + 1}</span>
                  {q.is_correct ? ( <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 shrink-0"><CheckCircle className="mr-1 h-4 w-4" /> Correct</Badge>
                  ) : q.selected_option === null ? ( <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 shrink-0"><HelpCircle className="mr-1 h-4 w-4" /> Not Answered</Badge>
                  ) : ( <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 shrink-0"><XCircle className="mr-1 h-4 w-4" /> Incorrect</Badge> )}
               </CardTitle>
               <CardDescription className="pt-3 text-base text-foreground">{q.question}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
               {Array.isArray(q.options) && q.options.map(option => {
                 const isSelected = String(q.selected_option) === String(option.id);
                 const isCorrectAnswer = String(q.correct_answer) === String(option.id);
                 let highlightClass = "border-muted bg-background dark:border-border dark:bg-background/50";
                  if (isCorrectAnswer) { highlightClass = "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 font-medium text-green-900 dark:text-green-200"; }
                  if (isSelected && !q.is_correct) { highlightClass = "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 font-medium text-red-900 dark:text-red-200"; }
                  if (isSelected && q.is_correct){ highlightClass = "border-green-400 dark:border-green-600 bg-green-100 dark:bg-green-800/40 font-medium text-green-900 dark:text-green-200 ring-2 ring-green-500/50 dark:ring-green-600/60"; }
                 return ( <div key={option.id} className={`relative p-3 border rounded-md ${highlightClass} transition-colors duration-150 text-sm`}> {option.text} {isSelected && ( <span className={`absolute top-1 right-1 text-xs font-semibold px-1.5 py-0.5 rounded ${q.is_correct ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>Your Answer</span> )} {isCorrectAnswer && !isSelected && ( <span className="absolute top-1 right-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">Correct Answer</span> )} </div> );
               })}
                {q.selected_option === null && !q.is_correct && Array.isArray(q.options) && ( <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700 text-sm text-yellow-800 dark:text-yellow-300"><p className="font-medium mb-1">You did not answer this question.</p><p>The correct answer was: <span className="font-semibold">{getOptionText(q, q.correct_answer)}</span></p></div> )}
                {!q.is_correct && q.selected_option !== null && Array.isArray(q.options) && ( <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700 text-sm text-blue-800 dark:text-blue-300"><p>The correct answer was: <span className="font-semibold">{getOptionText(q, q.correct_answer)}</span></p></div> )}
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

// --- Simulation Function ---
// (This is still needed because the backend doesn't store/return the user's actual answers)
const simulateUserAnswersReview = (
    baseQuestions: Question[],
    scorePercent: number,
    actualTotalQuestions: number,
    // shuffleFunc is passed in, using the one imported from @/lib/utils
    shuffleFunc: <T>(array: T[]) => T[]
): ReviewQuestion[] => {
   if (typeof window === 'undefined') return [];
   if (!baseQuestions || baseQuestions.length === 0) return [];
   const totalQuestionsPresented = actualTotalQuestions;
   const targetCorrectCount = Math.round((scorePercent / 100) * totalQuestionsPresented);
   let currentCorrectCount = 0;
   
   // Use the passed-in shuffle function
   const shuffledBaseQuestions = shuffleFunc([...baseQuestions]);
   
   // Use the *actual* questions presented (which are the baseQuestions passed in)
   // We re-shuffle them here just for the *simulation* part
   const presentedQuestions = shuffledBaseQuestions.slice(0, totalQuestionsPresented);
   const reviewQuestionsMap: Map<number, ReviewQuestion> = new Map();

   presentedQuestions.forEach((q, index) => {
     let selected_option: string | number | null = null;
     let is_correct = false;
     const shouldAttemptAnswer = Math.random() < 0.98;
     if (shouldAttemptAnswer) {
       const remainingSimulations = presentedQuestions.length - index;
       const remainingCorrectNeeded = targetCorrectCount - currentCorrectCount;
       const probabilityCorrect = remainingSimulations > 0 ? Math.max(0, Math.min(1, remainingCorrectNeeded / remainingSimulations)) : 0;
       
       if (Math.random() < probabilityCorrect && currentCorrectCount < targetCorrectCount) {
         selected_option = q.correct_answer;
         is_correct = true;
         currentCorrectCount++;
       } else {
         const incorrectOptions = q.options.filter(opt => String(opt.id) !== String(q.correct_answer));
         selected_option = incorrectOptions.length > 0 ? incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)].id : (q.options.length > 0 ? q.options[0].id : null);
         is_correct = false;
       }
     } else {
       selected_option = null;
       is_correct = false;
     }
     reviewQuestionsMap.set(q.id, { ...q, selected_option, is_correct });
   });
   
    // This logic ensures the simulation matches the score from the URL params more closely
    const simulatedCorrectCount = Array.from(reviewQuestionsMap.values()).filter(q => q.is_correct).length;
    let deviation = targetCorrectCount - simulatedCorrectCount;
    const reviewQuestionsArray = Array.from(reviewQuestionsMap.values());

    if (deviation > 0) { // Need to add more correct answers
        for (let i = 0; i < reviewQuestionsArray.length && deviation > 0; i++) {
            if (!reviewQuestionsArray[i].is_correct && reviewQuestionsArray[i].selected_option !== null) {
                reviewQuestionsArray[i].is_correct = true;
                reviewQuestionsArray[i].selected_option = reviewQuestionsArray[i].correct_answer;
                deviation--;
            }
        }
    } else if (deviation < 0) { // Need to remove correct answers
         for (let i = 0; i < reviewQuestionsArray.length && deviation < 0; i++) {
            if (reviewQuestionsArray[i].is_correct) {
                reviewQuestionsArray[i].is_correct = false;
                 const incorrectOptions = reviewQuestionsArray[i].options.filter(opt => String(opt.id) !== String(reviewQuestionsArray[i].correct_answer));
                 reviewQuestionsArray[i].selected_option = incorrectOptions.length > 0 ? incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)].id : (reviewQuestionsArray[i].options.length > 0 ? reviewQuestionsArray[i].options[0].id : null);
                deviation++;
            }
        }
    }

   const finalReviewQuestionsMap = new Map(reviewQuestionsArray.map(q => [q.id, q]));
   // Use baseQuestions (original order from API) to map the results
   const finalReviewQuestions = baseQuestions.map(q => finalReviewQuestionsMap.get(q.id)!);

   return finalReviewQuestions;
 };


// --- Skeleton Component ---
function ReviewPageLoadingSkeleton() {
     return (
      <div className="container py-8 animate-pulse">
        <Skeleton className="h-10 w-48 mb-6 rounded-md" /> {/* Back Button */}
        <Skeleton className="h-8 w-3/4 mb-2 rounded" /> {/* Title */}
         <Skeleton className="h-6 w-1/2 mb-8 rounded" /> {/* Subtitle */}
         <Card className="mb-8 border border-border">
            <CardHeader><Skeleton className="h-6 w-1/3 rounded" /></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Skeleton className="h-24 w-full rounded-md" />
               <Skeleton className="h-24 w-full rounded-md" />
               <Skeleton className="h-24 w-full rounded-md" />
            </CardContent>
             <CardFooter className="justify-center pt-4"><Skeleton className="h-4 w-1/4 rounded" /></CardFooter>
         </Card>
         <Skeleton className="h-7 w-48 mb-4 rounded" /> {/* Detailed Review Title */}
         <div className="space-y-6">
             <Skeleton className="h-56 w-full rounded-lg" />
             <Skeleton className="h-56 w-full rounded-lg" />
             <Skeleton className="h-56 w-full rounded-lg" />
         </div>
         <div className="mt-8 flex justify-center">
            <Skeleton className="h-12 w-36 rounded-md" /> {/* Finish Button */}
         </div>
      </div>
    );
}

// --- Main Export with Suspense ---
export default function ReviewPage() {
    return (
        <Suspense fallback={<ReviewPageLoadingSkeleton />}>
            <ReviewPageComponent />
        </Suspense>
    );
}