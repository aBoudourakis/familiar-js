import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      root: resolve(__dirname, 'demo'),
      server: {
        open: true,
      },
    }
  }

  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'ClipJS',
        fileName: (format) => (format === 'es' ? 'clip-js.js' : `clip-js.${format}.cjs`),
        formats: ['es', 'umd'],
      },
      cssCodeSplit: false,
      sourcemap: true,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) =>
            assetInfo.name === 'style.css' ? 'clip-js.css' : (assetInfo.name ?? 'assets/[name][extname]'),
        },
      },
    },
  }
})
