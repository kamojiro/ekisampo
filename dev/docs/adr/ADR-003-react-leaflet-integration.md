# ADR-003: React + Leaflet統合パターン

- 日付: 2025-01-17
- ステータス: 承認
- レイヤ: web
- 種別: Web/API
- 関連コンポーネント: components/Map/MapContainer.tsx / components/Map/DrawingTools.tsx / components/Map/StationMarker.tsx

---

## 1. 背景 / コンテキスト

- 目的・解決したいこと:
  - Reactの宣言的UIとLeafletの命令的APIを統合したい
  - 地図上での描画・マーカー表示をReactコンポーネントとして扱いたい

- 前提・制約:
  - Leafletは命令的API（`map.addLayer()`, `marker.remove()`）
  - Reactは宣言的（状態 → UI）
  - メモリリークを防ぐためレイヤーの適切なクリーンアップが必要

- この ADR がカバーする範囲:
  - React-Leaflet統合のパターン選定
  - 描画ツール・マーカーのライフサイクル管理

---

## 2. 決定

**react-leaflet**をベースに、**useRef + useEffect + クリーンアップ**パターンで命令的操作を管理する。

```typescript
const markerRef = useRef<L.Marker | null>(null)
useEffect(() => {
  const marker = L.marker([lat, lng]).addTo(map)
  markerRef.current = marker
  return () => marker.remove()  // クリーンアップ
}, [map, lat, lng])
```

---

## 3. 選択肢と評価

### 採用案（本 ADR の決定）

- 概要:
  - react-leaflet + useRef/useEffect による命令的操作のラップ
- メリット:
  - Reactのライフサイクルに沿ったリソース管理
  - useMapフックで直接Leafletインスタンスにアクセス可能
  - 依存配列でレンダリング条件を明示
- デメリット / リスク:
  - 命令的コードが増えると可読性が下がる
  - useEffectの依存配列管理が複雑になりがち

### 代替案 A: Pure Leaflet（React不使用）

- 概要: Leafletのみで地図UIを構築
- 採用しなかった理由:
  - アプリ全体がReactなので統合が困難
  - 状態管理が二重化する

### 代替案 B: react-leaflet のみ（命令的操作なし）

- 概要: react-leafletの宣言的コンポーネントのみ使用
- 採用しなかった理由:
  - Leaflet Geomanは命令的APIのみ
  - カスタム描画プレビューには直接DOM操作が必要

---

## 4. 根拠（評価軸と判断）

- ビジョンとの整合:
  - 「Reactアプリケーションとして一貫性を保つ」方針に合致

- 非機能要件:
  - メモリリーク防止: クリーンアップ関数で確実にレイヤー削除
  - パフォーマンス: 不要な再レンダリングを依存配列で制御

- パターンの使い分け:
  | 操作 | パターン |
  |------|----------|
  | 静的マーカー | react-leaflet `<Marker>` |
  | 動的マーカー | useRef + useEffect |
  | 描画ツール | Geoman API + イベントリスナー |
  | タイルレイヤー | react-leaflet `<TileLayer>` |

---

## 5. 影響範囲

- コード / ディレクトリ構成:
  - `src/components/Map/MapContainer.tsx` - react-leaflet基本構成
  - `src/components/Map/DrawingTools.tsx` - 命令的描画ロジック
  - `src/components/Map/StationMarker.tsx` - useRef + useEffectパターン

- 既存・将来のコンポーネント:
  - 新しい地図機能追加時は同じパターンを踏襲
  - クリーンアップ関数を必ず実装

- 運用プロセス:
  - ESLint react-hooks/exhaustive-depsで依存配列をチェック

---

## 6. ロールアウト / 移行方針

- フェーズ:
  - 初期実装で完了済み

- 具体的ステップ:
  1. react-leaflet をnpm install
  2. MapContainer/TileLayerで基本構成
  3. 命令的操作はuseRef + useEffectでラップ
  4. クリーンアップ関数を必ず実装

---

## 7. オープンな論点 / フォローアップ

- open question:
  - 大量マーカー（1000+）の場合のクラスタリング戦略
  - カスタムフックへの抽出（useLeafletLayer等）

- 別 ADR に切る予定のテーマ:
  - ADR-004: 描画モードの実装方式

---

## 8. 関連 ADR

- ADR-004: ハイブリッド描画モード
- ADR-005: 座標系管理
