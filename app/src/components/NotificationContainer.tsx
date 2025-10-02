import { useCallback, useState } from "react";
import { NotificationContext, type IThumNotification } from "../types";
import ThumNotification from "./ThumNotification";

const NotificationContainer = (props: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<IThumNotification[]>([]);

  const createUUID = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const addNotification = useCallback((notif: IThumNotification) => {
    notif.id = createUUID();
    setNotifications((prev) => [...prev, notif]);
  }, []);

  const removeNotification = (id?: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      <div id="notification-container">
        {notifications.map((notif) => (
          <ThumNotification
            key={notif.id}
            notif={notif}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>

      {props.children}
    </NotificationContext.Provider>
  );
};

export default NotificationContainer;
