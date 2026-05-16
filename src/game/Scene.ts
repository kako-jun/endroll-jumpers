import { Container } from 'pixi.js'

export interface SceneExitParam {
  mode?: 'platform' | 'endroll'
  back?: boolean
}

export type SceneExitHandler = (param: SceneExitParam) => void

export class Scene extends Container {
  private exitHandler: SceneExitHandler | null = null

  setExitHandler(handler: SceneExitHandler): void {
    this.exitHandler = handler
  }

  exit(param: SceneExitParam = {}): void {
    this.exitHandler?.(param)
  }

  update(_deltaMs: number): void {
    // override in subclass
  }

  destroyScene(): void {
    this.removeChildren()
    this.destroy({ children: true })
  }
}
