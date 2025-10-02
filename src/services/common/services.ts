/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// ------ internal util ------

export namespace _util {
  export const serviceIds = new Map<string, ServiceIdentifier<any>>();

  export const DI_TARGET = '$di$target';
  export const DI_DEPENDENCIES = '$di$dependencies';

  export function getServiceDependencies(ctor: any): { id: ServiceIdentifier<any>; index: number }[] {
    return ctor[DI_DEPENDENCIES] || [];
  }
}

// ------ interfaces ------

export type BrandedService = { _serviceBrand: undefined };

export interface IConstructorSignature<T, Args extends any[] = []> {
  new <Services extends BrandedService[]>(...args: [...Args, ...Services]): T;
}

export interface ServicesAccessor {
  get<T>(id: ServiceIdentifier<T>): T;
  getIfExists<T>(id: ServiceIdentifier<T>): T | undefined;
}

export type ServiceIdentifier<T> = Function & { _type: T };

// ------ DI 装饰器和服务标识符创建 ------

function storeServiceDependency(id: Function, target: Function, index: number): void {
  if ((target as any)[_util.DI_TARGET] === target) {
    (target as any)[_util.DI_DEPENDENCIES].push({ id, index });
  } else {
    (target as any)[_util.DI_DEPENDENCIES] = [{ id, index }];
    (target as any)[_util.DI_TARGET] = target;
  }
}

/**
 * 创建服务装饰器 - 这是 createServiceIdentifier 的别名
 * 基于 VS Code 的 createDecorator 实现
 */
export function createDecorator<T>(serviceId: string): ServiceIdentifier<T> {
  if (_util.serviceIds.has(serviceId)) {
    return _util.serviceIds.get(serviceId)!;
  }

  const id = <any>function (target: Function, key: string, index: number) {
    if (arguments.length !== 3) {
      throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
    }
    storeServiceDependency(id, target, index);
  };

  id.toString = () => serviceId;
  _util.serviceIds.set(serviceId, id);
  return id;
}

// createServiceIdentifier 是 createDecorator 的别名
export const createServiceIdentifier = createDecorator;

// ------ 基础实例化服务接口 ------

export interface IInstantiationService {
  readonly _serviceBrand: undefined;
  createInstance<T>(ctor: IConstructorSignature<T>): T;
  createInstance<Ctor extends new (...args: any[]) => unknown, R extends InstanceType<Ctor>>(
    ctor: Ctor,
    ...args: any[]
  ): R;
  invokeFunction<T>(fn: Function, ...args: any[]): T;
}

// 创建 IInstantiationService 服务标识符
export const IInstantiationService = createServiceIdentifier<IInstantiationService>('IInstantiationService');

// ------ 服务集合 ------

export class ServiceCollection {
  private _entries = new Map<ServiceIdentifier<any>, any>();

  constructor(...entries: [ServiceIdentifier<any>, any][]) {
    for (const [id, service] of entries) {
      this.set(id, service);
    }
  }

  set<T>(id: ServiceIdentifier<T>, instance: T): void {
    this._entries.set(id, instance);
  }

  get<T>(id: ServiceIdentifier<T>): T | undefined {
    return this._entries.get(id);
  }

  has(id: ServiceIdentifier<any>): boolean {
    return this._entries.has(id);
  }

  forEach(callback: (value: any, key: ServiceIdentifier<any>) => void): void {
    this._entries.forEach(callback);
  }
}

// ------ 简单实例化服务实现 ------

export class InstantiationService implements IInstantiationService {
  declare _serviceBrand: undefined;

  constructor(private _services: ServiceCollection) { }

  createInstance<T>(ctor: any, ...args: any[]): T {
    const dependencies = _util.getServiceDependencies(ctor);
    const services = dependencies
      .sort((a, b) => a.index - b.index)
      .map(dep => {
        const service = this._services.get(dep.id);
        if (!service) {
          throw new Error(`Service not found: ${dep.id.toString()}`);
        }
        return service;
      });

    return new ctor(...args, ...services);
  }

  invokeFunction<T>(fn: Function, ...args: any[]): T {
    // 简化实现 - 在更复杂的版本中，这里会分析函数参数并注入依赖
    return fn.apply(null, [...args, this._services]);
  }
}