import assert from "node:assert/strict";
import test from "node:test";
import { fechaTematicaParaInput, formatoFechaTematica, estadoTematica } from "./tematicasFechas.js";

for (const fecha of ["2026-10-01", "2026-10-03"]) {
  test(`reabrir ${fecha} a las 05:59 conserva la fecha local`, () => {
    const respuestaApi = `${fecha}T11:59:00.000Z`;
    assert.equal(fechaTematicaParaInput(respuestaApi), `${fecha}T05:59`);
  });
}

test("la tabla formatea la fecha en Monterrey, no en la zona del navegador", () => {
  assert.match(formatoFechaTematica("2026-10-03T11:59:00.000Z"), /03 oct 2026/i);
});

test("6 AM y 6 PM se conservan después de editar repetidamente", () => {
  for (const hora of ["06:00", "18:00"]) {
    let local = `2026-10-22T${hora}`;
    for (let i = 0; i < 5; i++) {
      local = fechaTematicaParaInput(new Date(`${local}:00-06:00`).toISOString());
      assert.equal(local, `2026-10-22T${hora}`);
    }
  }
});

test("distingue programación, vigencia, finalización y borrador", () => {
  const t = { estatus: "publicada", fecha_inicio: "2026-10-22T12:00:00Z", fecha_fin: "2026-10-23T12:00:00Z" };
  assert.equal(estadoTematica(t, Date.parse("2026-10-22T11:59:00Z")), "Programada");
  assert.equal(estadoTematica(t, Date.parse(t.fecha_inicio)), "Vigente");
  assert.equal(estadoTematica(t, Date.parse(t.fecha_fin) + 1), "Finalizada");
  assert.equal(estadoTematica({ ...t, estatus: "borrador" }, Date.parse(t.fecha_inicio)), "Borrador");
});
