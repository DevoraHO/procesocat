import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error: any) {
  console.error('App failed to start:', error);
  document.body.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#1B4332;color:#fff;text-align:center;padding:20px"><div style="font-size:60px">🌲</div><h2>ProcesoCat</h2><p>Error: ${error?.message || 'startup failed'}</p><button onclick="location.reload()" style="background:#fff;color:#1B4332;border:none;padding:12px 24px;border-radius:8px;font-size:16px;margin-top:20px;cursor:pointer">Recargar</button></div>`;
}
