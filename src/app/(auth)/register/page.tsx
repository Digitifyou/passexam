"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Passwords do not match.",
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Redirecting to login...",
        });
        router.push("/login");
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorData.message || "Could not register user.",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An unexpected error occurred.",
      });
      setIsLoading(false);
    }
  };

  return (
    <section className='auth-welcome-top auth-welcome-top-login'>
      <CardHeader className="items-center">
        <CardTitle className="text-4xl font-bold text-primary">Start Your Journey with QuizMaster Pro</CardTitle>
        <CardDescription className="text-lg text-muted-foreground pt-2">
          Create your free account to unlock mock tests, track your progress, and get exam-ready with confidence.
        </CardDescription>
      </CardHeader>

      <article className='auth-welcome'>
        <aside className='auth-welcome-image'>
          <img src="/images/9319770_4136944.svg" alt="Register Illustration" />
        </aside>
        <aside className='auth-welcome-content'>
          <div>
            <form onSubmit={handleRegister}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Name"
                    required
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
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
                <div className="grid gap-2">
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Confirm Password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Sign up"}
                </Button>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" asChild>
                  <Link href="/login">Already have an account? Login</Link>
                </Button>
              </CardFooter>
            </form>
          </div>
        </aside>
      </article>
    </section>
  );
}