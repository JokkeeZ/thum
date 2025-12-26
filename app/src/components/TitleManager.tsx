import { useEffect } from "react";
import { useLocation } from "react-router";

export default function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    if (pathname === "/") {
      document.title = "Thum: Home";
      return;
    }

    const title = pathname
      .replace(/\//g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    document.title = `Thum: ${title}`;
  }, [location.pathname]);

  return null;
}
