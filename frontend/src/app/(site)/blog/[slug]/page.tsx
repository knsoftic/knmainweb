import { resolveImageUrl } from '../../../../utils/image-url';
import Link from 'next/link';
import Image from 'next/image';
import LikeButton from '../../../../components/blog/LikeButton';
import CommentForm from '../../../../components/blog/CommentForm';
import ShareButtons from '../../../../components/blog/ShareButtons';
import { apiUrl } from '../../../../utils/api-url';
import { safeFetch } from '../../../../utils/safe-fetch';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.meta_description,
      images: [post.og_image || resolveImageUrl(post.featured_image)],
    },
    twitter: {
      card: post.twitter_card || 'summary_large_image',
    }
  };
}

async function getPost(slug: string) {
  return await safeFetch(apiUrl(`/blog/posts/${slug}`), null, { next: { revalidate: 60 } });
}

async function getComments(postId: number) {
  return await safeFetch(apiUrl(`/blog/posts/${postId}/comments`), [], { next: { revalidate: 60 } });
}

export default async function SingleBlogPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div style={{ padding: '160px 20px', textAlign: 'center' }}>
        <div className="container">
          <i className="fa fa-exclamation-circle" style={{ fontSize: '4rem', color: '#ccc', display: 'block', marginBottom: '24px' }} />
          <h2 style={{ color: '#1e1e1e', marginBottom: '16px' }}>Post Not Found</h2>
          <p style={{ color: '#888', marginBottom: '32px' }}>The blog post you are looking for does not exist or has been removed.</p>
          <Link href="/blog" style={{
            background: 'var(--gradient)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '50px',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const comments = post.allow_comments ? await getComments(post.id) : [];

  return (
    <>
      {/* Breadcrumb & Header Background */}
      <div className="premium-hero-section" style={{ padding: '130px 0 24px', minHeight: 'auto', borderBottom: 'none' }}>
        <div className="container position-relative z-index-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.9rem' }}>
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/blog" className="text-decoration-none" style={{ color: 'rgba(255,255,255,0.7)' }}>Blog</Link>
              </li>
              <li className="breadcrumb-item active text-white fw-semibold" aria-current="page">
                {post.title.length > 40 ? post.title.substring(0, 40) + '…' : post.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Featured Image Hero Section */}
      <section className="blog-hero-image-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="blog-featured-image-wrapper">
                {post.featured_image ? (
                  <Image
                    src={resolveImageUrl(post.featured_image)}
                    alt={post.title}
                    className="blog-featured-image"
                    priority
                    width={1200}
                    height={600}
                  />
                ) : (
                  <div className="blog-featured-placeholder">
                    <div style={{ textAlign: 'center' }}>
                      <i className="fa fa-newspaper-o" style={{ fontSize: '4rem', marginBottom: '16px', display: 'block' }}></i>
                      <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{post.title}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Title & Meta Info */}
      <section style={{ padding: '48px 0 0' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">

              {/* Back to Blog */}
              <div style={{ marginBottom: '24px' }}>
                <Link href="/blog" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(122,106,216,0.08)',
                  color: '#7a6ad8',
                  padding: '10px 22px',
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(122,106,216,0.15)',
                }} className="blog-back-btn">
                  <i className="fa fa-arrow-left" />
                  Back to Blog
                </Link>
              </div>

              {/* Category + Date Row */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                {post.category_name && (
                  <span style={{
                    background: 'rgba(122,106,216,0.1)',
                    color: '#7a6ad8',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: '1px solid rgba(122,106,216,0.2)',
                  }}>
                    {post.category_name}
                  </span>
                )}
                <span style={{ color: '#888', fontSize: '0.88rem' }}>
                  <i className="fa fa-calendar-o" style={{ marginRight: '6px' }} />
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                {post.updated_at && new Date(post.updated_at).toLocaleDateString() !== new Date(post.published_at || post.created_at).toLocaleDateString() && (
                  <span style={{ color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    (Updated: {new Date(post.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#1e1e1e', lineHeight: 1.25, marginBottom: '20px' }}>
                {post.title}
              </h1>

              {/* Author + Stats */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.9rem', color: '#666', paddingBottom: '32px', borderBottom: '1px solid #eee' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff',
                  }}>
                    <i className="fa fa-user" />
                  </span>
                  <strong style={{ color: '#1e1e1e' }}>{post.author || 'Admin'}</strong>
                </span>
                {post.reading_time && (
                  <span><i className="fa fa-clock-o" style={{ marginRight: '6px', color: '#7a6ad8' }} />{post.reading_time} min read</span>
                )}
                <span><i className="fa fa-eye" style={{ marginRight: '6px', color: '#7a6ad8' }} />{post.view_count || 0} views</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '70px 0 100px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">

              {/* Blog Body */}
              <div
                className="blog-content-body"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Like Button Row */}
              <div style={{
                marginTop: '50px',
                paddingTop: '30px',
                borderTop: '1px solid rgba(122,106,216,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
              }}>
                <span style={{ color: '#888', fontSize: '0.95rem' }}>Found this post helpful?</span>
                <LikeButton postId={post.id} initialLikes={post.like_count || 0} />
              </div>

              {/* Tags */}
              {post.tags_json && (() => {
                try {
                  const tags = JSON.parse(post.tags_json);
                  return tags.length > 0 ? (
                    <div style={{
                      marginTop: '30px',
                      paddingTop: '24px',
                      borderTop: '1px solid rgba(122,106,216,0.12)',
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 700, color: '#1e1e1e', fontSize: '0.9rem' }}>
                        <i className="fa fa-tags" style={{ marginRight: '6px', color: '#7a6ad8' }} />Tags:
                      </span>
                      {tags.map((tag: string, i: number) => (
                        <span key={i} style={{
                          background: 'rgba(122,106,216,0.08)',
                          color: '#7a6ad8',
                          padding: '5px 14px',
                          borderRadius: '20px',
                          fontSize: '0.83rem',
                          fontWeight: 600,
                          border: '1px solid rgba(122,106,216,0.15)',
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null;
                } catch { return null; }
              })()}

              {/* Social Share Buttons */}
              <ShareButtons slug={post.slug} title={post.title} />

              {/* Previous & Next Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '20px',
                marginTop: '50px',
                paddingTop: '30px',
                borderTop: '1px solid rgba(122,106,216,0.12)',
                flexWrap: 'wrap'
              }}>
                {post.prev_post ? (
                  <Link href={`/blog/${post.prev_post.slug}`} className="blog-nav-card" style={{ flex: '1', minWidth: '250px', textDecoration: 'none', background: '#f8f9fc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}>
                    <div style={{ fontSize: '0.8rem', color: '#7a6ad8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>← Previous Post</div>
                    <div style={{ fontSize: '1.05rem', color: '#1e1e1e', fontWeight: 600 }}>{post.prev_post.title}</div>
                  </Link>
                ) : <div style={{ flex: 1 }} />}
                {post.next_post ? (
                  <Link href={`/blog/${post.next_post.slug}`} className="blog-nav-card" style={{ flex: '1', minWidth: '250px', textDecoration: 'none', background: '#f8f9fc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.3s', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#7a6ad8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Next Post →</div>
                    <div style={{ fontSize: '1.05rem', color: '#1e1e1e', fontWeight: 600 }}>{post.next_post.title}</div>
                  </Link>
                ) : <div style={{ flex: 1 }} />}
              </div>

              {/* Related Posts */}
              {post.related_posts && post.related_posts.length > 0 && (
                <div style={{ marginTop: '70px' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e1e1e', marginBottom: '24px' }}>Related Articles</h3>
                  <div className="row g-4">
                    {post.related_posts.map((rp: any) => (
                      <div className="col-md-6 col-lg-4" key={rp.id}>
                        <Link href={`/blog/${rp.slug}`} className="blog-related-card" style={{ textDecoration: 'none', display: 'block', height: '100%', background: '#fff', borderRadius: '16px', border: '1px solid rgba(122,106,216,0.12)', overflow: 'hidden', transition: 'transform 0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                          <div style={{ width: '100%', height: '160px', background: '#f0f0f0', position: 'relative' }}>
                            {rp.featured_image ? (
                              <Image src={resolveImageUrl(rp.featured_image)} alt={rp.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient)', color: '#fff' }}>
                                <i className="fa fa-newspaper-o" style={{ fontSize: '3rem', opacity: 0.5 }} />
                              </div>
                            )}
                          </div>
                          <div style={{ padding: '20px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>
                              {new Date(rp.published_at || rp.created_at).toLocaleDateString()}
                            </div>
                            <h4 style={{ fontSize: '1.1rem', color: '#1e1e1e', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>
                              {rp.title.length > 50 ? rp.title.substring(0, 50) + '...' : rp.title}
                            </h4>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {post.allow_comments && (
                <div style={{ marginTop: '70px' }}>

                  {/* Comments List */}
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e1e1e', marginBottom: '32px' }}>
                    <i className="fa fa-comments-o" style={{ marginRight: '10px', color: '#7a6ad8' }} />
                    Comments ({comments.filter((c: any) => !c.parent_id).length})
                  </h3>

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    marginBottom: '50px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    overflow: 'hidden'
                  }}>
                    {comments.length === 0 ? (
                      <div style={{
                        padding: '40px 24px',
                        textAlign: 'center',
                        background: '#fafafa'
                      }}>
                        <i className="fa fa-comment-o" style={{ fontSize: '2rem', color: '#ccc', display: 'block', marginBottom: '12px' }} />
                        <p style={{ color: '#888', margin: 0, fontStyle: 'italic' }}>Be the first to leave a comment!</p>
                      </div>
                    ) : (
                      // Render Top-level comments and their replies
                      comments.filter((c: any) => !c.parent_id).map((parent: any, parentIndex: number, parentArray: any[]) => {
                        const replies = comments.filter((c: any) => Number(c.parent_id) === Number(parent.id));
                        return (
                          <div key={parent.id} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            padding: '16px 20px',
                            position: 'relative',
                            borderBottom: parentIndex !== parentArray.length - 1 ? '1px solid #e9ecef' : 'none'
                          }}>
                            {/* Parent Comment */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                              {/* Avatar Column with Thread Line */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                  width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #8D18D0, #3930C7)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                  fontSize: '1rem', fontWeight: 700, flexShrink: 0,
                                  boxShadow: '0 2px 6px rgba(141,24,208,0.15)',
                                  zIndex: 2
                                }}>
                                  {parent.name.charAt(0).toUpperCase()}
                                </div>
                                {/* Thread line connecting to replies if they exist */}
                                {replies.length > 0 && (
                                  <div style={{
                                    flexGrow: 1,
                                    width: '2px',
                                    background: '#e9ecef',
                                    marginTop: '6px',
                                    marginBottom: '-12px'
                                  }} />
                                )}
                              </div>
                              
                              {/* Content Column */}
                              <div style={{ flex: 1, paddingBottom: replies.length > 0 ? '12px' : '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                                  <h5 style={{ margin: 0, color: '#1a1a2e', fontSize: '1rem', fontWeight: 700 }}>
                                    {parent.name}
                                  </h5>
                                  <span style={{ color: '#888', fontSize: '0.8rem' }}>
                                    {new Date(parent.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div style={{ 
                                  color: '#4a4a5a', 
                                  lineHeight: '1.5', 
                                  fontSize: '0.95rem',
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {parent.comment}
                                </div>
                              </div>
                            </div>

                            {/* Nested Replies */}
                            {replies.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                                {replies.map((reply: any, index: number) => (
                                  <div key={reply.id} style={{ display: 'flex', gap: '12px', marginLeft: '18px' }}>
                                    
                                    {/* Thread Line curve to avatar */}
                                    <div style={{ position: 'relative', width: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      {/* Vertical line from top to center of this avatar */}
                                      <div style={{
                                        position: 'absolute',
                                        top: '-16px',
                                        left: '1px', /* align with parent line */
                                        width: '2px',
                                        height: '32px',
                                        background: '#e9ecef',
                                        borderBottomLeftRadius: '10px'
                                      }} />
                                      {/* Horizontal connecting curve */}
                                      <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        left: '1px',
                                        width: '16px',
                                        height: '2px',
                                        background: '#e9ecef',
                                      }} />
                                      {/* If there are more replies below this one, continue the vertical line down */}
                                      {index < replies.length - 1 && (
                                        <div style={{
                                          position: 'absolute',
                                          top: '16px',
                                          left: '1px',
                                          bottom: '-28px', /* connect to next reply */
                                          width: '2px',
                                          background: '#e9ecef'
                                        }} />
                                      )}
                                    </div>

                                    {/* Admin Avatar */}
                                    <div style={{
                                      width: '32px', height: '32px', borderRadius: '50%', background: '#1a1a2e',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                      fontSize: '0.8rem', flexShrink: 0, position: 'relative', zIndex: 2
                                    }}>
                                      <i className="fa fa-shield" />
                                    </div>
                                    
                                    {/* Reply Content Column */}
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <h5 style={{ margin: 0, color: '#1a1a2e', fontSize: '0.95rem', fontWeight: 700 }}>
                                            {reply.name}
                                          </h5>
                                          <span style={{
                                            fontSize: '0.65rem', background: '#8D18D0', color: '#ffffff', 
                                            padding: '2px 6px', borderRadius: '8px', fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '0.5px'
                                          }}>
                                            Author
                                          </span>
                                        </div>
                                        <span style={{ color: '#888', fontSize: '0.75rem' }}>
                                          {new Date(reply.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <div style={{ 
                                        color: '#333344', 
                                        lineHeight: '1.5', 
                                        fontSize: '0.9rem',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        background: '#f8f9fa',
                                        padding: '12px',
                                        borderRadius: '0 10px 10px 10px',
                                        border: '1px solid #f1f3f5'
                                      }}>
                                        {reply.comment}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Comment Form - client component to handle events */}
                  <CommentForm postId={post.id} />

                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content-body {
          font-size: 1.05rem;
          line-height: 1.85;
          color: #3a3a3a;
          overflow-x: hidden;
        }
        /* Force user generated content to be responsive */
        .blog-content-body * {
          max-width: 100% !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        .blog-content-body p, 
        .blog-content-body span {
          white-space: normal !important;
        }
        .blog-content-body h1 {
          font-size: clamp(1.8rem, 4vw, 2.5rem) !important;
          margin: 40px 0 20px;
          font-weight: 800;
          color: #1e1e1e;
          line-height: 1.3 !important;
          white-space: normal !important;
        }
        .blog-content-body h2 {
          font-size: clamp(1.5rem, 3.5vw, 2rem) !important;
          font-weight: 700;
          margin: 40px 0 18px;
          color: #1e1e1e;
          border-left: 4px solid var(--purple);
          padding-left: 16px;
          line-height: 1.3 !important;
          white-space: normal !important;
        }
        .blog-content-body h3 {
          font-size: clamp(1.25rem, 3vw, 1.5rem) !important;
          font-weight: 700;
          margin: 30px 0 14px;
          color: #1e1e1e;
          line-height: 1.4 !important;
          white-space: normal !important;
        }
        .blog-content-body p {
          margin-bottom: 22px;
        }
        .blog-content-body img, .blog-content-body iframe, .blog-content-body video {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 16px;
          margin: 28px 0;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          display: block;
        }
        .blog-content-body ul,
        .blog-content-body ol {
          margin-bottom: 22px;
          padding-left: 24px;
        }
        .blog-content-body li {
          margin-bottom: 10px;
          color: #555;
        }
        .blog-content-body blockquote {
          border-left: 4px solid var(--purple);
          background: #f6f5ff;
          padding: 20px 24px;
          margin: 30px 0;
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: #555;
          font-size: 1.1rem;
        }
        .blog-content-body pre {
          background: #1e1e1e;
          color: #f8f8f2;
          padding: 24px;
          border-radius: 12px;
          overflow-x: auto;
          margin: 28px 0;
          font-size: 0.9rem;
          white-space: pre !important; /* Allow pre to scroll horizontally */
        }
        .blog-content-body a {
          color: var(--purple);
          text-decoration: underline;
        }
        .blog-back-btn:hover {
          background: var(--gradient) !important;
          color: #fff !important;
          border-color: transparent !important;
        }
      `}} />
    </>
  );
}
