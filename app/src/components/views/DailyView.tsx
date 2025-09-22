import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  fetchMinMaxValues,
  useNotification,
  type IDataChart,
  type IMinMaxValuesLoaded,
  type IResponseDataPoint,
} from "../../types";
import moment from "moment";
import { ApiUrl } from '../../config';

function DailyView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>;
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const now = moment();
  const [date, setDate] = useState(now.toDate());
  const [minMax, setMinMax] = useState<IMinMaxValuesLoaded>({
    first: undefined,
    last: undefined,
    loaded: false,
  });

  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

  useEffect(() => {
    fetchMinMaxValues(`${ApiUrl}/range/dates`)
      .then((val) => setMinMax(val))
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: error.toString(),
        });
      });
  }, [setMinMax, addNotification]);

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

    setDate(selectedDate);
  };

  useEffect(() => {
    if (!minMax.loaded) {
      return;
    }

    const dd = moment(date);
    const day = dd.date();
    const month = dd.month() + 1;
    const year = dd.year();

    fetch(`${ApiUrl}/sensor/daily/${day}/${month}/${year}`)
      .then((resp) => resp.json())
      .then((resp) => {
        const data = resp as IResponseDataPoint[];
        setChartData({
          labels: data.map((p) => p.ts),
          temperatures: data.map((p) => p.temperature),
          humidities: data.map((p) => p.humidity),
        });

        setChartReady(true);
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: error.toString(),
        });
      });
  }, [setChartData, minMax, date, setChartReady, addNotification]);

  return (
    <div className="col-md-6 mx-auto">
      {minMax.loaded ? (
        <form>
          <div className="row mb-3 mt-3">
            <div className="form-group">
              <label htmlFor="date-select">Select date</label>
              <input
                className="form-control"
                type="date"
                id="date-select"
                name="date-select"
                min={minMax.first}
                max={minMax.last}
                defaultValue={minMax.last}
                onChange={onDateChanged}
              />
            </div>
          </div>
        </form>
      ) : (
        <></>
      )}
    </div>
  );
}

export default DailyView;
