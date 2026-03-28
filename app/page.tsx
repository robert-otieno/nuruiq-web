import Image from "next/image";
import { fetchEvents, fetchEventsNow, type EventItemDto } from "../lib/api";
import Link from "next/link";

export const revalidate = 60;
type PageSearchParams = Record<string, string | string[] | undefined>;

interface AlertCardItem {
  event: EventItemDto;
  isActive: boolean;
  region: string;
}

function formatLocation(evt: EventItemDto): string {
  const parts = [evt.area, evt.county, evt.region].filter(Boolean) as string[];
  return parts.join(", ");
}

function formatWindow(evt: EventItemDto): string {
  if (evt.window_text) return evt.window_text;
  const hasStart = Boolean(evt.start_local);
  const hasEnd = Boolean(evt.end_local);
  if (hasStart && hasEnd) return `${evt.start_local} - ${evt.end_local}`;
  if (hasStart) return `${evt.start_local}`;
  return evt.date_local;
}

function parseEventDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const isoDate = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(isoDate.getTime()) ? null : isoDate;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getRegionLabel(evt: EventItemDto): string {
  const region = evt.region?.trim();
  if (region) return region;
  const county = evt.county?.trim();
  if (county) return county;
  return "Other regions";
}

function formatPlaces(evt: EventItemDto): string {
  if (evt.places?.length) {
    return evt.places.filter(Boolean).join(", ");
  }
  return "Not specified";
}

async function resolveSearchParams(
  searchParams?: PageSearchParams | Promise<PageSearchParams>,
): Promise<PageSearchParams> {
  if (!searchParams) return {};
  return Promise.resolve(searchParams);
}

