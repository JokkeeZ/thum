import { type ChangeEvent, type SetStateAction } from "react";
import { isChromiumBrowser } from "../utils/chromium-detect";
import ChromiumPicker from "./ChromiumPicker";
import { useNotification } from "./notification/NotificationContext";
import SpinnyLoader from "./SpinnyLoader";
import { useDateRange } from "./daterange/DateRangeContext";
import YearSelector from "./YearSelector";
import { DateTime, Info } from "luxon";

export default function MonthPicker(props: {
  setYear: (value: SetStateAction<number>) => void;
  setMonth: (value: SetStateAction<number>) => void;
}) {
  const { months } = useDateRange();
  const { errorNotification } = useNotification();

  const onMonthChangedOnChromium = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.currentTarget.valueAsDate;

    if (!date) {
      errorNotification("Invalid month selected.");
      return;
    }

    const selection = DateTime.fromJSDate(date);
    props.setYear(selection.year);
    props.setMonth(selection.month);
  };

  const onYearChanged = (e: ChangeEvent<HTMLInputElement>) => {
    props.setYear(e.currentTarget.valueAsNumber);
  };

  const onMonthChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    props.setMonth(parseInt(event.currentTarget.value));
  };

  if (!months) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <SpinnyLoader width={50} height={50} />
      </div>
    );
  }

  const defaultVal = DateTime.fromISO(months.last);

  return (
    <form>
      <div className="row mb-3 mt-3">
        {isChromiumBrowser() ? (
          <ChromiumPicker
            type="month"
            min={months.first}
            max={months.last}
            defaultValue={defaultVal.toFormat("yyyy-MM")}
            onChange={onMonthChangedOnChromium}
          />
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

              <YearSelector daterange={months} onYearChanged={onYearChanged} />
            </div>
          </>
        )}
      </div>
    </form>
  );
}
