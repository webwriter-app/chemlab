# Periodic table implementation notes

Observations made while implementing the [handoff](periodic-table-implementation.md). The handoff and the [product plan](periodic-table-mvp.md) stay the specification; this file records what the installed toolchain and the host actually do.

## Environment

| Item | Version |
| --- | --- |
| `lit` | 3.2.1 |
| `@webwriter/lit` | 2.1.6 |
| `typescript` | 5.8 |
| Decorators | TC39 standard (`experimentalDecorators: false`) |
| Class fields | `useDefineForClassFields: true` |

## Work package 1: entry point and contract

- **A getter/setter pair cannot carry `@property`.** `@lit/reactive-element`'s standard decorator only accepts `kind: "accessor"` and `kind: "setter"` and throws `Unsupported decorator location: getter` for a pair. `selectedAtomicNumber` therefore registers through `static properties` and keeps a prototype accessor pair. `ReactiveElement.getPropertyDescriptor` wraps an existing accessor instead of replacing it, so the validating setter still runs and `requestUpdate` is still called.
- **Lit derives the attribute name from the property name.** The default is the lowercased property name, which is why the existing options are saved as `enablexapi` and `newsmilesdrawer`. `initial-element` needs an explicit `attribute: "initial-element"` in both the `@property` declaration and the option record.
- **A pre-upgrade write survives.** `ReactiveElement` copies own properties of registered reactive properties in its constructor and applies them in the first `performUpdate`, before `willUpdate`. The authored default is applied in `willUpdate`, so a host write made before `customElements.define` reaches the validating setter first and wins, including a deliberate `null`.
- **`connectedCallback` re-sets every attribute.** `LitElementWw` does `getAttributeNames().forEach(k => setAttribute(k, getAttribute(k)))`. The DOM's change-an-attribute algorithm returns early for an unchanged value, so `attributeChangedCallback` and the converter do not run a second time.
- **`LitElementWw.lang` does not cross shadow hosts.** Its getter reads `this.#lang` or `parentElement.closest("[lang]")`. The table needs its own resolver that walks `getRootNode().host`, as the handoff requires.
- **The table entry stays small.** An esbuild bundle of `webwriter-chemlab-periodic-table.ts` is 67.6 kB and contains no Pixi, Chart.js, ChemLib or Kekule module.
- **Clearing a number option.** The editor's behaviour for an empty number field is unverified without a manual import. `clearInitialElement()` is registered as an author action and removes `initial-element`, so the option can be cleared either way.

## Open checks awaiting a manual WebWriter import

- WebWriter version and the observed save/reopen behaviour of `initial-element` and `view`.
- Whether the editor writes `initial-element=""` or removes the attribute when the number field is emptied.
- Whether the widget ID survives save, reopen, duplicate, paste and undo/redo, which the worksheet linking fixture depends on.
