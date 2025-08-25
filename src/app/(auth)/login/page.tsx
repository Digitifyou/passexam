"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorData.message || "Invalid email or password.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <section className='auth-welcome-top auth-welcome-top-login'>
              <CardHeader className="items-center">
                <CardTitle className="text-4xl font-bold text-primary">Start Your Journey with QuizMaste Pro</CardTitle>
                <CardDescription className="text-lg text-muted-foreground pt-2">
                  Create your free account to unlock mock tests, track your progress, and get exam-ready with confidence.
                </CardDescription>
             </CardHeader>
    
             <article className='auth-welcome'>
              <aside className='auth-welcome-image'>
                <img src="/images/investing-concept-illustration.png" alt="Not Found Image" />
              </aside>
              <aside className='auth-welcome-content'>
                <div>
                 <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter Password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <a href="#" className="forget-password">forget passwords</a>
             <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
             
          </CardFooter>
        </form>
                </div>
              </aside>
             </article>
        </section>
    </>
  );
}