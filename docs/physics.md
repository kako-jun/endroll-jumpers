# physics

`src/game/physics.ts` (純関数) と `src/game/constants.ts` のパラメータ。

## SMB3 実機計測値をベースにしている

`repos/private/freeza/tools/nes-analysis/` で Mesen2 + Lua によって計測した SMB3 自機物理プロファイル (24 パターン) を 60fps の px/sec 系に換算して反映済み。実測サマリの正本は `dumps/mario3/SUMMARY.txt` / `dumps/mario3-block-hit/SUMMARY.txt` / `dumps/mario3-wall-hit/SUMMARY.txt`。

実測値 → 換算 (1 px/F = 60 px/sec、1 px/F² = 3600 px/sec²)。

| 項目                        | 実測 (px/F or F) | 換算後 (`constants.ts`)     |
| --------------------------- | ---------------- | --------------------------- |
| 歩き max 速度               | +2 px/F          | `walkMaxSpeed: 120`         |
| ダッシュ max 速度           | +3 px/F          | `dashMaxSpeed: 180`         |
| 歩き加速 (max まで)         | 31F              | `walkAccel: 232`            |
| ダッシュ加速 (max まで)     | 60F              | `dashAccel: 180`            |
| スキッド (dash→逆 完全反転) | 30F              | `skidAccel: 720`            |
| ジャンプ初速                | -5 px/F          | `jumpInitialVelocity: -300` |
| A 押下 max hold             | 30F              | `maxJumpHoldMs: 500`        |
| 最大落下速度                | ~5.5 px/F        | `maxFallSpeed: 400`         |

## 上昇中の重力分岐 (短押し 21px / 長押し 71px の再現)

`jumpHoldBoost` 方式 (押し続けで追加加速) ではなく、SMB3 の実際の挙動である**上昇中の重力の切替**を実装。

- `velocity.y < 0` (上昇中) かつ A 押下 かつ `jumpHoldMs < maxJumpHoldMs` → 弱重力 `ASCENT_GRAVITY_HELD = 642`
- 上記以外で上昇中 (A 離した or hold 上限超え) → 強重力 `ASCENT_GRAVITY_RELEASED = 2143`
- 下降中 (`velocity.y >= 0`) → 通常重力 `GRAVITY = 800`

数値の根拠:

- 初速 -300 px/sec で重力 642 → 頂点到達まで 300/642 = 0.467s = 28F、高度 300²/(2·642) ≈ **70.1px** ≒ 実測 71px ✓
- 初速 -300 px/sec で重力 2143 → 頂点高度 300²/(2·2143) ≈ **21.0px** = 実測 21px ✓
- 下降重力 800 で 71px 落下 → 終端速度 √(2·800·71) ≈ 337 px/sec ≒ 5.6 px/F、fall 約 25F = 実測値

→ `physics.test.ts` の 2 ケースで実測値 ±20% 以内を検証。

### 実測との乖離 (意図的)

SMB3 実機データの `jump_held_full` は **rise=28F / fall=25F でほぼ対称**。本実装の重力分岐方式 (上昇 HELD = 642 / RELEASED = 2143 / 下降 = 800) は短押し 21px / 長押し 71px の高度比を再現することを優先しているため、**A を途中で離した直後 (= 上昇途中で RELEASED 重力に切り替わる) のピーク到達タイミングが実機より早くなる**。

実機の挙動を厳密に再現するには「A 解放で `velocity.y *= 0.4` のジャンプキャンセル + 重力は GRAVITY 800 で常時統一」の方式が正しい。MVP として現方式を採用しているが、感覚調整の段階で変更する余地あり。

## スキッド (慣性反転)

入力方向が現在の `velocity.x` の符号と逆のとき、`walkAccel`/`dashAccel` ではなく `skidAccel = 720 px/sec²` を使う。実測「ダッシュ +180 から逆方向入力で 30F (500ms) かけて完全反転」をそのまま定数化。

地上でも空中でも同じ skidAccel を使う。これによって SMB3 の**空中での着地点制御 (ダッシュジャンプ +79px ↔ 空中逆入力 +19px の -76% ブレーキ)** を再現する。

```ts
const isReversing = sign(velocity.x) !== 0 && sign(velocity.x) !== inputDir
accel = isReversing ? PLAYER.skidAccel : runHeld ? dashAccel : walkAccel
if (!onGround && !isReversing) accel *= airControl // 同方向の空中加速だけ控えめに
```

## 摩擦

- 地上で入力なし: `groundFriction = 0.92` を 1 フレーム (60fps) あたりの減衰係数として適用
- 空中で入力なし: `airFriction = 1.0` (完全慣性、SMB3 実測通り)

`Math.pow(base, dt * 60)` でフレームレート非依存にしている。

注意: `airControl` (0.7) は **同方向の空中加速** にだけ適用される。空中の **逆方向入力 (= スキッド)** は `airControl` を掛けず、地上と同じ `skidAccel = 720` をフルで効かせる。これは SMB3 の「空中での着地点制御 (+79px ↔ +19px の -76% ブレーキ)」を再現するため。

`airControl` 自体は実機データに対応する数値が無く、移植者の感覚調整値。`groundFriction = 0.92` も同様。

## 走り (B ボタン相当)

- キーボード: Shift / X
- `InputManager.state.run`
- 押下中は最高速度が `walkMaxSpeed (120)` から `dashMaxSpeed (180)` に拡大
- 加速度は `walkAccel (232)` から `dashAccel (180)` に変わる。**walkAccel > dashAccel は意図的**で、SMB3 実機ではダッシュは最高速度の上限が拡張されるだけで、加速度自体は歩きと同等 (むしろ僅かに緩い) ことが実測 (16F で +1 px/F vs 60F で +3 px/F の比較) から読み取れる。

## SMB3 のまだ未実装な要素

- **P メーター** (走り続けて貯まる "真の最高速度")
- **走り速度連動ジャンプ高度** (高速ほど高く飛ぶ)
- **one-way platform** (下から飛び乗れる床)
- **スキッド専用アニメ** (現状は単に減速)

→ 必要になったら別 Issue。

## テスト

`src/game/physics.test.ts` に 18 ケース (実測ジャンプ高度 2 件 + スキッド 30F 完全反転 1 件を含む)。
