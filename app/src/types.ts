import { type JSX } from "react";

export interface IPage {
  name: string;
  chart: boolean;
  comp: JSX.Element;
}

export interface ISensorReadingEntry {
  ts: string;
  temperature: number;
  humidity: number;
}

export interface ILogEntry {
  message: string;
  timestamp: string;
}

export interface IDataChart {
  labels: string[];
  temperatures: number[];
  humidities: number[];
}

export interface IMinMaxValuesLoaded {
  first?: string;
  last?: string;
  loaded: boolean;
}

/**
 * Checks if the browser is Chromium-based.
 * @returns {boolean} true if browser is Chromium-based (Chrome, Edge, Brave, Opera)
 */
export function isChromiumBased(): boolean {
  const ua = navigator.userAgent;
  return /Chrome/.test(ua) && /Edg|OPR|Brave/.test(ua) === false;
}

export async function fetchMinMaxValues(url: string): Promise<IMinMaxValuesLoaded> {
  const resp = await fetch(url);
  const json: IMinMaxValuesLoaded = await resp.json();
  return { first: json.first, last: json.last, loaded: true };
}
