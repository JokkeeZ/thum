import { useEffect, useState } from "react";
import { useNotification, type ILogResponseDataPoint } from "../../types";

function LogView() {
  const [logs, setLogs] = useState<ILogResponseDataPoint[]>([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/logs")
      .then((resp) => resp.json())
      .then((resp) => {
        const response = resp as ILogResponseDataPoint[];
        setLogs(response);
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: error.toString(),
        });
      });
  }, [addNotification, setLogs]);

const removeLog = (log: ILogResponseDataPoint) => {
  fetch(`http://127.0.0.1:8000/api/logs/${log.timestamp}`, {
    method: 'DELETE'
  })
    .then((resp) => resp.json())
    .then((resp) => {
      if (resp.success) {
        addNotification({
          error: false,
          title: "Log removed",
          text: "Log was successfully removed!",
        });

        setLogs((prevLogs) => prevLogs.filter(l => l.timestamp !== log.timestamp));
      }
    })
    .catch((error) => {
      addNotification({
        error: true,
        title: "Error",
        text: error.toString(),
      });
    });
};

  return (
    <div className="col-md-10 mx-auto">
      <h3 className="text-primary-emphasis text-center mb-3 mt-3">Logs</h3>

      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Message</th>
            <th scope="col">Timestamp</th>
            <th scope="col">Delete</th>
          </tr>
        </thead>
        <tbody>
          {
            logs.map((log, index) => {
              return (
                <tr>
                  <th scope="row">{index}</th>
                  <td>{log.message}</td>
                  <td>{log.timestamp}</td>
                  <td>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeLog(log)}>Delete</button>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default LogView;
