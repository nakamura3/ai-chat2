'use client'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message } from '@/types/chat'

interface Props {
  message: Message
  isLast?: boolean
  isLoading?: boolean
}

export function MessageBubble({ message, isLast, isLoading }: Props) {
  const { role, content } = message
  const showTypingIndicator = role === 'assistant' && !content && isLast && isLoading

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-500 px-4 py-3 text-white">
          <p className="break-words whitespace-pre-wrap text-sm">{content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
        AI
      </div>
      <div className="min-w-0 flex-1 pt-1 text-sm text-zinc-800">
        {showTypingIndicator ? (
          <div className="flex gap-1.5 pt-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
          </div>
        ) : (
          <div className="markdown-body">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              code({ node: _node, children, className, ...rest }) {
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                  <SyntaxHighlighter PreTag="div" language={match[1]} style={oneDark}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700"
                    {...rest}
                  >
                    {children}
                  </code>
                )
              },
            }}
          >
            {content}
          </Markdown>
          </div>
        )}
      </div>
    </div>
  )
}
