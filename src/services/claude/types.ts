/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type {
  Options,
  PermissionResult,
  PermissionUpdate,
  SDKAssistantMessage,
  SDKCompactBoundaryMessage,
  SDKPartialAssistantMessage,
  SDKResultMessage,
  SDKSystemMessage,
  SDKUserMessage,
  SDKUserMessageReplay,
} from '@anthropic-ai/claude-agent-sdk';

// 供 UI 使用的消息事件总线类型（仅数据透传与轻量增强）

export type UiEvent =
  | { kind: 'assistant'; message: SDKAssistantMessage }
  | { kind: 'user'; message: SDKUserMessage | SDKUserMessageReplay }
  | { kind: 'result'; message: SDKResultMessage }
  | { kind: 'system'; message: SDKSystemMessage | SDKCompactBoundaryMessage }
  | { kind: 'stream_event'; message: SDKPartialAssistantMessage }
  // 控制事件（UI -> Service）
  | { kind: 'control_interrupt' }
  | {
    kind: 'permission_request';
    toolName: string;
    input: Record<string, unknown>;
    suggestions?: PermissionUpdate[];
    toolUseId: string;
  }
  | { kind: 'permission_decision'; toolUseId: string; result: PermissionResult }
  | { kind: 'error'; message: string; code?: string; cause?: unknown };

export interface ClaudeRequest {
  // 直接沿用 SDK 的输入定义
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}

export interface ClaudeResult {
  lastResult?: SDKResultMessage;
}
