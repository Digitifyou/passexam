
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
           <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
             <AlertTriangle className="h-10 w-10 text-destructive" />
           </div>
          <CardTitle className="text-3xl font-bold">404 - Page Not Found</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Oops! The page you are looking for does not exist or may have been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Let's get you back on track. You can return to the main dashboard or try logging in again if you think this is an error.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
