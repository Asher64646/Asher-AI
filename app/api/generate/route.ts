import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { description } = await req.json();

  const generated = `
Website Structure:
- Home: Hero, CTA, features
- About: Brand story, mission
- Services: What you offer
- Contact: Email form

Style:
- Modern
- Clean
- Professional
- Purple / black galaxy theme

Based on:
"${description}"
`;

  return NextResponse.json({ result: generated });
}
