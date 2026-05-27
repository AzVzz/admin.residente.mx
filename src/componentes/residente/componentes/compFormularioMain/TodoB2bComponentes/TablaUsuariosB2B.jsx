import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaTimes, FaBan, FaTrash, FaSort, FaSortUp, FaSortDown, FaChartLine } from "react-icons/fa";

const BENEFICIOS = [
  { key: "estudios_mercado", label: "Estudios" },
  { key: "revista_residente", label: "Revista" },
  { key: "nota_publicitaria", label: "Nota / 5 razones" },
  { key: "giveaway", label: "Giveaway" },
  { key: "suscripcion_extra", label: "2da Membresía gratis" },
];

const formatMonto = (centavos) => {
  if (!centavos) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(centavos / 100);
};

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFecha = (b2b) => {
  const f = b2b?.suscripcion_datos?.fecha_creacion_stripe
    || b2b?.fecha_aceptacion_terminos
    || b2b?.primer_pago;
  return f ? new Date(f).getTime() : 0;
};

const ESTADO_CONFIG = {
  active:              { label: "Al día",       cls: "bg-green-100 text-green-800" },
  trialing:            { label: "Periodo prueba", cls: "bg-blue-100 text-blue-800" },
  past_due:            { label: "Atrasada",     cls: "bg-amber-100 text-amber-800" },
  unpaid:              { label: "Sin pagar",    cls: "bg-red-100 text-red-800" },
  incomplete:          { label: "Incompleta",   cls: "bg-gray-100 text-gray-700" },
  incomplete_expired:  { label: "Expirada",     cls: "bg-gray-200 text-gray-700" },
  paused:              { label: "Pausada",      cls: "bg-gray-100 text-gray-700" },
  canceled:            { label: "Cancelada",    cls: "bg-red-100 text-red-800" },
};

const getEstadoSuscripcion = (sus) => {
  if (!sus || !sus.estado) return null;
  return ESTADO_CONFIG[sus.estado] || { label: sus.estado, cls: "bg-gray-100 text-gray-700" };
};

const formatIntervalo = (facturas) => {
  switch (facturas) {
    case "month": return "Mensual";
    case "year":  return "Anual";
    case "week":  return "Semanal";
    case "day":   return "Diaria";
    default:      return null;
  }
};

