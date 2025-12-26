import { type ChangeEvent, type SetStateAction } from "react";
import { isChromiumBrowser } from "../utils/chromium-detect";
import ChromiumPicker from "./ChromiumPicker";
import { useNotification } from "./notification/NotificationContext";
import moment from "moment";
import SpinnyLoader from "./SpinnyLoader";
import { useDateRange } from "./daterange/DateRangeContext";

export default function MonthPicker(props: {
  setYear: (value: SetStateAction<number>) => void;
  setMonth: (value: SetStateAction<number>) => void;
}) {
  const { months } = useDateRange();
  const { addNotification } = useNotification();

  const onMonthChangedOnChromium = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.currentTarget.valueAsDate;
    const selection = moment(date);

    if (!date) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid month selected.",
      });
      return;
    }

    props.setYear(selection.year());
    props.setMonth(selection.month() + 1);
  };

  const onYearChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    props.setYear(parseInt(event.currentTarget.value));
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
            <select
              className="form-select"
              onChange={onYearChanged}
              value={moment(months.last).year()}
            >
              {Array.from(
                {
                  length:
                    moment(months.last).year() -
                    moment(months.first).year() +
                    1,
                },
                (_, i) => {
                  const yearVal = moment(months.first).year() + i;
                  return (
                    <option key={yearVal} value={yearVal}>
                      {yearVal}
                    </option>
                  );
                },
              )}
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
