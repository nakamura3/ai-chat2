# 実装 TODO リスト

## Phase 1: プロジェクトセットアップ

- [x] Next.js プロジェクトを初期化する (`npx create-next-app@latest . --typescript --tailwind --app`)
- [x] 依存パッケージをインストールする
  - [x] `hono`（`hono/vercel` アダプター内蔵、`@hono/node-server` は App Router では不要）
  - [x] `@google/generative-ai`
  - [x] `react-markdown` `remark-gfm` (Markdown レンダリング用)
- [x] `tsconfig.json` の `strict: true` を確認する
- [x] `.env.local` を作成し `GEMINI_API_KEY` を設定する
- [x] `.gitignore` に `.env.local` が含まれていることを確認する

## Phase 2: バックエンド (Hono API)

- [x] `app/api/[[...route]]/route.ts` を作成し Hono アプリを初期化する
- [x] `POST /api/chat` エンドポイントを実装する
  - [x] リクエストボディ (`messages` 配列) をバリデーションする
  - [x] Gemini API クライアントを初期化する (`gemini-3.1-flash-lite`)
  - [x] `sendMessageStream` でストリーミングレスポンスを取得する
  - [x] SSE (`text/event-stream`) 形式でクライアントに送信する
  - [x] ストリーム終了時に `data: [DONE]` を送信する
  - [x] エラー時に適切なステータスコードとメッセージを返す

## Phase 3: 型定義・共通ロジック

- [x] `types/chat.ts` に型を定義する
  - [x] `Message` (`role: 'user' | 'assistant'`, `content: string`)
  - [x] `ChatThread` (`id: string`, `messages: Message[]`, `title: string`)
- [x] `hooks/useChat.ts` カスタムフックを実装する
  - [x] `threads` (スレッド一覧) の state 管理
  - [x] `currentThreadId` の state 管理
  - [x] `sendMessage` 関数: `/api/chat` に fetch し SSE をパースして `messages` を更新する
  - [x] ストリーミング中の `isLoading` フラグ管理
  - [x] 新規スレッド作成関数 `createThread`

## Phase 4: フロントエンド UI

- [x] `app/layout.tsx` にグローバルレイアウト（フォント・背景色）を設定する
- [x] `app/page.tsx` をチャット画面のルートとして実装する
- [x] `components/Sidebar.tsx` を実装する
  - [x] スレッド一覧を表示する
  - [x] スレッドを選択すると `currentThreadId` が切り替わる
  - [x] 「新規チャット」ボタンを配置する
- [x] `components/ChatWindow.tsx` を実装する
  - [x] `currentThreadId` に対応するメッセージ一覧を表示する
  - [x] メッセージ追加時に最下部へ自動スクロールする
- [x] `components/MessageBubble.tsx` を実装する
  - [x] `role` に応じてユーザー / AI のスタイルを出し分ける
  - [x] `react-markdown` + `remark-gfm` で Markdown をレンダリングする
  - [x] コードブロックにシンタックスハイライトを適用する（`react-syntax-highlighter` + Prism `oneDark`）
- [x] `components/MessageInput.tsx` を実装する
  - [x] テキストエリア（`Shift+Enter` で改行、`Enter` で送信）
  - [x] ストリーミング中は送信ボタンを無効化する

## Phase 5: 動作確認・調整

- [ ] ローカルで `npm run dev` を起動して動作確認する
  - [ ] メッセージ送信 → ストリーミング表示
  - [ ] マルチターン対話（文脈が引き継がれるか）
  - [ ] 新規チャット作成
  - [ ] Markdown / コードブロックのレンダリング
- [ ] モバイルブラウザでレイアウトを確認する
- [ ] Gemini API エラー時のフォールバック表示を確認する

## Phase 6: Vercel デプロイ

- [ ] Vercel プロジェクトを作成し Git リポジトリと連携する
- [ ] Vercel ダッシュボードで `GEMINI_API_KEY` 環境変数を設定する
- [ ] `vercel deploy` を実行する
- [ ] 本番 URL で動作確認する
