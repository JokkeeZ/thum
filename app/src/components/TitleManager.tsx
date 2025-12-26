import { useEffect } from "react";
import { useLocation } from "react-router";

export default function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    if (pathname === "/") {
      document.title = "App: Home";
      return;
    }

    const title = pathname
      .replace(/\//g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    document.title = `App: ${title}`;
  }, [location.pathname]);

  return null;
}
