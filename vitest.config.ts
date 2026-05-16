import { defineConfig } from 'vitest/config'

// terrain.test.ts が ImageData リテラルを使うため、jsdom 環境を有効化。
// 他のテストは pure な計算なので node 環境でも動くが、統一して jsdom にする。
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
