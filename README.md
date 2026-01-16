# ekisampo

React + TypeScript + Vite で構築されたフロントエンドアプリケーション

## Tech Stack

- **React** 19.0.0 - UIライブラリ
- **TypeScript** 5.7.2 - 型安全な開発
- **Vite** 6.1.0 - 高速ビルドツール
- **SWC** - 高速なトランスパイラ（@vitejs/plugin-react-swc）
- **ESLint** - コード品質管理
- **axios** - HTTPクライアント
- **SWR** - データフェッチング

## Prerequisites

- Node.js 20.x 以上
- npm

## Getting Started

### インストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

開発サーバーが起動し、ブラウザで `http://localhost:5173` にアクセスできます。
Hot Module Replacement (HMR) により、コードの変更が即座に反映されます。

### ビルド

本番用のビルドを作成します。

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### プレビュー

ビルドしたアプリケーションをローカルでプレビューします。

```bash
npm run preview
```

### リント

ESLintでコードをチェックします。

```bash
npm run lint
```

## Project Structure

```
ekisampo/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI設定
├── src/
│   ├── assets/             # 静的アセット
│   ├── components/         # Reactコンポーネント
│   ├── App.tsx             # メインコンポーネント
│   ├── App.css
│   ├── main.tsx            # エントリーポイント
│   ├── index.css
│   └── vite-env.d.ts       # Vite型定義
├── dist/                   # ビルド成果物（gitignore）
├── index.html              # HTMLエントリーポイント
├── vite.config.ts          # Vite設定
├── tsconfig.json           # TypeScript設定
├── tsconfig.app.json       # アプリ用TypeScript設定
├── tsconfig.node.json      # Node.js用TypeScript設定
├── eslint.config.js        # ESLint設定
└── package.json
```

## Scripts

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ビルドを作成 |
| `npm run lint` | ESLintでコードをチェック |
| `npm run preview` | ビルドしたアプリをプレビュー |

## CI/CD

GitHub Actionsを使用した自動化されたCI/CDパイプライン:

- **Lint**: ESLintによるコード品質チェック
- **Type Check**: TypeScriptの型チェック
- **Build**: 本番用ビルドの作成
- **Artifacts**: ビルド成果物の保存（7日間）

mainブランチとdevelopブランチへのpush、およびこれらのブランチへのPull Requestで自動実行されます。

## Configuration

### Vite

- Base path: `/static/`
- React SWCプラグイン使用

### TypeScript

- Strict mode有効
- 未使用の変数・パラメータチェック有効
- Bundler mode（moduleResolution）

### ESLint

- React Hooksルール適用
- React Refresh対応

## Expanding the ESLint Configuration

本番アプリケーションを開発する場合、型を考慮したlintルールを有効にすることを推奨します。

`eslint.config.js`を以下のように更新:

```js
export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- `tseslint.configs.recommended` を `tseslint.configs.recommendedTypeChecked` または `tseslint.configs.strictTypeChecked` に置き換え
- オプションで `...tseslint.configs.stylisticTypeChecked` を追加

## License

Private
