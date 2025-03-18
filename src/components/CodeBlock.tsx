
import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, className }) => {
  // Replace "___" with a highlighted span
  const formattedCode = code.replace(/___/g, '<span class="highlight-blank">___</span>');
  
  // Enhanced syntax highlighting for Python
  const highlightedCode = formattedCode
    // Keywords
    .replace(/(print|def|return|if|for|in|else|elif|import|from|as|class|try|except|with|raise|pass|continue|break|while|not|and|or|is|None|True|False)\b/g, '<span class="keyword">$1</span>')
    // Strings
    .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>')
    // Numbers
    .replace(/(\b\d+\.?\d*\b)/g, '<span class="number">$1</span>')
    // Comments
    .replace(/(#.*)/g, '<span class="comment">$1</span>')
    // Functions and built-ins
    .replace(/(?<!\w)(self|range|len|sum|type|int|str|float|list|dict|set|tuple)(?!\w)/g, '<span class="function">$1</span>');

  return (
    <pre className={cn("px-4 py-3 rounded-lg overflow-auto bg-secondary text-foreground font-mono text-sm", className)}>
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      <style jsx global>{`
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
      `}</style>
    </pre>
  );
};

export default CodeBlock;
