# ADR-005: 座標系管理（GeoJSON vs Leaflet）

- 日付: 2025-01-17
- ステータス: 承認
- レイヤ: cross-cutting
- 種別: その他
- 関連コンポーネント: types/index.ts / lib/stationSearch.ts / components/Map/*.tsx

---

## 1. 背景 / コンテキスト

- 目的・解決したいこと:
  - 複数のライブラリ間で座標系の不整合を防ぎたい
  - バグの温床となる座標変換を明示的に管理したい

- 前提・制約:
  - **GeoJSON標準**: `[longitude, latitude]` （経度, 緯度）
  - **Leaflet API**: `(latitude, longitude)` （緯度, 経度）
  - **Turf.js**: GeoJSON標準に準拠 `[longitude, latitude]`
  - データは全てGeoJSON形式で保存

- この ADR がカバーする範囲:
  - 座標系の統一ルール
  - 変換が必要な箇所の明示

---

## 2. 決定

**データ層はGeoJSON標準 `[lng, lat]`** で統一し、**Leaflet APIとの境界でのみ変換**を行う。

変換が必要な箇所にはコメントで明示する:
```typescript
// note: coordinates are [lng, lat], Leaflet expects [lat, lng]
const position: L.LatLngExpression = [coords[1], coords[0]]
```

---

## 3. 選択肢と評価

### 採用案（本 ADR の決定）

- 概要:
  - データ: GeoJSON標準 `[lng, lat]`
  - UI: Leaflet APIとの境界で変換
- メリット:
  - GeoJSONデータの相互運用性を維持
  - Turf.jsとの連携がシームレス
  - 変換箇所が限定的（Map関連コンポーネントのみ）
- デメリット / リスク:
  - 変換忘れによるバグのリスク
  - コードレビューで注意が必要

### 代替案 A: 全てLeaflet形式 `[lat, lng]` で統一

- 概要: データ保存時もLeaflet形式を使用
- 採用しなかった理由:
  - GeoJSON標準から逸脱
  - Turf.js使用時に毎回変換が必要
  - 将来の外部データ連携で問題

### 代替案 B: 座標オブジェクト `{ lat, lng }` を使用

- 概要: 配列ではなくオブジェクトで管理
- 採用しなかった理由:
  - GeoJSONとの互換性がなくなる
  - データサイズが増加

---

## 4. 根拠（評価軸と判断）

- ビジョンとの整合:
  - 「GeoJSON標準に準拠」という方針に合致
  - 将来の外部データ連携を考慮

- 変換が必要な箇所（明示的に管理）:
  | 箇所 | 元形式 | 変換先 |
  |------|--------|--------|
  | StationMarker | `[lng, lat]` | `[lat, lng]` |
  | MapContainer center | `[lat, lng]` | そのまま |
  | Turf.js入力 | `[lng, lat]` | そのまま |
  | 描画結果の保存 | Leaflet形式 | GeoJSON形式 |

- バグ防止策:
  - TypeScript型でLatLngTupleを定義
  - 変換箇所にコメント必須
  - ESLintカスタムルール検討

---

## 5. 影響範囲

- コード / ディレクトリ構成:
  - `src/types/index.ts` - 座標型の定義
  - `src/components/Map/StationMarker.tsx` - 変換実装
  - `src/components/Map/DrawingTools.tsx` - 変換実装

- 既存・将来のコンポーネント:
  - 新しい地図機能追加時は変換ルールを遵守
  - データ取得・保存時はGeoJSON形式を維持

- 運用プロセス:
  - コードレビューで座標変換箇所をチェック

---

## 6. ロールアウト / 移行方針

- フェーズ:
  - 初期実装で対応済み

- 具体的ステップ:
  1. types/index.tsで座標型を定義
  2. データ層はGeoJSON形式で統一
  3. Leaflet連携箇所で変換 + コメント追加
  4. コードレビューで変換漏れをチェック

---

## 7. オープンな論点 / フォローアップ

- open question:
  - 変換ヘルパー関数 `toLeaflet()` / `toGeoJSON()` の導入
  - ESLintカスタムルールでの自動チェック

- 別 ADR に切る予定のテーマ:
  - なし

---

## 8. 関連 ADR

- ADR-003: React + Leaflet統合パターン
- ADR-006: 静的GeoJSONデータアーキテクチャ
