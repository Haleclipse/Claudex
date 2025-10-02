/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createServiceIdentifier } from '../common/services';

export const IConfigurationService = createServiceIdentifier<IConfigurationService>('IConfigurationService');

export interface IConfigurationService {
	readonly _serviceBrand: undefined;
	getConfig<T>(key: string): T | undefined;
	getNonExtensionConfig<T>(key: string): T | undefined;
	getExperimentBasedConfig<T>(key: string, experimentationService?: any): T | undefined;
	setConfig(key: string, value: any): void;
}

// 配置键定义，基于原始 ConfigKey namespace
export namespace ConfigKey {
	export namespace Internal {
		export const ClaudeCodeDebugEnabled = 'chat.advanced.claudeCode.debug';
		export const AgentTemperature = 'chat.advanced.agent.temperature';
	}
}

export class ConfigurationService implements IConfigurationService {
	declare _serviceBrand: undefined;

	private config = new Map<string, any>([
		[ConfigKey.Internal.ClaudeCodeDebugEnabled, false],
		[ConfigKey.Internal.AgentTemperature, 0],
		['chat.agent.maxRequests', 50]
	]);

	getConfig<T>(key: string): T | undefined {
		return this.config.get(key);
	}

	getNonExtensionConfig<T>(key: string): T | undefined {
		return this.config.get(key);
	}

	getExperimentBasedConfig<T>(key: string, experimentationService?: any): T | undefined {
		return this.config.get(key);
	}

	setConfig(key: string, value: any): void {
		this.config.set(key, value);
	}
}