import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import {
  paquetesGet,
  paqueteCreate,
  paqueteUpdate,
  paqueteDelete,
} from "../../../api/bannersApi";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";

const emptyPaquete = {
  nombre: "",
  cantidad_notas: "",
  precio_mxn: "",
  duracion_dias: "",
  activo: true,
};

const PaquetesList = () => {
  const { token } = useAuth();
  const [paquetes, setPaquetes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyPaquete);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPaquetes = async () => {
    setIsLoading(true);
    try {
      const data = await paquetesGet(token);
      setPaquetes(Array.isArray(data) ? data : data.paquetes || []);
    } catch (error) {
      console.error("Error al cargar paquetes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPaquetes();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const startEdit = (paq) => {
    setEditId(paq.id);
    setShowNew(false);
    setForm({
      nombre: paq.nombre || "",
      cantidad_notas: paq.cantidad_notas ?? "",
      precio_mxn: paq.precio_mxn ?? "",
      duracion_dias: paq.duracion_dias ?? "",
      activo: paq.activo ?? true,
    });
  };

  const startNew = () => {
    setEditId(null);
    setShowNew(true);
    setForm(emptyPaquete);
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowNew(false);
    setForm(emptyPaquete);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        cantidad_notas: Number(form.cantidad_notas),
        precio_mxn: Number(form.precio_mxn),
        duracion_dias: Number(form.duracion_dias),
        activo: form.activo,
      };

      if (editId) {
        await paqueteUpdate(token, editId, payload);
      } else {
        await paqueteCreate(token, payload);
      }
      cancelEdit();
      fetchPaquetes();
    } catch (error) {
      console.error("Error al guardar paquete:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar este paquete?")) return;
    try {
      await paqueteDelete(token, id);
      fetchPaquetes();
    } catch (error) {
      console.error("Error al eliminar paquete:", error);
    }
  };

  const renderRow = (paq) => {
    const isEditing = editId === paq.id;

    if (isEditing) {
      return (
        <tr key={paq.id} className="border-b border-gray-100 bg-blue-50">
          <td className="py-2 pr-2">
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            />
          </td>
          <td className="py-2 pr-2">
            <input
              type="number"
              name="cantidad_notas"
              value={form.cantidad_notas}
              onChange={handleChange}
              min="1"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
            />
          </td>
          <td className="py-2 pr-2">
            <input
              type="number"
              name="precio_mxn"
              value={form.precio_mxn}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
            />
          </td>
          <td className="py-2 pr-2">
            <input
              type="number"
              name="duracion_dias"
              value={form.duracion_dias}
              onChange={handleChange}
              min="1"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
            />
          </td>
          <td className="py-2 pr-2">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
              className="h-4 w-4"
            />
          </td>
          <td className="py-2">
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-green-600 hover:text-green-800 cursor-pointer"
                title="Guardar"
              >
                <FaCheck />
              </button>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Cancelar"
              >
                <FaTimes />
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr key={paq.id} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 pr-4 font-medium text-sm">{paq.nombre}</td>
        <td className="py-3 pr-4 text-sm">{paq.cantidad_notas}</td>
        <td className="py-3 pr-4 text-sm">
          ${Number(paq.precio_mxn).toLocaleString("es-MX")} MXN
        </td>
        <td className="py-3 pr-4 text-sm">{paq.duracion_dias} dias</td>
        <td className="py-3 pr-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              paq.activo
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {paq.activo ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td className="py-3">
          <div className="flex gap-2">
            <button
              onClick={() => startEdit(paq)}
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
              title="Editar"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(paq.id)}
              className="text-red-500 hover:text-red-700 cursor-pointer"
              title="Eliminar"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Paquetes de Banners</h3>
        <button
          onClick={startNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <FaPlus /> Nuevo Paquete
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-3 pr-4">Nombre</th>
                <th className="pb-3 pr-4">Notas</th>
                <th className="pb-3 pr-4">Precio</th>
                <th className="pb-3 pr-4">Duracion</th>
                <th className="pb-3 pr-4">Estatus</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {showNew && (
                <tr className="border-b border-gray-100 bg-green-50">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Nombre del paquete"
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      name="cantidad_notas"
                      value={form.cantidad_notas}
                      onChange={handleChange}
                      min="1"
                      placeholder="0"
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      name="precio_mxn"
                      value={form.precio_mxn}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      name="duracion_dias"
                      value={form.duracion_dias}
                      onChange={handleChange}
                      min="1"
                      placeholder="0"
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={form.activo}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-green-600 hover:text-green-800 cursor-pointer"
                        title="Guardar"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        title="Cancelar"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {paquetes.length === 0 && !showNew ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-12"
                  >
                    No hay paquetes
                  </td>
                </tr>
              ) : (
                paquetes.map(renderRow)
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaquetesList;
