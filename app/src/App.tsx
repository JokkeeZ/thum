import { useMemo, useState } from "react";
import NavigationBar from "./components/NavigationBar";
import { type IDataChart, type IPage } from "./types";
import SpinnyLoader from "./components/SpinnyLoader";
import DataChart from "./components/DataChart";
import HomeView from "./components/views/HomeView";
import NotificationContainer from "./components/NotificationContainer";
import DailyView from "./components/views/DailyView";
import WeeklyView from "./components/views/WeeklyView";
import MonthlyView from "./components/views/MonthlyView";

function RangeView() {
  return <></>;
}
function ApiView() {
  return <></>;
}
function LogsView() {
  return <></>;
}

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
        comp: (
          <HomeView setChartData={setChartData} setChartReady={setChartReady} />
        ),
      },
      { name: "Daily", comp: <DailyView setChartData={setChartData} setChartReady={setChartReady}/> },
      { name: "Weekly", comp: <WeeklyView setChartData={setChartData} setChartReady={setChartReady}/> },
      { name: "Monthly", comp: <MonthlyView setChartData={setChartData} setChartReady={setChartReady}/> },
      { name: "Range", comp: <RangeView /> },
      { name: "Api", comp: <ApiView /> },
      { name: "Logs", comp: <LogsView /> },
    ],
    []
  );

  const currentPage = useMemo(() => {
    return pages[pageIndex]?.comp;
  }, [pageIndex, pages]);

  return (
    <>
      <NavigationBar
        pages={pages}
        routeIndex={pageIndex}
        routeChange={(i) => setPageIndex(i)}
      />

      <main>
        <NotificationContainer>
          <div className="container">
            {currentPage}
          </div>

          <div className="container-fluid mt-3">
            <div className="d-flex justify-content-center align-items-center col-md-12 min-vh-90">
              {chartReady ? (
                <DataChart chartData={chartData} />
              ) : (
                <SpinnyLoader width={50} height={50} />
              )}
            </div>
          </div>
        </NotificationContainer>
      </main>

      <footer className="text-center text-lg-start footer">
        <div className="text-center p-3">
          Crafted with ♥️ and ☕ — open-source on
          <a
            className="text-info gh-link"
            href="https://github.com/jokkeez/thum"
          >
            Github
          </a>
        </div>
      </footer>
    </>
  );
}
