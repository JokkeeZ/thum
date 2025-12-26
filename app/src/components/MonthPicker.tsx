import { type ChangeEvent, type SetStateAction } from "react";
import { isChromiumBrowser } from "../utils/chromium-detect";
import ChromiumPicker from "./ChromiumPicker";
import { useNotification } from "./notification/NotificationContext";
import moment from "moment";
import SpinnyLoader from "./SpinnyLoader";
import { useDateRange } from "./daterange/DateRangeContext";
import YearSelector from "./YearSelector";

export default function MonthPicker(props: {
  setYear: (value: SetStateAction<number>) => void;
  setMonth: (value: SetStateAction<number>) => void;
}) {
  const { months } = useDateRange();
  const { errorNotification } = useNotification();

  const onMonthChangedOnChromium = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.currentTarget.valueAsDate;
    const selection = moment(date);

    if (!date) {
      errorNotification("Invalid month selected.");
      return;
    }

    props.setYear(selection.year());
    props.setMonth(selection.month() + 1);
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

  return (
    <form>
      {isChromiumBrowser() ? (
        <ChromiumPicker
          type="month"
          min={months.first}
          max={months.last}
          defaultValue={moment(months.last).format("YYYY-MM")}
          onChange={onMonthChangedOnChromium}
        />
      ) : (
        <div className="row mb-3 mt-3">
          <label htmlFor="year-month">Select month and year</label>
          <div className="input-group mb-3 mt-1" id="year-month">
            <select
              className="form-select"
              onChange={onMonthChanged}
              defaultValue={moment(months.last).month() + 1}
            >
              {moment.months().map((m, i) => {
                return (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                );
              })}
            </select>

            <YearSelector daterange={months} onYearChanged={onYearChanged} />
          </div>
        </div>
      )}
    </form>
  );
}
