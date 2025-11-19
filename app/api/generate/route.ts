import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { code, prompt } = await req.json();

    const result = streamText({
        model: openai("gpt-4o"),
        system: `You are an expert coding assistant. 
    You will be given code and a request to modify it. 
    Return ONLY the modified code. 
    Do not include markdown formatting like \`\`\` code blocks. 
    Do not include explanations. 
    Just the raw code.`,
        messages: [
            {
                role: "user",
                content: `Current Code:\n${code}\n\nUser Request: ${prompt}`,
            },
        ],
    });

    return result.toDataStreamResponse();
}