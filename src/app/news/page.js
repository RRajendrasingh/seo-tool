import { query } from "@/utils/db";
import Link from "next/link";
import Image from "next/image";
import NewsInteractiveFilter from "@/components/news/NewsInteractiveFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search Intelligence & Market News | SEOIntellect",
  description: "Stay informed with the latest search engine updates, local SEO playbooks, and development strategies.",
  openGraph: {
    title: "Search Intelligence & Market News | SEOIntellect",
    description: "Stay informed with the latest search engine updates, local SEO playbooks, and development strategies.",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
        width: 1200,
        height: 720,
        alt: "SEOIntellect Search Intelligence & Market News",
      },
    ],
  },
};

export default async function NewsPage(props) {
  const searchParams = await props.searchParams;
  const categoryParam = searchParams?.category || "All";
  const searchParam = searchParams?.search?.toLowerCase() || "";

  let allPosts = [];
  try {
    const posts = await query("SELECT * FROM posts WHERE status = 'published' OR status IS NULL");
    const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    allPosts = sortedPosts.map(post => ({
      ...post,
      featured: !!post.featured
    }));
  } catch (error) {
    console.error("NewsPage SSR failed to load posts:", error);
    const { DEFAULT_POSTS } = require("@/utils/postsStore");
    allPosts = [...DEFAULT_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const categories = ["All", ...Array.from(new Set(allPosts.map((post) => post.category).filter(Boolean)))];

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = categoryParam === "All" || post.category === categoryParam;
    const matchesSearch =
      !searchParam ||
      post.title.toLowerCase().includes(searchParam) ||
      post.desc.toLowerCase().includes(searchParam);
    return matchesCategory && matchesSearch;
  });

  const featuredPost = searchParam ? null : allPosts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => searchParam || !p.featured || categoryParam !== "All");

  return (
    <main className="bg-zinc-950 min-h-screen py-8 sm:py-16 lg:py-24 relative isolate overflow-x-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/3 -z-10 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" aria-hidden="true" />

      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Search Intelligence &amp; Market News
        </h1>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400">
          Stay informed with the latest search engine updates, local SEO playbooks, and development strategies.
        </p>
      </header>

      {/* Interactive Filter Island */}
      <NewsInteractiveFilter categories={categories} />

      {/* Popular Locations Links Bar */}
      <nav className="mx-auto max-w-md px-4 mt-3 text-center" aria-label="Popular locations">
        <p className="text-[10px] text-zinc-500 leading-normal">
          Popular SEO Markets:{" "}
          <Link href="/seo-services/new-york/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">New York</Link> •{" "}
          <Link href="/seo-services/los-angeles/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Los Angeles</Link> •{" "}
          <Link href="/seo-services/chicago/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Chicago</Link> •{" "}
          <Link href="/seo-services/houston/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Houston</Link> •{" "}
          <Link href="/seo-services/austin/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Austin</Link> •{" "}
          <Link href="/seo-services/" className="text-violet-400 hover:text-violet-300 font-bold underline transition-colors">All Locations →</Link>
        </p>
      </nav>

      {/* Content Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 space-y-8 sm:space-y-12" aria-label="Articles">
        {/* Featured Post Card */}
        {categoryParam === "All" && featuredPost && (
          <Link
            href={`/news/${featuredPost.slug}/`}
            className="cursor-pointer rounded-3xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch group overflow-hidden block"
            aria-label={`Read featured article: ${featuredPost.title}`}
          >
            <div className="lg:col-span-5 h-40 sm:h-56 lg:h-auto relative overflow-hidden">
              {featuredPost.featuredImage ? (
                <Image
                  src={featuredPost.featuredImage}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-zinc-950 border-r border-zinc-850/80 flex items-center justify-center text-7xl select-none" aria-hidden="true">
                  📰
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-zinc-900/80" />
              <span className="absolute top-4 left-4 rounded-full bg-violet-600/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                ⭐ Featured
              </span>
            </div>

            <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 space-y-2.5 sm:space-y-4 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xxs sm:text-xs font-medium text-zinc-500">
                <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold text-violet-300">
                  {featuredPost.category}
                </span>
                <time dateTime={featuredPost.date}>{featuredPost.date}</time>
                <span>•</span>
                <span>{featuredPost.readTime}</span>
              </div>
              <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-2 lg:line-clamp-none">
                {featuredPost.title}
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 lg:line-clamp-none">{featuredPost.desc}</p>
              <div className="pt-2 sm:pt-4 flex items-center justify-between">
                <span className="text-xxs sm:text-xs text-zinc-500">By {featuredPost.author}</span>
                <span className="inline-flex items-center gap-1.5 text-xxs sm:text-xs font-bold text-violet-400 group-hover:text-violet-300">
                  Read Article
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        )}

        {regularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {regularPosts.map((post) => (
              <article key={post.id || post.title} className="h-full">
                <Link
                  href={`/news/${post.slug}/`}
                  className="cursor-pointer rounded-2xl border border-zinc-880 bg-zinc-900/30 flex flex-col justify-between hover:border-zinc-700 transition-all group overflow-hidden block h-full"
                  aria-label={`Read article: ${post.title}`}
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="h-32 sm:h-44 relative overflow-hidden border-b border-zinc-850/30">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-5xl select-none group-hover:scale-[1.01] transition-transform" aria-hidden="true">
                          📰
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
                      <span
                        style={{ color: '#ffffff' }}
                        className="absolute bottom-3 left-3 rounded-full bg-black/75 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold border border-white/10"
                      >
                        {post.category}
                      </span>
                    </div>

                    <div className="px-4 sm:px-6 space-y-1.5 sm:space-y-2">
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                        <time dateTime={post.date}>{post.date}</time>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {post.desc}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 mt-3 mb-4 border-t border-zinc-850 pt-3 flex items-center justify-between text-xxs">
                    <span className="text-zinc-500">By {post.author}</span>
                    <span className="inline-flex items-center gap-1 text-violet-400 group-hover:text-violet-300 font-semibold">
                      Read
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <p>No articles found matching your criteria.</p>
          </div>
        )}
      </section>
    </main>
  );
}
