import { useEffect, useState } from "react";
import SpinnyLoader from "../SpinnyLoader";
import { useTheme } from "../theme/ThemeContext";
import { NavLink } from "react-router";
import ApiService from "../../services/ApiService";
import NavigationBarItem from "./NavigationBarItem";

export default function NavigationBar() {
  const [currentReading, setCurrentReading] = useState<{
    temperature: number;
    humidity: number;
  }>();

  const { theme, updateTheme } = useTheme();

  useEffect(() => {
    const fetchData = () => {
      ApiService.current().then((resp) => {
        if (resp.data.success) {
          setCurrentReading({
            temperature: resp.data.temperature,
            humidity: resp.data.humidity,
          });
        }
      });
    };

    fetchData();

    const intervalId = setInterval(fetchData, 15000); // 15 sec

    return () => clearInterval(intervalId);
  }, [setCurrentReading]);

  return (
    <>
      <nav className="navbar navbar-expand-md bg-primary">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/">
            Thum
          </NavLink>

          <div className="d-flex align-items-center">
            <span
              className="navbar-text me-3 d-md-none current-temperature"
              title={
                currentReading == null
                  ? "Loading..."
                  : `Temperature: ${currentReading?.temperature}°C\nHumidity: ${currentReading.humidity}%`
              }
            >
              {currentReading ? (
                `${currentReading.temperature}°C`
              ) : (
                <SpinnyLoader width={20} height={20} />
              )}
            </span>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#topnav"
              aria-controls="topnav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="collapse navbar-collapse" id="topnav">
            <ul className="navbar-nav me-auto">
              <NavigationBarItem route={"/"} title="Home" />
              <NavigationBarItem route={"/daily"} title="Daily" />
              <NavigationBarItem route={"/weekly"} title="Weekly" />
              <NavigationBarItem route={"/monthly"} title="Monthly" />
              <NavigationBarItem route={"/range"} title="Range" />
              <NavigationBarItem route={"/statistics"} title="Statistics" />
              <NavigationBarItem route={"/settings"} title="Settings" />
              <NavigationBarItem route={"/logs"} title="Logs" />
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="themeDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Theme
                </a>

                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="themeDropdown"
                >
                  <li>
                    <button
                      className={`dropdown-item ${
                        theme === "light" ? "active" : ""
                      }`}
                      onClick={() => updateTheme("light")}
                    >
                      {theme === "light" ? "✓ " : ""}
                      Light
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item ${
                        theme === "dark" ? "active" : ""
                      }`}
                      onClick={() => updateTheme("dark")}
                    >
                      {theme === "dark" ? "✓ " : ""}
                      Dark
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <span
            className="navbar-text me-3 d-none d-md-block current-temperature"
            title={
              currentReading
                ? `Temperature: ${currentReading?.temperature}°C\nHumidity: ${currentReading.humidity}%`
                : "Loading..."
            }
          >
            {currentReading ? (
              `${currentReading.temperature}°C`
            ) : (
              <SpinnyLoader width={20} height={20} />
            )}
          </span>
        </div>
      </nav>

      {/* TODO: gotta think about this one. looks nice tho. */}
      {/* <div className="progress" style={{height: "5px", width: "100%", borderRadius: 0}}>
        <div
          className="progress-bar bg-secondary progress-bar-animated"
          role="progressbar"
          style={{width: "10%"}}
          aria-valuenow={25}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div> */}
    </>
  );
}
