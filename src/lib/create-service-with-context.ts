import { ServiceContext } from "@/types/services";

/**
 * Ensures a function has `this: ServiceContext` as its context parameter
 */
type ServiceMethodWithContext = (this: ServiceContext, ...args: any[]) => any;

/**
 * Extract the 'this' parameter type from a function, or never if it doesn't have one
 */
type ThisParameterType<T> = T extends (this: infer This, ...args: any[]) => any ? This : never;

/**
 * Check if a method has the correct 'this' parameter type
 * If not, return never which will cause the property to not be assignable
 */
type ValidateMethod<T> = ThisParameterType<T> extends ServiceContext
  ? T
  : `This method must have 'this: ServiceContext' as its first parameter.
    hint: "Add 'this: ServiceContext' after the function name, before other parameters".
    example: "async function myMethod(this: ServiceContext, ...args) { ... }"`;

/**
 * Validate all methods in the service object
 */
type ValidatedService<T> = {
  [K in keyof T]: ValidateMethod<T[K]>;
};

/**
 * Helper type that transforms a service object by removing the `this` parameter
 * from all its methods while preserving other parameters and return types
 */
type ServiceWithoutThisParam<T> = {
  [K in keyof T]: T[K] extends (this: ServiceContext, ...args: infer P) => infer R
    ? (...args: P) => R
    : T[K];
};

/** HOF that guarantees service context is provided */
function withContext<T extends ServiceMethodWithContext>(fn: T) {
  return function (this: Partial<ServiceContext> | void, ...args: Parameters<T>) {
    const ctx: ServiceContext =
      this && this.accessToken !== undefined ? (this as ServiceContext) : { accessToken: null };
    // We deliberately erase `this` from the exported type so callers don't see it.
    return fn.apply(ctx, args);
  } as OmitThisParameter<T>;
}

/**
 * Creates a service with context support, ensuring all methods have `this: ServiceContext` parameter
 *
 * @param service - Object containing service methods that accept `this: ServiceContext`
 * @returns Service object with `this` parameter removed from method signatures
 *
 * @example
 * ```typescript
 * async function getUser(this: ServiceContext, userId: string) {
 *   const supabase = createServerSupabaseClient(this?.accessToken);
 *   return supabase.from('users').select().eq('id', userId);
 * }
 *
 * export const userService = createServiceWithContext({ getUser });
 * // userService.getUser now has signature: (userId: string) => Promise<...>
 * ```
 */
export function createServiceWithContext<T extends Record<string, ServiceMethodWithContext>>(
  service: ValidatedService<T>
): ServiceWithoutThisParam<T> {
  const serviceWithContext: Partial<T> = {};
  for (const method in service) {
    const serviceMethod = service[method];
    if (typeof serviceMethod === "function") {
      serviceWithContext[method] = withContext(serviceMethod) as any;
    }
  }
  return serviceWithContext as ServiceWithoutThisParam<T>;
}
