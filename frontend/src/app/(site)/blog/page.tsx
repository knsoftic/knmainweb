import Link from 'next/link';
import Image from 'next/image';
import { PageHero } from '../../../components/common/page-hero';
import { resolveImageUrl } from '../../../utils/image-url';
import { apiUrl } from '../../../utils/api-url';



import { safeFetch } from '../../../utils/safe-fetch';

async function getPublishedPosts() {
  return await safeFetch(apiUrl('/blog/posts?status=published'), [], { next: { revalidate: 60 } });
}
import { generatePageMetadata } from '../../../utils/seo';

export async function generateMetadata() {
  return generatePageMetadata('blog');
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const pageSeo = await safeFetch(apiUrl('/seo/pages/blog'), null, { next: { revalidate: 60 } });

  return (
    <>
      <PageHero
        badge="OUR BLOG"
        title={pageSeo?.h1_heading || "Our Blog"}
        description="Insights, updates, and tutorials from the experts at KN Softic."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', active: true }]}
      />

      <section className="section" style={{ marginTop: '80px', paddingBottom: '100px' }}>
        <div className="container">

          {posts.length === 0 ? (
            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <div style={{
                  background: '#f6f5ff',
                  borderRadius: '28px',
                  padding: '80px 40px',
                  border: '1px solid rgba(122,106,216,0.08)',
                }}>
                  <i className="fa fa-file-text-o" style={{ fontSize: '3rem', color: '#ccc', display: 'block', marginBottom: '20px' }} />
                  <h4 style={{ color: '#888', fontWeight: 600 }}>No posts available yet.</h4>
                  <p style={{ color: '#aaa', marginTop: '8px' }}>Check back soon for new articles!</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="row gy-4">
              {posts.map((post: any) => (
                <div key={post.id} className="col-lg-4 col-md-6">
                  <article className="blog-listing-card" style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '1px solid rgba(122,106,216,0.08)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    {/* Image */}
                    <Link href={`/blog/${post.slug}`} style={{ display: 'block', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '210px', overflow: 'hidden', position: 'relative' }}>
                        <Image
                          src={post.featured_image ? resolveImageUrl(post.featured_image) : '/assets/images/default-blog.jpg'}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          className="blog-card-img"
                        />
                        {post.category_name && (
                          <span style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            background: 'var(--gradient)',
                            color: '#fff',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            letterSpacing: '0.3px',
                          }}>
                            {post.category_name}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Meta */}
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', fontSize: '0.82rem', color: '#888', alignItems: 'center' }}>
                        <span><i className="fa fa-user-o" style={{ marginRight: '5px', color: '#7a6ad8' }} />{post.author || 'Admin'}</span>
                        <span><i className="fa fa-calendar-o" style={{ marginRight: '5px', color: '#7a6ad8' }} />{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                        {post.reading_time && <span><i className="fa fa-clock-o" style={{ marginRight: '5px', color: '#7a6ad8' }} />{post.reading_time} min</span>}
                      </div>

                      {/* Title */}
                      <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                        <h4 style={{
                          fontSize: '1.18rem',
                          fontWeight: 700,
                          color: '#1e1e1e',
                          lineHeight: 1.4,
                          marginBottom: '12px',
                          transition: 'color 0.2s ease',
                        }} className="blog-card-title">
                          {post.title}
                        </h4>
                      </Link>

                      {/* Excerpt */}
                      <p style={{
                        color: '#555',
                        fontSize: '0.93rem',
                        lineHeight: 1.65,
                        marginBottom: '20px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                      }}>
                        {post.excerpt || post.content.replace(/<[^>]+>/g, '').substring(0, 140) + '...'}
                      </p>

                      {/* Footer */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(122,106,216,0.08)',
                        marginTop: 'auto',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#888' }}>
                            <i className="fa fa-eye" style={{ marginRight: '4px', color: '#7a6ad8' }} />{post.view_count || 0}
                          </span>
                          {(post.like_count > 0) && (
                            <span style={{ fontSize: '0.85rem', color: '#7a6ad8', fontWeight: 600 }}>
                              <i className="fa fa-heart" style={{ marginRight: '4px' }} />{post.like_count}
                            </span>
                          )}
                        </div>
                        <Link href={`/blog/${post.slug}`} style={{
                          background: 'rgba(122,106,216,0.08)',
                          color: '#7a6ad8',
                          padding: '7px 18px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }} className="blog-read-more">
                          Read More <i className="fa fa-arrow-right" style={{ fontSize: '0.75rem' }} />
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-listing-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 40px rgba(122,106,216,0.15) !important;
          border-color: rgba(122,106,216,0.25) !important;
        }
        .blog-listing-card:hover .blog-card-img {
          transform: scale(1.06) !important;
        }
        .blog-listing-card:hover .blog-card-title {
          color: #7a6ad8 !important;
        }
        .blog-read-more:hover {
          background: var(--gradient) !important;
          color: #fff !important;
        }
      `}} />
    </>
  );
}
