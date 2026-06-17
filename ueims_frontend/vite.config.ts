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
  build: {
    // antd's full bundle is ~1.2MB minified; the project tree-shakes
    // poorly because ~50 files `import { ... } from 'antd'`. We accept
    // the larger chunk in exchange for simpler build configuration.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'charts-vendor': ['recharts'],
          'socket-vendor': ['sockjs-client', '@stomp/stompjs'],
          'motion-vendor': ['framer-motion'],
          'utils-vendor': ['dayjs', 'axios', 'i18next', 'react-i18next'],
        },
      },
    },
  },
})
