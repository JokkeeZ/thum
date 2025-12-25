import { useEffect, useState, type ChangeEvent } from "react";
import { type IMinMaxValues } from "../types/IMinMaxValuesLoaded";
import { type IDataChart } from "../types/IDataChart";
import moment from "moment";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import ApiService from "../services/ApiService";
import SpinnyLoader from "../components/SpinnyLoader";

export default function RangeView() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [minMax, setMinMax] = useState<IMinMaxValues>({
    first: "",
    last: "",
  });
  const [minMaxLoaded, setMinMaxLoaded] = useState(false);

  const { addNotification } = useNotification();
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });
  const [chartReady, setChartReady] = useState<boolean>(false);

  useEffect(() => {
    ApiService.dates()
      .then((resp) => {
        setMinMax(resp.data);
        setStartDate(moment(resp.data.first).toDate());
        setEndDate(moment(resp.data.last).toDate());
        setMinMaxLoaded(true);
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, []);

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
    const start = moment(startDate).format("YYYY-MM-DD");
    const end = moment(endDate).format("YYYY-MM-DD");

    ApiService.range(start, end)
      .then((resp) => {
        setChartData({
          labels: resp.data.map((p) => p.ts),
          temperatures: resp.data.map((p) => p.temperature),
          humidities: resp.data.map((p) => p.humidity),
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
  }, [minMax, startDate, endDate]);

  if (!minMaxLoaded) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <SpinnyLoader width={50} height={50} />
      </div>
    );
  }

  return (
    <>
      <div className="col-md-6 mx-auto">
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
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}
