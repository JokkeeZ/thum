import {
  type ChangeEvent,
  type SetStateAction,
} from "react";
import { isChromiumBrowser } from "../utils/chromium-detect";
import { useNotification } from "./notification/NotificationContext";
import moment from "moment";
import SpinnyLoader from "./SpinnyLoader";
import ChromiumPicker from "./ChromiumPicker";
import { useDateRange } from "./daterange/DateRangeContext";

export default function WeekPicker(props: {
  setYear: (value: SetStateAction<number>) => void;
  setWeek: (value: SetStateAction<number>) => void;
}) {
  const { weeks } = useDateRange();
  const { addNotification } = useNotification();

  const setWeekFromUserInput = (e: ChangeEvent<HTMLInputElement>) => {
    const w = e.currentTarget.valueAsNumber;
    if (isNaN(w)) {
      return;
    }

    props.setWeek(w);
  };

  const setYearFromUserInput = (e: ChangeEvent<HTMLInputElement>) => {
    const y = e.currentTarget.valueAsNumber;
    if (isNaN(y)) {
      return;
    }

    props.setYear(y);
  };

  const onWeekChangedOnChromium = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.currentTarget.valueAsDate;
    const selection = moment(date);

    if (!date) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid week selected.",
      });
      return;
    }

    props.setYear(selection.year());
    props.setWeek(selection.week());
  };

  if (!weeks) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <SpinnyLoader width={50} height={50} />
      </div>
    );
  }

  return (
    <form>
      <div className="row mb-3 mt-3">
        {isChromiumBrowser() ? (
          <ChromiumPicker
            type="week"
            min={weeks.first}
            max={weeks.last}
            defaultValue={moment(weeks.last).format("GGGG-[W]WW")}
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
                max={moment(weeks.last).isoWeeksInISOWeekYear()}
                defaultValue={moment(weeks.last).isoWeeksInISOWeekYear()}
                onChange={setWeekFromUserInput}
              />
              <input
                className="form-control"
                id="year"
                type="number"
                min={moment(weeks.first).year()}
                max={moment(weeks.last).year()}
                defaultValue={moment(weeks.last).year()}
                onChange={setYearFromUserInput}
              />
            </div>
          </>
        )}
      </div>
    </form>
  );
}
