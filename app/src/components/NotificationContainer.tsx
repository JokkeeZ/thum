import { useCallback, useState } from "react";
import { NotificationContext, type IThumNotification } from "../types";
import ThumNotification from "./ThumNotification";

const NotificationContainer = (props: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<IThumNotification[]>([]);

  const addNotification = useCallback((notif: IThumNotification) => {
    notif.id = crypto.randomUUID();
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
