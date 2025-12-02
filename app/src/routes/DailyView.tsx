import { Activity, useEffect, useState, type ChangeEvent } from "react";
import {
  fetchMinMaxValues,
  type IDataChart,
  type IMinMaxValuesLoaded,
  type ISensorReadingEntry,
} from "../types";
import moment from "moment";
import { ApiUrl } from "../config";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";

export default function DailyView() {
  const now = moment();
  const [date, setDate] = useState(now.toDate());
  const [minMax, setMinMax] = useState<IMinMaxValuesLoaded>({
    first: undefined,
    last: undefined,
    loaded: false,
  });

  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });
  const [chartReady, setChartReady] = useState<boolean>(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    fetchMinMaxValues(`${ApiUrl}/range/dates`)
      .then((val) => setMinMax(val))
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, [setMinMax, addNotification]);

  const onDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid date selected.",
      });
      return;
    }

    setDate(selectedDate);
  };

  useEffect(() => {
    if (!minMax.loaded) {
      return;
    }

    const dd = moment(date);
    const day = dd.date();
    const month = dd.month() + 1;
    const year = dd.year();

    fetch(`${ApiUrl}/sensor/daily/${day}/${month}/${year}`)
      .then((resp) => resp.json())
      .then((resp) => {
        const data = resp as ISensorReadingEntry[];
        setChartData({
          labels: data.map((p) => p.ts),
          temperatures: data.map((p) => p.temperature),
          humidities: data.map((p) => p.humidity),
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
  }, [setChartData, minMax, date, setChartReady, addNotification]);

  return (
    <>
      <div className="col-md-6 mx-auto">
        <Activity mode={minMax.loaded ? "visible" : "hidden"}>
          <form>
            <div className="row mb-3 mt-3">
              <div className="form-group">
                <label htmlFor="date-select">Select date</label>
                <input
                  className="form-control"
                  type="date"
                  id="date-select"
                  name="date-select"
                  min={minMax.first}
                  max={minMax.last}
                  defaultValue={minMax.last}
                  onChange={onDateChanged}
                />
              </div>
            </div>
          </form>
        </Activity>
      </div>

      <DataChart chartData={chartData} chartReady={chartReady}/>
    </>
  );
}
