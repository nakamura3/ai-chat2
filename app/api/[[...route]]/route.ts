import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { streamSSE } from 'hono/streaming'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

type ImageData = {
  mimeType: string
  data: string // Base64
}

type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'image'; imageData: ImageData }

type Message = {
  role: 'user' | 'assistant'
  content: string | MessageContent[]
}

function contentToParts(content: string | MessageContent[]) {
  if (typeof content === 'string') {
    return [{ text: content }]
  }
  return content.map((part) => {
    if (part.type === 'text') {
      return { text: part.text }
    }
    return {
      inlineData: {
        mimeType: part.imageData.mimeType,
        data: part.imageData.data,
      },
    }
  })
}

const app = new Hono().basePath('/api')

app.post('/chat', async (c) => {
  const body = await c.req.json<{ messages: Message[] }>().catch(() => null)

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return c.json({ error: 'messages は必須の配列です' }, 400)
  }

  const { messages } = body
  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role !== 'user') {
    return c.json({ error: '最後のメッセージは user である必要があります' }, 400)
  }

  // 画像サイズのバリデーション
  for (const msg of messages) {
    if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === 'image') {
          // Base64 文字列から概算バイト数を計算
          const byteSize = Math.ceil((part.imageData.data.length * 3) / 4)
          if (byteSize > MAX_IMAGE_SIZE_BYTES) {
            return c.json({ error: '画像のサイズが上限 (10MB) を超えています' }, 400)
          }
        }
      }
    }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return c.json({ error: 'GEMINI_API_KEY が設定されていません' }, 500)
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' })

  // assistant → model に変換し、最後のメッセージを除いた履歴を渡す
  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: contentToParts(msg.content),
  }))

  const chat = model.startChat({ history })
  const lastParts = contentToParts(lastMessage.content)

  return streamSSE(c, async (stream) => {
    try {
      const result = await chat.sendMessageStream(lastParts)
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          await stream.writeSSE({ data: JSON.stringify({ text }) })
        }
      }
      await stream.writeSSE({ data: '[DONE]' })
    } catch {
      await stream.writeSSE({
        data: JSON.stringify({ error: 'Gemini API でエラーが発生しました' }),
      })
    }
  })
})

export const GET = handle(app)
export const POST = handle(app)
