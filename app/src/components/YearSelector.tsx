import type { ChangeEvent } from "react";
import type { IDateRange } from "../types/IDateRange";
import moment from "moment";

export default function YearSelector(props: {
  daterange: IDateRange;
  onYearChanged: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const minimum = moment(props.daterange.first, "GGGG-[W]WW").isoWeekYear();
  const maximum = moment(props.daterange.last, "GGGG-[W]WW").isoWeekYear();

  return (
    <input
      className="form-control"
      id="year"
      type="number"
      min={minimum}
      max={maximum}
      defaultValue={maximum}
      onChange={props.onYearChanged}
    />
  );
}
