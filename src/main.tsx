import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startFaviconGlobe } from "./lib/faviconGlobe";

startFaviconGlobe();

createRoot(document.getElementById("root")!).render(<App />);
