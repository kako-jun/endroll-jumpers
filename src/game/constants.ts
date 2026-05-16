// マリオ3 実機計測値 (freeza/tools/nes-analysis/dumps/mario3*) を 60fps 基準で
// px/sec / px/sec² に換算した物理パラメータ。
//   - 1 px/F (at 60fps) = 60 px/sec
//   - 1 px/F² (at 60fps) = 3600 px/sec²
// 実測サマリ:
//   - 歩き max +2 px/F、ダッシュ max +3 px/F
//   - ダッシュ → 逆方向は 30F で完全反転 (スキッド加速度)
//   - ジャンプ初速 ~ 5 px/F、重力 ~ 0.22 px/F²
//   - A 押下 30F で最大高度 71px、それ以上は伸びない
//   - 空中の逆方向押しが着地点制御の主軸 (継続 +79 / 逆 +19 = 連続調整可)
//   - 下押し急降下は SMB3 には無い (採用しない)
//   - 壁ヒットで X 速度ゼロリセット、ブロック頭打ちで Y 速度ゼロリセット

export const STAGE_WIDTH = 800
export const STAGE_HEIGHT = 600

// 下降時の重力 (実測 fall=25F・71px・初速 0 から平均 170 px/sec → 加速度 ~800)
export const GRAVITY = 800

// 上昇時の重力分岐 (実機 SMB3 の挙動):
//   - A 押下継続 + 上昇中 = 弱い重力 (642 px/sec²)。初速 300 が 28F (467ms) で減衰 → 頂点 71px
//   - A 離した + 上昇中 = 強い重力 (2143 px/sec²)。1F 短押しで頂点 ~21px に収まる
// これにより jumpHoldBoost のような積み増し型ではなく、A 解放で「ストン」と落下に移る
// 実機挙動 (= 短押し 21px / 長押し 71px の 3.4 倍差) を再現する。
export const ASCENT_GRAVITY_HELD = 642
export const ASCENT_GRAVITY_RELEASED = 2143

export const PLAYER = {
  width: 30,
  height: 30,
  color: 0x00ffff,
  spawnX: 100,
  spawnY: 100,

  // 横移動 (SMB3 実測)
  walkMaxSpeed: 120, // 2 px/F × 60
  dashMaxSpeed: 180, // 3 px/F × 60
  // walkAccel: dumps/mario3/ の walk_right "F31:+2" を信じれば 2/31 px/F² = 232 px/sec²
  // (notes の `歩き加速 16F` 表記は +1 px/F 到達時で、+2 px/F (= max) 到達は 31F)
  walkAccel: 232,
  // dashAccel: dash_right "F61:+3" → 3 px/F に到達まで 60F → 加速度 = 3 / 60 = 0.05 px/F² = 180 px/sec²
  // 注意: walkAccel > dashAccel は意図的。SMB3 実機ではダッシュは max 速度の上限が
  // 高いだけで、加速度自体は歩きとほぼ同等 (むしろ僅かに遅い) であることが
  // 実測 (16F で +1 vs 60F で +3 の比較) から読み取れる。
  dashAccel: 180,
  // 逆方向入力時のスキッド加速度。dash 速度 +180 から -120 (= 6 px/F の差) を 30F で
  // 反転するので 6/30 = 0.2 px/F² → 720 px/sec²
  skidAccel: 720,

  // 摩擦: SMB3 は地上でほぼ慣性維持 (歩き止めで数 F で停止)
  // 空中は完全慣性 (1.0 = 摩擦なし)
  groundFriction: 0.92, // 1 frame (60fps) あたりの減衰係数
  airFriction: 1.0, // 空中は慣性維持

  // ジャンプ初速 (SMB3 実測: ~5 px/F = -300 px/sec)
  // 上昇中は ASCENT_GRAVITY_HELD / RELEASED で重力分岐するため hold boost は不要
  jumpInitialVelocity: -300,
  // A 押下を hold とみなす最大時間 (30F = 500ms at 60fps)。超えると以後は RELEASED 扱い
  maxJumpHoldMs: 500,

  // 最大落下速度: 実測 fall=25F・71px なので終端 ~340 px/sec。安全マージンで 400
  maxFallSpeed: 400,

  // 空中の同方向加速度倍率。下に書くが、逆方向入力は skidAccel をそのまま使う
  // (= 空中での「ブレーキ」が SMB3 で着地点制御の主軸という観測に対応)
  airControl: 0.7,
}

export const TERRAIN = {
  brightnessThreshold: 80,
  minWidth: 3,
  rowHeight: 10,
}

export const ENDROLL = {
  imageHeight: 2400,
  scrollSpeed: 30,
}
