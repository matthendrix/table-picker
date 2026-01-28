import { put, list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOB_PREFIX = "seating-data-";
const APP_PASSWORD = process.env.APP_PASSWORD || "wedding2025";

function checkPassword(request: NextRequest): boolean {
  const password = request.headers.get("x-app-password");
  return password === APP_PASSWORD;
}

// GET - Load seating data
export async function GET(request: NextRequest) {
  if (!checkPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let latestBlob = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { blobs } = await list({ prefix: BLOB_PREFIX });
      if (blobs.length > 0) {
        latestBlob = blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }

    if (!latestBlob) {
      console.log("No seating blob found, returning null");
      return NextResponse.json({ data: null }, { headers: { "Cache-Control": "no-store" } });
    }

    // Fetch the blob content
    const response = await fetch(`${latestBlob.url}?t=${Date.now()}`, { cache: "no-store" });
    const data = await response.json();
    console.log("Loaded data successfully");

    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error loading seating data:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

// POST - Save seating data
export async function POST(request: NextRequest) {
  if (!checkPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Saving seating data...");

    // Save new data (overwrite existing file)
    const blobName = `${BLOB_PREFIX}${Date.now()}.json`;
    const blob = await put(blobName, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    console.log("Saved blob:", blob.pathname, blob.url);
    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Error saving seating data:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
