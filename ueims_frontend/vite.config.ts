import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // sockjs-client references the Node-only `global` identifier; alias it
  // to `globalThis` so the bundled code runs in the browser.
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'dayjs',
      'framer-motion',
      'sockjs-client',
      '@stomp/stompjs',
    ],
  },
})
