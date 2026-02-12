import { useState, type ChangeEvent } from "react";
import { DateTime, Info } from "luxon";
import type { IDateRange } from "@/types/IDateRange";
import YearPicker from "./YearPicker";

export default function MonthlyPicker(props: {
  months: IDateRange;
  onMonthChanged?: (m: number) => void;
  onYearChanged?: (y: number) => void;
}) {
  const [error, setError] = useState(false);

  const minimum = DateTime.fromISO(props.months.first);
  const maximum = DateTime.fromISO(props.months.last);

  const getMonthsBasedOnYear = (year: number): string[] => {
    if (!minimum.isValid || !maximum.isValid) return Info.months();

    const minimumIndex = Info.months().indexOf(minimum.monthLong);
    const maximumIndex = Info.months().indexOf(maximum.monthLong);

    if (year == minimum.localWeekYear) {
      // months = [minimum...maximum]
      if (maximum.localWeekYear == year) {
        return Info.months().filter((m, i) => {
          if (i >= minimumIndex && i <= maximumIndex) {
            return m;
          }
        });
      }
      // months = [minimum...12]
      else {
        return Info.months().filter((m, i) => {
          if (i >= minimumIndex) {
            return m;
          }
        });
      }
    }
    // months = [1...maximum]
    else if (year == maximum.localWeekYear) {
      return Info.months().filter((m, i) => {
        if (i <= maximumIndex) {
          return m;
        }
      });
    }
    // months = [1...12]
    else {
      return Info.months();
    }
  };

  const [inputMonth, setInputMonth] = useState<string>(
    maximum.monthLong ?? "January",
  );

  const [months, setMonths] = useState<string[]>(
    getMonthsBasedOnYear(maximum.localWeekYear),
  );

  const onMonthChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    const monthName = event.currentTarget.value;

    if (!monthName) {
      setError(true);
      return;
    }

    const monthIndex = Info.months().findIndex((m) => m === monthName);

    if (monthIndex === -1) {
      setError(true);
      return;
    }

    setError(false);
    setInputMonth(monthName);
    if (props.onMonthChanged) props.onMonthChanged(monthIndex + 1);
  };

  const onYearChanged = (year: number) => {
    const monthsInSelectedYear = getMonthsBasedOnYear(year);
    setMonths(monthsInSelectedYear);

    const firstMonthIndex = Info.months().findIndex(
      (month) => month === monthsInSelectedYear[0],
    );

    setInputMonth(Info.months()[firstMonthIndex]);
    props.onMonthChanged?.(firstMonthIndex + 1);
    props.onYearChanged?.(year);
  };

  return (
    <div className="input-group" id="picker">
      <select
        className={`form-select ${error ? "is-invalid" : ""}`}
        onChange={onMonthChanged}
        value={inputMonth}
      >
        {months.map((m, i) => {
          return (
            <option key={i} value={m}>
              {m}
            </option>
          );
        })}
      </select>

      <YearPicker
        daterange={props.months}
        onYearChanged={(y) => onYearChanged(y)}
      />
    </div>
  );
}
