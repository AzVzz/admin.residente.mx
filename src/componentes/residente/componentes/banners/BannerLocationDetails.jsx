import React, { useEffect, useMemo, useState } from "react";
import { FaDesktop, FaExternalLinkAlt, FaExpand, FaMobileAlt } from "react-icons/fa";
import {
  bannerGetLocationContext,
  bannerGetPublicMidNoteList,
  bannerGetPublicNote,
  getBannerBySlotPublic,
  slotsGet,
} from "../../../api/bannersApi";
import { buildBannerLocations, getBannerDateState, withPreviewQuery } from "../../../../utils/bannerLocations";

const DEVICE_LABELS = { desktop: "Escritorio", mobile: "Móvil" };

const getSiteOrigin = () =>
  import.meta.env.VITE_BANNER_PREVIEW_SITE_URL ||
  (import.meta.env.DEV ? "http://localhost:4321" : "https://residente.mx");

const variantVisibility = (variant, banner, publicResults) => {
  if (!variant.assigned) return { label: "No asignado", visible: false };
  if (!variant.slotKey) {
    const noteId = variant.representative?.id;
    if (!noteId) return { label: "Asignado; falta una nota representativa pública.", visible: false };
    if (variant.previewKey === "note-half") {
      if (publicResults.midNotes === undefined) return { label: "No se pudo verificar la respuesta pública de rotación.", visible: false, unverified: true };
      const found = publicResults.midNotes?.some((item) => Number(item.id) === Number(banner.id));
      return found
        ? { label: "Elegible ahora para la rotación; puede no salir en cada carga.", visible: true }
        : { label: "No aparece en la respuesta pública actual.", visible: false };
    }
    const noteBanner = publicResults.notes?.[noteId];
    if (noteBanner === undefined) return { label: "No se pudo verificar la respuesta pública de esta nota.", visible: false, unverified: true };
    return Number(noteBanner?.id) === Number(banner.id)
      ? { label: "Visible ahora en la consulta pública de esta nota.", visible: true }
      : { label: "Asignado, pero no aparece en la consulta pública actual de esta nota.", visible: false };
  }

  const current = publicResults.slots?.[variant.slotKey];
  if (current === undefined) return { label: "No se pudo verificar la respuesta pública del slot.", visible: false, unverified: true };
  if (Number(current?.id) === Number(banner.id)) {
    return { label: "Visible ahora según la consulta pública del slot.", visible: true };
  }
  return current
    ? { label: `El slot muestra primero “${current.nombre || "otro banner"}”.`, visible: false }
    : { label: "Asignado, pero no aparece en la consulta pública actual del slot.", visible: false };
};

