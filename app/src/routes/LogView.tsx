import { Activity, useEffect, useState } from "react";
import { useNotification } from "../components/notification/NotificationContext";
import type { ILogEntry } from "../types/ILogEntry";
import ApiService from "../services/ApiService";
import SpinnyLoader from "../components/SpinnyLoader";

export default function LogView() {
  const [logs, setLogs] = useState<ILogEntry[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const { successNotification, errorNotification } = useNotification();

  useEffect(() => {
    ApiService.logs()
      .then((resp) => {
        setLogs(resp.data);
        setLogsLoaded(true);
      })
      .catch((error) => {
        errorNotification("Failed to fetch data from API.");
        console.error(error);
      });
  }, [errorNotification]);

  const removeLog = (log: ILogEntry) => {
    ApiService.deleteLog(log.timestamp)
      .then((resp) => {
        if (resp.data.count > 0) {
          successNotification("Log removed", "Log was successfully removed!");

          setLogs((prev) => prev.filter((l) => l.timestamp !== log.timestamp));
        }
      })
      .catch((error) => {
        errorNotification("Failed to fetch data from API.");
        console.error(error);
      });
  };

  const removeAllLogs = () => {
    ApiService.deleteLogs()
      .then((resp) => {
        if (resp.data.count > 0) {
          successNotification(
            "Log(s) removed",
            `${resp.data.count} log(s) was successfully removed!`,
          );
          setLogs([]);
        }
      })
      .catch((error) => {
        errorNotification("Failed to fetch data from API.");
        console.error(error);
      });
  };

  if (!logsLoaded) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <SpinnyLoader width={50} height={50} />
      </div>
    );
  }

  return (
    <div className="col-md-10 mx-auto">
      <div className="mb-3 mt-3">
        <h3 className="text-primary-emphasis text-center mb-3 mt-3">
          Sensor logs
        </h3>
        <Activity mode={logs.length > 0 ? "visible" : "hidden"}>
          <button
            className="btn btn-outline-danger float-end mb-3"
            onClick={removeAllLogs}
          >
            Remove all
          </button>
        </Activity>
      </div>

      <Activity mode={logs.length > 0 ? "visible" : "hidden"}>
        <table className="table table-striped table-hover">
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
      </Activity>

      <Activity mode={logs.length <= 0 ? "visible" : "hidden"}>
        <p className="text-center">No logs :)</p>
      </Activity>
    </div>
  );
}
