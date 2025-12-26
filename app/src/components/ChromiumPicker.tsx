import type { ChangeEvent } from "react";

export default function ChromiumPicker(props: {
  type: "date" | "week" | "month";
  min: string;
  max: string;
  defaultValue: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="form-group">
      <label htmlFor="picker">Select {props.type}</label>
      <input
        className="form-control"
        id="picker"
        name="picker"
        type={props.type}
        min={props.min}
        max={props.max}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
      />
    </div>
  );
}
