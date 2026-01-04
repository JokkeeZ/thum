import axios, { type AxiosInstance } from "axios";
import type { IConfig } from "../types/IConfig";
import type {
  ILiveSensorResponse,
  ISensorResponse,
} from "../types/ISensorResponse";
import type { IDateRange, IDateRanges } from "../types/IDateRange";
import type { IStatisticsResponse } from "../types/IStatisticsResponse";
import type { ILogEntry } from "../types/ILogEntry";
import type { IApiResponse } from "../types/IApiResponse";

export default class ApiService {
  static api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL as string,
  });

  static daterange() {
    return this.api.get<IDateRanges>("/daterange");
  }

  static all() {
    return this.api.get<ISensorResponse[]>("/sensor/all");
  }

  static weekly(week: string) {
    return this.api.get<ISensorResponse[]>(`/sensor/weekly/${week}`);
  }

  static daily(day: number, month: number, year: number) {
    return this.api.get<ISensorResponse[]>(
      `/sensor/daily/${day}/${month}/${year}`,
    );
  }

  static monthly(year: number, month: number) {
    return this.api.get<ISensorResponse[]>(`/sensor/monthly/${year}/${month}`);
  }

  static range(start: string, end: string) {
    return this.api.get<ISensorResponse[]>(`/sensor/range/${start}/${end}`);
  }

  static current() {
    return this.api.get<ILiveSensorResponse>("/sensor/current");
  }

  static dates() {
    return this.api.get<IDateRange>("/range/dates");
  }

  static weeks() {
    return this.api.get<IDateRange>("/range/weeks");
  }

  static months() {
    return this.api.get<IDateRange>("/range/months");
  }

  static logs() {
    return this.api.get<ILogEntry[]>("/logs");
  }

  static deleteLogs() {
    return this.api.delete("/logs");
  }

  static deleteLog(timestamp: string) {
    return this.api.delete<{ count: number }>(`/logs/${timestamp}`);
  }

  static statistics() {
    return this.api.get<IStatisticsResponse>(`/statistics`);
  }

  static config() {
    return this.api.get<IConfig>("/config");
  }

  static updateConfig(cfg: IConfig) {
    return this.api.put<IApiResponse>("/config", cfg);
  }

  static dumpUrl() {
    return `${import.meta.env.VITE_API_BASE_URL}/dump`;
  }
}
