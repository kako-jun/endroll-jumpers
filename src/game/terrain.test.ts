import { describe, expect, it } from 'vitest'
import { detectTerrain } from './terrain'

const makeImageData = (
  width: number,
  height: number,
  paint: (x: number, y: number) => number
): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const v = paint(x, y)
      data[idx] = v
      data[idx + 1] = v
      data[idx + 2] = v
      data[idx + 3] = 255
    }
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData
}

describe('detectTerrain', () => {
  it('全黒の画像では矩形が返らない', () => {
    const img = makeImageData(20, 20, () => 0)
    expect(detectTerrain(img)).toEqual([])
  })

  it('1 行の白い帯を 1 矩形として検出', () => {
    const img = makeImageData(20, 10, (_x, y) => (y === 5 ? 255 : 0))
    const rects = detectTerrain(img)
    expect(rects).toHaveLength(1)
    expect(rects[0]).toEqual({ x: 0, y: 5, width: 20, height: 1 })
  })

  it('複数行に渡る同一位置の帯は縦結合される', () => {
    const img = makeImageData(20, 10, (x, y) =>
      x >= 5 && x < 15 && y >= 3 && y < 7 ? 255 : 0
    )
    const rects = detectTerrain(img)
    expect(rects).toHaveLength(1)
    expect(rects[0]).toEqual({ x: 5, y: 3, width: 10, height: 4 })
  })

  it('同一行に複数の塊があれば別矩形として検出', () => {
    const img = makeImageData(20, 1, x => (x < 5 || x >= 12 ? 255 : 0))
    const rects = detectTerrain(img)
    expect(rects).toHaveLength(2)
    expect(rects[0]).toMatchObject({ x: 0, width: 5 })
    expect(rects[1]).toMatchObject({ x: 12, width: 8 })
  })

  it('minWidth 未満の塊は無視される', () => {
    const img = makeImageData(20, 1, x => (x === 5 ? 255 : 0))
    const rects = detectTerrain(img, { minWidth: 3 })
    expect(rects).toEqual([])
  })

  it('threshold より暗いピクセルは地形にならない', () => {
    const img = makeImageData(20, 1, () => 50)
    expect(detectTerrain(img, { threshold: 80 })).toEqual([])
    expect(detectTerrain(img, { threshold: 30 }).length).toBeGreaterThan(0)
  })

  it('mergeVertically=false で行ごとの矩形を返す', () => {
    const img = makeImageData(10, 3, (_x, _y) => 255)
    const rects = detectTerrain(img, { mergeVertically: false })
    expect(rects).toHaveLength(3)
    for (const r of rects) {
      expect(r.height).toBe(1)
    }
  })
})
