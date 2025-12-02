import { useEffect, useState } from "react";
import { useNotification } from "../components/notification/NotificationContext";
import { ApiUrl } from "../config";

interface IStatsResponse {
  total_entries: number;
  avg_temperature: number;
  avg_humidity: number;
  min_temperature: { value: number; date: string };
  max_temperature: { value: number; date: string };
  min_humidity: { value: number; date: string };
  max_humidity: { value: number; date: string };
}

export default function StatsView() {
  const [stats, setStats] = useState<IStatsResponse | null>(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetch(`${ApiUrl}/statistics`)
      .then((resp) => resp.json())
      .then((resp) => setStats(resp as IStatsResponse))
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch statistics from API.",
        });
        console.error(error);
      });
  }, [addNotification, setStats]);

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title mb-3">Statistics</h5>
              <ul className="list-group">
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
