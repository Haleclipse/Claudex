/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { Options, PermissionResult, Query, SDKMessage, SDKUserMessage, CanUseTool } from '@anthropic-ai/claude-agent-sdk';
import Anthropic from '@anthropic-ai/sdk';
import { DeferredPromise } from '../common/deferred';
import { Disposable } from '../common/lifecycle';
import { IInstantiationService } from '../common/services';
import { URI } from '../common/uri';
import { ConfigKey, IConfigurationService } from '../configuration/configurationService';
import { IEnvService } from '../env/envService';
import { ILogService } from '../log/logService';
import { IToolsService } from '../tools/toolsService';
import { IWorkspaceService } from '../workspace/workspaceService';
import { ClaudeToolNames, isFileOkForTool } from './tools';
import { ClaudeRequest, ClaudeResult } from './types';
import { UiMessageBus } from './uiMessageBus';

// Manages Claude Code agent interactions
export class ClaudeAgentManager extends Disposable {

	constructor(
		@ILogService private readonly logService: ILogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super();
	}

	public async handleRequest(
		claudeSessionId: string | undefined,
		request: ClaudeRequest,
		bus: UiMessageBus,
		signal: AbortSignal
	): Promise<ClaudeResult & { claudeSessionId?: string }> {
		try {
			const session = this.instantiationService.createInstance(ClaudeCodeSession, claudeSessionId);
			await session.invoke(
				request.prompt,
				bus,
				signal,
				request.options
			);
			return { claudeSessionId: session.sessionId };
		} catch (invokeError) {
			const err = invokeError as Error;
			this.logService.error(err);
			bus.emit({ kind: 'error', message: err.message || 'Claude CLI Error', cause: err });
			return {};
		}
	}

	// 引用拼接逻辑已迁移至 UI 层；如需恢复，请参考此前实现
	// private resolvePrompt(request: ClaudeRequest): string | AsyncIterable<SDKUserMessage> {
	// 	return request.prompt;
	// }
}

class KnownClaudeError extends Error { }

class ClaudeCodeSession {
	private static DenyToolMessage = 'The user declined to run the tool';
	private currentQuery: Query | null = null;
	private unprocessedToolCalls = new Map<string, Anthropic.ToolUseBlock>();

	constructor(
		public sessionId: string | undefined,
		@ILogService private readonly logService: ILogService,
		@IConfigurationService private readonly configService: IConfigurationService,
		@IWorkspaceService private readonly workspaceService: IWorkspaceService,
		@IEnvService private readonly envService: IEnvService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IToolsService private readonly toolsService: IToolsService
	) { }

	public async invoke(
		prompt: string | AsyncIterable<SDKUserMessage>,
		bus: UiMessageBus,
		signal: AbortSignal,
		optionsOverride?: Options
	): Promise<void> {
		const abortController = new AbortController();
		const onAbort = () => abortController.abort();
		signal?.addEventListener('abort', onAbort);

		let controlSub: any;
		try {
			// Build options for the Claude Code SDK
			const isDebugEnabled = this.configService.getConfig(ConfigKey.Internal.ClaudeCodeDebugEnabled);
                        const options: Options = {
                                cwd: this.workspaceService.getWorkspaceFolders().at(0)?.fsPath,
                                abortController,
                                executable: 'node',
                                pathToClaudeCodeExecutable: this.envService.claudeCliPath,
                                env: {
					...process.env,
					...(isDebugEnabled ? { DEBUG: '1' } : {}),
					CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
				},
				resume: this.sessionId,
				model: 'claude-sonnet-4-20250514',
				permissionMode: 'default',
                                includePartialMessages: true,
                                canUseTool: async (name, input, opts): Promise<PermissionResult> => {
                                        return this.canUseTool(name, input, bus, opts as any);
                                },
                                ...optionsOverride,
                        };

                        if (!optionsOverride?.systemPrompt) {
                                const customSystemPrompt = this.configService.getConfig<string>('claudex.customSystemPrompt')?.trim();
                                const appendSystemPrompt = this.configService.getConfig<string>('claudex.appendSystemPrompt')?.trim();

                                if (customSystemPrompt) {
                                        options.systemPrompt = customSystemPrompt;
                                } else {
                                        options.systemPrompt = {
                                                type: 'preset',
                                                preset: 'claude_code',
                                                ...(appendSystemPrompt ? { append: appendSystemPrompt } : {})
                                        } as const;
                                }
                        }

			this.logService.trace(`Claude CLI SDK: Starting query with options: ${JSON.stringify({ ...options, env: undefined })}`);
                        const { query } = await import('@anthropic-ai/claude-agent-sdk');
			const def = new DeferredPromise<void>();

			async function* createPromptIterable(promptText: string, sessionId?: string): AsyncIterable<SDKUserMessage> {
				yield {
					type: 'user',
					message: { role: 'user', content: promptText },
					parent_tool_use_id: null,
					session_id: sessionId ?? ''
				};
				// Workaround https://github.com/anthropics/claude-code/issues/4775
				await def.p;
			}

			const promptInput = typeof prompt === 'string' ? createPromptIterable(prompt, this.sessionId) : prompt;

			// 订阅控制事件：中断
			controlSub = bus.events$.subscribe((evt) => {
				if ((evt as any)?.kind === 'control_interrupt') {
					try { this.currentQuery?.interrupt?.(); } catch (e) { this.logService.trace(`interrupt failed: ${e}`); }
				}
			});

			this.currentQuery = query({ prompt: promptInput, options });
			for await (const message of this.currentQuery) {
				this.logService.trace(`Claude CLI SDK Message: ${JSON.stringify(message, null, 2)}`);
				if (message.session_id) {
					this.sessionId = message.session_id;
				}

				switch (message.type) {
					case 'assistant':
						this.handleAssistantMessage(message);
						bus.emit({ kind: 'assistant', message } as any);
						break;
					case 'user':
						this.handleUserMessage(message);
						bus.emit({ kind: 'user', message } as any);
						break;
					case 'result':
						def.complete();
						bus.emit({ kind: 'result', message } as any);
						break;
					case 'system':
						bus.emit({ kind: 'system', message } as any);
						break;
					case 'stream_event':
						bus.emit({ kind: 'stream_event', message } as any);
						break;
					default:
						bus.emit({ kind: 'error', message: `Unknown message type: ${(message as SDKMessage).type}` });
				}
			}
		} finally {
			signal?.removeEventListener('abort', onAbort);
			try { (controlSub as any)?.unsubscribe?.(); } catch { /* noop */ }
			this.currentQuery = null;
		}
	}

