import { type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DiveGuideMessageProps {
  text: string;
  zoneColor: string;
}

/**
 * Dive Guide Message
 * Centered, italic text with subtle per-letter glow
 * Ethereal and meditative - like bioluminescence in deep water
 */
export const DiveGuideMessage: FC<DiveGuideMessageProps> = ({ text, zoneColor }) => {
  // Subtle text shadow glow - barely there, like distant bioluminescence
  const textGlow = `0 0 8px ${zoneColor}25, 0 0 16px ${zoneColor}15`;

  return (
    <div className="mb-14 flex justify-center px-8">
      <div className="max-w-[85%] text-center">
        <div
          className="text-base italic leading-loose text-mist-white/90"
          style={{ textShadow: textGlow }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Paragraphs with generous spacing for contemplation
              p: ({ children }) => <p className="mb-6 last:mb-0">{children}</p>,

              // Bold text uses zone color, slightly brighter
              strong: ({ children }) => (
                <strong
                  className="font-semibold not-italic"
                  style={{ color: zoneColor, textShadow: `0 0 12px ${zoneColor}40` }}
                >
                  {children}
                </strong>
              ),

              // Emphasis - warm accent
              em: ({ children }) => <em className="text-warm-ember/90">{children}</em>,

              // Lists with gentle styling
              ul: ({ children }) => <ul className="mb-6 space-y-3 text-left">{children}</ul>,
              ol: ({ children }) => (
                <ol className="mb-6 list-decimal space-y-3 pl-6 text-left">{children}</ol>
              ),
              li: ({ children }) => <li>{children}</li>,

              // Code blocks
              code: ({ children }) => (
                <code className="rounded bg-void-blue/50 px-1.5 py-0.5 font-mono text-sm not-italic text-biolum-cyan/80">
                  {children}
                </code>
              ),

              // Links
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="decoration-current/30 not-italic underline underline-offset-2 transition-colors hover:text-warm-ember"
                  style={{ color: zoneColor }}
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
