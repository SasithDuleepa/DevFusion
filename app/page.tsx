"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Loader2, Play, Github, Search } from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import FileTree from "@/components/FileTree"; // Import the new component

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("SasithDuleepa/portfolio");
  const [fileTree, setFileTree] = useState<any[]>([]);
  const [code, setCode] = useState("// Select a file to view code");
  const [currentPath, setCurrentPath] = useState("");
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  // AI Hook
  const { complete, completion, isLoading: isAiLoading } = useCompletion({
    api: "/api/generate",
    onFinish: (_, result) => setCode(result),
    onError: (e) => alert(e.message)
  });

  // 1. Fetch the Repo Structure (Tree)
  const fetchRepoTree = async () => {
    if (!repoUrl.includes("/")) return alert("Invalid format. Use owner/repo");
    setIsLoadingTree(true);
    try {
      const [owner, repo] = repoUrl.split("/");
      const res = await fetch(`/api/github/tree?owner=${owner}&repo=${repo}`);
      const data = await res.json();
      if (data.tree) setFileTree(data.tree);
    } catch (err) {
      alert("Failed to load repo");
    }
    setIsLoadingTree(false);
  };

  // 2. Fetch Specific File Content (When clicked in Tree)
  const selectFile = async (path: string) => {
    setCurrentPath(path);
    const [owner, repo] = repoUrl.split("/");
    // Encode path safely
    const res = await fetch(`/api/github?owner=${owner}&repo=${repo}&path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (data.content) setCode(data.content);
  };

  const handleAiEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;
    if (!prompt) return;
    await complete(prompt, { body: { code } });
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      
      {/* Sidebar: File Explorer */}
      <div className="w-64 flex flex-col border-r border-neutral-800 bg-neutral-950">
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-900 p-2 rounded border border-neutral-800">
            <Github className="h-4 w-4 text-neutral-400" />
            <input 
              className="bg-transparent outline-none w-full text-sm" 
              value={repoUrl} 
              onChange={(e) => setRepoUrl(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && fetchRepoTree()}
            />
          </div>
          <button 
            onClick={fetchRepoTree}
            disabled={isLoadingTree}
            className="mt-2 w-full flex justify-center items-center gap-2 bg-blue-700 hover:bg-blue-600 text-xs py-2 rounded font-medium transition"
          >
            {isLoadingTree ? <Loader2 className="animate-spin h-3 w-3"/> : "Load Repo"}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-neutral-700">
          {fileTree.length > 0 ? (
             <FileTree files={fileTree} onSelect={selectFile} />
          ) : (
            <div className="text-center text-neutral-600 text-sm mt-10">No files loaded</div>
          )}
        </div>
      </div>

      {/* Main Area: Editor & AI */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* File Tab Header */}
        <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 text-sm text-neutral-400">
           {currentPath || "No file selected"}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              path={currentPath} // Helps Monaco infer language
              value={isAiLoading ? completion : code}
              onChange={(val) => setCode(val || "")}
              options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
            />
             {isAiLoading && (
              <div className="absolute top-4 right-4 bg-blue-600/90 text-xs px-2 py-1 rounded animate-pulse shadow-lg z-10">
                AI Generating...
              </div>
            )}
          </div>

          {/* AI Sidebar */}
          <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="font-semibold text-neutral-200 flex items-center gap-2">
                <Play className="h-4 w-4 text-green-500" /> AI Editor
              </h2>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4">
              <form onSubmit={handleAiEdit} className="flex flex-col gap-3 h-full">
                <textarea
                  name="prompt"
                  className="flex-1 w-full rounded bg-neutral-800 border border-neutral-700 p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Describe changes..."
                />
                <button 
                  type="submit" 
                  disabled={isAiLoading || !currentPath}
                  className="w-full py-2 bg-green-700 hover:bg-green-600 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Apply Edits
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}