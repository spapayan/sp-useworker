import nativeFnsList from './native-fns-list.json';
import { GenericFn, NativeFnsList } from './types';

export const NATIVE_FNS_LIST: NativeFnsList = nativeFnsList;

export const isNativeFn = <T, U extends unknown[]>(fn: GenericFn<T, U>): boolean => {
  return fn.toString().includes('[native code]');
}

export const createWorkerUrl = <T, U extends unknown[]>(fn: GenericFn<T, U>): string => {
  if(!fn) {
    throw new Error('Function is not provided');
  }

  const isNative = isNativeFn(fn);
  const fnCode = isNative
    ? NATIVE_FNS_LIST[fn.name]
    : fn;

  const fnName = isNative
    ? NATIVE_FNS_LIST[fn.name]
    : fn.name;

  const fnDec = isNative
    ? ''
    : `const ${fnName} = ${fnCode};`;

  if(!fnName) {
    throw new Error('Provided native function is not supported');
  }

  const workerCode = `
    ${fnDec}

    onmessage = async (event) => {
      try {
        const results = await ${fnName}(...event.data);
        postMessage(results);
      } catch (err) {
        postMessage(err);
      }
    };
  `;

  const blob = new Blob([workerCode]);

  return URL.createObjectURL(blob);
}