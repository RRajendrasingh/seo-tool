"use client";

import React, { useState } from "react";

export default function VideoIntro() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 mb-20 sm:mb-24 z-20">
      <div className="relative rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-zinc-950 p-2 sm:p-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group">
        {/* Glow behind video */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-cyan-500/10 to-fuchsia-500/10 opacity-50" />
        
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-video bg-zinc-900 flex items-center justify-center border border-zinc-800/50">
          {!isPlaying ? (
            <>
              {/* Thumbnail Placeholder Image */}
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                alt="Video Thumbnail"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
              />
              
              {/* Play Button Overlay */}
              <button 
                onClick={() => setIsPlaying(true)}
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-transform hover:scale-110 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                aria-label="Play Intro Video"
              >
                <svg className="h-8 w-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              
              {/* Text on Thumbnail */}
              <div className="absolute bottom-6 left-8 right-8 text-left hidden sm:block">
                <p className="text-white font-bold text-lg sm:text-xl shadow-sm drop-shadow-lg">See how SEOIntellect works in 2 minutes</p>
              </div>
            </>
          ) : (
            /* YouTube iframe */
            <iframe
              className="absolute inset-0 w-full h-full bg-black"
              src="https://www.youtube.com/embed/_jP1Ki4b6cs?autoplay=1&rel=0"
              title="SEOIntellect Intro Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </div>
    </section>
  );
}
