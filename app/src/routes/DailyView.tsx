import { useEffect, useState } from "react";
import { type IDataChart } from "../types/IDataChart";
import moment from "moment";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import DatePicker from "../components/DatePicker";
import ApiService from "../services/ApiService";

export default function DailyView() {
  const now = moment();
  const [date, setDate] = useState(now.toDate());

  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });
  const [chartReady, setChartReady] = useState<boolean>(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    const dd = moment(date);
    const day = dd.date();
    const month = dd.month() + 1;
    const year = dd.year();

    ApiService.daily(day, month, year)
      .then((resp) => {
        setChartData({
          labels: resp.data.map((p) => p.ts),
          temperatures: resp.data.map((p) => p.temperature),
          humidities: resp.data.map((p) => p.humidity),
        });

        setChartReady(true);
      })
      .catch((err) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(err);
      });
  }, [date]);

  return (
    <>
      <div className="col-md-6 mx-auto">
        <DatePicker setDate={setDate} />
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}
