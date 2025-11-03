import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Nuruiq",
  description: "Read Nuruiq's Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-50">
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-zinc-500">Last Updated: November 2025</p>

          <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
            <ol className="space-y-6">
              <li>
                <h2 className="text-lg font-semibold">1. Acceptance</h2>
                <p>Using NuruIQ means you agree to these Terms and our Privacy Policy.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">2. Service Description</h2>
                <p>NuruIQ provides AI alerts and insights. We do not guarantee full accuracy or uptime.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">3. User Responsibilities</h2>
                <p>No hacking, misuse, or false registration data.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">4. Intellectual Property</h2>
                <p>All branding, algorithms, and content belong to NuruIQ Ltd.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">5. Limitation of Liability</h2>
                <p>We are not liable for delayed alerts, data inaccuracies, or external service issues.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">6. Termination</h2>
                <p>We may suspend or terminate accounts violating our Terms.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">7. Modifications</h2>
                <p>
                  We may update Terms anytime. Latest version: <a className="underline" href="/terms">www.nuruiq.com/terms</a>
                </p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">8. Governing Law</h2>
                <p>Republic of Kenya.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

