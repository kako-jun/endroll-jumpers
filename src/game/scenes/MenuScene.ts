// 起動直後のモード選択画面 (Issue #10 で本実装、ここでは最小版)

import { Graphics, Text } from 'pixi.js'
import { Scene } from '../Scene'
import { App } from '../App'
import { STAGE_HEIGHT, STAGE_WIDTH } from '../constants'

const TITLE_STYLE = { fill: 0xffffff, fontSize: 36, fontFamily: 'sans-serif' }
const BUTTON_STYLE = { fill: 0xffffff, fontSize: 24, fontFamily: 'sans-serif' }

export class MenuScene extends Scene {
  constructor(_app: App) {
    super()
    void _app

    const title = new Text({
      text: 'ENDROLL JUMPERS',
      style: TITLE_STYLE,
    })
    title.anchor.set(0.5)
    title.x = STAGE_WIDTH / 2
    title.y = STAGE_HEIGHT / 3
    this.addChild(title)

    this.addButton('プラットフォーム', STAGE_HEIGHT / 2, () =>
      this.exit({ mode: 'platform' })
    )
    this.addButton('エンドロール', STAGE_HEIGHT / 2 + 70, () =>
      this.exit({ mode: 'endroll' })
    )
  }

  private addButton(label: string, y: number, onClick: () => void): void {
    const bg = new Graphics()
    bg.rect(-140, -25, 280, 50).fill({ color: 0x222222 }).stroke({
      color: 0xffffff,
      width: 2,
    })
    bg.x = STAGE_WIDTH / 2
    bg.y = y
    bg.eventMode = 'static'
    bg.cursor = 'pointer'
    bg.on('pointerdown', onClick)

    const text = new Text({ text: label, style: BUTTON_STYLE })
    text.anchor.set(0.5)
    text.x = STAGE_WIDTH / 2
    text.y = y
    this.addChild(bg)
    this.addChild(text)
  }
}
