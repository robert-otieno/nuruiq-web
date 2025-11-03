import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Nuruiq",
  description: "Read Nuruiq's Privacy Policy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-50">
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-zinc-500">Last Updated: November 2025</p>

          <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
            <ol className="space-y-6">
              <li>
                <h2 className="text-lg font-semibold">1. Data We Collect</h2>
                <p>Personal (name, phone, email), location (optional), and usage analytics.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">2. Use of Data</h2>
                <p>To deliver alerts, improve predictions, and notify you of updates.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">3. Cookies</h2>
                <p>We use cookies for performance and UX; disable in browser if preferred.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">4. Security</h2>
                <p>We employ encryption and firewalls to secure data.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">5. Sharing Data</h2>
                <p>Shared only with trusted service providers or when required by law.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">6. Your Rights</h2>
                <p>Request deletion, opt-out, update data.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">7. Third-Party Services</h2>
                <p>Linked sites are not covered by our Privacy Policy.</p>
              </li>
              <li>
                <h2 className="text-lg font-semibold">8. Contact</h2>
                <p>
                  Email: <a className="underline" href="mailto:privacy@nuruiq.com">privacy@nuruiq.com</a>
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

