export function parseJson<T>(text: string, fallbackMessage: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(fallbackMessage);
  }
}
