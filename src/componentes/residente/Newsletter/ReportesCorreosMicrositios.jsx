import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../Context";
import {
  listarClientesB2B,
  historialReportes,
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
  IoCalendarNumber,
} from "react-icons/io5";

const fmtFecha = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? "—" : d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

const nombreCliente = (c) =>
  c.nombre_responsable_restaurante ||
  c.razon_social ||
  c.nombre_responsable ||
  `Cliente #${c.id}`;

// Dashboard de gestión de los reportes mensuales enviados a los micrositios B2B.
// Muestra cada cliente con su fecha de corte (próximo cobro Stripe), el estado de
// los reportes enviados, y permite previsualizar el correo, mandar una prueba y
// ver el historial. El envío real se adelanta un día al corte (lo hace el cron).
const ReportesCorreosMicrositios = () => {
  const { token } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [resumen, setResumen] = useState({}); // b2b_id -> { total, ultimo_envio }
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
      const [lista, hist] = await Promise.all([
        listarClientesB2B(token),
        historialReportes(token),
      ]);
      setClientes(Array.isArray(lista) ? lista : []);
      // Solo reportes mensuales para el estado por cliente.
      const map = {};
      (Array.isArray(hist) ? hist : [])
        .filter((r) => r.tipo_evento === "reporte_mensual")
        .forEach((r) => {
          map[r.b2b_id] = { total: r.total, ultimo_envio: r.ultimo_envio };
        });
      setResumen(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Día de mañana: el cron envía a quienes su corte cae mañana (un día antes del cobro).
  const diaManana = useMemo(() => {
    const m = new Date();
    m.setDate(m.getDate() + 1);
    return m.getDate();
  }, []);

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return clientes
      .map((c) => {
        const corte = c.suscripcion_datos?.fecha_fin_periodo_actual || null;
        const diaCorte = corte ? new Date(corte).getDate() : null;
        return {
          c,
          nombre: nombreCliente(c),
          correo: c.correo,
          estadoSub: c.suscripcion_datos?.estado || null,
          corte,
          diaCorte,
          seEnviaHoy: diaCorte != null && diaCorte === diaManana,
          rep: resumen[c.id] || null,
        };
      })
      .filter((f) => (soloConCorte ? f.corte : true))
      .filter((f) => {
        if (!q) return true;
        return (
          f.nombre.toLowerCase().includes(q) ||
          (f.correo || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Primero los que se envían hoy, luego por día de corte.
        if (a.seEnviaHoy !== b.seEnviaHoy) return a.seEnviaHoy ? -1 : 1;
        return (a.diaCorte ?? 99) - (b.diaCorte ?? 99);
      });
  }, [clientes, resumen, busqueda, soloConCorte, diaManana]);

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

  const totalHoy = filas.filter((f) => f.seEnviaHoy).length;

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

      {/* Resumen + filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 px-3 py-1.5 rounded-lg text-sm">
          <IoCalendarNumber />
          <span>
            <b>{totalHoy}</b> cliente(s) se envían hoy (corte mañana, día {diaManana})
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
          No hay clientes que coincidan.
        </div>
      ) : (
        <div className="overflow-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">Cliente</th>
                <th className="px-4 py-2 font-semibold">Correo</th>
                <th className="px-4 py-2 font-semibold">Corte</th>
                <th className="px-4 py-2 font-semibold">Próximo cobro</th>
                <th className="px-4 py-2 font-semibold">Último reporte</th>
                <th className="px-4 py-2 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map((f) => (
                <tr key={f.c.id} className="hover:bg-gray-50 align-middle">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{f.nombre}</span>
                      {f.seEnviaHoy && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-800">
                          se envía hoy
                        </span>
                      )}
                    </div>
                    {f.estadoSub && (
                      <span className="block text-xs text-gray-400">
                        sub: {f.estadoSub}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600 max-w-[190px] truncate" title={f.correo}>
                    {f.correo || "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {f.diaCorte ? `día ${f.diaCorte}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                    {fmtFecha(f.corte)}
                  </td>
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                    {f.rep ? (
                      <span>
                        {fmtFecha(f.rep.ultimo_envio)}
                        <span className="text-xs text-gray-400"> ({f.rep.total})</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">nunca</span>
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
