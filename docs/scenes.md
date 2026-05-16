# scenes

3 つのシーンが存在する。すべて `src/game/scenes/*.ts`。

## MenuScene

タイトル + サブタイトル + 2 ボタン (プラットフォーム / エンドロール)。

- ボタンクリックで `exit({ mode: 'platform' | 'endroll' })` を呼び、`App.handleExit` で対応するシーンに切り替わる
- hover で `tint` 変化

## PlatformScene

固定画面 (800x600) でプラットフォームを探索するモード。

- コンストラクタで `HTMLCanvasElement` を作って `drawPlatformTerrain` で黒地に白/灰色の矩形を描く
- そのまま `detectTerrain` にかけて `CollisionRect[]` を得る
- 描いた Canvas をそのまま `Sprite` にして見える地形にする (検出に使った Canvas = 表示する地形 が一致するので位置ずれが起きない)
- `update(deltaMs)` で input → `stepPlayerPhysics` → `integratePosition` → `resolveCollisions` → 反映
- 画面外フェイルセーフ: Y > STAGE_HEIGHT + 100 で `(spawnX, spawnY)` にリスポーン
- Esc / back で `exit({ back: true })` → Menu へ

## EndrollScene

縦長 (800 x 2400) の世界をカメラ追従でスクロールするモード。

- `drawEndrollTerrain` で `CREDITS` 配列のテキストを Canvas に描画 (テキスト自体が地形になる)
- ベース地面 (最下段 40px) と階段状のスタートプラットフォーム 2 つ
- `world` Container に地形 Sprite + playerGfx を追加
- カメラはプレイヤーを画面中央に保つように `world.y = -cameraY`、`cameraY = clamp(player.y - STAGE_HEIGHT/2, 0, WORLD_HEIGHT - STAGE_HEIGHT)`
- 自動下スクロール: `player.position.y += ENDROLL.scrollSpeed * dt` (= 30 px/s)。ただしプラットフォームに着地しているときは衝突解決で押し戻されるので、止まっていれば実効速度はゼロ

### 設計上の未消化点 (将来 Issue)

notes/dev/endroll-jumpers.md のオリジナル仕様では「エンドロールは上から下へ**カメラが一定速度で**スクロール、上端に押し潰されたら死、下端に落ちたら死」という**スクロール強制スクリーンの設計**。本実装はカメラがプレイヤーを追従 + プレイヤー位置に弱い下押し力という妥協形で、止まっていればスクロールも止まる。

→ 「スクロール強制スクリーン化」「上端/下端での死亡判定」「テキスト破壊で詰まり脱出」「2人対戦」「お題クリア型チャレンジ」は移植 MVP の範囲外。別 Issue で実装する。

## シーン遷移ルール

```
        ┌─────────┐
        │  Menu   │
        └─┬───┬───┘
   mode:platform │  mode:endroll
   ┌──────┘   └──────┐
┌──▼─────────┐  ┌────▼──────┐
│  Platform  │  │  Endroll  │
└──┬─────────┘  └────┬──────┘
   └─── back ────────┘
        ↓
       Menu
```
