import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CancellationPolicyPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Cancellation Policy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Last updated: September 12, 2025
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Cancellation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                You can cancel your subscription at any time from your profile settings. When you cancel, you will continue to have access to your plan's features until the end of your current billing period. No further charges will be made after the cancellation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}