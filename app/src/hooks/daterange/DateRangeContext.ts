import { createContext, useContext } from "react";
import type { IDateRange } from "@/types/IDateRange";

interface IDateRangeContext {
  dates?: IDateRange;
  weeks?: IDateRange;
  months?: IDateRange;
}

export const DateRangeContext = createContext<IDateRangeContext>({
  dates: undefined,
  weeks: undefined,
  months: undefined,
});

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeContext");
  }
  return context;
};
