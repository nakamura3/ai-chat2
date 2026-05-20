'use client'

import { useEffect, useRef, useState } from 'react'
import type { ImageData } from '@/types/chat'

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface Props {
  onSend: (text: string, images: ImageData[]) => void
  isLoading: boolean
}

export function MessageInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState('')
  const [images, setImages] = useState<ImageData[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 192)}px`
  }, [value])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if ((!trimmed && images.length === 0) || isLoading) return
    onSend(trimmed, images)
    setValue('')
    setImages([])
    setFileError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setFileError(null)
    const errors: string[] = []

    for (const file of files) {
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        errors.push(`${file.name}: 非対応のファイル形式です (JPEG, PNG, GIF, WebP のみ)`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: ファイルサイズが 10MB を超えています`)
        continue
      }

      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        const data = result.split(',')[1]
        setImages((prev) => [...prev, { mimeType: file.type, data }])
      }
      reader.readAsDataURL(file)
    }

    if (errors.length) setFileError(errors.join('\n'))
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const canSend = (value.trim().length > 0 || images.length > 0) && !isLoading

  return (
    <div className="border-t border-zinc-200 bg-white px-4 py-4">
      <div className="mx-auto max-w-3xl">
        {/* 画像プレビュー */}
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:${img.mimeType};base64,${img.data}`}
                  alt={`添付画像 ${i + 1}`}
                  className="h-20 w-20 rounded-lg border border-zinc-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-white hover:bg-zinc-900"
                  aria-label="画像を削除"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* エラーメッセージ */}
        {fileError && (
          <p className="mb-2 whitespace-pre-line text-xs text-red-500">{fileError}</p>
        )}

        <div className="flex items-end gap-3">
          {/* 画像添付ボタン */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="mb-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="画像を添付"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME_TYPES.join(',')}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

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

        <p className="mt-2 text-center text-xs text-zinc-400">
          Enter で送信　Shift+Enter で改行　画像は JPEG / PNG / GIF / WebP (最大 10MB)
        </p>
      </div>
    </div>
  )
}
