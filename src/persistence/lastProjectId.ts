export interface LastProjectIdStore {
  read(): string | null
  write(id: string): void
  clear(): void
}

const KEY = 'calepinage.lastProjectId'

export const localStorageLastProjectId: LastProjectIdStore = {
  read() {
    try { return localStorage.getItem(KEY) } catch { return null }
  },
  write(id) {
    try { localStorage.setItem(KEY, id) } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  },
}

export function createMemoryLastProjectIdStore(initial: string | null = null): LastProjectIdStore {
  let value = initial
  return {
    read: () => value,
    write: (id) => { value = id },
    clear: () => { value = null },
  }
}
