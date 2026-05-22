import React, { useState, lazy, Suspense } from "react";

// Vistas del chatbot consolidadas en una sola con navegación por pestañas.
// Cada sub-vista es autónoma (trae sus propios datos).
const ChatbotMetrics = lazy(() => import("./ChatbotMetrics"));
const ConversacionesList = lazy(() => import("./ConversacionesList"));
const ChatbotFeedback = lazy(() => import("./ChatbotFeedback"));
const ChatbotStats = lazy(() => import("./ChatbotStats"));
const ChatbotIndexStatus = lazy(() => import("./ChatbotIndexStatus"));

const TABS = [
  { key: "metricas", label: "Métricas", Comp: ChatbotMetrics },
  { key: "conversaciones", label: "Conversaciones", Comp: ConversacionesList },
  { key: "feedback", label: "Feedback", Comp: ChatbotFeedback },
  { key: "estadisticas", label: "Estadísticas", Comp: ChatbotStats },
  { key: "indice", label: "Índice", Comp: ChatbotIndexStatus },
];

export default function ChatbotPanel() {
  const [tab, setTab] = useState("metricas");
  const Active = (TABS.find((t) => t.key === tab) || TABS[0]).Comp;

  return (
    <div className="w-full">
      {/* Navegación por pestañas */}
      <div className="max-w-[1080px] mx-auto px-4 pt-6">
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                tab === t.key
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Suspense
        fallback={
          <div className="py-16 text-center text-gray-400 text-sm">Cargando…</div>
        }
      >
        <Active />
      </Suspense>
    </div>
  );
}
