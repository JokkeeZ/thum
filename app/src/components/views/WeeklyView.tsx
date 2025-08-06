import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { isChromiumBased, useNotification, type IDataChart } from "../../types";
import moment from "moment";

function WeeklyView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>;
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const [year, setYear] = useState(moment().year());
  const [week, setWeek] = useState(moment().week());

  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

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

  useEffect(() => {
    setChartReady(false);
    const weekString = moment()
      .isoWeekYear(year)
      .isoWeek(week)
      .format("GGGG-[W]WW");

    fetch(`http://127.0.0.1:8000/api/sensor/weekly/${weekString}`)
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
          text: error.toString(),
        });
      });
  }, [setChartData, year, week, setChartReady, addNotification]);

  return (
    <div className="col-md-6 mx-auto">
      <form>
        {isChromiumBased() ? (
          // Chrome etc
          <div className="row mb-3 mt-3">
            <div className="form-group">
              <label htmlFor="date">Select week (Chromium)</label>
              <input
                className="form-control"
                type="week"
                max={moment().format("GGGG-[W]WW")}
                value={moment()
                  .isoWeekYear(year)
                  .isoWeek(week)
                  .format("GGGG-[W]WW")}
                onChange={onWeekChangedOnChromium}
              />
            </div>
          </div>
        ) : (
          <div className="row mb-3 mt-3">
            <label htmlFor="year-week">Select week and year</label>
            <div className="input-group mb-3 mt-1">
              <input
                className="form-control"
                id="week"
                type="number"
                min={1}
                max={moment().isoWeekYear(year).isoWeeksInISOWeekYear()}
                onChange={(e) => setWeek(e.currentTarget.valueAsNumber)}
                value={week}
                />
              <input
                className="form-control"
                id="year"
                type="number"
                min={2024} // @TODO: query min year from API before requesting data points
                max={year}
                value={year}
                onChange={(e) => setYear(e.currentTarget.valueAsNumber)}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default WeeklyView;
