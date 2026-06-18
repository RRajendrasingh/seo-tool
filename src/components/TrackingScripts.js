"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getSettings } from "@/utils/leadsStore";

export default function TrackingScripts() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    gscVerificationToken: "",
    gtmId: "",
    clarityId: "",
  });

  useEffect(() => {
    setMounted(true);
    const loaded = getSettings();
    setSettings({
      gscVerificationToken: loaded.gscVerificationToken || "",
      gtmId: loaded.gtmId || "",
      clarityId: loaded.clarityId || "",
    });
  }, []);

  // Dynamically inject Google Search Console verification meta tag in head
  useEffect(() => {
    if (!mounted) return;
    try {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (settings.gscVerificationToken && settings.gscVerificationToken.trim() !== "") {
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "google-site-verification";
          document.head.appendChild(meta);
        }
        meta.content = settings.gscVerificationToken.trim();
      } else {
        // If the token is empty but the tag exists from a previous entry, remove it
        if (meta) {
          meta.remove();
        }
      }
    } catch (e) {
      console.error("TrackingScripts: Failed to manage GSC meta tag:", e);
    }
  }, [mounted, settings.gscVerificationToken]);

  const hasGtm = settings.gtmId && settings.gtmId.trim() !== "";
  const hasClarity = settings.clarityId && settings.clarityId.trim() !== "";

  if (!mounted) return null;

  return (
    <>
      {/* Google Tag Manager (GTM) Container */}
      {hasGtm ? (
        <>
          <Script
            id="gtm-script-dynamic"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${settings.gtmId.trim()}');
              `,
            }}
          />
          {/* Noscript fallback for GTM (in case JS is disabled) */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
                <iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtmId.trim()}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
              `,
            }}
          />
        </>
      ) : null}

      {/* Microsoft Clarity Script */}
      {hasClarity ? (
        <Script
          id="clarity-script-dynamic"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","${settings.clarityId.trim()}");
            `,
          }}
        />
      ) : null}
    </>
  );
}
