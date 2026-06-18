import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackingScripts from "@/components/TrackingScripts";

export const metadata = {
  title: "SEOIntellect AI | AI-Powered SEO Audits & Local SEO Services",
  description: "Boost your search engine rankings with automated AI SEO audits, high-performance web development, and hyper-targeted location pages.",
  keywords: ["SEO services", "AI SEO audit", "local SEO agency", "website audit tool", "automated SEO report"],
};

export default function RootLayout({ children }) {
  const themeScript = `
    (function() {
      try {
        const theme = localStorage.getItem('theme');
        if (theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning={true}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Load Geist and Geist Mono fonts dynamically in the browser */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden"
        suppressHydrationWarning={true}
      >
        <TrackingScripts />
        <Navbar />
        <main className="flex-grow overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

