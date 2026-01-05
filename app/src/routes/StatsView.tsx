import { useEffect, useState } from "react";
import { useNotification } from "../components/notification/NotificationContext";
import ApiService from "../services/ApiService";
import type { IStatisticsResponse } from "../types/IStatisticsResponse";
import SpinnyLoader from "../components/SpinnyLoader";

export default function StatsView() {
  const [stats, setStats] = useState<IStatisticsResponse | null>(null);
  const { errorNotification } = useNotification();

  useEffect(() => {
    ApiService.statistics()
      .then((resp) => {
        setStats(resp.data);
      })
      .catch((error) => {
        errorNotification("Failed to fetch statistics from API.");
        console.error(error);
      });
  }, [errorNotification]);

  if (!stats) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <SpinnyLoader width={50} height={50} />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-12 col-lg-6">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title mb-3">Statistics</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Total Entries
                  <span className="badge bg-primary rounded-pill">
                    {stats?.total_entries}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Average Temperature
                  <span className="badge bg-primary rounded-pill">
                    {stats?.avg_temperature.toFixed(2)}°C
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Average Humidity
                  <span className="badge bg-primary rounded-pill">
                    {stats?.avg_humidity.toFixed(2)}%
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Maximum Temperature — {stats?.max_temperature.date}
                  <span className="badge bg-primary rounded-pill">
                    {stats?.max_temperature.value}°C
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Minimum Temperature — {stats?.min_temperature.date}
                  <span className="badge bg-primary rounded-pill">
                    {stats?.min_temperature.value}°C
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Maximum Humidity — {stats?.max_humidity.date}
                  <span className="badge bg-primary rounded-pill">
                    {stats?.max_humidity.value}%
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Minimum Humidity — {stats?.min_humidity.date}
                  <span className="badge bg-primary rounded-pill">
                    {stats?.min_humidity.value}%
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
