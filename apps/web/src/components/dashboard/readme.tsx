"use client";

import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getMDXComponents } from "@/mdx-components";

interface ReadmeCardProps {
  readme: string;
}

export const Readme: React.FC<ReadmeCardProps> = ({ readme }) => {
  if (!readme) return null;

  const components = getMDXComponents();

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {readme}
      </ReactMarkdown>
    </div>
  );
};
