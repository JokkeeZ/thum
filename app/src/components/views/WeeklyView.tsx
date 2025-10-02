import {
  Activity,
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  fetchMinMaxValues,
  isChromiumBased,
  useNotification,
  type IDataChart,
  type IMinMaxValuesLoaded,
} from "../../types";
import moment from "moment";
import { ApiUrl } from "../../config";

function WeeklyView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>;
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const [year, setYear] = useState(0);
  const [week, setWeek] = useState(0);

  const [minMax, setMinMax] = useState<IMinMaxValuesLoaded>({
    first: undefined,
    last: undefined,
    loaded: false,
  });

  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

  useEffect(() => {
    fetchMinMaxValues(`${ApiUrl}/range/weeks`)
      .then((val) => {
        setMinMax(val);

        const last = moment(val.last);
        setYear(last.year());
        setWeek(last.week());
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, [setMinMax, setYear, setWeek, addNotification]);

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

    setYear(selection.year());
    setWeek(selection.week());
  };

  const setWeekFromUserInput = (e: ChangeEvent<HTMLInputElement>) => {
    const w = e.currentTarget.valueAsNumber;
    if (isNaN(w)) {
      return;
    }

    setWeek(w);
  };

  const setYearFromUserInput = (e: ChangeEvent<HTMLInputElement>) => {
    const y = e.currentTarget.valueAsNumber;
    if (isNaN(y)) {
      return;
    }

    setYear(y);
  };

  useEffect(() => {
    if (!minMax.loaded) {
      return;
    }

    const weekString = moment()
      .isoWeekYear(year)
      .isoWeek(week)
      .format("GGGG-[W]WW");

    fetch(`${ApiUrl}/sensor/weekly/${weekString}`)
      .then((resp) => resp.json())
      .then((resp) => {
        setChartData({
          labels: resp.labels,
          temperatures: resp.temperatures,
          humidities: resp.humidities,
        });
        setChartReady(true);
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, [setChartData, minMax, year, week, setChartReady, addNotification]);

  return (
    <div className="col-md-6 mx-auto">
      <Activity mode={minMax.loaded ? "visible" : "hidden"}>
        <form>
          <Activity mode={isChromiumBased() ? "visible" : "hidden"}>
            <div className="row mb-3 mt-3">
              <div className="form-group">
                <label htmlFor="date">Select week (Chromium)</label>
                <input
                  className="form-control"
                  type="week"
                  min={minMax.first}
                  max={minMax.last}
                  value={moment()
                    .isoWeekYear(year)
                    .isoWeek(week)
                    .format("GGGG-[W]WW")}
                  onChange={onWeekChangedOnChromium}
                />
              </div>
            </div>
          </Activity>

          <Activity mode={isChromiumBased() ? "hidden" : "visible"}>
            <div className="row mb-3 mt-3">
              <label htmlFor="year-week">Select week and year</label>
              <div className="input-group mb-3 mt-1">
                <input
                  className="form-control"
                  id="week"
                  type="number"
                  min={1}
                  max={moment().isoWeekYear(year).isoWeeksInISOWeekYear()}
                  value={week}
                  onChange={setWeekFromUserInput}
                />
                <input
                  className="form-control"
                  id="year"
                  type="number"
                  min={moment(minMax.first).year()}
                  max={moment(minMax.last).year()}
                  value={year}
                  onChange={setYearFromUserInput}
                />
              </div>
            </div>
          </Activity>
        </form>
      </Activity>
    </div>
  );
}

export default WeeklyView;
