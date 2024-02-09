export type GenericFn<T, U extends unknown[]> = (...args: U) => T

export type NativeFnsList = {
  [key: string]: string;
}
