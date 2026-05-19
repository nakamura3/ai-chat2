'use client'

import type { ChatThread } from '@/types/chat'

interface Props {
  threads: ChatThread[]
  currentThreadId: string | null
  onSelectThread: (id: string) => void
  onNewThread: () => void
  isOpen: boolean
}

export function Sidebar({ threads, currentThreadId, onSelectThread, onNewThread, isOpen }: Props) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 flex w-64 flex-shrink-0 flex-col bg-zinc-900 text-white
        transition-transform duration-300 ease-in-out
        md:static md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="p-3">
        <button
          onClick={onNewThread}
          className="flex w-full items-center gap-2 rounded-lg border border-zinc-600 px-3 py-2.5 text-sm text-zinc-100 transition-colors hover:bg-zinc-800"
        >
          <span className="text-base leading-none">＋</span>
          <span>新しいチャット</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-0.5">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              title={thread.title}
              className={`w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                thread.id === currentThreadId
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {thread.title}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  )
}
