'use client'

import { useState } from 'react'
import { ChatWindow } from '@/components/ChatWindow'
import { MessageInput } from '@/components/MessageInput'
import { Sidebar } from '@/components/Sidebar'
import { useChat } from '@/hooks/useChat'

export default function Home() {
  const {
    threads,
    currentThreadId,
    currentThread,
    isLoading,
    sendMessage,
    createThread,
    selectThread,
  } = useChat()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSelectThread = (id: string) => {
    selectThread(id)
    setIsSidebarOpen(false)
  }

  const handleNewThread = () => {
    createThread()
    setIsSidebarOpen(false)
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-white">
      {/* モバイル用オーバーレイ背景 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        isOpen={isSidebarOpen}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* モバイル用ヘッダー */}
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="メニューを開く"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-zinc-700">AI Chat</span>
        </div>

        <ChatWindow messages={currentThread?.messages ?? []} isLoading={isLoading} />
        <MessageInput onSend={sendMessage} isLoading={isLoading} />
      </main>
    </div>
  )
}
