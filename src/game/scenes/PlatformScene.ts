// プラットフォームモード (固定画面)
// - 黒地に白/灰色の矩形を描いた Canvas を地形ソースとして使う
// - detectTerrain で CollisionRect[] を生成
// - 物理 → 衝突解決 → 表示反映 を毎フレーム実行

import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import { Scene } from '../Scene'
import { App } from '../App'
import { PLAYER, STAGE_HEIGHT, STAGE_WIDTH } from '../constants'
import { createInitialPlayerState, type PlayerState } from '../types'
import { stepPlayerPhysics, integratePosition } from '../physics'
import { resolveCollisions } from '../collision'
import { detectTerrain, type CollisionRect } from '../terrain'

const HINT_STYLE = {
  fill: 0x888888,
  fontSize: 14,
  fontFamily: 'sans-serif',
}

const drawPlatformTerrain = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 地面
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 560, 800, 10)

  // 左中段 (白)
  ctx.fillRect(50, 450, 200, 10)

  // 中央 (薄灰)
  ctx.fillStyle = '#cccccc'
  ctx.fillRect(300, 400, 150, 10)

  // 右中段 (白)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(550, 450, 200, 10)

  // 高い左 (中灰)
  ctx.fillStyle = '#999999'
  ctx.fillRect(100, 300, 120, 10)

  // 高い右 (白)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(500, 280, 150, 10)

  // 最上段 (やや暗灰)
  ctx.fillStyle = '#888888'
  ctx.fillRect(250, 180, 300, 10)

  // 階段風 (白)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 500, 150, 10)
  ctx.fillRect(150, 480, 100, 10)

  // 文字認識テスト用の小プラットフォーム (薄灰)
  ctx.fillStyle = '#aaaaaa'
  ctx.fillRect(600, 350, 80, 8)
  ctx.fillRect(350, 250, 100, 8)
}

export class PlatformScene extends Scene {
  private app: App
  private player: PlayerState
  private playerGfx: Graphics
  private rects: CollisionRect[]
  private terrainLayer: Container

  constructor(app: App) {
    super()
    this.app = app

    // --- 地形 ---
    const canvas = document.createElement('canvas')
    canvas.width = STAGE_WIDTH
    canvas.height = STAGE_HEIGHT
    drawPlatformTerrain(canvas)

    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, STAGE_WIDTH, STAGE_HEIGHT)
    this.rects = detectTerrain(imageData)

    const terrainSprite = new Sprite(Texture.from(canvas))
    this.terrainLayer = new Container()
    this.terrainLayer.addChild(terrainSprite)
    this.addChild(this.terrainLayer)

    // --- プレイヤー ---
    this.player = createInitialPlayerState(PLAYER.spawnX, PLAYER.spawnY)
    this.playerGfx = new Graphics()
      .rect(-PLAYER.width / 2, -PLAYER.height / 2, PLAYER.width, PLAYER.height)
      .fill({ color: PLAYER.color })
    this.playerGfx.x = this.player.position.x
    this.playerGfx.y = this.player.position.y
    this.addChild(this.playerGfx)

    // --- HUD ---
    const hint = new Text({
      text: '← → 移動 / Shift ダッシュ / Space ジャンプ / Esc メニュー',
      style: HINT_STYLE,
    })
    hint.x = 12
    hint.y = 12
    this.addChild(hint)

    // タッチ操作用オーバーレイ
    this.app.input.attachTouchOverlay()
  }

  override update(deltaMs: number): void {
    if (this.app.input.state.backJustPressed) {
      this.exit({ back: true })
      return
    }

    const input = this.app.input.state
    stepPlayerPhysics(
      this.player,
      {
        left: input.left,
        right: input.right,
        jumpHeld: input.jump,
        jumpJustPressed: input.jumpJustPressed,
        runHeld: input.run,
      },
      deltaMs
    )

    const { nextX, nextY } = integratePosition(this.player, deltaMs)
    const result = resolveCollisions(this.player, nextX, nextY, this.rects)

    this.player.position.x = result.x
    this.player.position.y = result.y
    this.player.isOnGround = result.isOnGround

    // 画面外フェイルセーフ: 下に落ちたらリスポーン
    if (this.player.position.y > STAGE_HEIGHT + 100) {
      this.player.position.x = PLAYER.spawnX
      this.player.position.y = PLAYER.spawnY
      this.player.velocity.x = 0
      this.player.velocity.y = 0
    }
    // 左右の画面外で止める
    const minX = PLAYER.width / 2
    const maxX = STAGE_WIDTH - PLAYER.width / 2
    if (this.player.position.x < minX) {
      this.player.position.x = minX
      this.player.velocity.x = 0
    } else if (this.player.position.x > maxX) {
      this.player.position.x = maxX
      this.player.velocity.x = 0
    }

    this.playerGfx.x = this.player.position.x
    this.playerGfx.y = this.player.position.y
  }

  override destroyScene(): void {
    this.app.input.detachTouchOverlay()
    super.destroyScene()
  }
}
