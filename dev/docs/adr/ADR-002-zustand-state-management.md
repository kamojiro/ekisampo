# ADR-002: Zustand状態管理と選択的永続化

- 日付: 2025-01-17
- ステータス: 承認
- レイヤ: core
- 種別: アプリ構成
- 関連コンポーネント: stores/appStore.ts

---

## 1. 背景 / コンテキスト

- 目的・解決したいこと:
  - アプリケーション全体で共有する状態を一元管理したい
  - 一部の状態（除外リスト）はブラウザを閉じても保持したい

- 前提・制約:
  - 小規模なSPA（シングルページアプリケーション）
  - 状態: 地図中心、ズーム、描画エリア、駅データ、選択駅、除外リスト
  - 永続化はlocalStorageで十分

- この ADR がカバーする範囲:
  - グローバル状態管理ライブラリの選定
  - 永続化戦略の決定

---

## 2. 決定

**Zustand**を採用し、**選択的永続化**（excludedStationIdsのみ）を実装する。

```typescript
persist(
  (set) => ({ /* state */ }),
  {
    name: 'ekisampo-storage',
    partialize: (state) => ({ excludedStationIds: state.excludedStationIds }),
  }
)
```

---

## 3. 選択肢と評価

### 採用案（本 ADR の決定）

- 概要:
  - Zustand + persist middleware による軽量状態管理
- メリット:
  - 軽量（~2KB gzipped）
  - ボイラープレート最小
  - セレクターパターンで細かい再レンダリング制御
  - 永続化ミドルウェア内蔵
- デメリット / リスク:
  - Redux DevToolsほどのデバッグ体験はない
  - 大規模チームでの採用実績はReduxに劣る

### 代替案 A: Redux + Redux Toolkit

- 概要: 業界標準の状態管理ライブラリ
- 採用しなかった理由:
  - 140駅検索アプリには過剰なボイラープレート
  - Action/Reducer/Selectorの分離が小規模アプリでは煩雑

### 代替案 B: React Context + useReducer

- 概要: React組み込みの状態管理
- 採用しなかった理由:
  - 再レンダリング最適化が困難（Context全体が更新される）
  - 永続化は自前実装が必要

---

## 4. 根拠（評価軸と判断）

- ビジョンとの整合:
  - 「シンプルに保つ」方針に合致
  - Provider不要でコンポーネントツリーがクリーン

- 非機能要件:
  - バンドルサイズ: Zustand ~2KB vs Redux ~10KB+
  - 永続化: 組み込みミドルウェアで簡単実装

- 永続化戦略の判断:
  | 状態 | 永続化 | 理由 |
  |------|--------|------|
  | excludedStationIds | ○ | ユーザー設定として保持 |
  | drawnArea | × | セッション固有 |
  | selectedStation | × | 毎回選び直し |
  | stations | × | 毎回フェッチ |

---

## 5. 影響範囲

- コード / ディレクトリ構成:
  - `src/stores/appStore.ts` - 単一ストアで全状態を管理

- 既存・将来のコンポーネント:
  - 全コンポーネントが `useAppStore` で状態にアクセス
  - セレクターパターン: `useAppStore((s) => s.xxx)`

- 運用プロセス:
  - localStorage の `ekisampo-storage` キーで永続化データを確認可能

---

## 6. ロールアウト / 移行方針

- フェーズ:
  - 初期実装で完了済み

- 具体的ステップ:
  1. zustand をnpm install
  2. appStore.ts でcreate + persist middleware設定
  3. コンポーネントでuseAppStoreを使用

---

## 7. オープンな論点 / フォローアップ

- open question:
  - 複数の描画エリア履歴を保存する場合の拡張
  - クラウド同期（複数デバイス間）の必要性

- 別 ADR に切る予定のテーマ:
  - なし

---

## 8. 関連 ADR

- なし
