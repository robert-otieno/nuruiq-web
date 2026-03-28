import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarDays, ChevronRight, Clock3, Download, MapPin, ShieldCheck, Smartphone, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchEvents, fetchEventsNow, type EventItemDto } from "../lib/api";

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
  if (hasEnd) return `${evt.end_local}`;
  return "Not provided";
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

async function resolveSearchParams(searchParams?: PageSearchParams | Promise<PageSearchParams>): Promise<PageSearchParams> {
  if (!searchParams) return {};
  return Promise.resolve(searchParams);
}

const featureItems = [
  {
    title: "Realtime alerts",
    description: "Get notified about outages and restorations as they happen.",
    icon: Bell,
  },
  {
    title: "Regional coverage",
    description: "Track regions that matter to you with structured, location-first feeds.",
    icon: MapPin,
  },
  {
    title: "Reliable summaries",
    description: "See what changed today without scrolling through every notice.",
    icon: Sparkles,
  },
  {
    title: "Privacy first",
    description: "Your data remains yours. No hidden sharing.",
    icon: ShieldCheck,
  },
  {
    title: "Android ready",
    description: "Lightweight APK delivery for quick installs.",
    icon: Smartphone,
  },
  {
    title: "Fast updates",
    description: "Live feed refreshes continuously with official planned notices.",
    icon: Download,
  },
] as const;

const workflow = [
  { step: "1", title: "Install", description: "Download and install the Android APK." },
  { step: "2", title: "Choose regions", description: "Pick regions and areas to watch." },
  { step: "3", title: "Receive alerts", description: "Get outage and restoration updates." },
  { step: "4", title: "Stay in control", description: "Change preferences anytime." },
] as const;

const faqItems = [
  {
    q: "What is NuruIQ?",
    a: "NuruIQ is an alerts platform that tracks planned electricity outages and sends real-time updates.",
  },
  {
    q: "How does NuruIQ get its data?",
    a: "NuruIQ ingests official public outage notices and structures them for area-level tracking.",
  },
  {
    q: "How accurate are alerts?",
    a: "We optimize for accuracy and speed, but timelines can change when providers update schedules.",
  },
  {
    q: "Does NuruIQ use my location?",
    a: "Only with your permission. You can also follow regions manually without location access.",
  },
  {
    q: "How do I get support?",
    a: "Email support@nuruiq.com for product or account support.",
  },
] as const;

const hero = {
  title: "Planned Outage Alerts, ",
  subtitle: "Organized by Region.",
  description: "NuruIQ gives you area-level outage visibility with clear schedules, active status, and places affected.",
  buttons: [
    { label: "Download APK", href: "https://play.google.com/store/apps/details?id=com.power_watch.nuruiq&pcampaignid=web_share", variant: "default" },
    { label: "See Live Alerts", href: "#alerts", variant: "outline" },
  ],
  image: {
    src: "/screens/screen-0.jpg",
    alt: "NuruIQ app home screen",
    width: 571,
    height: 1280,
  },
};

