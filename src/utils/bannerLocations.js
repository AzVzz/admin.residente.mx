const SLOT_LOCATIONS = {
  homepage_top_desktop: [
    {
      id: "site-header-top",
      title: "Encabezado del sitio",
      position: "Franja superior, antes del menú principal.",
      path: "/",
      page: "Portada (encabezado compartido)",
      device: "desktop",
      previewKey: "homepage_top_desktop",
    },
  ],
  homepage_main_desktop: [
    {
      id: "home-main-banner",
      title: "Portada",
      position: "Debajo del mosaico de fotos y antes de la nota principal.",
      path: "/",
      page: "Inicio",
      device: "both",
      previewKey: "homepage_main_desktop",
    },
  ],
  trebol_portada: [
    {
      id: "home-mundial",
      title: "Portada",
      position: "Base del panel desplegable del Mundial.",
      path: "/",
      page: "Inicio",
      device: "both",
      previewKey: "trebol-home",
      previewOccurrence: 1,
    },
    {
      id: "note-mundial-panel",
      title: "Interior de notas",
      position: "Dentro del panel desplegable del Mundial.",
      routeExample: "note",
      page: "Notas publicadas",
      device: "desktop",
      previewKey: "trebol-note-panel",
      previewOccurrence: 1,
    },
    {
      id: "note-mundial-end",
      title: "Interior de notas",
      position: "Al final del contenido de la nota, en el bloque del Mundial.",
      routeExample: "note",
      page: "Notas publicadas",
      device: "desktop",
      previewKey: "trebol-note-end",
      previewOccurrence: 1,
    },
    {
      id: "section-mundial-feed",
      title: "Feed de secciones",
      position: "Después del feed de notas de la sección Sur de Texas.",
      path: "/seccion/sur-de-texas",
      page: "Sección Sur de Texas",
      device: "desktop",
      previewKey: "trebol-section-feed",
      previewOccurrence: 1,
    },
    {
      id: "magazine-theme",
      title: "Revista digital",
      position: "Dentro de la página de una edición temática.",
      routeExample: "magazine",
      page: "Edición de revista digital",
      device: "both",
      previewKey: "trebol-magazine",
      previewOccurrence: 1,
    },
  ],
  homepage_fooddrink_desktop: [
    {
      id: "fooddrink-logo",
      title: "Food & Drink",
      position: "Arriba del logotipo de la sección.",
      path: "/",
      page: "Inicio",
      device: "desktop",
      previewKey: "fooddrink-logo",
      pairedSlotKeys: ["homepage_fooddrink_mobile"],
    },
    {
      id: "fooddrink-after-cards",
      title: "Food & Drink",
      position: "Debajo de la cuadrícula de las primeras notas.",
      path: "/",
      page: "Inicio",
      device: "desktop",
      previewKey: "fooddrink-after-cards",
    },
  ],
  homepage_fooddrink_mobile: [
    {
      id: "fooddrink-logo",
      title: "Food & Drink",
      position: "Antes del título y contenido de la sección.",
      path: "/",
      page: "Inicio",
      device: "mobile",
      previewKey: "homepage_fooddrink_mobile",
      pairedSlotKeys: ["homepage_fooddrink_desktop"],
    },
  ],
  homepage_antojos_mobile: [
    {
      id: "antojos-mobile-top",
      title: "Antojería",
      position: "Antes del título y contenido de la sección.",
      path: "/",
      page: "Inicio",
      device: "mobile",
      previewKey: "homepage_antojos_mobile",
    },
  ],
  homepage_restaurantes_desktop: [
    {
      id: "restaurantes-home-bottom",
      title: "Restaurantes",
      position: "Al terminar el bloque principal de Restaurantes, antes de las secciones siguientes.",
      path: "/",
      page: "Inicio",
      device: "desktop",
      previewKey: "homepage_restaurantes_desktop",
    },
  ],
  b2b_top_desktop: [
    {
      id: "b2b-top",
      title: "B2B",
      position: "Parte superior del contenido, antes de la barra de búsqueda.",
      path: "/b2b",
      page: "B2B",
      device: "desktop",
      previewKey: "b2b_top_desktop",
      pairedSlotKeys: ["b2b_top_mobile"],
    },
  ],
  b2b_top_mobile: [
    {
      id: "b2b-top",
      title: "B2B",
      position: "Parte superior del contenido, antes de la barra de búsqueda.",
      path: "/b2b",
      page: "B2B",
      device: "mobile",
      previewKey: "b2b_top_mobile",
      pairedSlotKeys: ["b2b_top_desktop"],
    },
  ],
  b2b_nota_top: [
    {
      id: "b2b-note-top",
      title: "Notas B2B",
      position: "Antes del título y la imagen principal de una nota B2B.",
      routeExample: "b2b-note",
      page: "Notas B2B publicadas",
      device: "both",
      previewKey: "b2b-note-top",
    },
  ],
  trebol_sidebar_b2b: [
    {
      id: "b2b-public-sidebar-trebol",
      title: "B2B",
      position: "Barra lateral derecha, antes de los accesos a Centro de Noticias y Centro de Entrevistas.",
      path: "/b2b",
      page: "B2B",
      device: "desktop",
      previewKey: "trebol_sidebar_b2b",
    },
  ],
  liype_sidebar_b2b: [
    {
      id: "b2b-public-sidebar-liype",
      title: "B2B",
      position: "Barra lateral derecha, después de los accesos a Centro de Noticias y Centro de Entrevistas.",
      path: "/b2b",
      page: "B2B",
      device: "desktop",
      previewKey: "liype_sidebar_b2b",
    },
  ],
  trebol_admin_b2b: [
    {
      id: "b2b-dashboard-sidebar",
      title: "Dashboard B2B",
      position: "Panel lateral derecho, debajo del botón de pago.",
      path: "/dashboardb2b",
      page: "Dashboard B2B",
      device: "desktop",
      previewKey: "trebol_admin_b2b",
      previewOrigin: "dashboard",
    },
  ],
  sidebar_zona_sanpedro: [
    {
      id: "home-zonal-sidebar-sanpedro",
      title: "Barra lateral de secciones",
      position: "Bloque de banners zonales, ubicación San Pedro.",
      path: "/",
      page: "Inicio",
      device: "desktop",
      previewKey: "sidebar_zona_sanpedro",
    },
  ],
  sidebar_zona_carretera: [
    {
      id: "home-zonal-sidebar-carretera",
      title: "Barra lateral de secciones",
      position: "Bloque de banners zonales, ubicación Carretera.",
      path: "/",
      page: "Inicio",
      device: "desktop",
      previewKey: "sidebar_zona_carretera",
    },
  ],
  sidebar_zona_tec: [
    {
      id: "home-zonal-sidebar-tec",
      title: "Barra lateral de secciones",
      position: "Bloque de banners zonales, ubicación Zona Tec.",
      path: "/",
      page: "Inicio",
      device: "desktop",
      previewKey: "sidebar_zona_tec",
    },
  ],
  sidebar_zona_cumbres: [
    {
      id: "home-zonal-sidebar-cumbres",
      title: "Barra lateral de secciones",
      position: "Bloque de banners zonales, ubicación Cumbres.",
      path: "/",
      page: "Inicio",
      device: "desktop",
      previewKey: "sidebar_zona_cumbres",
    },
  ],
};

