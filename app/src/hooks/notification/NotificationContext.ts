import { createContext, useContext } from "react";

export interface INotificationDetails {
  id?: string;
  title: string;
  text: string;
  error: boolean;
}

type NotificationContextType = {
  addNotification: (notif: INotificationDetails) => void;
  errorNotification: (message: string) => void;
  successNotification: (title: string, message: string) => void;
};

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
