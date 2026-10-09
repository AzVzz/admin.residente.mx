import React, { useEffect, useMemo, useState } from "react";
import { FaDesktop, FaExpand, FaMobileAlt } from "react-icons/fa";
import { urlApi } from "../../../api/url";
import { withPreviewQuery } from "../../../../utils/bannerLocations";

const DEVICE_LABELS = { desktop: "Escritorio", mobile: "Móvil" };
const EXCLUDED_NOTE_TYPES = new Set(["b2b", "acervo", "uanl"]);

const getSiteOrigin = () =>
  import.meta.env.VITE_BANNER_PREVIEW_SITE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:14321" : "https://residente.mx");

const makeLocation = (id, label, description, previewKey, device, path = "/", occurrence = 1, note = null) => ({
  id,
  label,
  description,
  previewKey,
  device,
  path,
  occurrence,
  note,
});

function getSelectedProductPreview(selection, noteExample) {
  if (selection.type === "slot") {
    const configuredSlotKey = selection.value?.slot_key;
    const pendingBannerInteriorPreview = ["homepage_fooddrink_desktop", "homepage_fooddrink_mobile"].includes(configuredSlotKey);
    const localPendingHomepagePreview =
      import.meta.env.DEV && configuredSlotKey === "homepage_top_desktop";
    const previewSlotKey = pendingBannerInteriorPreview
      ? "nota_inline"
      : localPendingHomepagePreview
        ? "homepage_main_desktop"
        : configuredSlotKey;

    switch (previewSlotKey) {
      case "homepage_main_desktop":
        return {
          locations: [
            makeLocation("home-main", "Página principal", "En la página principal, justo arriba de Los mejores", "homepage_main_desktop", "desktop", "/"),
            makeLocation("home-main", "Página principal", "En la página principal, justo arriba de Los mejores", "homepage_main_desktop", "mobile", "/", 1, "En móvil se usa este mismo espacio después del mosaico principal; Los mejores aparece más adelante en la página."),
          ],
          note: localPendingHomepagePreview
            ? "Vista previa de la nueva ubicación; configuración de compra pendiente"
            : null,
        };
      case "nota_inline": {
        const noteSlug = noteExample?.slug || noteExample?.id;
        if (!noteSlug) {
          return { locations: [], message: "No encontramos una nota publicada para mostrar este espacio." };
        }
        const notePath = `/notas/${encodeURIComponent(noteSlug)}`;
        return {
          locations: [
            makeLocation("note-half", "Interior de una nota", "Dentro de una nota, debajo de la cuadrícula de categorías y antes del contenido.", "note-half", "desktop", notePath, 1, "Los anuncios se alternan en este espacio; el mismo anuncio no aparece en todas las visitas."),
            makeLocation("note-half", "Interior de una nota", "Debajo de las categorías y antes del contenido de la nota.", "note-half", "mobile", notePath, 1, "Los anuncios se alternan en este espacio; el mismo anuncio no aparece en todas las visitas."),
          ],
          note: pendingBannerInteriorPreview
            ? "Vista previa de la nueva ubicación; configuración de compra pendiente."
            : null,
        };
      }
      case "homepage_antojos_desktop":
      case "homepage_antojos_mobile":
      case "homepage_revista_digital":
        {
          const pendingBannerRevistaDigitalPreview = ["homepage_antojos_desktop", "homepage_antojos_mobile"].includes(configuredSlotKey);
          const description = "Dentro del módulo de Revista Digital, en la parte inferior, debajo de los restaurantes destacados.";
        return {
          locations: [
            makeLocation("magazine-bottom", "Revista Digital", description, "revista-digital-bottom", "desktop", "/"),
            makeLocation("magazine-bottom", "Revista Digital", description, "revista-digital-bottom", "mobile", "/"),
          ],
          note: pendingBannerRevistaDigitalPreview
            ? "Vista previa de la nueva ubicación; configuración de compra pendiente."
            : null,
        };
        }
      case "homepage_popup":
        return {
          locations: [],
          message: "No hay una presentación de este anuncio en las páginas actuales del sitio, así que no podemos mostrar una vista real todavía.",
        };
      default:
        return {
          locations: [],
          message: "No encontramos una ubicación confirmada para esta opción.",
        };
    }
  }

  if (selection.type === "section") {
    const section = selection.value;
    if (!section?.slug_seccion || !section?.slug_categoria) {
      return { locations: [], message: "No encontramos una página de sección para esta opción." };
    }
    const categorySlug = String(section.slug_categoria).toLowerCase();
    const isEditorialPage =
      ["nivel-gastro", "nivel-de-gasto"].includes(String(section.slug_seccion).toLowerCase()) &&
      ["top", "premium", "fine-dining", "unicos", "cadenas"].includes(categorySlug);
    if (isEditorialPage) {
      return {
        locations: [],
        message: "Esta página tiene una presentación especial y no muestra el espacio de anuncios de las demás secciones.",
      };
    }
    const sectionPath = `/seccion/${encodeURIComponent(section.slug_seccion)}/categoria/${encodeURIComponent(section.slug_categoria)}`;
    return {
      locations: [
        makeLocation(
          "section-header",
          "Parte superior de la sección",
          "En móvil, antes de los filtros y del contenido de esta sección.",
          "section-purchase",
          "mobile",
          sectionPath,
        ),
      ],
      note: "La página corresponde a la sección que elegiste.",
    };
  }

  if (selection.type === "notes") {
    if (!noteExample?.slug && !noteExample?.id) {
      return { locations: [], message: "No encontramos una nota publicada que cumpla las reglas de este plan." };
    }
    const noteSlug = noteExample.slug || noteExample.id;
    return {
      locations: [
        makeLocation(
          "note-top",
          "Inicio de una nota",
          "Antes del título y de la imagen principal de una nota incluida en el plan.",
          "note-top",
          "desktop",
          `/notas/${encodeURIComponent(noteSlug)}`,
        ),
        makeLocation(
          "note-top",
          "Inicio de una nota",
          "Antes del título y de la imagen principal de una nota incluida en el plan.",
          "note-top",
          "mobile",
          `/notas/${encodeURIComponent(noteSlug)}`,
        ),
      ],
      note: "Usamos una nota publicada que cumple las reglas del plan. La vista es un ejemplo, no confirma una contratación.",
    };
  }

  return { locations: [], message: "No encontramos una ubicación confirmada para esta opción." };
}

