# architecture

PixiJS v8 + TypeScript + Vite。React や Phaser には依存しない。

## ハードウェア / ブラウザ前提

- WebGL2 (PixiJS v8 で WebGPU が使えれば自動切替、未対応環境では WebGL にフォールバック)
- Canvas2D は地形画像生成 (Sprite 化前) にだけ使用
- モバイル WebView も対象 (Safari iOS 14+ / Chrome Android 90+ 程度)
- 60fps 前提だが `App.ts` で `ticker.deltaMS` を 33ms (30fps 相当) で頭打ち → 低 FPS でもすり抜けが起きにくい

## ディレクトリ構成

| パス                                                                      | 役割                                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`src/main.ts`](../src/main.ts)                                           | PIXI.Application の初期化、Loading 表示の差し替え                         |
| [`src/game/App.ts`](../src/game/App.ts)                                   | SceneManager。Menu ⇄ Platform ⇄ Endroll の遷移 + `isTransitioning` ガード |
| [`src/game/Scene.ts`](../src/game/Scene.ts)                               | PIXI.Container 継承の基底 (update / exit / destroyScene)                  |
| [`src/game/constants.ts`](../src/game/constants.ts)                       | STAGE_WIDTH/HEIGHT, GRAVITY, PLAYER, TERRAIN, ENDROLL 等の定数            |
| [`src/game/types.ts`](../src/game/types.ts)                               | GameState / PlayerState / CameraState 型 + createInitialState             |
| [`src/game/input.ts`](../src/game/input.ts)                               | InputManager (キーボード + タッチ overlay)。[input.md](input.md)          |
| [`src/game/physics.ts`](../src/game/physics.ts)                           | stepPlayerPhysics + integratePosition (純関数)。[physics.md](physics.md)  |
| [`src/game/terrain.ts`](../src/game/terrain.ts)                           | detectTerrain: ImageData → `CollisionRect[]`。[terrain.md](terrain.md)    |
| [`src/game/collision.ts`](../src/game/collision.ts)                       | resolveCollisions: AABB (X→Y 分離)。[collision.md](collision.md)          |
| [`src/game/scenes/MenuScene.ts`](../src/game/scenes/MenuScene.ts)         | モード選択。[scenes.md](scenes.md)                                        |
| [`src/game/scenes/PlatformScene.ts`](../src/game/scenes/PlatformScene.ts) | 固定画面モード                                                            |
| [`src/game/scenes/EndrollScene.ts`](../src/game/scenes/EndrollScene.ts)   | 縦スクロールモード                                                        |

## 各モジュールの責務

### App.ts (SceneManager)

- `app.ticker` で毎フレーム `input.tick()` → `currentScene.update(deltaMs)` を呼ぶ
- シーン遷移は `startMenu()` / `startPlatform()` / `startEndroll()` の動的 import
- `replaceScene` で前シーンを `destroyScene()` してから次を `stage.addChild`

### Scene.ts (基底)

- `Container` を継承。`update(deltaMs)` をオーバーライド
- `exit({ mode?, back? })` で App.handleExit に通知 (遷移を要求する)

### physics.ts

- フレームレート非依存。`deltaMs / 1000` を `dt` として 1 秒あたりの値を扱う
- 摩擦は `Math.pow(base, dt * 60)` で正規化 (60fps の base を基準に dt が変わっても同じ挙動)

### terrain.ts

- 各行を run-length スキャンして「`threshold` 以上の明るさが `minWidth` ピクセル以上連続する区間」を抽出
- 同位置 (xStart / xEnd 完全一致) の run を縦方向に結合して矩形化
- 結合キーが厳密一致なので、テキスト等の不規則な形状では多数の細かい矩形ができる (許容)

### collision.ts

- AABB を X 軸 → Y 軸 の順で解く
- X で押し戻したあと Y を解くので、対角線の衝突でも壁ずり / 床着地が両立する
- `isOnGround` / `hitCeiling` / `hitWall` を個別に返す

### input.ts

- キーボード: `keydown`/`keyup` を window で受け、`state.left/right/jump/back` に反映
- タッチ: `attachTouchOverlay()` で画面下 1/3 を 3 分割した透明 `Graphics` を `stage` に追加
- `jumpJustPressed` は毎フレーム `tick()` で前フレーム差分から算出
