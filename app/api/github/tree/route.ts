// app/api/github/tree/route.ts
import { NextResponse } from "next/server";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    try {
        // 1. Get the default branch (usually 'main' or 'master')
        const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
        const defaultBranch = repoData.default_branch;

        // 2. Get the Tree recursively (limits to ~100k files, which is plenty)
        const { data } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: defaultBranch,
            recursive: "1",
        });

        // Filter out blobs (files) and trees (folders)
        // GitHub API returns a flat list. We will send this flat list to the frontend
        // and let the frontend organize it visually if needed.
        return NextResponse.json({ tree: data.tree });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}