import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { isChromiumBased, useNotification, type IDataChart, type IResponseDataPoint } from "../../types";
import moment from "moment";

function ChromiumMonthPicker(props: { year: number, month: number, onMonthChangedOnChromium: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="row mb-3 mt-3">
      <div className="form-group">
        <label htmlFor="date">Select month (Chromium)</label>
        <input
          className="form-control"
          type="month"
          max={moment().format('YYYY-MM')}
          value={moment()
            .year(props.year)
            .month(props.month)
            .format('YYYY-MM')}
          onChange={props.onMonthChangedOnChromium}
        />
      </div>
    </div>
  );
}

export default function MonthlyView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>;
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const minYear = 2024; // @TODO: Query min year before doin' anything else maby
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month());

  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

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
    setMonth(selection.month());
  };

  useEffect(() => {
    setChartReady(false);

    fetch(`http://127.0.0.1:8000/api/sensor/monthly/${year}/${month}`)
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
  }, [setChartData, year, month, setChartReady, addNotification]);

  const onYearChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(event.currentTarget.value));
  }

  const onMonthChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    setMonth(parseInt(event.currentTarget.value));
  }

  return (
    <div className="col-md-6 mx-auto">
      <form>
        {isChromiumBased() ? (<ChromiumMonthPicker year={year} month={month} onMonthChangedOnChromium={onMonthChangedOnChromium}/>) : (
          <div className="row mb-3 mt-3">
            <label htmlFor="year-month">Select month and year</label>
            <div className="input-group mb-3 mt-1" id="year-month">
              <select className="form-select" onChange={onMonthChanged}>
                {
                  moment.months().map((m, i) => {
                    return <option key={i} value={i + 1} defaultValue={month}>{m}</option>
                  })
                }
              </select>
              <select className="form-select" onChange={onYearChanged}>
                {
                  Array.from({ length: moment().year() - minYear + 1 }, (_, i) => {
                    return <option key={(i + minYear)} value={(i + minYear)} defaultValue={year}>{i + minYear}</option>
                  })
                }
              </select>
            </div>
          
          </div>
        )}
      </form>
    </div>
  );
}
