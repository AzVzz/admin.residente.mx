import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../../Context";
import { urlApi } from "../../../api/url";
import { subidorUpload, subidorList, subidorDelete } from "../../../api/subidorApi";
import { FaUpload, FaTimes, FaCopy, FaCheck, FaTrash } from "react-icons/fa";

// URL de produccion para hardcodear en el codigo (la liga final que se copia).
const PROD_BASE = "https://residente.mx";
// Base del gateway/servidor para que las imagenes se vean en este dashboard.
const SRV_BASE = urlApi.replace(/\/$/, "");

// path relativo ("/fotos/...") -> URL absoluta segun base.
const abs = (base, p) => (p ? `${base}${p}` : "");

// bytes -> "KB" / "MB" legible.
const fmtPeso = (b) => {
  if (b == null) return "…";
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

// Recomendacion de resolucion al subir.
// OJO: estas fotos viven en /fotos-estaticas/ y se sirven CRUDAS (nginx), NO
// pasan por /api/img. Lo que se sube es EXACTO lo que pesa en produccion, asi
// que la recomendacion debe dejar la foto ya lista para web.
const MIN_DIM = 600; // por debajo de esto no encogemos (quedaria muy chica)
const MAX_LONG = 1500; // tope del lado largo (colchon retina sobre el ancho util de 1080px)

// - Foto chica (lado largo <= MIN_DIM): solo cambio de formato (misma resolucion).
// - Foto grande: capamos el lado largo a MAX_LONG manteniendo proporcion
//   (nunca agrandamos).
const recommend = (ow, oh) => {
  const long = Math.max(ow, oh);
  if (long <= MIN_DIM) return { w: ow, h: oh };
  const scale = Math.min(MAX_LONG, long) / long;
  return { w: Math.round(ow * scale), h: Math.round(oh * scale) };
};

const clampInt = (val, min, max) => {
  const n = parseInt(val, 10) || 0;
  return Math.max(min, Math.min(max, n));
};

const SubidorGeneral = () => {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [dims, setDims] = useState(null);
  const [copied, setCopied] = useState("");

  // Foto seleccionada en espera de confirmar (con su info y resolucion destino).
  const [pending, setPending] = useState(null); // { file, url, ow, oh, osize }
  const [tw, setTw] = useState(0); // ancho destino
  const [th, setTh] = useState(0); // alto destino
  const [estSize, setEstSize] = useState(null); // peso estimado (bytes)
  const [estimating, setEstimating] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await subidorList(token);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Bloquear el scroll del body mientras el modal esta abierto.
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  // Paso 1: elegir archivo -> leer resolucion/peso y proponer destino.
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-elegir el mismo archivo
    if (!file) return;
    setError("");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ow = img.naturalWidth;
      const oh = img.naturalHeight;
      const rec = recommend(ow, oh);
      setPending({ file, url, ow, oh, osize: file.size });
      setTw(rec.w);
      setTh(rec.h);
      setEstSize(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("No se pudo leer la imagen");
    };
    img.src = url;
  };

  const cancelPending = () => {
    if (pending?.url) URL.revokeObjectURL(pending.url);
    setPending(null);
    setEstSize(null);
  };

  // Inputs ligados por aspect ratio (no se puede agrandar mas que el original).
  const onChangeW = (val) => {
    if (!pending) return;
    const w = clampInt(val, 1, pending.ow);
    setTw(w);
    setTh(Math.max(1, Math.round((w * pending.oh) / pending.ow)));
  };
  const onChangeH = (val) => {
    if (!pending) return;
    const h = clampInt(val, 1, pending.oh);
    setTh(h);
    setTw(Math.max(1, Math.round((h * pending.ow) / pending.oh)));
  };

  // Estima el peso final codificando a WebP en un canvas (debounce 250ms).
  useEffect(() => {
    if (!pending || !tw || !th) return;
    let cancel = false;
    setEstimating(true);
    const id = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, tw, th);
        canvas.toBlob(
          (blob) => {
            if (!cancel) {
              setEstSize(blob ? blob.size : null);
              setEstimating(false);
            }
          },
          "image/webp",
          0.82,
        );
      };
      img.onerror = () => {
        if (!cancel) setEstimating(false);
      };
      img.src = pending.url;
    }, 250);
    return () => {
      cancel = true;
      clearTimeout(id);
    };
  }, [pending, tw, th]);

  // Paso 2: confirmar y subir con la resolucion elegida.
  const handleUpload = async () => {
    if (!pending) return;
    try {
      setError("");
      setUploading(true);
      const nueva = await subidorUpload(token, pending.file, { width: tw, height: th });
      setItems((prev) => [nueva, ...prev]);
      cancelPending();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (base) => {
    if (!window.confirm("¿Borrar esta foto del servidor?")) return;
    try {
      await subidorDelete(token, base);
      setItems((prev) => prev.filter((it) => it.base !== base));
      if (selected?.base === base) setSelected(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const copiar = async (texto, id) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch (_) {
      /* noop */
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-left">
      <h2 className="text-xl font-bold mb-1">Subidor General al servidor</h2>
      <p className="text-sm text-gray-500 mb-6">
        Sube una foto: se guarda el original y se generan versiones optimizadas
        (WebP) sin recortar. La liga final se copia para usarla en el código.
      </p>

      {/* Paso 1: elegir foto (cuando no hay nada pendiente) */}
      {!pending && (
        <div className="mb-6">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white cursor-pointer bg-blue-600 hover:bg-blue-700 transition-colors">
            <FaUpload />
            Seleccionar foto
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Paso 2: confirmar resolucion y ver el ahorro estimado */}
      {pending && (
        <div className="mb-6 border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <img
            src={pending.url}
            alt="preview"
            className="w-40 h-40 object-contain rounded-lg bg-white border border-gray-200 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            {(() => {
              const soloFormato = tw === pending.ow && th === pending.oh;
              const pctPeso =
                estSize != null
                  ? Math.round((1 - estSize / pending.osize) * 100)
                  : null;
              return (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Original:{" "}
                    <span className="font-medium text-gray-800">
                      {pending.ow} × {pending.oh} px · {fmtPeso(pending.osize)}
                    </span>
                    {soloFormato && (
                      <span className="ml-2 text-xs text-amber-600">
                        (foto pequeña: solo cambio de formato)
                      </span>
                    )}
                  </p>

                  <div className="flex items-end gap-3 mb-3">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Ancho (px)</label>
                      <input
                        type="number"
                        min={1}
                        max={pending.ow}
                        value={tw}
                        onChange={(e) => onChangeW(e.target.value)}
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <span className="pb-1.5 text-gray-400">×</span>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">Alto (px)</label>
                      <input
                        type="number"
                        min={1}
                        max={pending.oh}
                        value={th}
                        onChange={(e) => onChangeH(e.target.value)}
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3">
                    Se mantiene la proporción automáticamente. No se puede agrandar
                    más que el original.
                  </p>

                  <div className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Resolución final</span>
                      <span className="font-medium text-gray-800">
                        {tw} × {th} px
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Peso aprox.</span>
                      <span className="font-medium text-gray-800">
                        {estimating ? "calculando…" : fmtPeso(estSize)}
                        {pctPeso != null && !estimating && (
                          <span
                            className={
                              pctPeso >= 0 ? "text-green-600 ml-1" : "text-red-500 ml-1"
                            }
                          >
                            ({pctPeso >= 0 ? "−" : "+"}
                            {Math.abs(pctPeso)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                        uploading
                          ? "bg-gray-400 cursor-wait"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      <FaUpload />
                      {uploading ? "Subiendo…" : "Subir"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelPending}
                      disabled={uploading}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Galeria estilo iCloud (mas nueva arriba) */}
      {loading ? (
        <p className="text-sm text-gray-400">Cargando fotos…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">Aún no hay fotos. Sube la primera.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((it) => (
            <button
              key={it.base}
              type="button"
              onClick={() => {
                setDims(null);
                setSelected(it);
              }}
              className="group relative aspect-[308/191] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 hover:ring-2 hover:ring-blue-400 transition"
            >
              <img
                src={abs(SRV_BASE, it.thumb)}
                alt={it.base}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal de detalle (portal a <body> para escapar el z-index del header) */}
      {selected &&
        createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 truncate">{selected.base}</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Imagen (70dvh de alto) */}
              <div className="flex-shrink-0 flex items-start justify-center">
                <img
                  src={abs(SRV_BASE, selected.preferred)}
                  alt={selected.base}
                  onLoad={(e) =>
                    setDims({
                      w: e.target.naturalWidth,
                      h: e.target.naturalHeight,
                    })
                  }
                  className="h-[70dvh] w-auto max-w-full rounded-lg bg-gray-100 object-contain"
                />
              </div>

              {/* URLs + tamaño */}
              <div className="flex-1 min-w-0">
                <UrlRow
                  label="Versión preferida (WebP)"
                  url={abs(PROD_BASE, selected.preferred)}
                  copied={copied === "pref"}
                  onCopy={() => copiar(abs(PROD_BASE, selected.preferred), "pref")}
                />
                {selected.original && (
                  <UrlRow
                    label="Original"
                    url={abs(PROD_BASE, selected.original)}
                    copied={copied === "orig"}
                    onCopy={() => copiar(abs(PROD_BASE, selected.original), "orig")}
                  />
                )}

                <p className="text-sm text-gray-600 mt-2">
                  Peso:{" "}
                  <span className="font-medium text-gray-800">
                    {fmtPeso(selected.preferredSize)}
                  </span>
                  <span className="text-gray-400">
                    {" "}
                    · {dims ? `${dims.w} × ${dims.h} px` : "…"}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => handleDelete(selected.base)}
                  className="mt-5 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <FaTrash /> Borrar del servidor
                </button>
              </div>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
};

const UrlRow = ({ label, url, copied, onCopy }) => (
  <div className="mb-3">
    <label className="text-xs text-gray-500">{label}</label>
    <div className="flex items-center gap-2 mt-1">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 bg-gray-50"
      />
      <button
        type="button"
        onClick={onCopy}
        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700"
      >
        {copied ? <FaCheck /> : <FaCopy />}
        {copied ? "Copiada" : "Copiar"}
      </button>
    </div>
  </div>
);

export default SubidorGeneral;
