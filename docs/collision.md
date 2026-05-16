# collision

`src/game/collision.ts` の `resolveCollisions(player, nextX, nextY, rects) → ResolveResult`。

## アプローチ

- 純 AABB
- X 軸 → Y 軸 の順で個別に解決する分離軸方式
- `velocity` の符号で押し戻し方向を決める

### X 軸の解決

```
aabbX = playerAABBAt(nextX, currentY)
overlap している rect があれば:
  velocity.x > 0 → resolvedX = rect.x - playerW/2
  velocity.x < 0 → resolvedX = rect.x + rect.width + playerW/2
  velocity.x = 0
  hitWall = true
```

### Y 軸の解決

```
aabbY = playerAABBAt(resolvedX, nextY)
overlap している rect があれば:
  velocity.y > 0 → resolvedY = rect.y - playerH/2 (床に着地)
                  isOnGround = true
  velocity.y < 0 → resolvedY = rect.y + rect.height + playerH/2 (天井ヒット)
                  hitCeiling = true
  velocity.y = 0
```

## 既知の制約

- 高速移動 (1 フレームの移動量 > プラットフォーム厚) ですり抜ける可能性あり
  - 現状の `maxMoveSpeed` / `maxFallSpeed` と 60fps では発生しないが、フレームレートが極端に低下すると顕在化
  - 必要になったら sweep test を入れる
- one-way platform (下から飛び乗れる床) は未対応
- 斜面 (傾斜地形) は未対応

## テスト

`src/game/collision.test.ts` に 5 ケース。
