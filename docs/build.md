# build

## 必要環境

- Node.js 18 以上
- npm (volta 経由を推奨)

## スクリプト

| コマンド             | 内容                                                  |
| -------------------- | ----------------------------------------------------- |
| `npm run dev`        | Vite dev server (port 3000、`/endroll-jumpers/` 配下) |
| `npm run build`      | `tsc --noEmit` の後 `vite build` → `dist/`            |
| `npm run preview`    | `dist/` をローカルで配信して動作確認                  |
| `npm run typecheck`  | `tsc --noEmit` のみ                                   |
| `npm run lint`       | ESLint                                                |
| `npm run lint:fix`   | ESLint --fix                                          |
| `npm run test`       | vitest run                                            |
| `npm run test:watch` | vitest watch                                          |
| `npm run format`     | Prettier (`src/**/*.ts`)                              |

## 公開先

`vite.config.ts` の `base: '/endroll-jumpers/'` で配置先を固定。`https://kako-jun.github.io/endroll-jumpers/` または `https://endroll-jumpers.llll-ll.com` を想定。

## CI

- Husky + lint-staged で pre-commit に ESLint + Prettier
- GitHub Actions: `.github/workflows/` 配下 (移植直後でまだ未確認、デプロイ時に要点検)
