import { useEffect, useState } from "react";
import type { IThumNotification } from "../types";

function ThumNotification(props: {
  notif: IThumNotification;
  onClose: (index?: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleTransitionEnd = () => {
    if (!visible) {
      props.onClose(props.notif.id);
    }
  };

  return (
    <div
      className={
        `notification alert alert-dismissible ` +
        (props.notif.error ? "alert-danger " : "alert-success ") +
        (visible ? "show" : "hide")
      }
      onTransitionEnd={handleTransitionEnd}
    >
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
      ></button>
      <h4 className="alert-heading">{props.notif.title}</h4>
      <p className="mb-0">{props.notif.text}</p>
    </div>
  );
}

export default ThumNotification;
