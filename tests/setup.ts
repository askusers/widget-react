import '@testing-library/jest-dom';

// Mock crypto.randomUUID for consistent test IDs
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  ...globalThis.crypto,
  randomUUID: () => `test-uuid-${++uuidCounter}`,
});

// Reset UUID counter between tests
beforeEach(() => {
  uuidCounter = 0;
});

// Mock sessionStorage
const sessionStorageMap = new Map<string, string>();
vi.stubGlobal('sessionStorage', {
  getItem: (key: string) => sessionStorageMap.get(key) ?? null,
  setItem: (key: string, value: string) => sessionStorageMap.set(key, value),
  removeItem: (key: string) => sessionStorageMap.delete(key),
  clear: () => sessionStorageMap.clear(),
  get length() { return sessionStorageMap.size; },
  key: (index: number) => Array.from(sessionStorageMap.keys())[index] ?? null,
});

// Mock localStorage
const localStorageMap = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => localStorageMap.get(key) ?? null,
  setItem: (key: string, value: string) => localStorageMap.set(key, value),
  removeItem: (key: string) => localStorageMap.delete(key),
  clear: () => localStorageMap.clear(),
  get length() { return localStorageMap.size; },
  key: (index: number) => Array.from(localStorageMap.keys())[index] ?? null,
});

// Mock window.matchMedia
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Clean up storage between tests
afterEach(() => {
  sessionStorageMap.clear();
  localStorageMap.clear();
});
