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

    // TODO: Replace with actual API call to login.php
    console.log("Attempting login with:", { email, password });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // --- MOCK API RESPONSE ---
    // Replace this block with fetch logic
    // Allow both user@example.com and admin@example.com with password 'password' for testing
    const mockSuccess = (email === "user@example.com" || email === "admin@example.com") && password === "password";
    // --- END MOCK API RESPONSE ---

    if (mockSuccess) {
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });
      // In a real app, the session would be set by the server response headers
      // For now, just redirect
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
      setIsLoading(false);
    }
  };

  return (
    // <div className="flex min-h-screen items-center justify-center bg-secondary">
    //   <Card className="w-full max-w-sm">
    //     <CardHeader>
    //       <CardTitle className="text-2xl">Login</CardTitle>
    //       <CardDescription>
    //         Enter your email below to login to your account. Use user@example.com or admin@example.com with password 'password'.
    //       </CardDescription>
    //     </CardHeader>
    //     <form onSubmit={handleLogin}>
    //       <CardContent className="grid gap-4">
    //         <div className="grid gap-2">
    //           <Label htmlFor="email">Email</Label>
    //           <Input
    //             id="email"
    //             type="email"
    //             placeholder="m@example.com"
    //             required
    //             value={email}
    //             onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
    //             disabled={isLoading}
    //           />
    //         </div>
    //         <div className="grid gap-2">
    //           <Label htmlFor="password">Password</Label>
    //           <Input
    //             id="password"
    //             type="password"
    //             required
    //             value={password}
    //             onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
    //             disabled={isLoading}
    //             placeholder="password"
    //           />
    //         </div>
    //       </CardContent>
    //       <CardFooter className="flex flex-col gap-4">
    //          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
    //           {isLoading ? "Logging in..." : "Login"}
    //         </Button>
    //          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" asChild>
    //            <Link href="/register">Sign up</Link>
    //          </Button>
    //       </CardFooter>
    //     </form>
    //   </Card>
    // </div>

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
