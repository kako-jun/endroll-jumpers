import { describe, expect, it } from 'vitest'
import { resolveCollisions } from './collision'
import { createInitialPlayerState } from './types'
import { PLAYER } from './constants'

const FLOOR = { x: 0, y: 500, width: 800, height: 100 }
const WALL_RIGHT = { x: 200, y: 0, width: 20, height: 600 }
const CEIL = { x: 0, y: 0, width: 800, height: 20 }

describe('resolveCollisions', () => {
  it('床の上に落下すると isOnGround=true で y が床上端に揃う', () => {
    const p = createInitialPlayerState(100, 480)
    p.velocity.y = 100
    const result = resolveCollisions(p, 100, 490, [FLOOR])
    expect(result.isOnGround).toBe(true)
    expect(result.y).toBe(FLOOR.y - PLAYER.height / 2)
    expect(p.velocity.y).toBe(0)
  })

  it('右の壁にぶつかると x がめり込まず velocity.x が 0', () => {
    const p = createInitialPlayerState(180, 100)
    p.velocity.x = 100
    const result = resolveCollisions(p, 200, 100, [WALL_RIGHT])
    expect(result.hitWall).toBe(true)
    expect(result.x).toBe(WALL_RIGHT.x - PLAYER.width / 2)
    expect(p.velocity.x).toBe(0)
  })

  it('天井にぶつかると hitCeiling=true で y がブロック下端に揃う', () => {
    const p = createInitialPlayerState(100, 40)
    p.velocity.y = -200
    const result = resolveCollisions(p, 100, 25, [CEIL])
    expect(result.hitCeiling).toBe(true)
    expect(result.y).toBe(CEIL.y + CEIL.height + PLAYER.height / 2)
    expect(p.velocity.y).toBe(0)
  })

  it('衝突がない場合は素通り', () => {
    const p = createInitialPlayerState(400, 300)
    p.velocity.x = 50
    p.velocity.y = 50
    const result = resolveCollisions(p, 410, 310, [FLOOR])
    expect(result.isOnGround).toBe(false)
    expect(result.x).toBe(410)
    expect(result.y).toBe(310)
  })

  it('X と Y が同時に衝突しても両方解決する', () => {
    const p = createInitialPlayerState(180, 480)
    p.velocity.x = 80
    p.velocity.y = 80
    const result = resolveCollisions(p, 200, 490, [FLOOR, WALL_RIGHT])
    expect(result.hitWall).toBe(true)
    expect(result.isOnGround).toBe(true)
    expect(p.velocity.x).toBe(0)
    expect(p.velocity.y).toBe(0)
  })
})
