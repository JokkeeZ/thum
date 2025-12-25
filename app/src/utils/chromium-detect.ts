/**
 * Checks if the browser is Chromium-based.
 * @returns {boolean} true if browser is Chromium-based
 */
export function isChromiumBrowser(): boolean {
  const ua = navigator.userAgent;
  return /Chrome|Chromium/i.test(ua);
}
