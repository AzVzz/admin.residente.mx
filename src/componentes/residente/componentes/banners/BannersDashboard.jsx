import React, { useState, useEffect } from "react";
import { FaImage, FaTh, FaBoxOpen, FaShoppingCart, FaCreditCard, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import BannersList from "./BannersList";
import BannerSlotManager from "./BannerSlotManager";
import PaquetesList from "./PaquetesList";
import ComprasList from "./ComprasList";
import ComprarBanner from "./ComprarBanner";

const tabs = [
  { key: "banners", label: "Banners", icon: FaImage },
  { key: "slots", label: "Slots", icon: FaTh },
  { key: "paquetes", label: "Paquetes", icon: FaBoxOpen },
  { key: "compras", label: "Compras", icon: FaShoppingCart },
  { key: "comprar", label: "Comprar Banner", icon: FaCreditCard },
];

const BannersDashboard = () => {
  const [activeTab, setActiveTab] = useState("banners");
  const [compraMsg, setCompraMsg] = useState(null);

  // Check URL params for payment result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compra = params.get("compra");
    if (compra === "exitosa") {
      setCompraMsg({ type: "success", text: "Pago exitoso. El banner se activara automaticamente." });
      setActiveTab("compras");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (compra === "cancelada") {
      setCompraMsg({ type: "error", text: "El pago fue cancelado." });
      setActiveTab("comprar");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "banners":
        return <BannersList />;
      case "slots":
        return <BannerSlotManager />;
      case "paquetes":
        return <PaquetesList />;
      case "compras":
        return <ComprasList />;
      case "comprar":
        return <ComprarBanner />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestion de Banners</h1>

      {compraMsg && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded mb-4 text-sm ${
            compraMsg.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {compraMsg.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          {compraMsg.text}
          <button
            onClick={() => setCompraMsg(null)}
            className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="text-base" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderTab()}
    </div>
  );
};

export default BannersDashboard;
