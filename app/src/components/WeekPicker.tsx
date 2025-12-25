import {
  useEffect,
  useState,
  type ChangeEvent,
  type SetStateAction,
} from "react";
import { isChromiumBased } from "../utils/utils";
import type { IMinMaxValues } from "../types/IMinMaxValuesLoaded";
import ApiService from "../services/ApiService";
import { useNotification } from "./notification/NotificationContext";
import moment from "moment";
import SpinnyLoader from "./SpinnyLoader";
import ChromiumPicker from "./ChromiumPicker";

export default function WeekPicker(props: {
  setYear: (value: SetStateAction<number>) => void;
  setWeek: (value: SetStateAction<number>) => void;
}) {
  const [minMax, setMinMax] = useState<IMinMaxValues>({
    first: "",
    last: "",
  });
  const [minMaxLoaded, setMinMaxLoaded] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    ApiService.weeks()
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

  if (!minMaxLoaded) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <SpinnyLoader width={50} height={50} />
      </div>
    );
  }

  return (
    <form>
      <div className="row mb-3 mt-3">
        {isChromiumBased() ? (
          <ChromiumPicker
            type="week"
            min={minMax.first}
            max={minMax.last}
            defaultValue={moment(minMax.last).format("GGGG-[W]WW")}
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
                max={moment(minMax.last).isoWeeksInISOWeekYear()}
                defaultValue={moment(minMax.last).isoWeeksInISOWeekYear()}
                onChange={setWeekFromUserInput}
              />
              <input
                className="form-control"
                id="year"
                type="number"
                min={moment(minMax.first).year()}
                max={moment(minMax.last).year()}
                defaultValue={moment(minMax.last).year()}
                onChange={setYearFromUserInput}
              />
            </div>
          </>
        )}
      </div>
    </form>
  );
}
