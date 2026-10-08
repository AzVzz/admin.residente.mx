import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { deleteBannerThenUpdateList } from "./bannerDelete.js";

describe("banner delete UI state", () => {
  test("removes a banner only after DELETE succeeds", async () => {
    let banners = [{ id: 27 }, { id: 28 }];
    await deleteBannerThenUpdateList(
      27,
      async (id) => assert.equal(id, 27),
      (update) => { banners = update(banners); },
    );
    assert.deepEqual(banners, [{ id: 28 }]);
  });

  test("keeps the banner when DELETE fails", async () => {
    const banners = [{ id: 27 }];
    let updateCalled = false;
    await assert.rejects(
      deleteBannerThenUpdateList(
        27,
        async () => { throw new Error("API offline"); },
        () => { updateCalled = true; },
      ),
      /API offline/,
    );
    assert.equal(updateCalled, false);
    assert.deepEqual(banners, [{ id: 27 }]);
  });
});
