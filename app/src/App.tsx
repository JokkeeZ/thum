import NavigationBar from "./components/nav/NavigationBar";
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
import SettingsView from "./routes/SettingsView";
import Footer from "./components/Footer";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <header>
            <NavigationBar />
          </header>

          <main className="flex-grow-1">
            <NotificationContainer
              settings={{
                dockPosition: "top-right",
                duration: 3000,
                slideDirection: "right",
              }}
            >
              <div className="container">
                <Routes>
                  <Route path="/" element={<HomeView />} />
                  <Route path="/daily" element={<DailyView />} />
                  <Route path="/weekly" element={<WeeklyView />} />
                  <Route path="/monthly" element={<MonthlyView />} />
                  <Route path="/range" element={<RangeView />} />
                  <Route path="/statistics" element={<StatsView />} />
                  <Route path="/logs" element={<LogView />} />
                  <Route path="/settings" element={<SettingsView/>} />
                </Routes>
              </div>
            </NotificationContainer>
          </main>

          <footer className="py-4">
            <Footer/>
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
