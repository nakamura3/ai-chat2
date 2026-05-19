export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatThread = {
  id: string
  title: string
  messages: Message[]
}
