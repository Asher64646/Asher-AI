import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { brief } = await req.json();
  return NextResponse.json({
    title: "Asher AI Generated Site",
    pages: [{ path: "/", title: "Home", html: `<h1>${brief}</h1>` }],
  });
}
