/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { IClaudeCodeSessionService } from './session';
import { ClaudeAgentManager } from './claude';
import { UiMessageBus } from './uiMessageBus';
import { UiEvent, ClaudeRequest } from './types';
import { SDKMessage } from '@anthropic-ai/claude-code';
import { ILogService } from '../log/logService';
import type { CancellationToken } from '../common/types';

export interface ClaudeWebviewMessage {
  type: string;
  payload?: any;
  timestamp?: number;
  uuid?: string;
}

export class ClaudeClient {
  private webview?: vscode.Webview;
  private activeBus?: UiMessageBus;
  private activeSessions: Map<string, UiMessageBus> = new Map();
  private currentSessionId?: string;

  constructor(
    private readonly sessionService: IClaudeCodeSessionService,
    private readonly claudeAgent: ClaudeAgentManager,
    private readonly logService: ILogService
  ) {}

  /**
   * 设置 Webview 引用
   */
  setWebview(webview: vscode.Webview): void {
    this.webview = webview;
    this.logService.debug('[ClaudeClient] Webview 已连接');

    // 发送初始化消息
    this.sendToWebview({
      type: 'system/ready',
      payload: {
        capabilities: ['chat', 'sessions', 'streaming', 'permissions', 'tools']
      }
    });
  }

  /**
   * 处理来自 Webview 的消息
   */
  async handleMessage(message: ClaudeWebviewMessage): Promise<void> {
    this.logService.debug(`[ClaudeClient] 收到消息: ${message.type}`);

    try {
      switch (message.type) {
        case 'session/list':
          await this.handleSessionList();
          break;
        case 'session/load':
          await this.handleSessionLoad(message.payload?.sessionId as string);
          break;
        case 'session/create':
          await this.handleSessionCreate();
          break;
        case 'session/switch':
          await this.handleSessionSwitch(message.payload?.sessionId as string);
          break;
        case 'chat/send':
          await this.handleChatSend(message.payload);
          break;
        case 'chat/interrupt':
          this.handleChatInterrupt();
          break;
        case 'permission/response':
          this.handlePermissionResponse(message.payload);
          break;
        case 'ui/ready':
          await this.handleUIReady();
          break;
        default:
          this.logService.warn(`[ClaudeClient] 未知消息类型: ${message.type}`);
      }
    } catch (error) {
      this.logService.error(`[ClaudeClient] 处理消息失败: ${error instanceof Error ? error.message : String(error)}`);
      this.sendToWebview({
        type: 'system/error',
        payload: {
          message: error instanceof Error ? error.message : '处理消息时发生未知错误'
        }
      });
    }
  }

  /**
   * 获取会话列表
   */
  private async handleSessionList(): Promise<void> {
    try {
      const token = {
        isCancellationRequested: false,
        onCancellationRequested: () => ({
          dispose: () => {},
          [Symbol.dispose]: () => {}
        })
      } as unknown as CancellationToken;
      const sessions = await this.sessionService.getAllSessions(token);

      this.sendToWebview({
        type: 'session/list',
        payload: { sessions }
      });
    } catch (error) {
      this.logService.error(`[ClaudeClient] 获取会话列表失败: ${error instanceof Error ? error.message : String(error)}`);
      this.sendToWebview({
        type: 'session/list',
        payload: { sessions: [] }
      });
    }
  }

  /**
   * 加载特定会话
   */
  private async handleSessionLoad(sessionId: string): Promise<void> {
    if (!sessionId) {
      this.sendToWebview({
        type: 'system/error',
        payload: { message: '会话 ID 不能为空' }
      });
      return;
    }

    const token = {
      isCancellationRequested: false,
      onCancellationRequested: () => ({
        dispose: () => {},
        [Symbol.dispose]: () => {}
      })
    } as unknown as CancellationToken;
    const session = await this.sessionService.getSession(sessionId, token);

    if (!session) {
      this.sendToWebview({
        type: 'system/error',
        payload: { message: `找不到会话: ${sessionId}` }
      });
      return;
    }

    // 重放历史消息
    for (const msg of session.messages) {
      const uiEvent = this.sdkMessageToUiEvent(msg);
      this.sendToWebview({
        type: 'claude/event',
        payload: uiEvent
      });
    }

    this.currentSessionId = sessionId;
    this.sendToWebview({
      type: 'session/current',
      payload: {
        sessionId,
        messages: session.messages,
        label: session.label,
        timestamp: session.timestamp
      }
    });
  }

