import { useEffect, useState } from "react";
import { type IDataChart } from "../types/IDataChart";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import ApiService from "../services/ApiService";
import { DateTime } from "luxon";
import ChromiumPicker from "../components/ChromiumPicker";
import { useDateRange } from "../components/daterange/DateRangeContext";
import CenteredSpinnyLoader from "../components/CenteredSpinnyLoader";

export default function DailyView() {
  const now = DateTime.now();
  const [date, setDate] = useState(now.toJSDate());
  const [chartReady, setChartReady] = useState<boolean>(false);
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });

  const { dates } = useDateRange();
  const { errorNotification } = useNotification();

  useEffect(() => {
    const dd = DateTime.fromJSDate(date);

    ApiService.daily(dd.day, dd.month, dd.year)
      .then((resp) => {
        setChartData({
          labels: resp.data.map((p) => p.ts),
          temperatures: resp.data.map((p) => p.temperature),
          humidities: resp.data.map((p) => p.humidity),
        });

        setChartReady(true);
      })
      .catch((err) => {
        errorNotification("Failed to fetch data from API.");
        console.error(err);
      });
  }, [date, errorNotification]);

  if (!dates) {
    return <CenteredSpinnyLoader />;
  }

  return (
    <>
      <div className="col-md-6 mx-auto">
        <form>
          <div className="row mb-3 mt-3">
            <div className="form-group">
              <label htmlFor="picker">Select date</label>
              <ChromiumPicker
                type="date"
                min={dates.first}
                max={dates.last}
                defaultValue={dates.last}
                onChange={(d) => setDate(d)}
              />
            </div>
          </div>
        </form>
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}
