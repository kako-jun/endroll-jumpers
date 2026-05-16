export const STAGE_WIDTH = 800
export const STAGE_HEIGHT = 600

export const GRAVITY = 1800

export const PLAYER = {
  width: 30,
  height: 30,
  color: 0x00ffff,
  spawnX: 100,
  spawnY: 100,

  maxMoveSpeed: 200,
  acceleration: 1200,
  groundFriction: 0.85,
  airFriction: 0.95,

  jumpInitialVelocity: -520,
  jumpHoldBoost: -900,
  maxJumpHoldMs: 280,
  maxFallSpeed: 600,

  airControl: 0.6,
}

export const TERRAIN = {
  brightnessThreshold: 80,
  minWidth: 3,
  rowHeight: 10,
}

export const ENDROLL = {
  imageHeight: 2400,
  scrollSpeed: 30,
}
