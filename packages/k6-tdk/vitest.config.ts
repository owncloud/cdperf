import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: [
      'config/vitest.mocks.ts'
    ],
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    alias: {
      '@': '/src'
    }
  },
})
