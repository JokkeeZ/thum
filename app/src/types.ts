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

export function selectedDateToString(d: ISelectedDate) {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(
    d.date
  ).padStart(2, "0")}`;
};

export function dateToSelectedDate(d: Date): ISelectedDate {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    date: d.getDate()
  }
}
