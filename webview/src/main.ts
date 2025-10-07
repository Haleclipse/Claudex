import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import '@vscode/codicons/dist/codicon.css';
import '@mdi/font/css/materialdesignicons.min.css';
import 'virtual:svg-icons-register';

declare global {
  interface Window { acquireVsCodeApi?: <T = unknown>() => { postMessage(data: T): void; getState(): any; setState(data: any): void }; }
}

// VSCode API 现在通过 messageBus 统一处理

// 移除旧的消息处理逻辑，现在统一使用messageBus

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#app');

// UI ready notification is now handled by messageBus automatically
