"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <h1>Sign in to Asher AI</h1>
        <p>No password. We’ll email you a magic link.</p>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        />

        <button
          onClick={() => signIn("email", { email })}
          style={{ marginTop: 12, width: "100%" }}
        >
          Send magic link
        </button>
      </div>
    </div>
  );
}
