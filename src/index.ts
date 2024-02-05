import { useState } from 'react';

const getWorkerUrl = (fn: () => {}) => {
  const blob = new Blob([`
  const runWorker = (...args) => (${fn})(...args);

  onmessage = async (event) => {
    const results = await runWorker(...event.data);
    postMessage(results);
  };
`]);

  const url = URL.createObjectURL(blob);
  return url;
}

export function useWorker(fn: () => any): any {
  const url = getWorkerUrl(fn);
  const worker = new Worker(url);
  const [results, setResults] = useState<any[]>([]);

  return [
    (...args: any) => {
      worker.postMessage(args);
      worker.onmessage = (e: MessageEvent) => {
        setResults([...results, e.data]);
      }
    },
    () => worker.terminate(),
    results,
  ];
}