"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Asher AI
        </h1>

        <p className="text-lg opacity-80 max-w-xl">
          Describe your website. Asher builds it professionally — instantly.
        </p>

        <Link
          href="/builder"
          className="inline-block rounded-xl bg-purple-600 px-8 py-4 text-lg font-semibold hover:bg-purple-700 transition"
        >
          Start Building
        </Link>
      </motion.div>
    </main>
  );
}
