// components/FileTree.tsx
"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, FileCode, Folder } from "lucide-react";

// Helper to turn flat paths (src/app/page.tsx) into a nested tree object
const buildTree = (files: any[]) => {
  const root: any = {};

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;
    parts.forEach((part: string, index: number) => {
      if (!current[part]) {
        current[part] = {
          name: part,
          path: file.path,
          type: index === parts.length - 1 ? file.type : "tree",
          children: {},
        };
      }
      current = current[part].children;
    });
  });
  return root;
};

// Recursive Component to render nodes
const TreeNode = ({ node, onSelect }: { node: any; onSelect: (path: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = Object.keys(node.children).length > 0;

  if (node.type === "blob") {
    return (
      <div 
        onClick={() => onSelect(node.path)}
        className="flex cursor-pointer items-center gap-2 py-1 hover:text-blue-400 text-neutral-400 hover:bg-neutral-800/50 rounded px-2"
      >
        <FileCode className="h-4 w-4" />
        <span className="text-sm">{node.name}</span>
      </div>
    );
  }

  return (
    <div className="pl-2">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 py-1 hover:text-white text-neutral-300 font-medium"
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <Folder className="h-4 w-4 text-yellow-600" />
        <span className="text-sm">{node.name}</span>
      </div>
      {isOpen && (
        <div className="border-l border-neutral-800 ml-2">
          {Object.values(node.children).map((child: any) => (
            <TreeNode key={child.path} node={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileTree({ files, onSelect }: { files: any[]; onSelect: (path: string) => void }) {
  const tree = useMemo(() => buildTree(files), [files]);
  
  return (
    <div className="flex flex-col gap-1 select-none">
      {Object.values(tree).map((node: any) => (
        <TreeNode key={node.path} node={node} onSelect={onSelect} />
      ))}
    </div>
  );
}