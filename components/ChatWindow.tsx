'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/types/chat'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: Message[]
  isLoading: boolean
}

export function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        <div className="text-center text-zinc-400">
          <p className="text-xl font-semibold text-zinc-600">何でも聞いてください</p>
          <p className="mt-2 text-sm">メッセージを入力して会話を始めましょう</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} isLast={i === messages.length - 1} isLoading={isLoading} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
