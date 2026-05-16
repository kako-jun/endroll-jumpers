# Endroll Jumpers

画像から地形を自動認識するプラットフォームアクションゲーム。黒背景に白い線で描かれた地形を飛び移る。

## ゲームモード

- **プラットフォームモード**: 固定画面で様々な高さのプラットフォームを探索
- **エンドロールモード**: 縦長のスタッフロール画像を地形として降下していく

## 操作方法

### PC

- `←` / `→` / `A` / `D`: 移動
- `Space` / `↑` / `W`: ジャンプ (押し続けると高く跳ぶ)
- `Esc`: メニューに戻る

### スマホ・タブレット

画面下を 3 分割した透明ボタン。左 / ジャンプ / 右。

## 遊んでみる

```bash
git clone https://github.com/kako-jun/endroll-jumpers.git
cd endroll-jumpers
npm install
npm run dev
```

`http://localhost:3000/endroll-jumpers/` で開く。

## ライセンス

MIT
