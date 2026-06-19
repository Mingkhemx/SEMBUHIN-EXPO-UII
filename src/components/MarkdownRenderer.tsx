/**
 * Lightweight Markdown renderer for AI chatbot responses.
 * Supports: headings (##, ###), bold (**), italic (*), numbered lists,
 * bullet lists, line breaks, and inline code.
 */

import type { ReactNode, ReactElement } from "react";

interface Props {
  text: string;
  className?: string;
}

export function MarkdownRenderer({ text, className = "" }: Props) {
  const lines = text.split("\n");
  const elements: ReactElement[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="font-bold text-[13px] mt-2 mb-1 text-foreground">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="font-bold text-[14px] mt-2.5 mb-1 text-foreground">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="font-bold text-[15px] mt-3 mb-1.5 text-foreground">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // Numbered list — collect "N. ..." lines, skipping blank lines between them
    if (/^\d+[\.\)]\s/.test(trimmed)) {
      const listItems: ReactElement[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (/^\d+[\.\)]\s/.test(cur)) {
          const content = cur.replace(/^\d+[\.\)]\s*/, "");
          listItems.push(
            <li key={i} className="mb-1.5 text-[13px] leading-relaxed">
              {renderInline(content)}
            </li>
          );
          i++;
        } else if (cur === "") {
          // Peek ahead — if next non-empty line is still a numbered item, skip blank
          let peek = i + 1;
          while (peek < lines.length && lines[peek].trim() === "") peek++;
          if (peek < lines.length && /^\d+[\.\)]\s/.test(lines[peek].trim())) {
            i = peek;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-0.5 my-1.5">
          {listItems}
        </ol>
      );
      continue;
    }

    // Bullet list — collect "- ..." or "* ..." lines, skipping blank lines between them
    if (/^[-*•]\s/.test(trimmed)) {
      const listItems: ReactElement[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (/^[-*•]\s/.test(cur)) {
          const content = cur.replace(/^[-*•]\s*/, "");
          listItems.push(
            <li key={i} className="mb-1.5 text-[13px] leading-relaxed">
              {renderInline(content)}
            </li>
          );
          i++;
        } else if (cur === "") {
          let peek = i + 1;
          while (peek < lines.length && lines[peek].trim() === "") peek++;
          if (peek < lines.length && /^[-*•]\s/.test(lines[peek].trim())) {
            i = peek;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-0.5 my-1.5">
          {listItems}
        </ul>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-[13px] leading-relaxed mb-1.5">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className={className}>{elements}</div>;
}

/** Render inline markdown: **bold**, *italic*, `code` */
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Regex: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic
      parts.push(
        <em key={key++} className="italic">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      // Inline code
      parts.push(
        <code key={key++} className="rounded bg-sky-50 px-1 py-0.5 text-[12px] font-mono text-sky-700">
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
