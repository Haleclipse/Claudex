<template>
  <span v-if="useLocalSvg" :class="svgWrapperClasses" :style="iconStyle" aria-hidden="true">
    <svg class="icon-svg" focusable="false">
      <use :href="`#${localSymbolId}`" />
    </svg>
  </span>
  <i v-else :class="iconClasses" :style="iconStyle"></i>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ids from 'virtual:svg-icons-names';

type IconType = 'codicon' | 'mdi';

interface Props {
  icon: string;
  type?: IconType;
  size?: number | string;
  color?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'codicon',
  size: 16
});

// 由 vite-plugin-svg-icons 注入的本地图标名（含 symbolId 前缀）
const svgNames = new Set(ids);
const svgPrefix = 'icon-';

function resolveLocalId(name: string): string | '' {
  const candidates: string[] = [];
  const base = name.trim();
  // 1) 原名
  candidates.push(`${svgPrefix}${base}`);
  // 2) language- 前缀 -> 直接名
  if (base.startsWith('language-')) {
    candidates.push(`${svgPrefix}${base.replace(/^language-/, '')}`);
  }
  // 3) file- 前缀 -> 去掉前缀；去掉 -box 后缀
  if (base.startsWith('file-')) {
    const stripped = base.replace(/^file-/, '').replace(/-box$/, '');
    candidates.push(`${svgPrefix}${stripped}`);
  }
  // 4) folder- 前缀 -> 去掉前缀
  if (base.startsWith('folder-')) {
    candidates.push(`${svgPrefix}${base.replace(/^folder-/, '')}`);
  }
  // 5) 常见别名
  const aliasMap: Record<string, string> = {
    'microsoft-visual-studio-code': 'vscode',
  };
  if (aliasMap[base]) {
    candidates.push(`${svgPrefix}${aliasMap[base]}`);
  }

  for (const id of candidates) {
    if (svgNames.has(id)) return id;
  }
  return '';
}

const iconClasses = computed(() => {
  const baseClasses = [props.className];

  if (props.type === 'mdi') {
    baseClasses.push('mdi', `mdi-${props.icon}`);
  } else {
    baseClasses.push('codicon', `codicon-${props.icon}`);
  }

  return baseClasses.filter(Boolean);
});

// 本地 SVG 是否可用及其 symbolId
const localSymbolId = computed(() => {
  if (props.type !== 'mdi') return '';
  const name = String(props.icon || '').trim();
  return resolveLocalId(name);
});

const useLocalSvg = computed(() => !!localSymbolId.value);

const svgWrapperClasses = computed(() => {
  const classes = [props.className];
  if (props.type === 'mdi') classes.push('mdi');
  return classes.filter(Boolean);
});

const iconStyle = computed(() => {
  const style: Record<string, any> = {
    fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
    lineHeight: 1,
    display: 'inline-block',
    verticalAlign: 'middle'
  };

  // 只有当明确传入颜色时才添加 color 属性
  if (props.color) {
    style.color = props.color;
  }

  return style;
});
</script>

<style scoped>
.codicon,
.mdi {
  transition: color 0.2s ease;
}

.icon-svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
  display: inline-block;
  vertical-align: middle;
}
</style>
