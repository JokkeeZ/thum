import { useEffect, useState } from "react";
import { type IDataChart } from "../types/IDataChart";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import ApiService from "../services/ApiService";
import { useDateRange } from "../components/daterange/DateRangeContext";
import { DateTime } from "luxon";
import ChromiumPicker from "../components/ChromiumPicker";
import CenteredSpinnyLoader from "../components/CenteredSpinnyLoader";

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
    return <CenteredSpinnyLoader />;
  }

  return (
    <>
      <div className="col-md-6 mx-auto">
        <form>
          <div className="row mb-3 mt-3">
            <label htmlFor="date-select">Select start & end dates</label>
            <div className="input-group" id="date-select">
              <ChromiumPicker
                type="date"
                min={dates.first}
                max={dates.last}
                defaultValue={dates.first}
                onChange={(d) => setStartDate(d)}
              />
              <ChromiumPicker
                type="date"
                min={dates.first}
                max={dates.last}
                defaultValue={dates.last}
                onChange={(d) => setEndDate(d)}
              />
            </div>
          </div>
        </form>
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}
