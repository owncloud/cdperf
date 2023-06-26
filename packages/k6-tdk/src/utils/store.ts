/**
 * Each vu can only have one global store, but we have cases where multiple users operate on one vu.
 * Therefor we need to multiplex it.
 */
const storage: Map<string, unknown> = new Map()

export type Store = {
  clear(): void;
  delete(k: string): boolean;
  has(k: string): Boolean
  get<T>(k: string): T | undefined;
  set(K: string, v: () => Promise<unknown>): Promise<void>;
  setOrGet<T>(K: string, v: () => Promise<T>): Promise<T>;
}

export const store = (id: string): Store => {
  const namespace = (k: string) => {
    return [id, k].join('--')
  }

  return {
    clear(): void {
      storage.clear()
    },

    delete(k: string): boolean {
      const nk = namespace(k)

      return storage.delete(nk)
    },

    has(k: string): Boolean {
      const nk = namespace(k)

      return storage.has(nk)
    },

    get<T>(k: string): T {
      const nk = namespace(k)

      return storage.get(nk) as T
    },

    async set(k: string, v: () => Promise<unknown>): Promise<void> {
      const nk = namespace(k)

      if (storage.has(nk)) {
        return
      }

      storage.set(nk, await v())
    },

    async setOrGet<T>(k: string, v: () => Promise<T>): Promise<T> {
      const nk = namespace(k)

      if (!storage.has(nk)) {
        await this.set(nk, v)
      }

      return this.get<T>(nk)!
    }
  }
}
