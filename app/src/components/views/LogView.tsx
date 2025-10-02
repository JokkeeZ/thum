import { useEffect, useState } from "react";
import { useNotification, type ILogEntry } from "../../types";
import { ApiUrl } from "../../config";

function LogView() {
  const [logs, setLogs] = useState<ILogEntry[]>([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetch(`${ApiUrl}/logs`)
      .then((resp) => resp.json())
      .then((resp) => {
        const response = resp as ILogEntry[];
        setLogs(response);
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  }, [addNotification, setLogs]);

  const removeLog = (log: ILogEntry) => {
    fetch(`${ApiUrl}/logs/${log.timestamp}`, {
      method: "DELETE",
    })
      .then((resp) => resp.json())
      .then((resp) => {
        if (resp.count > 0) {
          addNotification({
            error: false,
            title: "Log removed",
            text: "Log was successfully removed!",
          });

          setLogs((prevLogs) =>
            prevLogs.filter((l) => l.timestamp !== log.timestamp)
          );
        }
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  };

  const removeAllLogs = () => {
    fetch(`${ApiUrl}/logs`, {
      method: "DELETE",
    })
      .then((resp) => resp.json())
      .then((resp) => {
        if (resp.count > 0) {
          addNotification({
            error: false,
            title: "Log(s) removed",
            text: `${resp.count} log(s) was successfully removed!`,
          });

          setLogs([]);
        }
      })
      .catch((error) => {
        addNotification({
          error: true,
          title: "Error",
          text: "Failed to fetch data from API.",
        });
        console.error(error);
      });
  };

  return (
    <div className="col-md-10 mx-auto">
      <div className="mb-3 mt-3">
        <h3 className="text-primary-emphasis text-center mb-3 mt-3">
          Sensor logs
        </h3>
        <button
          className="btn btn-outline-danger float-end"
          onClick={removeAllLogs}
        >
          Remove all
        </button>
      </div>

      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Message</th>
            <th scope="col">Timestamp</th>
            <th scope="col">Remove</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => {
            return (
              <tr key={index}>
                <th scope="row">{index}</th>
                <td>{log.message}</td>
                <td>{log.timestamp}</td>
                <td>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeLog(log)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LogView;
