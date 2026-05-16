# terrain

画像から地形を自動認識する仕組み。`src/game/terrain.ts` の `detectTerrain(imageData, options) → CollisionRect[]`。

## アルゴリズム

1. 各行 `y` について、`brightness >= threshold` のピクセルが `minWidth` 以上連続する区間 (run) を抽出
   - 輝度 = `(R + G + B) / 3`
2. 直前行の run の `xStart` / `xEnd` と完全一致する run があれば縦に結合 (height += 1)
3. マッチしない run は新規矩形として開始
4. マッチしなかった既存矩形は閉じて出力

## オプション

```typescript
detectTerrain(imageData, {
  threshold: 80, // 地形と認識する輝度の下限 (0-255)
  minWidth: 3, // この幅未満の塊は無視
  mergeVertically: true, // false にすると行ごとに高さ 1 の矩形を返す
})
```

## 仕様上の注意

- 結合キーが「`xStart` と `xEnd` の完全一致」なので、テキストやアンチエイリアスのかかった形状では行ごとに run の幅が変わり、多数の薄い矩形になる
- これは仕様。プラットフォームの本体 (連続して幅が変わらない塊) は 1 つの矩形にまとまる
- 矩形数が多すぎてパフォーマンスが落ちる場合は、後段の衝突判定側で空間分割 (グリッド / Quadtree) を入れる

## 入力画像の作り方

- 黒背景 (`#000`) を基本として、地形にしたい部分を白〜灰色 (`#fff` ~ `#888`) で描く
- `threshold` 80 は「`#555` 以上が地形扱い」相当
- アンチエイリアスを切ると検出される矩形数が大幅に減る (Canvas は描画前に `imageSmoothingEnabled = false` を検討)
- スクリーンショットや手書きスキャンも入力可能 (`brightness` ベースなので色相は影響しない)

## テスト

`src/game/terrain.test.ts` に 7 ケース。
