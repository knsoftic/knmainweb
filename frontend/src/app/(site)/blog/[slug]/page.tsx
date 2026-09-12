import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { resolveImageUrl } from '../../../../utils/image-url';
import Link from 'next/link';
import Image from 'next/image';
import LikeButton from '../../../../components/blog/LikeButton';
import CommentForm from '../../../../components/blog/CommentForm';
import ShareButtons from '../../../../components/blog/ShareButtons';
import { JsonLd } from '../../../../components/seo/json-ld';
import { PageHeroBackground } from '../../../../components/common/page-hero';
import { SplitWords } from '../../../../components/common/split-words';
import { apiUrl } from '../../../../utils/api-url';
import { fetchApi, safeFetch } from '../../../../utils/safe-fetch';
import { SITE_NAME, SITE_URL } from '../../../../utils/site';

type Props = {
  params: Promise<{ slug: string }>;
};

const TIME_ZONE = 'Asia/Karachi';
const DEFAULT_SHARE_IMAGE = '/assets/images/cover-object.png';

const formatDate = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Date(value).toLocaleDateString('en-US', { timeZone: TIME_ZONE, ...options });

const postPath = (slug: string) => `/blog/${encodeURIComponent(String(slug).trim())}`;

// Post HTML comes from the admin's rich-text editor; strip anything that could run script.
const sanitizeContent = (html: string) => sanitizeHtml(html || '', {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'title'],
    '*': ['class', 'style'],
  },
  allowedStyles: {
    '*': {
      color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
      'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
      'text-align': [/^(left|right|center|justify)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
  // The editor stores many spaces as &nbsp;, which glues whole sentences into one "word" that then
  // breaks mid-word on narrow columns. Plain spaces let the text wrap between words.
  textFilter: (text) => text.replace(/ |&nbsp;/g, ' '),
  transformTags: {
    // Uploaded images are stored as /uploads/... and live on the API host.
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, src: resolveImageUrl(attribs.src) } }),
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer' } : attribs,
    }),
  },
});

// Returns the post, null for a real 404, and throws if the API couldn't answer, so an outage
// shows an error page instead of a cached "not found".
// Uncached so like/view counts are current; cache() makes the metadata and the page share one
// request per visit, so each visit is counted once.
const getPost = cache(async (slug: string) => {
  const result = await fetchApi(apiUrl(`/blog/posts/${encodeURIComponent(slug)}`), { cache: 'no-store' });
  if (result.ok) return result.data;
  if (result.status === 404) return null;
  throw new Error(`Blog post "${slug}" could not be loaded (status ${result.status || 'unreachable'})`);
});

async function getComments(postId: number) {
  // Uncached so a new comment appears as soon as the page refreshes.
  return await safeFetch(apiUrl(`/blog/posts/${postId}/comments`), [], { cache: 'no-store' }, { optional: true });
}

// Route params may arrive percent-encoded; old links to "/blog/%20my-post" redirect to "/blog/my-post".
function readSlug(raw: string) {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {}
  return { decoded, slug: decoded.trim() };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = readSlug((await params).slug);
  const [post, globalSeo] = await Promise.all([
    getPost(slug).catch(() => null),
    safeFetch(apiUrl('/seo/global'), {}, { next: { revalidate: 60 } }, { optional: true }),
  ]);
  if (!post) return { title: 'Post Not Found', robots: { index: false } };

  const brand: string = globalSeo?.website_title || SITE_NAME;
  const title: string = post.meta_title || post.title;
  const shareImage = resolveImageUrl(post.og_image || post.featured_image || globalSeo?.default_og_image, DEFAULT_SHARE_IMAGE);

  return {
    // The layout appends "| KN Softic"; skip that when the title already names the brand.
    title: title.toLowerCase().includes(brand.toLowerCase()) ? { absolute: title } : title,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords,
    alternates: {
      canonical: post.canonical_url || postPath(post.slug),
    },
    openGraph: {
      type: 'article',
      url: postPath(post.slug),
      title: post.og_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt,
      images: [{ url: shareImage }],
      publishedTime: post.published_at || post.created_at,
    },
    twitter: {
      card: post.twitter_card || 'summary_large_image',
      images: [shareImage],
    }
  };
}

