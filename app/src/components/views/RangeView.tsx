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
  type ISensorReadingEntry,
} from "../../types";
import moment from "moment";
import { ApiUrl } from "../../config";

function RangeView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>;
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [minMax, setMinMax] = useState<IMinMaxValuesLoaded>({
    first: undefined,
    last: undefined,
    loaded: false,
  });

  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

  useEffect(() => {
    fetchMinMaxValues(`${ApiUrl}/range/dates`)
      .then((val) => {
        setMinMax(val);

        if (val.first) {
          setStartDate(moment(val.first).toDate());
        }

        if (val.last) {
          setEndDate(moment(val.last).toDate());
        }
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, [setMinMax, addNotification]);

  const onStartDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid date selected.",
      });
      return;
    }

    setStartDate(selectedDate);
  };

  const onEndDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.currentTarget.valueAsDate;

    if (!selectedDate) {
      addNotification({
        error: true,
        title: "Error",
        text: "Invalid date selected.",
      });
      return;
    }

    setEndDate(selectedDate);
  };

  useEffect(() => {
    if (!minMax.loaded) {
      return;
    }

    const start = moment(startDate).format("YYYY-MM-DD");
    const end = moment(endDate).format("YYYY-MM-DD");

    fetch(`${ApiUrl}/sensor/range/${start}/${end}`)
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
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, [
    setChartData,
    minMax,
    startDate,
    endDate,
    setChartReady,
    addNotification,
  ]);

  return (
    <div className="col-md-6 mx-auto">
      {minMax.loaded ? (
        <form>
          <div className="row mb-3 mt-3">
            <label htmlFor="date-select">Select start & end dates</label>
            <div className="input-group" id="date-select">
              <input
                className="form-control"
                type="date"
                min={minMax.first}
                max={minMax.last}
                defaultValue={minMax.first}
                onChange={onStartDateChanged}
              />
              <input
                className="form-control"
                type="date"
                min={minMax.first}
                max={minMax.last}
                defaultValue={minMax.last}
                onChange={onEndDateChanged}
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

export default RangeView;
