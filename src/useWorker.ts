import { useState, useRef, useEffect, useCallback } from 'react';
import { GenericFn } from './types';
import { createWorkerUrl } from './lib';


export const useWorker =
<T, U extends unknown[]>(fn: GenericFn<T, U>): [(...args: U) => void, () => void, T[]] => {
  const workerRef = useRef<Worker | null>(null);
  const [results, setResults] = useState<T[]>([]);

  const init = () => {
    if (typeof Worker === 'undefined') {
      throw new Error('Web workers are not supported by your browser');
    }

    const url = createWorkerUrl(fn);
    workerRef.current = new Worker(url);
    workerRef.current.onmessage = (e: MessageEvent): void => {
      if(e.data === undefined) {
        return;
      }
      setResults(currentResults => [...currentResults, e.data]);
    }
  }

  useEffect(() => {
    init();
    return () => workerRef.current?.terminate();
  }, [fn]);

  const execute = useCallback((...args: U) => {
    if(!workerRef.current) {
      init();
    }
    workerRef.current?.postMessage(args);
  }, []);

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return [ execute, terminate, results ];
}