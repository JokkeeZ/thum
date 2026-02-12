import { createRoot } from "react-dom/client";
import "bootswatch/dist/minty/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "@/thum.css";
import App from "@/App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
