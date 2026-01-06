import { useEffect, useState } from "react";
import { useNotification } from "../components/notification/NotificationContext";
import ApiService from "../services/ApiService";
import type { IStatisticsResponse } from "../types/IStatisticsResponse";
import SpinnyLoader from "../components/SpinnyLoader";
import StatisticsList from "../components/StatisticsList";

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

              <StatisticsList stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
