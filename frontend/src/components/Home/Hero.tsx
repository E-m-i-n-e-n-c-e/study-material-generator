"use client";

import { useState } from "react";
import UrlInputPanel from "@/components/Home/UrlInputPanel";

export default function Hero() {
  const [open, setOpen] = useState(false);
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Turn YouTube videos into study-ready notes
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Paste a video URL and get clean, structured study material in seconds.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white text-sm sm:text-base hover:bg-gray-800"
            aria-expanded={open}
            aria-controls="get-started"
          >
            {open ? "Hide" : "Get Started"}
          </button>
          <a href="#features" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm sm:text-base hover:bg-gray-100">
            Learn More
          </a>
        </div>
      </div>
      <div className="mt-6">
        <UrlInputPanel open={open} />
      </div>
    </section>
  );
}


