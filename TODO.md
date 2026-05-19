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

- [x] ローカルで `npm run dev` を起動して動作確認する
  - [ ] メッセージ送信 → ストリーミング表示（GEMINI_API_KEY 設定後に要確認）
  - [ ] マルチターン対話（GEMINI_API_KEY 設定後に要確認）
  - [ ] 新規チャット作成（コードレビューで確認済み）
  - [ ] Markdown / コードブロックのレンダリング（コードレビューで確認済み）
- [x] モバイルブラウザでレイアウトを確認する（ハンバーガーメニュー＋オーバーレイ sidebar 対応済み）
- [x] Gemini API エラー時のフォールバック表示を確認する（curl で全パターン確認済み）

## Phase 6: Vercel デプロイ

> ⚠️ 社内プロキシが TLS を遮断するため CLI からは接続不可。以下の手順で手動デプロイを行う。

- [ ] GitHub にリポジトリを push する
  ```bash
  git remote add origin https://github.com/<your-org>/ai-chat2.git
  git push -u origin main
  ```
- [ ] Vercel ダッシュボード (https://vercel.com/new) でリポジトリをインポートする
  - Framework Preset: **Next.js** を選択（自動検出される）
  - Root Directory: そのまま（変更不要）
- [ ] Vercel ダッシュボードで環境変数を設定する
  - `GEMINI_API_KEY` = `<Google AI Studio のキー>`
  - 対象環境: Production / Preview / Development すべてにチェック
- [ ] **Deploy** ボタンを押してデプロイを実行する
- [ ] 本番 URL で動作確認する
  - [ ] メッセージ送信 → ストリーミング表示
  - [ ] マルチターン対話
  - [ ] 新規チャット作成

---

## Phase 7: バグ修正（🚨 リリース前必須）

### 7-1. IME 確定 Enter でメッセージが送信される
- **場所**: `components/MessageInput.tsx` `handleKeyDown`
- **問題**: 日本語入力の変換確定（Enter）が送信トリガーになる
- **修正**: `e.nativeEvent.isComposing` が `true` の間は送信をスキップする
  ```ts
  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
  ```

### 7-2. Vercel Serverless Function のタイムアウト
- **場所**: `app/api/[[...route]]/route.ts`
- **問題**: デフォルト 10 秒制限。長い AI 応答が途中で切れる
- **修正**: ファイル先頭に `export const maxDuration = 60` を追加

---

## Phase 8: UX 改善（⚠️ 優先度高）

### 8-1. ストリーミング中の自動スクロールがユーザー操作を妨げる
- **場所**: `components/ChatWindow.tsx`
- **問題**: `messages` 変化のたびに `scrollIntoView` が呼ばれ、手動スクロールが上書きされる
- **修正**: スクロール位置を監視し、ユーザーが底付近にいる場合のみ自動スクロールする
  ```ts
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
  if (isNearBottom) bottomRef.current?.scrollIntoView(...)
  ```

### 8-2. コンテンツ到達後のストリーミングカーソルなし
- **場所**: `components/MessageBubble.tsx`
- **問題**: タイピングインジケーター（ドット）はコンテンツ到着前のみ表示。文字が流れ始めたら生成中かどうか視覚的に不明
- **修正**: `isLast && isLoading && content` のとき content 末尾に `▍` を付加して表示

### 8-3. 空スレッドが蓄積する
- **場所**: `hooks/useChat.ts` `createThread`
- **問題**: メッセージ未送信のまま「新しいチャット」を連打すると空スレッドが増え続ける
- **修正**: 現在のスレッドが空のときは新スレッドを作らず、既存の空スレッドを再利用する

### 8-4. ストリーミング途中エラー時に完了と区別できない
- **場所**: `hooks/useChat.ts` `catch` ブロック
- **問題**: 一部コンテンツ受信後にネットワークエラーが起きると、受信済みテキストが残るが途中で途切れていることがわからない
- **修正**: エラー時は受信済みコンテンツを保持しつつ末尾に `\n\n---\n⚠️ 応答の取得中にエラーが発生しました` を追記する
  ```ts
  // catch: content が空でない場合はエラーメッセージを追記
  if (last?.role === 'assistant') {
    const suffix = last.content ? '\n\n---\n⚠️ 応答の取得中にエラーが発生しました' : 'エラーが発生しました。もう一度お試しください。'
    msgs[msgs.length - 1] = { ...last, content: last.content + suffix }
  }
  ```

---

## Phase 9: セキュリティ・品質（🔒）

### 9-1. Markdown リンクのセキュリティ対応
- **場所**: `components/MessageBubble.tsx`
- **問題**: Gemini が出力したリンクが同タブで開く。`rel` なしで opener 攻撃のリスク
- **修正**: `react-markdown` の `components` に `a` ハンドラーを追加
  ```tsx
  a({ href, children, ...props }) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  }
  ```

### 9-2. クライアント切断時の Gemini API ストリーム継続
- **場所**: `app/api/[[...route]]/route.ts`
- **問題**: ブラウザを閉じても Gemini API のストリームが最後まで実行され、API quota を消費し続ける
- **修正**: `AbortController` をリクエストに渡し、クライアント切断時にストリームを中断する
  ```ts
  const abortController = new AbortController()
  c.req.raw.signal.addEventListener('abort', () => abortController.abort())
  const result = await chat.sendMessageStream(lastMessage.content, { signal: abortController.signal })
  ```

---

## Phase 10: 見た目・モバイル対応（🎨📱）

### 10-1. iOS Safari でテキストエリアフォーカス時にズームされる
- **場所**: `app/layout.tsx`
- **問題**: iOS Safari はフォントサイズ 16px 未満の input/textarea にフォーカスすると自動ズームする。`viewport` が未設定
- **修正**: `layout.tsx` に `Viewport` export を追加
  ```ts
  import type { Viewport } from 'next'
  export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 }
  ```

### 10-2. `.markdown-body` にダークモード対応なし
- **場所**: `app/globals.css`
- **問題**: `prefers-color-scheme: dark` 時に表・コードバックグラウンド・テキスト色が白背景前提のまま
- **修正**: `.markdown-body` スタイルに `@media (prefers-color-scheme: dark)` ブロックを追加

### 10-3. 日本語フォントのフォールバック未設定
- **場所**: `app/globals.css`
- **問題**: `body` の `font-family: Arial, Helvetica, sans-serif` は日本語グリフを持たない。OS フォントに自動フォールバックされるが不安定
- **修正**: body の font-family に `"Hiragino Sans", "Yu Gothic", "Meiryo"` 等を追加

### 10-4. モバイルオーバーレイにフェードトランジションなし
- **場所**: `app/page.tsx`
- **問題**: サイドバー開閉時、背景オーバーレイが瞬間的に出現・消滅する
- **修正**: `opacity` + `transition` を使ったフェードアニメーションを追加

---

## Phase 11: パフォーマンス最適化（⚡）

### 11-1. `sendMessage` がストリーミング中に毎チャンク再生成される
- **場所**: `hooks/useChat.ts`
- **問題**: `useCallback` の依存配列に `currentThread` があり、ストリーミング中 `threads` が更新されるたびに `sendMessage` が新しい参照になる。`MessageInput` が毎チャンク再レンダリングされる
- **修正**: `currentThread` を `useRef` で追跡し、`sendMessage` の依存から外す
  ```ts
  const currentThreadRef = useRef(currentThread)
  useEffect(() => { currentThreadRef.current = currentThread }, [currentThread])
  // sendMessage の依存配列から currentThread を除去
  ```
