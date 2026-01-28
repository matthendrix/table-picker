import { put, list, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

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
    // List blobs to find our data file
    const { blobs } = await list({ prefix: BLOB_NAME });

    if (blobs.length === 0) {
      return NextResponse.json({ data: null });
    }

    // Fetch the blob content
    const response = await fetch(blobs[0].url);
    const data = await response.json();

    return NextResponse.json({ data });
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

    // Delete old blob if it exists
    const { blobs } = await list({ prefix: BLOB_NAME });
    for (const blob of blobs) {
      await del(blob.url);
    }

    // Save new data
    const blob = await put(BLOB_NAME, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error("Error saving seating data:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
