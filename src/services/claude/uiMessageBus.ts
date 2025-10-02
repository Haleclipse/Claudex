/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { firstValueFrom, Subject, type Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { UiEvent } from './types';

export class UiMessageBus {
  private readonly _subject = new Subject<UiEvent>();

  get events$(): Observable<UiEvent> {
    return this._subject.asObservable();
  }

  emit(e: UiEvent): void {
    this._subject.next(e);
  }

  complete(): void {
    this._subject.complete();
  }

  async awaitDecision(toolUseId: string, signal?: AbortSignal) {
    const wait = firstValueFrom(
      this.events$.pipe(
        filter((e): e is Extract<UiEvent, { kind: 'permission_decision' }> => e.kind === 'permission_decision' && e.toolUseId === toolUseId)
      )
    );

    if (!signal) {
      return wait;
    }

    // 允许外部中断等待
    return await new Promise<Extract<UiEvent, { kind: 'permission_decision' }>>((resolve, reject) => {
      const onAbort = () => {
        cleanup();
        const err: any = new Error('aborted');
        err.name = 'AbortError';
        reject(err);
      };
      const cleanup = () => {
        signal.removeEventListener('abort', onAbort);
      };
      signal.addEventListener('abort', onAbort);
      wait.then((res: Extract<UiEvent, { kind: 'permission_decision' }>) => {
        cleanup();
        resolve(res);
      }, (err: unknown) => {
        cleanup();
        reject(err);
      });
    });
  }
}
