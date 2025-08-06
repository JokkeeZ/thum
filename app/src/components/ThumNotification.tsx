import { useEffect, useState } from "react";
import type { IThumNotification } from "../types";

function ThumNotification(props: { notif: IThumNotification, onClose: (index?: string) => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      props.onClose(props.notif.id);
    }
  }, [visible, props]);

  return visible ? (
    <div className={"alert alert-dismissible " + (props.notif.error ? "alert-danger" : "alert-success") + (visible ? " show" : "")}>
      <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
      <h4 className="alert-heading">{props.notif.title}</h4>
      <p className="mb-0">{props.notif.text}</p>
    </div>
  ) : null;
}

export default ThumNotification;
