"use client";

import { useState } from "react";

export default function Builder() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setResult("");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT */}
      <div className={`p-6 ${showPreview ? "w-1/2" : "w-full"}`}>
        <h2 className="text-2xl font-bold mb-4">
          Describe your website
        </h2>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Example: A modern agency website with Home, Services, About, Contact..."
          className="w-full h-40 p-4 rounded-lg text-black"
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={generate}
            className="bg-purple-600 px-6 py-3 rounded-lg font-semibold"
          >
            {loading ? "Building..." : "Generate"}
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="border px-6 py-3 rounded-lg"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      </div>

      {/* RIGHT */}
      {showPreview && (
        <div className="w-1/2 p-6 border-l border-white/10">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          <pre className="whitespace-pre-wrap opacity-80">
            {result || "Your generated website will appear here."}
          </pre>
        </div>
      )}
    </div>
  );
}
