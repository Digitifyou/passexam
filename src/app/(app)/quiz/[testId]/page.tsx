"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { TimerIcon, CheckCircle, XCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

// Types (replace with actual types from backend)
interface QuestionOption {
  id: string | number; // Unique ID for the radio item value
  text: string;
}

interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
  correct_answer: string | number; // Matches option.id
}

interface TestDetails {
  id: number;
  title: string;
  test_type: 'practice' | 'final';
  duration?: number; // in seconds for final tests
  questions: Question[];
}

interface Answer {
  questionId: number;
  selectedOption: string | number | null;
  isCorrect?: boolean; // Only used in practice mode for immediate feedback
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;
  const { toast } = useToast();

  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // For final test timer
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch test details and questions
  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call to get_questions.php?id=Y
        console.log(`Fetching test details for ID: ${testId}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

        // --- MOCK API RESPONSE ---
        // Find which mock test corresponds to testId
        const mockTestsDB: Record<string, TestDetails> = {
            // Section 1 Tests
            "101": { id: 101, title: "Practice Test 1", test_type: 'practice', questions: [
                { id: 1011, question: "What does NAV stand for?", options: [{id: 'a', text: 'Net Asset Value'}, {id: 'b', text:'New Account Volume'}, {id: 'c', text:'National Association of Ventures'}], correct_answer: 'a' },
                { id: 1012, question: "Which fund type aims to replicate a market index?", options: [{id: 'a', text:'Actively Managed Fund'}, {id: 'b', text:'Index Fund'}, {id: 'c', text:'Hedge Fund'}], correct_answer: 'b' },
            ]},
             "102": { id: 102, title: "Practice Test 2", test_type: 'practice', questions: [
                { id: 1021, question: "What is an Expense Ratio?", options: [{id: 'a', text: 'Annual fee charged by funds'}, {id: 'b', text:'Ratio of profits to losses'}, {id: 'c', text:'Measure of market volatility'}], correct_answer: 'a' },
            ]},
             "103": { id: 103, title: "Practice Test 3", test_type: 'practice', questions: [
                 { id: 1031, question: "What is a Load Fee?", options: [{id: 'a', text: 'Sales charge on mutual funds'}, {id: 'b', text:'Fee for heavy items'}, {id: 'c', text:'Server load balancer cost'}], correct_answer: 'a' },
             ]},
             "104": { id: 104, title: "Practice Test 4", test_type: 'practice', questions: [
                 { id: 1041, question: "Difference between Open-End and Closed-End funds?", options: [{id: 'a', text: 'Share issuance/redemption'}, {id: 'b', text:'Investment strategy'}, {id: 'c', text:'Fund manager location'}], correct_answer: 'a' },
             ]},
             "105": { id: 105, title: "Practice Test 5", test_type: 'practice', questions: [
                 { id: 1051, question: "What does KYC mean in finance?", options: [{id: 'a', text: 'Know Your Customer'}, {id: 'b', text:'Keep Your Capital'}, {id: 'c', text:'Key Yield Calculation'}], correct_answer: 'a' },
             ]},
             "106": { id: 106, title: "Final Mock Test", test_type: 'final', duration: 60, questions: [ // Short duration for testing
                { id: 1061, question: "What is a primary market?", options: [{id: 'a', text:'Where existing securities are traded'}, {id: 'b', text:'Where new securities are issued'}, {id: 'c', text:'A type of supermarket'}], correct_answer: 'b' },
                { id: 1062, question: "What is SIP?", options: [{id: 'a', text:'Stock Incentive Plan'}, {id: 'b', text:'Systematic Investment Plan'}, {id: 'c', text:'Securities Issuance Protocol'}], correct_answer: 'b' },
                { id: 1063, question: "Which document is used in IPO filing?", options: [{id: 'a', text:"Red Herring Prospectus"}, {id: 'b', text:"NAV Statement"}, {id: 'c', text:"Offer Note"}, {id: 'd', text:"KYC Form"}], correct_answer: "a" }
            ]},
            // Section 2 Tests
             "201": { id: 201, title: "Options Practice 1", test_type: 'practice', questions: [
                { id: 2011, question: "What gives the buyer the right, but not the obligation, to buy an asset?", options: [{id: 'a', text:'Put Option'}, {id: 'b', text:'Call Option'}, {id: 'c', text:'Future Contract'}], correct_answer: 'b' },
             ]},
             "202": { id: 202, title: "Futures Practice 1", test_type: 'practice', questions: [
                 { id: 2021, question: "What is a Futures Contract?", options: [{id: 'a', text: 'Agreement to buy/sell at a future date'}, {id: 'b', text:'Option to buy in the future'}, {id: 'c', text:'Prediction of future prices'}], correct_answer: 'a' },
             ]},
             "203": { id: 203, title: "Options Practice 2", test_type: 'practice', questions: [
                 { id: 2031, question: "What is a Strike Price?", options: [{id: 'a', text: 'The price the option can be exercised'}, {id: 'b', text:'The current market price'}, {id: 'c', text:'The price when option expires'}], correct_answer: 'a' },
             ]},
             "204": { id: 204, title: "Futures Practice 2", test_type: 'practice', questions: [
                 { id: 2041, question: "What is Initial Margin?", options: [{id: 'a', text: 'Collateral to open a futures position'}, {id: 'b', text:'First profit made'}, {id: 'c', text:'Initial price of the contract'}], correct_answer: 'a' },
             ]},
             "205": { id: 205, title: "Derivatives Combo", test_type: 'practice', questions: [
                 { id: 2051, question: "Which derivative involves obligation for both parties?", options: [{id: 'a', text: 'Option'}, {id: 'b', text:'Future'}, {id: 'c', text:'Swap'}], correct_answer: 'b' }, // Futures and Swaps both have obligations, picking one
             ]},
              "206": { id: 206, title: "Final Mock Derivatives", test_type: 'final', duration: 90, questions: [
                 { id: 2061, question: "What is 'Hedging'?", options: [{id: 'a', text:'Speculating on price movements'}, {id: 'b', text:'Reducing risk of adverse price movements'}, {id: 'c', text:'Arbitraging price differences'}], correct_answer: 'b' },
                 { id: 2062, question: "What is 'Margin' in futures trading?", options: [{id: 'a', text:'Profit from a trade'}, {id: 'b', text:'Brokerage commission'}, {id: 'c', text:'Good faith deposit'}], correct_answer: 'c' },
             ]},
            // Section 3 Tests
             "301": { id: 301, title: "Market Concepts PT 1", test_type: 'practice', questions: [
                 { id: 3011, question: "What is a Bull Market?", options: [{id: 'a', text: 'Prices are rising'}, {id: 'b', text:'Prices are falling'}, {id: 'c', text:'Prices are stagnant'}], correct_answer: 'a' },
             ]},
             "302": { id: 302, title: "Trading Strategies PT 1", test_type: 'practice', questions: [
                 { id: 3021, question: "What is Short Selling?", options: [{id: 'a', text: 'Selling borrowed shares expecting price drop'}, {id: 'b', text:'Selling shares quickly'}, {id: 'c', text:'Selling shares for a short period'}], correct_answer: 'a' },
             ]},
             "303": { id: 303, title: "Market Concepts PT 2", test_type: 'practice', questions: [
                 { id: 3031, question: "What is Market Capitalization?", options: [{id: 'a', text: 'Total value of a company\'s shares'}, {id: 'b', text:'Total capital raised by a market'}, {id: 'c', text:'Capital city of a market'}], correct_answer: 'a' },
             ]},
             "304": { id: 304, title: "Trading Strategies PT 2", test_type: 'practice', questions: [
                 { id: 3041, question: "What is Diversification?", options: [{id: 'a', text: 'Spreading investments across assets'}, {id: 'b', text:'Investing in diverse companies'}, {id: 'c', text:'Changing investment strategy'}], correct_answer: 'a' },
             ]},
             "305": { id: 305, title: "Equity Valuation Basics", test_type: 'practice', questions: [
                 { id: 3051, question: "What is P/E Ratio?", options: [{id: 'a', text: 'Price-to-Earnings Ratio'}, {id: 'b', text:'Profit-to-Equity Ratio'}, {id: 'c', text:'Potential-Earnings Ratio'}], correct_answer: 'a' },
             ]},
             "306": { id: 306, title: "Final Mock Equity", test_type: 'final', duration: 120, questions: [
                 { id: 3061, question: "What is an IPO?", options: [{id: 'a', text:'Initial Public Offering'}, {id: 'b', text:'Internal Profit Operation'}, {id: 'c', text:'Investment Portfolio Option'}], correct_answer: 'a' },
                 { id: 3062, question: "What is a Dividend?", options: [{id: 'a', text:'Distribution of profits to shareholders'}, {id: 'b', text:'A type of bond'}, {id: 'c', text:'A market index'}], correct_answer: 'a' },
             ]},
        };

         const fetchedTest = mockTestsDB[testId];
        // --- END MOCK API RESPONSE ---

        if (fetchedTest) {
          setTestDetails(fetchedTest);
          // Initialize answers state
          const initialAnswers: Record<number, Answer> = {};
          fetchedTest.questions.forEach(q => {
            initialAnswers[q.id] = { questionId: q.id, selectedOption: null };
          });
          setAnswers(initialAnswers);
          // Start timer for final tests
          if (fetchedTest.test_type === 'final' && fetchedTest.duration) {
            setTimeLeft(fetchedTest.duration);
          }
        } else {
          console.error(`Test data for ID ${testId} not found in mock DB.`);
          throw new Error(`Test with ID ${testId} could not be loaded.`); // More specific error
        }
      } catch (err) {
        console.error("Failed to fetch test:", err);
        // Use the error message thrown or a generic one
        const message = err instanceof Error ? err.message : "Could not load the test. Please go back and try again.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

   // Timer logic for final tests
  useEffect(() => {
    if (testDetails?.test_type !== 'final' || timeLeft === null || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null || prevTime <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testDetails, timeLeft]); // Rerun when testDetails loads or timeLeft changes

  const handleTimeUp = () => {
    toast({
      variant: "destructive",
      title: "Time's Up!",
      description: "Submitting your answers automatically.",
    });
    handleSubmit();
  };


  const handleAnswerSelect = (questionId: number, selectedOption: string | number) => {
    const currentQuestion = testDetails?.questions.find(q => q.id === questionId);
    if (!currentQuestion) return;

    let isCorrect: boolean | undefined = undefined;
    if (testDetails?.test_type === 'practice') {
      isCorrect = selectedOption === currentQuestion.correct_answer;
      toast({
         title: isCorrect ? "Correct!" : "Incorrect",
         description: isCorrect ? "Well done!" : `The correct answer was: ${getOptionText(currentQuestion.correct_answer)}`,
         variant: isCorrect ? "default" : "destructive",
         duration: 3000,
      });
    }

    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, selectedOption, isCorrect },
    }));
  };

   const getOptionText = (optionId: string | number): string => {
    const question = testDetails?.questions[currentQuestionIndex];
    const option = question?.options.find(opt => opt.id === optionId);
    return option?.text || "Unknown";
   }

  const goToNextQuestion = () => {
    if (testDetails && currentQuestionIndex < testDetails.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

   const goToQuestion = (index: number) => {
     if (testDetails && index >= 0 && index < testDetails.questions.length) {
       setCurrentQuestionIndex(index);
     }
   };

  const handleSubmit = useCallback(async () => {
     if (isSubmitting || !testDetails) return; // Added check for testDetails
     setIsSubmitting(true);
     setShowSubmitConfirm(false); // Close confirmation dialog

     console.log("Submitting answers:", answers);

     try {
       // TODO: Replace with actual API call to submit_answers.php
       // The API should calculate the score and return results
       await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate submission

       // --- MOCK RESULT CALCULATION ---
       let correctCount = 0;
       let incorrectCount = 0;
       testDetails.questions.forEach(q => { // Use testDetails directly
         const userAnswer = answers[q.id];
         if (userAnswer?.selectedOption !== null && userAnswer?.selectedOption !== undefined) { // Check for undefined too
            if (userAnswer.selectedOption === q.correct_answer) {
                correctCount++;
            } else {
                incorrectCount++;
            }
         } else {
            incorrectCount++; // Count unanswered as incorrect
         }
         // Note: In a real scenario, is_correct would be set by the backend
         // For practice mode, it's already set. For final, backend calculates.
         // We might need to update `answers` state here based on backend response if needed.
       });
       const totalQuestions = testDetails.questions.length; // Use testDetails directly
       const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

       const mockResult = {
         score: score.toFixed(0),
         correctAnswers: correctCount,
         incorrectAnswers: totalQuestions - correctCount, // Calculate incorrect based on total and correct
         totalQuestions: totalQuestions,
         // The full review data would likely come from this API or a separate get_results.php call
         // For now, we'll pass the necessary data directly to the review page via state or query params
       };
        // --- END MOCK RESULT CALCULATION ---


       toast({
         title: "Test Submitted!",
         description: `Your score: ${mockResult.score}%`,
       });

       // Redirect to Review Page (pass necessary data)
       // Using query params is simpler for this example
       // In a real app, you might store results server-side and just pass the result ID
        router.push(`/review/${testId}?score=${mockResult.score}&correct=${mockResult.correctAnswers}&incorrect=${mockResult.incorrectAnswers}&total=${mockResult.totalQuestions}`);

       // Alternatively, pass state (might not work reliably across full page reloads)
       // router.push({
       //   pathname: `/review/${testId}`,
       //   query: { /* results data */ },
       // });

     } catch (err) {
        console.error("Failed to submit answers:", err);
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Could not submit your answers. Please try again.",
        });
        setIsSubmitting(false);
     }

  }, [answers, isSubmitting, router, testId, testDetails, toast]);


   // Format time left for display
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
         <Skeleton className="h-8 w-3/4 mb-6" />
         <Card>
           <CardHeader>
             <Skeleton className="h-6 w-1/2 mb-2"/>
              <Skeleton className="h-4 w-1/4"/>
           </CardHeader>
           <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <div className="space-y-3 pt-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </div>
           </CardContent>
           <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
           </CardFooter>
         </Card>
      </div>
    );
  }

  // Error state
  if (error || !testDetails) { // Add check for !testDetails here too
    return (
       <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Alert variant="destructive" className="max-w-lg">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error Loading Test</AlertTitle>
             <AlertDescription>
                {error || "Test data could not be loaded."} {/* Provide a default message if error is null but testDetails is still null */}
                <Button variant="link" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
             </AlertDescription>
          </Alert>
       </div>
    );
  }

  // Quiz display
  const currentQuestion = testDetails.questions[currentQuestionIndex]; // Safe to access directly now
  const currentAnswer = answers[currentQuestion.id]; // Safe to access directly now
  const progress = ((currentQuestionIndex + 1) / testDetails.questions.length) * 100;
  const isPractice = testDetails.test_type === 'practice';
  const isFinal = testDetails.test_type === 'final';
  const isLastQuestion = currentQuestionIndex === testDetails.questions.length - 1;

  return (
     <div className="container py-8">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{testDetails.title}</h1>
            {isFinal && timeLeft !== null && (
                <div className={`flex items-center space-x-2 p-2 rounded-md ${timeLeft < 60 ? 'text-destructive font-semibold animate-pulse' : 'text-muted-foreground'}`}>
                    <TimerIcon className="h-5 w-5" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            )}
        </div>

       <Progress value={progress} className="mb-6 h-2" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Question Panel (Navigator) */}
          <Card className="md:col-span-1 h-fit sticky top-20 hidden md:block">
              <CardHeader>
                  <CardTitle>Questions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-5 gap-2">
                  {testDetails.questions.map((q, index) => {
                      const answered = answers[q.id]?.selectedOption !== null && answers[q.id]?.selectedOption !== undefined; // Check for undefined too
                      const isCurrent = index === currentQuestionIndex;
                      let statusClass = "bg-secondary hover:bg-muted"; // Default
                      if(isCurrent) statusClass = "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2";
                      else if (answered) statusClass = "bg-accent/50 hover:bg-accent/70 border border-accent";

                      return (
                          <Button
                              key={q.id}
                              variant="outline"
                              size="icon"
                              className={`h-9 w-9 rounded-full ${statusClass}`}
                              onClick={() => goToQuestion(index)}
                              aria-label={`Go to question ${index + 1}`}
                          >
                              {index + 1}
                          </Button>
                      );
                  })}
              </CardContent>
          </Card>

          {/* Main Quiz Area */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Question {currentQuestionIndex + 1} of {testDetails.questions.length}</CardTitle>
                <CardDescription className="pt-4 text-lg text-foreground">
                  {currentQuestion.question}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={currentAnswer?.selectedOption?.toString() ?? ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                  className="space-y-3"
                  // Disable options if it's practice mode and answer is already given
                  disabled={isPractice && currentAnswer?.selectedOption !== null && currentAnswer?.selectedOption !== undefined} // Check for undefined
                >
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentAnswer?.selectedOption === option.id;
                    const isCorrectAnswer = currentQuestion.correct_answer === option.id;
                    let optionStateClass = "";
                     const isAnsweredInPractice = isPractice && currentAnswer?.selectedOption !== null && currentAnswer?.selectedOption !== undefined; // Check for undefined

                    // Apply styling only in practice mode *after* an answer is selected
                    if (isAnsweredInPractice) {
                       if (isSelected) {
                           optionStateClass = currentAnswer.isCorrect ? "border-green-500 bg-green-100/50 dark:bg-green-900/30" : "border-red-500 bg-red-100/50 dark:bg-red-900/30";
                       } else if (isCorrectAnswer) {
                           optionStateClass = "border-green-500 bg-green-100/50 dark:bg-green-900/30"; // Highlight correct if user chose wrong
                       }
                    }

                    return (
                      <Label
                        key={option.id}
                        htmlFor={`option-${option.id}`}
                        className={`flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors ${optionStateClass} ${isAnsweredInPractice ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                        <span>{option.text}</span>
                         {/* Optional: Show check/cross in practice mode */}
                         {isAnsweredInPractice && isSelected && (
                             currentAnswer.isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 ml-auto" /> : <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                         )}
                         {isAnsweredInPractice && !isSelected && isCorrectAnswer && (
                            <CheckCircle className="h-5 w-5 text-green-600 ml-auto opacity-70" /> // Mark correct answer if user was wrong
                         )}
                      </Label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                 {isLastQuestion ? (
                    <Button
                        onClick={() => setShowSubmitConfirm(true)}
                        className="bg-primary hover:bg-primary/90" // Use primary for submit button
                        disabled={isSubmitting}
                    >
                       {isSubmitting ? "Submitting..." : "Submit Test"}
                    </Button>
                 ) : (
                    <Button onClick={goToNextQuestion} disabled={isSubmitting}>
                       Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                 )}
              </CardFooter>
            </Card>
           </div>
        </div>

       {/* Submit Confirmation Dialog */}
        <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit your test?</AlertDialogTitle>
              <AlertDialogDescription>
                 Are you sure you want to submit your answers? You won't be able to change them after submission.
                 {isFinal && timeLeft !== null && <span className="block mt-2">Time remaining: {formatTime(timeLeft)}</span>}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                 {isSubmitting ? "Submitting..." : "Confirm Submit"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
     </div>
  );
}

