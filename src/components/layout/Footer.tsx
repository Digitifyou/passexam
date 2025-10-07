import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold">NISM Certify Pro</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Empowering financial professionals with world-class certification preparation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Platform</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/#modules" className="text-muted-foreground hover:text-primary">NISM Modules</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Practice Tests</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Mock Exams</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Support</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/#faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><a href="mailto:support@nismprep.com" className="text-muted-foreground hover:text-primary">Help Center</a></li>
              <li><a href="mailto:contact@nismprep.com" className="text-muted-foreground hover:text-primary">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NISM Certify Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}