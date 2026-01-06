import { type ChangeEvent, type SetStateAction } from "react";
import { isChromiumBrowser } from "../utils/chromium-detect";
import ChromiumPicker from "./ChromiumPicker";
import { useDateRange } from "./daterange/DateRangeContext";
import YearSelector from "./YearSelector";
import { DateTime, Info } from "luxon";
import CenteredSpinnyLoader from "./CenteredSpinnyLoader";

export default function MonthPicker(props: {
  setYear: (value: SetStateAction<number>) => void;
  setMonth: (value: SetStateAction<number>) => void;
}) {
  const { months } = useDateRange();

  const onMonthChangedOnChromium = (date: Date) => {
    const selection = DateTime.fromJSDate(date);
    props.setYear(selection.year);
    props.setMonth(selection.month);
  };

  const onMonthChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    props.setMonth(parseInt(event.currentTarget.value));
  };

  if (!months) {
    return <CenteredSpinnyLoader />;
  }

  const defaultVal = DateTime.fromISO(months.last);

  return (
    <form>
      <div className="row mb-3 mt-3">
        {isChromiumBrowser() ? (
          <div className="form-group">
            <label htmlFor="picker">Select month</label>
            <ChromiumPicker
              type="month"
              min={months.first}
              max={months.last}
              defaultValue={defaultVal.toFormat("yyyy-MM")}
              onChange={onMonthChangedOnChromium}
            />
          </div>
        ) : (
          <>
            <label htmlFor="year-month">Select month and year</label>
            <div className="input-group mb-3 mt-1" id="year-month">
              <select
                className="form-select"
                onChange={onMonthChanged}
                defaultValue={defaultVal.month}
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
                onYearChanged={(y) => props.setYear(y)}
              />
            </div>
          </>
        )}
      </div>
    </form>
  );
}
