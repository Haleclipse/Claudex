<template>
  <Icon
    :type="iconType"
    :icon="iconName"
    :size="size"
    :color="iconColor"
    :class-name="props.className"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';

interface Props {
  fileName: string;
  size?: number | string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 16
});

// 文件扩展名到图标的映射
// 优先使用本地SVG (type: 'mdi'),由Icon组件自动检测并使用本地symbol
const fileIconMap: Record<string, { type: 'mdi' | 'codicon'; icon: string; color?: string }> = {
  // Notebook
  'ipynb': { type: 'mdi', icon: 'jupyter' },

  // Web 技术
  'js': { type: 'mdi', icon: 'javascript' },
  'jsx': { type: 'mdi', icon: 'react' },
  'ts': { type: 'mdi', icon: 'typescript' },
  'tsx': { type: 'mdi', icon: 'react' },
  'vue': { type: 'mdi', icon: 'vue' },
  'html': { type: 'mdi', icon: 'html' },
  'css': { type: 'mdi', icon: 'css' },
  'scss': { type: 'mdi', icon: 'sass' },
  'sass': { type: 'mdi', icon: 'sass' },
  'less': { type: 'mdi', icon: 'less' },

  // 后端语言
  'py': { type: 'mdi', icon: 'python' },
  'java': { type: 'mdi', icon: 'java' },
  'cs': { type: 'mdi', icon: 'csharp' },
  'cpp': { type: 'mdi', icon: 'cpp' },
  'c': { type: 'mdi', icon: 'c' },
  'h': { type: 'mdi', icon: 'c' },
  'go': { type: 'mdi', icon: 'go' },
  'rs': { type: 'mdi', icon: 'rust' },
  'php': { type: 'mdi', icon: 'php' },
  'rb': { type: 'mdi', icon: 'ruby' },
  'swift': { type: 'mdi', icon: 'swift' },
  'kt': { type: 'mdi', icon: 'kotlin' },
  'dart': { type: 'mdi', icon: 'dart' },

  // 函数式语言
  'hs': { type: 'mdi', icon: 'haskell' },
  'fs': { type: 'mdi', icon: 'fsharp' },
  'scala': { type: 'mdi', icon: 'scala' },
  'clj': { type: 'mdi', icon: 'clojure' },
  'ex': { type: 'mdi', icon: 'elixir' },
  'exs': { type: 'mdi', icon: 'elixir' },
  'elm': { type: 'mdi', icon: 'elm' },
  'erl': { type: 'mdi', icon: 'erlang' },

  // 其他编程语言
  'lua': { type: 'mdi', icon: 'lua' },
  'r': { type: 'mdi', icon: 'r' },
  'jl': { type: 'mdi', icon: 'julia' },
  'pl': { type: 'mdi', icon: 'perl' },
  'ps1': { type: 'mdi', icon: 'powershell' },
  'sh': { type: 'mdi', icon: 'shell' },
  'bash': { type: 'mdi', icon: 'shell' },
  'zsh': { type: 'mdi', icon: 'shell' },
  'fish': { type: 'mdi', icon: 'shell' },
  'asm': { type: 'mdi', icon: 'assembly' },
  's': { type: 'mdi', icon: 'assembly' },
  'sol': { type: 'mdi', icon: 'solidity' },
  'zig': { type: 'mdi', icon: 'zig' },
  'cr': { type: 'mdi', icon: 'crystal' },
  'coffee': { type: 'mdi', icon: 'coffee' },
  'groovy': { type: 'mdi', icon: 'groovy' },
  'hx': { type: 'mdi', icon: 'haxe' },
  'reason': { type: 'mdi', icon: 'reason' },
  're': { type: 'mdi', icon: 'reason' },
  'mat': { type: 'mdi', icon: 'matlab' },
  'm': { type: 'mdi', icon: 'matlab' },
  'tex': { type: 'mdi', icon: 'tex' },
  'latex': { type: 'mdi', icon: 'tex' },

  // 配置文件
  'json': { type: 'mdi', icon: 'json' },
  'yaml': { type: 'mdi', icon: 'yaml' },
  'yml': { type: 'mdi', icon: 'yaml' },
  'xml': { type: 'mdi', icon: 'xml' },
  'toml': { type: 'mdi', icon: 'toml' },
  'ini': { type: 'mdi', icon: 'settings' },
  'env': { type: 'mdi', icon: 'tune' },

  // 文档格式
  'md': { type: 'mdi', icon: 'markdown' },
  'mdx': { type: 'mdi', icon: 'markdown' },
  'txt': { type: 'mdi', icon: 'document' },
  'pdf': { type: 'mdi', icon: 'pdf' },
  'doc': { type: 'mdi', icon: 'word' },
  'docx': { type: 'mdi', icon: 'word' },

  // 数据库
  'sql': { type: 'mdi', icon: 'database' },
  'db': { type: 'mdi', icon: 'database' },
  'sqlite': { type: 'mdi', icon: 'database' },

  // 图片
  'png': { type: 'mdi', icon: 'image' },
  'jpg': { type: 'mdi', icon: 'image' },
  'jpeg': { type: 'mdi', icon: 'image' },
  'gif': { type: 'mdi', icon: 'image' },
  'svg': { type: 'mdi', icon: 'svg' },
  'webp': { type: 'mdi', icon: 'image' },
  'ico': { type: 'mdi', icon: 'image' },

  // 压缩文件
  'zip': { type: 'mdi', icon: 'zip' },
  'tar': { type: 'mdi', icon: 'zip' },
  'gz': { type: 'mdi', icon: 'zip' },
  'rar': { type: 'mdi', icon: 'zip' },
  '7z': { type: 'mdi', icon: 'zip' },

  // Docker & CI/CD
  'dockerfile': { type: 'mdi', icon: 'docker' },
  'dockerignore': { type: 'mdi', icon: 'docker' },

  // Git
  'gitignore': { type: 'mdi', icon: 'git' },
  'gitattributes': { type: 'mdi', icon: 'git' },

  // Package managers
  'npmrc': { type: 'mdi', icon: 'npm' },
  'package.json': { type: 'mdi', icon: 'npm' },
  'package-lock.json': { type: 'mdi', icon: 'npm' },
  'yarn.lock': { type: 'mdi', icon: 'yarn' },
  'pnpm-lock.yaml': { type: 'mdi', icon: 'pnpm' },

  // Build tools
  'webpack.config.js': { type: 'mdi', icon: 'webpack' },
  'vite.config.ts': { type: 'mdi', icon: 'vite' },
  'vite.config.js': { type: 'mdi', icon: 'vite' },
  'rollup.config.js': { type: 'mdi', icon: 'rollup' },

  // 前端框架
  'svelte': { type: 'mdi', icon: 'svelte' },
  'astro': { type: 'mdi', icon: 'astro' },
  'pug': { type: 'mdi', icon: 'pug' },
  'styl': { type: 'mdi', icon: 'stylus' },

  // 配置和工具文件
  '.eslintrc': { type: 'mdi', icon: 'eslint' },
  '.eslintrc.js': { type: 'mdi', icon: 'eslint' },
  '.eslintrc.json': { type: 'mdi', icon: 'eslint' },
  'eslint.config.js': { type: 'mdi', icon: 'eslint' },
  '.prettierrc': { type: 'mdi', icon: 'prettier' },
  '.prettierrc.json': { type: 'mdi', icon: 'prettier' },
  'prettier.config.js': { type: 'mdi', icon: 'prettier' },
  '.editorconfig': { type: 'mdi', icon: 'editorconfig' },
  'babel.config.js': { type: 'mdi', icon: 'babel' },
  '.babelrc': { type: 'mdi', icon: 'babel' },
  'jest.config.js': { type: 'mdi', icon: 'jest' },
  'vitest.config.ts': { type: 'mdi', icon: 'vitest' },
  'prisma.schema': { type: 'mdi', icon: 'prisma' },
  '.travis.yml': { type: 'mdi', icon: 'travis' },
  'vercel.json': { type: 'mdi', icon: 'vercel' },
  'deno.json': { type: 'mdi', icon: 'deno' },
  'deno.jsonc': { type: 'mdi', icon: 'deno' },

  // 后端框架配置
  'requirements.txt': { type: 'mdi', icon: 'python' },
  'Gemfile': { type: 'mdi', icon: 'ruby' },
  'go.mod': { type: 'mdi', icon: 'go' },
  'Cargo.toml': { type: 'mdi', icon: 'rust' },
  'build.gradle': { type: 'mdi', icon: 'gradle' },
  'pom.xml': { type: 'mdi', icon: 'java' },

  // VS Code
  'code-workspace': { type: 'mdi', icon: 'vscode' },
};

