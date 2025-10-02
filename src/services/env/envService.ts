/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os';
import * as path from 'path';
import { createServiceIdentifier } from '../common/services';
import { URI } from '../common/uri';

export const IEnvService = createServiceIdentifier<IEnvService>('IEnvService');
export const INativeEnvService = createServiceIdentifier<INativeEnvService>('INativeEnvService');

export interface IEnvService {
	readonly _serviceBrand: undefined;
	appRoot: string;
	claudeCliPath: string;
}

export interface INativeEnvService {
	readonly _serviceBrand: undefined;
	userHome: URI;
}

export class EnvService implements IEnvService {
	declare _serviceBrand: undefined;

	constructor(private readonly extensionPath: string) {}

	get appRoot(): string {
		return this.extensionPath;
	}

	get claudeCliPath(): string {
		// 在VSCode扩展环境下，指向扩展目录中的claude-cli.js
		return path.join(this.extensionPath, 'dist', 'claude-cli.js');
	}
}

export class NativeEnvService implements INativeEnvService {
	declare _serviceBrand: undefined;

	get userHome(): URI {
		return URI.file(os.homedir());
	}
}