import "./globals.css";

export const metadata = {
  title: "Asher AI",
  description: "AI-powered website builder",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