const makePreviewUrl = (location) => {
  const previewPath = withPreviewQuery(location.path, location.previewKey, location.device, location.occurrence);
  const url = new URL(previewPath, getSiteOrigin());
  url.searchParams.set("bannerPreviewPlaceholder", "1");
  return url.toString();
};

const PreviewFrame = ({ location, onExpand }) => {
  const src = makePreviewUrl(location);
  const isMobile = location.device === "mobile";
  return (
    <div className={`relative mx-auto overflow-hidden rounded-lg border border-gray-300 bg-white ${isMobile ? "aspect-[9/16] max-h-[500px] max-w-[280px]" : "aspect-video w-full"}`}>
      <iframe
        title={`Vista previa ${DEVICE_LABELS[location.device]}: ${location.label}`}
        src={src}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        className="absolute left-1/2 top-0 origin-top pointer-events-none border-0"
        style={isMobile
          ? { width: 390, height: 844, transform: "translateX(-50%) scale(0.58)", transformOrigin: "top center" }
          : { width: 1400, height: 788, transform: "translateX(-50%) scale(0.5)", transformOrigin: "top center" }}
      />
      <button
        type="button"
        onClick={() => onExpand(src, location.label, location.device)}
        className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-md bg-black/75 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-black"
      >
        <FaExpand /> Ampliar
      </button>
    </div>
  );
};

