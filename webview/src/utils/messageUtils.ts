/**
 * 消息内容提取和处理工具函数
 */

import type {
  SDKMessage,
  SDKUserMessage,
  SDKAssistantMessage,
  SDKResultMessage,
  SDKSystemMessage,
  SDKCompactBoundaryMessage,
  SDKPartialAssistantMessage
} from '@anthropic-ai/claude-agent-sdk';

// 内容块类型定义
export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: any;
  content?: any;
  tool_use_id?: string;
}

// 消息类型枚举
export type MessageType =
  | 'user'
  | 'assistant_text'
  | 'assistant_tool_use'
  | 'assistant_mixed'
  | 'stream_event'
  | 'result'
  | 'system'
  | 'system_compact_boundary'
  | 'permission_request'
  | 'error';

/**
 * 从 SDK 消息中提取纯文本内容
 */
export function extractTextContent(message: SDKMessage): string {
  switch (message.type) {
    case 'user':
      return extractUserMessageText(message);
    case 'assistant':
      return extractAssistantMessageText(message);
    case 'result':
      return extractResultMessageText(message);
    case 'system':
      return extractSystemMessageText(message);
    case 'stream_event':
      return extractStreamEventText(message);
    default:
      return '';
  }
}

/**
 * 从 SDK 消息中提取内容块数组
 */
export function extractContentBlocks(message: SDKMessage): ContentBlock[] {
  switch (message.type) {
    case 'user':
      return extractUserContentBlocks(message);
    case 'assistant':
      return extractAssistantContentBlocks(message);
    case 'stream_event':
      return extractStreamContentBlocks(message);
    default:
      const text = extractTextContent(message);
      return text ? [{ type: 'text', text }] : [];
  }
}

/**
 * 获取消息的具体类型
 */
export function getMessageType(message: SDKMessage): MessageType {
  switch (message.type) {
    case 'user':
      return 'user';
    case 'assistant':
      return getAssistantMessageType(message);
    case 'stream_event':
      return 'stream_event';
    case 'result':
      return 'result';
    case 'system':
      // @ts-ignore - SDK types may have subtype
      return message.subtype === 'compact_boundary' ? 'system_compact_boundary' : 'system';
    default:
      return 'error';
  }
}

/**
 * 提取用户消息文本
 */
function extractUserMessageText(message: SDKUserMessage): string {
  const content = message.message.content;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join(' ');
  }

  return '';
}

/**
 * 提取助手消息文本
 */
function extractAssistantMessageText(message: SDKAssistantMessage): string {
  const content = message.message.content;

  if (Array.isArray(content)) {
    return content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join(' ');
  }

  return '';
}

/**
 * 提取结果消息文本
 */
function extractResultMessageText(message: SDKResultMessage): string {
  // @ts-ignore - result may have different structures
  if (message.subtype === 'success' && message.result) {
    return `任务完成 - ${message.result}`;
  }
  // @ts-ignore
  if (message.subtype === 'error_max_turns') {
    return '已达到最大对话轮次限制';
  }
  // @ts-ignore
  if (message.subtype === 'error_during_execution') {
    return '执行过程中发生错误';
  }
  return '任务结束';
}

/**
 * 提取系统消息文本
 */
function extractSystemMessageText(message: SDKMessage): string {
  if (message.type !== 'system') {
    return '';
  }

  // 类型守卫：检查是否为 SDKSystemMessage
  if (isSDKSystemMessage(message)) {
    const agentInfo = message.agents?.length ? `，启用代理：${message.agents.join(', ')}` : '';
    const toolInfo = message.tools?.length ? `，可用工具：${message.tools.join(', ')}` : '';
    return `系统初始化 - 模型: ${message.model || '未知'}${agentInfo}${toolInfo}`;
  }

  // 类型守卫：检查是否为 SDKCompactBoundaryMessage
  if (isSDKCompactBoundaryMessage(message)) {
    return '压缩边界标记';
  }

  return '系统消息';
}

/**
 * 类型守卫：检查是否为 SDKSystemMessage
 */
export function isSDKSystemMessage(message: SDKMessage): message is SDKSystemMessage {
  return message.type === 'system' && (message as any).subtype === 'init';
}

