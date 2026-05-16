// キーボード + タッチ (画面下に左/右/ジャンプの透明ヒット領域) の入力ハンドラ
// 各シーンが poll する形 (input.state.left など)。フレーム間で押下状態が持続する

import {
  Application,
  Container,
  FederatedPointerEvent,
  Graphics,
} from 'pixi.js'
import { STAGE_HEIGHT, STAGE_WIDTH } from './constants'

export interface InputState {
  left: boolean
  right: boolean
  jump: boolean
  jumpJustPressed: boolean
  back: boolean
}

export class InputManager {
  state: InputState = {
    left: false,
    right: false,
    jump: false,
    jumpJustPressed: false,
    back: false,
  }

  private app: Application
  private overlay: Container | null = null
  private prevJump = false

  private keyDown = (ev: KeyboardEvent): void => {
    switch (ev.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.state.left = true
        break
      case 'ArrowRight':
      case 'KeyD':
        this.state.right = true
        break
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
        this.state.jump = true
        break
      case 'Escape':
        this.state.back = true
        break
    }
  }

  private keyUp = (ev: KeyboardEvent): void => {
    switch (ev.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.state.left = false
        break
      case 'ArrowRight':
      case 'KeyD':
        this.state.right = false
        break
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
        this.state.jump = false
        break
      case 'Escape':
        this.state.back = false
        break
    }
  }

  constructor(app: Application) {
    this.app = app
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
  }

  /** タッチ用の透明ボタンを追加。シーン切り替え毎に呼ぶ */
  attachTouchOverlay(): void {
    this.detachTouchOverlay()
    const overlay = new Container()
    overlay.eventMode = 'static'
    overlay.label = 'input-overlay'

    const btnW = STAGE_WIDTH / 3
    const btnH = 120
    const y = STAGE_HEIGHT - btnH

    const makeBtn = (
      x: number,
      key: 'left' | 'right' | 'jump',
      label: string,
      fillColor: number
    ): void => {
      const g = new Graphics()
      g.rect(0, 0, btnW, btnH).fill({ color: fillColor, alpha: 0.25 })
      g.x = x
      g.y = y
      g.eventMode = 'static'
      g.cursor = 'pointer'
      g.label = `btn-${key}`

      // 文字描画は別途。ここではヒット領域のみ
      const setDown = (): void => {
        this.state[key] = true
      }
      const setUp = (): void => {
        this.state[key] = false
      }
      g.on('pointerdown', (ev: FederatedPointerEvent) => {
        ev.stopPropagation()
        setDown()
      })
      g.on('pointerup', setUp)
      g.on('pointerupoutside', setUp)
      g.on('pointercancel', setUp)

      overlay.addChild(g)
      void label
    }

    makeBtn(0, 'left', '←', 0x4444aa)
    makeBtn(btnW, 'jump', '↑', 0x44aa44)
    makeBtn(btnW * 2, 'right', '→', 0xaa4444)

    this.app.stage.addChild(overlay)
    this.overlay = overlay
  }

  detachTouchOverlay(): void {
    if (this.overlay) {
      this.app.stage.removeChild(this.overlay)
      this.overlay.destroy({ children: true })
      this.overlay = null
    }
  }

  /** フレーム頭で呼ぶ。jumpJustPressed の計算 */
  tick(): void {
    this.state.jumpJustPressed = this.state.jump && !this.prevJump
    this.prevJump = this.state.jump
  }

  destroy(): void {
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
    this.detachTouchOverlay()
  }
}
