"use client";

import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Download, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Rnd } from "react-rnd";

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

// -------------------- Helpers --------------------
export function getPageHtml(
  manifest: Manifest | null,
  edits: Edits,
  selectedPageIndex: number
): string {
  if (!manifest) return "";
  const page = manifest.pages[selectedPageIndex];
  if (!page) return "";
  return edits[page.path]?.html ?? page.html;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function snapToEdges(
  pos: { x: number; y: number },
  size: { w: number; h: number },
  threshold = 40
) {
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

// ==================== MAIN COMPONENT ====================
export default function AsherBuilder(): JSX.Element {
  const [showPreview, setShowPreview] = useState(true);

  const [brief, setBrief] = useState("");
  const [style, setStyle] = useState("Modern");
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [edits, setEdits] = useState<Edits>({});

  const [previewRect, setPreviewRect] = useState({
    x: 24,
    y: 180,
    w: 860,
    h: 620,
  });

  useEffect(() => {
    const s = localStorage.getItem("asher-show-preview");
    if (s) setShowPreview(JSON.parse(s));
    const r = localStorage.getItem("asher-preview-rect");
    if (r) setPreviewRect(JSON.parse(r));
  }, []);

  useEffect(() => {
    localStorage.setItem("asher-show-preview", JSON.stringify(showPreview));
  }, [showPreview]);

  useEffect(() => {
    localStorage.setItem("asher-preview-rect", JSON.stringify(previewRect));
  }, [previewRect]);

  const currentHtml = useMemo(
    () => getPageHtml(manifest, edits, selectedPageIndex),
    [manifest, edits, selectedPageIndex]
  );

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          options: { style, pages: pageCount },
        }),
      });

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

  const leftClass = showPreview ? "md:col-span-1" : "md:col-span-3";

  return (
    <div className="min-h-screen p-6 bg-black text-purple-100">
      <HeaderBar
        showPreview={showPreview}
        onToggle={() => setShowPreview((v) => !v)}
      />

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
          />
        </div>

        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PreviewDock
                manifest={manifest}
                selectedPageIndex={selectedPageIndex}
                setSelectedPageIndex={setSelectedPageIndex}
                edits={edits}
                setEdits={setEdits}
                html={currentHtml}
                rect={previewRect}
                setRect={setPreviewRect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// -------------------- UI COMPONENTS --------------------
function HeaderBar({
  showPreview,
  onToggle,
}: {
  showPreview: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-6 flex justify-between">
      <h1 className="text-2xl font-bold">Asher AI</h1>
      <button onClick={onToggle}>
        {showPreview ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

function BuilderPanel(props: any) {
  return (
    <form onSubmit={props.onGenerate} className="space-y-4">
      <textarea
        value={props.brief}
        onChange={(e) => props.setBrief(e.target.value)}
        rows={8}
        className="w-full bg-black border p-2"
      />
      <button disabled={props.loading} type="submit">
        <Wand2 /> Generate
      </button>
      {props.error && <div className="text-red-500">{props.error}</div>}
    </form>
  );
}

function PreviewDock(props: any) {
  if (!props.manifest) {
    return <div>No site generated yet.</div>;
  }

  const page = props.manifest.pages[props.selectedPageIndex];

  return (
    <Rnd
      size={{ width: props.rect.w, height: props.rect.h }}
      position={{ x: props.rect.x, y: props.rect.y }}
      onDragStop={(_, d) =>
        props.setRect((r: any) => ({ ...r, x: d.x, y: d.y }))
      }
      onResizeStop={(_, __, ref, ___, pos) =>
        props.setRect({
          x: pos.x,
          y: pos.y,
          w: ref.offsetWidth,
          h: ref.offsetHeight,
        })
      }
    >
      <div className="border p-2 bg-black h-full overflow-auto">
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
    </Rnd>
  );
}
