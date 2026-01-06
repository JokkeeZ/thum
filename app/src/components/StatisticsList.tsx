import type { IStatisticsResponse } from "../types/IStatisticsResponse";

export default function StatisticsList(props: { stats: IStatisticsResponse }) {
  return (
    <ul className="list-group list-group-flush">
      <li className="list-group-item d-flex justify-content-between align-items-center">
        Total Entries
        <span className="badge bg-primary rounded-pill">
          {props.stats?.total_entries}
        </span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
        Average Temperature
        <span className="badge bg-primary rounded-pill">
          {props.stats?.avg_temperature.toFixed(2)}°C
        </span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
        Average Humidity
        <span className="badge bg-primary rounded-pill">
          {props.stats?.avg_humidity.toFixed(2)}%
        </span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
        Maximum Temperature — {props.stats?.max_temperature.date}
        <span className="badge bg-primary rounded-pill">
          {props.stats?.max_temperature.value}°C
        </span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
        Minimum Temperature — {props.stats?.min_temperature.date}
        <span className="badge bg-primary rounded-pill">
          {props.stats?.min_temperature.value}°C
        </span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
        Maximum Humidity — {props.stats?.max_humidity.date}
        <span className="badge bg-primary rounded-pill">
          {props.stats?.max_humidity.value}%
        </span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
        Minimum Humidity — {props.stats?.min_humidity.date}
        <span className="badge bg-primary rounded-pill">
          {props.stats?.min_humidity.value}%
        </span>
      </li>
    </ul>
  );
}
