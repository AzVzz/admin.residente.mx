import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./componentes/Context"; // importa tu AuthProvider
import { BrowserRouter } from 'react-router-dom'
import './index.css'

// Tras un deploy, pedir el SW nuevo cada minuto (sin workbox-window).
// vite-plugin-pwa ya registra el SW (injectRegister: auto).
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  const tick = () => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) reg.update().catch(() => {});
    });
  };
  window.addEventListener("load", () => {
    tick();
    setInterval(tick, 60 * 1000);
  });
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);