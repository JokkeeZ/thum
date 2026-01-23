import { useEffect, useState } from "react";
import { useNotification } from "../components/notification/NotificationContext";
import ApiService from "../services/ApiService";
import CenteredSpinnyLoader from "../components/CenteredSpinnyLoader";

export default function Settings() {
  const { addNotification, errorNotification } = useNotification();
  const [cfgLoaded, setCfgLoaded] = useState<boolean>(false);

  const [sensorInterval, setSensorInterval] = useState<number>(600);
  const [dateformat, setDateformat] = useState<string>("");
  const [timeformat, setTimeformat] = useState<string>("");
  const [weekformat, setWeekformat] = useState<string>("");
  const [monthformat, setMonthformat] = useState<string>("");
  const [isoWeekFormat, setIsoWeekFormat] = useState<string>("");
  const [useSensor, setUseSensor] = useState<boolean>(true);

  useEffect(() => {
    ApiService.config()
      .then((resp) => {
        setSensorInterval(resp.sensor_interval);
        setDateformat(resp.dateformat);
        setTimeformat(resp.timeformat);
        setWeekformat(resp.weekformat);
        setMonthformat(resp.monthformat);
        setIsoWeekFormat(resp.iso_week_format);
        setUseSensor(resp.use_sensor);

        setCfgLoaded(true);
      })
      .catch((error) => {
        errorNotification("Failed to fetch data from API.");
        console.error(error);
      });
  }, [errorNotification]);

  const updateSettings = () => {
    if (sensorInterval && sensorInterval < 2) {
      errorNotification("Sensor interval <= 2 seconds.");
      return;
    }

    ApiService.updateConfig({
      id: 1,
      sensor_interval: sensorInterval,
      dateformat: dateformat,
      timeformat: timeformat,
      weekformat: weekformat,
      monthformat: monthformat,
      iso_week_format: isoWeekFormat,
      use_sensor: useSensor,
    })
      .then((resp) => {
        addNotification({
          error: resp.error,
          title: "Configuration update",
          text: resp.message,
        });
      })
      .catch((error) => {
        errorNotification("Failed to update configuration.");
        console.error(error);
      });
  };

  const getSensorPollText = () => {
    const SECONDS_IN_MINUTE = 60;
    const SECONDS_IN_HOUR = 3600;
    const SECONDS_IN_DAY = 86400;

    if (sensorInterval < SECONDS_IN_MINUTE) {
      return `${sensorInterval} seconds`;
    }

    if (sensorInterval < SECONDS_IN_HOUR) {
      return `${(sensorInterval / SECONDS_IN_MINUTE).toFixed(2)} minutes`;
    }

    if (sensorInterval < SECONDS_IN_DAY) {
      return `${(sensorInterval / SECONDS_IN_HOUR).toFixed(2)} hours`;
    }

    return `${(sensorInterval / SECONDS_IN_DAY).toFixed(2)} days`;
  };

  if (!cfgLoaded) {
    return <CenteredSpinnyLoader />;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-12 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <form>
                <fieldset>
                  <legend className="text-center">Settings</legend>

                  <fieldset>
                    <div>
                      <label htmlFor="interval" className="form-label mt-4">
                        Sensor interval
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="interval"
                        min={2}
                        value={sensorInterval}
                        onChange={(e) =>
                          setSensorInterval(e.currentTarget.valueAsNumber)
                        }
                        aria-describedby="intervalHelp"
                        placeholder="Enter sensor inteval in seconds"
                      />
                      <small id="intervalHelp" className="form-text text-muted">
                        Sensor will be polled every {sensorInterval} seconds. (
                        {getSensorPollText()})
                      </small>
                    </div>

                    <div className="mt-3">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={useSensor}
                          onChange={(e) =>
                            setUseSensor(e.currentTarget.checked)
                          }
                          id="useSensor"
                        />
                        <label className="form-check-label" htmlFor="useSensor">
                          Use sensor
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <div>
                      <label htmlFor="dateFormat" className="form-label mt-4">
                        Date format string
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="dateFormat"
                        value={dateformat}
                        onChange={(e) => setDateformat(e.currentTarget.value)}
                        placeholder="Default %Y-%m-%d"
                      />
                    </div>

                    <div>
                      <label htmlFor="timeFormat" className="form-label mt-4">
                        Time format string
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="timeFormat"
                        value={timeformat}
                        onChange={(e) => setTimeformat(e.currentTarget.value)}
                        placeholder="Default %H:%M:%S"
                      />
                    </div>

                    <div>
                      <label htmlFor="weekFormat" className="form-label mt-4">
                        Week format string
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="weekFormat"
                        value={weekformat}
                        onChange={(e) => setWeekformat(e.currentTarget.value)}
                        placeholder="Default %G-W%V"
                      />
                    </div>

                    <div>
                      <label htmlFor="monthFormat" className="form-label mt-4">
                        Month format string
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="monthFormat"
                        value={monthformat}
                        onChange={(e) => setMonthformat(e.currentTarget.value)}
                        placeholder="Default %Y-%m"
                      />
                    </div>

                    <div>
                      <label htmlFor="isoWFormat" className="form-label mt-4">
                        ISO Week format string
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="isoWFormat"
                        value={isoWeekFormat}
                        onChange={(e) =>
                          setIsoWeekFormat(e.currentTarget.value)
                        }
                        placeholder="Default %G-W%V-%u"
                      />
                    </div>
                  </fieldset>

                  <button
                    type="button"
                    className="btn btn-primary mt-3 text-dark"
                    onClick={updateSettings}
                  >
                    Update settings
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-sm-12 col-lg-6 d-grid mt-2">
          <a
            href={ApiService.dumpUrl()}
            role="button"
            className="btn btn-outline-info"
            download
          >
            ⤓ Download database
          </a>
        </div>
      </div>
    </div>
  );
}
