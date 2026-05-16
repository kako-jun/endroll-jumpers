import { describe, expect, it } from 'vitest'
import { stepPlayerPhysics, integratePosition } from './physics'
import { createInitialPlayerState } from './types'
import {
  ASCENT_GRAVITY_HELD,
  ASCENT_GRAVITY_RELEASED,
  GRAVITY,
  PLAYER,
} from './constants'

const FRAME = 16.6667

const baseInput = {
  left: false,
  right: false,
  jumpHeld: false,
  jumpJustPressed: false,
  runHeld: false,
}

describe('stepPlayerPhysics (SMB3 実測値ベース)', () => {
  it('右入力で velocity.x が正になり facing=1', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    stepPlayerPhysics(p, { ...baseInput, right: true }, FRAME)
    expect(p.velocity.x).toBeGreaterThan(0)
    expect(p.facing).toBe(1)
  })

  it('左入力で velocity.x が負になり facing=-1', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    stepPlayerPhysics(p, { ...baseInput, left: true }, FRAME)
    expect(p.velocity.x).toBeLessThan(0)
    expect(p.facing).toBe(-1)
  })

  it('歩き (runHeld=false) は walkMaxSpeed でクランプ', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    p.velocity.x = PLAYER.walkMaxSpeed + 1
    stepPlayerPhysics(p, { ...baseInput, right: true, runHeld: false }, FRAME)
    expect(p.velocity.x).toBeLessThanOrEqual(PLAYER.walkMaxSpeed)
  })

  it('ダッシュ (runHeld=true) は dashMaxSpeed まで伸びる', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    p.velocity.x = PLAYER.walkMaxSpeed
    // 数フレーム加速させる
    for (let i = 0; i < 60; i++) {
      stepPlayerPhysics(p, { ...baseInput, right: true, runHeld: true }, FRAME)
    }
    expect(p.velocity.x).toBeGreaterThan(PLAYER.walkMaxSpeed)
    expect(p.velocity.x).toBeLessThanOrEqual(PLAYER.dashMaxSpeed)
  })

  it('スキッド: 1F の逆入力で walkAccel より skidAccel の方が大きく減速', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    p.velocity.x = PLAYER.dashMaxSpeed
    stepPlayerPhysics(p, { ...baseInput, left: true }, FRAME)
    const dropWithWalkAccel =
      PLAYER.dashMaxSpeed - (PLAYER.walkAccel * FRAME) / 1000
    expect(p.velocity.x).toBeLessThan(dropWithWalkAccel)
  })

  it('スキッド: 30F 連続逆入力で dash 速度から完全反転する (実測 SMB3)', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    p.velocity.x = PLAYER.dashMaxSpeed // +180
    for (let i = 0; i < 30; i++) {
      stepPlayerPhysics(p, { ...baseInput, left: true }, FRAME)
    }
    // 30F 後には負方向 (= 逆方向に反転完了) になっているべき
    expect(p.velocity.x).toBeLessThan(0)
  })

  it('空中では摩擦が効かず慣性が保持される (airFriction=1)', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = false
    p.velocity.x = 100
    stepPlayerPhysics(p, baseInput, FRAME)
    expect(p.velocity.x).toBe(100)
  })

  it('地上では摩擦で減衰する (no input)', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    p.velocity.x = 100
    stepPlayerPhysics(p, baseInput, FRAME)
    expect(p.velocity.x).toBeLessThan(100)
    expect(p.velocity.x).toBeGreaterThan(0)
  })

  it('jumpJustPressed + isOnGround でジャンプ開始', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    stepPlayerPhysics(
      p,
      { ...baseInput, jumpHeld: true, jumpJustPressed: true },
      FRAME
    )
    expect(p.velocity.y).toBeLessThan(0)
    expect(p.isJumping).toBe(true)
    expect(p.isOnGround).toBe(false)
  })

  it('空中では jumpJustPressed でジャンプしない (空中ジャンプ無し)', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = false
    p.velocity.y = 50
    stepPlayerPhysics(
      p,
      { ...baseInput, jumpHeld: true, jumpJustPressed: true },
      FRAME
    )
    expect(p.isJumping).toBe(false)
  })

  it('下降重力が velocity.y に加算される', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = false
    p.velocity.y = 0
    stepPlayerPhysics(p, baseInput, FRAME)
    expect(p.velocity.y).toBeCloseTo((GRAVITY * FRAME) / 1000, 1)
  })

  it('上昇中 A 押下: 弱い重力 (ASCENT_GRAVITY_HELD) が加算される', () => {
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = -200
    stepPlayerPhysics(p, { ...baseInput, jumpHeld: true }, FRAME)
    const expectedDelta = (ASCENT_GRAVITY_HELD * FRAME) / 1000
    expect(p.velocity.y).toBeCloseTo(-200 + expectedDelta, 1)
  })

  it('上昇中 A 解放: 強い重力 (ASCENT_GRAVITY_RELEASED) が加算される', () => {
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = -200
    stepPlayerPhysics(p, baseInput, FRAME)
    const expectedDelta = (ASCENT_GRAVITY_RELEASED * FRAME) / 1000
    expect(p.velocity.y).toBeCloseTo(-200 + expectedDelta, 1)
  })

  it('maxFallSpeed でクランプ', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = false
    p.velocity.y = PLAYER.maxFallSpeed + 1000
    stepPlayerPhysics(p, baseInput, FRAME)
    expect(p.velocity.y).toBe(PLAYER.maxFallSpeed)
  })

  it('可変ジャンプ: 押し続けで上昇継続 (重力だけより高く)', () => {
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = PLAYER.jumpInitialVelocity
    const before = p.velocity.y
    stepPlayerPhysics(p, { ...baseInput, jumpHeld: true }, FRAME)
    const withGravityOnly = before + (GRAVITY * FRAME) / 1000
    expect(p.velocity.y).toBeLessThan(withGravityOnly)
  })

  it('可変ジャンプ: A 離すと isJumping=false', () => {
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = -100
    stepPlayerPhysics(p, baseInput, FRAME)
    expect(p.isJumping).toBe(false)
  })

  it('可変ジャンプ: maxJumpHoldMs を超えると release 扱いで強重力', () => {
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = PLAYER.jumpInitialVelocity
    p.jumpHoldMs = PLAYER.maxJumpHoldMs + 1
    const before = p.velocity.y
    stepPlayerPhysics(p, { ...baseInput, jumpHeld: true }, FRAME)
    const withReleaseGravity = before + (ASCENT_GRAVITY_RELEASED * FRAME) / 1000
    expect(p.velocity.y).toBeCloseTo(withReleaseGravity, 1)
  })

  it('SMB3 実測ジャンプ高度: 30F 押し続けで概ね 71px に近い', () => {
    // 自由落下シミュレーション: jumpInitialVelocity から始まり、ジャンプボタンを
    // 押し続け、velocity.y が 0 になるまでの累積上昇距離が頂点高度
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = PLAYER.jumpInitialVelocity

    let height = 0
    const dt = FRAME
    for (let f = 0; f < 90; f++) {
      stepPlayerPhysics(p, { ...baseInput, jumpHeld: true }, dt)
      if (p.velocity.y >= 0) break
      height += -p.velocity.y * (dt / 1000)
    }
    // 実測 71px に対し ±20% 許容 (パラメータ調整余地を残す)
    expect(height).toBeGreaterThan(50)
    expect(height).toBeLessThan(95)
  })

  it('SMB3 実測ジャンプ高度: 1F だけ押すと短いジャンプ (~21px)', () => {
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = PLAYER.jumpInitialVelocity

    let height = 0
    const dt = FRAME
    for (let f = 0; f < 90; f++) {
      const heldThisFrame = f < 1
      stepPlayerPhysics(p, { ...baseInput, jumpHeld: heldThisFrame }, dt)
      if (p.velocity.y >= 0) break
      height += -p.velocity.y * (dt / 1000)
    }
    // 実測 21px、許容 10-40px
    expect(height).toBeGreaterThan(10)
    expect(height).toBeLessThan(45)
  })
})

describe('integratePosition', () => {
  it('velocity に従って位置を進める', () => {
    const p = createInitialPlayerState(100, 200)
    p.velocity.x = 200
    p.velocity.y = -100
    const { nextX, nextY } = integratePosition(p, FRAME)
    expect(nextX).toBeCloseTo(100 + (200 * FRAME) / 1000)
    expect(nextY).toBeCloseTo(200 + (-100 * FRAME) / 1000)
  })
})
