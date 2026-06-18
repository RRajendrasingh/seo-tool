// Database-driven blog post store communicating with server-side MySQL endpoints.
// Safe for server-side pre-rendering (SSR) and client hydration.

export const DEFAULT_POSTS = [
  {
    id: "post_1",
    slug: "google-core-update-2026",
    title: "Google Core Update 2026: Shift Towards Site Speed & Authority",
    desc: "Google's latest search core update emphasizes user experiences, highlighting page performance, layout shifts, and genuine domain authority. Learn how to protect your rankings.",
    category: "Core Updates",
    date: "June 08, 2026",
    readTime: "5 min read",
    author: "Sarah Jenkins",
    featuredImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
    featured: true,
  },
  {
    id: "post_2",
    slug: "ai-search-overviews",
    title: "AI Search Overviews: How to Optimize for LLM Retrieval",
    desc: "Generative AI is changing search dynamics. Learn how search engines extract snippets and how to format your content to be cited in AI overviews.",
    category: "AI Search",
    date: "June 05, 2026",
    readTime: "4 min read",
    author: "Martin",
    featuredImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
    featured: false,
  },
  {
    id: "post_3",
    slug: "multi-location-local-seo",
    title: "The Ultimate Local SEO Checklist for Multi-Location Businesses",
    desc: "Managing SEO across dozens of locations in the US, UK, and India? Here is the schema markup, directory listings, and landing page templates you need.",
    category: "Local SEO",
    date: "May 28, 2026",
    readTime: "3 min read",
    author: "Martin",
    featuredImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
    featured: false,
  },
  {
    id: "post_4",
    slug: "static-site-core-web-vitals",
    title: "How Static Site Exports Boost Core Web Vitals to 99+",
    desc: "A technical walkthrough on using Next.js Static Export to eliminate server response delays and hit near-perfect Lighthouse scores automatically.",
    category: "Technical Guides",
    date: "May 20, 2026",
    readTime: "3 min read",
    author: "Vikram Mehta",
    featuredImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
    featured: false,
  },
  {
    id: "post_5",
    slug: "google-business-profile-proximity",
    title: "Optimizing Google Business Profile for Proximity Rankings",
    desc: "Proximity is a critical ranking factor for mobile map results. See how localized review campaigns and category stacking can improve map visibility.",
    category: "Local SEO",
    date: "May 15, 2026",
    readTime: "3 min read",
    author: "Martin",
    featuredImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80",
    featured: false,
  },
];

// Helper to calculate read time automatically based on word count
const calculateReadTime = (content, desc) => {
  const text = `${desc || ""} ${content || ""}`.replace(/<[^>]*>/g, " "); // Strip HTML
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 225); // Average 225 WPM
  return minutes > 0 ? minutes : 1;
};

export const getAllPosts = async () => {
  if (typeof window === "undefined") return DEFAULT_POSTS;
  try {
    const res = await fetch(`/api/posts?_t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch posts");
    return await res.json();
  } catch (e) {
    console.error("postsStore: Failed to get posts:", e);
    return DEFAULT_POSTS;
  }
};

export const getPostBySlug = async (slug) => {
  if (typeof window === "undefined") {
    return DEFAULT_POSTS.find((p) => p.slug === slug) || null;
  }
  try {
    const res = await fetch(`/api/posts/${slug}`);
    if (!res.ok) throw new Error("Failed to fetch post details");
    return await res.json();
  } catch (e) {
    console.error(`postsStore: Failed to get post by slug (${slug}):`, e);
    return DEFAULT_POSTS.find((p) => p.slug === slug) || null;
  }
};

export const addPost = async (postData) => {
  const readMin = calculateReadTime(postData.content, postData.desc);
  
  let generatedSlug = (postData.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
    
  if (!generatedSlug) {
    generatedSlug = postData.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const payload = {
    slug: generatedSlug,
    title: postData.title.trim(),
    desc: postData.desc.trim(),
    content: postData.content || "",
    category: postData.category || "Core Updates",
    date: postData.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    readTime: `${readMin} min read`,
    author: postData.author?.trim() || "Martin",
    featuredImage: (postData.featuredImage || "").trim(),
    featured: postData.featured || false,
  };

  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add post");
    return data;
  } catch (e) {
    console.error("postsStore: Failed to add post:", e);
    throw e;
  }
};

export const deletePost = async (id) => {
  try {
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete post");
    return data;
  } catch (e) {
    console.error(`postsStore: Failed to delete post (${id}):`, e);
    throw e;
  }
};

export const updatePost = async (id, postData) => {
  const readMin = calculateReadTime(postData.content, postData.desc);
  
  let generatedSlug = (postData.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
    
  if (!generatedSlug) {
    generatedSlug = postData.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const payload = {
    slug: generatedSlug,
    title: postData.title.trim(),
    desc: postData.desc.trim(),
    content: postData.content || "",
    category: postData.category || "Core Updates",
    date: postData.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    readTime: `${readMin} min read`,
    author: postData.author?.trim() || "Martin",
    featuredImage: (postData.featuredImage || "").trim(),
    featured: postData.featured || false,
  };

  try {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update post");
    return data;
  } catch (e) {
    console.error(`postsStore: Failed to update post (${id}):`, e);
    throw e;
  }
};


export const resetToDefaultPosts = async () => {
  try {
    // Clear and restore tables on the backend
    const res = await fetch("/api/db-init");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to reset posts");
    
    // Fetch fresh database posts
    return await getAllPosts();
  } catch (e) {
    console.error("postsStore: Failed to reset posts:", e);
    return DEFAULT_POSTS;
  }
};
