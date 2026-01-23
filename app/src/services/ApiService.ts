import type { IConfig } from "../types/IConfig";
import type {
  ILiveSensorResponse,
  ISensorResponse,
} from "../types/ISensorResponse";
import type { IDateRanges } from "../types/IDateRange";
import type { IStatisticsResponse } from "../types/IStatisticsResponse";
import type { ILogEntry } from "../types/ILogEntry";
import type { IApiResponse } from "../types/IApiResponse";

export default class ApiService {
  static readonly baseURL: string = import.meta.env.VITE_API_BASE_URL as string;

  static async daterange(): Promise<IDateRanges> {
    const response = await fetch(`${this.baseURL}/daterange`);

    if (!response.ok) {
      throw new Error(`Error fetching date ranges: ${response.statusText}`);
    }

    return await response.json();
  }

  static async all(): Promise<ISensorResponse[]> {
    const response = await fetch(`${this.baseURL}/sensor/all`);

    if (!response.ok) {
      throw new Error(`Error fetching all sensor data: ${response.statusText}`);
    }

    return await response.json();
  }

  static async weekly(week: string): Promise<ISensorResponse[]> {
    const response = await fetch(`${this.baseURL}/sensor/weekly/${week}`);

    if (!response.ok) {
      throw new Error(`Error fetching weekly data: ${response.statusText}`);
    }

    return await response.json();
  }

  static async daily(
    day: number,
    month: number,
    year: number,
  ): Promise<ISensorResponse[]> {
    const response = await fetch(
      `${this.baseURL}/sensor/daily/${day}/${month}/${year}`,
    );

    if (!response.ok) {
      throw new Error(`Error fetching daily data: ${response.statusText}`);
    }

    return await response.json();
  }

  static async monthly(
    year: number,
    month: number,
  ): Promise<ISensorResponse[]> {
    const response = await fetch(
      `${this.baseURL}/sensor/monthly/${year}/${month}`,
    );

    if (!response.ok) {
      throw new Error(`Error fetching monthly data: ${response.statusText}`);
    }

    return await response.json();
  }

  static async range(start: string, end: string): Promise<ISensorResponse[]> {
    const response = await fetch(
      `${this.baseURL}/sensor/range/${start}/${end}`,
    );

    if (!response.ok) {
      throw new Error(`Error fetching range data: ${response.statusText}`);
    }

    return await response.json();
  }

  static async current(): Promise<ILiveSensorResponse> {
    const response = await fetch(`${this.baseURL}/sensor/current`);

    if (!response.ok) {
      throw new Error(
        `Error fetching current sensor data: ${response.statusText}`,
      );
    }

    return await response.json();
  }

  static async logs(): Promise<ILogEntry[]> {
    const response = await fetch(`${this.baseURL}/logs`);

    if (!response.ok) {
      throw new Error(`Error fetching logs: ${response.statusText}`);
    }

    return await response.json();
  }

  static async deleteLogs(): Promise<{ count: number }> {
    const response = await fetch(`${this.baseURL}/logs`, { method: "DELETE" });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  }

  static async deleteLog(timestamp: string): Promise<{ count: number }> {
    const response = await fetch(`${this.baseURL}/logs/${timestamp}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  }

  static async statistics(): Promise<IStatisticsResponse> {
    const response = await fetch(`${this.baseURL}/statistics`);

    if (!response.ok) {
      throw new Error(`Error fetching statistics: ${response.statusText}`);
    }

    return response.json();
  }

  static async config(): Promise<IConfig> {
    const response = await fetch(`${this.baseURL}/config`);

    if (!response.ok) {
      throw new Error(`Error fetching config: ${response.statusText}`);
    }

    return response.json();
  }

  static async updateConfig(cfg: IConfig): Promise<IApiResponse> {
    const response = await fetch(`${this.baseURL}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });

    if (!response.ok) {
      throw new Error(`Error updating config: ${response.statusText}`);
    }

    return response.json();
  }

  static dumpUrl() {
    return `${import.meta.env.VITE_API_BASE_URL}/dump`;
  }
}
