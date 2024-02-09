# SP-useWorker

SP-useWorker is a React hook that simplifies the process of creating and communicating with web workers in your React applications. With just a few lines of code, you can offload heavy computations or tasks to a separate thread, enhancing the performance and responsiveness of your web application. The hook abstracts away the complexities of managing web workers, allowing you to focus on writing clean and efficient code.


## Installation

`npm i sp-useworker --save`


## Usage

```javascript
const [execute, terminate, results] = useWorker(func);
```

### Parameters:

`func`: The function to be executed within the Web Worker. This function will be wrapped by the Web Worker for parallel execution.

The hook accepts declarated function, function expressions, arrow functions which can be asynchronous or recursive too.

Additionslly some of native functions such as `Math.pow` are also supported.

### Return Values:
`execute`: A function that allows posting arguments to the `func` within the created Web Worker. Call this function to trigger the execution of the worker.

`terminate`: A function to terminate the Web Worker. Useful for preventing potential deadlock situations or stopping ongoing computations. After calling terminate, invoking `execute` will recreate the worker.

`results`: An array containing the results returned or posted by the Web Worker. This array will be updated with the return values or errors of `func` once the computation is completed or `postMessage` is called. `undefined` results are ignored.


## Examples

### Recursive

```javascript

import { useWorker } from 'sp-useworker';

...

const fib = n => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
};

...

const MyComponent = () => {
  const [ execute, terminate, results ] = useWorker(fib);
  
  useEffect(() => {
    execute(30); // Ready to be executed from useEffect
  }, []);

  console.log(results); // -> [] -> [832040]

...

```

### Asynchronous

```javascript

...

const countdown = async (sec) => {
  const final = await ((resolve) => {
    postMessage(sec);
    let i = sec;
    let timerId = setInterval(() => {
      if(--i) return postMessage(i);
      clearInterval(timerId);
      resolve('go!');
    }, 1000);
  });

  return final;
};

...

const MyComponent = () => {
  const [execute, terminate, results] = useWorker(countdown);
  
  useEffect(() => {
    countdown(3);
  }, []);

  console.log(results); // -> [] -> [3] -> [3, 2] -> [3, 2, 1] -> [3, 2, 1, 'go!']

...

```

### Native

```javascript

...

const [execute, terminate, results] = useWorker(Math.pow);
  
useEffect(() => {
  execute(2, 10);
}, []);

console.log(results); // -> [] -> [1024]

...

```
