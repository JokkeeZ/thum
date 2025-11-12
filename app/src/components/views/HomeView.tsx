import { useEffect, type Dispatch, type SetStateAction } from "react";
import { type IDataChart, type ISensorReadingEntry } from "../../types";

import { ApiUrl } from "../../config";
import { useNotification } from "../notification/NotificationContext";

export default function HomeView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>;
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

  useEffect(() => {
    setChartReady(false);

    fetch(`${ApiUrl}/sensor/all`)
      .then((resp) => resp.json())
      .then((resp) => {
        const data = resp as ISensorReadingEntry[];
        setChartData({
          labels: data.map((p) => p.ts),
          temperatures: data.map((p) => p.temperature),
          humidities: data.map((p) => p.humidity),
        });

        setChartReady(true);
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, [setChartData, setChartReady, addNotification]);

  return (
    <div className="col-md-6 mx-auto">
      <h3 className="text-primary-emphasis text-center mb-3 mt-3">
        All time averages
      </h3>
    </div>
  );
}
