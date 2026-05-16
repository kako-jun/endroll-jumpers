import { describe, expect, it } from 'vitest'
import { stepPlayerPhysics, integratePosition } from './physics'
import { createInitialPlayerState } from './types'
import { GRAVITY, PLAYER } from './constants'

const FRAME = 16.6667

describe('stepPlayerPhysics', () => {
  it('左入力で velocity.x が負になり、facing が -1 になる', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    stepPlayerPhysics(
      p,
      { left: true, right: false, jumpHeld: false, jumpJustPressed: false },
      FRAME
    )
    expect(p.velocity.x).toBeLessThan(0)
    expect(p.facing).toBe(-1)
  })

  it('入力なしで velocity.x が摩擦で減衰する', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    p.velocity.x = 100
    stepPlayerPhysics(
      p,
      { left: false, right: false, jumpHeld: false, jumpJustPressed: false },
      FRAME
    )
    expect(p.velocity.x).toBeLessThan(100)
    expect(p.velocity.x).toBeGreaterThan(0)
  })

  it('maxMoveSpeed でクランプされる', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    p.velocity.x = PLAYER.maxMoveSpeed + 500
    stepPlayerPhysics(
      p,
      { left: false, right: true, jumpHeld: false, jumpJustPressed: false },
      FRAME
    )
    expect(p.velocity.x).toBeLessThanOrEqual(PLAYER.maxMoveSpeed)
  })

  it('jumpJustPressed + isOnGround でジャンプが開始する', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = true
    stepPlayerPhysics(
      p,
      { left: false, right: false, jumpHeld: true, jumpJustPressed: true },
      FRAME
    )
    expect(p.velocity.y).toBeLessThan(0)
    expect(p.isJumping).toBe(true)
    expect(p.isOnGround).toBe(false)
  })

  it('空中では jumpJustPressed でジャンプしない', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = false
    p.velocity.y = 50
    stepPlayerPhysics(
      p,
      { left: false, right: false, jumpHeld: true, jumpJustPressed: true },
      FRAME
    )
    expect(p.isJumping).toBe(false)
  })

  it('重力が velocity.y を加算する (落下中)', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = false
    p.velocity.y = 0
    stepPlayerPhysics(
      p,
      { left: false, right: false, jumpHeld: false, jumpJustPressed: false },
      FRAME
    )
    expect(p.velocity.y).toBeCloseTo((GRAVITY * FRAME) / 1000, 1)
  })

  it('maxFallSpeed でクランプされる', () => {
    const p = createInitialPlayerState(0, 0)
    p.isOnGround = false
    p.velocity.y = PLAYER.maxFallSpeed + 1000
    stepPlayerPhysics(
      p,
      { left: false, right: false, jumpHeld: false, jumpJustPressed: false },
      FRAME
    )
    expect(p.velocity.y).toBe(PLAYER.maxFallSpeed)
  })

  it('可変ジャンプ: 押し続けで上昇継続', () => {
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = PLAYER.jumpInitialVelocity
    const yBeforeHold = p.velocity.y
    stepPlayerPhysics(
      p,
      { left: false, right: false, jumpHeld: true, jumpJustPressed: false },
      FRAME
    )
    // 押し続けた場合、重力で減速するが jumpHoldBoost で相殺/上回る
    // 単純に重力だけ加わった場合の値より小さい (= より上昇) ことを確認
    const yWithGravityOnly = yBeforeHold + (GRAVITY * FRAME) / 1000
    expect(p.velocity.y).toBeLessThan(yWithGravityOnly)
  })

  it('可変ジャンプ: ボタンを離すと isJumping=false', () => {
    const p = createInitialPlayerState(0, 0)
    p.isJumping = true
    p.isOnGround = false
    p.velocity.y = -100
    stepPlayerPhysics(
      p,
      { left: false, right: false, jumpHeld: false, jumpJustPressed: false },
      FRAME
    )
    expect(p.isJumping).toBe(false)
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
