import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { devApi } from './server/devApi'

export default defineConfig(({ mode }) => {
  // Server-only secrets (PINATA_JWT, DESK_WEBHOOK_URL) for the dev API handlers
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), nodePolyfills({ include: ['buffer', 'crypto', 'stream', 'util'] }), devApi()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    build: {
      chunkSizeWarningLimit: 1600,
    },
  }
})
