import { type ChangeEvent, type SetStateAction } from "react";
import { isChromiumBrowser } from "../utils/chromium-detect";
import { useNotification } from "./notification/NotificationContext";
import SpinnyLoader from "./SpinnyLoader";
import ChromiumPicker from "./ChromiumPicker";
import { useDateRange } from "./daterange/DateRangeContext";
import YearSelector from "./YearSelector";
import { DateTime } from "luxon";

export default function WeekPicker(props: {
  setYear: (value: SetStateAction<number>) => void;
  setWeek: (value: SetStateAction<number>) => void;
}) {
  const { weeks } = useDateRange();

  const { errorNotification } = useNotification();

  const onWeekChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const week = e.currentTarget.valueAsNumber;
    if (isNaN(week) || !Number.isInteger(week)) {
      return errorNotification("Invalid week selected.");
    }

    props.setWeek(week);
  };

  const onYearChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const year = e.currentTarget.valueAsNumber;
    if (isNaN(year) || !Number.isInteger(year)) {
      return errorNotification("Invalid year selected.");
    }

    props.setYear(year);
  };

  const onWeekChangedOnChromium = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.currentTarget.valueAsDate;
    if (!date) {
      return errorNotification("Invalid week selected.");
    }

    const selection = DateTime.fromJSDate(date);
    props.setYear(selection.year);
    props.setWeek(selection.localWeekNumber);
  };

  if (!weeks) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <SpinnyLoader width={50} height={50} />
      </div>
    );
  }

  const defaultVal = DateTime.fromISO(weeks.last);

  return (
    <form>
      <div className="row mb-3 mt-3">
        {isChromiumBrowser() ? (
          <ChromiumPicker
            type="week"
            min={weeks.first}
            max={weeks.last}
            defaultValue={defaultVal.toFormat("kkkk-'W'WW")}
            onChange={onWeekChangedOnChromium}
          />
        ) : (
          <>
            <label htmlFor="year-week">Select week and year</label>
            <div className="input-group mb-3 mt-1">
              <input
                className="form-control"
                id="week"
                type="number"
                min={1}
                max={defaultVal.weeksInWeekYear}
                defaultValue={defaultVal.weekNumber}
                onChange={onWeekChanged}
              />

              <YearSelector daterange={weeks} onYearChanged={onYearChanged} />
            </div>
          </>
        )}
      </div>
    </form>
  );
}
