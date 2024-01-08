export function getLocalStorageData<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) as T : null;
}

export function setLocalStorageData<T>(key: string, data:T | null): void {
  localStorage.setItem(key, JSON.stringify(data));
}
