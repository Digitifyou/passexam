
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
           {/* Removed icon and original title/description */}
           {/* Replaced content as requested */}
           <CardTitle className="text-2xl">why this page 404</CardTitle>
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

