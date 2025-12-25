import { useEffect, useState, type ChangeEvent, type SetStateAction } from "react";
import { isChromiumBrowser } from "../utils/chromium-detect";
import ChromiumPicker from "./ChromiumPicker";
import type { IMinMaxValues } from "../types/IMinMaxValuesLoaded";
import { useNotification } from "./notification/NotificationContext";
import moment from "moment";
import ApiService from "../services/ApiService";
import SpinnyLoader from "./SpinnyLoader";

export default function MonthPicker(props: {
  setYear: (value: SetStateAction<number>) => void;
  setMonth: (value: SetStateAction<number>) => void;
}) {
  const [minMax, setMinMax] = useState<IMinMaxValues>({
    first: "",
    last: "",
  });
  const [minMaxLoaded, setMinMaxLoaded] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    ApiService.months()
      .then((resp) => {
        setMinMax(resp.data);
        setMinMaxLoaded(true);
      })
      .catch((err) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(err);
      });
  }, []);

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

  if (!minMaxLoaded) {
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
          min={minMax.first}
          max={minMax.last}
          defaultValue={moment(minMax.last).format("YYYY-MM")}
          onChange={onMonthChangedOnChromium}
        />
      ) : (
        <div className="row mb-3 mt-3">
          <label htmlFor="year-month">Select month and year</label>
          <div className="input-group mb-3 mt-1" id="year-month">
            <select
              className="form-select"
              onChange={onMonthChanged}
              defaultValue={moment(minMax.last).month() + 1}
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
              value={moment(minMax.last).year()}
            >
              {Array.from(
                {
                  length:
                    moment(minMax.last).year() -
                    moment(minMax.first).year() +
                    1,
                },
                (_, i) => {
                  const yearVal = moment(minMax.first).year() + i;
                  return (
                    <option key={yearVal} value={yearVal}>
                      {yearVal}
                    </option>
                  );
                }
              )}
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