// 获取文件扩展名
const fileExtension = computed(() => {
  const fileName = (props.fileName || '').toLowerCase();

  // 特殊文件名匹配
  const specialFiles: Record<string, string> = {
    'dockerfile': 'dockerfile',
    '.dockerignore': 'dockerignore',
    '.gitignore': 'gitignore',
    '.gitattributes': 'gitattributes',
    '.npmrc': 'npmrc',
    'package.json': 'package.json',
    'package-lock.json': 'package-lock.json',
    'yarn.lock': 'yarn.lock',
    'pnpm-lock.yaml': 'pnpm-lock.yaml',
    'webpack.config.js': 'webpack.config.js',
    'vite.config.ts': 'vite.config.ts',
    'vite.config.js': 'vite.config.ts',
    'rollup.config.js': 'rollup.config.js',
    '.eslintrc': '.eslintrc',
    '.eslintrc.js': '.eslintrc.js',
    '.eslintrc.json': '.eslintrc.json',
    'eslint.config.js': 'eslint.config.js',
    '.prettierrc': '.prettierrc',
    '.prettierrc.json': '.prettierrc.json',
    'prettier.config.js': 'prettier.config.js',
    '.editorconfig': '.editorconfig',
    'babel.config.js': 'babel.config.js',
    '.babelrc': '.babelrc',
    'jest.config.js': 'jest.config.js',
    'vitest.config.ts': 'vitest.config.ts',
    'prisma.schema': 'prisma.schema',
    '.travis.yml': '.travis.yml',
    'vercel.json': 'vercel.json',
    'deno.json': 'deno.json',
    'deno.jsonc': 'deno.jsonc',
    'requirements.txt': 'requirements.txt',
    'gemfile': 'Gemfile',
    'go.mod': 'go.mod',
    'cargo.toml': 'Cargo.toml',
    'build.gradle': 'build.gradle',
    'pom.xml': 'pom.xml',
  };

  // 检查特殊文件名
  const baseName = fileName.split('/').pop() || '';
  if (specialFiles[baseName]) {
    return specialFiles[baseName];
  }

  // 提取扩展名
  const parts = baseName.split('.');
  if (parts.length > 1) {
    return parts.pop() || '';
  }

  return '';
});

// 获取图标配置
const iconConfig = computed(() => {
  const ext = fileExtension.value;
  return fileIconMap[ext] || { type: 'mdi' as const, icon: 'file' };
});

const iconType = computed(() => iconConfig.value.type);
const iconName = computed(() => iconConfig.value.icon);
const iconColor = computed(() => iconConfig.value.color);
</script>
