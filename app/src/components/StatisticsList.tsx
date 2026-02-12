import type { IStatisticsResponse } from "../types/IStatisticsResponse";

function StatisticsItem(props: {
  label: string;
  value: string | number;
  unit: "" | "°C" | "%";
}) {
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
      {props.label}
      <span className="badge bg-primary">
        {props.value}
        {props.unit}
      </span>
    </li>
  );
}

export default function StatisticsList(props: { stats: IStatisticsResponse }) {
  return (
    <ul className="list-group list-group-flush">
      <StatisticsItem
        label="Total Entries"
        value={props.stats?.total_entries}
        unit=""
      />
      <StatisticsItem
        label="Average Temperature"
        value={props.stats?.avg_temperature.toFixed(2)}
        unit="°C"
      />
      <StatisticsItem
        label="Average Humidity"
        value={props.stats?.avg_humidity.toFixed(2)}
        unit="%"
      />
      <StatisticsItem
        label={`Max. Temperature — ${props.stats?.max_temperature.date}`}
        value={props.stats?.max_temperature.value}
        unit="°C"
      />
      <StatisticsItem
        label={`Min. Temperature — ${props.stats?.min_temperature.date}`}
        value={props.stats?.min_temperature.value}
        unit="°C"
      />
      <StatisticsItem
        label={`Max. Humidity — ${props.stats?.max_humidity.date}`}
        value={props.stats?.max_humidity.value}
        unit="%"
      />
      <StatisticsItem
        label={`Min. Humidity — ${props.stats?.min_humidity.date}`}
        value={props.stats?.min_humidity.value}
        unit="%"
      />
    </ul>
  );
}
