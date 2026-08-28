import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./componentes/Context"; // importa tu AuthProvider
import { BrowserRouter } from 'react-router-dom'
import './index.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);