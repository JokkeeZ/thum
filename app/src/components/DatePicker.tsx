import { type ChangeEvent, type SetStateAction } from "react";
import { useNotification } from "./notification/NotificationContext";
import SpinnyLoader from "./SpinnyLoader";
import ChromiumPicker from "./ChromiumPicker";
import { useDateRange } from "./daterange/DateRangeContext";

export default function DatePicker(props: {
  setDate: (value: SetStateAction<Date>) => void;
}) {
  const { dates } = useDateRange();

  const { addNotification } = useNotification();

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

  if (!dates) {
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
          min={dates.first}
          max={dates.last}
          defaultValue={dates.last}
          onChange={onDateChanged}
        />
      </div>
    </form>
  );
}
