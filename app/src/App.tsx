import { Activity, useMemo, useState } from "react";
import NavigationBar from "./components/NavigationBar";
import { type IDataChart, type IPage } from "./types";
import SpinnyLoader from "./components/SpinnyLoader";
import DataChart from "./components/DataChart";
import HomeView from "./components/views/HomeView";
import DailyView from "./components/views/DailyView";
import WeeklyView from "./components/views/WeeklyView";
import MonthlyView from "./components/views/MonthlyView";
import RangeView from "./components/views/RangeView";
import LogView from "./components/views/LogView";
import NotificationContainer from "./components/notification/NotificationContainer";
import StatsView from "./components/views/StatsView";

export default function App() {
  const [pageIndex, setPageIndex] = useState(0);
  const [chartReady, setChartReady] = useState(false);

  const [chartData, setChartData] = useState<IDataChart>({
    labels: [],
    temperatures: [],
    humidities: [],
  });

  const pages: IPage[] = useMemo(
    () => [
      {
        name: "Home",
        chart: true,
        comp: (
          <HomeView setChartData={setChartData} setChartReady={setChartReady} />
        ),
      },
      {
        name: "Daily",
        chart: true,
        comp: (
          <DailyView
            setChartData={setChartData}
            setChartReady={setChartReady}
          />
        ),
      },
      {
        name: "Weekly",
        chart: true,
        comp: (
          <WeeklyView
            setChartData={setChartData}
            setChartReady={setChartReady}
          />
        ),
      },
      {
        name: "Monthly",
        chart: true,
        comp: (
          <MonthlyView
            setChartData={setChartData}
            setChartReady={setChartReady}
          />
        ),
      },
      {
        name: "Range",
        chart: true,
        comp: (
          <RangeView
            setChartData={setChartData}
            setChartReady={setChartReady}
          />
        ),
      },
      { name: "Statistics", chart: false, comp: <StatsView /> },
      { name: "Logs", chart: false, comp: <LogView /> },
    ],
    []
  );

  const currentPage = useMemo(() => {
    return pages[pageIndex];
  }, [pageIndex, pages]);

  return (
    <>
      <NavigationBar
        pages={pages}
        routeIndex={pageIndex}
        routeChange={(i) => setPageIndex(i)}
      />

      <main>
        <NotificationContainer settings={{
          dockPosition: "top-right",
          duration: 10000,
          slideDirection: "right"
        }}>
          <div className="container">{currentPage?.comp}</div>

          <div className="container-fluid mt-3">
            <div className="d-flex justify-content-center align-items-center col-md-12 min-vh-90">
              <Activity mode={currentPage.chart ? "visible" : "hidden"}>
                {chartReady ? (
                  <DataChart chartData={chartData} />
                ) : (
                  <SpinnyLoader width={50} height={50} />
                )}
              </Activity>
            </div>
          </div>
        </NotificationContainer>
      </main>

      <footer className="text-center text-lg-start footer">
        <div className="text-center p-3">
          <span>Open-source on </span>
          <a className="text-info" href="https://github.com/jokkeez/thum">
            <span>Github</span>
          </a>
        </div>
      </footer>
    </>
  );
}
