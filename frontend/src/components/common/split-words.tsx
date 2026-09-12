import { Fragment } from 'react';

/**
 * Wraps each word in a masked span so headings can animate in word by word (`.ks-word` in ks-design.css).
 * The text itself is unchanged, so it reads and indexes normally.
 */
export function SplitWords({ text }: { text?: string | null }) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);

  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="ks-word">
            <span style={{ '--i': index } as React.CSSProperties}>{word}</span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
