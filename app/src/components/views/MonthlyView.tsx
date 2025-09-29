import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  fetchMinMaxValues,
  isChromiumBased,
  useNotification,
  type IDataChart,
  type IMinMaxValuesLoaded,
  type ISensorReadingEntry,
} from "../../types";
import moment from "moment";
import { ApiUrl } from "../../config";

export default function MonthlyView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>;
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [minMax, setMinMax] = useState<IMinMaxValuesLoaded>({
    first: undefined,
    last: undefined,
    loaded: false,
  });

  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

  useEffect(() => {
    fetchMinMaxValues(`${ApiUrl}/range/months`)
      .then((val) => {
        setMinMax(val);

        const last = moment(val.last);
        setYear(last.year());
        setMonth(last.month() + 1);
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: error.toString(),
        });
      });
  }, [setMinMax, setYear, setMonth, addNotification]);

  const onMonthChangedOnChromium = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.currentTarget.valueAsDate;
    const selection = moment(date);

    if (!date) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid month selected.",
      });
      return;
    }

    setYear(selection.year());
    setMonth(selection.month() + 1);
  };

  useEffect(() => {
    if (!minMax.loaded) {
      return;
    }

    fetch(`${ApiUrl}/sensor/monthly/${year}/${month}`)
      .then((resp) => resp.json())
      .then((resp) => {
        const data = resp as ISensorReadingEntry[];
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
  }, [setChartData, minMax, year, month, setChartReady, addNotification]);

  const onYearChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(event.currentTarget.value));
  };

  const onMonthChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    setMonth(parseInt(event.currentTarget.value));
  };

  return (
    <div className="col-md-6 mx-auto">
      {minMax.loaded ? (
        <form>
          {isChromiumBased() ? (
            <div className="row mb-3 mt-3">
              <div className="form-group">
                <label htmlFor="date">Select month (Chromium)</label>
                <input
                  className="form-control"
                  type="month"
                  min={minMax.first}
                  max={minMax.last}
                  value={moment().year(year).month(month).format("YYYY-MM")}
                  onChange={onMonthChangedOnChromium}
                />
              </div>
            </div>
          ) : (
            <div className="row mb-3 mt-3">
              <label htmlFor="year-month">Select month and year</label>
              <div className="input-group mb-3 mt-1" id="year-month">
                <select
                  className="form-select"
                  onChange={onMonthChanged}
                  defaultValue={month}
                >
                  {moment.months().map((m, i) => {
                    return (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    );
                  })}
                </select>
                <select
                  className="form-select"
                  onChange={onYearChanged}
                  defaultValue={year}
                >
                  {Array.from(
                    {
                      length:
                        moment(minMax.last).year() -
                        moment(minMax.first).year() +
                        1,
                    },
                    (_, i) => {
                      const yearVal = moment(minMax.first).year() + i;
                      return (
                        <option key={yearVal} value={yearVal}>
                          {yearVal}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
            </div>
          )}
        </form>
      ) : (
        <></>
      )}
    </div>
  );
}
