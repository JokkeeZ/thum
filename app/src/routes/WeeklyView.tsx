import { useEffect, useState } from "react";
import { type IDataChart } from "../types/IDataChart";
import moment from "moment";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import WeekPicker from "../components/WeekPicker";
import ApiService from "../services/ApiService";

export default function WeeklyView() {
  const now = moment();
  const [year, setYear] = useState(now.year());
  const [week, setWeek] = useState(now.week());

  const { errorNotification } = useNotification();
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });
  const [chartReady, setChartReady] = useState<boolean>(false);

  useEffect(() => {
    const weekString = moment().isoWeekYear(year).format("GGGG-[W]WW");

    console.log(weekString);

    ApiService.weekly(weekString)
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
  }, [year, week, errorNotification]);

  return (
    <>
      <div className="col-md-6 mx-auto">
        <WeekPicker setWeek={setWeek} setYear={setYear} />
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}
