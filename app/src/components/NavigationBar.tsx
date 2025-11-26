import { useEffect, useState } from "react";
import type { IPage } from "../types";
import SpinnyLoader from "./SpinnyLoader";
import { ApiUrl } from "../config";
import { useTheme } from "./theme/ThemeContext";

export function NavigationBarItem(props: {
  current: boolean;
  text: string;
  routeChange: () => void;
}) {
  return (
    <li className="nav-item">
      <a
        href="#"
        className={"nav-link " + (props.current ? "active" : "")}
        onClick={props.routeChange}
      >
        {props.text}
      </a>
    </li>
  );
}

type CurrentSensorReading = {
  temperature: number;
  humidity: number;
};

export default function NavigationBar(props: {
  pages: IPage[];
  routeIndex: number;
  routeChange: (index: number) => void;
}) {
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
        <a className="navbar-brand" href="#">
          Thum
        </a>

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
            {props.pages.map((item, index) => {
              return (
                <NavigationBarItem
                  current={index === props.routeIndex}
                  text={item.name}
                  key={index}
                  routeChange={() => props.routeChange(index)}
                />
              );
            })}
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
