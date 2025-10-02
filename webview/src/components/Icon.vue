<template>
  <i
    :class="iconClasses"
    :style="iconStyle"
  ></i>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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

const iconClasses = computed(() => {
  const baseClasses = [props.className];

  if (props.type === 'mdi') {
    baseClasses.push('mdi', `mdi-${props.icon}`);
  } else {
    baseClasses.push('codicon', `codicon-${props.icon}`);
  }

  return baseClasses.filter(Boolean);
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
</style>