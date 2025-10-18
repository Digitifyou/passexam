"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Import AlertDialogCancel & AlertDialogTrigger
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { TimerIcon, ChevronLeft, ChevronRight, AlertCircle, LogOut } from 'lucide-react'; // Import LogOut icon
import { cn } from "@/lib/utils";

// Types
interface QuestionOption {
  id: string | number;
  text: string;
}

interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
  correct_answer: string | number;
}

interface TestDetails {
  id: number;
  title: string;
  test_type: 'practice' | 'final';
  duration?: number;
  questions: Question[];
}

interface Answer {
  questionId: number;
  selectedOption: string | number | null;
}

const shuffleArray = <T>(array: T[]): T[] => {
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
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false); // State for exit confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !testId) return;

    const fetchTest = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/quiz/${testId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch test details');
        }
        const fetchedTest: TestDetails = await response.json();

        let selectedQuestions: Question[] = [];
        if (fetchedTest.questions && fetchedTest.questions.length > 0) {
          const shuffledAll = shuffleArray([...fetchedTest.questions]);
          // Adjust count based on test type - standard practice now
          const targetQuestionCount = fetchedTest.test_type === 'final' ? 50 : 25;
          // Ensure we don't try to slice more than available questions
          selectedQuestions = shuffledAll.slice(0, Math.min(targetQuestionCount, shuffledAll.length));

          if (selectedQuestions.length < targetQuestionCount && fetchedTest.questions.length < targetQuestionCount) {
             console.warn(`Warning: Test ID ${testId} has only ${fetchedTest.questions.length} questions, less than the target ${targetQuestionCount}. Using all available.`);
          } else if (selectedQuestions.length === 0) {
             throw new Error(`No questions available or selected for test ID ${testId}.`);
          }

        } else {
            setError(`Test data for ID ${testId} is missing questions.`);
            setIsLoading(false);
            return;
        }

        setTestDetails(fetchedTest);
        setShuffledQuestions(selectedQuestions); // Set the potentially smaller subset

        const initialAnswers: Record<number, Answer> = {};
        selectedQuestions.forEach(q => {
          initialAnswers[q.id] = { questionId: q.id, selectedOption: null };
        });
        setAnswers(initialAnswers);

        if (fetchedTest.test_type === 'final' && fetchedTest.duration) {
          setTimeLeft(fetchedTest.duration);
        }
      } catch (err) {
        console.error("Failed to load test:", err);
        const message = err instanceof Error ? err.message : "Could not load the test.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId, isClient]);

  useEffect(() => {
    if (testDetails?.test_type !== 'final' || timeLeft === null || timeLeft <= 0 || isLoading || !isClient) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null || prevTime <= 1) {
          clearInterval(timer);
          if (!isSubmitting) {
             handleTimeUp();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testDetails, timeLeft, isLoading, isSubmitting, isClient]);


  const handleTimeUp = () => {
    if (isSubmitting) return;
    toast({
      variant: "destructive",
      title: "Time's Up!",
      description: "Submitting your answers automatically.",
    });
    handleSubmit();
  };

  const handleAnswerSelect = (questionId: number, selectedOption: string | number) => {
    if (questionId === undefined || questionId === null) return;
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
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (shuffledQuestions && index >= 0 && index < shuffledQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleExit = () => {
    setShowExitConfirm(false); // Close the dialog
    router.push('/dashboard'); // Navigate back
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !testDetails || !shuffledQuestions || shuffledQuestions.length === 0) return;

    setIsSubmitting(true);
    setShowSubmitConfirm(false);

    // Make sure 'answers' only includes answers for the questions actually presented
    const relevantAnswers = Object.values(answers).filter(ans =>
        shuffledQuestions.some(q => q.id === ans.questionId)
    );

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send only relevant answers and the exact questions presented
        body: JSON.stringify({ testId, answers: relevantAnswers, shuffledQuestions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit the quiz');
      }

      const result = await response.json();

      toast({
        title: "Test Submitted!",
        description: `Your score: ${result.score}%`,
      });

        // Pass the actual number of questions SUBMITTED to the review page
        // which is shuffledQuestions.length in this context
      router.push(`/review/${testId}?score=${result.score}&correct=${result.correctAnswers}&incorrect=${result.incorrectAnswers}&total=${shuffledQuestions.length}`);
    } catch (err) {
      console.error("Failed to submit answers:", err);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Could not submit your answers. Please try again.",
      });
      setIsSubmitting(false); // Allow retry on failure
    }
   // Removed setIsSubmitting(false) from finally block as navigation handles it
  }, [answers, isSubmitting, router, testId, testDetails, shuffledQuestions, toast]);


  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    if (seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading || !isClient) {
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

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  if (!currentQuestion || currentQuestion.id === undefined || currentQuestion.id === null) {
      // More specific error or handling if a question is invalid
      console.error("Invalid current question data:", currentQuestion, "at index", currentQuestionIndex);
      setError("Error displaying the current question due to invalid data.");
       // Render error state again
       return (
        <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quiz Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="link" className="p-0 h-auto mt-2 text-destructive dark:text-destructive" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
  const isFinal = testDetails.test_type === 'final';
  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;

  return (
    <div className="container py-8">
      {/* Header and Timer */}
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

       {/* Main Grid: Question Navigator + Question Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* --- Question Navigator (Side Panel) --- */}
        <Card className="md:col-span-1 h-fit sticky top-20 hidden md:block">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-2">
            {shuffledQuestions.map((q, index) => {
              // Ensure q and q.id are valid before proceeding
              const questionIdValid = q && q.id !== undefined && q.id !== null;
              // Check if the valid question has been answered
              const answered = questionIdValid && answers[q.id]?.selectedOption !== null && answers[q.id]?.selectedOption !== undefined;
              const isCurrent = index === currentQuestionIndex;

              // Determine button variant based on state
              let variant: "default" | "secondary" | "outline" | "accent" | "ghost" | "link" | null | undefined = "outline";
              if (isCurrent) {
                variant = "default"; // Highlight current question strongly
              } else if (answered) {
                 // Use a distinct style for answered questions, e.g., 'secondary' or a custom style via `cn`
                 variant = "secondary"; // Or use 'accent' if you prefer that color
              }

              // Additional classes for visual cues
              const additionalClasses = isCurrent
                ? "ring-2 ring-ring ring-offset-2" // Ring for current
                : answered
                ? "border-primary/50" // Subtle border for answered
                : "";

              return (
                <Button
                  key={questionIdValid ? q.id : `invalid-q-${index}`} // Use index as fallback key
                  variant={variant}
                  size="icon"
                  className={`h-9 w-9 rounded-full transition-all duration-150 ${additionalClasses} ${!questionIdValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => questionIdValid && goToQuestion(index)}
                  aria-label={`Go to question ${index + 1}`}
                  disabled={isSubmitting || !questionIdValid} // Disable if submitting or question data invalid
                >
                  {index + 1}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* --- Question Display Card --- */}
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
                 // Use currentQuestion.id safely now after validation
                value={currentAnswer?.selectedOption?.toString() ?? ""}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                className="space-y-3"
                disabled={isSubmitting || timeLeft === 0} // Disable group if submitting or time up
              >
                {/* Ensure options exist and map */}
                {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={`option-${option.id}`}
                    className={cn(
                      "flex items-center space-x-3 p-4 border rounded-md transition-colors duration-150",
                      "hover:bg-accent/50 dark:hover:bg-accent/30",
                      // Highlight checked state more clearly
                      "has-[:checked]:bg-primary/10 has-[:checked]:border-primary has-[:checked]:dark:bg-primary/20",
                       // Apply disabled styles based on state
                       (isSubmitting || timeLeft === 0) ? "cursor-not-allowed opacity-60 bg-muted/50" : "cursor-pointer"
                    )}
                  >
                    <RadioGroupItem
                      value={option.id.toString()}
                      id={`option-${option.id}`}
                       // Disable individual items too
                       disabled={isSubmitting || timeLeft === 0}
                    />
                    <span>{option.text}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
             <CardFooter className="flex justify-between items-center flex-wrap gap-2"> {/* Added flex-wrap and gap */}
                {/* Exit Quiz Button and Dialog */}
                 <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                    <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isSubmitting} // Disable if submitting
                         >
                          <LogOut className="mr-2 h-4 w-4" /> Exit Quiz
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Are you sure you want to exit? Your progress will not be saved.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleExit} className="bg-destructive hover:bg-destructive/90">
                            Confirm Exit
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Navigation Buttons */}
                <div className="flex gap-2"> {/* Group navigation buttons */}
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
                        className="bg-primary hover:bg-primary/90"
                        disabled={isSubmitting || timeLeft === 0} // Disable if submitting or time is up
                    >
                        {isSubmitting ? "Submitting..." : "Submit Test"}
                    </Button>
                    ) : (
                    <Button onClick={goToNextQuestion} disabled={isSubmitting}>
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    )}
                </div>
            </CardFooter>
          </Card>
        </div>
      </div>

       {/* Submit Confirmation Dialog */}
       <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
            {/* Removed Trigger as it's manually controlled by state */}
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
                <AlertDialogCancel onClick={() => setShowSubmitConfirm(false)} disabled={isSubmitting}>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                 {isSubmitting ? "Submitting..." : "Confirm Submit"}
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}