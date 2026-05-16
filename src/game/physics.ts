// マリオ3 実機計測値ベースの物理。constants.ts 参照。
//
// 主な仕様 (freeza/tools/nes-analysis/dumps/mario3* の実測):
// - 歩き max 120 / ダッシュ max 180 px/sec (runHeld で切替)
// - 慣性反転は通常加速度ではなく skidAccel (720 px/sec²) を使い 30F (~500ms) で完全反転
// - 空中の逆方向入力も skidAccel を使う (= 着地点制御の主軸 +79 ↔ +19px の再現)
// - 空中の摩擦は 1.0 (慣性維持)、地上のみ groundFriction
// - ジャンプ重力: 上昇中 A 押下 = ASCENT_GRAVITY_HELD (弱)、上昇中 A 解放 = ASCENT_GRAVITY_RELEASED (強)、下降中 = GRAVITY
//   → 短押し 21px / 長押し 71px の 3.4 倍差 (実機 SMB3) を再現
// - 下押し急降下は SMB3 には無いので採用しない
// - 天井ヒットで velocity.y=0 リセット (collision.ts 側)、再上昇しない (上昇継続条件で velocity.y < 0 を要求)

import {
  ASCENT_GRAVITY_HELD,
  ASCENT_GRAVITY_RELEASED,
  GRAVITY,
  PLAYER,
} from './constants'
import type { PlayerState } from './types'

export interface PhysicsInput {
  left: boolean
  right: boolean
  jumpHeld: boolean
  jumpJustPressed: boolean
  runHeld: boolean
}

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n))

const sign = (n: number): -1 | 0 | 1 => (n > 0 ? 1 : n < 0 ? -1 : 0)

/**
 * プレイヤーの速度を 1 フレーム分進める。位置反映は integratePosition で別途。
 * isOnGround は前フレームの衝突解決結果として渡される前提。
 */
export const stepPlayerPhysics = (
  player: PlayerState,
  input: PhysicsInput,
  deltaMs: number
): void => {
  const dt = deltaMs / 1000

  // --- 左右入力 ---
  const inputDir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const onGround = player.isOnGround

  const maxSpeed = input.runHeld ? PLAYER.dashMaxSpeed : PLAYER.walkMaxSpeed

  if (inputDir !== 0) {
    player.facing = inputDir > 0 ? 1 : -1

    const velSign = sign(player.velocity.x)
    const isReversing = velSign !== 0 && velSign !== inputDir

    let accel: number
    if (isReversing) {
      accel = PLAYER.skidAccel
    } else {
      accel = input.runHeld ? PLAYER.dashAccel : PLAYER.walkAccel
    }

    if (!onGround && !isReversing) {
      accel *= PLAYER.airControl
    }

    player.velocity.x += accel * inputDir * dt

    if (!isReversing) {
      if (inputDir > 0 && player.velocity.x > maxSpeed) {
        player.velocity.x = maxSpeed
      } else if (inputDir < 0 && player.velocity.x < -maxSpeed) {
        player.velocity.x = -maxSpeed
      }
    }
  } else {
    const baseFriction = onGround ? PLAYER.groundFriction : PLAYER.airFriction
    if (baseFriction < 1) {
      player.velocity.x *= Math.pow(baseFriction, dt * 60)
      if (Math.abs(player.velocity.x) < 1) player.velocity.x = 0
    }
  }

  // --- ジャンプ開始 ---
  if (input.jumpJustPressed && onGround) {
    player.velocity.y = PLAYER.jumpInitialVelocity
    player.isJumping = true
    player.jumpHoldMs = 0
    player.isOnGround = false
  }

  // --- 重力 (上昇中は A 押下/解放で分岐、下降中は GRAVITY) ---
  // 上昇中 (velocity.y < 0) かつ ジャンプフェイズ中 (isJumping) かつ A 押下中 かつ
  // 最大 hold 時間内: 弱重力。それ以外で上昇中: 強重力。下降中: 通常重力。
  let gravityToApply: number
  if (player.velocity.y < 0) {
    const stillInHoldPhase =
      player.isJumping &&
      input.jumpHeld &&
      player.jumpHoldMs < PLAYER.maxJumpHoldMs
    if (stillInHoldPhase) {
      gravityToApply = ASCENT_GRAVITY_HELD
      player.jumpHoldMs += deltaMs
    } else {
      gravityToApply = ASCENT_GRAVITY_RELEASED
      player.isJumping = false
    }
  } else {
    gravityToApply = GRAVITY
    player.isJumping = false
  }
  player.velocity.y += gravityToApply * dt
  if (player.velocity.y > PLAYER.maxFallSpeed) {
    player.velocity.y = PLAYER.maxFallSpeed
  }

  // X 速度の絶対上限 (skid 中も含む)
  player.velocity.x = clamp(
    player.velocity.x,
    -PLAYER.dashMaxSpeed,
    PLAYER.dashMaxSpeed
  )
}

/** velocity を反映した次フレームの位置を計算。衝突解決は別途。 */
export const integratePosition = (
  player: PlayerState,
  deltaMs: number
): { nextX: number; nextY: number } => {
  const dt = deltaMs / 1000
  return {
    nextX: player.position.x + player.velocity.x * dt,
    nextY: player.position.y + player.velocity.y * dt,
  }
}
