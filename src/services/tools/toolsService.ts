/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Anthropic from '@anthropic-ai/sdk';
import { createServiceIdentifier } from '../common/services';
import { ILogService } from '../log/logService';

export const IToolsService = createServiceIdentifier<IToolsService>('IToolsService');

export interface IToolsService {
	readonly _serviceBrand: undefined;
	invokeTool(name: string, options: any): Promise<any>;
	getTool(name: string): any | undefined;
}

export class ToolsService implements IToolsService {
	declare _serviceBrand: undefined;

	private confirmationCallback?: (toolName: string, params: any) => Promise<boolean>;

	constructor(
		@ILogService private readonly logService: ILogService
	) { }

	setConfirmationCallback(callback: (toolName: string, params: any) => Promise<boolean>) {
		this.confirmationCallback = callback;
	}

	async invokeTool(name: string, options: any): Promise<any> {
		this.logService.trace(`[Tools] Invoking tool: ${name} with options: ${JSON.stringify(options)}`);

		// 当从 canUseTool 调用时，处理确认
		if (this.confirmationCallback && options?.input) {
			// 创建 Anthropic ToolUseBlock 格式（为了使用格式化器进行日志记录）
			const toolUse: Anthropic.ToolUseBlock = {
				id: 'confirm-' + Date.now(),
				name: name,
				input: options.input,
				type: 'tool_use'
			};
			this.logService.trace(`[Tools] Requesting confirmation for: ${toolUse.name} with input: ${JSON.stringify(toolUse.input)}`);

			// 直接传递原始参数给 UI 确认回调
			const approved = await this.confirmationCallback(name, options.input);

			return { approved };
		}

		// 默认拒绝
		return { approved: false };
	}

	getTool(name: string): any | undefined {
		// 简化实现 - 返回基本工具信息
		return { name, description: `Tool: ${name}` };
	}
}