export function getBannerDateState(banner, now = new Date()) {
  const timestamp = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const start = banner?.fecha_inicio ? new Date(banner.fecha_inicio).getTime() : null;
  const end = banner?.fecha_fin ? new Date(banner.fecha_fin).getTime() : null;

  if (start !== null && Number.isFinite(start) && timestamp < start) {
    return { key: "scheduled", label: "Programado: todavía no inicia" };
  }
  if (end !== null && Number.isFinite(end) && timestamp >= end) {
    return { key: "expired", label: "Vencido: ya pasó la fecha final" };
  }
  if (banner?.estatus !== "activo") {
    const labels = {
      programado: "Programado",
      expirado: "Vencido",
      borrador: "Desactivado o en borrador",
    };
    return { key: "inactive", label: labels[banner?.estatus] || "Desactivado" };
  }
  return { key: "active", label: "Activo por estado y fechas" };
}

const isEnabled = (value) => value === true || value === 1 || value === "1";
const asArray = (value) => (Array.isArray(value) ? value : []);
const bannerIdOf = (value) => Number(value?.banner_id ?? value?.Banner?.id ?? value?.banner?.id);

function resolveRoute(definition, examples) {
  if (definition.path) return definition.path;
  if (definition.routeExample === "b2b-note") {
    const note = examples?.nota_b2b;
    return note?.slug || note?.id ? `/notas/${encodeURIComponent(note.slug || note.id)}` : null;
  }
  if (definition.routeExample === "note") {
    const note = examples?.nota_publicada;
    return note?.slug || note?.id ? `/notas/${encodeURIComponent(note.slug || note.id)}` : null;
  }
  if (definition.routeExample === "magazine") {
    return examples?.tematica_slug ? `/revista-digital/${encodeURIComponent(examples.tematica_slug)}` : null;
  }
  return null;
}

