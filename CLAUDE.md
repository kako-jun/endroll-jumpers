# Endroll Jumpers — 開発者向け目次

画像から地形を自動認識するプラットフォームアクションゲーム。PixiJS v8 + TypeScript + Vite。

旧 Phaser 版から PixiJS に完全移植済み (2026-05-16 〜 2026-05-17, session444 / session446)。物理は freeza/tools/nes-analysis の SMB3 Mesen2+Lua 計測値を反映 (短押し 21px / 長押し 71px の高度比を機械検証)。

## エンドユーザー向け

[README.md](README.md) を参照。

## 詳細ドキュメント (docs/)

| ファイル                                     | 内容                                                          |
| -------------------------------------------- | ------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md) | ディレクトリ構成と各モジュールの責務                          |
| [docs/physics.md](docs/physics.md)           | プレイヤー物理 (SMB3 完全再現ではない点を明記) + パラメータ表 |
| [docs/terrain.md](docs/terrain.md)           | 輝度ベース地形認識のアルゴリズムと入力画像の作り方            |
| [docs/collision.md](docs/collision.md)       | 自前 AABB の分離軸方式と既知の制約                            |
| [docs/scenes.md](docs/scenes.md)             | Menu / Platform / Endroll の責務と遷移グラフ                  |
| [docs/input.md](docs/input.md)               | キーボード + タッチオーバーレイ                               |
| [docs/build.md](docs/build.md)               | スクリプト・公開先・CI                                        |

## クイックリファレンス

- パラメータ調整は **`src/game/constants.ts`** を触る (物理 / 地形 / エンドロールスクロール速度)
- 新規シーン追加は `src/game/scenes/` に追加して `src/game/App.ts` の `startXxx` を増やす
- テスト: `npm run test` で physics / terrain / collision の純関数を 34 ケース
- エンドロールのクレジット差し替えは `src/game/scenes/EndrollScene.ts` 冒頭の **`CREDITS` 配列** を編集 (y 座標 / text / size を直書き)
- 物理の感触調整: 走り速度なら `walkMaxSpeed` / `dashMaxSpeed`、ジャンプ高度なら `jumpInitialVelocity` + `ASCENT_GRAVITY_HELD` / `RELEASED`

## 公開戦略 (freeza 側)

`repos/private/freeza/docs/operations/notes/20260516-session444-endroll-jumpers-pixijs-port.md` に session444 の作業記録あり。
