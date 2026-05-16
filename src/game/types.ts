export type GameMode = 'menu' | 'platform' | 'endroll'

export interface Vec2 {
  x: number
  y: number
}

export interface PlayerState {
  position: Vec2
  velocity: Vec2
  isOnGround: boolean
  isJumping: boolean
  jumpHoldMs: number
  facing: 1 | -1
}

export interface CameraState {
  scrollY: number
}

export interface GameState {
  mode: GameMode
  player: PlayerState
  camera: CameraState
  elapsedMs: number
}

export const createInitialPlayerState = (
  spawnX: number,
  spawnY: number
): PlayerState => ({
  position: { x: spawnX, y: spawnY },
  velocity: { x: 0, y: 0 },
  isOnGround: false,
  isJumping: false,
  jumpHoldMs: 0,
  facing: 1,
})

export const createInitialState = (
  mode: GameMode,
  spawnX: number,
  spawnY: number
): GameState => ({
  mode,
  player: createInitialPlayerState(spawnX, spawnY),
  camera: { scrollY: 0 },
  elapsedMs: 0,
})

export const initWithState = <T extends GameState>(
  state: T | undefined,
  factory: () => T
): T => {
  return state ?? factory()
}
