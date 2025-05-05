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
  selected_option: string | number | null; // User's selected answer for this question
  is_correct: boolean; // Was the user's answer correct?
}
interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
  correct_answer: string | number; // The ID of the correct option
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

// Helper to simulate user answers for mock data
// In a real app, this would come from the backend based on user submission
const simulateUserAnswers = (questions: Question[], correctPercentage = 70): ReviewQuestion[] => {
    return questions.map(q => {
        const shouldBeCorrect = Math.random() * 100 < correctPercentage;
        let selected_option: string | number | null = null;
        let is_correct = false;

        if (Math.random() < 0.95) { // 5% chance of not answering
            if (shouldBeCorrect) {
                selected_option = q.correct_answer;
                is_correct = true;
            } else {
                // Select a random incorrect option
                const incorrectOptions = q.options.filter(opt => opt.id !== q.correct_answer);
                if (incorrectOptions.length > 0) {
                    selected_option = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)].id;
                } else {
                    selected_option = q.correct_answer; // Fallback if only one option (unlikely)
                }
                is_correct = false;
            }
        } else {
             is_correct = false; // Not answered is incorrect
        }


        return {
            ...q,
            selected_option: selected_option,
            is_correct: is_correct,
        };
    });
};


function ReviewPageComponent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string;

  const [resultDetails, setResultDetails] = useState<TestResultDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract summary data from query params (passed from quiz page)
  const score = searchParams.get('score');
  const correct = searchParams.get('correct');
  const incorrect = searchParams.get('incorrect');
  const total = searchParams.get('total');

   // Validate that we have all necessary query params
   const hasQueryParams = score !== null && correct !== null && incorrect !== null && total !== null;


  useEffect(() => {
    if (!testId || !hasQueryParams) { // Check if query params are present
        setError("Missing necessary result data to display the review.");
        setIsLoading(false);
        return;
    }

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
        // Define base questions for all tests (matches quiz page)
         const baseMockQuestions: Record<string, {title: string, questions: Question[]}> = {
             // Section 1
             "101": { title: "Practice Test 1", questions: [
                 { id: 1011, question: "What does NAV stand for?", options: [{id: 'a', text: 'Net Asset Value'}, {id: 'b', text:'New Account Volume'}, {id: 'c', text:'National Association of Ventures'}], correct_answer: 'a' },
                 { id: 1012, question: "Which fund type aims to replicate a market index?", options: [{id: 'a', text:'Actively Managed Fund'}, {id: 'b', text:'Index Fund'}, {id: 'c', text:'Hedge Fund'}], correct_answer: 'b' },
             ]},
             "102": { title: "Practice Test 2", questions: [
                 { id: 1021, question: "What is an Expense Ratio?", options: [{id: 'a', text: 'Annual fee charged by funds'}, {id: 'b', text:'Ratio of profits to losses'}, {id: 'c', text:'Measure of market volatility'}], correct_answer: 'a' },
             ]},
             "103": { title: "Practice Test 3", questions: [
                 { id: 1031, question: "What is a Load Fee?", options: [{id: 'a', text: 'Sales charge on mutual funds'}, {id: 'b', text:'Fee for heavy items'}, {id: 'c', text:'Server load balancer cost'}], correct_answer: 'a' },
             ]},
             "104": { title: "Practice Test 4", questions: [
                 { id: 1041, question: "Difference between Open-End and Closed-End funds?", options: [{id: 'a', text: 'Share issuance/redemption'}, {id: 'b', text:'Investment strategy'}, {id: 'c', text:'Fund manager location'}], correct_answer: 'a' },
             ]},
             "105": { title: "Practice Test 5", questions: [
                 { id: 1051, question: "What does KYC mean in finance?", options: [{id: 'a', text: 'Know Your Customer'}, {id: 'b', text:'Keep Your Capital'}, {id: 'c', text:'Key Yield Calculation'}], correct_answer: 'a' },
             ]},
             "106": { title: "Final Mock Test", questions: [
                 { id: 1061, question: "What is a primary market?", options: [{id: 'a', text:'Where existing securities are traded'}, {id: 'b', text:'Where new securities are issued'}, {id: 'c', text:'A type of supermarket'}], correct_answer: 'b' },
                 { id: 1062, question: "What is SIP?", options: [{id: 'a', text:'Stock Incentive Plan'}, {id: 'b', text:'Systematic Investment Plan'}, {id: 'c', text:'Securities Issuance Protocol'}], correct_answer: 'b' },
                 { id: 1063, question: "Which document is used in IPO filing?", options: [{id: 'a', text:"Red Herring Prospectus"}, {id: 'b', text:"NAV Statement"}, {id: 'c', text:"Offer Note"}, {id: 'd', text:"KYC Form"}], correct_answer: "a" }
             ]},
             // Section 2
             "201": { title: "Options Practice 1", questions: [
                 { id: 2011, question: "What gives the buyer the right, but not the obligation, to buy an asset?", options: [{id: 'a', text:'Put Option'}, {id: 'b', text:'Call Option'}, {id: 'c', text:'Future Contract'}], correct_answer: 'b' },
             ]},
             "202": { title: "Futures Practice 1", questions: [
                 { id: 2021, question: "What is a Futures Contract?", options: [{id: 'a', text: 'Agreement to buy/sell at a future date'}, {id: 'b', text:'Option to buy in the future'}, {id: 'c', text:'Prediction of future prices'}], correct_answer: 'a' },
             ]},
             "203": { title: "Options Practice 2", questions: [
                 { id: 2031, question: "What is a Strike Price?", options: [{id: 'a', text: 'The price the option can be exercised'}, {id: 'b', text:'The current market price'}, {id: 'c', text:'The price when option expires'}], correct_answer: 'a' },
             ]},
             "204": { title: "Futures Practice 2", questions: [
                 { id: 2041, question: "What is Initial Margin?", options: [{id: 'a', text: 'Collateral to open a futures position'}, {id: 'b', text:'First profit made'}, {id: 'c', text:'Initial price of the contract'}], correct_answer: 'a' },
             ]},
             "205": { title: "Derivatives Combo", questions: [
                 { id: 2051, question: "Which derivative involves obligation for both parties?", options: [{id: 'a', text: 'Option'}, {id: 'b', text:'Future'}, {id: 'c', text:'Swap'}], correct_answer: 'b' },
             ]},
             "206": { title: "Final Mock Derivatives", questions: [
                 { id: 2061, question: "What is 'Hedging'?", options: [{id: 'a', text:'Speculating on price movements'}, {id: 'b', text:'Reducing risk of adverse price movements'}, {id: 'c', text:'Arbitraging price differences'}], correct_answer: 'b' },
                 { id: 2062, question: "What is 'Margin' in futures trading?", options: [{id: 'a', text:'Profit from a trade'}, {id: 'b', text:'Brokerage commission'}, {id: 'c', text:'Good faith deposit'}], correct_answer: 'c' },
             ]},
              // Section 3
             "301": { title: "Market Concepts PT 1", questions: [
                 { id: 3011, question: "What is a Bull Market?", options: [{id: 'a', text: 'Prices are rising'}, {id: 'b', text:'Prices are falling'}, {id: 'c', text:'Prices are stagnant'}], correct_answer: 'a' },
             ]},
             "302": { title: "Trading Strategies PT 1", questions: [
                 { id: 3021, question: "What is Short Selling?", options: [{id: 'a', text: 'Selling borrowed shares expecting price drop'}, {id: 'b', text:'Selling shares quickly'}, {id: 'c', text:'Selling shares for a short period'}], correct_answer: 'a' },
             ]},
             "303": { title: "Market Concepts PT 2", questions: [
                 { id: 3031, question: "What is Market Capitalization?", options: [{id: 'a', text: 'Total value of a company\'s shares'}, {id: 'b', text:'Total capital raised by a market'}, {id: 'c', text:'Capital city of a market'}], correct_answer: 'a' },
             ]},
             "304": { title: "Trading Strategies PT 2", questions: [
                 { id: 3041, question: "What is Diversification?", options: [{id: 'a', text: 'Spreading investments across assets'}, {id: 'b', text:'Investing in diverse companies'}, {id: 'c', text:'Changing investment strategy'}], correct_answer: 'a' },
             ]},
             "305": { title: "Equity Valuation Basics", questions: [
                 { id: 3051, question: "What is P/E Ratio?", options: [{id: 'a', text: 'Price-to-Earnings Ratio'}, {id: 'b', text:'Profit-to-Equity Ratio'}, {id: 'c', text:'Potential-Earnings Ratio'}], correct_answer: 'a' },
             ]},
             "306": { title: "Final Mock Equity", questions: [
                 { id: 3061, question: "What is an IPO?", options: [{id: 'a', text:'Initial Public Offering'}, {id: 'b', text:'Internal Profit Operation'}, {id: 'c', text:'Investment Portfolio Option'}], correct_answer: 'a' },
                 { id: 3062, question: "What is a Dividend?", options: [{id: 'a', text:'Distribution of profits to shareholders'}, {id: 'b', text:'A type of bond'}, {id: 'c', text:'A market index'}], correct_answer: 'a' },
             ]},
         };

        const baseData = baseMockQuestions[testId];
        // --- END MOCK API RESPONSE ---

        if (baseData && hasQueryParams) {
           // Simulate user answers based on the base questions
           // Use the score from query params to guide the simulation %
           const simulatedCorrectPercentage = parseInt(score || '70', 10);
           const reviewQuestions = simulateUserAnswers(baseData.questions, simulatedCorrectPercentage);

           // Construct the final result details object
          const result: TestResultDetails = {
            testId: parseInt(testId, 10),
            testTitle: `${baseData.title} Review`, // Make title specific to review
            score: score!, // Use score from query param
            correctAnswers: parseInt(correct!, 10), // Use correct count from query param
            incorrectAnswers: parseInt(incorrect!, 10), // Use incorrect count from query param
            totalQuestions: parseInt(total!, 10), // Use total from query param
            questions: reviewQuestions, // Use the questions with simulated answers
          };
          setResultDetails(result);
        } else {
           console.error(`Base data for test ID ${testId} not found or query params missing.`);
           throw new Error("Result data not found or summary data missing.");
        }
      } catch (err) {
        console.error("Failed to fetch results:", err);
         const message = err instanceof Error ? err.message : "Could not load the test results. Please try again later.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [testId, score, correct, incorrect, total, hasQueryParams]); // Add hasQueryParams dependency


   const getOptionText = (question: ReviewQuestion, optionId: string | number | null): string => {
      if(optionId === null) return "Not Answered";
      const option = question.options.find(opt => opt.id === optionId);
      return option?.text ?? "Unknown Option";
   }

  // Loading State
  if (isLoading) {
    return <ReviewPageLoadingSkeleton />; // Use the dedicated skeleton component
  }

  // Error State
  if (error || !resultDetails) { // Check for resultDetails being null as well
     return (
       <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Alert variant="destructive" className="max-w-lg">
             <AlertTitle>Error Loading Results</AlertTitle>
             <AlertDescription>
                {error || "Could not load result details."} {/* Provide fallback message */}
                 <Button variant="link" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
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

        {/* Questions Review */}
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
                     <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black">
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
                 const isSelected = q.selected_option === option.id;
                 const isCorrectAnswer = q.correct_answer === option.id;
                 let highlightClass = "border-muted bg-background"; // Default

                 // Base styles for correct answer
                 if (isCorrectAnswer) {
                    highlightClass = "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 font-medium";
                 }
                 // Style for user's incorrect selection
                 if (isSelected && !q.is_correct) {
                     highlightClass = "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 line-through"; // Add line-through for wrong answer
                 }
                  // Style for user's correct selection (overrides base correct style if needed, but they are similar)
                 if (isSelected && q.is_correct){
                     highlightClass = "border-green-400 dark:border-green-600 bg-green-100 dark:bg-green-800/40 font-medium ring-2 ring-green-500/50"; // Add ring for emphasis
                 }


                 return (
                   <div key={option.id} className={`p-3 border rounded-md ${highlightClass} transition-colors duration-150`}>
                      {option.text}
                      {isSelected && !q.is_correct && <span className="text-xs font-semibold ml-2 text-red-600 dark:text-red-400"> (Your Answer)</span>}
                       {isSelected && q.is_correct && <span className="text-xs font-semibold ml-2 text-green-700 dark:text-green-400"> (Your Answer)</span>}
                      {isCorrectAnswer && !isSelected && q.selected_option !== null && <span className="text-xs font-semibold ml-2 text-green-700 dark:text-green-400"> (Correct Answer)</span>}
                      {/* Show correct answer if user didn't answer or answered incorrectly */}
                       {isCorrectAnswer && (q.selected_option === null || !q.is_correct) && !isSelected && <span className="text-xs font-semibold ml-2 text-green-700 dark:text-green-400"> (Correct Answer)</span>}
                   </div>
                 );
               })}
                {q.selected_option === null && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-500 font-medium mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700">You did not answer this question. The correct answer is highlighted above.</p>
                )}
                 {/* Explanation Box (Placeholder) */}
                {/*
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-1">Explanation:</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                        {q.explanation || "Explanation for this question would appear here."}
                     </p>
                 </div>
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
        // The Suspense boundary ensures the loading skeleton is shown
        // while the ReviewPageComponent fetches data or handles query params.
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
            <Skeleton className="h-12 w-36" /> {/* Finish Button */}
         </div>
      </div>
    );
}

