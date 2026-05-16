# physics

`src/game/physics.ts` に純関数として実装。`src/game/constants.ts` の `PLAYER` でパラメータを一元管理。

## 注意: マリオ3 完全再現ではない

「マリオ3 風の感触」を狙ったオリジナル実装。SMB3 ロムハック勢的な完全再現ではない。本物にあって**今は無い**もの:

- P メーター (走り続けて貯まる → 真の最高速度)
- 走り速度に応じたジャンプ高度 (高速ほど高く飛ぶ)
- スキッド (高速で逆方向入力時の専用減速 + 専用アニメ)
- 上昇 / 下降で異なる重力テーブル、ボタン押下による落下重力分岐
- サブピクセル位置 + 整数速度テーブル (0x18, 0x28 ...)
- one-way platform (下から飛び乗れる床)

→ 実装したい場合は別途 Issue 化して進める。

## 実装している要素

### 可変ジャンプ

- `jumpJustPressed && isOnGround` で `velocity.y = jumpInitialVelocity` (負値)
- 上昇中 (`velocity.y < 0`) かつ `jumpHeld` の間、`jumpHoldMs` が `maxJumpHoldMs` に達するまで `jumpHoldBoost * dt` を加算
- ボタン離す or 落下開始で `isJumping = false`

### 空中制御

- `isOnGround === false` のとき加速度に `airControl` (0.6) を乗じる
- 摩擦も `airFriction` (0.95) を採用

### 摩擦と慣性

- 入力なしのときだけ `velocity.x *= friction^(dt * 60)` で減衰
- 入力中は摩擦をかけない (加速のみ)
- 速度の絶対値が 1 未満になったら `velocity.x = 0` にスナップ

### クランプ

- `velocity.x` は `[-maxMoveSpeed, maxMoveSpeed]` にクランプ
- `velocity.y` は上限 `maxFallSpeed` のみクランプ (上昇方向は無制限 = jumpHoldBoost の累積を妨げない)

## パラメータ (src/game/constants.ts)

| 変数                  | 値   | 意味                                  |
| --------------------- | ---- | ------------------------------------- |
| `GRAVITY`             | 1800 | px/s²                                 |
| `maxMoveSpeed`        | 200  | px/s                                  |
| `acceleration`        | 1200 | px/s²                                 |
| `groundFriction`      | 0.85 | 1 frame (60fps 換算) あたりの減衰係数 |
| `airFriction`         | 0.95 | 同上、空中                            |
| `jumpInitialVelocity` | -520 | px/s                                  |
| `jumpHoldBoost`       | -900 | px/s² (押し続け中)                    |
| `maxJumpHoldMs`       | 280  | ms                                    |
| `maxFallSpeed`        | 600  | px/s                                  |
| `airControl`          | 0.6  | 空中の加速度倍率                      |

## テスト

`src/game/physics.test.ts` に 10 ケース。
