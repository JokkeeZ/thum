import { type ChangeEvent, type SetStateAction } from "react";
import { isChromiumBrowser } from "../utils/chromium-detect";
import { useNotification } from "./notification/NotificationContext";
import ChromiumPicker from "./ChromiumPicker";
import { useDateRange } from "./daterange/DateRangeContext";
import YearSelector from "./YearSelector";
import { DateTime } from "luxon";
import CenteredSpinnyLoader from "./CenteredSpinnyLoader";

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

  const onWeekChangedOnChromium = (date: Date) => {
    const selection = DateTime.fromJSDate(date);
    props.setYear(selection.year);
    props.setWeek(selection.localWeekNumber);
  };

  if (!weeks) {
    return <CenteredSpinnyLoader />;
  }

  const defaultVal = DateTime.fromISO(weeks.last);

  return (
    <form>
      <div className="row mb-3 mt-3">
        {isChromiumBrowser() ? (
          <div className="form-group">
            <label htmlFor="picker">Select week</label>
            <ChromiumPicker
              type="week"
              min={weeks.first}
              max={weeks.last}
              defaultValue={defaultVal.toFormat("kkkk-'W'WW")}
              onChange={onWeekChangedOnChromium}
            />
          </div>
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

              <YearSelector
                daterange={weeks}
                onYearChanged={(y) => props.setYear(y)}
              />
            </div>
          </>
        )}
      </div>
    </form>
  );
}
