import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="premium-hero-section d-flex align-items-center" id="top" style={{ minHeight: '85vh' }}>
      <div className="container position-relative z-index-2">
        <div className="tab-content" id="heroTabContent">
          <div className="tab-pane fade show active" id="slide-1" role="tabpanel" aria-labelledby="slide-1-tab">
            <div className="row align-items-center gy-4">
              <div className="col-lg-12 text-center">
                <div className="hero-badge mb-2"><span className="badge-dot"></span> ERROR</div>
                <div className="error-code mb-2">404</div>
                <h1 className="hero-title mb-3">Page Not Found</h1>
                <p className="hero-description mb-5 text-center" style={{ margin: 'auto', maxWidth: '600px' }}>
                  Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track.
                </p>
                <div className="main-button d-flex justify-content-center"><Link href="/" className="text-decoration-none">Back To Home</Link></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
