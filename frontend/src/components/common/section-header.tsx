type SectionHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Link or button shown under the description. */
  action?: React.ReactNode;
  align?: 'split' | 'center';
  light?: boolean;
  compact?: boolean;
  /** Heading level; sections are h2 unless the page needs otherwise. */
  as?: 'h2' | 'h3';
};

/** Section title block: eyebrow + heading on the left, summary + action on the right (stacked on small screens). */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'split',
  light = false,
  compact = false,
  as: Heading = 'h2',
}: SectionHeaderProps) {
  const classes = ['ks-head', align === 'center' ? 'ks-head--center' : '', compact ? 'ks-head--compact' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-reveal="stagger">
      <div>
        <p className={`ks-eyebrow${light ? ' ks-eyebrow--light' : ''}`}>{eyebrow}</p>
        <Heading className={`ks-title${light ? ' ks-title--light' : ''}`}>{title}</Heading>
      </div>
      {(description || action) && (
        <div className="ks-head__aside">
          {description && <p className={`ks-lead${light ? ' ks-lead--light' : ''}`}>{description}</p>}
          {action}
        </div>
      )}
    </div>
  );
}
