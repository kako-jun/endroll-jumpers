// マリオ3 準拠の物理・移動を純関数として記述
// - 可変ジャンプ (ボタン押し続けで上昇継続、maxJumpHoldMs で打ち切り)
// - 空中制御 (airControl で左右入力倍率を下げる)
// - 摩擦 (地上 / 空中で別係数)
// - 最大落下速度 / 最大移動速度のクランプ

import { PLAYER, GRAVITY } from './constants'
import type { PlayerState } from './types'

export interface PhysicsInput {
  left: boolean
  right: boolean
  jumpHeld: boolean
  jumpJustPressed: boolean
}

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n))

/**
 * プレイヤーの速度を 1 フレーム分進める (位置は updatePosition で別途反映)。
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
  const controlFactor = player.isOnGround ? 1 : PLAYER.airControl

  if (inputDir !== 0) {
    player.velocity.x += PLAYER.acceleration * inputDir * controlFactor * dt
    player.facing = inputDir > 0 ? 1 : -1
  } else {
    // 摩擦 (係数を毎秒あたりに正規化)
    const baseFriction = player.isOnGround
      ? PLAYER.groundFriction
      : PLAYER.airFriction
    const frictionPerFrame = Math.pow(baseFriction, dt * 60)
    player.velocity.x *= frictionPerFrame
    if (Math.abs(player.velocity.x) < 1) player.velocity.x = 0
  }

  player.velocity.x = clamp(
    player.velocity.x,
    -PLAYER.maxMoveSpeed,
    PLAYER.maxMoveSpeed
  )

  // --- ジャンプ開始 ---
  if (input.jumpJustPressed && player.isOnGround) {
    player.velocity.y = PLAYER.jumpInitialVelocity
    player.isJumping = true
    player.jumpHoldMs = 0
    player.isOnGround = false
  }

  // --- 可変ジャンプ (上昇中にボタン押下を継続すると追加加速) ---
  if (
    player.isJumping &&
    input.jumpHeld &&
    player.velocity.y < 0 &&
    player.jumpHoldMs < PLAYER.maxJumpHoldMs
  ) {
    player.velocity.y += PLAYER.jumpHoldBoost * dt
    player.jumpHoldMs += deltaMs
  } else if (!input.jumpHeld || player.velocity.y >= 0) {
    // ボタン離した or 落下開始 → 可変ジャンプ終了
    player.isJumping = false
  }

  // --- 重力 ---
  player.velocity.y += GRAVITY * dt
  if (player.velocity.y > PLAYER.maxFallSpeed) {
    player.velocity.y = PLAYER.maxFallSpeed
  }
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
