import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context";
import {
  clienteMediaMe,
  clienteMediaCreateBanner,
  clienteMediaUpdateBanner,
} from "../../api/clienteMediaApi";
import { urlApi } from "../../api/url";

const emptyBannerForm = {
  nombre: "",
  url_destino: "",
  estatus: "borrador",
  imagen_desktop: "",
  imagen_mobile: "",
};

async function uploadImage(file) {
  const formDataUpload = new FormData();
  formDataUpload.append("imagen", file);
  const uploadResponse = await fetch(`${urlApi}api/uploads/editor-image`, {
    method: "POST",
    body: formDataUpload,
  });
  if (!uploadResponse.ok) {
    throw new Error("Error al subir la imagen");
  }
  const uploadData = await uploadResponse.json();
  const logoUrl =
    uploadData.url ||
    uploadData.path ||
    uploadData.imageUrl ||
    uploadData.data?.url;
  if (!logoUrl) throw new Error("No se recibió URL de imagen");
  return String(logoUrl).trim();
}

const ClienteMediaDashboard = () => {
  const { token, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [creatingBanner, setCreatingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [bannerMsg, setBannerMsg] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const me = await clienteMediaMe(token);
      setData(me);
    } catch (e) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const perfil = data?.perfil;
  const banners = data?.banners?.banners || [];
  const bannersTotal = data?.banners?.total || {};
  const notas = data?.notas?.notas || [];
  const notasTotal = data?.notas?.total || {};

  const openCreateBanner = () => {
    setCreatingBanner(true);
    setEditingBanner(null);
    setBannerForm({
      ...emptyBannerForm,
      nombre: perfil?.nombre_display || "",
    });
    setBannerMsg("");
  };

  const openEditBanner = (banner) => {
    setCreatingBanner(false);
    setEditingBanner(banner);
    setBannerForm({
      nombre: banner.nombre || "",
      url_destino: banner.url_destino || "",
      estatus: banner.estatus || "borrador",
      imagen_desktop: banner.imagen_desktop || "",
      imagen_mobile: banner.imagen_mobile || "",
    });
    setBannerMsg("");
  };

  const closeBannerForm = () => {
    setCreatingBanner(false);
    setEditingBanner(null);
    setBannerForm(emptyBannerForm);
    setBannerMsg("");
  };

  const handleBannerImage = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      setBannerForm((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      setBannerMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveBanner = async (e) => {
    e.preventDefault();
    setBannerMsg("");
    setSaving(true);
    try {
      if (creatingBanner) {
        await clienteMediaCreateBanner(token, bannerForm);
        setBannerMsg("Banner creado");
      } else if (editingBanner) {
        await clienteMediaUpdateBanner(token, editingBanner.id, bannerForm);
        setBannerMsg("Banner actualizado");
      }
      await load();
      closeBannerForm();
    } catch (err) {
      setBannerMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (typeof logout === "function") logout();
    else {
      localStorage.removeItem("residente_token");
      localStorage.removeItem("residente_usuario");
    }
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
        <span className="ml-3 text-gray-500">Cargando tu dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 px-4 py-2 bg-black text-white text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[80vh] bg-[#f4f4f4]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="https://residente.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 hover:opacity-80 transition-opacity"
              aria-label="Ir a residente.mx"
            >
              <img
                src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp"
                alt="Residente"
                className="h-10 w-auto"
              />
            </a>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Dashboard
              </p>
              <h1 className="text-xl font-bold text-black truncate leading-tight">
                {perfil?.nombre_display || usuario?.nombre_usuario}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-semibold border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Resumen métricas */}
        <section>
          <h2 className="text-lg font-bold mb-3">Resumen</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {perfil?.puede_banners && (
              <>
                <div className="bg-white border border-gray-200 p-4">
                  <p className="text-2xl font-bold leading-none">
                    {(bannersTotal.impresiones || 0).toLocaleString("es-MX")}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Vistas banner</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                  <p className="text-2xl font-bold leading-none">
                    {(bannersTotal.clicks || 0).toLocaleString("es-MX")}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Clicks banner</p>
                </div>
              </>
            )}
            {perfil?.puede_notas && (
              <>
                <div className="bg-white border border-gray-200 p-4">
                  <p className="text-2xl font-bold leading-none">
                    {(notasTotal.vistas || 0).toLocaleString("es-MX")}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Vistas notas</p>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                  <p className="text-2xl font-bold leading-none">
                    {(notasTotal.clicks || 0).toLocaleString("es-MX")}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Clicks notas</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Banners */}
        {perfil?.puede_banners && (
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold">Tu banner</h2>
              <button
                type="button"
                onClick={openCreateBanner}
                className="text-sm font-semibold bg-[#1d4ed8] text-white px-3 py-1.5"
              >
                + Nuevo banner
              </button>
            </div>

            {(creatingBanner || editingBanner) && (
              <form
                onSubmit={saveBanner}
                className="bg-white border border-gray-200 p-4 mb-4 space-y-3"
              >
                <p className="font-semibold text-sm">
                  {creatingBanner ? "Crear banner" : "Editar banner"}
                </p>
                {bannerMsg && (
                  <p className="text-sm text-red-600">{bannerMsg}</p>
                )}
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="text-sm block">
                    Nombre
                    <input
                      className="mt-1 w-full border border-gray-300 px-2 py-1.5"
                      value={bannerForm.nombre}
                      onChange={(e) =>
                        setBannerForm((p) => ({ ...p, nombre: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="text-sm block">
                    URL destino
                    <input
                      className="mt-1 w-full border border-gray-300 px-2 py-1.5"
                      value={bannerForm.url_destino}
                      onChange={(e) =>
                        setBannerForm((p) => ({
                          ...p,
                          url_destino: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="text-sm block">
                    Estatus
                    <select
                      className="mt-1 w-full border border-gray-300 px-2 py-1.5"
                      value={bannerForm.estatus}
                      onChange={(e) =>
                        setBannerForm((p) => ({
                          ...p,
                          estatus: e.target.value,
                        }))
                      }
                    >
                      <option value="borrador">Borrador</option>
                      <option value="activo">Activo</option>
                      <option value="programado">Programado</option>
                    </select>
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="text-sm block">
                    Imagen desktop
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-xs"
                      onChange={(e) => handleBannerImage(e, "imagen_desktop")}
                    />
                    {bannerForm.imagen_desktop && (
                      <img
                        src={bannerForm.imagen_desktop}
                        alt="Desktop"
                        className="mt-2 max-h-24 object-contain border"
                      />
                    )}
                  </label>
                  <label className="text-sm block">
                    Imagen mobile
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-xs"
                      onChange={(e) => handleBannerImage(e, "imagen_mobile")}
                    />
                    {bannerForm.imagen_mobile && (
                      <img
                        src={bannerForm.imagen_mobile}
                        alt="Mobile"
                        className="mt-2 max-h-24 object-contain border"
                      />
                    )}
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white text-sm px-4 py-2 disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={closeBannerForm}
                    className="border border-gray-400 text-sm px-4 py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {banners.length === 0 ? (
              <p className="text-sm text-gray-500 bg-white border border-gray-200 p-4">
                Aún no tienes banners. Crea uno para empezar a medir vistas y
                clicks.
              </p>
            ) : (
              <div className="space-y-3">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-gray-200 p-4 flex flex-col md:flex-row gap-4"
                  >
                    {b.imagen_desktop ? (
                      <img
                        src={b.imagen_desktop}
                        alt={b.nombre}
                        className="w-full md:w-48 h-28 object-cover border"
                      />
                    ) : (
                      <div className="w-full md:w-48 h-28 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        Sin imagen
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-base leading-tight">
                            {b.nombre}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {b.slug} · {b.estatus}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditBanner(b)}
                          className="text-xs font-semibold border border-black px-2 py-1 shrink-0"
                        >
                          Editar
                        </button>
                      </div>
                      <div className="flex gap-6 mt-3">
                        <div>
                          <p className="text-xl font-bold leading-none">
                            {(b.impresiones || 0).toLocaleString("es-MX")}
                          </p>
                          <p className="text-xs text-gray-600">Vistas</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold leading-none">
                            {(b.clicks || 0).toLocaleString("es-MX")}
                          </p>
                          <p className="text-xs text-gray-600">Clicks</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold leading-none">
                            {b.ctr || 0}%
                          </p>
                          <p className="text-xs text-gray-600">CTR</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Notas */}
        {perfil?.puede_notas && (
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold">Tus notas</h2>
              <Link
                to="/dashboard-cliente/nueva"
                className="text-sm font-semibold bg-[#1d4ed8] text-white px-3 py-1.5"
              >
                + Nueva nota
              </Link>
            </div>

            {notas.length === 0 ? (
              <p className="text-sm text-gray-500 bg-white border border-gray-200 p-4">
                Aún no hay notas con tipo &quot;{perfil.tipo_nota}&quot;.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notas.map((n) => (
                  <Link
                    key={n.id}
                    to={`/dashboard-cliente/editar/${n.id}`}
                    className="bg-white border border-gray-200 overflow-hidden hover:border-black transition-colors"
                  >
                    {n.imagen_chica || n.imagen || n.imagen_mini ? (
                      <img
                        src={n.imagen_chica || n.imagen || n.imagen_mini}
                        alt=""
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div className="w-full h-36 bg-gray-100" />
                    )}
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wide text-gray-500">
                          {n.estatus}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {(n.vistas || 0).toLocaleString("es-MX")} vistas ·{" "}
                          {(n.clicks || 0).toLocaleString("es-MX")} clicks
                        </span>
                      </div>
                      <p className="font-semibold text-sm leading-snug line-clamp-3">
                        {n.titulo}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {!perfil?.puede_banners && !perfil?.puede_notas && (
          <p className="text-sm text-gray-500">
            Tu cuenta aún no tiene permisos de banner ni notas. Contacta a
            Residente.
          </p>
        )}
      </main>
    </div>
  );
};

export default ClienteMediaDashboard;
