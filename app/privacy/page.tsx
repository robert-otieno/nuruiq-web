import type { Metadata } from "next";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy - NuruIQ",
  description: "Read NuruIQ privacy policy.",
};

const sections = [
  {
    title: "1. Data We Collect",
    body: "We may collect account details (name, phone, email), optional location settings, and product usage analytics.",
  },
  {
    title: "2. How We Use Data",
    body: "Data is used to deliver outage alerts, improve product quality, and provide support communications.",
  },
  {
    title: "3. Cookies and Local Storage",
    body: "We use local storage and cookies for session continuity, performance, and user preferences.",
  },
  {
    title: "4. Security",
    body: "We apply technical and administrative controls designed to protect personal data from unauthorized access.",
  },
  {
    title: "5. Data Sharing",
    body: "Data is only shared with trusted processors or where required by law or regulatory obligations.",
  },
  {
    title: "6. Your Rights",
    body: "You can request access, correction, or deletion of your personal data by contacting our support team.",
  },
  {
    title: "7. Third-Party Services",
    body: "External services linked from NuruIQ are governed by their own privacy terms.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            NuruIQ
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
          Legal
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 28, 2026</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your privacy at NuruIQ</CardTitle>
            <CardDescription>
              This policy explains what data we process and why.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            {sections.map((section, index) => (
              <div key={section.title}>
                <h2 className="text-base font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
                {index < sections.length - 1 ? <Separator className="mt-5" /> : null}
              </div>
            ))}

            <div>
              <h2 className="text-base font-semibold">8. Contact</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Email: <a className="underline underline-offset-4" href="mailto:privacy@nuruiq.com">privacy@nuruiq.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