/**
 * 类型守卫：检查是否为 SDKCompactBoundaryMessage
 */
export function isSDKCompactBoundaryMessage(message: SDKMessage): message is SDKCompactBoundaryMessage {
  return message.type === 'system' && (message as any).subtype === 'compact_boundary';
}

/**
 * 提取流事件文本
 */
function extractStreamEventText(message: SDKPartialAssistantMessage): string {
  const event = message.event;

  // @ts-ignore - stream event structure
  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    return event.delta.text || '';
  }

  return '';
}

/**
 * 提取用户消息内容块
 */
function extractUserContentBlocks(message: SDKUserMessage): ContentBlock[] {
  const content = message.message.content;

  if (typeof content === 'string') {
    return [{ type: 'text', text: content }];
  }

  if (Array.isArray(content)) {
    return content.map((block: any) => {
      switch (block.type) {
        case 'text':
          return { type: 'text', text: block.text };
        case 'tool_result':
          return {
            type: 'tool_result',
            content: block.content,
            tool_use_id: block.tool_use_id,
            is_error: block.is_error
          };
        // 处理其他类型的内容块（如图片等）
        default:
          return { type: 'text', text: `[${block.type}]` };
      }
    });
  }

  return [];
}

/**
 * 提取助手消息内容块
 */
function extractAssistantContentBlocks(message: SDKAssistantMessage): ContentBlock[] {
  const content = message.message.content;

  if (!Array.isArray(content)) {
    return [];
  }

  return content.map((block: any) => {
    switch (block.type) {
      case 'text':
        return { type: 'text', text: block.text };
      case 'tool_use':
        return {
          type: 'tool_use',
          id: block.id,
          name: block.name,
          input: block.input
        };
      default:
        return { type: 'text', text: `[${block.type}]` };
    }
  });
}

/**
 * 提取流内容块
 */
function extractStreamContentBlocks(message: SDKPartialAssistantMessage): ContentBlock[] {
  const text = extractStreamEventText(message);
  return text ? [{ type: 'text', text }] : [];
}

/**
 * 获取助手消息的具体类型
 */
function getAssistantMessageType(message: SDKAssistantMessage): MessageType {
  const content = message.message.content;

  if (!Array.isArray(content)) {
    return 'assistant_text';
  }

  const hasText = content.some((block: any) => block.type === 'text');
  const hasToolUse = content.some((block: any) => block.type === 'tool_use');

  if (hasText && hasToolUse) {
    return 'assistant_mixed';
  } else if (hasToolUse) {
    return 'assistant_tool_use';
  } else {
    return 'assistant_text';
  }
}

/**
 * 获取消息的显示标题
 */
export function getMessageDisplayTitle(message: SDKMessage): string {
  switch (message.type) {
    case 'user':
      return '用户';
    case 'assistant':
      return 'Claude';
    case 'result':
      return '结果';
    case 'system':
      return '系统';
    case 'stream_event':
      return 'Claude';
    default:
      return '未知';
  }
}

/**
 * 检查消息是否可以编辑
 */
export function isMessageEditable(message: SDKMessage): boolean {
  return message.type === 'user';
}

/**
 * 检查消息是否正在流式传输
 */
export function isMessageStreaming(message: SDKMessage): boolean {
  return message.type === 'stream_event';
}

/**
 * 工具相关辅助函数
 */

/**
 * 获取工具的图标类名
 */
export function getToolIcon(toolName: string): string {
  const name = toolName.toLowerCase();

  const iconMap: Record<string, string> = {
    'bash': 'codicon-terminal',
    'read': 'codicon-eye-two',
    'write': 'codicon-edit',
    'edit': 'codicon-edit',
    'multiedit': 'codicon-edit',
    'glob': 'codicon-search',
    'grep': 'codicon-search',
    'task': 'codicon-play',
    'webfetch': 'codicon-globe',
    'websearch': 'codicon-search',
    'exitplanmode': 'codicon-checklist',
    'todowrite': 'codicon-list-unordered',
    'notebookedit': 'codicon-notebook'
  };

  return iconMap[name] || 'codicon-tools';
}

