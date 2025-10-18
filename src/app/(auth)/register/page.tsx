"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signIn, useSession } from "next-auth/react";

export default function RegisterPage() {
  const { status } = useSession(); // Get session status
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState(""); // <-- Add state for mobile
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // --- CLIENT-SIDE REDIRECTION FIX ---
  useEffect(() => {
    // If the session is authenticated, redirect the user away.
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated" || status === "loading") {
    // Return null while redirecting or checking session status to prevent flashing content.
    return null;
  }
  // -----------------------------------

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
    // Add basic mobile validation check on client-side too
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) { // Example: 10 digits
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: "Please enter a valid 10-digit mobile number.",
        });
        return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, mobile }), // <-- Include mobile
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
            {/* Google Login Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              disabled={isLoading}
            >
              {/* SVG Icon */}
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.8L357 134.7C333.5 112.5 295.1 98.4 248 98.4c-87.5 0-157.9 70.3-157.9 157.6s70.4 157.6 157.9 157.6c93.1 0 134.3-64.8 138.6-99.1H248v-72.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Sign up with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
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
                 {/* --- Add Mobile Input --- */}
                 <div className="grid gap-2">
                  <Input
                    id="mobile"
                    type="tel" // Use type="tel" for mobile numbers
                    placeholder="Mobile Number (10 digits)"
                    required
                    value={mobile}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
                    disabled={isLoading}
                    maxLength={10} // Optional: Limit input length
                    pattern="[0-9]{10}" // Optional: Basic pattern validation
                  />
                </div>
                {/* --- End Mobile Input --- */}
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