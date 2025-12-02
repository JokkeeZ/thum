import { Activity, useEffect, useState, type ChangeEvent } from "react";
import { type IMinMaxValuesLoaded } from "../types/IMinMaxValuesLoaded";
import { type IDataChart } from "../types/IDataChart";
import moment from "moment";
import { ApiUrl } from "../config";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import { fetchMinMaxValues } from "../utils/utils";
import type { ISensorReadingEntry } from "../types/ISensorReadingEntry";

export default function RangeView() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [minMax, setMinMax] = useState<IMinMaxValuesLoaded>({
    first: undefined,
    last: undefined,
    loaded: false,
  });

  const { addNotification } = useNotification();
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });
  const [chartReady, setChartReady] = useState<boolean>(false);

  useEffect(() => {
    fetchMinMaxValues(`${ApiUrl}/range/dates`)
      .then((val) => {
        setMinMax(val);

        if (val.first) {
          setStartDate(moment(val.first).toDate());
        }

        if (val.last) {
          setEndDate(moment(val.last).toDate());
        }
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, [setMinMax, addNotification]);

  const onStartDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid date selected.",
      });
      return;
    }

    setStartDate(selectedDate);
  };

  const onEndDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid date selected.",
      });
      return;
    }

    setEndDate(selectedDate);
  };

  useEffect(() => {
    if (!minMax.loaded) {
      return;
    }

    const start = moment(startDate).format("YYYY-MM-DD");
    const end = moment(endDate).format("YYYY-MM-DD");

    fetch(`${ApiUrl}/sensor/range/${start}/${end}`)
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
  }, [
    setChartData,
    minMax,
    startDate,
    endDate,
    setChartReady,
    addNotification,
  ]);

  return (
    <>
      <div className="col-md-6 mx-auto">
        <Activity mode={minMax.loaded ? "visible" : "hidden"}>
          <form>
            <div className="row mb-3 mt-3">
              <label htmlFor="date-select">Select start & end dates</label>
              <div className="input-group" id="date-select">
                <input
                  className="form-control"
                  type="date"
                  min={minMax.first}
                  max={minMax.last}
                  defaultValue={minMax.first}
                  onChange={onStartDateChanged}
                />
                <input
                  className="form-control"
                  type="date"
                  min={minMax.first}
                  max={minMax.last}
                  defaultValue={minMax.last}
                  onChange={onEndDateChanged}
                />
              </div>
            </div>
          </form>
        </Activity>
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}
