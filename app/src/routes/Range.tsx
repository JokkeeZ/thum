import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { type IDataChart } from "@/types/IDataChart";
import { useNotification } from "@/hooks/notification/NotificationContext";
import DataChart from "@/components/DataChart";
import ApiService from "@/services/ApiService";
import { useDateRange } from "@/hooks/daterange/DateRangeContext";
import DateTimePicker from "@/components/pickers/DateTimePicker";

export default function Range() {
  const { errorNotification } = useNotification();
  const { dates } = useDateRange();

  const [chartReady, setChartReady] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<DateTime<true>>();
  const [endDate, setEndDate] = useState<DateTime<true>>();

  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });

  useEffect(() => {
    if (!dates) return;

    const rangeStart = (startDate ?? DateTime.fromISO(dates.first)).toFormat(
      "yyyy-MM-dd",
    );

    const rangeEnd = (endDate ?? DateTime.fromISO(dates.last)).toFormat(
      "yyyy-MM-dd",
    );

    ApiService.range(rangeStart, rangeEnd)
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
  }, [dates, startDate, endDate, errorNotification]);

  return (
    <div className="container">
      <DateTimePicker
        type="range"
        onRangeStartChanged={(d) => setStartDate(d)}
        onRangeEndChanged={(d) => setEndDate(d)}
      />
      <DataChart chartData={chartData} chartReady={chartReady} />
    </div>
  );
}