export default async function Home({ searchParams }: { searchParams?: PageSearchParams | Promise<PageSearchParams> }) {
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
    // Non-blocking: UI falls back to an empty state.
  }

  const cards: AlertCardItem[] = [...active.map((event) => ({ event, isActive: true, region: getRegionLabel(event) })), ...upcoming.map((event) => ({ event, isActive: false, region: getRegionLabel(event) }))];

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="NuruIQ" width={28} height={28} priority className="brand-mark" />
            <span className="text-lg font-semibold tracking-tight">NuruIQ</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="#alerts">Live Alerts</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="#features">Features</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="#faq">FAQ</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href="https://play.google.com/store/apps/details?id=com.power_watch.nuruiq&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
                Download APK
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-grid opacity-40 mask-radial" />
            <div className="absolute -left-28 -top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl container flex flex-col items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:my-0 lg:flex-row">
            <div className="flex flex-col gap-7 lg:w-2/3 space-y-6">
              <div className="mb-3">
                <img src="/logo.svg" alt="NuruIQ logo" className="brand-mark-hero drop-shadow-sm" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-semibold text-foreground leading-tight tracking-tight sm:text-5xl">
                <span>{hero.title}</span>
                <span className="text-emerald-600">{hero.subtitle}</span>
              </h1>

              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">{hero.description}</p>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <a href={hero.buttons[0].href} target="_blank" rel="noopener noreferrer">
                    {hero.buttons[0].label}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>

                <Button asChild variant="outline" size="lg">
                  <Link href={hero.buttons[1].href}>{hero.buttons[1].label}</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">Android available now. iOS support is coming soon.</p>
            </div>
            <div className="relative z-10 w-full max-w-[380px]">
              <div className="absolute left-1/2 top-[1.1%] h-[93.4%] w-[76.4%] -translate-x-1/2 overflow-hidden rounded-[3rem]">
                <Image src={hero.image.src} alt={hero.image.alt} fill className="object-cover object-top" sizes="(max-width: 768px) 80vw, 380px" />
              </div>

              <Image src="/screens/phone-2.png" alt="Phone frame" width={1227} height={2048} className="relative z-10 h-auto w-full" />
            </div>
          </div>
        </section>

        <section id="alerts" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Live Alerts</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">Planned outages by region. Select a category to view outage cards.</p>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              Auto-refreshed every minute
            </Badge>
          </div>

          <Card className="mb-5 gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Regions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 pb-6">
              <Button
                asChild
                size="sm"
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  !activeRegion
                    ? "bg-emerald-500 text-white shadow-sm ring-1 ring-inset ring-emerald-600/40"
                    : "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                }`}
              >
                <Link href="/#alerts" scroll>
                  All regions
                  <Badge className={`rounded-full border-0 px-2 py-0.5 text-[10px] ${!activeRegion ? "bg-white/20" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"}`}>{allRegionsTotal}</Badge>
                  {allRegionsActive > 0 ? (
                    <Badge variant="destructive" className={`rounded-full border-0 px-2 py-0.5 text-[10px] ${!activeRegion ? "bg-red-500/40" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                      {allRegionsActive} active
                    </Badge>
                  ) : null}
                </Link>
              </Button>

              {regionSummaries.map((region) => {
                const isSelected = activeRegion === region.name;
                return (
                  <Button
                    key={region.name}
                    asChild
                    size="sm"
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "bg-emerald-500 text-white shadow-sm ring-1 ring-inset ring-emerald-600/40"
                        : "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <Link href={`/?region=${encodeURIComponent(region.name)}#alerts`} scroll>
                      {region.name}
                      <Badge className={`rounded-full border-0 px-2 py-0.5 text-[10px] ${isSelected ? "bg-white/20" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"}`}>{region.total}</Badge>
                      {region.active > 0 ? (
                        <Badge className={`rounded-full border-0 px-2 py-0.5 text-[10px] ${isSelected ? "bg-red-500/40" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>{region.active} active</Badge>
                      ) : null}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {visibleCards.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10">
                <p className="text-sm text-muted-foreground">No outages found for this region.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleCards.map((item) => {
                const evt = item.event;
                return (
                  <Card
                    key={evt.id}
                    className={`overflow-hidden gap-0 rounded-2xl bg-white shadow-sm ring-1 ring-inset dark:bg-zinc-900/40 ${item.isActive ? "ring-red-300 dark:ring-red-700/60 shadow-red-300 dark:shadow-red-700/60" : "ring-zinc-900/5 dark:ring-white/10"}`}
                  >
                    <div className={item.isActive ? "flex items-center justify-between gap-3 border-b bg-destructive px-5 py-3 text-destructive-foreground" : "flex items-center justify-between gap-3 border-b bg-secondary px-5 py-3"}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{evt.area?.trim() || formatLocation(evt) || "Unknown area"}</p>
                        <p className={item.isActive ? "truncate text-xs text-destructive-foreground/85" : "truncate text-xs text-muted-foreground"}>{item.region}</p>
                      </div>
                      {item.isActive ? (
                        <Badge variant="secondary" className="bg-white/15 text-white">
                          Active outage
                        </Badge>
                      ) : (
                        <Badge variant="outline">Upcoming</Badge>
                      )}
                    </div>

                    <CardContent className="space-y-4 px-5 py-5 text-sm">
                      <div className="flex gap-3">
                        <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Date</p>
                          <p>{evt.date_local || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Time</p>
                          <p>{formatWindow(evt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Places</p>
                          <p className="text-muted-foreground">{formatPlaces(evt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">Feed includes official planned notices. User reports appear in-app.</p>
        </section>

        <Separator />

        <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built with practical tools</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">Purpose-built for reliability, clarity, and fast decision making.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="gap-0">
                  <CardHeader className="pb-2">
                    <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator />

        <section id="screens" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">In-app preview</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">Focused screens built for quick scanning and alert triage.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["/screens/screen-1.jpg", "/screens/screen-2.jpg", "/screens/screen-3.jpg", "/screens/screen-4.jpg"].map((src) => (
              <Card key={src} className="overflow-hidden p-2">
                <div className="overflow-hidden rounded-lg border">
                  <Image src={src} alt="NuruIQ app screen" width={600} height={1200} className="h-[360px] w-full object-cover object-top" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section id="how" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item) => (
              <Card key={item.step} className="gap-0">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit rounded-full">
                    Step {item.step}
                  </Badge>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section id="faq" className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">FAQ</h2>
          <Card className="mt-6">
            <CardContent className="pt-2">
              <Accordion type="single" collapsible>
                {faqItems.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section id="download" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 to-background">
            <CardHeader>
              <CardTitle className="text-2xl">Download NuruIQ for Android</CardTitle>
              <CardDescription>Install the APK and start receiving outage alerts organized by the regions you care about.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 pb-8">
              <Button asChild size="lg">
                <a href="https://play.google.com/store/apps/details?id=com.power_watch.nuruiq&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
                  Download APK
                  <Download className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#alerts">View live regions</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>(c) {new Date().getFullYear()} NuruIQ. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <a href="mailto:support@nuruiq.com" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
