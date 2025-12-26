import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Last updated: September 12, 2025
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Welcome to PassExam ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We may collect personal identification information from you in a variety of ways, including, but not limited to, when you register on the site, subscribe to a plan, and in connection with other activities, services, features, or resources we make available.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Data:</strong> Email address, first name, and last name.</li>
                <li><strong>Usage Data:</strong> Information your browser sends whenever you visit our service, such as your IP address, browser type, and pages visited.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our services.</li>
                <li>Improve, personalize, and expand our services.</li>
                <li>Understand and analyze how you use our services.</li>
                <li>Communicate with you for customer service, updates, and marketing.</li>
                <li>Process your transactions.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}