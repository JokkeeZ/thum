import { useEffect, useState } from "react";
import SpinnyLoader from "./SpinnyLoader";
import { ApiUrl } from "../config";
import { useTheme } from "./theme/ThemeContext";
import { NavLink, useNavigate } from "react-router";

export function NavigationBarItem(props: { route: string; title: string }) {
  const navigation = useNavigate();
  return (
    <li className="nav-item">
      <NavLink
        to={props.route}
        className={"nav-link " + (navigation.name === props.route ? "active" : "")}
      >
        {props.title}
      </NavLink>
    </li>
  );
}

type CurrentSensorReading = {
  temperature: number;
  humidity: number;
};

export default function NavigationBar() {
  const [currentReading, setCurrentReading] =
    useState<CurrentSensorReading | null>(null);

  const { theme, updateTheme } = useTheme();

  useEffect(() => {
    const fetchData = () => {
      fetch(`${ApiUrl}/sensor/current`)
        .then((resp) => resp.json())
        .then((resp) => {
          const data = resp as {
            success: boolean;
            temperature: number;
            humidity: number;
            message?: string;
          };
          if (data.success) {
            setCurrentReading({
              temperature: data.temperature,
              humidity: data.humidity,
            });
          }
        });
    };

    fetchData();

    const intervalId = setInterval(fetchData, 15000); // 15 sec

    return () => clearInterval(intervalId);
  }, [setCurrentReading]);

  return (
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
      </div>
    </nav>
  );
}
