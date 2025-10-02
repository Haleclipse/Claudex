/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import path from 'node:path';
import { createServiceIdentifier } from '../common/services';
import { URI } from '../common/uri';

export const IWorkspaceService = createServiceIdentifier<IWorkspaceService>('IWorkspaceService');

export interface IWorkspaceService {
	readonly _serviceBrand: undefined;
	getWorkspaceFolders(): URI[];
	getWorkspaceFolder(resource: URI): URI | undefined;
	getWorkspaceFolderName(workspaceFolderUri: URI): string;
}

export class WorkspaceService implements IWorkspaceService {
	declare _serviceBrand: undefined;

	private workspaceFolders: URI[];

	constructor(workingDirectory?: string) {
		if (workingDirectory) {
			this.workspaceFolders = [URI.file(workingDirectory)];
		} else {
			this.workspaceFolders = [];
		}
	}

	getWorkspaceFolders(): URI[] {
		return this.workspaceFolders;
	}

	getWorkspaceFolder(resource: URI): URI | undefined {
		// Simple implementation: find the first workspace folder that contains the resource
		return this.workspaceFolders.find(folder =>
			resource.path.startsWith(folder.path)
		);
	}

	getWorkspaceFolderName(workspaceFolderUri: URI): string {
		// Extract the folder name from the path
		return path.basename(workspaceFolderUri.fsPath);
	}
}
