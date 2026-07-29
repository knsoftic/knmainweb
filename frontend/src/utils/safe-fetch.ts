export async function safeFetch(url: string, fallbackValue: any = null, init?: RequestInit) {
  try {
    const fetchOptions: RequestInit = { ...init };
    // Default to ISR (revalidate every 60s) for public data to prevent DYNAMIC_SERVER_USAGE build errors,
    // unless explicitly overridden by the caller.
    if (!fetchOptions.cache && !fetchOptions.next) {
      fetchOptions.next = { revalidate: 60 };
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    
    // If there's an existing signal, we want to abort if EITHER the passed signal aborts or our timeout fires
    if (init?.signal) {
      init.signal.addEventListener('abort', () => controller.abort());
    }
    
    fetchOptions.signal = controller.signal;

    try {
      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        console.warn(`[safeFetch] Non-2xx response from ${url}: ${res.status} ${res.statusText}`);
        return fallbackValue;
      }
      return await res.json();
    } finally {
      clearTimeout(id);
    }
  } catch (error) {
    console.warn(`[safeFetch] Failed to fetch ${url} (returning fallback). Error: ${(error as Error).message}`);
    return fallbackValue;
  }
}
