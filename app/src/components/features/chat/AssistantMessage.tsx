import { type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../../utils/cn';

interface AssistantMessageProps {
  text: string;
}

/**
 * Assistant Message Bubble
 * Left-aligned, glass morphism styled bubble with bioluminescent border
 * Supports markdown formatting (bold, italic, lists, etc.)
 */
export const AssistantMessage: FC<AssistantMessageProps> = ({ text }) => {
  return (
    <div className="mb-4 flex justify-start px-6">
      <div
        className={cn(
          'max-w-[80%] rounded-3xl rounded-tl-lg px-5 py-3',
          'bg-glass-bg backdrop-blur-glass',
          'border border-glass-border shadow-glass',
          'text-mist-white',
          'break-words'
        )}
      >
        <div className="text-base leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Paragraphs
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,

              // Bold text
              strong: ({ children }) => (
                <strong className="font-bold text-biolum-cyan">{children}</strong>
              ),

              // Italic text
              em: ({ children }) => <em className="italic text-warm-ember">{children}</em>,

              // Lists
              ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => (
                <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>
              ),
              li: ({ children }) => <li className="text-mist-white">{children}</li>,

              // Code
              code: ({ children }) => (
                <code className="rounded bg-void-blue/50 px-1.5 py-0.5 font-mono text-sm text-biolum-cyan">
                  {children}
                </code>
              ),

              // Links
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-biolum-cyan underline transition-colors hover:text-warm-ember"
                >
                  {children}
                </a>
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
