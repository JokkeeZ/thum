export interface IDateRange {
  first: string;
  last: string;
}

export interface IDateRanges {
  dates: IDateRange;
  weeks: IDateRange;
  months: IDateRange;
}
