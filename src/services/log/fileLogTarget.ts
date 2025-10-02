/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import { ILogTarget, LogLevel } from './logService';

export class FileLogTarget implements ILogTarget {
	private readonly logDirectory: string;
	private readonly maxFileSize: number; // bytes
	private currentLogFile: string | null = null;

	constructor(
		private readonly logFileName: string = 'claude-demo',
		private readonly minLogLevel: LogLevel = LogLevel.Trace,
		maxFileSizeMB: number = 10
	) {
		this.logDirectory = path.join(process.cwd(), 'logs');
		this.maxFileSize = maxFileSizeMB * 1024 * 1024; // Convert MB to bytes
		this.ensureLogDirectory();
	}

	private ensureLogDirectory(): void {
		if (!fs.existsSync(this.logDirectory)) {
			fs.mkdirSync(this.logDirectory, { recursive: true });
		}
	}

	private getCurrentLogFile(): string {
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
		const fileName = `${this.logFileName}-${today}.log`;
		const filePath = path.join(this.logDirectory, fileName);
		
		// Check if we need to rotate the log file due to size
		if (this.currentLogFile === filePath && fs.existsSync(filePath)) {
			const stats = fs.statSync(filePath);
			if (stats.size >= this.maxFileSize) {
				// Create a rotated log file with timestamp
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
				const rotatedFileName = `${this.logFileName}-${today}-${timestamp}.log`;
				return path.join(this.logDirectory, rotatedFileName);
			}
		}
		
		return filePath;
	}

	private formatLogMessage(level: LogLevel, message: string): string {
		const timestamp = new Date().toISOString();
		const levelName = LogLevel[level].toUpperCase();
		return `[${timestamp}] [${levelName}] ${message}`;
	}

	logIt(level: LogLevel, metadataStr: string, ...extra: any[]): void {
		// Only log messages at or above the minimum log level
		if (level < this.minLogLevel) {
			return;
		}

		try {
			this.currentLogFile = this.getCurrentLogFile();
			const formattedMessage = this.formatLogMessage(level, metadataStr);
			
			// Append extra parameters if any
			const extraData = extra.length > 0 ? ` ${extra.map(e => 
				typeof e === 'object' ? JSON.stringify(e) : String(e)
			).join(' ')}` : '';
			
			const fullMessage = formattedMessage + extraData + '\n';
			
			// Use synchronous write to ensure log ordering and prevent corruption
			fs.appendFileSync(this.currentLogFile, fullMessage, 'utf8');
		} catch (error) {
			// Fallback to console error if file writing fails
			console.error('Failed to write to log file:', error);
			console.error('Original log message:', metadataStr, ...extra);
		}
	}

	show?(preserveFocus?: boolean): void {
		// For file logs, we could potentially open the log file in an editor
		// For now, just log the file location
		const logFile = this.getCurrentLogFile();
		console.log(`Log file location: ${logFile}`);
	}

	dispose(): void {
		// Flush any remaining buffers (though we're using sync writes)
		// This method can be called during application shutdown
		if (this.currentLogFile && fs.existsSync(this.currentLogFile)) {
			try {
				// Force flush the file system cache
				const fd = fs.openSync(this.currentLogFile, 'a');
				fs.fsyncSync(fd);
				fs.closeSync(fd);
			} catch (error) {
				console.error('Error flushing log file:', error);
			}
		}
	}

	getLogFiles(): string[] {
		try {
			const files = fs.readdirSync(this.logDirectory);
			return files
				.filter(file => file.startsWith(this.logFileName) && file.endsWith('.log'))
				.map(file => path.join(this.logDirectory, file))
				.sort();
		} catch (error) {
			console.error('Error reading log directory:', error);
			return [];
		}
	}

	cleanupOldLogs(daysToKeep: number = 7): void {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

			const files = this.getLogFiles();
			
			for (const filePath of files) {
				const stats = fs.statSync(filePath);
				if (stats.mtime < cutoffDate) {
					fs.unlinkSync(filePath);
					console.log(`Deleted old log file: ${filePath}`);
				}
			}
		} catch (error) {
			console.error('Error cleaning up old log files:', error);
		}
	}
}