import { query } from "@/utils/db";
import { DEFAULT_POSTS } from "@/utils/postsStore";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [
    { slug: "google-core-update-2026" },
    { slug: "ai-search-overviews" },
    { slug: "multi-location-local-seo" },
    { slug: "static-site-core-web-vitals" },
    { slug: "google-business-profile-proximity" },
  ];
}

export async function generateMetadata(props) {
  const params = await props.params;
  const { slug } = params;
  
  let post = null;
  try {
    const posts = await query("SELECT * FROM posts WHERE slug = ?", [slug]);
    if (posts && posts.length > 0) {
      post = posts[0];
    }
  } catch (e) {
    console.error("generateMetadata: Database fetch failed:", e);
  }

  if (!post) {
    post = DEFAULT_POSTS.find((p) => p.slug === slug) || null;
  }

  if (post) {
    return {
      title: `${post.title} | SEOIntellect News`,
      description: post.desc,
      openGraph: {
        title: post.title,
        description: post.desc,
        images: [
          {
            url: post.featuredImage || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
            width: 1200,
            height: 720,
            alt: post.title,
          },
        ],
      },
    };
  }
  return {
    title: "Article Not Found | SEOIntellect",
    description: "The requested article could not be found.",
  };
}

export default async function Page(props) {
  const params = await props.params;
  const { slug } = params;
  
  let post = null;
  try {
    const posts = await query("SELECT * FROM posts WHERE slug = ?", [slug]);
    if (posts && posts.length > 0) {
      post = {
        ...posts[0],
        featured: !!posts[0].featured
      };
    }
  } catch (error) {
    console.error("Failed to load post SSR details:", error);
    const fb = DEFAULT_POSTS.find((p) => p.slug === slug);
    if (fb) post = fb;
  }

  if (!post) {
    return (
      <main className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-400 text-sm py-16 sm:py-24">
        <div className="max-w-md text-center space-y-6 px-4">
          <div className="text-6xl" aria-hidden="true">🔍</div>
          <h1 className="text-xl font-bold text-white">Article Not Found</h1>
          <p className="text-zinc-500 leading-relaxed text-xs">
            The news article you are looking for might have been deleted by the administrator, or the URL path is invalid.
          </p>
          <Link
            href="/news/"
            className="inline-block rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            ← Back to News Feed
          </Link>
        </div>
      </main>
    );
  }

  let dateIso = new Date().toISOString().split('T')[0];
  try {
    if (post.date) {
      const parsed = new Date(post.date);
      if (!isNaN(parsed.getTime())) {
        dateIso = parsed.toISOString().split('T')[0];
      }
    }
  } catch (e) {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.desc,
    "image": [
      post.featuredImage || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80"
    ],
    "datePublished": dateIso,
    "author": {
      "@type": "Person",
      "name": post.author || "Sarah Jenkins"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SEOIntellect AI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://seointellect.com/logo.png"
      }
    }
  };

  return (
    <article className="bg-zinc-950 min-h-screen py-12 sm:py-20 relative isolate text-left overflow-x-hidden">
      {/* JSON-LD Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/3 -z-10 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <Link
            href="/news/"
            className="text-xs font-semibold text-zinc-500 hover:text-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to News Feed
          </Link>
        </nav>

        {/* Hero Cover Image */}
        {post.featuredImage ? (
          <header className="relative overflow-hidden rounded-3xl border border-zinc-880 mb-8 bg-zinc-900/10 h-[300px] sm:h-[450px]">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 80vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />
            <span className="absolute top-5 left-5 rounded-full bg-violet-600/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
              {post.category}
            </span>
          </header>
        ) : (
          <header className="relative h-44 bg-zinc-900 flex items-center justify-center text-7xl select-none border border-zinc-880 rounded-3xl mb-8" aria-hidden="true">
            📰
            <span className="absolute top-5 left-5 rounded-full bg-violet-600/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
              {post.category}
            </span>
          </header>
        )}

        {/* Article Container */}
        <section className="space-y-6">
          {/* Metadata info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-300">{post.author}</span>
            <span>•</span>
            <time dateTime={post.date}>{post.date}</time>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {post.title}
          </h1>

          {/* Short Description Block */}
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed border-l-2 border-violet-600 pl-4 italic bg-zinc-900/10 py-1">
            {post.desc}
          </p>

          {/* Rich HTML body */}
          {post.content ? (
            <div
              className="prose prose-invert prose-sm max-w-none pt-4
                prose-headings:text-white prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-900 prose-h2:pb-2
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-zinc-200
                prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2 prose-h4:text-zinc-300
                prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-p:mb-5
                prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-bold
                prose-em:text-zinc-400
                prose-ul:text-zinc-300 prose-ol:text-zinc-300 prose-ul:list-disc prose-ul:mb-5
                prose-li:text-sm sm:prose-li:text-base prose-li:my-1.5
                prose-blockquote:border-violet-600 prose-blockquote:text-zinc-400 prose-blockquote:not-italic prose-blockquote:bg-zinc-900/20 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                prose-code:text-violet-300 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:p-4
                prose-table:text-xs sm:prose-table:text-sm prose-table:w-full prose-table:border-collapse prose-table:my-6
                prose-th:border-zinc-700 prose-th:text-zinc-300 prose-th:p-2.5 prose-th:bg-zinc-900
                prose-td:border-zinc-800 prose-td:text-zinc-400 prose-td:p-2.5"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-zinc-500 text-sm">No additional content body is available for this article.</p>
          )}

          {/* Bottom Navigation controls */}
          <footer className="border-t border-zinc-850 pt-8 mt-12 flex items-center justify-between">
            <Link
              href="/news/"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to News Feed
            </Link>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
              <span className="bg-zinc-900 px-3 py-1 rounded-md border border-zinc-880">{post.category}</span>
              <span className="bg-zinc-900 px-3 py-1 rounded-md border border-zinc-880">{post.readTime}</span>
            </div>
          </footer>
        </section>
      </div>
    </article>
  );
}
