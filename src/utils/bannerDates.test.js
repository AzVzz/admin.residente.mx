import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  BANNER_TIME_ZONE,
  formatMonterreyDateTimeLocal,
  monterreyDateTimeLocalToIso,
  validateMonterreyDateRange,
} from "./bannerDates.js";

describe("banner date time zone", () => {
  test("round trips a value in America/Monterrey", () => {
    assert.equal(BANNER_TIME_ZONE, "America/Monterrey");
    const iso = monterreyDateTimeLocalToIso("2026-10-08T12:30");
    assert.equal(iso, "2026-10-08T18:30:00.000Z");
    assert.equal(formatMonterreyDateTimeLocal(iso), "2026-10-08T12:30");
  });

  test("clearing a field produces null", () => {
    assert.equal(monterreyDateTimeLocalToIso(""), null);
    assert.deepEqual(validateMonterreyDateRange("", ""), { fecha_inicio: null, fecha_fin: null });
  });

  test("rejects invalid or non-increasing ranges", () => {
    assert.throws(() => validateMonterreyDateRange("2026-10-08T12:30", "2026-10-08T12:30"), /posterior/);
    assert.throws(() => validateMonterreyDateRange("2026-10-08T12:30", "2026-10-08T12:29"), /posterior/);
    assert.throws(() => monterreyDateTimeLocalToIso("2026-02-30T12:00"), /válidas/);
  });
});
