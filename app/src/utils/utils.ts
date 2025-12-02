import type { IMinMaxValuesLoaded } from "../types/IMinMaxValuesLoaded";

/**
 * Checks if the browser is Chromium-based.
 * @returns {boolean} true if browser is Chromium-based (Chrome, Edge, Brave, Opera)
 */
export function isChromiumBased(): boolean {
  const ua = navigator.userAgent;
  return /Chrome/.test(ua) && /Edg|OPR|Brave/.test(ua) === false;
}

export async function fetchMinMaxValues(
  url: string
): Promise<IMinMaxValuesLoaded> {
  const resp = await fetch(url);
  const json: IMinMaxValuesLoaded = await resp.json();
  return { first: json.first, last: json.last, loaded: true };
}
