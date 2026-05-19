# AI Chat アプリケーション 仕様書

## プロジェクト概要

社内社員向けの汎用会話AIチャットボット。Gemini APIを使用したリアルタイムストリーミング応答に対応したWebアプリケーション。

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js (React, App Router)
- **デプロイ**: Vercel
- **スタイリング**: Tailwind CSS（推奨）

### バックエンド
- **ランタイム**: Node.js
- **フレームワーク**: Hono（`hono/vercel` アダプター使用）
- **デプロイ**: Vercel（フロントエンドと同一プロジェクト）

### AI
- **プロバイダー**: Google Gemini API
- **推奨モデル**: `gemini-3.1-flash-lite`（コスト・速度のバランス）
- **応答方式**: Server-Sent Events (SSE) によるストリーミング

### データストア
- なし（セッション中の会話履歴はクライアント側のメモリ/stateで管理）

### 認証
- なし（社内ネットワーク制御によるアクセス制限を想定）

## アーキテクチャ

```
[ブラウザ (Next.js)]
       │  SSE / fetch streaming
       ▼
[Hono API サーバー]          ← 両方とも Vercel にデプロイ
       │  Gemini API (streaming)
       ▼
[Google Gemini API]
```

フロントエンド (Next.js) とバックエンド (Hono) は同一の Vercel プロジェクトとして管理する。Hono は Vercel の Serverless Functions として動作する。

## 機能要件

### 必須機能
- テキストメッセージの送受信
- Gemini API を使ったストリーミング回答（文字が順次表示される）
- セッション内の会話コンテキスト維持（マルチターン対話）
- Markdown レンダリング（コードブロック、見出し、リストなど）

### UIデザイン
- ChatGPT ライクなシンプルなレイアウト
  - 左サイドバー: 現在セッションの会話スレッド（ページリロードでリセット）
  - 右メインエリア: チャット画面
- レスポンシブデザイン対応
- 新規チャット開始ボタン

## ディレクトリ構成（推奨）

```
ai-chat2/                      # Vercel プロジェクトルート
├── app/                       # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ChatWindow.tsx          # メインチャット表示エリア
│   ├── MessageInput.tsx        # 入力フォーム
│   ├── MessageBubble.tsx       # メッセージ表示コンポーネント
│   └── Sidebar.tsx             # サイドバー（スレッド一覧）
├── hooks/
│   └── useChat.ts              # チャット状態管理カスタムフック
├── types/
│   └── chat.ts                 # 型定義
├── app/
│   └── api/
│       └── [[...route]]/
│           └── route.ts        # Hono アプリのエントリーポイント（catch-all）
├── package.json
└── next.config.ts
```

## API仕様

### POST /api/chat

会話メッセージを送信し、ストリーミングで回答を受け取る。

**リクエストボディ:**
```json
{
  "messages": [
    { "role": "user", "content": "こんにちは" },
    { "role": "assistant", "content": "こんにちは！何かお手伝いできますか？" },
    { "role": "user", "content": "TypeScriptについて教えて" }
  ]
}
```

**レスポンス:** `text/event-stream` (SSE)
```
data: {"text": "TypeScript"}
data: {"text": "は"}
data: {"text": "..."}
data: [DONE]
```

## 環境変数

同一 Vercel プロジェクトのため、環境変数は一箇所で管理する。

```
GEMINI_API_KEY=<Google AI Studio で取得したAPIキー>
```

フロントエンドから API を呼び出す際は相対パス（`/api/chat`）を使用するため、`NEXT_PUBLIC_API_URL` は不要。

## 開発ガイドライン

- TypeScript を使用する（`strict: true`）
- コンポーネントは関数コンポーネント + React hooks で実装
- Hono の `streamSSE` または `stream` ヘルパーでストリーミングを実装
- Gemini API は `@google/generative-ai` パッケージを使用
- エラーハンドリング: API エラー時はユーザーにわかりやすいメッセージを表示

## 今後の拡張候補（現時点では対象外）

- ユーザー認証・ログイン機能
- 会話履歴のDB永続化
- ファイル添付・画像入力
- システムプロンプトのカスタマイズ UI
- 使用トークン数の表示
