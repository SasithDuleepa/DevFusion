import { NextResponse } from "next/server";
import { getFileContent } from "@/lib/github";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const path = searchParams.get("path");

    if (!owner || !repo || !path) {
        return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    try {
        const content = await getFileContent(owner, repo, path);
        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }
}