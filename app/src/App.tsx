import { BrowserRouter, Route, Routes } from "react-router";
import NavigationBar from "@/components/nav/NavigationBar";
import Home from "@/routes/Home";
import Daily from "@/routes/Daily";
import Weekly from "@/routes/Weekly";
import Monthly from "@/routes/Monthly";
import Range from "@/routes/Range";
import Logs from "@/routes/Logs";
import NotificationProvider from "@/hooks/notification/NotificationProvider";
import Statistics from "@/routes/Statistics";
import ThemeProvider from "@/hooks/theme/ThemeProvider";
import Settings from "@/routes/Settings";
import Footer from "@/components/Footer";
import DateRangeProvider from "@/hooks/daterange/DateRangeProvider";
import TitleManager from "@/components/TitleManager";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <TitleManager />
        <div className="d-flex flex-column min-vh-100">
          <header>
            <NavigationBar />
          </header>

          <main className="flex-grow-1">
            <NotificationProvider
              settings={{
                dockPosition: "top-right",
                duration: 3000,
                slideDirection: "right",
              }}
            >
              <DateRangeProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/daily" element={<Daily />} />
                  <Route path="/weekly" element={<Weekly />} />
                  <Route path="/monthly" element={<Monthly />} />
                  <Route path="/range" element={<Range />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </DateRangeProvider>
            </NotificationProvider>
          </main>

          <footer className="py-4">
            <Footer />
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
