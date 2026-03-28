export interface EventItemDto {
  id: string;
  notice_id: string;
  region?: string | null;
  county?: string | null;
  area?: string | null;
  date_local: string;
  start_local?: string | null;
  end_local?: string | null;
  duration_minutes: number;
  places?: string[] | null;
  window_text?: string | null;
  source?: "official" | "user_report";
  description?: string | null;
  reported_at?: string | null;
  cluster_id?: string | null;
}

export interface EventListResponseDto {
  items: EventItemDto[];
  next_cursor: string | null;
}

export interface ListEventsParams extends Record<string, string | number | boolean | undefined | null> {
  from?: string;
  to?: string;
  region?: string;
  county?: string;
  area?: string;
  place_like?: string;
  q?: string;
  sort?: "asc" | "desc";
  limit?: number;
  cursor?: string;
}

export interface EventsNowParams extends Record<string, string | number | boolean | undefined | null> {
  region?: string;
  county?: string;
  area?: string;
  place_like?: string;
  limit?: number;
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://blackout-watch-api-latest.onrender.com"
  // "http://127.0.0.1:8080"
).replace(/\/$/, "");

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || "";

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, `${API_BASE}/`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

function normalizeHeaders(headers?: HeadersInit): Headers {
  const out = new Headers(headers || {});
  if (!out.has("Accept")) {
    out.set("Accept", "application/json");
  }
  if (API_KEY && !out.has("X-API-Key")) {
    out.set("X-API-Key", API_KEY);
  }
  return out;
}

async function request<T>(path: string, opts: { query?: Record<string, any>; init?: RequestInit } = {}): Promise<T> {
  const url = buildUrl(path, opts.query);
  const res = await fetch(url, {
    ...(opts.init ?? {}),
    headers: normalizeHeaders(opts.init?.headers),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

export const getApiBaseUrl = (): string => API_BASE;

export async function fetchEvents(params: ListEventsParams = {}): Promise<EventListResponseDto> {
  return request<EventListResponseDto>("/v1/events", { query: params });
}

export async function fetchEventsNow(params: EventsNowParams = {}): Promise<EventListResponseDto> {
  return request<EventListResponseDto>("/v1/events/now", { query: params });
}
