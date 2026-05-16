// 起動直後のモード選択画面

import { Graphics, Text } from 'pixi.js'
import { Scene } from '../Scene'
import { STAGE_HEIGHT, STAGE_WIDTH } from '../constants'

const TITLE_STYLE = { fill: 0xffffff, fontSize: 36, fontFamily: 'sans-serif' }
const BUTTON_STYLE = { fill: 0xffffff, fontSize: 24, fontFamily: 'sans-serif' }
const SUBTITLE_STYLE = {
  fill: 0x888888,
  fontSize: 14,
  fontFamily: 'sans-serif',
}

const BTN_W = 280
const BTN_H = 50

// tint は元の色に対する乗算カラー。0xffffff (= 100%) が元色、0xcccccc 等で
// 暗くなる。明るくしたい場合は背景を darker にして tint 0xffffff ↔ 0xffffff で
// 描画し直す必要があるが、ここでは「やや明るくして hover を示す」ため
// 背景色自体を 2 段階用意し pointerover で切り替える。
const COLOR_BASE = 0x222222
const COLOR_HOVER = 0x444444

export class MenuScene extends Scene {
  constructor() {
    super()

    const title = new Text({ text: 'ENDROLL JUMPERS', style: TITLE_STYLE })
    title.anchor.set(0.5)
    title.x = STAGE_WIDTH / 2
    title.y = STAGE_HEIGHT / 3
    this.addChild(title)

    const subtitle = new Text({
      text: '輝度地形を駆け抜けろ',
      style: SUBTITLE_STYLE,
    })
    subtitle.anchor.set(0.5)
    subtitle.x = STAGE_WIDTH / 2
    subtitle.y = STAGE_HEIGHT / 3 + 32
    this.addChild(subtitle)

    this.addButton('プラットフォーム', STAGE_HEIGHT / 2, () =>
      this.exit({ mode: 'platform' })
    )
    this.addButton('エンドロール', STAGE_HEIGHT / 2 + 70, () =>
      this.exit({ mode: 'endroll' })
    )
  }

  private addButton(label: string, y: number, onClick: () => void): void {
    const redraw = (g: Graphics, color: number): void => {
      g.clear()
      g.rect(-BTN_W / 2, -BTN_H / 2, BTN_W, BTN_H)
        .fill({ color })
        .stroke({ color: 0xffffff, width: 2 })
    }

    const bg = new Graphics()
    redraw(bg, COLOR_BASE)
    bg.x = STAGE_WIDTH / 2
    bg.y = y
    bg.eventMode = 'static'
    bg.cursor = 'pointer'
    bg.on('pointerover', () => redraw(bg, COLOR_HOVER))
    bg.on('pointerout', () => redraw(bg, COLOR_BASE))
    bg.on('pointerdown', onClick)

    const text = new Text({ text: label, style: BUTTON_STYLE })
    text.anchor.set(0.5)
    text.x = STAGE_WIDTH / 2
    text.y = y
    this.addChild(bg)
    this.addChild(text)
  }
}
