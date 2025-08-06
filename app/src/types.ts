import { createContext, useContext, type JSX } from "react";

export interface IPage {
  name: string;
  comp: JSX.Element;
}

export interface IResponseDataPoint {
  ts: string;
  temperature: number;
  humidity: number;
}

export interface IThumNotification {
  id?: string;
  title: string;
  text: string;
  error: boolean;
}

export interface IDataChart {
  labels: string[];
  temperatures: number[];
  humidities: number[];
}

type NotificationContextType = {
  addNotification: (notif: IThumNotification) => void;
};

export interface ISelectedDate {
  year: number;
  month: number;
  date: number;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

/**
 * Checks if the browser is Chromium-based.
 * @returns {boolean} true if browser is Chromium-based (Chrome, Edge, Brave, Opera).
 */
export function isChromiumBased(): boolean {
	const ua = navigator.userAgent;
	return /Chrome/.test(ua) && /Edg|OPR|Brave/.test(ua) === false;
}

export function dateToSelectedDate(d: Date): ISelectedDate {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    date: d.getDate()
  }
}
