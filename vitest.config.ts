import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    dedupe: ['next'],
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
