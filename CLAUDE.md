# Endroll Jumpers 開発者向けドキュメント

画像から地形を自動認識するプラットフォームアクションゲーム。Phaser 3 + React + TypeScript。

## コンセプト

- 黒背景に明るい部分（白、灰色、文字など）を地形として検出
- スタッフロール画像やスクリーンショットを地形として利用可能
- スーパーマリオ1風の物理演算

## プロジェクト構造

```
endroll-jumpers/
├── src/
│   ├── main.tsx           # エントリーポイント
│   ├── App.tsx            # Reactアプリ
│   ├── components/
│   │   └── PhaserGame.tsx # Phaser統合コンポーネント
│   └── game/
│       ├── config.ts      # Phaser設定
│       ├── scenes/
│       │   ├── MenuScene.ts      # メニュー画面
│       │   ├── PlatformScene.ts  # プラットフォームモード
│       │   └── EndrollScene.ts   # エンドロールモード
│       └── objects/
│           └── Player.ts         # プレイヤー
├── public/
│   └── assets/            # ゲームアセット
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

## 物理演算（スーパーマリオ1風）

### 可変ジャンプ

```typescript
// ボタンを押し続けることでジャンプの高さを調整
if (jumpButtonHeld && velocity.y < 0) {
  velocity.y += additionalJumpForce
}
```

### 空中制御

```typescript
// 空中での左右移動は地上より制御が効きにくい
const airControl = 0.6
if (!isGrounded) {
  horizontalForce *= airControl
}
```

### その他

- 最大落下速度の制限
- 摩擦による自然な減速
- 慣性の実装

## 画像ベース地形認識

### アルゴリズム

```typescript
function detectTerrain(imageData: ImageData): CollisionMap {
  const { data, width, height } = imageData

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2]

      // 明るさベースの判定
      const brightness = (r + g + b) / 3
      if (brightness > threshold) {
        // 地形として登録
        collisionMap.add(x, y)
      }
    }
  }

  return collisionMap
}
```

### 対応画像

- 黒背景に白/灰色の線
- スタッフロール画像
- ブラウザのスクリーンショット
- 手書きの図形

## 技術スタック

| パッケージ  | 用途           |
| ----------- | -------------- |
| react       | UI             |
| phaser      | ゲームエンジン |
| vite        | ビルドツール   |
| typescript  | 型安全         |
| tailwindcss | スタイリング   |

## ビルド

```bash
npm run dev          # 開発サーバー
npm run build        # プロダクションビルド
npm run preview      # ビルドプレビュー
npm run lint         # ESLint
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
