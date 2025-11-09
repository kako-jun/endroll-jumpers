import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite
  private spaceKey?: Phaser.Input.Keyboard.Key
  private platforms?: Phaser.Physics.Arcade.StaticGroup
  private obstacles?: Phaser.Physics.Arcade.Group
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private obstacleTimer?: Phaser.Time.TimerEvent
  private instructionText?: Phaser.GameObjects.Text
  private ground?: Phaser.Physics.Arcade.Sprite
  private scrollSpeed = 200
  private jumpCount = 0
  private maxJumps = 2 // ダブルジャンプ可能

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    // アセットがないので、スキップ
  }

  create() {
    // 背景色は設定ファイルで指定済み（黒）

    // 地面を作成
    this.createGround()

    // プレイヤーを作成
    this.createPlayer()

    // 障害物グループを作成
    this.createObstacles()

    // スコア表示（距離）
    this.scoreText = this.add.text(16, 16, '距離: 0', {
      fontSize: '24px',
      color: '#ffffff',
    })
    this.scoreText.setDepth(100)

    // 操作説明
    this.instructionText = this.add.text(
      400,
      16,
      '操作: スペースキーまたはタップでジャンプ（2段ジャンプ可能）',
      {
        fontSize: '16px',
        color: '#aaaaaa',
      }
    )
    this.instructionText.setOrigin(0.5, 0)
    this.instructionText.setDepth(100)

    // キーボード入力
    this.spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    )

    // タッチ/クリック入力
    this.input.on('pointerdown', this.handlePointerDown, this)

    // 衝突判定
    this.physics.add.collider(this.player!, this.ground!)
    this.physics.add.overlap(
      this.player!,
      this.obstacles!,
      this.hitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    // 障害物を定期的にスポーン
    this.obstacleTimer = this.time.addEvent({
      delay: 2000, // 2秒ごと
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    })

    // スコア更新
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score += 1
          this.scoreText?.setText('距離: ' + this.score)
        }
      },
      callbackScope: this,
      loop: true,
    })
  }

  private createGround() {
    // 地面（緑の長方形）
    this.ground = this.physics.add.staticSprite(400, 580, '')
    this.ground.setDisplaySize(800, 40)
    this.ground.body!.updateFromGameObject()

    const graphics = this.add.graphics()
    graphics.fillStyle(0x00ff00, 1)
    graphics.fillRect(0, 560, 800, 40)
    graphics.setDepth(1)
  }

  private createPlayer() {
    // プレイヤー（水色の正方形）
    this.player = this.physics.add.sprite(150, 520, '')
    this.player.setDisplaySize(30, 30)

    const graphics = this.add.graphics()
    graphics.fillStyle(0x00ffff, 1)
    graphics.fillRect(135, 505, 30, 30)
    graphics.setDepth(10)

    this.player.body!.setSize(30, 30)
    this.player.setBounce(0)
    this.player.setData('graphics', graphics)
  }

  private createObstacles() {
    this.obstacles = this.physics.add.group()
  }

  private spawnObstacle() {
    if (this.gameOver) return

    // ランダムな高さの障害物（赤い長方形）
    const height = Phaser.Math.Between(30, 80)
    const obstacle = this.obstacles!.create(850, 560 - height / 2, '')

    const graphics = this.add.graphics()
    graphics.fillStyle(0xff0000, 1)
    graphics.fillRect(850 - 15, 560 - height, 30, height)
    graphics.setDepth(5)

    obstacle.setDisplaySize(30, height)
    obstacle.body.setSize(30, height)
    obstacle.setVelocityX(-this.scrollSpeed)
    obstacle.setData('graphics', graphics)
    obstacle.setData('height', height)

    // ゲームが進むにつれてスピードアップ
    if (this.score > 500 && this.scrollSpeed < 400) {
      this.scrollSpeed += 20
    }
  }

  private jump() {
    if (this.gameOver) return

    // 地面にいるか、2段ジャンプ以内なら跳べる
    const onGround = this.player!.body!.touching.down
    if (onGround) {
      this.jumpCount = 0
    }

    if (this.jumpCount < this.maxJumps) {
      this.player?.setVelocityY(-400)
      this.jumpCount++
    }
  }

  private hitObstacle() {
    if (this.gameOver) return

    this.gameOver = true

    // プレイヤーを赤くする
    const playerGraphics = this.player?.getData('graphics')
    if (playerGraphics) {
      playerGraphics.clear()
      playerGraphics.fillStyle(0xff0000, 1)
      playerGraphics.fillRect(
        this.player!.x - 15,
        this.player!.y - 15,
        30,
        30
      )
    }

    this.player?.setVelocity(0, 0)

    // 障害物のスポーンを停止
    this.obstacleTimer?.destroy()

    // 全ての障害物を停止
    this.obstacles?.children.entries.forEach(obstacle => {
      const o = obstacle as Phaser.Physics.Arcade.Sprite
      o.setVelocityX(0)
    })

    // ゲームオーバー表示
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
    })
    gameOverText.setOrigin(0.5)
    gameOverText.setDepth(200)

    const finalScoreText = this.add.text(
      400,
      370,
      '到達距離: ' + this.score,
      {
        fontSize: '32px',
        color: '#ffffff',
      }
    )
    finalScoreText.setOrigin(0.5)
    finalScoreText.setDepth(200)

    const restartText = this.add.text(
      400,
      420,
      'クリックかタップで再スタート',
      {
        fontSize: '24px',
        color: '#ffffff',
      }
    )
    restartText.setOrigin(0.5)
    restartText.setDepth(200)

    // 再スタート処理
    this.input.once('pointerdown', () => {
      this.scene.restart()
    })
  }

  update() {
    if (this.gameOver) return

    // ジャンプ処理
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey!)) {
      this.jump()
    }

    // プレイヤーのグラフィックスを更新
    const playerGraphics = this.player?.getData('graphics')
    if (playerGraphics && this.player) {
      playerGraphics.clear()
      playerGraphics.fillStyle(0x00ffff, 1)
      playerGraphics.fillRect(
        this.player.x - 15,
        this.player.y - 15,
        30,
        30
      )
    }

    // 障害物のグラフィックスを更新と削除処理
    this.obstacles?.children.entries.forEach(obstacle => {
      const o = obstacle as Phaser.Physics.Arcade.Sprite
      if (o.x < -50) {
        const graphics = o.getData('graphics')
        if (graphics) graphics.destroy()
        o.destroy()
      } else {
        const graphics = o.getData('graphics')
        const height = o.getData('height')
        if (graphics) {
          graphics.clear()
          graphics.fillStyle(0xff0000, 1)
          graphics.fillRect(o.x - 15, 560 - height, 30, height)
        }
      }
    })
  }

  private handlePointerDown() {
    if (this.gameOver) return
    this.jump()
  }
}
