import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, BarChart3 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About PassExam
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Empowering the next generation of financial professionals with comprehensive, expert-led NISM certification preparation.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card>
            <CardHeader className="items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>
                To provide accessible, high-quality, and effective learning tools that enable aspiring financial professionals to master NISM certifications with confidence and achieve their career goals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>
                To be the most trusted and effective platform for NISM certification preparation, known for our expert content, smart technology, and unwavering commitment to student success.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Our Team</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>
                We are a dedicated team of NISM-certified professionals, educators, and technologists passionate about finance and education, committed to helping you succeed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}