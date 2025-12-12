import React from "react";

export const metadata = {
  title: "Asher AI",
  description: "Asher AI — Galaxy-themed AI website builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#000000",
          color: "#e9d5ff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI',
