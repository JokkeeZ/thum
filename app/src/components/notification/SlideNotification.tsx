import { useEffect, useState } from "react";
import type { INotificationDetails } from "./NotificationContext";
import type { INotificationSettings } from "./NotificationContainer";

export default function SlideNotification(props: {
  details: INotificationDetails;
  settings: INotificationSettings;
  onClose: (index?: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, props.settings.duration);

    return () => clearTimeout(timer);
  }, [props.settings.duration]);

  const handleTransitionEnd = () => {
    if (!visible) {
      props.onClose(props.details.id);
    }
  };

  const getTransformDirection = () => {
    switch (props.settings.slideDirection) {
      case "top":
        return "translateY(-120%)";
      case "bottom":
        return "translateY(120%)";
      case "left":
        return "translateX(-120%)";
      case "right":
        return "translateX(120%)";
      default:
        return "translateY(0)";
    }
  };

  return (
    <div
      className={
        `alert alert-dismissible ` +
        (props.details.error ? "alert-danger " : "alert-success ") +
        (visible ? "show" : "hide")
      }
      style={{
        position: "relative",
        padding: "16px",
        borderRadius: "4px",
        transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(0) translateY(0)"
          : getTransformDirection(),
        zIndex: 9999,
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
      ></button>
      <h4 className="alert-heading">{props.details.title}</h4>
      <p className="mb-0">{props.details.text}</p>
    </div>
  );
}