	// 旧的 VSCode Chat* 适配逻辑已移除：
	// - handleAssistantMessage
	// - handleUserMessage
	// - processToolResult
	// - processTodoWriteTool
	// - handleResultMessage

	/**
	 * Handles tool permission requests by showing a confirmation dialog to the user
	 */
	private async canUseTool(
		toolName: string,
		input: Record<string, unknown>,
		bus: UiMessageBus,
		opts: { signal: AbortSignal; suggestions?: any }
	): Promise<PermissionResult> {
		this.logService.trace(`ClaudeCodeSession: canUseTool: ${toolName}(${JSON.stringify(input)})`);
		if (await this.canAutoApprove(toolName, input)) {
			this.logService.trace(`ClaudeCodeSession: auto-approving ${toolName}`);
			return {
				behavior: 'allow',
				updatedInput: input,
				updatedPermissions: opts.suggestions
			};
		}

		// 从 unprocessedToolCalls 拿出 tool_use_id
		let toolUseId: string = '';
		for (const [id, toolCall] of this.unprocessedToolCalls.entries()) {
			if (toolCall.name === toolName && JSON.stringify(toolCall.input) === JSON.stringify(input)) {
				toolUseId = id;
				break;
			}
		}

		bus.emit({
			kind: 'permission_request',
			toolName,
			input, 
			suggestions: opts.suggestions,
			toolUseId
		});
		try {
			const decision = await bus.awaitDecision(toolUseId, opts.signal);
			return decision.result;
		} catch (error) {
			this.logService.trace(`Tool confirmation error: ${error}`);
			return { behavior: 'deny', message: ClaudeCodeSession.DenyToolMessage, interrupt: true };
		}
	}


	private async canAutoApprove(toolName: string, input: Record<string, unknown>): Promise<boolean> {
		if (toolName === ClaudeToolNames.Edit || toolName === ClaudeToolNames.Write || toolName === ClaudeToolNames.MultiEdit) {
			return await this.instantiationService.invokeFunction(isFileOkForTool, URI.file(input.file_path as string));
		}

		return false;
	}

	/**
	 * 处理 assistant 消息，提取并存储 tool_use 块
	 */
	private handleAssistantMessage(message: any): void {
		// 提取并存储 tool_use 块
		if (message.message && message.message.content && Array.isArray(message.message.content)) {
			for (const item of message.message.content) {
				if (item.type === 'tool_use' && item.id) {
					this.unprocessedToolCalls.set(item.id, item as Anthropic.ToolUseBlock);
					this.logService.trace(`[ClaudeCodeSession] 存储工具调用: ${item.name} (${item.id})`);
				}
			}
		}
	}

	/**
	 * 处理 user 消息，处理 tool_result 并清理已完成的工具调用
	 */
	private handleUserMessage(message: any): void {
		// 处理 tool_result 并清理已完成的工具调用
		if (message.message && message.message.content && Array.isArray(message.message.content)) {
			for (const item of message.message.content) {
				if (item.type === 'tool_result' && item.tool_use_id) {
					// 清理已完成的工具调用
					if (this.unprocessedToolCalls.has(item.tool_use_id)) {
						this.unprocessedToolCalls.delete(item.tool_use_id);
						this.logService.trace(`[ClaudeCodeSession] 清理已完成工具调用: ${item.tool_use_id}`);
					}
				}
			}
		}
	}
}
