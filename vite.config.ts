import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/metronic8/react/demo1/",
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['abs-percent', 'color-functions', 'global-builtin', 'if-function', 'import'],
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
})
