import { useEffect, useState, type ReactNode } from "react";
import { DateRangeContext } from "./DateRangeContext";
import { type IDateRange } from "@/types/IDateRange";
import ApiService from "@/services/ApiService";
import { useNotification } from "@/hooks/notification/NotificationContext";

export default function DateRangeProvider(props: { children: ReactNode }) {
  const [dates, setDates] = useState<IDateRange>();
  const [weeks, setWeeks] = useState<IDateRange>();
  const [months, setMonths] = useState<IDateRange>();

  const { errorNotification } = useNotification();

  useEffect(() => {
    ApiService.daterange()
      .then((resp) => {
        setDates(resp.dates);
        setWeeks(resp.weeks);
        setMonths(resp.months);
      })
      .catch((err) => {
        errorNotification("Failed to fetch dateranges.");
        console.error(err);
      });
  }, [errorNotification]);

  return (
    <DateRangeContext.Provider value={{ dates, weeks, months }}>
      {props.children}
    </DateRangeContext.Provider>
  );
}
