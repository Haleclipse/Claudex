import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig(({ mode }) => ({
  root: __dirname,
  plugins: [
    vue(),
    tailwindcss(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, '../assets/icons')],
      symbolId: 'icon-[name]',
      svgoOptions: true,
    }),
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
    {
      name: 'copy-svg-icons-to-media',
      apply: 'build',
      async writeBundle(options, bundle) {
        const srcDir = path.resolve(__dirname, '../assets/icons');
        const outDir = (options as any).dir || path.resolve(__dirname, '../dist/media');
        const destDir = path.resolve(outDir, 'icons');

        async function ensureDir(dir: string) {
          await fsp.mkdir(dir, { recursive: true });
        }

        async function copyDir(src: string, dest: string) {
          await ensureDir(dest);
          const entries = await fsp.readdir(src, { withFileTypes: true });
          for (const entry of entries) {
            const s = path.join(src, entry.name);
            const d = path.join(dest, entry.name);
            if (entry.isDirectory()) {
              await copyDir(s, d);
            } else if (entry.isFile()) {
              await fsp.copyFile(s, d);
            }
          }
        }

        if (fs.existsSync(srcDir)) {
          await copyDir(srcDir, destDir);
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
