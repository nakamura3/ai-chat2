'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onSend: (content: string) => void
  isLoading: boolean
}

export function MessageInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // テキスト量に応じてテキストエリアの高さを自動調整
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 192)}px`
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = value.trim().length > 0 && !isLoading

  return (
    <div className="border-t border-zinc-200 bg-white px-4 py-4">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力… (Shift+Enter で改行)"
            rows={1}
            disabled={isLoading}
            className="w-full resize-none overflow-y-auto rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-4 text-sm text-zinc-800 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className="mb-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
          aria-label="送信"
        >
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          )}
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-zinc-400">
        Enter で送信　Shift+Enter で改行
      </p>
    </div>
  )
}
