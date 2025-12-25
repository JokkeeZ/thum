export interface IStatisticsResponse {
  total_entries: number;
  avg_temperature: number;
  avg_humidity: number;
  min_temperature: { value: number; date: string };
  max_temperature: { value: number; date: string };
  min_humidity: { value: number; date: string };
  max_humidity: { value: number; date: string };
}
