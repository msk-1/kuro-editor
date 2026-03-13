# Kuro Editor

モダンなダークテーマのデスクトップコードエディタ

## 概要

Kuro は Tauri 2 + React + CodeMirror 6 で構築された軽量なコードエディタです。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | [Tauri 2](https://v2.tauri.app/) |
| フロントエンド | React 18 + TypeScript |
| エディタコア | [CodeMirror 6](https://codemirror.net/) |
| ビルドツール | Vite |
| バックエンド | Rust |

## 機能

### エディタ機能

- マルチタブ編集（変更インジケーター付き）
- シンタックスハイライト
  - TypeScript / JavaScript / JSX / TSX
  - CSS / HTML
  - JSON / Markdown
- 検索・置換
  - 正規表現対応
  - エスケープシーケンス対応（`\n`, `\t`, `\r\n` など）
  - 大文字小文字区別 / 単語単位検索
- マルチカーソル編集
- 行操作（複製、削除、移動）
- 括弧マッチング
- Undo / Redo

### UI/UX

- ダークテーマ
- 空白文字の可視化
  - タブ → `→`
  - 全角スペース → `□`
- 改行コード表示
  - LF → `↓`
  - CRLF → `↵`
- フォントズーム（Ctrl/Cmd + スクロール）
- アクセシビリティモード（OpenDyslexic フォント対応）

### キーボードショートカット

| 操作 | macOS | Windows/Linux |
|------|-------|---------------|
| 保存 | `Cmd + S` | `Ctrl + S` |
| 名前を付けて保存 | `Cmd + Shift + S` | `Ctrl + Shift + S` |
| ファイルを開く | `Cmd + O` | `Ctrl + O` |
| 新規タブ | `Cmd + T` | `Ctrl + T` |
| タブを閉じる | `Cmd + W` | `Ctrl + W` |
| 検索 | `Cmd + F` | `Ctrl + F` |
| 置換 | `Cmd + R` | `Ctrl + H` |
| 行を複製 | `Cmd + D` | `Ctrl + D` |
| 行を削除 | `Cmd + Y` | `Ctrl + Y` |
| 行を上に移動 | `Alt + ↑` | `Alt + ↑` |
| 行を下に移動 | `Alt + ↓` | `Alt + ↓` |
| カーソルを上に追加 | `Ctrl + Alt + ↑` | `Ctrl + Alt + ↑` |
| カーソルを下に追加 | `Ctrl + Alt + ↓` | `Ctrl + Alt + ↓` |
| コメント切り替え | `Cmd + /` | `Ctrl + /` |

## セットアップ

### 必要環境

- Node.js 18+
- Rust 1.70+
- [Tauri 2 の前提条件](https://v2.tauri.app/start/prerequisites/)

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（デスクトップアプリ）
npm run tauri:dev

# フロントエンドのみ（ブラウザ）
npm run dev
```

### ビルド

```bash
# 配布用アプリのビルド
npm run tauri:build
```

## プロジェクト構造

```
kuro/
├── src/                    # フロントエンド（React）
│   ├── components/         # UI コンポーネント
│   │   ├── Editor/         # エディタ本体
│   │   └── TabBar/         # タブバー
│   ├── codemirror/         # CodeMirror 設定
│   │   ├── extensions.ts   # プラグイン
│   │   ├── keymaps.ts      # キーバインド
│   │   ├── languages.ts    # 言語設定
│   │   └── theme.ts        # テーマ
│   ├── hooks/              # カスタムフック
│   ├── utils/              # ユーティリティ
│   ├── types/              # 型定義
│   ├── constants/          # 定数
│   └── App.tsx             # メインコンポーネント
├── src-tauri/              # バックエンド（Rust）
│   ├── src/
│   │   ├── commands.rs     # Tauri コマンド
│   │   ├── lib.rs          # アプリ設定
│   │   └── main.rs         # エントリポイント
│   └── tauri.conf.json     # Tauri 設定
└── package.json
```

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | フロントエンド開発サーバー |
| `npm run tauri:dev` | Tauri 開発モード |
| `npm run build` | フロントエンドビルド |
| `npm run tauri:build` | 配布用ビルド |
| `npm run lint` | ESLint 実行 |

## ライセンス

MIT
