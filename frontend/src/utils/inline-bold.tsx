import { Fragment } from 'react';

// Admins sometimes type **bold** (Markdown) in plain-text fields such as service descriptions.

/** Renders `**text**` as <strong>, everything else as plain text. */
export function renderInlineBold(text?: string | null) {
  return String(text || '')
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) => (
      /^\*\*[^*]+\*\*$/.test(part)
        ? <strong key={index}>{part.slice(2, -2)}</strong>
        : <Fragment key={index}>{part}</Fragment>
    ));
}

/** Removes the `**` markers, for places that show plain text only. */
export const stripInlineBold = (text?: string | null) => String(text || '').replace(/\*\*([^*]+)\*\*/g, '$1');
