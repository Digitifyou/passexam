
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge"; // Correctly import Badge
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

interface TestDetails {
  id: number;
  title: string;
  test_type: 'practice' | 'final'; // Added test_type
  questions: Question[];
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

// Type assertion for the imported JSON data - keys are test IDs (strings)
const testsDatabase: Record<string, TestDetails> = quizData;

// Helper function to shuffle an array (Fisher-Yates)
const shuffleArray = <T>(array: T[]): T[] => {
   // Ensure shuffle runs only on the client after hydration
  if (typeof window === 'undefined') return array;
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};


// Helper to simulate user answers based on the fetched questions and score
// In a real app, user answers would ideally come from the backend or be stored/passed securely.
// This simulation is for demonstration purposes.
const simulateUserAnswers = (baseQuestions: Question[], scorePercent: number, actualTotalQuestions: number): ReviewQuestion[] => {
   // Need to ensure this runs client-side only due to Math.random()
  if (typeof window === 'undefined') return []; // Return empty on server

  if (!baseQuestions || baseQuestions.length === 0) {
      console.warn("simulateUserAnswers called with no base questions.");
      return []; // Return empty array if no base questions
  }

   // Use the actual number of questions presented to the user (passed via actualTotalQuestions)
   const totalQuestionsPresented = actualTotalQuestions;

  // Calculate the target number of correct answers based on the score and *actual* question count
  const targetCorrectCount = Math.round((scorePercent / 100) * totalQuestionsPresented);
  let currentCorrectCount = 0;

  console.log(`Simulating answers for ${totalQuestionsPresented} questions presented, targeting ${targetCorrectCount} correct for score ${scorePercent}%. Base pool size: ${baseQuestions.length}.`);


  // Important: Shuffle the *baseQuestions* array to randomize which questions are used
  // for correct/incorrect simulation, ensuring we work with the questions the user *could* have seen.
  const shuffledBaseQuestions = shuffleArray([...baseQuestions]);

  // Select the subset of questions that were actually presented (size = actualTotalQuestions)
  const presentedQuestions = shuffledBaseQuestions.slice(0, totalQuestionsPresented);

  // Map to store results, keyed by original question ID for potential later use (though index is primary for order)
  const reviewQuestionsMap: Map<number, ReviewQuestion> = new Map();

  // Simulate answers only on the *presented* questions
  presentedQuestions.forEach((q, index) => {
    let selected_option: string | number | null = null;
    let is_correct = false;
    const shouldAttemptAnswer = Math.random() < 0.98; // Simulate 2% unanswered rate

    if (shouldAttemptAnswer) {
      // Decide if this answer should be correct based on remaining needed correct answers within the *presented* set
      const remainingSimulations = presentedQuestions.length - index;
      const remainingCorrectNeeded = targetCorrectCount - currentCorrectCount;
      const probabilityCorrect = remainingSimulations > 0 ? Math.max(0, Math.min(1, remainingCorrectNeeded / remainingSimulations)) : 0;


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
          // Fallback if only correct option exists
          selected_option = q.options.length > 0 ? q.options[0].id : null;
        }
        is_correct = false;
      }
    } else {
      // Mark as unanswered
      selected_option = null;
      is_correct = false; // Unanswered is incorrect
    }

     const reviewQuestion: ReviewQuestion = {
       ...q, // Spread the original question data
       selected_option: selected_option,
       is_correct: is_correct,
     };
     reviewQuestionsMap.set(q.id, reviewQuestion); // Store using question ID

  });

    // Verify simulation accuracy against target
    const simulatedCorrectCount = Array.from(reviewQuestionsMap.values()).filter(q => q.is_correct).length;
    if (simulatedCorrectCount !== targetCorrectCount) {
        console.warn(`Simulation Deviation: Resulted in ${simulatedCorrectCount} correct, target was ${targetCorrectCount}.`);
        // Optional: Implement logic to adjust simulation results to match target if needed.
        // For now, we accept minor deviations due to randomness inherent in simulation.
    }


   // Convert map back to array. The order should ideally match the order presented in the quiz.
   // Since we don't store the *exact* presentation order, we'll use the order from `presentedQuestions`.
   const finalReviewQuestions = presentedQuestions.map(q => reviewQuestionsMap.get(q.id)!);

   console.log("Final simulated review questions:", finalReviewQuestions);

  return finalReviewQuestions;
};


