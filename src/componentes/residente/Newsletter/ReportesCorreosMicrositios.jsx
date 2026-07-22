import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../Context";
import {
  listarClientesB2B,
  estadoMesReportes,
  enviarCorte,
} from "../../api/reportesCorreosApi";
import PreviewCorreoModal from "../componentes/compFormularioMain/PreviewCorreoModal";
import EnviarPruebaModal from "./EnviarPruebaModal";
import HistorialCorreosModal from "./HistorialCorreosModal";
import {
  IoMailOpen,
  IoSend,
  IoTime,
  IoRefresh,
  IoSearch,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

const fmtFecha = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? "—" : d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// YYYYMM -> "julio 2026".
const mesLargo = (periodo) => {
  const mes = periodo % 100;
  const anio = Math.floor(periodo / 100);
  return `${MESES[mes - 1] || "?"} ${anio}`;
};

// Periodo (YYYYMM) del mes actual.
const periodoActual = () => {
  const n = new Date();
  return n.getFullYear() * 100 + (n.getMonth() + 1);
};

// Clave YYYYMMDD para comparar fechas por día (sin hora).
const dayKey = (d) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

const nombreCliente = (c) =>
  c.nombre_responsable_restaurante ||
  c.razon_social ||
  c.nombre_responsable ||
  `Cliente #${c.id}`;

// Estado de envío por (cliente, periodo). Deriva el badge del registro en
// email_eventos_b2b (si existe) y, si no, de la fecha de envío vs hoy.
const badgeDe = (estado, fechaEnvio, hoyKey) => {
  const s = estado?.estado_envio;
  if (s === "enviado")
    return { grupo: "enviado", icon: "🟢", txt: "Enviado", cls: "bg-green-100 text-green-700", detalle: fmtFecha(estado.enviado_en) };
  if (s === "fallo")
    return { grupo: "fallo", icon: "🔴", txt: "Falló", cls: "bg-red-100 text-red-700", detalle: `${estado.intentos || 0} intento(s)`, title: estado.error_envio || "" };
  if (s === "omitido")
    return { grupo: "omitido", icon: "⚪", txt: "Omitido", cls: "bg-gray-100 text-gray-600", detalle: "sin actividad en el periodo" };
  if (s === "pendiente" || s === "enviando" || s === "incierto")
    return { grupo: "proceso", icon: "🔵", txt: "En proceso", cls: "bg-blue-100 text-blue-700" };
  // Sin registro en el periodo: se deriva de la fecha de envío programada.
  if (fechaEnvio) {
    const k = dayKey(fechaEnvio);
    if (k > hoyKey)
      return { grupo: "programado", icon: "🟡", txt: "Programado", cls: "bg-yellow-100 text-yellow-700", detalle: `Se envía el ${fmtFecha(fechaEnvio)}` };
    if (k === hoyKey)
      return { grupo: "programado", icon: "🟠", txt: "Se envía hoy", cls: "bg-orange-100 text-orange-700" };
    return { grupo: "atrasado", icon: "⚠️", txt: "Pendiente", cls: "bg-amber-100 text-amber-800", title: "Debió enviarse; revisar el cron." };
  }
  return { grupo: "sin", icon: "", txt: "—", cls: "bg-gray-100 text-gray-500" };
};

// Dashboard de gestión de los reportes mensuales enviados a los micrositios B2B.
// Muestra, por cada ciclo mensual, el estado de envío del reporte "Checa tus
// resultados" de cada cliente (log leído de email_eventos_b2b), con navegación
// entre meses. Permite previsualizar el correo, mandar una prueba, ver el
// historial y disparar el envío de corte. El envío real lo hace el cron un día
// antes de la fecha de cobro de cada cliente.
const ReportesCorreosMicrositios = () => {
  const { token } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [estadoPorCliente, setEstadoPorCliente] = useState({}); // b2b_id -> registro del periodo
  const [periodo, setPeriodo] = useState(periodoActual);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [soloConCorte, setSoloConCorte] = useState(true);
  const [disparando, setDisparando] = useState(false);
  const [aviso, setAviso] = useState("");

  // Modales activos.
  const [preview, setPreview] = useState(null);
  const [prueba, setPrueba] = useState(null);
  const [historial, setHistorial] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [lista, res] = await Promise.all([
        listarClientesB2B(token),
        estadoMesReportes(token, [periodo]),
      ]);
      setClientes(Array.isArray(lista) ? lista : []);
      // Un registro por cliente para el periodo seleccionado.
      const map = {};
      (res?.rows || []).forEach((r) => {
        map[r.b2b_id] = r;
      });
      setEstadoPorCliente(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const hoyKey = useMemo(() => dayKey(new Date()), []);

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return clientes
      .map((c) => {
        const corte = c.suscripcion_datos?.fecha_fin_periodo_actual || null;
        let fechaEnvio = null;
        let periodoEnvio = null;
        if (corte) {
          const d = new Date(corte);
          d.setDate(d.getDate() - 1); // un día antes del corte (maneja fin de mes)
          fechaEnvio = d;
          periodoEnvio = d.getFullYear() * 100 + (d.getMonth() + 1);
        }
        const estado = estadoPorCliente[c.id] || null;
        return {
          c,
          nombre: nombreCliente(c),
          correo: c.correo,
          estadoSub: c.suscripcion_datos?.estado || null,
          corte,
          fechaEnvio,
          periodoEnvio,
          estado,
          badge: badgeDe(estado, periodoEnvio === periodo ? fechaEnvio : null, hoyKey),
        };
      })
      // Clientes cuyo envío cae en el mes seleccionado ∪ los que tengan registro
      // en el periodo (cubre meses pasados / envíos manuales).
      .filter((f) => f.periodoEnvio === periodo || f.estado)
      .filter((f) => (soloConCorte ? f.corte : true))
      .filter((f) => {
        if (!q) return true;
        return (
          f.nombre.toLowerCase().includes(q) ||
          (f.correo || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ka = a.fechaEnvio ? dayKey(a.fechaEnvio) : Infinity;
        const kb = b.fechaEnvio ? dayKey(b.fechaEnvio) : Infinity;
        return ka - kb;
      });
  }, [clientes, estadoPorCliente, busqueda, soloConCorte, periodo, hoyKey]);

  const contadores = useMemo(() => {
    let enviados = 0;
    let programados = 0;
    let fallidos = 0;
    filas.forEach((f) => {
      if (f.badge.grupo === "enviado") enviados += 1;
      else if (f.badge.grupo === "programado") programados += 1;
      else if (f.badge.grupo === "fallo") fallidos += 1;
    });
    return { enviados, programados, fallidos };
  }, [filas]);

  const cambiarMes = (delta) => {
    setPeriodo((p) => {
      let mes = p % 100;
      let anio = Math.floor(p / 100);
      mes += delta;
      if (mes > 12) {
        mes = 1;
        anio += 1;
      } else if (mes < 1) {
        mes = 12;
        anio -= 1;
      }
      return anio * 100 + mes;
    });
  };

  const esMesActual = periodo === periodoActual();

  const disparaCorte = async () => {
    if (
      !window.confirm(
        "Esto ENVÍA correos reales a los clientes cuyo corte es mañana (un día antes de su cobro). ¿Continuar?",
      )
    ) {
      return;
    }
    setDisparando(true);
    setAviso("");
    try {
      const r = await enviarCorte(token);
      setAviso(r.mensaje || "Envío de corte disparado.");
      cargar();
    } catch (err) {
      setAviso("Error: " + err.message);
    } finally {
      setDisparando(false);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-3">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <IoMailOpen className="text-indigo-600" />
            Reportes Correos Micrositios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Reporte mensual "Checa tus resultados". Se envía automáticamente{" "}
            <b>un día antes</b> de la fecha de cobro de cada cliente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cargar}
            disabled={loading}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-100 cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <IoRefresh className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
          <button
            onClick={disparaCorte}
            disabled={disparando}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer disabled:opacity-50 flex items-center gap-1"
            title="Envía ahora el reporte a los clientes cuyo corte es mañana"
          >
            <IoSend />
            {disparando ? "Enviando..." : "Disparar envío de corte"}
          </button>
        </div>
      </div>

      {aviso && (
        <div className="mb-3 bg-indigo-50 border border-indigo-300 text-indigo-800 px-4 py-2 rounded text-sm">
          {aviso}
        </div>
      )}

      {/* Navegación de mes */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => cambiarMes(-1)}
            className="px-2 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
            title="Mes anterior"
          >
            <IoChevronBack />
          </button>
          <span className="px-3 py-2 text-sm font-semibold text-gray-800 capitalize min-w-[140px] text-center">
            {mesLargo(periodo)}
          </span>
          <button
            onClick={() => cambiarMes(1)}
            className="px-2 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
            title="Mes siguiente"
          >
            <IoChevronForward />
          </button>
        </div>
        {!esMesActual && (
          <button
            onClick={() => setPeriodo(periodoActual())}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 border border-indigo-300 hover:bg-indigo-50 cursor-pointer"
          >
            Mes actual
          </button>
        )}
      </div>

      {/* Contadores + filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1 bg-green-50 border border-green-300 text-green-800 px-3 py-1.5 rounded-lg">
            🟢 <b>{contadores.enviados}</b> enviados
          </span>
          <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-1.5 rounded-lg">
            🟡 <b>{contadores.programados}</b> programados
          </span>
          <span className="flex items-center gap-1 bg-red-50 border border-red-300 text-red-800 px-3 py-1.5 rounded-lg">
            🔴 <b>{contadores.fallidos}</b> fallidos
          </span>
        </div>
        <label className="relative flex-1 min-w-[200px] max-w-xs">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={soloConCorte}
            onChange={(e) => setSoloConCorte(e.target.checked)}
            className="rounded"
          />
          Solo con fecha de corte
        </label>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Cargando clientes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : filas.length === 0 ? (
        <div className="p-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          No hay clientes en {mesLargo(periodo)}.
        </div>
      ) : (
        <div className="overflow-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">Cliente</th>
                <th className="px-4 py-2 font-semibold">Correo</th>
                <th className="px-4 py-2 font-semibold">Corte</th>
                <th className="px-4 py-2 font-semibold">Se envía el</th>
                <th className="px-4 py-2 font-semibold">Estado</th>
                <th className="px-4 py-2 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map((f) => (
                <tr key={f.c.id} className="hover:bg-gray-50 align-middle">
                  <td className="px-4 py-2">
                    <span className="font-medium text-gray-800">{f.nombre}</span>
                    {f.estadoSub && (
                      <span className="block text-xs text-gray-400">
                        sub: {f.estadoSub}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600 max-w-[190px] truncate" title={f.correo}>
                    {f.correo || "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {f.corte ? `día ${new Date(f.corte).getDate()}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                    {fmtFecha(f.fechaEnvio)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${f.badge.cls}`}
                      title={f.badge.title || ""}
                    >
                      {f.badge.icon} {f.badge.txt}
                    </span>
                    {f.badge.detalle && (
                      <span className="block text-xs text-gray-400 mt-0.5">
                        {f.badge.detalle}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          setPreview({ b2b_id: f.c.id, nombre: f.nombre, correo: f.correo })
                        }
                        className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                        title="Ver correo"
                      >
                        <IoMailOpen size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setPrueba({ b2b_id: f.c.id, nombre: f.nombre, correo: f.correo })
                        }
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                        title="Enviar prueba"
                      >
                        <IoSend size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setHistorial({ b2b_id: f.c.id, nombre: f.nombre, correo: f.correo })
                        }
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                        title="Historial de correos"
                      >
                        <IoTime size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {preview && (
        <PreviewCorreoModal cliente={preview} onCerrar={() => setPreview(null)} />
      )}
      {prueba && (
        <EnviarPruebaModal cliente={prueba} onCerrar={() => setPrueba(null)} />
      )}
      {historial && (
        <HistorialCorreosModal
          cliente={historial}
          onCerrar={() => setHistorial(null)}
        />
      )}
    </div>
  );
};

export default ReportesCorreosMicrositios;
