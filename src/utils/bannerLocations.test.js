import assert from "node:assert/strict";
import test from "node:test";
import { buildBannerLocations, getBannerDateState, withPreviewQuery } from "./bannerLocations.js";

const makeSlot = (slot_key, banner, overrides = {}) => ({
  id: slot_key,
  slot_key,
  activo: true,
  dispositivo: "desktop",
  banner_asignaciones: banner ? [{ banner_id: banner.id, activo: true, orden: 0, Banner: banner }] : [],
  ...overrides,
});

test("expande un slot reutilizado de portada en ubicaciones confirmadas por el renderizador", () => {
  const banner = { id: 4, estatus: "activo" };
  const locations = buildBannerLocations(banner, [makeSlot("trebol_portada", banner)]);
  assert.deepEqual(
    locations.map(({ id }) => id),
    ["home-mundial", "note-mundial-panel", "note-mundial-end", "section-mundial-feed", "magazine-theme"],
  );
  assert.equal(locations[1].path, null);
  assert.equal(locations[1].routeExample, "note");
});

test("agrupa variantes de escritorio y móvil y separa los dos usos de Food & Drink desktop", () => {
  const banner = { id: 8, estatus: "activo" };
  const locations = buildBannerLocations(banner, [
    makeSlot("homepage_fooddrink_desktop", banner),
    makeSlot("homepage_fooddrink_mobile", banner, { dispositivo: "mobile" }),
  ]);
  const logoLocation = locations.find(({ id }) => id === "fooddrink-logo");
  assert.deepEqual(logoLocation.variants.map(({ device }) => device).sort(), ["desktop", "mobile"]);
  assert.equal(locations.filter(({ id }) => id === "fooddrink-after-cards").length, 1);
});

test("no inventa renderizador para slots desconocidos y agrupa notas elegibles", () => {
  const banner = { id: 12, estatus: "activo", mitad_notas: true };
  const locations = buildBannerLocations(banner, [makeSlot("slot_sin_renderizador", banner)], {
    total_asignadas: 0,
    nota_mitad: { id: 99, slug: "nota-elegible", titulo: "Nota real" },
  });
  assert.equal(locations.find(({ unknown }) => unknown).title, "Ubicación no identificada");
  const notes = locations.find(({ id }) => id === "notes-top");
  assert.equal(notes.path, "/notas/nota-elegible");
  assert.match(notes.position, /no a mitad del texto/);
});

test("clasifica ventanas horarias y crea la consulta de vista previa", () => {
  const now = new Date("2026-10-08T18:00:00.000Z");
  assert.equal(getBannerDateState({ estatus: "activo", fecha_inicio: "2026-10-09T00:00:00.000Z" }, now).key, "scheduled");
  assert.equal(getBannerDateState({ estatus: "activo", fecha_fin: "2026-10-08T18:00:00.000Z" }, now).key, "expired");
  assert.equal(getBannerDateState({ estatus: "borrador" }, now).key, "inactive");
  assert.equal(withPreviewQuery("/b2b", "b2b_top_mobile", "mobile"), "/b2b?bannerPreview=1&bannerPreviewSlot=b2b_top_mobile&bannerPreviewOccurrence=1&force=mobile");
});
