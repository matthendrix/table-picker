import { put, list } from "@vercel/blob";
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
    // List all blobs and find our data file
    const { blobs } = await list();
    console.log("All blobs:", blobs.map(b => ({ pathname: b.pathname, url: b.url })));

    const seatingBlob = blobs.find((b) => b.pathname === BLOB_NAME || b.pathname.includes("seating-data"));
    console.log("Found seating blob:", seatingBlob?.pathname);

    if (!seatingBlob) {
      console.log("No seating blob found, returning null");
      return NextResponse.json({ data: null });
    }

    // Fetch the blob content
    const response = await fetch(seatingBlob.url);
    const data = await response.json();
    console.log("Loaded data successfully");

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
