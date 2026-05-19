'use client'

import { useCallback, useState } from 'react'
import type { ChatThread, Message } from '@/types/chat'

type State = {
  threads: ChatThread[]
  currentThreadId: string | null
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function makeThread(): ChatThread {
  return { id: generateId(), title: '新しいチャット', messages: [] }
}

function initialState(): State {
  const thread = makeThread()
  return { threads: [thread], currentThreadId: thread.id }
}

export function useChat() {
  const [{ threads, currentThreadId }, setChat] = useState<State>(initialState)
  const [isLoading, setIsLoading] = useState(false)

  const currentThread = threads.find((t) => t.id === currentThreadId) ?? null

  const selectThread = useCallback((id: string) => {
    setChat((s) => ({ ...s, currentThreadId: id }))
  }, [])

  const createThread = useCallback(() => {
    const thread = makeThread()
    setChat((s) => ({ threads: [thread, ...s.threads], currentThreadId: thread.id }))
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentThreadId || !currentThread || isLoading) return

      const userMsg: Message = { role: 'user', content }
      const assistantMsg: Message = { role: 'assistant', content: '' }
      const isFirstMessage = currentThread.messages.length === 0

      // 送信前のメッセージ一覧を確保（API に渡すため）
      const messagesForApi = [...currentThread.messages, userMsg]

      // ユーザーメッセージ + 空のアシスタントメッセージを楽観的追加
      setChat((s) => ({
        ...s,
        threads: s.threads.map((t) =>
          t.id !== currentThreadId
            ? t
            : {
                ...t,
                title: isFirstMessage
                  ? content.slice(0, 30) + (content.length > 30 ? '…' : '')
                  : t.title,
                messages: [...t.messages, userMsg, assistantMsg],
              }
        ),
      }))
      setIsLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messagesForApi }),
        })

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        outer: while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''

          for (const part of parts) {
            for (const line of part.split('\n')) {
              if (!line.startsWith('data: ')) continue
              const payload = line.slice(6)
              if (payload === '[DONE]') break outer

              let parsed: { text?: string; error?: string }
              try {
                parsed = JSON.parse(payload)
              } catch {
                continue // 不正な JSON チャンクはスキップ
              }

              if (parsed.error) throw new Error(parsed.error)

              if (parsed.text) {
                setChat((s) => ({
                  ...s,
                  threads: s.threads.map((t) => {
                    if (t.id !== currentThreadId) return t
                    const msgs = [...t.messages]
                    const last = msgs.at(-1)
                    if (last?.role === 'assistant') {
                      msgs[msgs.length - 1] = { ...last, content: last.content + parsed.text }
                    }
                    return { ...t, messages: msgs }
                  }),
                }))
              }
            }
          }
        }
      } catch {
        // ストリーミング失敗時：空のアシスタントメッセージをエラー文言に差し替え
        setChat((s) => ({
          ...s,
          threads: s.threads.map((t) => {
            if (t.id !== currentThreadId) return t
            const msgs = [...t.messages]
            const last = msgs.at(-1)
            if (last?.role === 'assistant' && last.content === '') {
              msgs[msgs.length - 1] = {
                ...last,
                content: 'エラーが発生しました。もう一度お試しください。',
              }
            }
            return { ...t, messages: msgs }
          }),
        }))
      } finally {
        setIsLoading(false)
      }
    },
    [currentThreadId, currentThread, isLoading]
  )

  return {
    threads,
    currentThreadId,
    currentThread,
    isLoading,
    sendMessage,
    createThread,
    selectThread,
  }
}
