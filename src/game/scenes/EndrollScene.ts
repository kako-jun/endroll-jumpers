// エンドロールモード (Issue #8 で本実装)

import { Text } from 'pixi.js'
import { Scene } from '../Scene'
import { App } from '../App'
import { STAGE_HEIGHT, STAGE_WIDTH } from '../constants'

export class EndrollScene extends Scene {
  private app: App

  constructor(app: App) {
    super()
    this.app = app

    const text = new Text({
      text: 'Endroll (stub) — ESC で戻る',
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
