import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import { urlApi } from "../../../api/url";
import { IoStorefront } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import TablaUsuariosB2B from "./TodoB2bComponentes/TablaUsuariosB2B";
import CrearUsuarioB2BModal from "./TodoB2bComponentes/CrearUsuarioB2BModal";

const UsuariosB2BPanel = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    cargarUsuariosB2B();
  }, []);

  const cargarUsuariosB2B = async () => {
    setLoading(true);
    setError("");
    try {
      const [resResponse, b2bResponse] = await Promise.all([
        fetch(`${urlApi}api/usuarios`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
        fetch(`${urlApi}api/usuariosb2b`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
      ]);

      if (!resResponse.ok) throw new Error("Error al cargar usuarios");

      const data = await resResponse.json();
      const b2bData = b2bResponse.ok ? await b2bResponse.json() : [];

      const usuariosB2B = (Array.isArray(b2bData) ? b2bData : [])
        .filter((b2b) => b2b.usuario_id)
        .map((b2b) => {
          const usuarioBase = data.find((u) => u.id === b2b.usuario_id) || {};
          return {
            id: b2b.usuario_id,
            nombre_usuario: b2b.nombre_usuario || usuarioBase.nombre_usuario,
            correo: b2b.correo_cuenta || usuarioBase.correo || b2b.correo,
            estado: b2b.estado_cuenta || usuarioBase.estado || "activo",
            b2b,
          };
        });
      setUsuarios(usuariosB2B);
    } catch (err) {
      setError("Error al cargar usuarios B2B: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${urlApi}api/usuarios/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ estado: currentStatus === "activo" ? "inactivo" : "activo" }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cambiar estado del usuario");
      }
      await cargarUsuariosB2B();
    } catch (err) {
      setError(err.message);
    }
  };

  const desactivarUsuarioB2B = async (user) => {
    const mensaje = `¿Estás seguro de que quieres DESACTIVAR COMPLETAMENTE a este usuario B2B?\n\nEsto desactivará:\n• Su suscripción B2B\n• Todos sus cupones/tickets\n• Su restaurante\n• Su cuenta de usuario\n\nUsuario: ${user.nombre_usuario}\n\nEsta acción puede ser revertida activando manualmente cada elemento.`;
    if (!window.confirm(mensaje)) return;

    setLoading(true);
    setError("");
    try {
      await fetch(`${urlApi}api/usuariosb2b/desactivar-por-usuario/${user.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ suscripcion: false }),
      });
      await fetch(`${urlApi}api/tickets/desactivar-por-usuario/${user.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ activo_manual: false }),
      });
      await fetch(`${urlApi}api/restaurante/desactivar-por-usuario/${user.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: 0 }),
      });
      const usuarioResponse = await fetch(`${urlApi}api/usuarios/${user.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "inactivo" }),
      });
      if (!usuarioResponse.ok) {
        const errorData = await usuarioResponse.json();
        throw new Error(errorData.error || "Error al desactivar la cuenta del usuario");
      }
      await cargarUsuariosB2B();
      alert("✅ Usuario B2B desactivado completamente");
    } catch (err) {
      setError("Error al desactivar usuario B2B: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario B2B?")) return;
    try {
      const response = await fetch(`${urlApi}api/usuarios/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar usuario");
      }
      await cargarUsuariosB2B();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <IoStorefront className="mr-2" />
          Usuarios B2B
        </h2>
        <div className="flex items-center gap-3">
          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
            {usuarios.length} usuarios
          </span>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <IoAddCircleOutline size={18} />
            Crear B2B
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      ) : (
        <TablaUsuariosB2B
          usuarios={usuarios}
          toggleUserStatus={toggleUserStatus}
          desactivarUsuarioB2B={desactivarUsuarioB2B}
          handleDelete={handleDelete}
        />
      )}
      {modalAbierto && (
        <CrearUsuarioB2BModal
          onCreado={() => {
            setModalAbierto(false);
            cargarUsuariosB2B();
          }}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};

export default UsuariosB2BPanel;
