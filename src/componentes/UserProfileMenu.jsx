import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa6";
import { useAuth } from "./Context";
import { borrarPerfil } from "./api/borrarPerfil";

/**
 * Pastilla negra del usuario con dropdown "Borrar perfil".
 * Si el rol es B2B, muestra advertencia de cobro de meses restantes.
 */
export default function UserProfileMenu({
  showRole = false,
  className = "rounded-xl",
}) {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setConfirmDelete(false);
        setError("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!usuario || !token) return null;

  const handleDelete = async () => {
    if (deleting) return;
    setError("");
    setDeleting(true);
    try {
      await borrarPerfil(token);
      saveToken(null);
      saveUsuario(null);
      navigate("/login", { replace: true });
      window.location.reload();
    } catch (err) {
      const data = err?.data;
      if (data?.requiresPayment && data?.invoiceUrl) {
        setError(
          data.error ||
            "Debes pagar los meses restantes antes de borrar tu perfil.",
        );
        window.location.href = data.invoiceUrl;
        return;
      }
      setError(err?.message || "Error al borrar el perfil");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirmDelete(false);
          setError("");
        }}
        className={`inline-flex items-center px-4 py-2 shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-900 cursor-pointer ${className}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Menú de perfil"
      >
        <FaUser className="text-sm -mt-0.5 mr-2" />
        <span className="flex items-center mr-1">
          {usuario?.nombre_usuario}
        </span>
        {showRole && (
          <span className="text-xs uppercase tracking-wide ml-1 opacity-90">
            {usuario.rol}
          </span>
        )}
        <svg
          className={`ml-2 w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 z-50 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden"
        >
          {!confirmDelete ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmDelete(true)}
              className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Borrar perfil
            </button>
          ) : (
            <div className="p-3 space-y-3">
              <p className="text-sm text-red-800 font-semibold">
                ¿Estás seguro que quieres borrar tu perfil? Se te hará un cobro
                restante de lo que te queda del mes.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-xs disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? "Borrando..." : "Sí, borrar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    setError("");
                  }}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-2 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {error && (
            <p className="px-3 pb-3 text-red-600 text-xs text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
