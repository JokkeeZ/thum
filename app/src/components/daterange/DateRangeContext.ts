import { createContext, useContext } from "react";
import type { IMinMaxValues } from "../../types/IMinMaxValues";

export interface IDateRangeContext {
  dates?: IMinMaxValues;
  weeks?: IMinMaxValues;
  months?: IMinMaxValues;
};

export const DateRangeContext = createContext<IDateRangeContext>({
  dates: undefined,
  weeks: undefined,
  months: undefined
});

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error(
      "useDateRange must be used within a DateRangeContext"
    );
  }
  return context;
};
