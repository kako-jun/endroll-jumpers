// SceneManager: Menu ↔ Platform ↔ Endroll の遷移

import { Application } from 'pixi.js'
import { InputManager } from './input'
import { Scene, SceneExitParam } from './Scene'

export class App {
  app: Application
  input: InputManager
  private currentScene: Scene | null = null
  // 動的 import 中に別シーンへの遷移が走った場合、後勝ちで上書きされ
  // 2 重 replaceScene が走るのを防ぐためのガード
  private isTransitioning = false

  constructor(app: Application) {
    this.app = app
    this.input = new InputManager(app)
    this.app.ticker.add(ticker => {
      this.input.tick()
      // タブ非アクティブから戻ったとき deltaMS が数百〜数千 ms になり、
      // 一発で画面外まで飛ぶ / すり抜ける問題を防ぐため 33ms (30fps 相当) で頭打ち。
      const deltaMs = Math.min(ticker.deltaMS, 33)
      this.currentScene?.update(deltaMs)
    })
  }

  async startMenu(): Promise<void> {
    if (this.isTransitioning) return
    this.isTransitioning = true
    try {
      const { MenuScene } = await import('./scenes/MenuScene')
      this.replaceScene(new MenuScene())
    } finally {
      this.isTransitioning = false
    }
  }

  async startPlatform(): Promise<void> {
    if (this.isTransitioning) return
    this.isTransitioning = true
    try {
      const { PlatformScene } = await import('./scenes/PlatformScene')
      this.replaceScene(new PlatformScene(this))
    } finally {
      this.isTransitioning = false
    }
  }

  async startEndroll(): Promise<void> {
    if (this.isTransitioning) return
    this.isTransitioning = true
    try {
      const { EndrollScene } = await import('./scenes/EndrollScene')
      this.replaceScene(new EndrollScene(this))
    } finally {
      this.isTransitioning = false
    }
  }

  private replaceScene(scene: Scene): void {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene)
      this.currentScene.destroyScene()
    }
    this.currentScene = scene
    scene.setExitHandler(param => this.handleExit(param))
    this.app.stage.addChild(scene)
  }

  private handleExit(param: SceneExitParam): void {
    if (param.mode === 'platform') {
      void this.startPlatform()
    } else if (param.mode === 'endroll') {
      void this.startEndroll()
    } else {
      void this.startMenu()
    }
  }
}
