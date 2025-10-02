// 新的 Webview 消息类型定义
// 完全基于 Extension 端的 ClaudeClient 消息协议

// 从 SDK 导入消息类型
import type { 
  SDKMessage,
  SDKMessageBase,
  SDKUserMessage,
  SDKAssistantMessage,
  SDKResultMessage,
  SDKSystemMessage,
  SDKPartialAssistantMessage,
  SDKCompactBoundaryMessage
} from '@anthropic-ai/claude-code';

// VSCode API接口
export interface VSCodeAPI {
  postMessage(data: any): void;
  getState(): any;
  setState(data: any): void;
}

// 基础消息接口
export interface BaseMessage {
  type: string;
  timestamp?: number;
  uuid?: string;
  payload?: any;
  metadata?: {
    version: string;
    source: 'extension' | 'webview';
    timestamp: number;
    sequence?: number;
  };
}

// ========== Extension → Webview 消息类型 ==========

export interface ClaudeEventMessage extends Omit<BaseMessage, 'timestamp' | 'uuid'> {
  type: 'claude/event';
  payload: ({
    kind: 'user' | 'assistant' | 'result' | 'system' | 'stream_event';
    message: SDKMessage;
  } | {
    kind: 'permission_request';
    toolName: string;
    input: any;
    toolUseId: string;
    suggestions?: any;
    message?: SDKMessage;
  } | {
    kind: 'error';
    message: string;
  });
  timestamp: number;
  uuid: string;
}

export interface SessionListMessage extends BaseMessage {
  type: 'session/list';
  payload: {
    sessions: Array<{
      id: string;
      label: string;
      timestamp: Date;
      messages: SDKMessage[];
    }>;
  };
}

export interface SessionCurrentMessage extends BaseMessage {
  type: 'session/current';
  payload: {
    sessionId: string;
    messages: SDKMessage[];
    label: string;
    timestamp: Date;
  };
}

// 会话创建消息
export interface SessionCreatedMessage extends BaseMessage {
  type: 'session/created';
  payload: {
    sessionId: string | null;
  };
}

// 系统就绪消息
export interface SystemReadyMessage extends BaseMessage {
  type: 'system/ready';
  payload: {
    capabilities: string[];
  };
}

// 系统错误消息
export interface SystemErrorMessage extends BaseMessage {
  type: 'system/error';
  payload: {
    message: string;
  };
}

// ========== Webview → Extension 消息类型 ==========

// UI就绪消息
export interface UIReadyMessage extends BaseMessage {
  type: 'ui/ready';
  payload: {};
}

// 请求会话列表
export interface SessionListRequestMessage extends BaseMessage {
  type: 'session/list';
  payload: {};
}

// 会话加载消息
export interface SessionLoadMessage extends BaseMessage {
  type: 'session/load';
  payload: {
    sessionId: string;
  };
}

// 会话创建消息
export interface SessionCreateMessage extends BaseMessage {
  type: 'session/create';
  payload: {};
}

// 会话切换消息
export interface SessionSwitchMessage extends BaseMessage {
  type: 'session/switch';
  payload: {
    sessionId: string;
  };
}

// 聊天发送消息
export interface ChatSendMessage extends BaseMessage {
  type: 'chat/send';
  payload: {
    text: string;
    sessionId?: string;
  };
}

// 聊天中断消息
export interface ChatInterruptMessage extends BaseMessage {
  type: 'chat/interrupt';
  payload: {};
}

// 权限响应消息
export interface PermissionResponseMessage extends BaseMessage {
  type: 'permission/response';
  payload: {
    toolUseId: string;
    result: {
      behavior: 'allow' | 'deny';
      updatedInput?: any;
      message?: string;
      interrupt?: boolean;
    };
  };
}

// ========== 联合类型 ==========

// Extension发出的所有消息
export type ExtensionMessage = 
  | ClaudeEventMessage
  | SessionListMessage
  | SessionCurrentMessage
  | SessionCreatedMessage
  | SystemReadyMessage
  | SystemErrorMessage;

// Webview发出的所有消息
export type WebviewMessage = 
  | UIReadyMessage
  | SessionListRequestMessage
  | SessionLoadMessage
  | SessionCreateMessage
  | SessionSwitchMessage
  | ChatSendMessage
  | ChatInterruptMessage
  | PermissionResponseMessage;

// 所有消息的联合类型
export type Message = ExtensionMessage | WebviewMessage;

// ========== 状态类型 ==========

// 消息元数据
export interface MessageMetadata {
  toolName?: string;
  toolUseId?: string;
  parentToolUseId?: string;
  confirmed?: boolean;
  duration?: number;
  error?: string;
  cost?: number;
  model?: string;
  correlationId?: string;
  [key: string]: any;
}

// 内容块类型
export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  // 文本块字段
  text?: string;
  // 工具调用块字段
  id?: string;
  name?: string;
  input?: any;
  // 工具结果块字段
  content?: any;
  tool_use_id?: string;
  is_error?: boolean;
}

// 消息角色类型
export type MessageRole = 'user' | 'assistant' | 'system' | 'error';

// 消息状态类型
export type MessageStatus = 'sending' | 'sent' | 'streaming' | 'completed' | 'error';

// 增强的聊天消息接口
export interface ChatMessage {
  id: string;
  // 保留原始 SDK 消息引用
  sdkMessage?: SDKMessage;
  // 基础信息
  role: MessageRole;
  content: string; // 提取的纯文本内容，用于快速显示
  contentBlocks?: ContentBlock[]; // 解析后的内容块
  timestamp: number;
  // 状态信息
  status?: MessageStatus;
  streaming?: boolean;
  // 元数据
  metadata?: MessageMetadata;
  // 会话信息
  sessionId?: string;
  requestId?: string;
  // 兼容旧接口
  from?: 'user' | 'assistant' | 'system'; // 向后兼容
  type?: 'text' | 'tool_use' | 'tool_result' | 'error'; // 向后兼容
}

export interface ChatState {
  messages: ChatMessage[];
  currentRequest: {
    id: string;
    status: 'sending' | 'thinking' | 'generating' | 'tool_use';
    startTime: number;
  } | null;
  streamingMessages: Map<string, number>;
}

export interface SessionState {
  currentSessionId: string;
  sessions: Array<{
    id: string;
    label: string;
    timestamp: Date;
    messages: SDKMessage[];
  }>;
  capabilities: string[];
}

export interface PermissionState {
  pendingRequests: Array<{
    toolUseId: string;
    toolName: string;
    input: any;
    timestamp: number;
  }>;
}

export function isSDKUserMessage(msg: SDKMessage): msg is SDKUserMessage {
  return msg.type === 'user';
}

export function isSDKAssistantMessage(msg: SDKMessage): msg is SDKAssistantMessage {
  return msg.type === 'assistant';
}

export function isSDKResultMessage(msg: SDKMessage): msg is SDKResultMessage {
  return msg.type === 'result';
}

export function isSDKSystemMessage(msg: SDKMessage): msg is SDKSystemMessage {
  return msg.type === 'system';
}

export function isSDKStreamEvent(msg: SDKMessage): msg is SDKPartialAssistantMessage {
  return msg.type === 'stream_event';
}