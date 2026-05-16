// プラットフォームモード (Issue #7 で本実装)
// ここでは最小スタブ: 後で物理 + 地形認識 + 衝突を載せる

import { Text } from 'pixi.js'
import { Scene } from '../Scene'
import { App } from '../App'
import { STAGE_HEIGHT, STAGE_WIDTH } from '../constants'

export class PlatformScene extends Scene {
  private app: App

  constructor(app: App) {
    super()
    this.app = app

    const text = new Text({
      text: 'Platform (stub) — ESC で戻る',
      style: { fill: 0xffffff, fontSize: 20, fontFamily: 'sans-serif' },
    })
    text.anchor.set(0.5)
    text.x = STAGE_WIDTH / 2
    text.y = STAGE_HEIGHT / 2
    this.addChild(text)
  }

  override update(_deltaMs: number): void {
    if (this.app.input.state.back) {
      this.exit({ back: true })
    }
  }
}
