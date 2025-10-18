"use client"; 

import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/ui/stats-card";
import FeatureCard from "@/components/ui/feature-card";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Target,
  TrendingUp,
  Users,
  BookOpen,
  Brain,
  Award,
  CheckCircle,
  Timer,
  BarChart3,
  FileText,
  Play,
  ArrowRight,
} from "lucide-react";

// Note: Removed unused imports: ChangeEvent, FormEvent, useState, signIn

export default function LandingPage() {
  const { status } = useSession(); // Get session status
  const router = useRouter();

  const stats = [
    {
      title: "Questions Bank",
      value: "450+",
      description: "Expertly crafted questions",
      icon: <FileText className="h-8 w-8" />,
      variant: "primary" as const,
    },
    {
      title: "Average Score",
      value: "78%",
      description: "Student success rate",
      icon: <Target className="h-8 w-8" />,
      variant: "success" as const,
    },
    {
      title: "Pass Rate",
      value: "92%",
      description: "Students who passed",
      icon: <Award className="h-8 w-8" />,
      variant: "success" as const,
    },
    {
      title: "Time Saved",
      value: "2x",
      description: "Faster preparation",
      icon: <Clock className="h-8 w-8" />,
      variant: "warning" as const,
    },
  ];

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

  const features = [
    {
      title: "Timed Mock Exams",
      description: "Experience realistic exam conditions with precise time management. Final mock tests simulate actual NISM exam timing for perfect preparation.",
      icon: <Timer className="h-6 w-6" />,
      variant: "highlighted" as const,
    },
    {
      title: "Smart Analytics",
      description: "Track your progress with detailed performance insights. Identify weak areas and monitor improvement across all modules.",
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      title: "Detailed Explanations",
      description: "Every question comes with comprehensive explanations written by NISM-certified experts to ensure deep understanding.",
      icon: <Brain className="h-6 w-6" />,
    },
    {
      title: "Module-wise Practice",
      description: "Structured learning paths for Mutual Funds, Equity Derivatives, and Currency Derivatives with progressive difficulty.",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      title: "Expert-Curated Content",
      description: "Questions reviewed by financial industry professionals with years of NISM certification experience.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Performance Tracking",
      description: "Monitor your journey with comprehensive dashboards showing test history, scores, and improvement trends.",
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ];

  const topicsCovered = [
    "Mutual Fund Basics & Structure", "Types of Mutual Funds (Equity, Debt, Hybrid)", "NAV Calculation & Valuation", "Mutual Fund Distribution & Sales",
    "Risk-Return Trade-off Analysis", "Asset Allocation Strategies", "Portfolio Management Fundamentals", "Equity Markets & Trading Mechanisms",
    "Derivatives - Futures & Options", "Hedging & Speculation Strategies", "Currency Markets & Exchange Rates", "Interest Rate Derivatives",
    "Commodity Derivatives", "Risk Management Techniques", "Regulatory Framework (SEBI Guidelines)", "Investor Protection Measures",
    "KYC & AML Compliance", "Tax Implications on Investments", "Financial Planning Concepts", "Behavioral Finance Principles",
    "Market Indices & Benchmarking", "Technical & Fundamental Analysis", "ETFs & Index Funds", "Alternative Investment Funds (AIFs)",
    "Portfolio Performance Measurement", "Corporate Actions & Their Impact", "Securities Market Structure", "Clearing & Settlement Process",
    "Investment Advisory Services", "Code of Conduct for Intermediaries",
  ];

  return (
    <div className="min-h-screen bg-background landing-page-layout">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-green-700 py-20 lg:py-28">
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-6xl">
              Master NISM Certifications with{" "}
              <span className="text-yellow-300"> Expert Guidance</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Join thousands of successful finance professionals who achieved their NISM certifications with our comprehensive mock test platform. Practice with 450+ expert-curated questions.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="hidden text-lg px-8 py-3 border-primary-foreground/20 bg-yellow-300">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/80">{stat.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by Finance Professionals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform delivers proven results with comprehensive analytics and expert-designed content
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources needed for NISM certification success
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Topics Covered Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Comprehensive Topics Covered</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master 30+ essential topics across NISM certification modules
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topicsCovered.map((topic, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-primary">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Start Your NISM Journey?
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              Join our community of successful finance professionals and take the first step towards your NISM certification today.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}