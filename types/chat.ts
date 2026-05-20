export type ImageData = {
  mimeType: string
  data: string // Base64
}

export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'image'; imageData: ImageData }

export type Message = {
  role: 'user' | 'assistant'
  content: string | MessageContent[]
}

export type ChatThread = {
  id: string
  title: string
  messages: Message[]
}
