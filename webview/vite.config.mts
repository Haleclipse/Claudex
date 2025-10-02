import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  root: __dirname,
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'filter-mdi-fonts',
      generateBundle(options, bundle) {
        // 只保留 woff2 格式的 MDI 字体，删除其他格式
        for (const fileName of Object.keys(bundle)) {
          if (fileName.includes('materialdesignicons-webfont') && !fileName.endsWith('.woff2')) {
            delete bundle[fileName];
          }
        }
      },
    },
  ],
  resolve: {
    alias: {
      // 使用本地的 codicon 资源替换依赖包中的资源
      '@vscode/codicons/dist/codicon.css': path.resolve(__dirname, '../assets/codicons/codicon.css'),
      '@vscode/codicons/dist/codicon.ttf': path.resolve(__dirname, '../assets/codicons/codicon.ttf'),
    },
  },
  base: '',
  build: {
    outDir: path.resolve(__dirname, '../dist/media'),
    emptyOutDir: true,
    assetsDir: '',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          if (name.endsWith('.css')) return 'style.css';
          if (name.includes('materialdesignicons-webfont') && name.endsWith('.woff2')) {
            return 'materialicon.woff2';
          }
          return '[name][extname]';
        },
      },
    },
  },
}));
