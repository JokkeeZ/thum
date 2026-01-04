import type { ChangeEvent } from "react";
import type { IDateRange } from "../types/IDateRange";
import { DateTime } from "luxon";

export default function YearSelector(props: {
  daterange: IDateRange;
  onYearChanged: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const minimum = DateTime.fromISO(props.daterange.first);
  const maximum = DateTime.fromISO(props.daterange.last);

  return (
    <input
      className="form-control"
      id="year"
      type="number"
      min={minimum.weekYear}
      max={maximum.weekYear}
      defaultValue={maximum.weekYear}
      onChange={props.onYearChanged}
    />
  );
}
