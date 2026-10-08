/** Run the DELETE request before applying the corresponding list update. */
export async function deleteBannerThenUpdateList(id, deleteRequest, updateList) {
  await deleteRequest(id);
  updateList((current) => current.filter((banner) => banner.id !== id));
}
