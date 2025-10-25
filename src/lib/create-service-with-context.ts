import { ServiceContext } from "@/types/services";

/**
 * Helper type that transforms a service object by removing the `this` parameter
 * from all its methods while preserving other parameters and return types
 */
type ServiceWithoutThisParam<T> = {
  [K in keyof T]: T[K] extends (this: any, ...args: infer P) => infer R ? (...args: P) => R : T[K];
};

/** HOF that guarantees service context is provided */
function withContext<T extends (this: Partial<ServiceContext> | void, ...args: any[]) => any>(
  fn: T
) {
  return function (this: Partial<ServiceContext> | void, ...args: Parameters<T>) {
    const ctx: ServiceContext =
      this && this.accessToken ? (this as ServiceContext) : { accessToken: null };
    // We deliberately erase `this` from the exported type so callers don't see it.
    return fn.apply(ctx, args);
  } as OmitThisParameter<T>;
}

export function createServiceWithContext<T extends Record<string, any>>(
  service: T
): ServiceWithoutThisParam<T> {
  const serviceWithContext: Partial<T> = {};
  for (const method in service) {
    const serviceMethod = service[method];
    if (typeof serviceMethod === "function") {
      serviceWithContext[method] = withContext(serviceMethod);
    }
  }
  return serviceWithContext as ServiceWithoutThisParam<T>;
}
