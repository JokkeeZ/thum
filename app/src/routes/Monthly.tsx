import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { type IDataChart } from "@/types/IDataChart";
import { useNotification } from "@/components/notification/NotificationContext";
import DataChart from "@/components/DataChart";
import ApiService from "@/services/ApiService";
import DateTimePicker from "@/components/pickers/DateTimePicker";

export default function Monthly() {
  const now = DateTime.now();
  const [year, setYear] = useState(now.localWeekYear);
  const [month, setMonth] = useState(now.get("month"));

  const { errorNotification } = useNotification();
  const [chartReady, setChartReady] = useState<boolean>(false);
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });

  const onMonthChangedOnChromium = (date: DateTime<true>) => {
    setYear(date.year);
    setMonth(date.month);
  };

  useEffect(() => {
    ApiService.monthly(year, month)
      .then((resp) => {
        setChartData({
          labels: resp.map((p) => {
            return DateTime.fromISO(p.ts).toLocaleString(DateTime.DATE_MED);
          }),
          temperatures: resp.map((p) => p.temperature),
          humidities: resp.map((p) => p.humidity),
        });

        setChartReady(true);
      })
      .catch((error) => {
        errorNotification("Failed to fetch data from API.");
        console.error(error);
      });
  }, [year, month, errorNotification]);

  return (
    <div className="container">
      <DateTimePicker
        type="month"
        onDateSelected={onMonthChangedOnChromium}
        onMonthChanged={(m) => setMonth(m)}
        onYearChanged={(y) => setYear(y)}
      />
      <DataChart chartData={chartData} chartReady={chartReady} />
    </div>
  );
}
