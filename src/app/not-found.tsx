
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react'; // Example icon

export default function WelcomePage() {
  return (
    // <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20">
    //   <Card className="w-full max-w-lg text-center shadow-xl border-primary/20">
    //     <CardHeader className="items-center">
    //        <BookOpen className="h-12 w-12 text-primary mb-4" />
    //        <CardTitle className="text-3xl font-bold text-primary">Welcome to QuizMaster Pro!</CardTitle>
    //        <CardDescription className="text-lg text-muted-foreground pt-2">
    //          Your journey to mastering financial concepts starts here.
    //        </CardDescription>
    //     </CardHeader>
    //     <CardContent className="space-y-6 pt-4">
    //       <p className="text-foreground/80">
    //         Ready to test your knowledge? Log in to access your dashboard or sign up to create a new account.
    //       </p>
    //       <div className="flex justify-center gap-4">
    //         <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
    //           <Link href="/login">Login</Link>
    //         </Button>
    //         <Button variant="outline" size="lg" asChild className="border-primary text-primary hover:bg-primary/10">
    //           <Link href="/register">Sign Up</Link>
    //         </Button>
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>
<>
    <section className='auth-welcome-top'>
          <CardHeader className="items-center">
            <CardTitle className="text-4xl font-bold text-primary">Level Up with QuizMaster Pro!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Get exam-ready with powerful mock tests and performance insights tailored to your certification goals.
            </CardDescription>
         </CardHeader>

         <article className='auth-welcome'>
          <aside className='auth-welcome-image'>
            <img src="/images/9319770_4136944.svg" alt="Not Found Image" />
          </aside>
          <aside className='auth-welcome-content'>
            <div>
              <h3>Ready to test your knowledge?</h3>
              <p className="text-muted-foreground">
                Log in to access your dashboard or sign up to create a new account.
              </p>
              <div className="auth-btn">
             <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/login">Login</Link>
            </Button>
             <Button variant="outline" size="lg" asChild className="border-primary text-primary hover:bg-primary/10">
               <Link href="/register">Sign Up</Link>
             </Button>
          </div>
            </div>
          </aside>
         </article>
    </section>


    <section className='tool-plan-details'>
      <CardHeader className="items-center">
            <CardTitle className="text-4xl font-bold text-primary">Choose Your Plan</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Get quiz-ready for your financial certification goals. Pick a plan that fits your prep style.
            </CardDescription>
         </CardHeader>

         <article className='tool-plan-details-content'>
          <aside className='tool-plan-details-content-section price-card-1'>
            <h4>Starter</h4>
            <p className='tool-plan-details-content-price'><span>₹0</span> per month/user</p>
            <p>Perfect for casual learners testing the waters</p>
            <button>Get Started</button>
            <ul>
              <li>3 quizzes per week</li>
              <li>Basic performance insights</li>
              <li>Access to selected categories</li>
              <li>Mobile-friendly access</li>
              <li>Limited quiz history</li>
            </ul>
          </aside>
          <aside className='tool-plan-details-content-section price-card-2'>
            <h4>Starter</h4>
            <p className='tool-plan-details-content-price'><span>₹0</span> per month/user</p>
            <p>Perfect for casual learners testing the waters</p>
            <button>Get Started</button>
            <ul>
              <li>3 quizzes per week</li>
              <li>Basic performance insights</li>
              <li>Access to selected categories</li>
              <li>Mobile-friendly access</li>
              <li>Limited quiz history</li>
            </ul>
          </aside>
          <aside className='tool-plan-details-content-section price-card-3'>
            <h4>Starter</h4>
            <p className='tool-plan-details-content-price'><span>₹0</span> per month/user</p>
            <p>Perfect for casual learners testing the waters</p>
            <button>Get Started</button>
            <ul>
              <li>3 quizzes per week</li>
              <li>Basic performance insights</li>
              <li>Access to selected categories</li>
              <li>Mobile-friendly access</li>
              <li>Limited quiz history</li>
            </ul>
          </aside>
         </article>
    </section>
    </>
  );
}

      
