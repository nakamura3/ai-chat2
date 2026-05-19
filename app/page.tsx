'use client'

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

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={selectThread}
        onNewThread={createThread}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <ChatWindow messages={currentThread?.messages ?? []} isLoading={isLoading} />
        <MessageInput onSend={sendMessage} isLoading={isLoading} />
      </main>
    </div>
  )
}
