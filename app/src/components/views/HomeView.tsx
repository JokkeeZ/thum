import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useNotification, type IDataChart, type IResponseDataPoint } from "../../types";

function HomeView(props: {
  setChartData: Dispatch<SetStateAction<IDataChart>>,
  setChartReady: Dispatch<SetStateAction<boolean>>;
}) {
  const { addNotification } = useNotification();
  const { setChartData, setChartReady } = props;

  useEffect(() => {
    setChartReady(false);
    
    fetch('http://127.0.0.1:8000/api/sensor/all')
      .then(resp => resp.json())
      .then(resp  => {
        const data = resp as IResponseDataPoint[];
        setChartData({
          labels: data.map(p => p.ts),
          temperatures: data.map(p => p.temperature),
          humidities: data.map(p => p.humidity)
        });

        setChartReady(true);
      })
      .catch(error => {
        addNotification({
          error: true,
          title: "Error",
          text: error.toString()
        });
      })
  }, [setChartData, setChartReady, addNotification]);

  return <></>;
}

export default HomeView;
