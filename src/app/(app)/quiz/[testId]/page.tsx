
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
import { TimerIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import quizData from '@/data/quiz-questions.json'; // Import the JSON data

// Types (replace with actual types from backend or derive from JSON structure)
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

// Updated Answer type
interface Answer {
  questionId: number;
  selectedOption: string | number | null;
}

// Type assertion for the imported JSON data
const testsDatabase: Record<string, TestDetails> = quizData;

// Helper function to shuffle an array (Fisher-Yates)
// Ensures the shuffling happens client-side after hydration
const shuffleArray = <T>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};


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
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]); // Store shuffled subset

  // Fetch test details and select questions
  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      setIsLoading(true);
      setError(null);
      setTestDetails(null); // Reset details on new fetch
      setShuffledQuestions([]); // Reset questions
      setAnswers({}); // Reset answers
      setCurrentQuestionIndex(0); // Reset index
      setTimeLeft(null); // Reset timer

      try {
        // Simulate async loading if needed
        await new Promise(resolve => setTimeout(resolve, 50));

        const fetchedTest = testsDatabase[testId];

        if (fetchedTest) {
           // --- Question Selection Logic ---
           let selectedQuestions: Question[] = [];
           if (fetchedTest.questions && Array.isArray(fetchedTest.questions) && fetchedTest.questions.length > 0) {
             const allQuestions = fetchedTest.questions;
             // Ensure shuffle happens client-side
             const shuffledAll = shuffleArray([...allQuestions]);
             const targetQuestionCount = fetchedTest.test_type === 'final' ? 50 : 25;

             if (shuffledAll.length >= targetQuestionCount) {
               selectedQuestions = shuffledAll.slice(0, targetQuestionCount);
               console.log(`Selected ${targetQuestionCount} random questions for ${fetchedTest.test_type} test ID ${testId}.`);
             } else {
               console.warn(`Test ID ${testId} (${fetchedTest.test_type}) has only ${shuffledAll.length} questions, less than the target ${targetQuestionCount}. Using all available ${shuffledAll.length} questions.`);
               selectedQuestions = shuffledAll; // Use all available shuffled questions
             }
           } else {
               console.warn(`Test data for ID ${testId} has no questions or questions are not in the expected format.`);
               setError(`Test data for ID ${testId} has no questions.`);
               setIsLoading(false);
               return; // Stop further processing
           }

           // Update test details state with the base info
           setTestDetails({
               ...fetchedTest,
               questions: [], // Initially empty, will be set by shuffledQuestions state
           });

           // Set the selected shuffled questions state
           setShuffledQuestions(selectedQuestions);

            // --- End Question Selection Logic ---

          // Initialize answers state based on the *selected* questions
          const initialAnswers: Record<number, Answer> = {};
           if (selectedQuestions.length > 0) {
              selectedQuestions.forEach(q => {
                initialAnswers[q.id] = { questionId: q.id, selectedOption: null };
              });
           }
           setAnswers(initialAnswers);

          // Start timer for final tests
          if (fetchedTest.test_type === 'final' && fetchedTest.duration) {
             // Use duration from original fetched data, not the potentially modified testDetails
             // Use a default duration if not specified but it's a final test
             const duration = fetchedTest.duration || 3600; // Default 1 hour if duration missing for final
            setTimeLeft(duration);
          }
        } else {
          console.error(`Test data for ID ${testId} not found in JSON data.`);
           setError(`Test details for ID ${testId} not found. Please return to the dashboard.`);
        }
      } catch (err) {
        console.error("Failed to load test:", err);
        const message = err instanceof Error ? err.message : "Could not load the test. Please go back and try again.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId]); // Only depends on testId

   // Timer logic for final tests
  useEffect(() => {
     // Ensure we have testDetails *and* a valid timeLeft to start the timer
    if (testDetails?.test_type !== 'final' || timeLeft === null || timeLeft <= 0 || isLoading) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null || prevTime <= 1) {
          clearInterval(timer);
          // Check if submission hasn't already started (e.g., by manual submit near timeout)
          if (!isSubmitting) {
             handleTimeUp();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on unmount or dependency change
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testDetails, timeLeft, isLoading, isSubmitting]); // Add isLoading and isSubmitting dependencies

  const handleTimeUp = () => {
    if (isSubmitting) return; // Prevent duplicate submissions
    toast({
      variant: "destructive",
      title: "Time's Up!",
      description: "Submitting your answers automatically.",
    });
    handleSubmit(); // Auto-submit
  };


  const handleAnswerSelect = (questionId: number, selectedOption: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, selectedOption },
    }));
  };


  const goToNextQuestion = () => {
    if (shuffledQuestions && currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1); // Corrected logic to decrement
    }
  };

   const goToQuestion = (index: number) => {
     if (shuffledQuestions && index >= 0 && index < shuffledQuestions.length) {
       setCurrentQuestionIndex(index);
     }
   };

  const handleSubmit = useCallback(async () => {
     // Check if already submitting, or if crucial data is missing
     if (isSubmitting || !testDetails || !shuffledQuestions || shuffledQuestions.length === 0) {
          console.warn("Submission prevented: Already submitting or missing data.");
          return;
     }
     setIsSubmitting(true);
     setShowSubmitConfirm(false); // Close confirmation dialog

     console.log("Submitting answers:", answers);

     try {
       // Simulate submission delay
       await new Promise(resolve => setTimeout(resolve, 500));

       // --- CLIENT-SIDE RESULT CALCULATION ---
       let correctCount = 0;
       shuffledQuestions.forEach(q => {
         const userAnswer = answers[q.id];
         if (userAnswer?.selectedOption !== null && userAnswer?.selectedOption !== undefined) {
            if (String(userAnswer.selectedOption) === String(q.correct_answer)) {
                correctCount++;
            }
         }
       });
       const totalQuestions = shuffledQuestions.length; // Use the actual count of displayed questions
       const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

       const result = {
         score: score.toString(),
         correctAnswers: correctCount,
         incorrectAnswers: totalQuestions - correctCount,
         totalQuestions: totalQuestions,
       };
        // --- END CLIENT-SIDE RESULT CALCULATION ---


       toast({
         title: "Test Submitted!",
         description: `Your score: ${result.score}%`,
       });

       // Redirect to Review Page (pass necessary data)
       // Ensure all params are correctly passed
       router.push(`/review/${testId}?score=${result.score}&correct=${result.correctAnswers}&incorrect=${result.incorrectAnswers}&total=${result.totalQuestions}`);


     } catch (err) {
        console.error("Failed to submit answers:", err);
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Could not submit your answers. Please try again.",
        });
        setIsSubmitting(false); // Ensure submitting state is reset only on error within try block
     } finally {
         //setIsSubmitting(false); // Setting isSubmitting=false here might cause issues if redirect is fast
         // It's generally safer to let the component unmount or reset state on error.
         // If staying on the page after submission was possible, reset here.
     }

  }, [answers, isSubmitting, router, testId, testDetails, shuffledQuestions, toast]); // Added shuffledQuestions dependency


   // Format time left for display
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    if (seconds < 0) return '00:00'; // Handle potential negative values if timer logic has issues
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

  // Error state or no questions loaded state
   if (error || !testDetails || !shuffledQuestions || shuffledQuestions.length === 0) {
     const errorMessage = error || (testDetails && (!shuffledQuestions || shuffledQuestions.length === 0) ? "No questions were selected for this test." : "Test data could not be loaded.");
     return (
        <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
           <Alert variant="destructive" className="max-w-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Test</AlertTitle>
              <AlertDescription>
                 {errorMessage}
                 <Button variant="link" className="p-0 h-auto mt-2 text-destructive dark:text-destructive" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
              </AlertDescription>
           </Alert>
        </div>
     );
   }

  // Quiz display - Ensure currentQuestion is accessed safely
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  // Handle case where currentQuestion might be undefined briefly during state transitions
  if (!currentQuestion) {
     // Optionally return a specific loading state or null
     return <div className="container py-8 text-center">Loading question...</div>;
   }

  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  const isFinal = testDetails.test_type === 'final';
  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;

  return (
     <div className="container py-8">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{testDetails.title}</h1>
            {isFinal && timeLeft !== null && (
                 <div className={`flex items-center space-x-2 p-2 rounded-md font-mono text-lg tabular-nums ${timeLeft <= 60 && timeLeft > 0 ? 'text-destructive font-semibold animate-pulse' : timeLeft === 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
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
              <CardContent className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-2">
                  {shuffledQuestions.map((q, index) => {
                      const answered = answers[q.id]?.selectedOption !== null && answers[q.id]?.selectedOption !== undefined;
                      const isCurrent = index === currentQuestionIndex;
                       // Determine button styles based on state
                       const variant: "default" | "secondary" | "outline" | "accent" = isCurrent
                         ? "default" // Primary color for current
                         : answered
                         ? "accent" // Accent color for answered (use accent theme color)
                         : "outline"; // Outline for unanswered

                       const additionalClasses = isCurrent ? "ring-2 ring-ring ring-offset-2" : answered ? "border-accent-foreground/50" : "";


                      return (
                          <Button
                              key={q.id}
                              variant={variant}
                              size="icon"
                              className={`h-9 w-9 rounded-full transition-all duration-150 ${additionalClasses} `}
                              onClick={() => goToQuestion(index)}
                              aria-label={`Go to question ${index + 1}`}
                              disabled={isSubmitting} // Disable navigation buttons while submitting
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
                <CardTitle>Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</CardTitle>
                <CardDescription className="pt-4 text-lg text-foreground">
                  {currentQuestion.question}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={currentAnswer?.selectedOption?.toString() ?? ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                  className="space-y-3"
                  disabled={isSubmitting} // Disable interaction while submitting
                >
                  {currentQuestion.options.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`option-${option.id}`}
                        className={cn(
                           "flex items-center space-x-3 p-4 border rounded-md transition-colors duration-150",
                           "hover:bg-accent/50 dark:hover:bg-accent/30", // Hover effect
                           "has-[:checked]:bg-primary/10 has-[:checked]:border-primary has-[:checked]:dark:bg-primary/20", // Checked state
                           isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer' // Disabled state
                         )}
                      >
                        <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} disabled={isSubmitting} />
                        <span>{option.text}</span>
                      </Label>
                    )
                  )}
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
                        className="bg-primary hover:bg-primary/90" // Consistent primary button style
                        disabled={isSubmitting || timeLeft === 0} // Disable if submitting or time is up
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
                 {isFinal && timeLeft !== null && timeLeft > 0 && <span className="block mt-2">Time remaining: {formatTime(timeLeft)}</span>}
                 {isFinal && timeLeft !== null && timeLeft <= 0 && <span className="block mt-2 font-semibold text-destructive">Time is up! Your answers will be submitted.</span>}
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
