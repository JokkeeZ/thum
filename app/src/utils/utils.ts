import type { IMinMaxValues } from "../types/IMinMaxValuesLoaded";

/**
 * Checks if the browser is Chromium-based.
 * @returns {boolean} true if browser is Chromium-based
 */
export function isChromiumBased(): boolean {
  const ua = navigator.userAgent;
  return /Chrome|Chromium/i.test(ua);
}

export async function fetchMinMaxValues(
  url: string
): Promise<IMinMaxValues> {
  const resp = await fetch(url);
  const json: IMinMaxValues = await resp.json();
  return { first: json.first, last: json.last, loaded: true };
}
