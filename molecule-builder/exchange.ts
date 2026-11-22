import type { AtomicModel } from "./atomic-model";
import type { Structure } from "./structure";

export const BUILDER_TAG = "webwriter-chemlab-molecule-builder";
export const LAB_TAG = "webwriter-chemlab";
export const TABLE_TAG = "webwriter-chemlab-periodic-table";

export type BuilderReceiver = HTMLElement & { viewCatalogStructure(key: string): boolean; viewStructure(snapshot: Structure): boolean };
export type AtomReceiver = HTMLElement & { viewAtom(atomicNumber: number, model?: AtomicModel): boolean };
export type LabReceiver = HTMLElement & { reviewBuilderStructure(snapshot: Structure): boolean };

export function worksheetScope(widget: HTMLElement): ParentNode {
	return widget.closest("[data-chemlab-worksheet], .ProseMirror") ?? widget.getRootNode() as ParentNode;
}

export function worksheetPeers(widget: HTMLElement, tag: string): HTMLElement[] {
	const scope = worksheetScope(widget);
	return Array.from(scope.querySelectorAll<HTMLElement>(tag)).filter(peer => peer !== widget && worksheetScope(peer) === scope);
}

export function worksheetPeer(widget: HTMLElement, tag: string, id: string): HTMLElement | undefined {
	const peers = worksheetPeers(widget, tag);
	const matching = id ? peers.filter(peer => peer.id === id) : peers;
	return matching.length === 1 ? matching[0] : undefined;
}
