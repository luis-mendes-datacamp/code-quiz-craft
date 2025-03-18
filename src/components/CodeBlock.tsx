
import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, className }) => {
  // Replace "___" with a highlighted span
  const formattedCode = code.replace(/___/g, '<span class="highlight-blank">___</span>');
  
  // Basic syntax highlighting
  const highlightedCode = formattedCode
    .replace(/(print|def|return|if|for|in|else|elif|import|from|as|class|try|except|with|raise|pass|continue|break|while|not|and|or|is|None|True|False)\b/g, '<span class="keyword">$1</span>')
    .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>')
    .replace(/(\b\d+\.?\d*\b)/g, '<span class="number">$1</span>')
    .replace(/(#.*)/g, '<span class="comment">$1</span>')
    .replace(/(?<!\w)(self|range|len|sum|type|int|str|float|list|dict|set|tuple)(?!\w)/g, '<span class="function">$1</span>');

  return (
    <pre className={cn("px-4 py-3 rounded-lg overflow-auto bg-secondary text-foreground", className)}>
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
};

export default CodeBlock;
