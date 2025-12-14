"use client";

import { useState } from "react";

export default function Page() {
  const [brief, setBrief] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-purple-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between bg-black/40 border border-purple-500/20 rounded-2xl p-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <img
            src="https://image2url.com/images/1765564566111-6083ed51-e395-4ee6-975d-9d55ac7e9dff.png"
            alt="Asher AI"
            className="w-12 h-12"
          />
          <div>
            <h1 className="text-2xl font-bold">Asher AI</h1>
            <p className="text-sm opacity-70">
              Describe a website. Asher builds it.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 rounded-xl border border-purple-400/30 bg-purple-700/30 hover:bg-purple-700/50"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Builder */}
        <div className={showPreview ? "md:col-span-1" : "md:col-span-3"}>
          <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4 backdrop-blur space-y-4">
            <h2 className="text-lg font-semibold">
              Describe your website
            </h2>

            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={10}
              placeholder='e.g. "A modern agency website with services, pricing, testimonials and contact form"'
              className="w-full p-3 rounded-md bg-black/60 border border-purple-500/30 text-purple-100 placeholder-purple-300/40"
            />

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  setBrief(
                    "A sleek agency portfolio with services, case studies, pricing, testimonials and contact form."
                  )
                }
                className="px-3 py-1 rounded border border-purple-400/30 hover:bg-purple-800/40"
              >
                Agency
              </button>

              <button
                type="button"
                onClick={() =>
                  setBrief(
                    "A personal portfolio with hero section, projects, about me, skills and contact."
                  )
                }
                className="px-3 py-1 rounded border border-purple-400/30 hover:bg-purple-800/40"
              >
                Portfolio
              </button>

              <button
                type="button"
                onClick={() =>
                  setBrief(
                    "A SaaS landing page with pricing, features, testimonials and CTA."
                  )
                }
                className="px-3 py-1 rounded border border-purple-400/30 hover:bg-purple-800/40"
              >
                SaaS
              </button>