export default async function SingleBlogPage({ params }: Props) {
  const { decoded, slug } = readSlug((await params).slug);
  if (slug && slug !== decoded) {
    permanentRedirect(postPath(slug));
  }

  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  const comments = post.allow_comments ? await getComments(post.id) : [];
  const publishedDate = post.published_at || post.created_at;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: resolveImageUrl(post.featured_image, `${SITE_URL}${DEFAULT_SHARE_IMAGE}`),
    datePublished: publishedDate,
    dateModified: post.updated_at || publishedDate,
    author: { '@type': 'Person', name: post.author || SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}${postPath(post.slug)}`,
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={post.schema_markup} />

      <header className="ks-page-hero ks-article-hero" id="top">
        <PageHeroBackground />
        <div className="ks-container">
          <div className="ks-page-hero__inner">
            <nav aria-label="Breadcrumb">
              <ol className="ks-crumbs">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><span aria-current="page">{post.title.length > 40 ? post.title.substring(0, 40) + '…' : post.title}</span></li>
              </ol>
            </nav>
            {post.category_name && (
              <span className="ks-badge"><span className="ks-badge__dot" aria-hidden="true"></span> {post.category_name}</span>
            )}
            <h1 className="ks-display ks-page-hero__title"><SplitWords text={post.title} /></h1>
            <div className="ks-article-meta">
              <span>
                <i className="fa-regular fa-calendar" aria-hidden="true" />
                {formatDate(publishedDate, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {post.updated_at && formatDate(post.updated_at, { dateStyle: 'short' }) !== formatDate(publishedDate, { dateStyle: 'short' }) && (
                <span style={{ fontStyle: 'italic' }}>
                  Updated {formatDate(post.updated_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              {post.reading_time && (
                <span><i className="fa-regular fa-clock" aria-hidden="true" />{post.reading_time} min read</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="ks-container">
        <div className="ks-article-cover">
          {post.featured_image ? (
            <Image
              src={resolveImageUrl(post.featured_image)}
              alt={post.title}
              priority
              width={1200}
              height={600}
            />
          ) : (
            <div className="ks-article-cover__placeholder" aria-hidden="true">
              <i className="fa-regular fa-newspaper"></i>
            </div>
          )}
        </div>
      </div>

      <section className="ks-section" style={{ paddingTop: 0 }}>
        <div className="ks-container">
          <article className="ks-article">

              <div className="ks-article-author">
                <span className="ks-article-author__avatar" aria-hidden="true"><i className="fa fa-user" /></span>
                <div>
                  <strong>{post.author || 'Admin'}</strong>
                  <span>Author</span>
                </div>
                <div className="ks-article-author__stats">
                  <span className="ks-stat-inline"><i className="fa fa-eye" aria-hidden="true" />{post.view_count || 0} views</span>
                  <Link href="/blog" className="ks-link"><i className="fa fa-arrow-left" aria-hidden="true" /> Back to Blog</Link>
                </div>
              </div>

              {/* Blog Body */}
              <div
                className="blog-content-body"
                dangerouslySetInnerHTML={{ __html: sanitizeContent(post.content) }}
              />

              {/* Tags */}
              {post.tags_json && (() => {
                try {
                  const tags = JSON.parse(post.tags_json);
                  return tags.length > 0 ? (
                    <div className="ks-tags" style={{ marginTop: '40px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--ks-ink)', fontSize: '0.9rem', marginRight: '4px' }}>
                        <i className="fa fa-tags" aria-hidden="true" style={{ marginRight: '6px', color: 'var(--ks-violet)' }} />Tags:
                      </span>
                      {tags.map((tag: string, i: number) => (
                        <span key={i} className="ks-chip ks-chip--white">#{String(tag).replace(/,\s*$/, '')}</span>
                      ))}
                    </div>
                  ) : null;
                } catch { return null; }
              })()}

              {/* Like + Share */}
              <div className="ks-article-actions" data-reveal="">
                <div className="ks-article-actions__like">
                  <span style={{ color: 'var(--ks-muted)', fontSize: '0.95rem' }}>Found this post helpful?</span>
                  <LikeButton postId={post.id} initialLikes={post.like_count || 0} />
                </div>
                <ShareButtons slug={String(post.slug).trim()} title={post.title} />
              </div>

              {/* Previous & Next Navigation */}
              {(post.prev_post || post.next_post) && (
                <nav className="ks-postnav" aria-label="More articles" data-reveal="stagger">
                  {post.prev_post ? (
                    <Link href={postPath(post.prev_post.slug)}>
                      <small>← Previous Post</small>
                      <span>{post.prev_post.title}</span>
                    </Link>
                  ) : <span />}
                  {post.next_post ? (
                    <Link href={postPath(post.next_post.slug)} className="is-next">
                      <small>Next Post →</small>
                      <span>{post.next_post.title}</span>
                    </Link>
                  ) : <span />}
                </nav>
              )}

              {/* Related Posts */}
              {post.related_posts && post.related_posts.length > 0 && (
                <div style={{ marginTop: '70px' }}>
                  <h2 className="ks-title" style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Related Articles</h2>
                  <div className="ks-grid" data-reveal="stagger">
                    {post.related_posts.map((rp: any) => (
                      <Link href={postPath(rp.slug)} className="ks-card ks-card--hover ks-post-card" key={rp.id}>
                        <span className="ks-post-card__media" style={{ aspectRatio: '16 / 11' }}>
                          {rp.featured_image ? (
                            <Image src={resolveImageUrl(rp.featured_image)} alt="" fill sizes="(max-width: 767px) 100vw, 260px" />
                          ) : (
                            <span className="ks-article-cover__placeholder" style={{ height: '100%', fontSize: '2.4rem' }} aria-hidden="true">
                              <i className="fa-regular fa-newspaper" />
                            </span>
                          )}
                        </span>
                        <span className="ks-card__body" style={{ padding: '18px' }}>
                          <span className="ks-meta" style={{ marginBottom: '6px' }}>
                            {formatDate(rp.published_at || rp.created_at, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="ks-card__title" style={{ fontSize: '1rem', marginBottom: 0 }}>
                            {rp.title.length > 60 ? rp.title.substring(0, 60) + '...' : rp.title}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {post.allow_comments && (
                <div style={{ marginTop: '70px' }} data-reveal="">

                  {/* Comments List */}
                  <h2 className="ks-title" style={{ fontSize: '1.6rem', marginBottom: '28px' }}>
                    <i className="fa-regular fa-comments" aria-hidden="true" style={{ marginRight: '10px', color: '#7a6ad8' }} />
                    Comments ({comments.filter((c: any) => !c.parent_id).length})
                  </h2>

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
                        <i className="fa-regular fa-comment" style={{ fontSize: '2rem', color: '#ccc', display: 'block', marginBottom: '12px' }} />
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
                                    {formatDate(parent.created_at, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

                                    {/* Avatar: shield only for replies posted by staff from the admin panel */}
                                    <div style={{
                                      width: '32px', height: '32px', borderRadius: '50%',
                                      background: Number(reply.is_staff) === 1 ? '#1a1a2e' : 'linear-gradient(135deg, #8D18D0, #3930C7)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                      fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, position: 'relative', zIndex: 2
                                    }}>
                                      {Number(reply.is_staff) === 1 ? <i className="fa fa-shield" /> : String(reply.name || '?').charAt(0).toUpperCase()}
                                    </div>

                                    {/* Reply Content Column */}
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <h5 style={{ margin: 0, color: '#1a1a2e', fontSize: '0.95rem', fontWeight: 700 }}>
                                            {reply.name}
                                          </h5>
                                          {Number(reply.is_staff) === 1 && (
                                            <span style={{
                                              fontSize: '0.65rem', background: '#8D18D0', color: '#ffffff',
                                              padding: '2px 6px', borderRadius: '8px', fontWeight: 700,
                                              textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>
                                              Author
                                            </span>
                                          )}
                                        </div>
                                        <span style={{ color: '#888', fontSize: '0.75rem' }}>
                                          {formatDate(reply.created_at, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

          </article>
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
          font-size: inherit;
          line-height: inherit;
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
      `}} />
    </>
  );
}
