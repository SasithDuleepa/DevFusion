import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getFileContent(owner: string, repo: string, path: string) {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });

        if (Array.isArray(data) || !('content' in data)) {
            throw new Error("Path is a directory, not a file");
        }

        // GitHub API returns content in Base64
        return Buffer.from(data.content, "base64").toString("utf-8");
    } catch (error) {
        console.error("Error fetching file:", error);
        throw error;
    }
}