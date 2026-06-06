import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { urlApi } from "../../../api/url";
import { bannerSceneLoadByToken } from "../../../api/bannerSceneApi.js";

// Konva stays out of the main bundle — loaded only when editor opens.
const BannerEditorModal = lazy(() => import("./BannerEditor/BannerEditorModal.jsx"));

const API_BASE = urlApi;

const DURACION_LABELS = {
  semanal: "Semanal",
  mensual: "Mensual",
  trimestral: "Trimestral",
};

const DURACION_DESC = {
  semanal: "7 dias",
  mensual: "30 dias",
  trimestral: "90 dias",
};

const ComprarBanner = () => {
  const [config, setConfig] = useState(null);
  const [tab, setTab] = useState("pagina_principal");
  const [duracion, setDuracion] = useState("mensual");

  // Selections
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPaquete, setSelectedPaquete] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [expandedSeccion, setExpandedSeccion] = useState(null);

  // Step 2 fields
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [urlDestino, setUrlDestino] = useState("");
  const [imagenDesktop, setImagenDesktop] = useState(null);
  const [imagenMobile, setImagenMobile] = useState(null);
  const [previewDesktop, setPreviewDesktop] = useState("");
  const [previewMobile, setPreviewMobile] = useState("");

  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("upload"); // "upload" | "editor"
  const [sceneJson, setSceneJson] = useState(null); // serialized scene string to send on submit
  const [editToken, setEditToken] = useState(null); // token from previous draft (re-edit)
  const [initialSceneJson, setInitialSceneJson] = useState(null); // scene loaded for re-edit
  const [reEditNotice, setReEditNotice] = useState(null); // user-visible message for ?token= flow
  const isReEditRef = useRef(false); // true when in re-edit mode (submit → PUT instead of create)

  const [promoCode, setPromoCode] = useState("");
  const [isPromoValido, setPromoValido] = useState(null);
  const [promoOverride, setPromoOverride] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE}api/stripe-banners/config`)
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setError("No se pudo cargar la configuracion de precios"));
  }, []);

  // Re-edit via ?token= or ?edit_token= query param.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_ = params.get("token") || params.get("edit_token");
    if (!token_) return;

    bannerSceneLoadByToken(token_)
      .then((data) => {
        // scene_json is already a parsed object from the backend GET handler.
        setInitialSceneJson(data.scene_json ?? null);
        if (data.nombre) setNombre(data.nombre.replace(/^Banner /, ""));
        if (data.url_destino) setUrlDestino(data.url_destino);
        setEditToken(token_);
        isReEditRef.current = true;
        setEditorMode("editor");
        setReEditNotice("Retomaste un diseño guardado. Cuando termines, haz clic en Diseñar con editor para abrirlo.");
        setStep(2);
      })
      .catch(() => {
        setReEditNotice("El enlace de re-edición no es válido o ya expiró. Puedes crear un diseño nuevo.");
      });
  // Only run once on mount.
  }, []);

  // Derived values
  const ivaRate = config ? config.iva_porcentaje / 100 : 0.16;

  const isSlotTab = tab === "pagina_principal";
  const isSeccionTab = tab === "secciones";
  const isNotasTab = tab === "notas";

  const getSelectedPrice = () => {
    if (isNotasTab && selectedPaquete) {
      return selectedPaquete.precios[duracion] || 0;
    }
    if (isSlotTab && selectedSlot) {
      return selectedSlot.precios[duracion] || 0;
    }
    if (isSeccionTab && selectedSeccion && config.secciones_catalogo) {
      return config.secciones_catalogo.precios[duracion] || 0;
    }
    return 0;
  };

  const subtotalBase = getSelectedPrice();
  const subtotal = promoOverride !== null ? promoOverride / 100 : subtotalBase;
  const iva = subtotal * ivaRate;
  const total = subtotal + iva;

  const validarCodigo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch(`${API_BASE}api/banner-promo-codigos/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: code }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoValido(true);
        setPromoOverride(data.precio_override_centavos);
      } else {
        setPromoValido(false);
        setPromoOverride(null);
      }
    } catch {
      setPromoValido(false);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectedSlot(null);
    setSelectedPaquete(null);
    setSelectedSeccion(null);
  };

  const handleFileChange = (e, setter, previewSetter) => {
    const file = e.target.files?.[0] || null;
    setter(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => previewSetter(reader.result);
      reader.readAsDataURL(file);
    } else {
      previewSetter("");
    }
  };

  // Called when editor saves a design.
  const handleEditorSave = ({ desktopFile, mobileFile, sceneJson: sj }) => {
    setImagenDesktop(desktopFile);
    setImagenMobile(mobileFile);
    setPreviewDesktop(URL.createObjectURL(desktopFile));
    setPreviewMobile(URL.createObjectURL(mobileFile));
    setSceneJson(sj); // serialized JSON string sent on submit
    setInitialSceneJson(sj); // keep scene so reopening the editor restores the design
    setIsEditorOpen(false);
  };

  const canContinue = () => {
    if (isSlotTab) return selectedSlot && !selectedSlot.ocupado;
    if (isSeccionTab) return selectedSeccion && !selectedSeccion.ocupado;
    if (isNotasTab) return !!selectedPaquete;
    return false;
  };

  const handleSubmit = async () => {
    if (!imagenDesktop) return setError("La imagen desktop es obligatoria");
    if (!email.trim()) return setError("El email es obligatorio");
    if (!nombre.trim()) return setError("El nombre es obligatorio");

    setIsLoading(true);
    setError("");

    try {
      let banner;

      if (isReEditRef.current && editToken) {
        // Re-edit: update existing draft via PUT.
        const formData = new FormData();
        formData.append("nombre", `Banner ${nombre}`);
        if (urlDestino) formData.append("url_destino", urlDestino);
        formData.append("imagen_desktop", imagenDesktop);
        if (imagenMobile) formData.append("imagen_mobile", imagenMobile);
        if (sceneJson) formData.append("scene_json", sceneJson);

        const putRes = await fetch(`${API_BASE}api/banners/public/edit/${encodeURIComponent(editToken)}`, {
          method: "PUT",
          body: formData,
        });
        if (!putRes.ok) {
          const err = await putRes.json().catch(() => ({}));
          throw new Error(err.error || "Error al actualizar el banner");
        }
        banner = await putRes.json();
        // PUT returns updated banner; we already have editToken.
      } else {
        // New banner: POST create.
        const formData = new FormData();
        formData.append("nombre", `Banner ${nombre}`);
        if (urlDestino) formData.append("url_destino", urlDestino);
        formData.append("imagen_desktop", imagenDesktop);
        if (imagenMobile) formData.append("imagen_mobile", imagenMobile);
        if (sceneJson) formData.append("scene_json", sceneJson);

        const bannerRes = await fetch(`${API_BASE}api/banners/public/crear`, {
          method: "POST",
          body: formData,
        });
        if (!bannerRes.ok) {
          const err = await bannerRes.json().catch(() => ({}));
          throw new Error(err.error || "Error al crear el banner");
        }
        banner = await bannerRes.json();
        // Store token for potential re-edit (soft re-use).
        if (banner.edit_token) setEditToken(banner.edit_token);
      }

      // Stripe checkout — unchanged flow.
      let endpoint;
      const body = {
        banner_id: banner.id,
        duracion,
        customer_email: email,
        comprador_nombre: nombre,
        comprador_empresa: empresa,
        ...(promoCode.trim() && { promo_code: promoCode.trim().toUpperCase() }),
      };

      if (isSlotTab && selectedSlot) {
        endpoint = "create-checkout-session-slot";
        body.slot_id = selectedSlot.id;
        if (selectedSlot.slot_ids) body.slot_ids = selectedSlot.slot_ids;
      } else if (isSeccionTab && selectedSeccion) {
        endpoint = "create-checkout-session-seccion";
        body.seccion = selectedSeccion.slug_seccion;
        body.categoria = selectedSeccion.slug_categoria;
      } else {
        endpoint = "create-checkout-session";
        body.paquete_id = selectedPaquete.id;
      }

      const checkoutRes = await fetch(
        `${API_BASE}api/stripe-banners/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!checkoutRes.ok) {
        const err = await checkoutRes.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear la sesion de pago");
      }

      const { url } = await checkoutRes.json();
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Error inesperado");
      setIsLoading(false);
    }
  };

  // Loading state
  if (!config) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amarillo" />
      </div>
    );
  }

  const categorias = config.categorias || {};
  const notas = config.notas || [];
  const duraciones = config.duraciones || ["semanal", "mensual", "trimestral"];

  return (
    <div className="max-w-[800px] mx-auto py-8 px-4">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img
          src="https://residente.mx/fotos/fotos-estaticas/BANNER%20FA%CC%81CIL%20POR%20RESIDENTE-93.png"
          alt="Banner Fácil por Residente"
          className="max-w-[320px] w-full h-auto"
        />
      </div>

      {/* Re-edit notice */}
      {reEditNotice && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {reEditNotice}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <StepBadge
          n={1}
          label="Elige tu plan"
          active={step === 1}
          onClick={() => setStep(1)}
        />
        <div className="w-12 h-px bg-gray-300" />
        <StepBadge n={2} label="Banner y pago" active={step === 2} />
      </div>

      {/* =================== STEP 1 =================== */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          {/* Duration selector */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Duracion</h3>
            <div className="grid grid-cols-3 gap-3">
              {duraciones.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuracion(d)}
                  className={`py-3 px-4 rounded-xl text-center border-2 transition-all cursor-pointer ${
                    duracion === d
                      ? "border-amarillo bg-amarillo/10"
                      : "border-gray-200 hover:border-amarillo bg-white"
                  }`}
                >
                  <div className="font-bold text-sm">
                    {DURACION_LABELS[d] || d}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {DURACION_DESC[d] || ""}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {categorias.pagina_principal && (
              <TabButton
                active={tab === "pagina_principal"}
                onClick={() => handleTabChange("pagina_principal")}
                label={categorias.pagina_principal.nombre}
              />
            )}
            {config.secciones_catalogo?.secciones?.length > 0 && (
              <TabButton
                active={tab === "secciones"}
                onClick={() => handleTabChange("secciones")}
                label="Secciones"
              />
            )}
            {notas.length > 0 && (
              <TabButton
                active={tab === "notas"}
                onClick={() => handleTabChange("notas")}
                label="Notas"
              />
            )}
          </div>

          {/* Tab: Secciones (hierarchical accordion) */}
          {isSeccionTab && config.secciones_catalogo && (
            <div className="mb-6">
              <SeccionSelector
                catalogo={config.secciones_catalogo}
                duracion={duracion}
                selectedSeccion={selectedSeccion}
                expandedSeccion={expandedSeccion}
                onExpand={setExpandedSeccion}
                onSelect={(cat) => {
                  setSelectedSeccion(cat);
                  setSelectedSlot(null);
                  setSelectedPaquete(null);
                }}
              />
            </div>
          )}

          {/* Tab: Pagina Principal */}
          {isSlotTab && (
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(categorias[tab]?.slots || []).map((slot) => {
                  const isOcupado = !!slot.ocupado;
                  const isSelected = selectedSlot?.id === slot.id;
                  const precio = slot.precios?.[duracion] || 0;

                  return (
                    <button
                      key={slot.id}
                      disabled={isOcupado}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSelectedPaquete(null);
                      }}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isOcupado
                          ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                          : isSelected
                            ? "border-amarillo bg-amarillo/10 cursor-pointer"
                            : "border-gray-200 hover:border-amarillo bg-white cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">
                          {slot.nombre}
                        </span>
                        {isOcupado ? (
                          <span className="text-[11px] bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                            Ocupado
                          </span>
                        ) : (
                          <span className="text-[11px] bg-green-100 text-green-600 font-medium px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        )}
                      </div>
                      <div className="text-black font-bold text-lg mt-2">
                        ${precio.toLocaleString("es-MX")} MXN
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {DURACION_LABELS[duracion]} ({DURACION_DESC[duracion]})
                      </div>
                      {isOcupado && slot.fecha_fin && (
                        <div className="text-[11px] text-gray-400 mt-2">
                          Disponible:{" "}
                          {new Date(slot.fecha_fin).toLocaleDateString("es-MX")}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab: Notas */}
          {tab === "notas" && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm mb-4 px-1">
                <span className="text-gray-500">
                  Notas disponibles:{" "}
                  <strong className="text-gray-700">
                    {config.notas_disponibles?.toLocaleString("es-MX") ?? "--"}
                  </strong>{" "}
                  de {config.notas_total?.toLocaleString("es-MX") ?? "--"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notas.map((paq) => {
                  const isSelected = selectedPaquete?.id === paq.id;
                  const precio = paq.precios?.[duracion] || 0;

                  return (
                    <button
                      key={paq.id}
                      onClick={() => {
                        setSelectedPaquete(paq);
                        setSelectedSlot(null);
                      }}
                      className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-amarillo bg-amarillo/10"
                          : "border-gray-200 hover:border-amarillo bg-white"
                      }`}
                    >
                      <div className="font-semibold text-sm">{paq.nombre}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {paq.cantidad_notas.toLocaleString("es-MX")} notas
                      </div>
                      <div className="text-black font-bold text-lg mt-2">
                        ${precio.toLocaleString("es-MX")} MXN
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {DURACION_LABELS[duracion]} ({DURACION_DESC[duracion]})
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price summary */}
          {(selectedSlot || selectedPaquete || selectedSeccion) && (
            <div>
              {isSeccionTab && selectedSeccion && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                  <span className="font-medium">Tu banner aparecerá en:</span>
                  <a
                    href={`https://residente.mx/seccion/${selectedSeccion.slug_seccion}/categoria/${selectedSeccion.slug_categoria}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-0.5 text-blue-600 hover:underline font-mono break-all"
                  >
                    residente.mx/seccion/{selectedSeccion.slug_seccion}
                    /categoria/{selectedSeccion.slug_categoria}
                  </a>
                </div>
              )}
              <PriceSummary
                label={
                  selectedPaquete
                    ? `${selectedPaquete.nombre} - ${DURACION_LABELS[duracion]}`
                    : selectedSeccion
                      ? `${selectedSeccion.nombre} - ${DURACION_LABELS[duracion]}`
                      : `${selectedSlot.nombre} - ${DURACION_LABELS[duracion]}`
                }
                subtotal={subtotal}
                iva={iva}
                total={total}
                ivaRate={config.iva_porcentaje}
                modoCobro={config.modo_cobro}
                duracion={duracion}
              />
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!canContinue()}
            className="w-full bg-amarillo hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg text-lg transition-colors cursor-pointer"
          >
            Continuar
          </button>
        </div>
      )}

      {/* =================== STEP 2 =================== */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-6">Datos de contacto y banner</h2>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Nombre de tu empresa (opcional)"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link del banner{" "}
                <span className="text-gray-400 font-normal">
                  (al hacer clic en tu banner)
                </span>
              </label>
              <input
                type="url"
                value={urlDestino}
                onChange={(e) => setUrlDestino(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="https://tu-restaurante.com"
              />
              <p className="text-xs text-gray-400 mt-1">
                Los usuarios serán redirigidos a esta URL al hacer clic en tu
                banner.
              </p>
            </div>
          </div>

          {/* Código promocional */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código promocional{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoValido(null);
                  setPromoOverride(null);
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase"
                placeholder="Ej: TEST10"
              />
              <button
                type="button"
                onClick={validarCodigo}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 cursor-pointer"
              >
                Aplicar
              </button>
            </div>
            {isPromoValido === true && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ✓ Código aplicado — precio: $
                {(promoOverride / 100).toLocaleString("es-MX")} MXN
              </p>
            )}
            {isPromoValido === false && (
              <p className="text-xs text-red-500 mt-1">
                Código inválido o ya utilizado
              </p>
            )}
          </div>

          {/* Banner source: upload vs. editor */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">¿Cómo quieres crear tu banner?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditorMode("upload")}
                className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                  editorMode === "upload"
                    ? "border-amarillo bg-amarillo/10 text-gray-900"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                Subir banner
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("editor")}
                className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                  editorMode === "editor"
                    ? "border-amarillo bg-amarillo/10 text-gray-900"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                Crear con editor
              </button>
            </div>
          </div>

          {/* Upload path (unchanged) */}
          {editorMode === "upload" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen Desktop *
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  Big: 1080×216 px · Medium: 736×147 px · Small: 680×136 px (ratio
                  5:1)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e, setImagenDesktop, setPreviewDesktop)
                  }
                  className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amarillo file:text-black hover:file:bg-yellow-300 file:cursor-pointer"
                />
                {previewDesktop && (
                  <img
                    src={previewDesktop}
                    alt="Preview desktop"
                    className="mt-2 rounded-lg border border-gray-200 max-h-24 w-full object-contain"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen Mobile
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  1000×250 px · 1500×375 px retina (ratio 4:1)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e, setImagenMobile, setPreviewMobile)
                  }
                  className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amarillo file:text-black hover:file:bg-yellow-300 file:cursor-pointer"
                />
                {previewMobile && (
                  <img
                    src={previewMobile}
                    alt="Preview mobile"
                    className="mt-2 rounded-lg border border-gray-200 max-h-24 w-full object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* Editor path */}
          {editorMode === "editor" && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-amarillo bg-amarillo/10 hover:bg-amarillo/20 text-gray-800 font-medium text-sm transition-colors cursor-pointer"
              >
                {imagenDesktop ? "Editar diseño" : "Diseñar con editor"}
              </button>
              {previewDesktop && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Desktop preview</p>
                    <img
                      src={previewDesktop}
                      alt="Preview desktop"
                      className="rounded-lg border border-gray-200 max-h-24 w-full object-contain"
                    />
                  </div>
                  {previewMobile && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Mobile preview</p>
                      <img
                        src={previewMobile}
                        alt="Preview mobile"
                        className="rounded-lg border border-gray-200 max-h-24 w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
              {!imagenDesktop && (
                <p className="text-xs text-gray-400 mt-2">
                  Abre el editor para diseñar tu banner. El diseño se guardará automáticamente al confirmar.
                </p>
              )}
            </div>
          )}

          {/* Price summary */}
          <PriceSummary
            label={
              selectedPaquete
                ? `${selectedPaquete.nombre} - ${DURACION_LABELS[duracion]}`
                : selectedSeccion
                  ? `${selectedSeccion.nombre} - ${DURACION_LABELS[duracion]}`
                  : `${selectedSlot?.nombre || "Posicion"} - ${DURACION_LABELS[duracion]}`
            }
            subtotal={subtotal}
            iva={iva}
            total={total}
            ivaRate={config.iva_porcentaje}
            modoCobro={config.modo_cobro}
            duracion={duracion}
            compact
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1);
                setError("");
              }}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
            >
              Atras
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-amarillo hover:bg-yellow-300 disabled:opacity-50 text-black font-bold py-3 px-6 rounded-lg text-lg transition-colors cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                  Procesando...
                </span>
              ) : (
                `Pagar $${total.toLocaleString("es-MX")} MXN`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Editor modal — lazy-loaded; konva not in main bundle */}
      <Suspense fallback={null}>
        <BannerEditorModal
          isOpen={isEditorOpen}
          initialSceneJson={initialSceneJson}
          onSave={handleEditorSave}
          onClose={() => setIsEditorOpen(false)}
        />
      </Suspense>
    </div>
  );
};

// === Sub-components ===

const StepBadge = ({ n, label, active, onClick }) => (
  <div
    className={`flex items-center gap-2 ${onClick ? "cursor-pointer" : ""} ${active ? "text-black font-bold" : "text-gray-400"}`}
    onClick={onClick}
  >
    <span
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? "bg-amarillo text-black" : "bg-gray-200 text-gray-500"}`}
    >
      {n}
    </span>
    <span>{label}</span>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
      active
        ? "border-amarillo text-black"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    {label}
  </button>
);

const SeccionSelector = ({
  catalogo,
  duracion,
  selectedSeccion,
  expandedSeccion,
  onExpand,
  onSelect,
}) => {
  const precio = catalogo.precios[duracion];

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-500 mb-3 px-1">
        Precio por seccion:{" "}
        <strong className="text-black">
          ${precio.toLocaleString("es-MX")} MXN
        </strong>{" "}
        / {DURACION_LABELS[duracion].toLowerCase()}
      </div>
      {catalogo.secciones.map((sec) => {
        const isExpanded = expandedSeccion === sec.slug;
        return (
          <div
            key={sec.slug}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => onExpand(isExpanded ? null : sec.slug)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="font-medium text-sm">{sec.nombre}</span>
              <span className="text-xs text-gray-400">
                {sec.categorias.length} categorias
                <span
                  className={`inline-block ml-2 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </span>
            </button>
            {isExpanded && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-gray-50 border-t border-gray-100">
                {sec.categorias.map((cat) => {
                  const isSelected =
                    selectedSeccion?.slug_seccion === cat.slug_seccion &&
                    selectedSeccion?.slug_categoria === cat.slug_categoria;
                  return (
                    <button
                      key={`${cat.slug_seccion}-${cat.slug_categoria}`}
                      disabled={cat.ocupado}
                      onClick={() => onSelect(cat)}
                      className={`text-left p-3 rounded-lg border transition-all text-sm ${
                        cat.ocupado
                          ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                          : isSelected
                            ? "border-amarillo bg-amarillo/10 cursor-pointer"
                            : "border-gray-200 hover:border-amarillo bg-white cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">
                          {cat.nombre}
                        </span>
                        {cat.ocupado ? (
                          <span className="text-[10px] bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded-full">
                            Ocupado
                          </span>
                        ) : (
                          <span className="text-[10px] bg-green-100 text-green-600 font-medium px-1.5 py-0.5 rounded-full">
                            Libre
                          </span>
                        )}
                      </div>
                      {!cat.ocupado && (
                        <div className="text-[10px] text-gray-400 truncate">
                          /seccion/{cat.slug_seccion}/categoria/
                          {cat.slug_categoria}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PriceSummary = ({
  label,
  subtotal,
  iva,
  total,
  ivaRate,
  modoCobro,
  duracion,
  compact,
}) => {
  const duracionLabel = DURACION_LABELS[duracion] || duracion;

  return (
    <div
      className={`bg-gray-50 rounded-lg p-4 mb-6 ${compact ? "text-sm" : ""}`}
    >
      <div className="flex justify-between mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">
          ${subtotal.toLocaleString("es-MX")} MXN
        </span>
      </div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-600">IVA ({ivaRate}%)</span>
        <span className="font-medium">${iva.toLocaleString("es-MX")} MXN</span>
      </div>
      <hr className="my-2 border-gray-200" />
      <div
        className={`flex justify-between font-bold ${compact ? "" : "text-lg"}`}
      >
        <span>Total</span>
        <span className="text-black font-black">
          ${total.toLocaleString("es-MX")} MXN
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {modoCobro === "recurrente"
          ? `Cobro ${duracionLabel.toLowerCase()} automatico. Puedes cancelar en cualquier momento.`
          : `Pago unico (${duracionLabel.toLowerCase()}). Al terminar el periodo, el banner se desactiva automaticamente.`}
      </p>
    </div>
  );
};

export default ComprarBanner;