/**
 * 获取工具的描述
 */
export function getToolDescription(toolName: string): string {
  const name = toolName.toLowerCase();

  const descMap: Record<string, string> = {
    'bash': '执行命令',
    'read': '读取文件',
    'write': '写入文件',
    'edit': '编辑文件',
    'multiedit': '多重编辑',
    'glob': '文件匹配',
    'grep': '文本搜索',
    'task': '任务执行',
    'webfetch': '网页获取',
    'websearch': '网络搜索',
    'exitplanmode': '退出计划模式',
    'todowrite': '任务管理',
    'notebookedit': '笔记本编辑'
  };

  return descMap[name] || '';
}

/**
 * 检查是否为文件操作相关工具
 */
export function isFileOperationTool(toolName: string): boolean {
  const name = toolName.toLowerCase();
  return ['read', 'write', 'edit', 'multiedit', 'glob', 'notebookedit'].includes(name);
}

/**
 * 检查是否为搜索相关工具
 */
export function isSearchTool(toolName: string): boolean {
  const name = toolName.toLowerCase();
  return ['grep', 'websearch', 'glob'].includes(name);
}

/**
 * 检查是否为终端相关工具
 */
export function isTerminalTool(toolName: string): boolean {
  const name = toolName.toLowerCase();
  return ['bash'].includes(name);
}

/**
 * 格式化工具参数值
 */
export function formatToolParameterValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    // 限制字符串长度
    if (value.length > 100) {
      return value.substring(0, 97) + '...';
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.length <= 3) {
      return `[${value.map(formatToolParameterValue).join(', ')}]`;
    }
    return `[${value.slice(0, 2).map(formatToolParameterValue).join(', ')}, ... +${value.length - 2} more]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    if (keys.length <= 2) {
      return `{${keys.map(k => `${k}: ${formatToolParameterValue(value[k])}`).join(', ')}}`;
    }
    return `{${keys.slice(0, 1).map(k => `${k}: ${formatToolParameterValue(value[k])}`).join(', ')}, ... +${keys.length - 1} more}`;
  }
  return String(value);
}

/**
 * 检查参数值是否为简单类型（适合内联显示）
 */
export function isSimpleParameterValue(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'boolean' || typeof value === 'number') return true;
  if (typeof value === 'string') return value.length <= 100;
  return false;
}

/**
 * 获取参数值的 CSS 类名
 */
export function getParameterValueClass(value: any): string {
  if (typeof value === 'boolean') return 'param-boolean';
  if (typeof value === 'number') return 'param-number';
  if (typeof value === 'string') {
    if (value.startsWith('/') || value.includes('\\')) return 'param-path';
    if (value.includes('http://') || value.includes('https://')) return 'param-url';
    if (value.includes('git') || value.includes('.git')) return 'param-git';
  }
  return 'param-string';
}

/**
 * 获取消息的渲染组件类型
 */
export function getMessageComponentType(message: any): string {
  // 检查是否为权限请求消息
  if (message.metadata?.correlationId && message.metadata?.toolName) {
    return 'permission';
  }

  // 检查是否为错误消息
  if (message.role === 'error' || message.status === 'error' || message.metadata?.error) {
    return 'error';
  }

  // 基于 SDK 消息类型判断
  if (message.sdkMessage) {
    switch (message.sdkMessage.type) {
      case 'user':
        return 'user';
      case 'assistant':
        if (message.streaming) {
          return 'streaming';
        }
        // 检查是否包含多种内容类型
        if (message.contentBlocks && message.contentBlocks.length > 1) {
          const types = new Set(message.contentBlocks.map((block: ContentBlock) => block.type));
          if (types.size > 1) {
            return 'mixed';
          }
        }
        return 'text';
      case 'result':
        return 'result';
      case 'system':
        return 'system';
      case 'stream_event':
        return 'streaming';
      default:
        return 'unknown';
    }
  }

  // 基于角色判断
  switch (message.role) {
    case 'user':
      return 'user';
    case 'assistant':
      return message.streaming ? 'streaming' : 'text';
    case 'system':
      return 'system';
    default:
      return 'unknown';
  }
}