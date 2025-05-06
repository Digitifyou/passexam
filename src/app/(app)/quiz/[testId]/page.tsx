
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

  // Fetch test details and questions from JSON
  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate async loading if needed (e.g., for potential future API calls)
        await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay

        const fetchedTest = testsDatabase[testId];

        if (fetchedTest) {
          setTestDetails(fetchedTest);
          // Initialize answers state only if questions exist
          const initialAnswers: Record<number, Answer> = {};
          if (fetchedTest.questions && Array.isArray(fetchedTest.questions)) {
              fetchedTest.questions.forEach(q => {
                initialAnswers[q.id] = { questionId: q.id, selectedOption: null };
              });
          } else {
             console.warn(`Test data for ID ${testId} has no questions.`);
             // You might want to set an error or handle this case differently
          }
          setAnswers(initialAnswers);
          // Start timer for final tests
          if (fetchedTest.test_type === 'final' && fetchedTest.duration) {
            setTimeLeft(fetchedTest.duration);
          }
        } else {
          console.error(`Test data for ID ${testId} not found in JSON data.`);
          setError(`Test details for ID ${testId} not found. Please return to the dashboard.`);
        }
      } catch (err) {
        console.error("Failed to load test:", err);
        // Use the error message if it's an Error instance, otherwise use a generic message
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
    handleSubmit(); // No await needed, handleSubmit is async but we don't wait for it here
  };


  const handleAnswerSelect = (questionId: number, selectedOption: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, selectedOption },
    }));
  };


  const goToNextQuestion = () => {
    if (testDetails && testDetails.questions && currentQuestionIndex < testDetails.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

   const goToQuestion = (index: number) => {
     if (testDetails && testDetails.questions && index >= 0 && index < testDetails.questions.length) {
       setCurrentQuestionIndex(index);
     }
   };

  const handleSubmit = useCallback(async () => {
     if (isSubmitting || !testDetails || !testDetails.questions) return;
     setIsSubmitting(true);
     setShowSubmitConfirm(false); // Close confirmation dialog

     console.log("Submitting answers:", answers);

     try {
       // TODO: Replace with actual API call to submit_answers.php (if needed)
       // The API should calculate the score and return results, or calculation can happen client-side
       // For now, calculation happens client-side after simulated delay
       await new Promise(resolve => setTimeout(resolve, 500)); // Simulate submission delay

       // --- CLIENT-SIDE RESULT CALCULATION ---
       let correctCount = 0;
       testDetails.questions.forEach(q => {
         const userAnswer = answers[q.id];
         // Ensure userAnswer and selectedOption are not null/undefined before comparing
         if (userAnswer?.selectedOption !== null && userAnswer?.selectedOption !== undefined) {
            // Convert both to string for reliable comparison if types might differ (e.g., number vs string)
            if (String(userAnswer.selectedOption) === String(q.correct_answer)) {
                correctCount++;
            }
         }
         // Unanswered questions are implicitly incorrect based on correctCount
       });
       const totalQuestions = testDetails.questions.length;
       const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0; // Round score

       const result = {
         score: score.toString(), // Score as string
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
       router.push(`/review/${testId}?score=${result.score}&correct=${result.correctAnswers}&incorrect=${result.incorrectAnswers}&total=${result.totalQuestions}`);


     } catch (err) {
        console.error("Failed to submit answers:", err);
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Could not submit your answers. Please try again.",
        });
     } finally {
         setIsSubmitting(false); // Ensure submitting state is reset on error
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
  if (error || !testDetails || !testDetails.questions || testDetails.questions.length === 0) {
    return (
       <div className="container py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Alert variant="destructive" className="max-w-lg">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error Loading Test</AlertTitle>
             <AlertDescription>
                {error || "Test data could not be loaded or the test has no questions."}
                {/* Provide a button to go back */}
                <Button variant="link" className="p-0 h-auto mt-2" onClick={() => router.push('/dashboard')}>Go back to Dashboard</Button>
             </AlertDescription>
          </Alert>
       </div>
    );
  }

  // Quiz display
  const currentQuestion = testDetails.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / testDetails.questions.length) * 100;
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
                      const answered = answers[q.id]?.selectedOption !== null && answers[q.id]?.selectedOption !== undefined;
                      const isCurrent = index === currentQuestionIndex;
                      let statusClass = "bg-secondary hover:bg-muted border"; // Default unselected
                      if(isCurrent) statusClass = "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2 border-primary"; // Current question
                      else if (answered) statusClass = "bg-accent/50 hover:bg-accent/70 border border-accent"; // Answered

                      return (
                          <Button
                              key={q.id}
                              variant="outline"
                              size="icon"
                              className={`h-9 w-9 rounded-full transition-colors ${statusClass}`}
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
                  disabled={isSubmitting} // Disable interaction while submitting
                >
                  {currentQuestion.options.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`option-${option.id}`}
                        // Simplified styling, relies on Radix state for checked indication
                        className={`flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
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
                        className="bg-primary hover:bg-primary/90"
                        disabled={isSubmitting} // Disable while submitting
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
              {/* Changed AlertDialogAction to Button to handle disable state */}
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                 {isSubmitting ? "Submitting..." : "Confirm Submit"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
     </div>
  );
}
