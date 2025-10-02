<template>
  <div class="text-block">
    <div class="text-content" v-html="formattedText"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import type { ContentBlock } from '../../../../types/messages';

interface Props {
  block: ContentBlock;
  streaming?: boolean;
}

const props = defineProps<Props>();

// 配置 marked
marked.setOptions({
  breaks: true,        // 支持 GFM 换行
  gfm: true,          // 启用 GitHub Flavored Markdown
  headerIds: false,   // 不生成标题 ID
  mangle: false,      // 不混淆邮箱地址
});

const formattedText = computed(() => {
  if (!props.block.text) return '';

  try {
    // 使用 marked 解析 markdown
    return marked.parse(props.block.text, { async: false }) as string;
  } catch (error) {
    console.error('Markdown 解析失败:', error);
    // 降级：返回纯文本
    return props.block.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
});
</script>

<style scoped>
.text-block {
  word-wrap: break-word;
  line-height: 1.5;
}

.text-content {
  /* marked 生成的 HTML 将使用父组件 (AssistantMessage) 的 markdown 样式 */
  user-select: text;
}
</style>