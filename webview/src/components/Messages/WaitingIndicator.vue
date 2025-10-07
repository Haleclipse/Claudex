<template>
  <div class="waiting-indicator" :data-permission-mode="permissionMode">
    <span class="icon" :style="{ fontSize: `${size}px` }">{{ currentIcon }}</span>
    <span class="text">{{ currentText }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  size?: number;
  permissionMode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  permissionMode: 'default'
});

// 图标动画序列 (使用官方数组)
const icons = ['\xB7', '\u2722', '*', '\u2736', '\u273B', '\u273D'];
const iconSequence = [...icons, ...[...icons].reverse()];

// 文本列表 (使用官方数组)
const texts = [
  'Accomplishing', 'Actioning', 'Actualizing', 'Baking', 'Booping', 'Brewing',
  'Calculating', 'Cerebrating', 'Channelling', 'Churning', 'Clauding', 'Coalescing',
  'Cogitating', 'Computing', 'Combobulating', 'Concocting', 'Considering', 'Contemplating',
  'Cooking', 'Crafting', 'Creating', 'Crunching', 'Deciphering', 'Deliberating',
  'Determining', 'Discombobulating', 'Doing', 'Effecting', 'Elucidating', 'Enchanting',
  'Envisioning', 'Finagling', 'Flibbertigibbeting', 'Forging', 'Forming', 'Frolicking',
  'Generating', 'Germinating', 'Hatching', 'Herding', 'Honking', 'Ideating',
  'Imagining', 'Incubating', 'Inferring', 'Manifesting', 'Marinating', 'Meandering',
  'Moseying', 'Mulling', 'Mustering', 'Musing', 'Noodling', 'Percolating',
  'Perusing', 'Philosophising', 'Pontificating', 'Pondering', 'Processing', 'Puttering',
  'Puzzling', 'Reticulating', 'Ruminating', 'Scheming', 'Schlepping', 'Shimmying',
  'Simmering', 'Smooshing', 'Spelunking', 'Spinning', 'Stewing', 'Sussing',
  'Synthesizing', 'Thinking', 'Tinkering', 'Transmuting', 'Unfurling', 'Unravelling',
  'Vibing', 'Wandering', 'Whirring', 'Wibbling', 'Working', 'Wrangling'
];

const maxTextLength = Math.max(...texts.map(t => t.length));

// 当前状态
const currentIcon = ref(iconSequence[0]);
const currentText = ref('');

let iconTimer: number | null = null;
let textTimer: number | null = null;
let iconIndex = 0;
let textChangeCount = 0;

// 随机选择文本
function randomText(): string {
  return texts[Math.floor(Math.random() * texts.length)];
}

// 填充文本到固定长度
function padText(text: string, length: number): string {
  return (text + '...').padEnd(length + 3, ' ');
}

// 图标动画
function startIconAnimation() {
  iconTimer = window.setInterval(() => {
    iconIndex = (iconIndex + 1) % iconSequence.length;
    currentIcon.value = iconSequence[iconIndex];
  }, 120);
}

// 文本动画
function startTextAnimation() {
  // 初始文本
  currentText.value = padText(randomText(), maxTextLength);

  const updateText = () => {
    textChangeCount++;
    currentText.value = padText(randomText(), maxTextLength);

    // 动态间隔时间
    const delays = [2000, 3000, 5000];
    const delay = textChangeCount < delays.length ? delays[textChangeCount] : 5000;

    textTimer = window.setTimeout(updateText, delay);
  };

  textTimer = window.setTimeout(updateText, 2000);
}

onMounted(() => {
  startIconAnimation();
  startTextAnimation();
});

onUnmounted(() => {
  if (iconTimer !== null) {
    clearInterval(iconTimer);
  }
  if (textTimer !== null) {
    clearTimeout(textTimer);
  }
});
</script>

<style scoped>
.waiting-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: var(--vscode-foreground);
  opacity: 0.8;
}

.icon {
  flex-shrink: 0;
  font-weight: 400;
  line-height: 1;
  color: #ce7e5d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  text-align: center;
}

.text {
  font-family: var(--vscode-font-family);
  font-size: 0.95em;
  white-space: pre;
  font-weight: 600;
}

.waiting-indicator[data-permission-mode="default"] {
  /* 可以根据 permission mode 调整样式 */
}
</style>
