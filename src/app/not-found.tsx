
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react'; // Example icon

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20">
      <Card className="w-full max-w-lg text-center shadow-xl border-primary/20">
        <CardHeader className="items-center">
           <BookOpen className="h-12 w-12 text-primary mb-4" />
           <CardTitle className="text-3xl font-bold text-primary">Welcome to QuizMaster Pro!</CardTitle>
           <CardDescription className="text-lg text-muted-foreground pt-2">
             Your journey to mastering financial concepts starts here.
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <p className="text-foreground/80">
            Ready to test your knowledge? Log in to access your dashboard or sign up to create a new account.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-primary text-primary hover:bg-primary/10">
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

      
