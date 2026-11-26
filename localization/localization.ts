import type { ReactiveControllerHost } from "lit";
import translations from "./messages.json";

const messages = new Map(
    Object.entries(translations).map(([locale, entries]) =>
        [locale.toLowerCase(), entries as Record<string, string>]),
);

const localeDefaults = new Map([["no", "nb"], ["pt", "pt-pt"], ["zh", "zh-hans"]]);

function translate(source: string, language: string) {
    const tag = language.trim().toLowerCase();
    const base = tag.split("-")[0];
    const fallback = localeDefaults.get(base) ?? base;
    return messages.get(tag)?.[source] ?? messages.get(base)?.[source] ?? messages.get(fallback)?.[source]
        ?? (base === "de" || !base ? source : messages.get("en")?.[source] ?? source);
}

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
    return (source: string, values: Record<string, string | number> = {}) => {
        const text = translate(source, effectiveLanguage(host));
        return text.replace(/\{(\w+)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match);
    };
}

type Label = { _: string; en?: string; "de-DE"?: string };
type Item = { label: Label; options?: readonly Item[] };

export function drawerLabels<T extends Record<string, Item>>(declarations: T, language: string): T {
    const localizeItem = (item: Item): Item => {
        const label = translate(item.label["de-DE"] ?? item.label._, language);
        return { ...item, label: { _: label }, ...(item.options && { options: item.options.map(localizeItem) }) };
    };
    return Object.fromEntries(Object.entries(declarations).map(([key, item]) => [key, localizeItem(item)])) as T;
}
