import { useEffect, type Dispatch, type SetStateAction } from "react";
import {
  useNotification,
  type IDataChart,
  type IResponseDataPoint,
} from "../../types";

import { ApiUrl } from '../../config';

function HomeView(props: {
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
        const data = resp as IResponseDataPoint[];
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
          text: error.toString(),
        });
      });
  }, [setChartData, setChartReady, addNotification]);

  return (
    <div className="col-md-6 mx-auto">
      <h3 className="text-primary-emphasis text-center mb-3 mt-3">All time averages</h3>
    </div>
  );
}

export default HomeView;
