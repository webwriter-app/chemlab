/**
 * Refill rule for the object card.
 *
 * The card's heading comes from the template, but the contents carousel, the
 * mixture summary and the electrical readouts are filled imperatively, because
 * they are redrawn whenever the chemistry moves. That leaves one gap: a fill
 * that never ran, or that ran before the card existed, leaves a card with a
 * heading and nothing below it. Keeping the rule here makes the gap testable
 * without a Lit element or a browser.
 */

/** The three nodes of the object card that the imperative fill writes into. */
export interface ObjectCardNodes {
	echem: unknown;
	carousel: unknown;
	summary: unknown;
}

/**
 * Whether the object card has to be filled again.
 *
 * `card` holds the nodes the current render put on screen, `filled` the nodes
 * the last successful fill wrote into. A new selection always refills, and so
 * does a card whose nodes were replaced, which is what happens when the
 * template rebuilds the section. A card that no longer exists (a locked learner
 * interface renders none) never refills.
 */
export function cardNeedsFill(
	selectionChanged: boolean,
	card: ObjectCardNodes | undefined,
	filled: ObjectCardNodes | undefined,
): boolean {
	if (!card) return false;
	if (selectionChanged) return true;
	return !filled || card.echem !== filled.echem || card.carousel !== filled.carousel ||
		card.summary !== filled.summary;
}
