"use client";

import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Download, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Rnd } from "react-rnd";

/* ================= TYPES ================= */

type Page = {
  path: string;
  title: string;
  html: string;
};

type Manifest = {
  title: string;
  pages: Page[];
};

type Edits = Record<string, { html: string }>;

/* ================= HELPERS ================= */

function getPageHtml(
  manifest: Manifest | null,
  edits: Edits,
  index: number
) {
  if (!manifest) return "";
  const page = manifest.pages[index];
  if (!page) return "";
  return edits[page.path]?.html ?? page.html;
}

/* ================= MAIN ================= */

export default function Page() {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selected, setSelected] = useState(0);
  const [edits, setEdits] = useState<Edits>({});
  const [showPreview, setShowPreview] = useState(true);

  const html = useMemo(
    () => getPageHtml(manifest, edits, selected),
    [manifest, edits, selected]
  );

  async function generate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief }),
    });

    const json = await res.json();
    setManifest(json);
    setSelected(0);
    setEdits({});
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-purple-200 p-6">
      <h1 className="text-4xl font-bold mb-4">Asher AI</h1>

      <form onSubmit={generate} className="space-y-4 max-w-xl">
        <textarea
          className="w-full h-40 p-3 rounded bg-black border border-purple-500"
          placeholder="Describe your website..."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
        />
        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-purple-600 text-white"
        >
          {loading ? "Generating…" : "Generate Website"}
        </button>
      </form>

      {manifest && (
        <div className="mt-8 grid grid-cols-3 gap-6">
          <aside className="col-span-1 border border-purple-500 p-4 rounded">
            <h2 className="font-bold mb-2">Pages</h2>
            {manifest.pages.map((p, i) => (
              <div
                key={p.path}
                className="cursor-pointer underline"
                onClick={() => setSelected(i)}
              >
                {p.title}
              </div>
            ))}
          </aside>

          <div className="col-span-2 border border-purple-500 p-4 rounded">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      )}
    </di
