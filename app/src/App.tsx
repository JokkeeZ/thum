import NavigationBar from "./components/NavigationBar";
import HomeView from "./routes/HomeView";
import DailyView from "./routes/DailyView";
import WeeklyView from "./routes/WeeklyView";
import MonthlyView from "./routes/MonthlyView";
import RangeView from "./routes/RangeView";
import LogView from "./routes/LogView";
import NotificationContainer from "./components/notification/NotificationContainer";
import StatsView from "./routes/StatsView";
import ThemeProvider from "./components/theme/ThemeProvider";
import { BrowserRouter, Route, Routes } from "react-router";

export default function App() {
  return (
    <ThemeProvider>
        <BrowserRouter>
      <header>
        <NavigationBar/>
      </header>

      <main>
        <NotificationContainer
          settings={{
            dockPosition: "top-right",
            duration: 3000,
            slideDirection: "right",
          }}
        >
            <div className="container">
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomeView/>
                  }
                />
                <Route
                  path="/daily"
                  element={
                    <DailyView/>
                  }
                />
                <Route
                  path="/weekly"
                  element={
                    <WeeklyView/>
                  }
                />
                <Route
                  path="/monthly"
                  element={
                    <MonthlyView/>
                  }
                />
                <Route
                  path="/range"
                  element={
                    <RangeView/>
                  }
                />
                <Route path="/statistics" element={<StatsView />} />
                <Route path="/logs" element={<LogView />} />
              </Routes>
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
          </BrowserRouter>
    </ThemeProvider>
  );
}