const BannerPagePreview = ({ location, variant, device, onExpand }) => {
  const path = location.path || variant.path;
  const previewPath = path && variant.previewKey
    ? withPreviewQuery(path, variant.previewKey, device, variant.previewOccurrence, variant.bannerId)
    : null;
  const origin = variant.previewOrigin === "dashboard" ? window.location.origin : getSiteOrigin();
  const src = previewPath ? `${origin}${previewPath}` : null;

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-5 text-center text-xs text-gray-500">
        No hay una página pública representativa disponible para esta ubicación.
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border border-gray-300 bg-white ${device === "mobile" ? "aspect-[9/16] max-h-[340px]" : "aspect-video"}`}>
      <iframe
        title={`Vista previa: ${location.title}`}
        src={src}
        loading="lazy"
        className={`absolute left-0 top-0 origin-top-left border-0 ${device === "mobile" ? "h-[844px] w-[390px] scale-[0.75]" : "h-[720px] w-[1280px] scale-[0.25]"}`}
      />
      <button
        type="button"
        onClick={() => onExpand(src, location.title, device)}
        className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md bg-black/75 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-black"
      >
        <FaExpand /> Ampliar
      </button>
    </div>
  );
};

const BannerLocationDetails = ({ banner, token }) => {
  const [locations, setLocations] = useState([]);
  const [publicResults, setPublicResults] = useState({ slots: {}, notes: {}, midNotes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDevices, setSelectedDevices] = useState({});
  const [expandedPreview, setExpandedPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const [rawSlots, examples] = await Promise.all([
          slotsGet(token),
          bannerGetLocationContext(token, banner.id),
        ]);
        const slots = Array.isArray(rawSlots) ? rawSlots : rawSlots?.data || [];
        const mappedLocations = buildBannerLocations(banner, slots, examples);
        const assignedSlots = [...new Set(mappedLocations.flatMap((location) =>
          location.variants.filter((variant) => variant.assigned && variant.slotKey).map((variant) => variant.slotKey),
        ))];
        const noteIds = [...new Set(mappedLocations.flatMap((location) =>
          location.variants.filter((variant) => variant.assigned && variant.previewKey !== "note-half" && !variant.slotKey && location.representative?.id).map(() => location.representative.id),
        ))];
        const needsMidNotes = mappedLocations.some((location) =>
          location.variants.some((variant) => variant.assigned && variant.previewKey === "note-half"),
        );
        const [slotEntries, noteEntries, midNotes] = await Promise.all([
          Promise.all(assignedSlots.map(async (key) => [key, await getBannerBySlotPublic(key).catch(() => undefined)])),
          Promise.all(noteIds.map(async (id) => [id, await bannerGetPublicNote(id).catch(() => undefined)])),
          needsMidNotes ? bannerGetPublicMidNoteList().catch(() => undefined) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setLocations(mappedLocations);
        setPublicResults({
          slots: Object.fromEntries(slotEntries),
          notes: Object.fromEntries(noteEntries),
          midNotes,
        });
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "No se pudo cargar el detalle de ubicaciones.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDetails();
    return () => { cancelled = true; };
  }, [banner, token]);

  const bannerState = useMemo(() => getBannerDateState(banner), [banner]);
  const locationList = locations.length ? locations : [];
  const openPage = (location, variant, device) => {
    const path = location.path || variant.path;
    if (!path) return null;
    const pageUrl = new URL(path, variant.previewOrigin === "dashboard" ? window.location.origin : getSiteOrigin());
    pageUrl.searchParams.set("force", device);
    return pageUrl.toString();
  };

  if (loading) return <p className="text-xs text-gray-500">Cargando ubicaciones y páginas de referencia…</p>;
  if (error) return <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>;

  return (
    <section className="space-y-3" aria-label="Ubicaciones del banner">
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
        <span className="font-semibold">Estado del banner:</span> {bannerState.label}
        <span className="ml-2 text-gray-500">La asignación y la visibilidad pública se muestran por separado.</span>
      </div>

      {locationList.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
          <strong>Ubicación no identificada.</strong> El banner no tiene una asignación de slot o notas que permita confirmar una página.
        </div>
      ) : locationList.map((location) => {
        const unknown = location.unknown;
        const variants = location.variants;
        const deviceOptions = [...new Set(variants.map((variant) => variant.device).filter((device) => device === "desktop" || device === "mobile"))];
        const selectedDevice = selectedDevices[location.id] || deviceOptions[0] || "desktop";
        const variant = variants.find((candidate) => candidate.device === selectedDevice) || variants[0];
        const visibility = variantVisibility({ ...variant, representative: location.representative }, banner, publicResults);
        const openUrl = openPage(location, variant, selectedDevice);
        return (
          <article key={location.id} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{unknown ? "Ubicación no identificada" : location.title}</h4>
                <p className="mt-0.5 text-xs text-gray-600">{unknown ? "No se encontró un renderizador asociado a este slot." : location.position}</p>
                {location.page && <p className="mt-1 text-[11px] text-gray-500">Página: {location.page}</p>}
              </div>
              <div className="flex items-center gap-2">
                {deviceOptions.length > 1 && (
                  <div className="inline-flex rounded-md border border-gray-200 p-0.5" role="group" aria-label="Dispositivo de vista previa">
                    {deviceOptions.map((device) => (
                      <button
                        key={device}
                        type="button"
                        onClick={() => setSelectedDevices((current) => ({ ...current, [location.id]: device }))}
                        aria-pressed={selectedDevice === device}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] ${selectedDevice === device ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        {device === "mobile" ? <FaMobileAlt /> : <FaDesktop />}{DEVICE_LABELS[device]}
                      </button>
                    ))}
                  </div>
                )}
                {openUrl && <a href={openUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">Abrir página <FaExternalLinkAlt className="text-[9px]" /></a>}
              </div>
            </div>

            <p className={`mt-2 text-xs ${visibility.visible ? "text-green-700" : "text-amber-700"}`}>
              <span className="font-semibold">{variant.assigned ? "Asignado" : "No asignado"} · </span>{visibility.label}
              {variant.status && variant.status !== "Asignado; consultando la respuesta pública actual." && <span> · {variant.status}</span>}
            </p>
            {location.assignmentSummary && <p className="mt-1 text-[11px] text-gray-500">{location.assignmentSummary}</p>}

            {!unknown && <div className="mt-3"><BannerPagePreview location={location} variant={{ ...variant, bannerId: banner.id }} device={selectedDevice} onExpand={(src, title, device) => setExpandedPreview({ src, title, device })} /></div>}
          </article>
        );
      })}

      {expandedPreview && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Página de referencia ampliada" onClick={() => setExpandedPreview(null)}>
          <div className={`relative h-[90vh] w-full overflow-hidden rounded-lg bg-white ${expandedPreview.device === "mobile" ? "max-w-[440px]" : "max-w-[1440px]"}`} onClick={(event) => event.stopPropagation()}>
            <div className="flex h-10 items-center justify-between border-b px-3 text-xs font-medium text-gray-700">
              <span>{expandedPreview.title} · {DEVICE_LABELS[expandedPreview.device]}</span>
              <button type="button" onClick={() => setExpandedPreview(null)} className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100">Cerrar</button>
            </div>
            <iframe title={`Página ampliada: ${expandedPreview.title}`} src={expandedPreview.src} className="h-[calc(90vh-40px)] w-full border-0" />
          </div>
        </div>
      )}
    </section>
  );
};

export default BannerLocationDetails;
