/** Safe localStorage wrapper — survives Safari private mode & restricted contexts */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key: string, value: string): void => {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
  removeItem: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
  },
};
