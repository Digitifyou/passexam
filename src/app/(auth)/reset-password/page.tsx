"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get the email from the URL query parameters
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else {
      // If no email is in the URL, redirect to login
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid or missing reset link.",
      });
      router.push('/login');
    }
  }, [searchParams, router, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your password has been reset. Please log in.",
        });
        router.push("/login");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!email) {
    // Render nothing or a loading spinner while the email is being read from the URL
    return null;
  }

  return (
    <section className='auth-welcome-top auth-welcome-top-login'>
      <CardHeader className="items-center">
        <CardTitle className="text-4xl font-bold text-primary">Reset Your Password</CardTitle>
        <CardDescription className="text-lg text-muted-foreground pt-2">
          Enter your new password below for the account associated with {email}.
        </CardDescription>
      </CardHeader>
      <article className='auth-welcome'>
        <aside className='auth-welcome-image'>
          <img src="/images/investing-concept-illustration.png" alt="Reset Password Illustration" />
        </aside>
        <aside className='auth-welcome-content'>
          <div>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Cancel</Link>
                </Button>
              </CardFooter>
            </form>
          </div>
        </aside>
      </article>
    </section>
  );
}

// Wrap the component in Suspense to handle useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}