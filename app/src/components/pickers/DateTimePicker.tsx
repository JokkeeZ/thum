import type { ChangeEvent, JSX } from "react";
import CenteredSpinnyLoader from "../CenteredSpinnyLoader";
import ChromiumPicker from "../ChromiumPicker";
import { useDateRange } from "../daterange/DateRangeContext";
import { isChromiumBrowser } from "../../utils/chromium-detect";
import { DateTime, Info } from "luxon";
import YearSelector from "../YearSelector";

export default function DateTimePicker(props: {
  type: "date" | "week" | "month" | "range";

  // TODO: Validate DateTime.isValid and change param to DateTime<true>.
  onDateSelected?: (d: Date) => void;
  onWeekChanged?: (n: number) => void;
  onYearChanged?: (y: number) => void;
  onMonthChanged?: (m: number) => void;
  onRangeStartChanged?: (d: Date) => void;
  onRangeEndChanged?: (d: Date) => void;
}) {
  const { dates, weeks, months } = useDateRange();

  if (!dates || !weeks || !months) {
    return <CenteredSpinnyLoader />;
  }

  const defaultWeekValue = DateTime.fromISO(weeks.last);
  const defaultMonthValue = DateTime.fromISO(months.last);

  const onWeekChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const week = e.currentTarget.valueAsNumber;
    if (isNaN(week) || !Number.isInteger(week)) {
      return;
      // TODO
    }

    if (props.onWeekChanged) props.onWeekChanged(week);
  };

  const onMonthChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(event.currentTarget.value);

    if (!month) {
      return;
      // TODO
    }

    if (props.onMonthChanged) props.onMonthChanged(month);
  };

  const pickers: { [type: string]: JSX.Element } = {
    date: (
      <ChromiumPicker
        type="date"
        min={dates.first}
        max={dates.last}
        defaultValue={dates.last}
        onChange={(d) => {
          if (props.onDateSelected) {
            props.onDateSelected(d);
          }
        }}
      />
    ),
    week: isChromiumBrowser() ? (
      <ChromiumPicker
        type="week"
        min={weeks.first}
        max={weeks.last}
        defaultValue={defaultWeekValue.toFormat("kkkk-'W'WW")}
        onChange={(d) => {
          if (props.onDateSelected) {
            props.onDateSelected(d);
          }
        }}
      />
    ) : (
      <div className="input-group">
        <input
          className="form-control"
          id="week"
          type="number"
          min={1}
          max={defaultWeekValue.weeksInWeekYear}
          defaultValue={defaultWeekValue.weekNumber}
          onChange={onWeekChanged}
        />

        <YearSelector
          daterange={weeks}
          onYearChanged={(y) => {
            if (props.onYearChanged) props.onYearChanged(y);
          }}
        />
      </div>
    ),
    month: isChromiumBrowser() ? (
      <ChromiumPicker
        type="month"
        min={months.first}
        max={months.last}
        defaultValue={defaultMonthValue.toFormat("yyyy-MM")}
        onChange={(d) => {
          if (props.onDateSelected) {
            props.onDateSelected(d);
          }
        }}
      />
    ) : (
      <div className="input-group" id="picker">
        <select
          className="form-select"
          onChange={onMonthChanged}
          defaultValue={defaultMonthValue.month}
        >
          {Info.months().map((m, i) => {
            return (
              <option key={i} value={i + 1}>
                {m}
              </option>
            );
          })}
        </select>

        <YearSelector
          daterange={months}
          onYearChanged={(y) => {
            if (props.onYearChanged) props.onYearChanged(y);
          }}
        />
      </div>
    ),
    range: (
      <div className="input-group" id="date-select">
        <ChromiumPicker
          type="date"
          min={dates.first}
          max={dates.last}
          defaultValue={dates.first}
          onChange={(d) => {
            if (props.onRangeStartChanged) {
              props.onRangeStartChanged(d);
            }
          }}
        />
        <ChromiumPicker
          type="date"
          min={dates.first}
          max={dates.last}
          defaultValue={dates.last}
          onChange={(d) => {
            if (props.onRangeEndChanged) {
              props.onRangeEndChanged(d);
            }
          }}
        />
      </div>
    ),
  };

  return (
    <div className="col-md-6 mx-auto">
      <form>
        <div className="row mb-3 mt-3">
          <div className="form-group">
            <label htmlFor="picker">Select {props.type}</label>
            {pickers[props.type]}
          </div>
        </div>
      </form>
    </div>
  );
}
