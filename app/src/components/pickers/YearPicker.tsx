import { useState, type ChangeEvent } from "react";
import { DateTime } from "luxon";
import type { IDateRange } from "@/types/IDateRange";

export default function YearPicker(props: {
  daterange: IDateRange;
  onYearChanged: (year: number) => void;
}) {
  const minimum = DateTime.fromISO(props.daterange.first);
  const maximum = DateTime.fromISO(props.daterange.last);

  const [hasError, setHasError] = useState(false);

  const onYearChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const year = event.currentTarget.valueAsNumber;

    if (!year || isNaN(year)) {
      setHasError(true);
      return;
    }

    if (year < minimum.weekYear || year > maximum.weekYear) {
      setHasError(true);
      return;
    }

    setHasError(false);
    props.onYearChanged(year);
  };

  return (
    <input
      className={`form-control ${hasError ? "is-invalid" : ""}`}
      id="year"
      type="number"
      min={minimum.weekYear}
      max={maximum.weekYear}
      defaultValue={maximum.weekYear}
      onChange={onYearChanged}
    />
  );
}