export default function BannerPurchasePreview({ selection }) {
  const [noteExample, setNoteExample] = useState(null);
  const [notesState, setNotesState] = useState("idle");
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [expandedPreview, setExpandedPreview] = useState(null);
  const selectedSlotKey = selection.type === "slot" ? selection.value?.slot_key : null;
  const needsNoteExample = selection.type === "notes" ||
    (selection.type === "slot" && ["nota_inline", "homepage_fooddrink_desktop", "homepage_fooddrink_mobile"].includes(selectedSlotKey));

  useEffect(() => {
    if (!needsNoteExample) return undefined;
    let cancelled = false;
    const loadRepresentativeNote = async () => {
      setNotesState("loading");
      setNoteExample(null);
      try {
        const response = await fetch(`${urlApi}api/notas?page=1&limit=100`, { cache: "no-store" });
        if (!response.ok) throw new Error("No se pudieron cargar notas publicadas.");
        const payload = await response.json();
        const notes = Array.isArray(payload) ? payload : payload?.notas;
        const eligible = Array.isArray(notes)
          ? notes.filter((note) => {
              const types = [note?.tipo_nota, note?.tipo_nota2]
                .map((type) => String(type || "").trim().toLowerCase())
                .filter(Boolean);
              return note?.estatus === "publicada" && !types.some((type) => EXCLUDED_NOTE_TYPES.has(type)) && note?.id != null && (note?.slug || note?.id);
          })
          : [];
        if (!eligible.length) throw new Error("No encontramos una nota elegible.");
        if (selection.type === "slot") {
          if (!cancelled) {
            setNoteExample(eligible[0]);
            setNotesState("ready");
          }
          return;
        }
        let representative = null;
        for (let index = 0; index < Math.min(eligible.length, 40) && !representative; index += 8) {
          const batch = eligible.slice(index, index + 8);
          const availability = await Promise.all(batch.map(async (note) => {
            const assignedResponse = await fetch(`${urlApi}api/banners/public/nota/${encodeURIComponent(note.id)}`, { cache: "no-store" });
            if (!assignedResponse.ok) throw new Error("No se pudo comprobar la disponibilidad de una nota.");
            return { note, assignedBanner: await assignedResponse.json() };
          }));
          representative = availability.find(({ assignedBanner }) => !assignedBanner)?.note || null;
        }
        if (!representative) throw new Error("No encontramos una nota disponible para mostrar el ejemplo.");
        if (!cancelled) {
          setNoteExample(representative);
          setNotesState("ready");
        }
      } catch {
        if (!cancelled) setNotesState("error");
      }
    };
    loadRepresentativeNote();
    return () => { cancelled = true; };
  }, [selection.key, selection.type, selectedSlotKey, needsNoteExample]);

  useEffect(() => {
    setSelectedLocationId(null);
    setExpandedPreview(null);
  }, [selection.key]);

  const result = useMemo(
    () => getSelectedProductPreview(selection, noteExample),
    [selection.key, selection.type, selection.value, noteExample],
  );
  const availableDevices = [...new Set(result.locations.map((location) => location.device))];
  const activeDevice = availableDevices.includes(selectedDevice)
    ? selectedDevice
    : availableDevices[0] || "desktop";
  const deviceLocations = result.locations.filter((location) => location.device === activeDevice);
  const activeLocation = deviceLocations.find((location) => location.id === selectedLocationId) || deviceLocations[0];

  const handleDeviceChange = (device) => {
    setSelectedDevice(device);
    setSelectedLocationId(null);
  };

  const handleExpand = (src, title, device) => setExpandedPreview({ src, title, device });
  const notesLoading = needsNoteExample && (notesState === "idle" || notesState === "loading");
  const notesError = needsNoteExample && notesState === "error";

  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5" aria-label="Vista previa del anuncio">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Así se verá tu anuncio</h3>
          <p className="mt-1 text-xs text-gray-600">La página y el espacio se muestran como ejemplo. Tu imagen todavía no forma parte de esta vista.</p>
        </div>
        {availableDevices.length > 1 && (
          <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5" role="group" aria-label="Vista de dispositivo">
            {availableDevices.map((device) => (
              <button
                key={device}
                type="button"
                onClick={() => handleDeviceChange(device)}
                aria-pressed={activeDevice === device}
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs ${activeDevice === device ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {device === "mobile" ? <FaMobileAlt /> : <FaDesktop />}{DEVICE_LABELS[device]}
              </button>
            ))}
          </div>
        )}
      </div>

      {notesLoading ? (
        <p className="rounded-lg border border-gray-200 bg-white px-3 py-4 text-sm text-gray-600">Buscando una nota publicada para el ejemplo…</p>
      ) : notesError ? (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-4 text-sm text-amber-800">No pudimos cargar una nota de ejemplo en este momento.</p>
      ) : result.message ? (
        <p role="status" className="rounded-lg border border-gray-200 bg-white px-3 py-4 text-sm text-gray-700">{result.message}</p>
      ) : activeLocation ? (
        <>
          {deviceLocations.length > 1 && (
            <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Ubicación del anuncio">
              {deviceLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setSelectedLocationId(location.id)}
                  aria-pressed={activeLocation.id === location.id}
                  className={`rounded-full border px-3 py-1.5 text-xs ${activeLocation.id === location.id ? "border-blue-600 bg-blue-50 font-semibold text-blue-800" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}
                >
                  {location.label}
                </button>
              ))}
            </div>
          )}
          <p className="mb-3 text-sm text-gray-700">{activeLocation.description}</p>
          {[result.note, activeLocation.note].filter(Boolean).map((note) => (
            <p key={note} className="mb-3 text-xs text-gray-500">{note}</p>
          ))}
          <PreviewFrame location={activeLocation} onExpand={handleExpand} />
        </>
      ) : (
        <p role="status" className="rounded-lg border border-gray-200 bg-white px-3 py-4 text-sm text-gray-700">
          Esta opción se muestra en la versión {activeDevice === "mobile" ? "móvil" : "de escritorio"} del sitio.
        </p>
      )}

      {expandedPreview && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Vista previa ampliada" onClick={() => setExpandedPreview(null)}>
          <div className={`relative h-[90vh] w-full overflow-hidden rounded-lg bg-white ${expandedPreview.device === "mobile" ? "max-w-[440px]" : "max-w-[1440px]"}`} onClick={(event) => event.stopPropagation()}>
            <div className="flex h-10 items-center justify-between border-b px-3 text-xs font-medium text-gray-700">
              <span>{expandedPreview.title} · {DEVICE_LABELS[expandedPreview.device]}</span>
              <button type="button" onClick={() => setExpandedPreview(null)} className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100">Cerrar</button>
            </div>
            <iframe title={`Vista ampliada ${DEVICE_LABELS[expandedPreview.device]}`} src={expandedPreview.src} sandbox="allow-scripts allow-same-origin" className="pointer-events-none h-[calc(90vh-40px)] w-full border-0" />
          </div>
        </div>
      )}
    </section>
  );
}
