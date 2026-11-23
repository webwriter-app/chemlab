/**
 * The check an asynchronous identification writes through.
 *
 * A builder preview can be closed, or replaced by a newer structure, while a
 * catalog import or a PubChem lookup is still running. The late answer must not
 * overwrite the newer panel: every snapshot makes a new review object, so the
 * object itself is the token that says which answer still belongs on screen.
 *
 * @export
 * @param {{ isConnected: boolean }} host - the element the panel belongs to
 * @param {unknown} current - the review the panel holds now
 * @param {unknown} review - the review the answer was requested for
 * @returns {boolean} true when the answer still reaches the visible panel
 */
export const reviewIsCurrent = (host: { isConnected: boolean }, current: unknown, review: unknown) =>
	host.isConnected && current === review;

