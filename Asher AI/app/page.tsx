use client;

import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Download, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Rnd } from "react-rnd";

export type Page = { path: string; title: string; html: string };
export type Manifest = { title: string; pages: Page[]; meta?: Record<string, unknown> };
export type Edits = Record<string, { html: string }>;

export function getPageHtml(manifest: Manifest | null, edits: Edits, i: number) {
  if (!manifest) return "";
  const p = manifest.pages[i];
  if (!p) return "";
  return edits[p.path]?.html ?? p.html;
}

export default function Page() {
  const [brief, setBrief] = useState("");
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      if (!r.ok) throw new Error("API error");
      setManifest(await r.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "black", color: "#c4b5fd", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>Asher AI</h1>
      <form onSubmit={generate}>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe your website"
          style={{ width: "100%", height: 120, background: "#020617", color: "#ddd6fe" }}
        />
        <button disabled={loading} type="submit">
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      {error && <div>{error}</div>}
      {manifest && (
        <div dangerouslySetInnerHTML={{ __html: manifest.pages[0].html }} />
      )}
    </div>
  );
}
