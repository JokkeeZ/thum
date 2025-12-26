import { useEffect, useState, type ReactNode } from "react";
import { DateRangeContext } from "./DateRangeContext";
import { type IDateRange } from "../../types/IDateRange";
import ApiService from "../../services/ApiService";
import { useNotification } from "../notification/NotificationContext";

export default function DateRangeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [dates, setDates] = useState<IDateRange>();
  const [weeks, setWeeks] = useState<IDateRange>();
  const [months, setMonths] = useState<IDateRange>();

  const { errorNotification } = useNotification();

  useEffect(() => {
    ApiService.dates()
      .then((resp) => setDates(resp.data))
      .catch((err) => {
        errorNotification("Failed to fetch dates range.");
        console.error(err);
      });

    ApiService.weeks()
      .then((resp) => setWeeks(resp.data))
      .catch((err) => {
        errorNotification("Failed to fetch weeks range.");
        console.error(err);
      });

    ApiService.months()
      .then((resp) => setMonths(resp.data))
      .catch((err) => {
        errorNotification("Failed to fetch months range.");
        console.error(err);
      });
  }, [errorNotification]);

  return (
    <DateRangeContext.Provider value={{ dates, weeks, months }}>
      {children}
    </DateRangeContext.Provider>
  );
}
