import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.pinata.cloud/data/pinList?status=pinned", {
      method: "GET",
      headers: {
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!,
      },
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
