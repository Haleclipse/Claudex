/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs/promises';
import { createServiceIdentifier } from '../common/services';
import { URI } from '../common/uri';

export const IFileSystemService = createServiceIdentifier<IFileSystemService>('IFileSystemService');

export enum FileType {
  /**
   * The file type is unknown.
   */
  Unknown = 0,
  /**
   * A regular file.
   */
  File = 1,
  /**
   * A directory.
   */
  Directory = 2,
  /**
   * A symbolic link to a file.
   */
  SymbolicLink = 64
}

export interface IFileSystemService {
  readonly _serviceBrand: undefined;

  /**
   * Retrieve all entries of a directory.
   */
  readDirectory(uri: URI): Promise<[string, FileType][]>;

  /**
   * Read the entire contents of a file.
   */
  readFile(uri: URI): Promise<Uint8Array>;

  /**
   * Retrieve file metadata about a given resource.
   */
  stat(uri: URI): Promise<{ mtime: number }>;
}

export class FileSystemService implements IFileSystemService {
  declare _serviceBrand: undefined;

  async readDirectory(uri: URI): Promise<[string, FileType][]> {
    try {
      const entries = await fs.readdir(uri.fsPath, { withFileTypes: true });
      return entries.map(entry => [
        entry.name,
        entry.isDirectory() ? FileType.Directory :
          entry.isSymbolicLink() ? FileType.SymbolicLink :
            FileType.File
      ]);
    } catch (error) {
      throw new Error(`Failed to read directory ${uri.fsPath}: ${error}`);
    }
  }

  async readFile(uri: URI): Promise<Uint8Array> {
    try {
      const content = await fs.readFile(uri.fsPath);
      return new Uint8Array(content);
    } catch (error) {
      throw new Error(`Failed to read file ${uri.fsPath}: ${error}`);
    }
  }

  async stat(uri: URI): Promise<{ mtime: number }> {
    try {
      const stats = await fs.stat(uri.fsPath);
      return { mtime: stats.mtime.getTime() };
    } catch (error) {
      throw new Error(`Failed to stat file ${uri.fsPath}: ${error}`);
    }
  }
}