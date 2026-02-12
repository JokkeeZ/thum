export default function StatisticsItem(props: {
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