function ReviewPageComponent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string;

  const [resultDetails, setResultDetails] = useState<TestResultDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [isClient, setIsClient] = useState(false); // State to track client-side mount

  // Extract summary data from query params
  const score = searchParams.get('score');
  const correct = searchParams.get('correct');
  const incorrect = searchParams.get('incorrect');
  const total = searchParams.get('total'); // Represents the *actual* number of questions presented

   // Validate that we have all necessary query params
   const hasQueryParams = score !== null && correct !== null && incorrect !== null && total !== null;

   // Effect to set isClient to true after component mounts
   useEffect(() => {
     setIsClient(true);
   }, []);

  useEffect(() => {
     // Ensure this effect runs only on the client AND after necessary data is available
     if (!isClient || !testId || !hasQueryParams) {
        if (isClient && (!testId || !hasQueryParams)) {
           setError("Missing necessary result data or test ID to display the review.");
           setIsLoading(false);
        }
        return; // Don't run on server or if data missing
     }

    const loadResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
         // Simulate potential async loading if needed
        await new Promise(resolve => setTimeout(resolve, 50)); // Short delay

        const baseData = testsDatabase[testId];
        const actualTotalFromParams = parseInt(total!, 10); // Total questions *presented*

        if (baseData && baseData.questions && Array.isArray(baseData.questions) && hasQueryParams && actualTotalFromParams > 0) {

           // --- Simulation Logic ---
           // Pass the *full* question pool (baseData.questions) and the *actual count* (actualTotalFromParams)
           const scorePercentage = parseInt(score!, 10);
           const reviewQuestions = simulateUserAnswers(baseData.questions, scorePercentage, actualTotalFromParams);
           // --- End Simulation Logic ---


           // Verify the simulated answers match the counts from query params (optional sanity check)
            const calculatedCorrect = reviewQuestions.filter(q => q.is_correct).length;
            const expectedCorrect = parseInt(correct!, 10);

             if (reviewQuestions.length !== actualTotalFromParams) {
                  console.error(`FATAL SIMULATION ERROR: Simulated question count (${reviewQuestions.length}) does not match reported total (${actualTotalFromParams}). Cannot display accurate review.`);
                   setError("Error generating review details. Counts do not match.");
                   setIsLoading(false);
                   return; // Prevent proceeding with inconsistent data
             }
            // Allow a small tolerance for simulation randomness if totals match
            if (Math.abs(calculatedCorrect - expectedCorrect) > 1) { // Allow deviation of 1 due to rounding
                console.warn(`SIMULATION CHECK: Simulated correct count (${calculatedCorrect}) differs slightly from query param (${correct}). Using query param counts for summary.`);
            }


           // Construct the final result details object
          const result: TestResultDetails = {
            testId: parseInt(testId, 10),
            testTitle: `${baseData.title} Review`,
            score: score!, // Use score from query param
            correctAnswers: parseInt(correct!, 10), // Use correct count from query param
            incorrectAnswers: parseInt(incorrect!, 10), // Use incorrect count from query param
            totalQuestions: actualTotalFromParams, // Use total from query param (actual presented)
            questions: reviewQuestions, // Use the questions with simulated answers & correctness
          };
          setResultDetails(result);
        } else {
           let errorMsg = `Could not find test details or questions for ID ${testId}.`;
           if (!baseData) errorMsg = `Base data for test ID ${testId} not found.`;
           else if (!baseData.questions || !Array.isArray(baseData.questions)) errorMsg = `Questions for test ID ${testId} are missing or invalid.`;
           else if (!hasQueryParams) errorMsg = "Missing score/count data in URL parameters.";
           else if (actualTotalFromParams <= 0) errorMsg = "Invalid total question count received.";

           console.error("Error loading results:", errorMsg, { testId, hasQueryParams, total, baseDataExists: !!baseData });
           setError(errorMsg);
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
     // Ensure dependencies cover all external values used
   }, [isClient, testId, score, correct, incorrect, total, hasQueryParams]); // Dependencies


   const getOptionText = (question: ReviewQuestion, optionId: string | number | null): string => {
      if(optionId === null) return "Not Answered";
      if (!Array.isArray(question.options)) {
          console.error("Question options are not an array:", question);
          return "Invalid Options";
      }
      const option = question.options.find(opt => String(opt.id) === String(optionId)); // Compare as strings
      return option?.text ?? "Unknown Option";
   }

  // Loading State
  if (isLoading || !isClient) { // Show skeleton if loading or still on server/pre-mount
    return <ReviewPageLoadingSkeleton />;
  }

  // Error State
  if (error || !resultDetails || !resultDetails.questions || resultDetails.questions.length === 0) {
     return (
       <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Alert variant="destructive" className="max-w-lg">
             <AlertTitle>Error Loading Results</AlertTitle>
             <AlertDescription>
                 {error || "Could not load result details, or no questions were found for this review."}
                 <Button variant="link" className="p-0 h-auto mt-2 text-destructive dark:text-destructive" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
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
                  {q.is_correct ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 shrink-0">
                        <CheckCircle className="mr-1 h-4 w-4" /> Correct
                    </Badge>
                  ) : q.selected_option === null ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 shrink-0">
                        <HelpCircle className="mr-1 h-4 w-4" /> Not Answered
                    </Badge>
                  ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 shrink-0">
                       <XCircle className="mr-1 h-4 w-4" /> Incorrect
                     </Badge>
                  )}
               </CardTitle>
               <CardDescription className="pt-3 text-base text-foreground">{q.question}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
                {/* Ensure options exist and are an array */}
               {Array.isArray(q.options) && q.options.map(option => {
                 const isSelected = String(q.selected_option) === String(option.id);
                 const isCorrectAnswer = String(q.correct_answer) === String(option.id);
                 let highlightClass = "border-muted bg-background dark:border-border dark:bg-background/50"; // Default

                  // Style for the correct answer (always green background unless it was the incorrect selection)
                  if (isCorrectAnswer) {
                    highlightClass = "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 font-medium text-green-900 dark:text-green-200";
                  }
                  // Style for the user's incorrect selection (red background)
                  if (isSelected && !q.is_correct) {
                      highlightClass = "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 font-medium text-red-900 dark:text-red-200";
                  }
                   // Style for user's correct selection (stronger green highlight + ring)
                  if (isSelected && q.is_correct){
                      highlightClass = "border-green-400 dark:border-green-600 bg-green-100 dark:bg-green-800/40 font-medium text-green-900 dark:text-green-200 ring-2 ring-green-500/50 dark:ring-green-600/60";
                  }

                 return (
                    <div key={option.id} className={`relative p-3 border rounded-md ${highlightClass} transition-colors duration-150 text-sm`}>
                      {option.text}
                      {/* Clearer Indicators */}
                       {isSelected && (
                          <span className={`absolute top-1 right-1 text-xs font-semibold px-1.5 py-0.5 rounded ${q.is_correct ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                              Your Answer
                          </span>
                       )}
                       {isCorrectAnswer && !isSelected && (
                          <span className="absolute top-1 right-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                              Correct Answer
                          </span>
                       )}
                   </div>
                 );
               })}
                {q.selected_option === null && !q.is_correct && Array.isArray(q.options) && (
                    // Message indicating the correct answer when unanswered
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700 text-sm text-yellow-800 dark:text-yellow-300">
                       <p className="font-medium mb-1">You did not answer this question.</p>
                       <p>The correct answer was: <span className="font-semibold">{getOptionText(q, q.correct_answer)}</span></p>
                       {/* Highlight the correct answer visually in the options list above */}
                   </div>
                )}
                {!q.is_correct && q.selected_option !== null && Array.isArray(q.options) && (
                     // Message indicating the correct answer when answered incorrectly
                     <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700 text-sm text-blue-800 dark:text-blue-300">
                       <p>The correct answer was: <span className="font-semibold">{getOptionText(q, q.correct_answer)}</span></p>
                       {/* Highlight the correct answer visually in the options list above */}
                   </div>
                )}
                {/* Explanation Section Placeholder - Future Enhancement
                  {q.explanation && (
                     <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm">
                       <p className="font-semibold mb-1">Explanation:</p>
                       <p>{q.explanation}</p>
                     </div>
                  )}
                 */}
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
