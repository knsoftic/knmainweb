import Link from 'next/link';
import Image from 'next/image';
import { PageHero } from '../../../components/common/page-hero';
import { PageSchema } from '../../../components/seo/json-ld';
import { resolveImageUrl } from '../../../utils/image-url';
import { apiUrl } from '../../../utils/api-url';
import { safeFetch } from '../../../utils/safe-fetch';
import { generatePageMetadata } from '../../../utils/seo';
import { revealDelay } from '../../../utils/reveal';

async function getPublishedPosts() {
  return await safeFetch(apiUrl('/blog/posts?status=published'), [], { next: { revalidate: 60 } });
}

export async function generateMetadata() {
  return generatePageMetadata('blog');
}

// Some stored slugs have stray whitespace; trim and encode so the link always resolves.
const postHref = (post: any) => `/blog/${encodeURIComponent(String(post.slug || '').trim())}`;

const getExcerpt = (post: any) => {
  if (post.excerpt) return post.excerpt;
  const text = String(post.content || '').replace(/<[^>]+>/g, '').trim();
  return text ? `${text.substring(0, 140)}...` : '';
};

const formatDate = (post: any) =>
  new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', year: 'numeric', month: 'short', day: 'numeric' });

function PostMeta({ post }: { post: any }) {
  return (
    <div className="ks-post-meta">
      <span><i className="fa-regular fa-user" aria-hidden="true" />{post.author || 'Admin'}</span>
      <span><i className="fa-regular fa-calendar" aria-hidden="true" />{formatDate(post)}</span>
      {post.reading_time && <span><i className="fa-regular fa-clock" aria-hidden="true" />{post.reading_time} min</span>}
    </div>
  );
}

function PostStats({ post }: { post: any }) {
  return (
    <span style={{ display: 'inline-flex', gap: '14px' }}>
      <span className="ks-stat-inline"><i className="fa fa-eye" aria-hidden="true" />{post.view_count || 0}<span className="ks-visually-hidden"> views</span></span>
      {post.like_count > 0 && (
        <span className="ks-stat-inline"><i className="fa fa-heart" aria-hidden="true" />{post.like_count}<span className="ks-visually-hidden"> likes</span></span>
      )}
    </span>
  );
}

function PostImage({ post, sizes, priority = false }: { post: any; sizes: string; priority?: boolean }) {
  return (
    <Link href={postHref(post)} className="ks-post-card__media" tabIndex={-1} aria-hidden="true">
      <Image
        src={post.featured_image ? resolveImageUrl(post.featured_image) : '/assets/images/cover-object.png'}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
      />
      {post.category_name && <span className="ks-chip ks-chip--white">{post.category_name}</span>}
    </Link>
  );
}

export default async function BlogPage() {
  const [data, pageSeo] = await Promise.all([
    getPublishedPosts(),
    safeFetch(apiUrl('/seo/pages/blog'), null, { next: { revalidate: 60 } }),
  ]);
  const posts = Array.isArray(data) ? data : [];
  const [featured, ...rest] = posts;

  return (
    <>
      <PageSchema slug="blog" />
      <PageHero
        badge="OUR BLOG"
        title={pageSeo?.h1_heading || "Our Blog"}
        description="Insights, updates, and tutorials from the experts at KN Softic."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', active: true }]}
      />

      <section className="ks-section">
        <div className="ks-container">
          {!featured ? (
            <div className="ks-empty" style={{ padding: '80px 24px' }}>
              <i className="fa-regular fa-file-lines" aria-hidden="true" style={{ fontSize: '2.6rem', color: 'var(--ks-violet)', display: 'block', marginBottom: '16px' }} />
              <h2 className="ks-card__title">No posts available yet.</h2>
              <p className="ks-card__text">Check back soon for new articles!</p>
            </div>
          ) : (
            <>
              <article className="ks-card ks-post-card ks-featured-post" data-reveal="zoom">
                <PostImage post={featured} sizes="(max-width: 991px) 100vw, 60vw" priority />
                <div className="ks-card__body">
                  <p className="ks-eyebrow">Latest article</p>
                  <PostMeta post={featured} />
                  <h2 className="ks-card__title">
                    <Link href={postHref(featured)}>{featured.title}</Link>
                  </h2>
                  <p className="ks-card__text ks-clamp-3">{getExcerpt(featured)}</p>
                  <div className="ks-card__foot">
                    <Link href={postHref(featured)} className="ks-btn ks-btn--primary ks-btn--sm">
                      Read Article <i className="fa fa-arrow-right" aria-hidden="true" />
                    </Link>
                    <PostStats post={featured} />
                  </div>
                </div>
              </article>

              {rest.length > 0 && (
                <div className="ks-grid">
                  {rest.map((post: any, index: number) => (
                    <article key={post.id} className="ks-card ks-card--hover ks-post-card" data-reveal="" style={revealDelay(index)}>
                      <PostImage post={post} sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 33vw" />
                      <div className="ks-card__body">
                        <PostMeta post={post} />
                        <h2 className="ks-card__title" style={{ fontSize: '1.15rem' }}>
                          <Link href={postHref(post)}>{post.title}</Link>
                        </h2>
                        <p className="ks-card__text ks-clamp-3">{getExcerpt(post)}</p>
                        <div className="ks-card__foot ks-card__foot--line">
                          <PostStats post={post} />
                          <Link href={postHref(post)} className="ks-link" aria-label={`Read more: ${post.title}`}>
                            Read More <i className="fa fa-arrow-right" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
