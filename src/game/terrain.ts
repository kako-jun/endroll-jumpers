// ピクセル輝度ベースの地形認識
// - 各行を走査し、brightness >= threshold が minWidth ピクセル以上連続する区間を矩形として登録
// - 行ごとに minWidth 以上の塊を全て拾うので、複数のプラットフォームが同一行に存在しても OK
// - 隣接行で同位置に連続する塊は縦に結合 (簡易ランレングス)

import { TERRAIN } from './constants'

export interface CollisionRect {
  x: number
  y: number
  width: number
  height: number
}

export interface DetectOptions {
  threshold?: number
  minWidth?: number
  /** 行ごとの矩形を縦方向に結合するか (デフォルト true) */
  mergeVertically?: boolean
}

const getBrightness = (data: Uint8ClampedArray, idx: number): number => {
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3
}

interface RunSegment {
  y: number
  xStart: number
  xEnd: number // exclusive
}

const findRunsInRow = (
  data: Uint8ClampedArray,
  width: number,
  y: number,
  threshold: number,
  minWidth: number
): RunSegment[] => {
  const runs: RunSegment[] = []
  let runStart: number | null = null

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4
    const bright = getBrightness(data, idx) >= threshold

    if (bright && runStart === null) {
      runStart = x
    } else if (!bright && runStart !== null) {
      if (x - runStart >= minWidth) {
        runs.push({ y, xStart: runStart, xEnd: x })
      }
      runStart = null
    }
  }
  if (runStart !== null && width - runStart >= minWidth) {
    runs.push({ y, xStart: runStart, xEnd: width })
  }
  return runs
}

export const detectTerrain = (
  imageData: ImageData,
  options: DetectOptions = {}
): CollisionRect[] => {
  const threshold = options.threshold ?? TERRAIN.brightnessThreshold
  const minWidth = options.minWidth ?? TERRAIN.minWidth
  const mergeVertically = options.mergeVertically ?? true
  const { data, width, height } = imageData

  // 行ごとに run を抽出
  const allRuns: RunSegment[][] = []
  for (let y = 0; y < height; y++) {
    allRuns.push(findRunsInRow(data, width, y, threshold, minWidth))
  }

  if (!mergeVertically) {
    const rects: CollisionRect[] = []
    for (const row of allRuns) {
      for (const r of row) {
        rects.push({
          x: r.xStart,
          y: r.y,
          width: r.xEnd - r.xStart,
          height: 1,
        })
      }
    }
    return rects
  }

  // 同位置 (xStart, xEnd 完全一致) の run を縦に結合
  type ActiveRect = CollisionRect & { xEnd: number }
  const active: ActiveRect[] = []
  const closed: CollisionRect[] = []

  for (let y = 0; y < height; y++) {
    const runs = allRuns[y]
    const stillActive: ActiveRect[] = []
    const usedRuns = new Set<number>()

    for (const a of active) {
      const matchIdx = runs.findIndex(
        (r, i) => !usedRuns.has(i) && r.xStart === a.x && r.xEnd === a.xEnd
      )
      if (matchIdx >= 0) {
        usedRuns.add(matchIdx)
        a.height += 1
        stillActive.push(a)
      } else {
        closed.push({ x: a.x, y: a.y, width: a.width, height: a.height })
      }
    }

    for (let i = 0; i < runs.length; i++) {
      if (usedRuns.has(i)) continue
      const r = runs[i]
      stillActive.push({
        x: r.xStart,
        y: r.y,
        width: r.xEnd - r.xStart,
        height: 1,
        xEnd: r.xEnd,
      })
    }

    active.length = 0
    active.push(...stillActive)
  }
  for (const a of active) {
    closed.push({ x: a.x, y: a.y, width: a.width, height: a.height })
  }

  return closed
}

/** Canvas に矩形群を描いて ImageData を返すテスト用ヘルパー */
export const renderTerrainPreview = (
  rects: CollisionRect[],
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D
): void => {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#fff'
  for (const r of rects) {
    ctx.fillRect(r.x, r.y, r.width, r.height)
  }
}
