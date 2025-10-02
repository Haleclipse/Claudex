/*---------------------------------------------------------------------------------------------
 *  Minimal DeferredPromise utility
 *--------------------------------------------------------------------------------------------*/

export class DeferredPromise<T> {
  public readonly p: Promise<T>;
  private _settled = false;
  public resolve!: (value: T) => void;
  public reject!: (reason?: unknown) => void;

  constructor() {
    this.p = new Promise<T>((resolve, reject) => {
      this.resolve = (value: T) => {
        if (!this._settled) {
          this._settled = true;
          resolve(value);
        }
      };
      this.reject = (reason?: unknown) => {
        if (!this._settled) {
          this._settled = true;
          reject(reason);
        }
      };
    });
  }

  complete(value?: T): void {
    this.resolve(value as T);
  }

  completeError(reason?: unknown): void {
    this.reject(reason);
  }

  get isSettled(): boolean {
    return this._settled;
  }
}

