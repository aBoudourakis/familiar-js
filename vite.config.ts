import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      root: resolve(__dirname, 'demo'),
      server: {
        open: true,
        port: process.env.PORT ? Number(process.env.PORT) : 5173,
        strictPort: true,
      },
    }
  }

  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'FamiliarJS',
        fileName: (format) => (format === 'es' ? 'familiar-js.js' : `familiar-js.${format}.cjs`),
        formats: ['es', 'umd'],
      },
      cssCodeSplit: false,
      sourcemap: true,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) =>
            assetInfo.name === 'style.css' ? 'familiar-js.css' : (assetInfo.name ?? 'assets/[name][extname]'),
        },
      },
    },
  }
})
