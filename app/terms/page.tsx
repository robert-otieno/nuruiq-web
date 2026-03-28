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
  title: "Terms of Service - NuruIQ",
  description: "Read NuruIQ terms of service.",
};

const sections = [
  {
    title: "1. Acceptance",
    body: "Using NuruIQ means you agree to these Terms and our Privacy Policy.",
  },
  {
    title: "2. Service Description",
    body: "NuruIQ provides outage alerts and insights. Service availability and accuracy are not guaranteed.",
  },
  {
    title: "3. User Responsibilities",
    body: "You agree not to misuse the service, interfere with operations, or provide fraudulent information.",
  },
  {
    title: "4. Intellectual Property",
    body: "NuruIQ branding, software, and content remain the property of NuruIQ Ltd unless stated otherwise.",
  },
  {
    title: "5. Limitation of Liability",
    body: "NuruIQ is not liable for losses resulting from delayed alerts, data inconsistencies, or external outages.",
  },
  {
    title: "6. Termination",
    body: "We may suspend or terminate access when Terms are violated or abuse is detected.",
  },
  {
    title: "7. Modifications",
    body: "We may revise these Terms periodically. Continued use after updates constitutes acceptance.",
  },
] as const;

export default function TermsPage() {
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
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 28, 2026</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Terms for using NuruIQ</CardTitle>
            <CardDescription>
              These terms govern access to our website, mobile app, and alert delivery services.
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
              <h2 className="text-base font-semibold">8. Governing Law</h2>
              <p className="mt-2 text-sm text-muted-foreground">These terms are governed by the laws of the Republic of Kenya.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