export default async function Home({
  searchParams,
}: {
  searchParams?: PageSearchParams | Promise<PageSearchParams>;
}) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const rawRegion = resolvedSearchParams.region;
  const selectedRegion = (Array.isArray(rawRegion) ? rawRegion[0] : rawRegion)?.trim() || "";

  let active: EventItemDto[] = [];
  let upcoming: EventItemDto[] = [];
  try {
    const [nowRes, futureRes] = await Promise.all([fetchEventsNow({ limit: 20 }), fetchEvents({ limit: 30, sort: "asc" })]);
    const seen = new Set<string>();
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    active = nowRes.items.filter((it) => {
      if (seen.has(it.id)) return false;
      seen.add(it.id);
      return true;
    });
    upcoming = futureRes.items
      .filter((it) => !seen.has(it.id))
      .filter((it) => {
        const eventDate = parseEventDate(it.date_local);
        if (!eventDate) return false;
        return eventDate.getTime() > startOfToday.getTime();
      })
      .slice(0, 20);
  } catch {
    // Non-blocking; section will show an error state
  }
  const cards: AlertCardItem[] = [
    ...active.map((event) => ({ event, isActive: true, region: getRegionLabel(event) })),
    ...upcoming.map((event) => ({ event, isActive: false, region: getRegionLabel(event) })),
  ];
  const regionSummaries = Array.from(
    cards.reduce((acc, item) => {
      const existing = acc.get(item.region);
      if (existing) {
        existing.total += 1;
        if (item.isActive) existing.active += 1;
      } else {
        acc.set(item.region, { name: item.region, total: 1, active: item.isActive ? 1 : 0 });
      }
      return acc;
    }, new Map<string, { name: string; total: number; active: number }>()),
  )
    .map(([, summary]) => summary)
    .sort((a, b) => a.name.localeCompare(b.name));

  const regionExists = selectedRegion ? regionSummaries.some((region) => region.name === selectedRegion) : true;
  const activeRegion = regionExists ? selectedRegion : "";
  const visibleCards = cards.filter((item) => !activeRegion || item.region === activeRegion);

  const allRegionsTotal = cards.length;
  const allRegionsActive = cards.filter((item) => item.isActive).length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/60 backdrop-blur supports-backdrop-filter:bg-white/60 dark:bg-black/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2">
            <img src="/logo.svg" alt="NuruIQ logo" className="brand-mark" />
            <span className="text-xl font-semibold tracking-tight">NuruIQ</span>
          </a>
          <nav className="hidden gap-6 text-sm text-zinc-600 dark:text-zinc-300 sm:flex">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white">
              Features
            </a>
            <a href="#screens" className="hover:text-zinc-900 dark:hover:text-white">
              Screens
            </a>
            <a href="#how" className="hover:text-zinc-900 dark:hover:text-white">
              How It Works
            </a>
            <a href="#faq" className="hover:text-zinc-900 dark:hover:text-white">
              FAQ
            </a>
            <a href="#download" className="hover:text-zinc-900 dark:hover:text-white">
              Download
            </a>
          </nav>
          <a
            href="#download"
            className="inline-flex items-center justify-center rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-emerald-600/20 transition hover:brightness-110"
          >
            Download APK
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background grid + blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-40 dark:opacity-20 mask-radial" />
          <div className="absolute -top-24 -left-24 h-112 w-md rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-128 w-lg rounded-full bg-teal-400/20 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="mb-3">
              <img src="/logo.svg" alt="NuruIQ logo" className="brand-mark-hero drop-shadow-sm" />
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">NuruIQ. <br />  Never Miss a Power Update.</h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">Real-time KPLC outages, updates and smart notifications - all in one lightweight app.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#download" className="rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 px-5 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-emerald-600/20 transition hover:brightness-110">
                Download APK
              </a>
              <a
                href="#features"
                className="rounded-full border border-zinc-300 bg-white/70 px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Learn More
              </a>
            </div>
            <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">Android only for now. iOS coming soon.</div>
          </div>
          <div className="relative mx-auto">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-white/60 shadow-2xl ring-1 ring-inset ring-zinc-900/5 dark:bg-zinc-950/60 dark:ring-white/10" />
            <div className="rounded-[28px] bg-white p-2 shadow-xl ring-1 ring-inset ring-zinc-900/5 dark:bg-zinc-950 dark:ring-white/10">
              <div className="h-[450px] overflow-hidden rounded-[22px] ring-1 ring-inset ring-zinc-900/10 dark:ring-white/10">
                <Image src="/screens/screen-0.jpg" alt="App screen" width={300} height={400} className="h-full w-auto" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Alerts */}
      <section id="alerts" className="relative py-16 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-15" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Live Alerts</h2>
              <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">Planned outages by region. Select a category to view outage cards.</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-inset ring-zinc-900/5 dark:bg-zinc-900/40 dark:ring-white/10">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Regions</div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/#alerts"
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  !activeRegion
                    ? "bg-emerald-500 text-white shadow-sm ring-1 ring-inset ring-emerald-600/40"
                    : "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                }`}
              >
                <span>All regions</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${!activeRegion ? "bg-white/20" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"}`}>{allRegionsTotal}</span>
                {allRegionsActive > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${!activeRegion ? "bg-red-500/40" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>{allRegionsActive} active</span>
                )}
              </Link>
              {regionSummaries.map((region) => {
                const isSelected = activeRegion === region.name;
                return (
                  <Link
                    key={region.name}
                    href={`/?region=${encodeURIComponent(region.name)}#alerts`}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "bg-emerald-500 text-white shadow-sm ring-1 ring-inset ring-emerald-600/40"
                        : "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <span>{region.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${isSelected ? "bg-white/20" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"}`}>{region.total}</span>
                    {region.active > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${isSelected ? "bg-red-500/40" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                        {region.active} active
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {visibleCards.length === 0 ? (
            <div className="rounded-2xl bg-white/70 p-6 text-sm text-zinc-600 shadow-sm ring-1 ring-inset ring-zinc-900/5 dark:bg-zinc-900/40 dark:text-zinc-400 dark:ring-white/10">
              No outages found for this region.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleCards.map((item) => {
                const evt = item.event;
                return (
                  <article
                    key={`${evt.id}-${item.isActive ? "active" : "upcoming"}`}
                    className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-inset dark:bg-zinc-900/40 ${
                      item.isActive ? "ring-red-300 dark:ring-red-700/60" : "ring-zinc-900/5 dark:ring-white/10"
                    }`}
                  >
                    <div className={`flex items-center justify-between gap-3 px-4 py-3 ${item.isActive ? "bg-red-600 text-white" : "bg-sky-500/15 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200"}`}>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{evt.area?.trim() || formatLocation(evt) || "Unknown area"}</h3>
                        <p className={`truncate text-xs ${item.isActive ? "text-red-100" : "text-sky-800 dark:text-sky-300"}`}>{item.region}</p>
                      </div>
                      {item.isActive ? (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ring-white/30">
                          Active outage
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-900/40 dark:text-sky-200 dark:ring-sky-400/30">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <div className="space-y-3 px-4 py-4 text-sm">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Date</p>
                        <p className="mt-1 text-zinc-800 dark:text-zinc-100">{evt.date_local || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Time</p>
                        <p className="mt-1 text-zinc-800 dark:text-zinc-100">{formatWindow(evt)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Places</p>
                        <p className="mt-1 text-zinc-700 dark:text-zinc-300">{formatPlaces(evt)}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">Feed includes official planned notices; user reports appear in-app.</div>
        </div>
      </section>
      {/* Features */}
      <section id="features" className="border-y border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-black sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Features that matter</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">Built to be reliable, simple, and fast - so you always know what&apos;s happening.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Realtime alerts", desc: "Get notified about outages and restorations as they happen.", icon: "/globe.svg" },
              { title: "Regional coverage", desc: "Track areas that matter to you with location-driven feeds.", icon: "/window.svg" },
              { title: "Smart summaries", desc: "Digest daily highlights so you never miss key updates.", icon: "/file.svg" },
              { title: "Light + Dark", desc: "Looks great in both light and dark themes.", icon: "/window.svg" },
              { title: "Privacy first", desc: "Your data stays on device. No surprise tracking.", icon: "/file.svg" },
              { title: "Fast & lightweight", desc: "Low data usage with a smooth experience.", icon: "/globe.svg" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-inset ring-zinc-900/5 transition hover:shadow-md dark:bg-zinc-900/40 dark:ring-white/10">
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-tr from-emerald-500/20 to-teal-400/20 ring-1 ring-inset ring-emerald-600/20">
                    <Image src={f.icon} alt="" width={20} height={20} className="dark:invert" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screens */}
      <section id="screens" className="relative py-16 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-15" />
        </div>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">A peek at the app</h2>
              <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">Clean, focused screens that highlight the essentials.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-6">
              {["/screens/screen-1.jpg", "/screens/screen-2.jpg", "/screens/screen-3.jpg", "/screens/screen-4.jpg"].map((src) => (
                <div key={src} className="relative w-[260px] shrink-0">
                  <div className="rounded-[22px] bg-white p-2 shadow-md ring-1 ring-inset ring-zinc-900/5 dark:bg-zinc-950 dark:ring-white/10">
                    <div className="overflow-hidden rounded-[18px] ring-1 ring-inset ring-zinc-900/10 dark:ring-white/10">
                      <Image src={src} alt="App screen" width={600} height={1200} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="border-y border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-black sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: "Install", desc: "Get the APK and install on Android." },
              { step: "2", title: "Setup", desc: "Choose your region and notification prefs." },
              { step: "3", title: "Stay updated", desc: "Receive outage alerts and daily summaries." },
              { step: "4", title: "Control", desc: "Pause alerts anytime. Your data stays yours." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-inset ring-zinc-900/5 dark:bg-zinc-900/40 dark:ring-white/10">
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Step {s.step}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-black sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">FAQs</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">Quick answers to common questions.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                q: "What is NuruIQ?",
                a: "NuruIQ is an AI-powered alerts platform providing real-time notifications about power outages, weather changes, and more.",
              },
              {
                q: "How does NuruIQ get its data?",
                a: "We aggregate and verify info from official public sources (like KPLC), processed through AI.",
              },
              {
                q: "How accurate are alerts?",
                a: "We aim for high accuracy, but some external factors may affect data timeliness.",
              },
              {
                q: "Is NuruIQ available outside Kenya?",
                a: "Currently serving Kenya, with expansion across East Africa.",
              },
              {
                q: "How do I subscribe?",
                a: "Enter your phone/email, choose region and alert type. You can unsubscribe anytime.",
              },
              {
                q: "Does NuruIQ use my location?",
                a: "Only with permission. We never sell or share your data.",
              },
              {
                q: "Support?",
                a: "Email: support@nuruiq.com",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-inset ring-zinc-900/5 dark:bg-zinc-900/40 dark:ring-white/10">
                <h3 className="text-base font-semibold">{item.q}</h3>
                {item.q === "Support?" ? (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Email:{" "}
                    <a className="underline decoration-dotted underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-200" href="mailto:support@nuruiq.com">
                      support@nuruiq.com
                    </a>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Download the APK</h2>
              <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">Ready to try it? Install the Android APK directly. We&apos;ll publish to the Play Store soon.</p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#"
                  aria-disabled
                  className="cursor-not-allowed rounded-lg bg-linear-to-tr from-emerald-500 to-teal-400 px-5 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-emerald-600/20"
                  title="APK link coming soon"
                >
                  Download APK (Coming Soon)
                </a>
                <a href="#features" className="rounded-lg border border-zinc-300 bg-white/70 px-5 py-3 text-sm font-semibold shadow-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:bg-zinc-900">
                  Explore Features
                </a>
              </div>
              <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Checksum and version details will appear here once available.</div>
            </div>
            {/* <div className="mx-auto w-full max-w-xs">
              <div className="rounded-2xl p-6 text-center shadow-sm ring-1 ring-inset ring-zinc-900/10 dark:ring-white/10">
                <Image src="/qr.svg" alt="QR code placeholder" width={180} height={180} className="mx-auto" />
                <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Scan on your phone</div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-10 text-sm text-zinc-500 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div>(c) {new Date().getFullYear()} NuruIQ. All rights reserved.</div>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Terms
            </Link>
            <Link href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
