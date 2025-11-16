# endroll-jumpers

React + Vite + TypeScript で作成したプラットフォームアクションゲーム

Phaser 3 を使用したブラウザベースのプラットフォームアクションゲームです。黒背景に白い線で描かれた地形を、画像から動的に認識して物理演算を適用します。様々なプラットフォーム間を飛び移りながら探索できます。スマホでもPCでも快適にプレイできます。

## 特徴

- **画像ベースの地形認識**: 黒背景に白い線で描かれた画像から、自動的に地形を検出して物理ボディを生成
- **プラットフォームアクション**: 複数の高さのプラットフォームを左右移動とジャンプで探索
- **マルチデバイス対応**: PCはキーボード、スマホはタッチボタンで操作可能

## 操作方法

### PC

- 左右矢印キー: 左右移動
- スペースキー: ジャンプ

### スマホ・タブレット

- 画面右下のボタン:
  - ← : 左移動
  - → : 右移動
  - ↑ : ジャンプ

## 技術スタック

- React 18
- Vite 6
- TypeScript 5
- Phaser 3
- Tailwind CSS 4
- Prettier + ESLint
- Husky + lint-staged

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバーを起動
npm run dev

# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview

# コードのフォーマット
npm run format

# Lintチェック
npm run lint
```

## ライセンス

MIT License

Copyright (c) 2025 kako-jun
