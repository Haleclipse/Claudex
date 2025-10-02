/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// 简化的本地化服务，替代 @vscode/l10n

/**
 * 本地化函数，简化实现
 * 在实际应用中，这里会根据语言环境进行翻译
 * 
 * @param message 要本地化的消息，支持占位符 {0}, {1} 等
 * @param args 用于替换占位符的参数
 * @returns 格式化后的字符串
 */
export function t(message: string, ...args: any[]): string {
	// 简单的占位符替换实现
	let result = message;
	
	args.forEach((arg, index) => {
		const placeholder = `{${index}}`;
		result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(arg));
	});
	
	return result;
}

// 导出默认对象以保持兼容性
export default {
	t
};