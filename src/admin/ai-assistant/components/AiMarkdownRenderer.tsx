/**
 * AiMarkdownRenderer
 * High-fidelity, clean document renderer supporting headings, bold/italic,
 * ordered/unordered lists, structured data tables, inline code, and code blocks with copy.
 */

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface AiMarkdownRendererProps {
  content: string;
}

export const AiMarkdownRenderer: React.FC<AiMarkdownRendererProps> = ({ content }) => {
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const handleCopyCode = (id: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedBlockId(id);
    setTimeout(() => {
      setCopiedBlockId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  // Parse lines into tokens: headings, tables, lists, code blocks, paragraphs
  const renderFormattedContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code Block (``` ... ```)
      if (line.trim().startsWith('```')) {
        const lang = line.trim().replace('```', '') || 'code';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const codeText = codeLines.join('\n');
        const blockId = `code-${i}-${Math.random().toString(36).substring(2, 5)}`;

        elements.push(
          <div
            key={blockId}
            className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 text-xs font-mono shadow-xs"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="uppercase font-semibold tracking-wider text-[10px]">{lang}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(blockId, codeText)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedBlockId === blockId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-[11.5px] leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Markdown Table (| header | header |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCols = tableLines[0]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          // check if row 1 is separator (e.g. :--- | :---)
          const isSeparator = tableLines[1].includes('---');
          const rowLines = isSeparator ? tableLines.slice(2) : tableLines.slice(1);

          elements.push(
            <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80">
                  <tr>
                    {headerCols.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2 font-semibold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider"
                      >
                        {renderInlineFormatting(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 bg-white dark:bg-slate-900/50">
                  {rowLines.map((rLine, rIdx) => {
                    const rowCols = rLine
                      .split('|')
                      .slice(1, -1)
                      .map((c) => c.trim());
                    return (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {rowCols.map((cVal, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-3 py-2 text-slate-700 dark:text-slate-300 text-xs"
                          >
                            {renderInlineFormatting(cVal)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-sm font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5 flex items-center gap-1.5"
          >
            {renderInlineFormatting(line.replace('### ', ''))}
          </h3>
        );
        i++;
        continue;
      }

      if (line.startsWith('#### ')) {
        elements.push(
          <h4
            key={`h4-${i}`}
            className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 mt-2.5 mb-1"
          >
            {renderInlineFormatting(line.replace('#### ', ''))}
          </h4>
        );
        i++;
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2"
          >
            {renderInlineFormatting(line.replace('## ', ''))}
          </h2>
        );
        i++;
        continue;
      }

      // Bullet lists (- or • or *)
      if (
        line.trim().startsWith('- ') ||
        line.trim().startsWith('• ') ||
        line.trim().startsWith('* ')
      ) {
        const listItems: string[] = [];
        while (
          i < lines.length &&
          (lines[i].trim().startsWith('- ') ||
            lines[i].trim().startsWith('• ') ||
            lines[i].trim().startsWith('* '))
        ) {
          listItems.push(lines[i].trim().replace(/^[-•*]\s+/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-2 space-y-1 pl-4 list-disc text-slate-700 dark:text-slate-300 text-xs">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="leading-relaxed">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Numbered lists (1. 2. 3.)
      if (/^\s*\d+\.\s+/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="my-2 space-y-1 pl-4 list-decimal text-slate-700 dark:text-slate-300 text-xs">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="leading-relaxed">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Empty line / spacer
      if (!line.trim()) {
        i++;
        continue;
      }

      // Regular Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 my-1">
          {renderInlineFormatting(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  // Helper for inline bold, italic, and inline code formatting
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Regex splits on bold (**text**), inline code (`code`), or italic (*text*)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] border border-slate-200 dark:border-slate-700/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={idx} className="italic text-slate-600 dark:text-slate-400">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return <div className="space-y-1 font-sans">{renderFormattedContent()}</div>;
};
