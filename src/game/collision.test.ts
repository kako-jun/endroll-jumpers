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

  it('velocity.y=0 で床にめり込んでいるとき: 押し戻しの方向は velocity に依存するため、現状の実装は何もしない (既知挙動)', () => {
    // スポーン位置で既に床と重なっている異常状態の検証。velocity.y=0 のため
    // Y 軸の押し戻しは発動しない。このケースは現状仕様として明示的に許容している
    // (スポーン位置の安全配置で防ぐべき問題)
    const p = createInitialPlayerState(100, 510) // FLOOR (y=500) に既にめり込み
    p.velocity.x = 0
    p.velocity.y = 0
    const result = resolveCollisions(p, 100, 510, [FLOOR])
    expect(result.y).toBe(510) // 押し戻されない
    expect(result.isOnGround).toBe(false) // velocity.y=0 では床判定が発動しない
  })

  it('プラットフォーム角への斜め突入: X→Y 分離方式の既知挙動', () => {
    // 床の右上角に左下から飛び込むケース。X 軸は現在 Y で判定するため、
    // player.y が床より上 (空中) の段階では床矩形と X-overlap しない。
    // 結果として「壁ヒットせず床着地のみ」となる。これは X→Y 分離方式の
    // 仕様であり、実機 SMB3 の「ブロック角に右から突っ込んでも横移動は維持」
    // と偶然一致する。
    const BLOCK = { x: 200, y: 400, width: 100, height: 50 }
    const p = createInitialPlayerState(180, 380) // ブロックの左上、まだ空中
    p.velocity.x = 100
    p.velocity.y = 100 // 右下に移動
    const result = resolveCollisions(p, 210, 400, [BLOCK])
    // Y 軸で床着地のみ。X 軸は player.y=380 の段階で BLOCK と overlap しないので素通り
    expect(result.isOnGround).toBe(true)
    expect(result.hitWall).toBe(false)
    expect(p.velocity.x).toBe(100) // X 速度は維持
  })
})
