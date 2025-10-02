<template>
  <div class="icon-test-page">
    <div class="page-header">
      <h1>Material Design Icons - 编程语言图标展示</h1>
      <p>展示 @mdi/font 包中的编程语言和开发相关图标</p>
    </div>

    <div class="icon-grid">
      <div
        v-for="icon in programmingIcons"
        :key="icon.name"
        class="icon-item"
      >
        <div class="icon-container">
          <Icon
            type="mdi"
            :icon="icon.icon"
            :size="32"
          />
        </div>
        <div class="icon-info">
          <div class="icon-name">{{ icon.name }}</div>
          <div class="icon-class">mdi-{{ icon.icon }}</div>
        </div>
      </div>
    </div>

    <div class="folder-section">
      <h2>VS Code 图标 (Codicons)</h2>
      <div class="icon-grid">
        <div
          v-for="icon in codiconIcons"
          :key="icon.name"
          class="icon-item"
        >
          <div class="icon-container">
            <Icon
              type="codicon"
              :icon="icon.icon"
              :size="32"
            />
          </div>
          <div class="icon-info">
            <div class="icon-name">{{ icon.name }}</div>
            <div class="icon-class">codicon-{{ icon.icon }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="folder-section">
      <h2>文件夹和通用图标 (MDI)</h2>
      <div class="icon-grid">
        <div
          v-for="icon in folderIcons"
          :key="icon.name"
          class="icon-item"
        >
          <div class="icon-container">
            <Icon
              type="mdi"
              :icon="icon.icon"
              :size="32"
            />
          </div>
          <div class="icon-info">
            <div class="icon-name">{{ icon.name }}</div>
            <div class="icon-class">mdi-{{ icon.icon }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="folder-section">
      <h2>图标着色示例</h2>
      <div class="color-grid">
        <div class="color-demo">
          <h3>编程语言着色</h3>
          <div class="color-icons">
            <Icon type="mdi" icon="vuejs" :size="48" color="#4FC08D" />
            <Icon type="mdi" icon="react" :size="48" color="#61DAFB" />
            <Icon type="mdi" icon="angular" :size="48" color="#DD0031" />
            <Icon type="mdi" icon="language-typescript" :size="48" color="#3178C6" />
            <Icon type="mdi" icon="language-javascript" :size="48" color="#F7DF1E" />
          </div>
        </div>
        <div class="color-demo">
          <h3>状态指示着色</h3>
          <div class="color-icons">
            <Icon type="codicon" icon="check" :size="32" color="#28a745" />
            <Icon type="codicon" icon="warning" :size="32" color="#ffc107" />
            <Icon type="codicon" icon="error" :size="32" color="#dc3545" />
            <Icon type="codicon" icon="info" :size="32" color="#17a2b8" />
            <Icon type="mdi" icon="loading" :size="32" color="#6c757d" />
          </div>
        </div>
        <div class="color-demo">
          <h3>主题色示例</h3>
          <div class="color-icons">
            <Icon type="mdi" icon="heart" :size="32" color="#e91e63" />
            <Icon type="mdi" icon="star" :size="32" color="#ff9800" />
            <Icon type="mdi" icon="thumb-up" :size="32" color="#4caf50" />
            <Icon type="mdi" icon="bookmark" :size="32" color="#9c27b0" />
            <Icon type="mdi" icon="shield-check" :size="32" color="#00bcd4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Icon from '../components/Icon.vue';

// 编程语言和文件类型图标
const programmingIcons = ref([
  // Web 技术
  { name: 'JavaScript', icon: 'language-javascript' },
  { name: 'TypeScript', icon: 'language-typescript' },
  { name: 'Vue.js', icon: 'vuejs' },
  { name: 'React', icon: 'react' },
  { name: 'Angular', icon: 'angular' },
  { name: 'HTML5', icon: 'language-html5' },
  { name: 'CSS3', icon: 'language-css3' },
  { name: 'Sass', icon: 'sass' },
  { name: 'Less', icon: 'language-css3' },

  // 后端语言
  { name: 'Python', icon: 'language-python' },
  { name: 'Java', icon: 'language-java' },
  { name: 'C#', icon: 'language-csharp' },
  { name: 'C++', icon: 'language-cpp' },
  { name: 'C', icon: 'language-c' },
  { name: 'Go', icon: 'language-go' },
  { name: 'Rust', icon: 'language-rust' },
  { name: 'PHP', icon: 'language-php' },
  { name: 'Ruby', icon: 'language-ruby' },
  { name: 'Swift', icon: 'language-swift' },
  { name: 'Kotlin', icon: 'language-kotlin' },
  { name: 'Dart', icon: 'language-dart' },

  // 函数式语言
  { name: 'Haskell', icon: 'language-haskell' },
  { name: 'F#', icon: 'language-fsharp' },
  { name: 'Scala', icon: 'file-code' },
  { name: 'Clojure', icon: 'file-code' },

  // 数据库
  { name: 'SQL', icon: 'database' },
  { name: 'MongoDB', icon: 'database' },
  { name: 'PostgreSQL', icon: 'database' },

  // 配置文件
  { name: 'JSON', icon: 'code-json' },
  { name: 'YAML', icon: 'file-code' },
  { name: 'XML', icon: 'file-xml' },
  { name: 'Docker', icon: 'docker' },

  // 文档格式
  { name: 'Markdown', icon: 'language-markdown' },
  { name: 'LaTeX', icon: 'file-document' },

  // 工具和框架
  { name: 'Node.js', icon: 'nodejs' },
  { name: 'NPM', icon: 'npm' },
  { name: 'Webpack', icon: 'webpack' },
  { name: 'Vite', icon: 'lightning-bolt' },
  { name: 'Git', icon: 'git' },
  { name: 'GitHub', icon: 'github' },
  { name: 'GitLab', icon: 'gitlab' },
  { name: 'VS Code', icon: 'microsoft-visual-studio-code' },
]);

// VS Code Codicons
const codiconIcons = ref([
  { name: '文件', icon: 'file' },
  { name: '文件夹', icon: 'folder' },
  { name: '设置', icon: 'settings-gear' },
  { name: '搜索', icon: 'search' },
  { name: '源代码管理', icon: 'source-control' },
  { name: '调试', icon: 'debug-alt' },
  { name: '扩展', icon: 'extensions' },
  { name: '终端', icon: 'terminal' },
  { name: '问题', icon: 'warning' },
  { name: '输出', icon: 'output' },
  { name: '通知', icon: 'bell' },
  { name: '同步', icon: 'sync' },
  { name: '账户', icon: 'account' },
  { name: '管理', icon: 'gear' },
  { name: '运行', icon: 'play' },
  { name: '停止', icon: 'stop' },
  { name: '新建', icon: 'add' },
  { name: '删除', icon: 'trash' },
  { name: '刷新', icon: 'refresh' },
  { name: '保存', icon: 'save' },
]);

// 文件夹图标
const folderIcons = ref([
  { name: '文件夹', icon: 'folder' },
  { name: '打开文件夹', icon: 'folder-open' },
  { name: '源代码', icon: 'folder-cog' },
  { name: '组件', icon: 'folder-multiple' },
  { name: '页面', icon: 'folder-text' },
  { name: '资源', icon: 'folder-image' },
  { name: '样式', icon: 'folder-star' },
  { name: '工具', icon: 'folder-wrench' },
  { name: '服务', icon: 'folder-network' },
  { name: '类型', icon: 'folder-table' },
  { name: 'API', icon: 'api' },
  { name: '配置', icon: 'cog' },
  { name: '测试', icon: 'test-tube' },
  { name: '文档', icon: 'file-document-multiple' },
  { name: '构建', icon: 'hammer' },
  { name: '部署', icon: 'rocket-launch' },
  { name: '下载', icon: 'download' },
  { name: '上传', icon: 'upload' },
  { name: '锁定', icon: 'lock' },
  { name: '公共', icon: 'web' },
]);
</script>

<style scoped>
.icon-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--vscode-editor-foreground);
  overflow: auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--vscode-titleBar-activeForeground);
}

.page-header p {
  margin: 0;
  color: var(--vscode-descriptionForeground);
  font-size: 14px;
}

.folder-section {
  margin-top: 40px;
}

.folder-section h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--vscode-titleBar-activeForeground);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  background: var(--vscode-editor-background);
  transition: all 0.2s ease;
  cursor: default;
}

.icon-item:hover {
  border-color: var(--vscode-focusBorder);
  background: var(--vscode-list-hoverBackground);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-container {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.icon-info {
  text-align: center;
  width: 100%;
}

.icon-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--vscode-editor-foreground);
  margin-bottom: 2px;
  word-break: break-word;
}

.icon-class {
  font-size: 10px;
  color: var(--vscode-descriptionForeground);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  opacity: 0.8;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.color-demo {
  padding: 20px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 8px;
  background: var(--vscode-editor-background);
}

.color-demo h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--vscode-titleBar-activeForeground);
}

.color-icons {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.color-icons > * {
  transition: transform 0.2s ease;
}

.color-icons > *:hover {
  transform: scale(1.1);
}
</style>