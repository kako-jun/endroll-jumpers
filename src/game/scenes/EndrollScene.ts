// エンドロールモード
// - 縦長 (WORLD_HEIGHT = 2400px) の地形画像を生成
// - カメラがプレイヤーを追従して縦スクロール
// - スタッフロール風のテキストが地形として機能する
// - プレイヤーが世界の下まで落ちると上にリスポーン

import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import { Scene } from '../Scene'
import { App } from '../App'
import { ENDROLL, PLAYER, STAGE_HEIGHT, STAGE_WIDTH } from '../constants'
import { createInitialPlayerState, type PlayerState } from '../types'
import { stepPlayerPhysics, integratePosition } from '../physics'
import { resolveCollisions } from '../collision'
import { detectTerrain, type CollisionRect } from '../terrain'

const WORLD_HEIGHT = ENDROLL.imageHeight

const CREDITS: { y: number; text: string; size: number }[] = [
  { y: 80, text: 'ENDROLL JUMPERS', size: 48 },
  { y: 240, text: '~ STAFF ~', size: 28 },
  { y: 360, text: 'Programming', size: 22 },
  { y: 400, text: 'kako-jun', size: 28 },
  { y: 560, text: 'Game Design', size: 22 },
  { y: 600, text: 'kako-jun', size: 28 },
  { y: 760, text: 'Art Direction', size: 22 },
  { y: 800, text: 'kako-jun', size: 28 },
  { y: 960, text: 'Music', size: 22 },
  { y: 1000, text: 'silence', size: 28 },
  { y: 1160, text: 'Special Thanks', size: 22 },
  { y: 1200, text: 'You', size: 32 },
  { y: 1380, text: '~ THE END ~', size: 32 },
  { y: 1560, text: 'Made with', size: 18 },
  { y: 1600, text: 'PixiJS v8', size: 26 },
  { y: 1760, text: 'See you again', size: 22 },
  { y: 2000, text: '!', size: 48 },
  { y: 2280, text: 'GROUND', size: 24 },
]

const drawEndrollTerrain = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // ベースの地面 (最下段)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, WORLD_HEIGHT - 40, STAGE_WIDTH, 40)

  // 階段状のスタートプラットフォーム
  ctx.fillStyle = '#cccccc'
  ctx.fillRect(80, 160, 200, 12)
  ctx.fillRect(STAGE_WIDTH - 280, 280, 200, 12)

  // クレジットテキストを描画 (これがそのまま地形になる)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const credit of CREDITS) {
    const fillBrightness =
      credit.size >= 32 ? '#ffffff' : credit.size >= 24 ? '#cccccc' : '#999999'
    ctx.fillStyle = fillBrightness
    ctx.font = `${credit.size}px sans-serif`
    ctx.fillText(credit.text, STAGE_WIDTH / 2, credit.y)
  }
}

export class EndrollScene extends Scene {
  private app: App
  private player: PlayerState
  private playerGfx: Graphics
  private rects: CollisionRect[]
  private world: Container
  private cameraY: number = 0

  constructor(app: App) {
    super()
    this.app = app

    const canvas = document.createElement('canvas')
    canvas.width = STAGE_WIDTH
    canvas.height = WORLD_HEIGHT
    drawEndrollTerrain(canvas)

    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, STAGE_WIDTH, WORLD_HEIGHT)
    this.rects = detectTerrain(imageData)

    this.world = new Container()
    const terrainSprite = new Sprite(Texture.from(canvas))
    this.world.addChild(terrainSprite)
    this.addChild(this.world)

    this.player = createInitialPlayerState(STAGE_WIDTH / 2, 60)
    this.playerGfx = new Graphics()
      .rect(-PLAYER.width / 2, -PLAYER.height / 2, PLAYER.width, PLAYER.height)
      .fill({ color: PLAYER.color })
    this.world.addChild(this.playerGfx)
    this.playerGfx.x = this.player.position.x
    this.playerGfx.y = this.player.position.y

    const hint = new Text({
      text: '↓ 落ちて世界の下を目指せ / Esc メニュー',
      style: { fill: 0x888888, fontSize: 14, fontFamily: 'sans-serif' },
    })
    hint.x = 12
    hint.y = 12
    this.addChild(hint)

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

    // エンドロール感を出すため、自動下スクロール分を player.y にも加える
    this.player.position.y += (ENDROLL.scrollSpeed * deltaMs) / 1000

    const { nextX, nextY } = integratePosition(this.player, deltaMs)
    const result = resolveCollisions(this.player, nextX, nextY, this.rects)

    this.player.position.x = result.x
    this.player.position.y = result.y
    this.player.isOnGround = result.isOnGround

    // 画面外フェイルセーフ
    if (this.player.position.y > WORLD_HEIGHT + 100) {
      this.player.position.x = STAGE_WIDTH / 2
      this.player.position.y = 60
      this.player.velocity.x = 0
      this.player.velocity.y = 0
    }
    const minX = PLAYER.width / 2
    const maxX = STAGE_WIDTH - PLAYER.width / 2
    if (this.player.position.x < minX) {
      this.player.position.x = minX
      this.player.velocity.x = 0
    } else if (this.player.position.x > maxX) {
      this.player.position.x = maxX
      this.player.velocity.x = 0
    }

    // カメラ: プレイヤーを画面中央に追従 (上限/下限でクランプ)
    const targetCamY = this.player.position.y - STAGE_HEIGHT / 2
    this.cameraY = Math.max(
      0,
      Math.min(WORLD_HEIGHT - STAGE_HEIGHT, targetCamY)
    )
    this.world.y = -this.cameraY

    this.playerGfx.x = this.player.position.x
    this.playerGfx.y = this.player.position.y
  }

  override destroyScene(): void {
    this.app.input.detachTouchOverlay()
    super.destroyScene()
  }
}
