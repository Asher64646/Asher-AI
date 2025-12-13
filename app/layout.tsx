import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asher AI",
  description: "Asher AI – AI-powered website builder",
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
          background: "black",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
