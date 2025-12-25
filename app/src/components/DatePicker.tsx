import { Activity, useEffect, useState, type ChangeEvent, type SetStateAction } from "react";
import type { IMinMaxValues } from "../types/IMinMaxValuesLoaded";
import ApiService from "../services/ApiService";
import { useNotification } from "./notification/NotificationContext";
import SpinnyLoader from "./SpinnyLoader";
import ChromiumPicker from "./ChromiumPicker";

export default function DatePicker(props: {
  setDate: (value: SetStateAction<Date>) => void;
}) {
  const [minMax, setMinMax] = useState<IMinMaxValues>({
    first: "",
    last: "",
  });
  const [minMaxLoaded, setMinMaxLoaded] = useState(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    ApiService.dates()
      .then((resp) => {
        setMinMax(resp.data);
        setMinMaxLoaded(true);
      })
      .catch((err) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(err);
      });
  }, []);

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

    props.setDate(selectedDate);
  };

  if (!minMaxLoaded) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <SpinnyLoader width={50} height={50} />
      </div>
    );
  }

  return (
    <form>
      <div className="row mb-3 mt-3">
        <ChromiumPicker 
          type="date"
          min={minMax.first}
          max={minMax.last}
          defaultValue={minMax.last}
          onChange={onDateChanged}
        />
      </div>
    </form>
  );
}
