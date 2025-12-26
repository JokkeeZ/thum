import { useEffect, useState, type ReactNode } from "react";
import { DateRangeContext } from "./DateRangeContext";
import { type IMinMaxValues } from "../../types/IMinMaxValues";
import ApiService from "../../services/ApiService";
import { useNotification } from "../notification/NotificationContext";

export default function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dates, setDates] = useState<IMinMaxValues>();
  const [weeks, setWeeks] = useState<IMinMaxValues>();
  const [months, setMonths] = useState<IMinMaxValues>();

  const { addNotification } = useNotification();

  useEffect(() => {
    ApiService.dates()
      .then((resp) => setDates(resp.data))
      .catch((err) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch dates range."
        })
        console.error(err);
      });

    ApiService.weeks()
      .then((resp) => setWeeks(resp.data))
      .catch((err) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch weeks range."
        })
        console.error(err);
      });

    ApiService.months()
      .then((resp) => setMonths(resp.data))
      .catch((err) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch months range."
        })
        console.error(err);
      });
  }, [addNotification]);

  return (
    <DateRangeContext.Provider value={{ dates, weeks, months }}>
      {children}
    </DateRangeContext.Provider>
  );
}