function slotAssignment(slot, bannerId) {
  return asArray(slot?.banner_asignaciones).find((assignment) => bannerIdOf(assignment) === Number(bannerId)) || null;
}

function assignmentDetail(slot, banner, allSlots) {
  const assignment = slotAssignment(slot, banner.id);
  if (!assignment) {
    const otherAssignment = asArray(slot?.banner_asignaciones)
      .filter((candidate) => isEnabled(candidate.activo))
      .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))[0];
    return {
      assigned: false,
      occupiedBy: otherAssignment?.Banner?.nombre || null,
      slotActive: isEnabled(slot?.activo),
      assignmentActive: false,
      visibleNow: false,
      status: otherAssignment?.Banner?.nombre
        ? `Esta variante está asignada a ${otherAssignment.Banner.nombre}.`
        : "El banner no está asignado a esta variante.",
    };
  }

  const slotActive = isEnabled(slot.activo);
  const assignmentActive = isEnabled(assignment.activo);
  const dateState = getBannerDateState(banner);
  let status = dateState.label;
  if (!slotActive) status = "Asignado, pero el slot está desactivado.";
  else if (!assignmentActive) status = "Asignado, pero la asignación del slot está desactivada.";
  else if (dateState.key === "active") status = "Asignado; consultando la respuesta pública actual.";

  return {
    assigned: true,
    slotActive,
    assignmentActive,
    visibleNow: false,
    status,
    assignment,
    slot,
    dateState,
  };
}

function makeVariant(definition, selectedSlot, banner, allSlots) {
  const slot = selectedSlot || allSlots.find((item) => item.slot_key === definition.slotKey) || null;
  return {
    device: definition.device,
    slotKey: definition.slotKey,
    previewKey: definition.previewKey,
    path: definition.resolvedPath || null,
    routeExample: definition.routeExample || null,
    previewOrigin: definition.previewOrigin || "site",
    previewOccurrence: definition.previewOccurrence || 1,
    ...assignmentDetail(slot, banner, allSlots),
  };
}

