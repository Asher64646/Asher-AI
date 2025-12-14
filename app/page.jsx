"use client";

import { useState } from "react";

export default function Page() {
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState("");

  async function generate(e) {
    e.preventDefault();
    setResult("Generating...");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief }),
    });

    const data = await res.json();
    setResult(data.pages[0].html);
  }

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Asher AI is LIVE 🌀</h1>

      <form onSubmit={generate}>
        <textarea
          rows={4}
          style={{ width: "100%", marginBottom: 8 }}
          placeholder="Describe your website..."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
        />
        <button type="submit">Generate</button>
      </form>

      <div
        style={{ marginTop: 24 }}
        dangerouslySetInnerHTML={{ __html: result }}
      />
    </div>
  );
}
