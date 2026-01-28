import { put, head, BlobNotFoundError } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOB_NAME = "seating-data.json";
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
    const seatingBlob = await head(BLOB_NAME);

    // Fetch the blob content
    const response = await fetch(`${seatingBlob.url}?t=${Date.now()}`, { cache: "no-store" });
    const data = await response.json();
    console.log("Loaded data successfully");

    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      console.log("No seating blob found, returning null");
      return NextResponse.json({ data: null }, { headers: { "Cache-Control": "no-store" } });
    }
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
    const blob = await put(BLOB_NAME, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    console.log("Saved blob:", blob.pathname, blob.url);
    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Error saving seating data:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
