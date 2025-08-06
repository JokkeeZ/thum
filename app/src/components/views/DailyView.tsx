import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import {
  dateToSelectedDate,
  useNotification,
  type IDataChart,
  type IResponseDataPoint,
  type ISelectedDate,
} from "../../types";
import moment from "moment";

function DailyView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>;
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const today = new Date();
  const dateToday = dateToSelectedDate(today);
  const [date, setDate] = useState<ISelectedDate>(dateToday);

  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

  const onDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid date selected.",
      });
      return;
    }

    setDate({
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      date: selectedDate.getDate()
    });
  }

  useEffect(() => {
    setChartReady(false);

    fetch(`http://127.0.0.1:8000/api/sensor/daily/${date.date}/${date.month}/${date.year}`)
      .then((resp) => resp.json())
      .then((resp) => {
        const data = resp as IResponseDataPoint[];
        setChartData({
          labels: data.map(p => p.ts),
          temperatures: data.map(p => p.temperature),
          humidities: data.map(p => p.humidity)
        })
        
        setChartReady(true);
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: error.toString(),
        });
      });
  }, [setChartData, date, setChartReady, addNotification]);

  return (
    <div className="col-md-4 mx-auto">
      <form>
        <div className="form-group">
          <label htmlFor="date">Select date</label>
          <input
            className="form-control"
            type="date"
            min="2024-05-26" // @TODO: Query min date from API before querying any data points.
            onChange={onDateChanged}
            max={moment().toNow()}
            value={moment().toNow()}
          />
        </div>
      </form>
    </div>
  );
}

export default DailyView;
