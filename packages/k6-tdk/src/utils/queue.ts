import { setTimeout } from 'k6/experimental/timers';

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export interface BackOffOptions {
  delay: number;
  delayMultiplier: number;
}

export const backOff = <T>(fn: () => Promise<T>, o: BackOffOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-promise-executor-return
    return fn()
      .then(resolve)
      .catch(() => {
        wait(o.delay)
          .then(() => {
            return backOff(fn, {
              ...o,
              delay: o.delay * o.delayMultiplier
            });
          })
          .then(resolve)
          .catch(reject);
      });
  });
};

function sanitizeOptions(options?: Partial<BackOffOptions>): BackOffOptions {
  return {
    delay: 100,
    delayMultiplier: 2,
    ...options
  };
}

export class Queue<T = void> {
  #tasks: (() => Promise<T>)[];

  #backOffOptions: BackOffOptions;

  constructor(o?: Partial<BackOffOptions>) {
    this.#tasks = [];
    this.#backOffOptions = sanitizeOptions(o);
  }

  add(fn: () => Promise<T>): void {
    this.#tasks.push(fn);
  }

  exec(): Promise<T[]> {
    return Promise.all(this.#tasks.map((fn) => {
      return backOff(fn, this.#backOffOptions);
    }));
  }
}
