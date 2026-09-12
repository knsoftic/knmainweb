import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="ks-404" id="top">
      <div className="ks-container">
        <span className="ks-badge"><span className="ks-badge__dot" aria-hidden="true"></span> ERROR</span>
        <div className="ks-404__code" aria-hidden="true">404</div>
        <h1 className="ks-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>Page Not Found</h1>
        <p className="ks-lead ks-lead--light">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let&apos;s get you back on track.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          <Link href="/" className="ks-btn ks-btn--light">Back To Home <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
          <Link href="/contact" className="ks-btn ks-btn--ghost">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
