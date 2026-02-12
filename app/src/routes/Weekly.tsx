import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { type IDataChart } from "@/types/IDataChart";
import { useNotification } from "@/components/notification/NotificationContext";
import DataChart from "@/components/DataChart";
import ApiService from "@/services/ApiService";
import DateTimePicker from "@/components/pickers/DateTimePicker";

export default function Weekly() {
  const now = DateTime.now();
  const [year, setYear] = useState(now.localWeekYear);
  const [week, setWeek] = useState(now.localWeekNumber);

  const { errorNotification } = useNotification();
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });
  const [chartReady, setChartReady] = useState<boolean>(false);

  const onWeekChangedOnChromium = (date: DateTime<true>) => {
    setYear(date.localWeekYear);
    setWeek(date.localWeekNumber);
  };

  useEffect(() => {
    const weekString = DateTime.now()
      .set({ localWeekYear: year, localWeekNumber: week })
      .toFormat("kkkk-'W'WW");

    ApiService.weekly(weekString)
      .then((resp) => {
        setChartData({
          labels: resp.map((p) => p.ts),
          temperatures: resp.map((p) => p.temperature),
          humidities: resp.map((p) => p.humidity),
        });
        setChartReady(true);
      })
      .catch((err) => {
        errorNotification("Failed to fetch data from API.");
        console.error(err);
      });
  }, [year, week, errorNotification]);

  return (
    <div className="container">
      <DateTimePicker
        type="week"
        onDateSelected={onWeekChangedOnChromium}
        onWeekChanged={(w) => setWeek(w)}
        onYearChanged={(y) => setYear(y)}
      />
      <DataChart chartData={chartData} chartReady={chartReady} />
    </div>
  );
}
