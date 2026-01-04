import { useEffect, useState, type ChangeEvent } from "react";
import { type IDataChart } from "../types/IDataChart";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import ApiService from "../services/ApiService";
import SpinnyLoader from "../components/SpinnyLoader";
import { useDateRange } from "../components/daterange/DateRangeContext";
import { DateTime } from "luxon";

export default function RangeView() {
  const { errorNotification } = useNotification();
  const { dates } = useDateRange();

  const [chartReady, setChartReady] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });

  const onStartDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      errorNotification("Invalid date selected.");
      return;
    }

    setStartDate(selectedDate);
  };

  const onEndDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      errorNotification("Invalid date selected.");
      return;
    }

    setEndDate(selectedDate);
  };

  useEffect(() => {
    if (!dates) return;

    const rangeStart = (
      startDate !== undefined
        ? DateTime.fromJSDate(startDate)
        : DateTime.fromISO(dates.first)
    ).toFormat("yyyy-MM-dd");

    const rangeEnd = (
      endDate !== undefined
        ? DateTime.fromJSDate(endDate)
        : DateTime.fromISO(dates.last)
    ).toFormat("yyyy-MM-dd");

    ApiService.range(rangeStart, rangeEnd)
      .then((resp) => {
        setChartData({
          labels: resp.data.map((p) => p.ts),
          temperatures: resp.data.map((p) => p.temperature),
          humidities: resp.data.map((p) => p.humidity),
        });

        setChartReady(true);
      })
      .catch((error) => {
        errorNotification("Failed to fetch data from API.");
        console.error(error);
      });
  }, [dates, startDate, endDate, errorNotification]);

  if (!dates) {
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
                min={dates.first}
                max={dates.last}
                defaultValue={dates.first}
                onChange={onStartDateChanged}
              />
              <input
                className="form-control"
                type="date"
                min={dates.first}
                max={dates.last}
                defaultValue={dates.last}
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
