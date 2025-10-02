/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../common/uri';
import { Location } from 'vscode';


export function isUri(thing: any): thing is URI {
	return URI.isUri(thing);
}

export function isLocation(obj: any): obj is Location {
	return obj && typeof obj === 'object' && 'uri' in obj && 'range' in obj;
}

/**
 * A cancellation token is passed to an asynchronous or long running
 * operation to request cancellation, like cancelling a request
 * for completion items because the user continued to type.
 *
 * To get an instance of a `CancellationToken` use a
 * {@link CancellationTokenSource}.
 */
export interface CancellationToken {

	/**
	 * Is `true` when the token has been cancelled, `false` otherwise.
	 */
	isCancellationRequested: boolean;

	/**
	 * An {@link Event} which fires upon cancellation.
	 */
	onCancellationRequested: Event<any>;
}

/**
 * Represents a typed event.
 *
 * A function that represents an event to which you subscribe by calling it with
 * a listener function as argument.
 *
 * @example
 * item.onDidChange(function(event) { console.log("Event happened: " + event); });
 */
export interface Event<T> {

	/**
	 * A function that represents an event to which you subscribe by calling it with
	 * a listener function as argument.
	 *
	 * @param listener The listener function will be called when the event happens.
	 * @param thisArgs The `this`-argument which will be used when calling the event listener.
	 * @param disposables An array to which a {@link Disposable} will be added.
	 * @returns A disposable which unsubscribes the event listener.
	 */
	(listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
}
