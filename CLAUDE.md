# Endroll Jumpers 開発者向けドキュメント

画像から地形を自動認識するプラットフォームアクションゲーム。PixiJS v8 + TypeScript + Vite。

旧 Phaser 版から PixiJS に移植中。旧コードは `reference/phaser-source/` に退避済み。

## コンセプト

- 黒背景に明るい部分（白、灰色、文字など）を地形として検出
- スタッフロール画像やスクリーンショットを地形として利用可能
- スーパーマリオ3 風の物理演算（可変ジャンプ、空中制御、慣性）

## プロジェクト構造

```
endroll-jumpers/
├── src/
│   ├── main.ts                 # PixiJS Application 初期化
│   └── game/
│       ├── App.ts              # SceneManager
│       ├── Scene.ts            # シーン基底クラス
│       ├── constants.ts        # ステージ / 物理 / 地形 の定数
│       ├── input.ts            # キーボード + タッチ入力
│       ├── types.ts            # GameState 型定義 + initWithState
│       └── scenes/
│           ├── MenuScene.ts      # モード選択
│           ├── PlatformScene.ts  # 固定画面モード
│           └── EndrollScene.ts   # 縦スクロールモード
├── reference/
│   └── phaser-source/          # 移植元の Phaser 版（#12 で削除）
└── package.json
```

## ゲームモード

### プラットフォームモード

- 複数の高さのプラットフォームを自由に探索
- 固定画面

### エンドロールモード

- 縦長画像（2400px）が自動スクロール
- カメラがプレイヤーを追従
- スタッフロール風テキストが地形として機能

## 物理演算（スーパーマリオ3 風）

`src/game/constants.ts` の `PLAYER` セクションでパラメータを集中管理:

- `acceleration` / `groundFriction` / `airFriction` — 慣性付きの左右移動
- `jumpInitialVelocity` / `jumpHoldBoost` / `maxJumpHoldMs` — ボタン押し続けで高くなる可変ジャンプ
- `airControl` — 空中での左右入力倍率
- `maxFallSpeed` — 最大落下速度

## 画像ベース地形認識

```typescript
function detectTerrain(imageData: ImageData): CollisionRect[] {
  // 各行を走査し、brightness >= TERRAIN.brightnessThreshold が
  // TERRAIN.minWidth ピクセル以上連続する区間を矩形として登録
}
```

### 対応画像

- 黒背景に白/灰色の線
- スタッフロール画像
- ブラウザのスクリーンショット
- 手書きの図形

## 入力管理（Issue #9）

- キーボード: ← / → / Space / ↑ / WASD / Esc
- タッチ: 画面下 1/3 を 3 分割した左 / ジャンプ / 右ボタン (透明オーバーレイ)
- `InputManager.tick()` を毎フレーム呼ぶことで `jumpJustPressed` が計算される

## 技術スタック

| パッケージ | 用途                 |
| ---------- | -------------------- |
| pixi.js    | レンダリング (v8 系) |
| vite       | ビルドツール         |
| vitest     | テスト               |
| typescript | 型安全               |

## ビルド

```bash
npm run dev          # 開発サーバー (port 3000)
npm run build        # tsc + vite build
npm run preview      # ビルドプレビュー
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # vitest run
npm run format       # Prettier
```

## CI/CD

- Husky + lint-staged: pre-commit hooks
- GitHub Actions: デプロイ

## 拡張予定

- カスタム画像アップロード機能
- ステージエディタ
- マルチプレイヤー対応
- スコアシステム
