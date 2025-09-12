import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function WelcomePage() {
  return (
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
            <img src="/images/9319770_4136944.svg" alt="Welcome Image" />
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
            <h4>Pro</h4>
            <p className='tool-plan-details-content-price'><span>₹299</span> per month/user</p>
            <p>Ideal for dedicated learners aiming for top scores</p>
            <button>Get Started</button>
            <ul>
              <li>Unlimited quizzes</li>
              <li>Advanced performance insights</li>
              <li>Full category access</li>
              <li>Priority support</li>
              <li>Complete quiz history</li>
            </ul>
          </aside>
          <aside className='tool-plan-details-content-section price-card-3'>
            <h4>Teams</h4>
            <p className='tool-plan-details-content-price'><span>Contact Us</span></p>
            <p>For organizations and educational institutions</p>
            <button>Contact Sales</button>
            <ul>
              <li>All Pro features</li>
              <li>Team progress tracking</li>
              <li>Centralized billing</li>
              <li>Custom branding</li>
              <li>Dedicated account manager</li>
            </ul>
          </aside>
        </article>
      </section>
    </>
  );
}