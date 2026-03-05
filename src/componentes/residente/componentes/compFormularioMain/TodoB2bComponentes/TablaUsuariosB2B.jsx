import React from "react";
import { FaUser, FaCheck, FaTimes, FaBan, FaTrash } from "react-icons/fa";

const BENEFICIOS = [
  { key: "estudios_mercado", label: "Estudios" },
  { key: "revista_residente", label: "Revista" },
  { key: "nota_publicitaria", label: "Nota / 5 razones" },
  { key: "giveaway", label: "Giveaway" },
  { key: "suscripcion_extra", label: "2da Membresía gratis" },
];

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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beneficios
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                  No hay usuarios B2B registrados
                </td>
              </tr>
            ) : (
              usuarios.map((user) => {
                const b2b = user.b2b;
                const numBeneficios = contarBeneficios(b2b);

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="h-4 w-4 text-indigo-400 mr-2 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {user.nombre_usuario}
                          </span>
                          {b2b?.correo && (
                            <span className="text-xs text-gray-500">
                              {b2b.correo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b2b ? (
                        <span className="text-sm text-gray-700 font-medium">
                          {b2b.numero_meses || "—"} meses
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin datos</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {b2b ? (
                        <div>
                          <span
                            className={`text-xs font-semibold ${numBeneficios === 5 ? "text-green-600" : numBeneficios > 0 ? "text-indigo-600" : "text-gray-400"}`}
                          >
                            {numBeneficios}/5
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {BENEFICIOS.map((ben) =>
                              b2b[ben.key] ? (
                                <span
                                  key={ben.key}
                                  className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-100 text-indigo-700"
                                  title={ben.key}
                                >
                                  {ben.label}
                                </span>
                              ) : null,
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.estado === "activo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
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
