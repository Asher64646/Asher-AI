"use client";

import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Download, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Rnd } from "react-rnd";

/**
 * Asher AI
 *
 * This file is now:
 * - Next.js App Router compatible (client component)
 * - Split into internal components (clean structure while still single-file)
 * - Preview panel is draggable + resizable (react-rnd) with snap-to-edges
 * - Includes a real testable helper and a ready-to-copy test file snippet (NO JSX in comments)
 *
 * Install deps:
 *   npm i lucide-react framer-motion react-rnd
 */

// -------------------- Types --------------------
export type Page = {
  path: string;
  title: string;
  html: string;
};

export type Manifest = {
  title: string;
  pages: Page[];
  meta?: Record<string, unknown>;
};

export type Edits = Record<string, { html: string }>;

// -------------------- Helpers (testable) --------------------
export function getPageHtml(manifest: Manifest | null, edits: Edits, selectedPageIndex: number): string {
  if (!manifest) return "";
  const page = manifest.pages[selectedPageIndex];
  if (!page) return "";
  return edits[page.path]?.html ?? page.html;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function snapToEdges(pos: { x: number; y: number }, size: { w: number; h: number }, threshold = 40) {
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const h = typeof window !== "undefined" ? window.innerHeight : 800;

  let x = pos.x;
  let y = pos.y;

  if (x < threshold) x = 0;
  if (y < threshold) y = 0;
  if (w - (x + size.w) < threshold) x = Math.max(0, w - size.w);
  if (h - (y + size.h) < threshold) y = Math.max(0, h - size.h);

  return { x, y };
}

// -------------------- Main Page --------------------
export default function Page(): JSX.Element {
  // Persisted preview toggle
  const [showPreview, setShowPreview] = useState<boolean>(true);

  // Builder state
  const [brief, setBrief] = useState<string>("");
  const [style, setStyle] = useState<string>("Modern");
  const [pageCount, setPageCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [edits, setEdits] = useState<Edits>({});

  // Draggable/resizable preview state (persisted)
  const [previewRect, setPreviewRect] = useState({ x: 24, y: 180, w: 860, h: 620 });

  // Restore persisted UI state
  useEffect(() => {
    try {
      const s = localStorage.getItem("asher-show-preview");
      if (s !== null) setShowPreview(JSON.parse(s));
      const r = localStorage.getItem("asher-preview-rect");
      if (r) setPreviewRect(JSON.parse(r));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("asher-show-preview", JSON.stringify(showPreview));
  }, [showPreview]);

  useEffect(() => {
    localStorage.setItem("asher-preview-rect", JSON.stringify(previewRect));
  }, [previewRect]);

  const currentHtml = useMemo(() => getPageHtml(manifest, edits, selectedPageIndex), [manifest, edits, selectedPageIndex]);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setManifest(null);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, options: { style, pages: pageCount } }),
      });

      if (resp.status === 405) {
        throw new Error("Server error 405: /api/generate does not allow POST. Did you export POST in route.ts?");
      }
      if (resp.status === 404) {
        throw new Error("Server error 404: /api/generate route not found. Create app/api/generate/route.ts");
      }

      if (!resp.ok) throw new Error(`Server error ${resp.status}`);

      const json = (await resp.json()) as Manifest;
      setManifest(json);
      setSelectedPageIndex(0);
      setEdits({});
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportServerZip() {
    if (!manifest) return;
    try {
      setLoading(true);
      const resp = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest: { ...manifest, pages: manifest.pages.map((p) => ({ ...p, html: edits[p.path]?.html ?? p.html })) } }),
      });
      if (!resp.ok) throw new Error("Export failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${manifest.title || "site"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportClientZip() {
    if (!manifest) return;
    try {
      setLoading(true);
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      manifest.pages.forEach((p) => {
        const name = p.path === "/" ? "index.html" : p.path.replace(/^[\\/]+/, "") + ".html";
        const html = edits[p.path]?.html ?? p.html;
        zip.file(name, html);
      });

      // Basic README
      zip.file("README.txt", `Asher AI export: ${manifest.title}\n\nHost these HTML files on any static host.`);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${manifest.title || "site"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Client export failed");
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(text: string) {
    setBrief(text);
  }

  function quickAdd(line: string) {
    setBrief((b) => (b ? b + "\n" + line : line));
  }

  const leftClass = showPreview ? "md:col-span-1" : "md:col-span-3";

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-purple-950 to-black text-purple-100 relative overflow-hidden">
      {/* Galaxy background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(192,132,252,0.2),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(139,92,246,0.25),transparent_50%)]" />
      <div className="relative max-w-6xl mx-auto">
      <HeaderBar showPreview={showPreview} onToggle={() => setShowPreview((v) => !v)} />

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={leftClass}>
          <BuilderPanel
            brief={brief}
            setBrief={setBrief}
            style={style}
            setStyle={setStyle}
            pageCount={pageCount}
            setPageCount={setPageCount}
            loading={loading}
            error={error}
            onGenerate={handleGenerate}
            onReset={() => {
              setBrief("");
              setStyle("Modern");
              setPageCount(1);
              setError(null);
            }}
            onPreset={applyPreset}
            onQuickAdd={quickAdd}
          />
        </div>

        <AnimatePresence>
          {showPreview && (
            <motion.div
              key="preview"
              className="md:col-span-2 relative backdrop-blur-md bg-black/40 rounded-2xl p-4 border border-purple-500/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
            >
              <PreviewDock
                manifest={manifest}
                selectedPageIndex={selectedPageIndex}
                setSelectedPageIndex={setSelectedPageIndex}
                edits={edits}
                setEdits={setEdits}
                html={currentHtml}
                loading={loading}
                onExportServer={handleExportServerZip}
                onExportClient={handleExportClientZip}
                rect={previewRect}
                setRect={setPreviewRect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-6 text-sm opacity-70">
        <div>Brand: Asher AI · Assistant: Asher</div>
        <div className="mt-1">Tip: you can drag/resize the preview window, and it will snap to screen edges.</div>
      </footer>
    </div>
  </div>
  );
}

// -------------------- Components --------------------
function HeaderBar(props: { showPreview: boolean; onToggle: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 backdrop-blur-md bg-black/40 rounded-2xl p-4 border border-purple-500/20">
      <div className="flex items-center gap-4">
        <img src="https://image2url.com/images/1765564566111-6083ed51-e395-4ee6-975d-9d55ac7e9dff.png" alt="Asher AI" className="w-12 h-12" />
        <div>
          <div className="text-2xl font-bold">Asher AI</div>
          <div className="text-sm opacity-70">Tell Asher what you want — it builds a professional site and exports it.</div>
        </div>
      </div>
      <button
        type="button"
        onClick={props.onToggle}
        className="px-4 py-2 rounded-xl shadow bg-purple-600/30 hover:bg-purple-600/50 text-purple-100 flex items-center gap-2 border border-purple-400/30"
      >
        {props.showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        {props.showPreview ? "Hide Preview" : "Show Preview"}
      </button>
    </div>
  );
}

function BuilderPanel(props: {
  brief: string;
  setBrief: (v: string) => void;
  style: string;
  setStyle: (v: string) => void;
  pageCount: number;
  setPageCount: (v: number) => void;
  loading: boolean;
  error: string | null;
  onGenerate: (e: FormEvent) => void;
  onReset: () => void;
  onPreset: (text: string) => void;
  onQuickAdd: (line: string) => void;
}) {
  return (
    <form onSubmit={props.onGenerate} className="space-y-4 backdrop-blur-md bg-black/40 rounded-2xl p-4 border border-purple-500/20">
      <label className="block">
        <div className="text-sm font-medium">Describe your website (brief, pages, features)</div>
        <textarea
          className="mt-1 w-full border border-purple-500/30 rounded-md p-3 bg-black/60 text-purple-100 placeholder-purple-300/50"
          rows={10}
          value={props.brief}
          onChange={(e) => props.setBrief(e.target.value)}
          placeholder='e.g. "A clean portfolio for a freelance photographer with a gallery, contact form, pricing page. Use warm neutrals."'
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block sm:col-span-2">
          <div className="text-sm font-medium">Design style</div>
          <select className="mt-1 w-full border border-purple-500/30 rounded-md p-2 bg-black/60 text-purple-100" value={props.style} onChange={(e) => props.setStyle(e.target.value)}>
            <option>Modern</option>
            <option>Minimal</option>
            <option>Elegant</option>
            <option>Vibrant</option>
            <option>Corporate</option>
          </select>
        </label>

        <label className="block">
          <div className="text-sm font-medium">Pages</div>
          <input
            className="mt-1 w-full border border-purple-500/30 rounded-md p-2 bg-black/60 text-purple-100"
            type="number"
            min={1}
            value={props.pageCount}
            onChange={(e) => props.setPageCount(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="px-3 py-1 rounded bg-purple-700/30 hover:bg-purple-700/50 text-purple-100 border border-purple-400/30" onClick={() => props.onQuickAdd("Add SEO meta + schema.org markup")}>SEO</button>
        <button type="button" className="px-3 py-1 rounded bg-purple-700/30 hover:bg-purple-700/50 text-purple-100 border border-purple-400/30" onClick={() => props.onQuickAdd("Include contact form")}>Contact</button>
        <button type="button" className="px-3 py-1 rounded bg-purple-700/30 hover:bg-purple-700/50 text-purple-100 border border-purple-400/30" onClick={() => props.onQuickAdd("Responsive gallery with lightbox")}>Gallery</button>
        <button type="button" className="px-3 py-1 rounded bg-purple-700/30 hover:bg-purple-700/50 text-purple-100 border border-purple-400/30" onClick={() => props.onQuickAdd("Newsletter signup")}>Newsletter</button>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={props.loading}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-purple-100 flex items-center gap-2 shadow shadow-purple-900/40"
        >
          <Wand2 className="w-4 h-4" />
          {props.loading ? "Generating…" : "Generate site"}
        </button>
        <button type="button" onClick={props.onReset} className="px-4 py-2 rounded border border-purple-500/30 text-purple-200 hover:bg-purple-800/30">Reset</button>
      </div>

      {props.error && <div className="text-red-600">{props.error}</div>}

      <section className="pt-2">
        <div className="font-semibold">Presets</div>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <button type="button" className="text-left p-2 rounded border" onClick={() => props.onPreset("One-page product landing page for a B2B SaaS product. Include pricing, testimonials, CTA and demo request form.")}>SaaS landing</button>
          <button type="button" className="text-left p-2 rounded border" onClick={() => props.onPreset("Portfolio site for a photographer. Hero, gallery, services, pricing, contact form, Instagram feed.")}>Photographer</button>
          <button type="button" className="text-left p-2 rounded border" onClick={() => props.onPreset("Small restaurant website with menu, reservations info, opening hours, location map, gallery.")}>Restaurant</button>
          <button type="button" className="text-left p-2 rounded border" onClick={() => props.onPreset("Full blog website with homepage, posts page, single post template, author bio, categories, tags, search bar, dark mode.")}>Blog site</button>
          <button type="button" className="text-left p-2 rounded border" onClick={() => props.onPreset("E-commerce store with product grid, product detail page, cart page, FAQ, contact page, modern minimal style.")}>E-commerce store</button>
          <button type="button" className="text-left p-2 rounded border" onClick={() => props.onPreset("Event website with hero, schedule, speakers, ticket section, venue map, FAQ.")}>Event landing</button>
          <button type="button" className="text-left p-2 rounded border" onClick={() => props.onPreset("A sleek agency portfolio with case studies, services, CTA, pricing, testimonials, contact form.")}>Agency portfolio</button>
        </div>
      </section>
    </form>
  );
}

function PreviewDock(props: {
  manifest: Manifest | null;
  selectedPageIndex: number;
  setSelectedPageIndex: (n: number) => void;
  edits: Edits;
  setEdits: React.Dispatch<React.SetStateAction<Edits>>;
  html: string;
  loading: boolean;
  onExportServer: () => void;
  onExportClient: () => void;
  rect: { x: number; y: number; w: number; h: number };
  setRect: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number }>>;
}) {
  if (!props.manifest) {
    return (
      <div className="p-6 border border-purple-500/30 rounded-xl text-sm opacity-80 bg-black/40">No site generated yet. Click “Generate site” to let Asher build your website.</div>
    );
  }

  const page = props.manifest.pages[props.selectedPageIndex];

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xl font-semibold">Preview & Editor</div>
          <div className="text-sm opacity-70">Drag, resize, and edit the selected page.</div>
        </div>
        <div className="flex gap-2">
          <button disabled={props.loading} onClick={props.onExportServer} className="px-3 py-1 rounded border border-purple-500/30 text-purple-200 hover:bg-purple-800/30 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export (server)
          </button>
          <button disabled={props.loading} onClick={props.onExportClient} className="px-3 py-1 rounded border border-purple-500/30 text-purple-200 hover:bg-purple-800/30">Export (client)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <aside className="lg:col-span-1">
          <div className="p-4 border border-purple-500/30 rounded-xl bg-black/40">
            <div className="font-medium">Site: {props.manifest.title}</div>
            <div className="text-sm opacity-70">Pages</div>
            <ul className="mt-2 space-y-2">
              {props.manifest.pages.map((p, i) => (
                <li
                  key={p.path}
                  className={
                    "p-2 rounded cursor-pointer border " +
                    (i === props.selectedPageIndex ? "bg-gray-50" : "bg-white")
                  }
                  onClick={() => props.setSelectedPageIndex(i)}
                >
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs opacity-70">{p.path}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 p-4 border border-purple-500/30 rounded-xl bg-black/40">
            <div className="font-medium">Quick edits</div>
            <div className="text-xs opacity-70">Editing HTML (small tweaks only)</div>
            <textarea
              className="mt-2 w-full border rounded p-2"
              rows={10}
              value={props.edits[page.path]?.html ?? page.html}
              onChange={(e) => {
                const next = e.target.value;
                props.setEdits((prev) => ({ ...prev, [page.path]: { html: next } }));
              }}
            />
          </div>
        </aside>

        <div className="lg:col-span-2">
          <Rnd
            bounds="window"
            dragHandleClassName="asher-drag-handle"
            minWidth={360}
            minHeight={240}
            size={{ width: props.rect.w, height: props.rect.h }}
            position={{ x: props.rect.x, y: props.rect.y }}
            onDragStop={(_, d) => {
              const snapped = snapToEdges({ x: d.x, y: d.y }, { w: props.rect.w, h: props.rect.h }, 40);
              props.setRect((r) => ({ ...r, x: snapped.x, y: snapped.y }));
            }}
            onResizeStop={(_, __, ref, ___, pos) => {
              const w = clamp(ref.offsetWidth, 360, 1400);
              const h = clamp(ref.offsetHeight, 240, 1000);
              const snapped = snapToEdges({ x: pos.x, y: pos.y }, { w, h }, 40);
              props.setRect({ x: snapped.x, y: snapped.y, w, h });
            }}
          >
            <div className="h-full w-full border border-purple-500/30 rounded-xl overflow-hidden bg-black shadow-2xl shadow-purple-900/40">
              <div className="asher-drag-handle px-3 py-2 border-b border-purple-500/30 bg-black/60 cursor-move flex items-center justify-between">
                <div className="text-sm font-medium">Live preview: {page.title}</div>
                <div className="text-xs opacity-70">drag here · resize corners</div>
              </div>
              <div className="p-3 h-full overflow-auto">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: props.html }} />
              </div>
            </div>
          </Rnd>
        </div>
      </div>
    </div>
  );
}

// -------------------- Tests (copy into a real test file) --------------------
/*
==================== REQUIRED NEXT.JS API ROUTES ====================

You are getting **Server error 405** because Next.js App Router
requires API routes to explicitly export HTTP methods.

Create this file:

app/api/generate/route.ts

--------------------------------------------------
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { brief, options } = body;

  // TEMP mock response (replace with AI later)
  return NextResponse.json({
    title: 'Asher AI Generated Site',
    pages: [
      {
        path: '/',
        title: 'Home',
        html: `<h1>Welcome</h1><p>${brief}</p>`
      }
    ],
    meta: { style: options?.style }
  });
}
--------------------------------------------------

OPTIONAL export route (for server ZIP):

app/api/export/route.ts

--------------------------------------------------
import { NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(req: Request) {
  const { manifest } = await req.json();
  const zip = new JSZip();

  manifest.pages.forEach((p: any) => {
    const name = p.path === '/' ? 'index.html' : p.path.replace('/', '') + '.html';
    zip.file(name, p.html);
  });

  const blob = await zip.generateAsync({ type: 'nodebuffer' });

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="site.zip"',
    },
  });
}
--------------------------------------------------

=====================================================================

Create: src/__tests__/getPageHtml.test.ts
/getPageHtml.test.ts

import { getPageHtml, type Manifest } from '../path/to/page';

describe('getPageHtml', () => {
  test('returns edited HTML when present', () => {
    const manifest: Manifest = { title: 'Test', pages: [{ path: '/', title: 'Home', html: '<h1>Home</h1>' }] };
    const edits = { '/': { html: '<h1>Edited</h1>' } };
    expect(getPageHtml(manifest, edits, 0)).toBe('<h1>Edited</h1>');
  });

  test('returns default HTML when no edits exist', () => {
    const manifest: Manifest = { title: 'Test', pages: [{ path: '/', title: 'Home', html: '<h1>Home</h1>' }] };
    const edits = {} as any;
    expect(getPageHtml(manifest, edits, 0)).toBe('<h1>Home</h1>');
  });

  test('returns empty string when manifest is null', () => {
    expect(getPageHtml(null, {}, 0)).toBe('');
  });

  test('returns empty string when selected index is out of range', () => {
    const manifest: Manifest = { title: 'Test', pages: [{ path: '/', title: 'Home', html: '<h1>Home</h1>' }] };
    expect(getPageHtml(manifest, {}, 99)).toBe('');
  });
});

Vite/Vitest setup example:
- npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom
- Add to package.json: "test": "vitest"
*/
