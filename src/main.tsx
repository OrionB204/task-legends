import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Force Update: 20:20 - REMOÇÃO TOTAL DA BARRA SUPERNOVA

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Falha ao encontrar o elemento root");

const root = createRoot(rootElement);
root.render(<App />);