  /**
   * 创建新会话
   */
  private async handleSessionCreate(): Promise<void> {
    // 清除当前状态
    this.currentSessionId = undefined;
    this.activeBus?.complete();
    this.activeBus = undefined;

    this.sendToWebview({
      type: 'session/created',
      payload: { sessionId: null }
    });
  }

  /**
   * 切换到指定会话
   */
  private async handleSessionSwitch(sessionId: string): Promise<void> {
    await this.handleSessionLoad(sessionId);
  }

  /**
   * 处理聊天发送
   */
  private async handleChatSend(payload: { text: string; sessionId?: string }): Promise<void> {
    if (!payload?.text?.trim()) {
      this.sendToWebview({
        type: 'system/error',
        payload: { message: '消息内容不能为空' }
      });
      return;
    }

    // 创建新的消息总线
    const bus = new UiMessageBus();
    this.activeBus = bus;

    // 设置事件监听
    this.setupBusHandlers(bus);

    // 发送用户消息事件
    this.sendToWebview({
      type: 'claude/event',
      payload: {
        kind: 'user',
        message: {
          type: 'user',
          message: { role: 'user', content: payload.text },
          parent_tool_use_id: null,
          session_id: payload.sessionId || ''
        }
      }
    });

    try {
      const request: ClaudeRequest = { prompt: payload.text };
      const controller = new AbortController();

      const result = await this.claudeAgent.handleRequest(
        payload.sessionId || this.currentSessionId,
        request,
        bus,
        controller.signal
      );

      // 更新当前会话 ID
      if (result.claudeSessionId) {
        this.currentSessionId = result.claudeSessionId;
        this.activeSessions.set(result.claudeSessionId, bus);
      }

    } catch (error) {
      this.logService.error(`[ClaudeClient] 聊天请求失败: ${error instanceof Error ? error.message : String(error)}`);
      bus.emit({
        kind: 'error',
        message: error instanceof Error ? error.message : '聊天请求失败'
      });
    }
  }

  /**
   * 中断聊天
   */
  private handleChatInterrupt(): void {
    if (this.activeBus) {
      this.activeBus.emit({ kind: 'control_interrupt' });
      this.logService.debug('[ClaudeClient] 发送中断信号');
    }
  }

  /**
   * 处理权限响应
   */
  private handlePermissionResponse(payload: { toolUseId: string; result: any }): void {
    if (this.activeBus && payload?.toolUseId && payload?.result) {
      this.activeBus.emit({
        kind: 'permission_decision',
        toolUseId: payload.toolUseId,
        result: payload.result
      });
      this.logService.debug(`[ClaudeClient] 权限响应已发送: ${payload.toolUseId}`);
    }
  }

  /**
   * 处理 UI 就绪
   */
  private async handleUIReady(): Promise<void> {
    // 初始化时发送会话列表
    await this.handleSessionList();
  }

  /**
   * 设置消息总线事件处理
   */
  private setupBusHandlers(bus: UiMessageBus): void {
    const subscription = bus.events$.subscribe(event => {
      this.sendToWebview({
        type: 'claude/event',
        payload: event
      });
    });

    // 当总线完成时清理订阅
    bus.events$.subscribe({
      complete: () => {
        subscription.unsubscribe();
      }
    });
  }

  /**
   * 发送消息到 Webview
   */
  private sendToWebview(message: ClaudeWebviewMessage): void {
    if (!this.webview) {
      this.logService.warn(`[ClaudeClient] Webview 未连接，消息被丢弃: ${message.type}`);
      return;
    }

    const enrichedMessage = {
      ...message,
      timestamp: Date.now(),
      uuid: this.generateUuid()
    };

    this.webview.postMessage(enrichedMessage);
    this.logService.debug(`[ClaudeClient] 发送到 Webview: ${message.type}`);
  }

  /**
   * 将 SDK Message 转换为 UiEvent
   */
  private sdkMessageToUiEvent(msg: SDKMessage): UiEvent {
    switch (msg.type) {
      case 'assistant':
        return { kind: 'assistant', message: msg as any };
      case 'user':
        return { kind: 'user', message: msg as any };
      case 'result':
        return { kind: 'result', message: msg as any };
      case 'system':
        return { kind: 'system', message: msg as any };
      default:
        return { kind: 'error', message: `未知消息类型: ${(msg as any).type}` };
    }
  }

  /**
   * 生成 UUID
   */
  private generateUuid(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.activeBus?.complete();
    this.activeSessions.clear();
    this.webview = undefined;
    this.logService.debug('[ClaudeClient] 已清理资源');
  }
}