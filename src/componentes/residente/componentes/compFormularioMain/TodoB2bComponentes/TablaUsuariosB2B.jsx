import React from "react";
import { FaUser, FaCheck, FaTimes, FaBan, FaTrash } from "react-icons/fa";

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

const TablaUsuariosB2B = ({
  usuarios,
  toggleUserStatus,
  desactivarUsuarioB2B,
  handleDelete,
}) => {
  const contarBeneficios = (b2b) => {
    if (!b2b) return 0;
    return BENEFICIOS.reduce((count, ben) => count + (b2b[ben.key] ? 1 : 0), 0);
  };

  return (
    <div className="bg-white overflow-hidden h-full">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3">
        <h3 className="text-white font-semibold">Usuarios B2B</h3>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Restaurante
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Suscripción
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Meses plan
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Meses pagados
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Beneficios
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-4 text-center text-gray-500">
                  No hay usuarios B2B registrados
                </td>
              </tr>
            ) : (
              usuarios.map((user) => {
                const b2b = user.b2b;
                const numBeneficios = contarBeneficios(b2b);
                const sus = b2b?.suscripcion_datos;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {b2b?.nombre_responsable_restaurante || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FaUser className="text-indigo-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900 block">
                            {user.nombre_usuario}
                          </span>
                          {b2b?.nombre_responsable && (
                            <span className="text-gray-400 block">
                              {b2b.nombre_responsable}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                      {user.correo || b2b?.correo || "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                      {sus
                        ? formatFecha(sus.fecha_creacion_stripe)
                        : b2b?.fecha_aceptacion_terminos
                          ? formatFecha(b2b.fecha_aceptacion_terminos)
                          : "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-semibold text-gray-800">
                      {sus ? formatMonto(sus.monto) : "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                      {b2b?.numero_meses ? `${b2b.numero_meses} m` : "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                      {b2b?.meses_pagados != null ? `${b2b.meses_pagados} m` : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {b2b ? (
                        <div>
                          <span
                            className={`font-semibold ${numBeneficios === 5 ? "text-green-600" : numBeneficios > 0 ? "text-indigo-600" : "text-gray-400"}`}
                          >
                            {numBeneficios}/5
                          </span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {BENEFICIOS.map((ben) =>
                              b2b[ben.key] ? (
                                <span
                                  key={ben.key}
                                  className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-100 text-indigo-700"
                                >
                                  {ben.label}
                                </span>
                              ) : null,
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 font-semibold rounded-full ${
                          user.estado === "activo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.estado)}
                          className={`${
                            user.estado === "activo"
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          } cursor-pointer`}
                          title={
                            user.estado === "activo" ? "Desactivar" : "Activar"
                          }
                        >
                          {user.estado === "activo" ? <FaTimes /> : <FaCheck />}
                        </button>
                        {user.estado === "activo" && (
                          <button
                            onClick={() => desactivarUsuarioB2B(user)}
                            className="text-orange-600 hover:text-orange-900 cursor-pointer"
                            title="Desactivar B2B Completo"
                          >
                            <FaBan />
                          </button>
                        )}
                        <button
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
