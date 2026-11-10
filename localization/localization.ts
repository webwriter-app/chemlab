import type { ReactiveControllerHost } from "lit";
import translations from "./messages.json";

const messages = new Map(
    Object.entries(translations).map(([locale, entries]) =>
        [locale.toLowerCase(), entries as Record<string, string>]),
);

function parent(node: Node) {
    const root = node.getRootNode();
    return node.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
}

export function effectiveLanguage(host: HTMLElement) {
    for (let node: Node | null = host; node; node = parent(node)) {
        if (node instanceof HTMLElement && node.hasAttribute("lang")) return node.getAttribute("lang")!;
    }
    return "de";
}

export function localize(host: ReactiveControllerHost & HTMLElement, onChange: () => void) {
    const observer = new MutationObserver(() => {
        onChange();
        host.requestUpdate();
        host.dispatchEvent(new Event("optionschange", { bubbles: true, composed: true }));
    });
    host.addController({
        hostConnected() {
            for (let node: Node | null = host; node; node = parent(node)) {
                observer.observe(node, { attributes: true, attributeFilter: ["lang"] });
            }
            onChange();
        },
        hostDisconnected() {
            observer.disconnect();
        },
    });
    return (source: string) => {
        const locale = effectiveLanguage(host).toLowerCase();
        return messages.get(locale)?.[source] ?? messages.get(locale.split("-")[0])?.[source] ?? source;
    };
}

type Label = { _: string; en?: string; "de-DE"?: string };
type Item = { label: Label; options?: readonly Item[] };

export function drawerLabels<T extends Record<string, Item>>(declarations: T, language: string): T {
    const german = language.toLowerCase().split("-")[0] === "de";
    const translate = (item: Item): Item => {
        const label = german ? item.label["de-DE"] ?? item.label._ : item.label.en ?? item.label._;
        return { ...item, label: { _: label }, ...(item.options && { options: item.options.map(translate) }) };
    };
    return Object.fromEntries(Object.entries(declarations).map(([key, item]) => [key, translate(item)])) as T;
}
