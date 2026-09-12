import { cache } from 'react';

const TIMEOUT_MS = 5000;

type Outcome = { ok: true; status: number; data: any } | { ok: false; status: number; reason: string };

/** Thrown when the API is unreachable or failing (timeout, network error, 5xx) on the production server. */
export class ApiUnavailableError extends Error {}

// During `next build` a failing API shouldn't fail the build, and in development it shouldn't break pages.
const isProductionServer = () =>
  typeof window === 'undefined'
  && process.env.NODE_ENV === 'production'
  && process.env.NEXT_PHASE !== 'phase-production-build';

/**
 * One request per URL + options per render. Next.js normally shares identical fetches within a render,
 * but not ones carrying an abort signal (needed here for the timeout), so the sharing is done here.
 */
const requestJson = cache(async (url: string, optionsKey: string, timeoutMs: number): Promise<Outcome> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...(JSON.parse(optionsKey) as RequestInit), signal: controller.signal });
    if (!res.ok) {
      return { ok: false, status: res.status, reason: `${res.status} ${res.statusText}` };
    }
    return { ok: true, status: res.status, data: await res.json() };
  } catch (error) {
    return { ok: false, status: 0, reason: (error as Error).message };
  } finally {
    clearTimeout(timer);
  }
});

type SafeFetchOptions = {
  /**
   * Optional data (e.g. structured data, comments) always falls back instead of failing the page.
   * Otherwise, on the production server an unavailable API throws, so Next.js keeps serving the last good
   * version of the page rather than caching one with empty sections.
   */
  optional?: boolean;
};

export async function safeFetch(url: string, fallbackValue: any = null, init?: RequestInit, { optional = false }: SafeFetchOptions = {}) {
  const fetchOptions: RequestInit = { ...init };
  // Default to ISR (revalidate every 60s) for public data to prevent DYNAMIC_SERVER_USAGE build errors,
  // unless explicitly overridden by the caller.
  if (!fetchOptions.cache && !fetchOptions.next) {
    fetchOptions.next = { revalidate: 60 };
  }

  const outcome = await requestJson(url, JSON.stringify(fetchOptions), TIMEOUT_MS);
  if (outcome.ok) {
    // Each caller gets its own copy, as with a normal fetch.
    return structuredClone(outcome.data);
  }

  // A 4xx means the API answered; treat it as "no data". Timeouts, network errors and 5xx mean it's unavailable.
  const unavailable = outcome.status === 0 || outcome.status >= 500;
  if (unavailable && !optional && isProductionServer()) {
    throw new ApiUnavailableError(`API unavailable for ${url}: ${outcome.reason}`);
  }

  console.warn(`[safeFetch] ${url} failed (${outcome.reason}); using the fallback value.`);
  return fallbackValue;
}

export type ApiResult<T = any> = { ok: boolean; status: number; data: T | null };

/**
 * Like safeFetch, but reports the HTTP status so callers can tell a real 404
 * apart from the API being slow or down (status 0).
 */
export async function fetchApi<T = any>(url: string, init?: RequestInit, timeoutMs = TIMEOUT_MS): Promise<ApiResult<T>> {
  const outcome = await requestJson(url, JSON.stringify(init ?? {}), timeoutMs);
  if (!outcome.ok) {
    console.warn(`[fetchApi] ${url} failed: ${outcome.reason}`);
    return { ok: false, status: outcome.status, data: null };
  }
  return { ok: true, status: outcome.status, data: structuredClone(outcome.data) };
}
