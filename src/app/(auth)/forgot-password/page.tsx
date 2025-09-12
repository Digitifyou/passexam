"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Check your email",
          description: data.message,
        });
        setIsSubmitted(true);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send the reset link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='auth-welcome-top auth-welcome-top-login'>
      <CardHeader className="items-center">
        <CardTitle className="text-4xl font-bold text-primary">Forgot Your Password?</CardTitle>
        <CardDescription className="text-lg text-muted-foreground pt-2">
          No problem. Enter your email below to receive a reset link.
        </CardDescription>
      </CardHeader>

      <article className='auth-welcome'>
        <aside className='auth-welcome-image'>
          <img src="/images/investing-concept-illustration.png" alt="Forgot Password Illustration" />
        </aside>
        <aside className='auth-welcome-content'>
          <div>
            {isSubmitted ? (
              <div className="text-center">
                <h3 className="text-2xl font-semibold">Check your email</h3>
                <p className="text-muted-foreground mt-2">
                  We've sent a password reset link to <span className="font-bold text-primary">{email}</span>.
                </p>
                <CardFooter className="flex flex-col gap-4 mt-4">
                   <Button variant="outline" className="w-full" asChild>
                     <Link href="/login">Back to Login</Link>
                   </Button>
                </CardFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                   <Button variant="outline" className="w-full" asChild>
                     <Link href="/login">Cancel</Link>
                   </Button>
                </CardFooter>
              </form>
            )}
          </div>
        </aside>
      </article>
    </section>
  );
}