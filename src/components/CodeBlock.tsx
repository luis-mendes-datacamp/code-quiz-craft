
import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, className }) => {
  // Replace newlines with <br> tags and convert "___" to highlighted spans
  const processedCode = code
    .replace(/\n/g, '<br />')
    .replace(/___/g, '<span class="highlight-blank">___</span>');
  
  // Enhanced syntax highlighting for Python
  const highlightedCode = processedCode;

  return (
    <pre className={cn("px-4 py-3 rounded-lg overflow-auto bg-secondary text-foreground font-mono text-sm", className)}>
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      <style>
        {`
        .highlight-blank {
          display: inline-block;
          padding: 0 2px;
          background-color: rgba(255, 255, 0, 0.2);
          border-bottom: 2px dashed #888;
          font-weight: bold;
          color: #ff3e00;
        }
        .keyword {
          color: #cf99fc;
          font-weight: bold;
        }
        .string {
          color: #a5d6a7;
        }
        .number {
          color: #ff9e80;
        }
        .comment {
          color: #90a4ae;
          font-style: italic;
        }
        .function {
          color: #4fc3f7;
        }
        `}
      </style>
    </pre>
  );
};

export default CodeBlock;
