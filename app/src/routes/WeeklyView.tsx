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

  const { addNotification } = useNotification();
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });
  const [chartReady, setChartReady] = useState<boolean>(false);

  useEffect(() => {
    const weekString = moment()
      .isoWeekYear(year)
      .isoWeek(week)
      .format("GGGG-[W]WW");

    ApiService.weekly(weekString)
      .then((resp) => {
        setChartData({
          labels: resp.data.labels,
          temperatures: resp.data.temperatures,
          humidities: resp.data.humidities,
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
  }, [year, week, addNotification]);

  return (
    <>
      <div className="col-md-6 mx-auto">
        <WeekPicker setWeek={setWeek} setYear={setYear} />
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}
