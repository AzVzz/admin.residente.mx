import React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context";

export const EVENTOS_DASHBOARD_BASE = "/dashboard-vivir-convivir";
const LOGO_VIVIR_CONVIVIR = "https://residente.mx/fotos/eventos-new/LOGO%20VIVIR%20Y%20CONVIVIR.png?v=2";

const itemClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
  }`;

/**
 * Marco fijo del dashboard de Vivir y Convivir (eventos).
 * Barra superior y menú lateral permanecen; solo cambia el contenido (Outlet).
 */
const EventosDashboardLayout = () => {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const esColaborador = usuario?.rol?.toLowerCase() === "colaborador_eventos";
  const enFormulario = /\/notas\/(nueva|editar)/.test(pathname);
  const enEventos = pathname.startsWith(`${EVENTOS_DASHBOARD_BASE}/eventos`);

  return (
    <div className={`${enFormulario ? "max-w-[1400px]" : "max-w-[1080px]"} mx-auto`}>
      {/* Barra superior fija */}
      <div className="sticky top-0 z-30 bg-[#dcdcdc]/95 backdrop-blur border-b border-gray-300 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center">
          {enFormulario && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              ←
            </button>
          )}
        </div>
        <div className="flex flex-col items-center text-center">
          <h1 className="leading-tight">
            <img
              src={LOGO_VIVIR_CONVIVIR}
              alt="Vivir y Convivir"
              className="h-10 w-auto"
            />
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {enFormulario ? "Editor de nota" : enEventos ? "Eventos" : "Notas"}
          </p>
        </div>
        <div className="flex items-center justify-end">
          {!enFormulario && (
            <Link
              to={
                enEventos
                  ? `${EVENTOS_DASHBOARD_BASE}/notas/nueva?formato=evento_destacado`
                  : `${EVENTOS_DASHBOARD_BASE}/notas/nueva`
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <span className="text-xl leading-none">+</span> {enEventos ? "Nuevo evento" : "Nueva nota"}
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-6 items-start py-4">
        {/* Menú lateral */}
        {!enFormulario && (
        <aside className="hidden md:block w-48 shrink-0 sticky top-[76px] bg-white rounded-lg border border-gray-200 p-2">
          <nav className="flex flex-col gap-1">
            <NavLink to={`${EVENTOS_DASHBOARD_BASE}/notas`} className={itemClass}>
              Notas
            </NavLink>
            {!esColaborador && (
              <NavLink to={`${EVENTOS_DASHBOARD_BASE}/eventos`} className={itemClass}>
                Eventos
              </NavLink>
            )}
          </nav>
        </aside>
        )}

        <section className="flex-1 min-w-0">
          {/* Menú en móvil */}
          <nav className={`md:hidden flex gap-2 mb-3 ${enFormulario ? "hidden" : ""}`}>
            <NavLink to={`${EVENTOS_DASHBOARD_BASE}/notas`} className={itemClass}>
              Notas
            </NavLink>
            {!esColaborador && (
              <NavLink to={`${EVENTOS_DASHBOARD_BASE}/eventos`} className={itemClass}>
                Eventos
              </NavLink>
            )}
          </nav>
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default EventosDashboardLayout;