const TablaUsuariosB2B = ({
  usuarios,
  toggleUserStatus,
  desactivarUsuarioB2B,
  handleDelete,
}) => {
  const [sortField, setSortField] = useState("fecha");
  const [sortDir, setSortDir] = useState("desc");

  const contarBeneficios = (b2b) => {
    if (!b2b) return 0;
    return BENEFICIOS.reduce((count, ben) => count + (b2b[ben.key] ? 1 : 0), 0);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    return [...usuarios].sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "fecha":
          valA = getFecha(a.b2b);
          valB = getFecha(b.b2b);
          break;
        case "monto":
          valA = a.b2b?.suscripcion_datos?.monto ?? 0;
          valB = b.b2b?.suscripcion_datos?.monto ?? 0;
          break;
        case "meses_pagados":
          valA = a.b2b?.meses_pagados ?? 0;
          valB = b.b2b?.meses_pagados ?? 0;
          break;
        case "restaurante":
          valA = (a.b2b?.nombre_responsable_restaurante || "").toLowerCase();
          valB = (b.b2b?.nombre_responsable_restaurante || "").toLowerCase();
          return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        default:
          return 0;
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });
  }, [usuarios, sortField, sortDir]);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FaSort className="inline ml-1 opacity-30" />;
    return sortDir === "asc"
      ? <FaSortUp className="inline ml-1 text-indigo-500" />
      : <FaSortDown className="inline ml-1 text-indigo-500" />;
  };

  const ThSortable = ({ field, children }) => (
    <th
      className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 select-none text-xs"
      onClick={() => handleSort(field)}
    >
      {children}<SortIcon field={field} />
    </th>
  );

  return (
    <div className="bg-white overflow-hidden h-full">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3">
        <h3 className="text-white font-semibold">Usuarios B2B</h3>
      </div>
      <div className="max-h-[calc(100vh-180px)] overflow-y-auto overflow-x-hidden">
        <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
          <colgroup>
            <col className="w-10" />
            <col className="w-[15%]" />
            <col className="w-[9%]" />
            <col className="w-[15%]" />
            <col className="w-[10%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                #
              </th>
              <ThSortable field="restaurante">Restaurante</ThSortable>
              <ThSortable field="fecha">Susc.</ThSortable>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                Estado
              </th>
              <ThSortable field="monto">Monto</ThSortable>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                Plan
              </th>
              <ThSortable field="meses_pagados">Pagados</ThSortable>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                Pago
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                Benef.
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                Cuenta
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                Acc.
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-4 py-4 text-center text-gray-500">
                  No hay usuarios B2B registrados
                </td>
              </tr>
            ) : (
              sorted.map((user, idx) => {
                const b2b = user.b2b;
                const numBeneficios = contarBeneficios(b2b);
                const sus = b2b?.suscripcion_datos;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400 font-mono text-xs align-top">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 align-top break-words">
                      <span className="font-medium text-gray-900 leading-tight">
                        {b2b?.nombre_responsable_restaurante || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs align-top">
                      {sus?.fecha_creacion_stripe
                        ? formatFecha(sus.fecha_creacion_stripe)
                        : b2b?.fecha_aceptacion_terminos
                          ? formatFecha(b2b.fecha_aceptacion_terminos)
                          : b2b?.primer_pago
                            ? formatFecha(b2b.primer_pago)
                            : "—"}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {(() => {
                        const estado = getEstadoSuscripcion(sus);
                        const intervalo = formatIntervalo(sus?.facturas);
                        // Día de cobro: si el cliente eligió uno, mostrar ese.
                        // Si no, derivar del próximo periodo (fecha_fin_periodo_actual).
                        let diaCobroLabel = null;
                        if (b2b?.dia_cobro != null) {
                          diaCobroLabel = `Día ${b2b.dia_cobro}`;
                        } else if (
                          sus?.fecha_fin_periodo_actual &&
                          sus.estado !== "canceled" &&
                          new Date(sus.fecha_fin_periodo_actual).getTime() > Date.now()
                        ) {
                          diaCobroLabel = `Día ${new Date(sus.fecha_fin_periodo_actual).getDate()}`;
                        }
                        if (!estado && !diaCobroLabel) return <span className="text-gray-400">—</span>;
                        return (
                          <div className="space-y-1">
                            {estado && (
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${estado.cls}`}>
                                {estado.label}
                              </span>
                            )}
                            {diaCobroLabel && (
                              <div className="text-xs leading-tight">
                                <span className="text-gray-500">Cobro:</span>{" "}
                                <span className="font-semibold text-indigo-700">
                                  {diaCobroLabel}
                                </span>
                              </div>
                            )}
                            {intervalo && (
                              <div className="text-xs text-gray-400">{intervalo}</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-800 align-top">
                      {sus ? formatMonto(sus.monto) : "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600 align-top text-center">
                      {b2b?.numero_meses ? `${b2b.numero_meses}m` : "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600 align-top text-center">
                      {b2b?.meses_pagados != null ? `${b2b.meses_pagados}m` : "—"}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {(() => {
                        const marca = b2b?.ultimo_pago?.marca_tarjeta || b2b?.marca_tarjeta;
                        const tipo = b2b?.ultimo_pago?.tipo_tarjeta || b2b?.tipo_tarjeta;
                        if (!marca && !tipo) return <span className="text-gray-400">—</span>;
                        const tipoLabel =
                          tipo === "credit"
                            ? "Crédito"
                            : tipo === "debit"
                              ? "Débito"
                              : tipo === "prepaid"
                                ? "Prepago"
                                : tipo || "—";
                        const tipoCls =
                          tipo === "credit"
                            ? "bg-emerald-100 text-emerald-700"
                            : tipo === "debit"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-gray-100 text-gray-600";
                        return (
                          <div>
                            <span className="capitalize text-gray-800 font-medium block text-sm leading-tight">
                              {marca || "—"}
                            </span>
                            <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-xs font-semibold rounded ${tipoCls}`}>
                              {tipoLabel}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2 align-top text-center">
                      {b2b ? (
                        <span
                          className={`font-semibold text-base ${numBeneficios === 5 ? "text-green-600" : numBeneficios > 0 ? "text-indigo-600" : "text-gray-400"}`}
                          title={BENEFICIOS.filter((ben) => b2b[ben.key]).map((ben) => ben.label).join(", ") || "Sin beneficios"}
                        >
                          {numBeneficios}/5
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                          user.estado === "activo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium align-top">
                      <div className="flex gap-2 items-center flex-wrap">
                        {user.id && (
                          <Link
                            to={`/dashboardb2b/cliente/${user.id}`}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                            title="Ver Dashboard como admin (Ctrl/Cmd+Click para nueva pestaña)"
                          >
                            <FaChartLine />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user.id, user.estado)}
                          className={`${
                            user.estado === "activo"
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          } cursor-pointer`}
                          title={user.estado === "activo" ? "Desactivar" : "Activar"}
                        >
                          {user.estado === "activo" ? <FaTimes /> : <FaCheck />}
                        </button>
                        {user.estado === "activo" && (
                          <button
                            type="button"
                            onClick={() => desactivarUsuarioB2B(user)}
                            className="text-orange-600 hover:text-orange-900 cursor-pointer"
                            title="Desactivar B2B Completo"
                          >
                            <FaBan />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaUsuariosB2B;
