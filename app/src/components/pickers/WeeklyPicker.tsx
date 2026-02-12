import { useState, type ChangeEvent } from "react";
import { DateTime } from "luxon";
import type { IDateRange } from "@/types/IDateRange";
import YearPicker from "./YearPicker";

interface IWeekRange {
  minimum: number;
  maximum: number;
}

export default function WeeklyPicker(props: {
  weeks: IDateRange;
  onWeekChanged?: (m: number) => void;
  onYearChanged?: (y: number) => void;
}) {
  const [error, setError] = useState(false);

  const minimum = DateTime.fromISO(props.weeks.first);
  const maximum = DateTime.fromISO(props.weeks.last);

  const getWeeksCountBasedOnYear = (year: number): IWeekRange => {
    if (!minimum.isValid || !maximum.isValid) {
      return {
        minimum: 1,
        maximum: DateTime.fromObject({ weekYear: year }).weeksInLocalWeekYear,
      };
    }

    if (year == minimum.localWeekYear) {
      // weeks = [minimum...maximum]
      if (maximum.localWeekYear == year) {
        return {
          minimum: minimum.localWeekNumber,
          maximum: maximum.localWeekNumber,
        };
      }
      // weeks = [minimum...year.weeksInLocalWeekYear]
      else {
        return {
          minimum: minimum.localWeekNumber,
          maximum: DateTime.fromObject({ weekYear: year }).weeksInLocalWeekYear,
        };
      }
    }
    // weeks = [1...maximum]
    else if (year == maximum.localWeekYear) {
      return {
        minimum: 1,
        maximum: maximum.localWeekNumber,
      };
    }
    // weeks = [1...year.weeksInLocalWeekYear]
    else {
      return {
        minimum: 1,
        maximum: DateTime.fromObject({ weekYear: year }).weeksInLocalWeekYear,
      };
    }
  };

  const [inputWeek, setInputWeek] = useState<number>(maximum.localWeekNumber);

  const [weeks, setWeeks] = useState<IWeekRange>(
    getWeeksCountBasedOnYear(maximum.localWeekYear),
  );

  const onWeekChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const week = e.currentTarget.valueAsNumber;
    if (isNaN(week) || !Number.isInteger(week)) {
      setError(true);
      return;
    }

    if (week < weeks.minimum || week > weeks.maximum) {
      setError(true);
      return;
    }

    setError(false);
    setInputWeek(week);
    if (props.onWeekChanged) props.onWeekChanged(week);
  };

  const onYearChanged = (year: number) => {
    const weeksInSelectedYear = getWeeksCountBasedOnYear(year);
    setWeeks(weeksInSelectedYear);

    setInputWeek(weeksInSelectedYear.minimum);
    props.onWeekChanged?.(weeksInSelectedYear.minimum);
    props.onYearChanged?.(year);
  };

  return (
    <div className="input-group">
      <input
        className={`form-control ${error ? "is-invalid" : ""}`}
        id="week"
        type="number"
        min={weeks.minimum}
        max={weeks.maximum}
        value={inputWeek}
        onChange={onWeekChanged}
      />

      <YearPicker
        daterange={props.weeks}
        onYearChanged={(y) => onYearChanged(y)}
      />
    </div>
  );
}
