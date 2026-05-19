# 実装 TODO リスト

## Phase 1: プロジェクトセットアップ

- [ ] Next.js プロジェクトを初期化する (`npx create-next-app@latest . --typescript --tailwind --app`)
- [ ] 依存パッケージをインストールする
  - [ ] `hono` `@hono/node-server`
  - [ ] `@google/generative-ai`
  - [ ] `react-markdown` `remark-gfm` (Markdown レンダリング用)
- [ ] `tsconfig.json` の `strict: true` を確認する
- [ ] `.env.local` を作成し `GEMINI_API_KEY` を設定する
- [ ] `.gitignore` に `.env.local` が含まれていることを確認する

## Phase 2: バックエンド (Hono API)

- [ ] `api/[[...route]].ts` を作成し Hono アプリを初期化する
- [ ] `vercel.json` を作成し `/api/*` を Hono にルーティングする
- [ ] `POST /api/chat` エンドポイントを実装する
  - [ ] リクエストボディ (`messages` 配列) をバリデーションする
  - [ ] Gemini API クライアントを初期化する (`gemini-3-flash-preview`)
  - [ ] `generateContentStream` でストリーミングレスポンスを取得する
  - [ ] SSE (`text/event-stream`) 形式でクライアントに送信する
  - [ ] ストリーム終了時に `data: [DONE]` を送信する
  - [ ] エラー時に適切なステータスコードとメッセージを返す

## Phase 3: 型定義・共通ロジック

- [ ] `types/chat.ts` に型を定義する
  - [ ] `Message` (`role: 'user' | 'assistant'`, `content: string`)
  - [ ] `ChatThread` (`id: string`, `messages: Message[]`, `title: string`)
- [ ] `hooks/useChat.ts` カスタムフックを実装する
  - [ ] `threads` (スレッド一覧) の state 管理
  - [ ] `currentThreadId` の state 管理
  - [ ] `sendMessage` 関数: `/api/chat` に fetch し SSE をパースして `messages` を更新する
  - [ ] ストリーミング中の `isLoading` フラグ管理
  - [ ] 新規スレッド作成関数 `createThread`

## Phase 4: フロントエンド UI

- [ ] `app/layout.tsx` にグローバルレイアウト（フォント・背景色）を設定する
- [ ] `app/page.tsx` をチャット画面のルートとして実装する
- [ ] `components/Sidebar.tsx` を実装する
  - [ ] スレッド一覧を表示する
  - [ ] スレッドを選択すると `currentThreadId` が切り替わる
  - [ ] 「新規チャット」ボタンを配置する
- [ ] `components/ChatWindow.tsx` を実装する
  - [ ] `currentThreadId` に対応するメッセージ一覧を表示する
  - [ ] メッセージ追加時に最下部へ自動スクロールする
- [ ] `components/MessageBubble.tsx` を実装する
  - [ ] `role` に応じてユーザー / AI のスタイルを出し分ける
  - [ ] `react-markdown` + `remark-gfm` で Markdown をレンダリングする
  - [ ] コードブロックにシンタックスハイライトを適用する（`rehype-highlight` 等）
- [ ] `components/MessageInput.tsx` を実装する
  - [ ] テキストエリア（`Shift+Enter` で改行、`Enter` で送信）
  - [ ] ストリーミング中は送信ボタンを無効化する

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
