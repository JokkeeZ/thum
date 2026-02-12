import { useEffect, useState } from "react";
import { useNotification } from "../components/notification/NotificationContext";
import ApiService from "../services/ApiService";
import type { IStatisticsResponse } from "../types/IStatisticsResponse";
import CenteredSpinnyLoader from "../components/CenteredSpinnyLoader";
import StatisticsItem from "../components/StatisticsItem";

export default function Statistics() {
  const [stats, setStats] = useState<IStatisticsResponse | null>(null);
  const { errorNotification } = useNotification();

  useEffect(() => {
    ApiService.statistics()
      .then((resp) => setStats(resp))
      .catch((error) => {
        errorNotification("Failed to fetch statistics from API.");
        console.error(error);
      });
  }, [errorNotification]);

  if (!stats) {
    return <CenteredSpinnyLoader />;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-12 col-lg-6">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title mb-3">Statistics</h5>

              <ul className="list-group list-group-flush">
                <StatisticsItem
                  label="Total Entries"
                  value={stats?.total_entries}
                  unit=""
                />
                <StatisticsItem
                  label="Average Temperature"
                  value={stats?.avg_temperature.toFixed(2)}
                  unit="°C"
                />
                <StatisticsItem
                  label="Average Humidity"
                  value={stats?.avg_humidity.toFixed(2)}
                  unit="%"
                />
                <StatisticsItem
                  label={`Max. Temperature — ${stats?.max_temperature.date}`}
                  value={stats?.max_temperature.value}
                  unit="°C"
                />
                <StatisticsItem
                  label={`Min. Temperature — ${stats?.min_temperature.date}`}
                  value={stats?.min_temperature.value}
                  unit="°C"
                />
                <StatisticsItem
                  label={`Max. Humidity — ${stats?.max_humidity.date}`}
                  value={stats?.max_humidity.value}
                  unit="%"
                />
                <StatisticsItem
                  label={`Min. Humidity — ${stats?.min_humidity.date}`}
                  value={stats?.min_humidity.value}
                  unit="%"
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
