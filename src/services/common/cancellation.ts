/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from './lifecycle';

export interface CancellationToken {
	/**
	 * A flag signalling is cancellation has been requested.
	 */
	readonly isCancellationRequested: boolean;

	/**
	 * An event which fires when cancellation is requested.
	 */
	readonly onCancellationRequested: (listener: (e: any) => any, thisArgs?: any, disposables?: IDisposable[]) => IDisposable;
}

export namespace CancellationToken {
	export function isCancellationToken(thing: unknown): thing is CancellationToken {
		if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
			return true;
		}
		if (!thing || typeof thing !== 'object') {
			return false;
		}
		return typeof (thing as CancellationToken).isCancellationRequested === 'boolean'
			&& typeof (thing as CancellationToken).onCancellationRequested === 'function';
	}

	export const None: CancellationToken = Object.freeze({
		isCancellationRequested: false,
		onCancellationRequested: () => ({ dispose: () => { } })
	});

	export const Cancelled: CancellationToken = Object.freeze({
		isCancellationRequested: true,
		onCancellationRequested: (listener: Function) => {
			// Call immediately since it's already cancelled
			setTimeout(() => listener({}), 0);
			return { dispose: () => { } };
		}
	});
}

export class CancellationTokenSource implements IDisposable {
	private _token?: CancellationToken;
	private _parentListener?: IDisposable;
	private _isCancelled: boolean = false;
	private _listeners: Function[] = [];

	constructor(parent?: CancellationToken) {
		this._parentListener = parent?.onCancellationRequested(() => this.cancel());
	}

	get token(): CancellationToken {
		if (!this._token) {
			this._token = {
				isCancellationRequested: this._isCancelled,
				onCancellationRequested: (listener: Function) => {
					if (this._isCancelled) {
						// Already cancelled, call immediately
						setTimeout(() => listener({}), 0);
					} else {
						this._listeners.push(listener);
					}
					return { dispose: () => { } };
				}
			};
		}
		return this._token;
	}

	cancel(): void {
		if (!this._isCancelled) {
			this._isCancelled = true;
			if (this._token) {
				(this._token as any).isCancellationRequested = true;
			}
			// Notify all listeners
			this._listeners.forEach(listener => {
				try {
					listener({});
				} catch (e) {
					console.error('Error in cancellation listener:', e);
				}
			});
			this._listeners = [];
		}
	}

	dispose(): void {
		this.cancel();
		this._parentListener?.dispose();
		this._parentListener = undefined;
	}
}