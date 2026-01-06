import { DateTime } from "luxon";
import { useState, type ChangeEvent } from "react";

export default function ChromiumPicker(props: {
  type: "date" | "week" | "month";
  min: string;
  max: string;
  defaultValue: string;
  onChange: (date: DateTime<true>) => void;
}) {
  const [hasError, setHasError] = useState(false);

  const onDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      setHasError(true);
      return;
    }

    const selection = DateTime.fromJSDate(selectedDate).startOf("day");

    if (!selection.isValid) {
      setHasError(true);
      return;
    }

    const minAllowed = DateTime.fromISO(props.min).startOf("day");
    const maxAllowed = DateTime.fromISO(props.max).startOf("day");

    if (selection < minAllowed || selection > maxAllowed) {
      setHasError(true);
      return;
    }

    setHasError(false);
    props.onChange(selection);
  };

  return (
    <input
      className={`form-control ${hasError ? "is-invalid" : ""}`}
      id="picker"
      name="picker"
      type={props.type}
      min={props.min}
      max={props.max}
      defaultValue={props.defaultValue}
      onChange={onDateChanged}
    />
  );
}
