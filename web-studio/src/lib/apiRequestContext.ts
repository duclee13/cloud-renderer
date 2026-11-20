import {AsyncLocalStorage} from 'node:async_hooks';
export const apiContext = new AsyncLocalStorage<{
  progress: (message: string) => void;
}>();
