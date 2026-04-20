import { NextResponse } from "next/server";
import { addKnowledgeEntry } from "@/lib/knowledge";

export async function POST(req: Request) {
  try {
    const { content, metadata } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const result = await addKnowledgeEntry(content, metadata);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin knowledge API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
