'use client';

import Link from 'next/link';
import { useState, type ComponentProps } from 'react';

/**
 * A `Link` that prefetches its page only once a visitor shows they might follow it - the pointer
 * moves over it, a finger lands on it, or it receives keyboard focus - rather than as soon as it
 * is on screen.
 *
 * By default Next.js prefetches every link in view, and the header and footer between them link to
 * almost every page. Lighthouse runs on the homepage showed 15-16 of those background requests
 * (about 44 KB) starting within the first seconds of the load, each one parsed on the main thread
 * while the page is still becoming interactive - blocking time the visitor pays for pages they may
 * never open. Waiting for intent keeps navigation fast for the page someone is about to click and
 * drops the rest.
 *
 * This is the hover-triggered pattern from the Next.js prefetching guide, extended to touch and
 * keyboard so phones and keyboard users get the same head start. Any handlers passed in still run.
 */
export function IntentLink({ onMouseEnter, onTouchStart, onFocus, prefetch, ...props }: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      prefetch={intent ? (prefetch ?? null) : false}
      onMouseEnter={(event) => {
        setIntent(true);
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        setIntent(true);
        onTouchStart?.(event);
      }}
      onFocus={(event) => {
        setIntent(true);
        onFocus?.(event);
      }}
    />
  );
}
