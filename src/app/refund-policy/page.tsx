import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundPolicyPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Refund Policy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Last updated: September 12, 2025
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Our Commitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We strive to provide the best preparation tools for your NISM certification. However, we understand that sometimes things don't go as planned.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>General Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Due to the digital nature of our products, we generally do not offer refunds once a subscription has been purchased and accessed. All sales are considered final. We encourage you to use our free tier to evaluate the platform before purchasing a plan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}