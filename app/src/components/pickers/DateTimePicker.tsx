import { type JSX } from "react";
import { DateTime } from "luxon";
import CenteredSpinnyLoader from "@/components/CenteredSpinnyLoader";
import ChromiumPicker from "./ChromiumPicker";
import { useDateRange } from "@/components/daterange/DateRangeContext";
import { isChromiumBrowser } from "@/utils/chromium-detect";
import MonthlyPicker from "./MonthlyPicker";
import WeeklyPicker from "./WeeklyPicker";

export default function DateTimePicker(props: {
  type: "date" | "week" | "month" | "range";
  onDateSelected?: (d: DateTime<true>) => void;
  onWeekChanged?: (n: number) => void;
  onYearChanged?: (y: number) => void;
  onMonthChanged?: (m: number) => void;
  onRangeStartChanged?: (d: DateTime<true>) => void;
  onRangeEndChanged?: (d: DateTime<true>) => void;
}) {
  const { dates, weeks, months } = useDateRange();

  if (!dates || !weeks || !months) {
    return <CenteredSpinnyLoader />;
  }

  const defaultWeekValue = DateTime.fromISO(weeks.last);
  const defaultMonthValue = DateTime.fromISO(months.last);
  const isChromium = isChromiumBrowser();

  const pickers: { [type: string]: JSX.Element } = {
    date: (
      <ChromiumPicker
        type="date"
        min={dates.first}
        max={dates.last}
        defaultValue={dates.last}
        onChange={(d) => props.onDateSelected?.(d)}
      />
    ),
    week: isChromium ? (
      <ChromiumPicker
        type="week"
        min={weeks.first}
        max={weeks.last}
        defaultValue={defaultWeekValue.toFormat("kkkk-'W'WW")}
        onChange={(d) => props.onDateSelected?.(d)}
      />
    ) : (
      <WeeklyPicker
        weeks={weeks}
        onWeekChanged={props.onWeekChanged}
        onYearChanged={props.onYearChanged}
      />
    ),
    month: isChromium ? (
      <ChromiumPicker
        type="month"
        min={months.first}
        max={months.last}
        defaultValue={defaultMonthValue.toFormat("yyyy-MM")}
        onChange={(d) => props.onDateSelected?.(d)}
      />
    ) : (
      <MonthlyPicker
        months={months}
        onMonthChanged={props.onMonthChanged}
        onYearChanged={props.onYearChanged}
      />
    ),
    range: (
      <div className="input-group" id="date-select">
        <ChromiumPicker
          type="date"
          min={dates.first}
          max={dates.last}
          defaultValue={dates.first}
          onChange={(d) => props.onRangeStartChanged?.(d)}
        />
        <ChromiumPicker
          type="date"
          min={dates.first}
          max={dates.last}
          defaultValue={dates.last}
          onChange={(d) => props.onRangeEndChanged?.(d)}
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
