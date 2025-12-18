import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context";
import { urlApi } from "../../api/url";

const GestionCodigos = () => {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    codigo: "",
    tipo: "un_uso",
    expira_en: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (usuario && usuario.rol !== "residente") {
      navigate("/dashboard");
      return;
    }
    fetchCodigos();
  }, [token, usuario, navigate]);

  const fetchCodigos = async () => {
    try {
      const response = await fetch(`${urlApi}api/usuarios/admin/codigos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al cargar códigos");
      const data = await response.json();
      setCodigos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    // Si no se escribe código, generar uno aleatorio simple
    let codigoFinal = form.codigo;
    if (!codigoFinal) {
      codigoFinal = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    try {
      const response = await fetch(`${urlApi}api/usuarios/admin/codigos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigo: codigoFinal,
          tipo: form.tipo,
          expira_en: form.expira_en || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al crear código");

      setMsg(`Código creado: ${data.codigo}`);
      setForm({ codigo: "", tipo: "un_uso", expira_en: "" });
      fetchCodigos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar código?")) return;
    try {
      const response = await fetch(
        `${urlApi}api/usuarios/admin/codigos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al eliminar");
      fetchCodigos();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Códigos de Acceso</h1>

      {/* Formulario de Creación */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Generar Nuevo Código</h2>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-bold mb-1">
              Código (Opcional)
            </label>
            <input
              type="text"
              placeholder="Dejar vacío para autogenerar"
              value={form.codigo}
              onChange={(e) =>
                setForm({ ...form, codigo: e.target.value.toUpperCase() })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="un_uso">Un solo uso</option>
              <option value="permanente">Permanente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              Expiración (Opcional)
            </label>
            <input
              type="date"
              value={form.expira_en}
              onChange={(e) => setForm({ ...form, expira_en: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-[#fff200] text-black font-bold p-2 rounded hover:bg-[#e6d900]"
          >
            Generar Código
          </button>
        </form>
        {msg && <p className="text-green-600 font-bold mt-2">{msg}</p>}
        {error && <p className="text-red-600 font-bold mt-2">{error}</p>}
      </div>

      {/* Lista de Códigos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 border-b text-left">Código</th>
              <th className="py-2 px-4 border-b text-left">Tipo</th>
              <th className="py-2 px-4 border-b text-left">Estado</th>
              <th className="py-2 px-4 border-b text-left">Creado Por</th>
              <th className="py-2 px-4 border-b text-left">Fecha Creación</th>
              <th className="py-2 px-4 border-b text-left">Expira En</th>
              <th className="py-2 px-4 border-b text-left">Usado Por</th>
              <th className="py-2 px-4 border-b text-left">Fecha Uso</th>
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Cargando...
                </td>
              </tr>
            ) : (
              codigos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b font-mono font-bold">
                    {c.codigo}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        c.tipo === "permanente"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {c.tipo}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        c.estado === "activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">
                    {c.creador?.nombre_usuario || "Sistema"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : c.fecha_creacion
                      ? new Date(c.fecha_creacion).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">
                    {c.expira_en
                      ? new Date(c.expira_en).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">
                    {c.usuario_invitado?.nombre_usuario || "-"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-600">
                    {c.fecha_uso
                      ? new Date(c.fecha_uso).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionCodigos;
