import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./componentes/Context"; // importa tu AuthProvider
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from "virtual:pwa-register";
import './index.css'

// Tras un deploy, pide el SW nuevo cada minuto y recarga cuando active.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    setInterval(() => {
      registration.update().catch(() => {});
    }, 60 * 1000);
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);