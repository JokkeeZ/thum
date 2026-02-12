import { useCallback, useState } from "react";
import {
  NotificationContext,
  type INotificationDetails,
} from "./NotificationContext";
import SlideNotification from "@/components/SlideNotification";

export interface INotificationSettings {
  duration: number;
  slideDirection: "top" | "bottom" | "left" | "right";
  dockPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export default function NotificationProvider(props: {
  children: React.ReactNode;
  settings: INotificationSettings;
}) {
  const [notifications, setNotifications] = useState<INotificationDetails[]>(
    [],
  );

  const createUUID = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    // fallback for environments without crypto.randomUUID support
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const addNotification = useCallback((notif: INotificationDetails) => {
    notif.id = createUUID();
    setNotifications((prev) => [...prev, notif]);
  }, []);

  const success = useCallback(
    (title: string, message: string) => {
      addNotification({
        error: false,
        title: title,
        text: message,
      });
    },
    [addNotification],
  );

  const error = useCallback(
    (message: string) => {
      addNotification({
        error: true,
        title: "Error",
        text: message,
      });
    },
    [addNotification],
  );

  const removeNotification = (id?: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getDockPosition = () => {
    switch (props.settings.dockPosition) {
      case "top-left":
        return { top: "1%", left: "1%" };
      case "top-right":
        return { top: "1%", right: "1%" };
      case "bottom-left":
        return { bottom: "1%", left: "1%" };
      case "bottom-right":
        return { bottom: "1%", right: "1%" };
      default:
        return { bottom: "1%", right: "1%" };
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        addNotification,
        successNotification: success,
        errorNotification: error,
      }}
    >
      <div
        style={{
          position: "fixed",
          zIndex: 9999,
          ...getDockPosition(),
        }}
      >
        {notifications.map((notif) => (
          <SlideNotification
            key={notif.id}
            details={notif}
            settings={props.settings}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>

      {props.children}
    </NotificationContext.Provider>
  );
}
