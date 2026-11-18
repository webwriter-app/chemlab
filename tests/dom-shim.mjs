// Minimal browser environment for the Node test runs.
//
// kekule's html and widget modules read `window`, `document` and a handful of
// browser globals while they initialise, and they resolve their own namespace
// through `window`. The shim therefore has to be the global object itself:
// `window` and `self` point at `globalThis`, so a namespace kekule assigns to
// `window` is also visible as a bare global.
//
// Load it before the bundled test with `node --import ./tests/dom-shim.mjs`.

const noop = () => {};

const element = () => ({
	style: {},
	dataset: {},
	children: [],
	childNodes: [],
	classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
	setAttribute: noop,
	getAttribute: () => null,
	removeAttribute: noop,
	hasAttribute: () => false,
	appendChild: (child) => child,
	removeChild: (child) => child,
	insertBefore: (child) => child,
	addEventListener: noop,
	removeEventListener: noop,
	dispatchEvent: () => true,
	getBoundingClientRect: () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
	getContext: () => null,
	querySelector: () => element(),
	querySelectorAll: () => [],
	cloneNode: () => element(),
	attachShadow: () => element(),
	offsetWidth: 0,
	offsetHeight: 0,
	clientWidth: 0,
	clientHeight: 0,
	scrollWidth: 0,
	scrollHeight: 0,
	innerHTML: "",
	outerHTML: "",
	textContent: "",
	parentNode: null,
	ownerDocument: null,
});

const documentStub = {
	documentElement: element(),
	body: element(),
	head: element(),
	createElement: () => element(),
	createElementNS: () => element(),
	createTextNode: () => element(),
	createDocumentFragment: () => element(),
	getElementById: () => element(),
	getElementsByTagName: () => [],
	getElementsByClassName: () => [],
	querySelector: () => element(),
	querySelectorAll: () => [],
	addEventListener: noop,
	removeEventListener: noop,
	createEvent: () => ({ initEvent: noop, initCustomEvent: noop }),
	compatMode: "CSS1Compat",
	readyState: "complete",
	cookie: "",
	location: { href: "http://localhost/", protocol: "http:", host: "localhost", pathname: "/" },
};
documentStub.documentElement.ownerDocument = documentStub;
documentStub.body.ownerDocument = documentStub;

const define = (name, value) => {
	try {
		Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
	} catch {
		globalThis[name] = value;
	}
};

define("window", globalThis);
define("self", globalThis);
define("document", documentStub);
// kekule reads the default view of a document to install its window handlers.
documentStub.defaultView = globalThis;
documentStub.parentWindow = globalThis;
define("navigator", { userAgent: "node", language: "en", platform: "node" });
define("location", documentStub.location);
define("innerWidth", 1280);
define("innerHeight", 800);
define("outerWidth", 1280);
define("outerHeight", 800);
define("devicePixelRatio", 1);
define("screen", { width: 1280, height: 800 });
define("getComputedStyle", () => ({ getPropertyValue: () => "", position: "static" }));
define("matchMedia", () => ({ matches: false, addListener: noop, removeListener: noop, addEventListener: noop }));
define("requestAnimationFrame", (callback) => setTimeout(() => callback(Date.now()), 0));
define("cancelAnimationFrame", (id) => clearTimeout(id));
define("addEventListener", noop);
define("removeEventListener", noop);
define("dispatchEvent", () => true);
define("alert", noop);
define("localStorage", {
	_store: new Map(),
	getItem(key) { return this._store.has(key) ? this._store.get(key) : null; },
	setItem(key, value) { this._store.set(key, String(value)); },
	removeItem(key) { this._store.delete(key); },
	clear() { this._store.clear(); },
});
define("sessionStorage", globalThis.localStorage);
define("XMLHttpRequest", function () {
	return { open: noop, send: noop, setRequestHeader: noop, addEventListener: noop, readyState: 4, status: 200, responseText: "" };
});
define("Image", function () { return element(); });
define("SVGSVGElement", function () {});
define("CanvasRenderingContext2D", function () {});
define("WebGLRenderingContext", function () {});
define("MutationObserver", function () { return { observe: noop, disconnect: noop }; });
define("ResizeObserver", function () { return { observe: noop, disconnect: noop }; });
define("HTMLTemplateElement", function () {});
define("HTMLSlotElement", function () {});
define("Blob", function () {});
define("File", function () {});
define("FileReader", function () {});
define("FileList", function () {});
define("Worker", function () {});
define("PointerEvent", function () {});
define("TouchEvent", function () {});
