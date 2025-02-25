import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  children: string
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
        h3: ({ children }) => <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>,
        h4: ({ children }) => <h4 className="text-xl font-bold mt-4 mb-2">{children}</h4>,
        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 [&_ul]:mt-2 [&_ul]:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 [&_ol]:mt-2 [&_ol]:mb-0">{children}</ol>,
        li: ({ children }) => <li className="text-gray-700 pl-2">{children}</li>,
        a: ({ href, children }) => (
          <a href={href} className="text-blue-600 hover:text-blue-800 hover:underline">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4">{children}</blockquote>
        ),
        // @ts-expect-error - TODO: Fix typing for code component
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            // @ts-expect-error - TODO: Fix typing for SyntaxHighlighter
            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="rounded-lg my-4" {...props}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono" {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
