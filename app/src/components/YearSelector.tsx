import type { ChangeEvent } from "react";
import type { IDateRange } from "../types/IDateRange";
import moment from "moment";

export default function YearSelector(props: {
  daterange: IDateRange;
  onYearChanged: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      className="form-control"
      id="year"
      type="number"
      min={moment(props.daterange.first).year()}
      max={moment(props.daterange.last).year()}
      defaultValue={moment(props.daterange.last).year()}
      onChange={props.onYearChanged}
    />
  );
}