export function buildBannerLocations(banner, slots = [], examples = null) {
  const allSlots = asArray(slots);
  const groups = new Map();
  const assignedSlotKeys = new Set();

  for (const slot of allSlots) {
    const assigned = slotAssignment(slot, banner.id);
    if (!assigned) continue;
    assignedSlotKeys.add(slot.slot_key);
    const definitions = SLOT_LOCATIONS[slot.slot_key];

    if (!definitions?.length) {
      const id = `unknown-${slot.id || slot.slot_key}`;
      groups.set(id, {
        id,
        title: "Ubicación no identificada",
        position: "El banner está asignado a un slot sin renderizador identificado en Astro o en el dashboard B2B.",
        page: slot.nombre || slot.pagina || "Ubicación no identificada",
        unknown: true,
        variants: [makeVariant({ slotKey: slot.slot_key, device: slot.dispositivo || "both", previewKey: slot.slot_key }, slot, banner, allSlots)],
      });
      continue;
    }

    for (const definition of definitions) {
      const pairedKeys = definition.pairedSlotKeys || [];
      const counterpartDefinitions = pairedKeys.flatMap((key) =>
        (SLOT_LOCATIONS[key] || []).filter((candidate) => candidate.id === definition.id)
          .map((candidate) => ({ ...candidate, slotKey: key })),
      );
      const groupDefinitions = [
        { ...definition, slotKey: slot.slot_key },
        ...counterpartDefinitions,
      ];
      const existing = groups.get(definition.id) || {
        id: definition.id,
        title: definition.title,
        position: definition.position,
        page: definition.page,
        path: resolveRoute(definition, examples),
        routeExample: definition.routeExample || null,
        previewOrigin: definition.previewOrigin || "site",
        variants: [],
      };

      for (const groupDefinition of groupDefinitions) {
        const devices = groupDefinition.device === "both" ? ["desktop", "mobile"] : [groupDefinition.device];
        for (const device of devices) {
          const resolvedPath = resolveRoute(groupDefinition, examples);
          const variant = makeVariant(
            { ...groupDefinition, device, resolvedPath },
            allSlots.find((item) => item.slot_key === groupDefinition.slotKey),
            banner,
            allSlots,
          );
          if (!existing.variants.some((item) => item.device === device && item.slotKey === variant.slotKey)) {
            existing.variants.push(variant);
          }
        }
      }
      groups.set(definition.id, existing);
    }
  }

  const hasNoteLocation =
    Number(examples?.total_asignadas || 0) > 0 ||
    isEnabled(banner.auto_asignar_notas) ||
    isEnabled(banner.mitad_notas);

  if (hasNoteLocation) {
    const representative = isEnabled(banner.mitad_notas)
      ? examples?.nota_mitad
      : isEnabled(banner.auto_asignar_notas)
        ? examples?.nota_auto_asignada || examples?.nota_asignada
        : examples?.nota_asignada;
    const noteRoute = representative?.slug || representative?.id
      ? `/notas/${encodeURIComponent(representative.slug || representative.id)}`
      : null;
    const representativeIsB2B = [representative?.tipo_nota, representative?.tipo_nota2]
      .some((type) => String(type || "").trim().toLowerCase() === "b2b");
    const labels = [];
    if (Number(examples?.total_asignadas || 0) > 0) labels.push(`${examples.total_asignadas} asignaciones directas o de compra`);
    if (isEnabled(banner.auto_asignar_notas)) labels.push("autoasignación a notas publicadas elegibles (no B2B, Acervo o UANL)");
    if (isEnabled(banner.mitad_notas)) labels.push("rotación en notas no B2B");

    groups.set("notes-top", {
      id: "notes-top",
      title: "Interior de notas",
      position: "Antes del título y de la imagen principal; la rotación llamada “mitad de notas” también se renderiza aquí, no a mitad del texto.",
      page: representative?.titulo || (representativeIsB2B ? "Notas B2B publicadas" : "Notas publicadas"),
      path: noteRoute,
      routeExample: representative ? null : "note",
      previewOrigin: "site",
      assignmentSummary: labels.join(" · "),
      representative,
      variants: [
        makeVariant(
          {
            slotKey: null,
            device: "both",
            previewKey: isEnabled(banner.mitad_notas) ? "note-half" : representativeIsB2B ? "b2b-note-top" : "note-top",
            resolvedPath: noteRoute,
            routeExample: representative ? null : "note",
            previewOrigin: "site",
          },
          null,
          banner,
          allSlots,
        ),
      ],
    });
  }

  return [...groups.values()].map((location) => ({
    ...location,
    variants: location.variants.map((variant) => {
      if (!variant.slotKey) {
        return {
          ...variant,
          assigned: hasNoteLocation,
          visibleNow: false,
          status: getBannerDateState(banner).label,
        };
      }
      const isRelevantAssignment = assignedSlotKeys.has(variant.slotKey) && variant.assigned;
      return { ...variant, assigned: isRelevantAssignment };
    }),
  }));
}

export function withPreviewQuery(path, previewKey, device = "desktop", occurrence = 1, bannerId = null) {
  const url = new URL(path, "https://residente.mx");
  url.searchParams.set("bannerPreview", "1");
  url.searchParams.set("bannerPreviewSlot", previewKey);
  url.searchParams.set("bannerPreviewOccurrence", String(occurrence));
  url.searchParams.set("force", device);
  if (bannerId != null) url.searchParams.set("bannerPreviewId", String(bannerId));
  return `${url.pathname}${url.search}`;
}

export { SLOT_LOCATIONS };
