var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i9 = 0, fns = array[flags >> 1], n10 = fns && fns.length; i9 < n10; i9++) flags & 1 ? fns[i9].call(self) : value = fns[i9].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k3 = flags & 7, s4 = !!(flags & 8), p4 = !!(flags & 16);
  var j3 = k3 > 3 ? array.length + 1 : k3 ? s4 ? 1 : 2 : 0, key = __decoratorStrings[k3 + 5];
  var initializers = k3 > 3 && (array[j3 - 1] = []), extraInitializers = array[j3] || (array[j3] = []);
  var desc = k3 && (!p4 && !s4 && (target = target.prototype), k3 < 5 && (k3 > 3 || !p4) && __getOwnPropDesc(k3 < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x3) {
    return __privateSet(this, extra, x3);
  } }, name));
  k3 ? p4 && k3 < 4 && __name(extra, (k3 > 2 ? "set " : k3 > 1 ? "get " : "") + name) : __name(target, name);
  for (var i9 = decorators.length - 1; i9 >= 0; i9--) {
    ctx = __decoratorContext(k3, name, done = {}, array[3], extraInitializers);
    if (k3) {
      ctx.static = s4, ctx.private = p4, access = ctx.access = { has: p4 ? (x3) => __privateIn(target, x3) : (x3) => name in x3 };
      if (k3 ^ 3) access.get = p4 ? (x3) => (k3 ^ 1 ? __privateGet : __privateMethod)(x3, target, k3 ^ 4 ? extra : desc.get) : (x3) => x3[name];
      if (k3 > 2) access.set = p4 ? (x3, y4) => __privateSet(x3, target, y4, k3 ^ 4 ? extra : desc.set) : (x3, y4) => x3[name] = y4;
    }
    it = (0, decorators[i9])(k3 ? k3 < 4 ? p4 ? extra : desc[key] : k3 > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k3 ^ 4 || it === void 0) __expectFn(it) && (k3 > 4 ? initializers.unshift(it) : k3 ? p4 ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k3 || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p4 ? k3 ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/@webwriter/lit/index.js
var __create2 = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __knownSymbol2 = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError2 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name2 = (target, value) => __defProp2(target, "name", { value, configurable: true });
var __decoratorStart2 = (base) => [, , , __create2(base?.[__knownSymbol2("metadata")] ?? null)];
var __decoratorStrings2 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn2 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError2("Function expected") : fn;
var __decoratorContext2 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings2[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError2("Already initialized") : fns.push(__expectFn2(fn || null)) });
var __decoratorMetadata2 = (array, target) => __defNormalProp2(target, __knownSymbol2("metadata"), array[3]);
var __runInitializers2 = (array, flags, self, value) => {
  for (var i32 = 0, fns = array[flags >> 1], n52 = fns && fns.length; i32 < n52; i32++) flags & 1 ? fns[i32].call(self) : value = fns[i32].call(self, value);
  return value;
};
var __decorateElement2 = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k22 = flags & 7, s22 = !!(flags & 8), p22 = !!(flags & 16);
  var j22 = k22 > 3 ? array.length + 1 : k22 ? s22 ? 1 : 2 : 0, key = __decoratorStrings2[k22 + 5];
  var initializers = k22 > 3 && (array[j22 - 1] = []), extraInitializers = array[j22] || (array[j22] = []);
  var desc = k22 && (!p22 && !s22 && (target = target.prototype), k22 < 5 && (k22 > 3 || !p22) && __getOwnPropDesc2(k22 < 4 ? target : { get [name]() {
    return __privateGet2(this, extra);
  }, set [name](x22) {
    return __privateSet2(this, extra, x22);
  } }, name));
  k22 ? p22 && k22 < 4 && __name2(extra, (k22 > 2 ? "set " : k22 > 1 ? "get " : "") + name) : __name2(target, name);
  for (var i32 = decorators.length - 1; i32 >= 0; i32--) {
    ctx = __decoratorContext2(k22, name, done = {}, array[3], extraInitializers);
    if (k22) {
      ctx.static = s22, ctx.private = p22, access = ctx.access = { has: p22 ? (x22) => __privateIn2(target, x22) : (x22) => name in x22 };
      if (k22 ^ 3) access.get = p22 ? (x22) => (k22 ^ 1 ? __privateGet2 : __privateMethod2)(x22, target, k22 ^ 4 ? extra : desc.get) : (x22) => x22[name];
      if (k22 > 2) access.set = p22 ? (x22, y22) => __privateSet2(x22, target, y22, k22 ^ 4 ? extra : desc.set) : (x22, y22) => x22[name] = y22;
    }
    it = (0, decorators[i32])(k22 ? k22 < 4 ? p22 ? extra : desc[key] : k22 > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k22 ^ 4 || it === void 0) __expectFn2(it) && (k22 > 4 ? initializers.unshift(it) : k22 ? p22 ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError2("Object expected");
    else __expectFn2(fn = it.get) && (desc.get = fn), __expectFn2(fn = it.set) && (desc.set = fn), __expectFn2(fn = it.init) && initializers.unshift(fn);
  }
  return k22 || __decoratorMetadata2(array, target), desc && __defProp2(target, name, desc), p22 ? k22 ^ 4 ? extra : desc : target;
};
var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck2 = (obj, member, msg) => member.has(obj) || __typeError2("Cannot " + msg);
var __privateIn2 = (member, obj) => Object(obj) !== obj ? __typeError2('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet2 = (obj, member, getter) => (__accessCheck2(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd2 = (obj, member, value) => member.has(obj) ? __typeError2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet2 = (obj, member, value, setter) => (__accessCheck2(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod2 = (obj, member, method) => (__accessCheck2(obj, member, "access private method"), method);
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t22, e42, o42) {
    if (this._$cssResult$ = true, o42 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t22, this.t = e42;
  }
  get styleSheet() {
    let t22 = this.o;
    const s22 = this.t;
    if (e && void 0 === t22) {
      const e42 = void 0 !== s22 && 1 === s22.length;
      e42 && (t22 = o.get(s22)), void 0 === t22 && ((this.o = t22 = new CSSStyleSheet()).replaceSync(this.cssText), e42 && o.set(s22, t22));
    }
    return t22;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t22) => new n("string" == typeof t22 ? t22 : t22 + "", void 0, s);
var S = (s22, o42) => {
  if (e) s22.adoptedStyleSheets = o42.map((t22) => t22 instanceof CSSStyleSheet ? t22 : t22.styleSheet);
  else for (const e42 of o42) {
    const o52 = document.createElement("style"), n52 = t.litNonce;
    void 0 !== n52 && o52.setAttribute("nonce", n52), o52.textContent = e42.cssText, s22.appendChild(o52);
  }
};
var c = e ? (t22) => t22 : (t22) => t22 instanceof CSSStyleSheet ? ((t32) => {
  let e42 = "";
  for (const s22 of t32.cssRules) e42 += s22.cssText;
  return r(e42);
})(t22) : t22;
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: r2, getOwnPropertyNames: h, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t22, s22) => t22;
var u = { toAttribute(t22, s22) {
  switch (s22) {
    case Boolean:
      t22 = t22 ? l : null;
      break;
    case Object:
    case Array:
      t22 = null == t22 ? t22 : JSON.stringify(t22);
  }
  return t22;
}, fromAttribute(t22, s22) {
  let i32 = t22;
  switch (s22) {
    case Boolean:
      i32 = null !== t22;
      break;
    case Number:
      i32 = null === t22 ? null : Number(t22);
      break;
    case Object:
    case Array:
      try {
        i32 = JSON.parse(t22);
      } catch (t32) {
        i32 = null;
      }
  }
  return i32;
} };
var f = (t22, s22) => !i2(t22, s22);
var y = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var b = class extends HTMLElement {
  static addInitializer(t22) {
    this._$Ei(), (this.l ??= []).push(t22);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t22, s22 = y) {
    if (s22.state && (s22.attribute = false), this._$Ei(), this.elementProperties.set(t22, s22), !s22.noAccessor) {
      const i32 = Symbol(), r42 = this.getPropertyDescriptor(t22, i32, s22);
      void 0 !== r42 && e2(this.prototype, t22, r42);
    }
  }
  static getPropertyDescriptor(t22, s22, i32) {
    const { get: e42, set: h42 } = r2(this.prototype, t22) ?? { get() {
      return this[s22];
    }, set(t32) {
      this[s22] = t32;
    } };
    return { get() {
      return e42?.call(this);
    }, set(s32) {
      const r42 = e42?.call(this);
      h42.call(this, s32), this.requestUpdate(t22, r42, i32);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t22) {
    return this.elementProperties.get(t22) ?? y;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t22 = n2(this);
    t22.finalize(), void 0 !== t22.l && (this.l = [...t22.l]), this.elementProperties = new Map(t22.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t32 = this.properties, s22 = [...h(t32), ...o2(t32)];
      for (const i32 of s22) this.createProperty(i32, t32[i32]);
    }
    const t22 = this[Symbol.metadata];
    if (null !== t22) {
      const s22 = litPropertyMetadata.get(t22);
      if (void 0 !== s22) for (const [t32, i32] of s22) this.elementProperties.set(t32, i32);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t32, s22] of this.elementProperties) {
      const i32 = this._$Eu(t32, s22);
      void 0 !== i32 && this._$Eh.set(i32, t32);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s22) {
    const i32 = [];
    if (Array.isArray(s22)) {
      const e42 = new Set(s22.flat(1 / 0).reverse());
      for (const s32 of e42) i32.unshift(c(s32));
    } else void 0 !== s22 && i32.push(c(s22));
    return i32;
  }
  static _$Eu(t22, s22) {
    const i32 = s22.attribute;
    return false === i32 ? void 0 : "string" == typeof i32 ? i32 : "string" == typeof t22 ? t22.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t22) => this.enableUpdating = t22), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t22) => t22(this));
  }
  addController(t22) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t22), void 0 !== this.renderRoot && this.isConnected && t22.hostConnected?.();
  }
  removeController(t22) {
    this._$EO?.delete(t22);
  }
  _$E_() {
    const t22 = /* @__PURE__ */ new Map(), s22 = this.constructor.elementProperties;
    for (const i32 of s22.keys()) this.hasOwnProperty(i32) && (t22.set(i32, this[i32]), delete this[i32]);
    t22.size > 0 && (this._$Ep = t22);
  }
  createRenderRoot() {
    const t22 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t22, this.constructor.elementStyles), t22;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t22) => t22.hostConnected?.());
  }
  enableUpdating(t22) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t22) => t22.hostDisconnected?.());
  }
  attributeChangedCallback(t22, s22, i32) {
    this._$AK(t22, i32);
  }
  _$EC(t22, s22) {
    const i32 = this.constructor.elementProperties.get(t22), e42 = this.constructor._$Eu(t22, i32);
    if (void 0 !== e42 && true === i32.reflect) {
      const r42 = (void 0 !== i32.converter?.toAttribute ? i32.converter : u).toAttribute(s22, i32.type);
      this._$Em = t22, null == r42 ? this.removeAttribute(e42) : this.setAttribute(e42, r42), this._$Em = null;
    }
  }
  _$AK(t22, s22) {
    const i32 = this.constructor, e42 = i32._$Eh.get(t22);
    if (void 0 !== e42 && this._$Em !== e42) {
      const t32 = i32.getPropertyOptions(e42), r42 = "function" == typeof t32.converter ? { fromAttribute: t32.converter } : void 0 !== t32.converter?.fromAttribute ? t32.converter : u;
      this._$Em = e42, this[e42] = r42.fromAttribute(s22, t32.type), this._$Em = null;
    }
  }
  requestUpdate(t22, s22, i32) {
    if (void 0 !== t22) {
      if (i32 ??= this.constructor.getPropertyOptions(t22), !(i32.hasChanged ?? f)(this[t22], s22)) return;
      this.P(t22, s22, i32);
    }
    false === this.isUpdatePending && (this._$ES = this._$ET());
  }
  P(t22, s22, i32) {
    this._$AL.has(t22) || this._$AL.set(t22, s22), true === i32.reflect && this._$Em !== t22 && (this._$Ej ??= /* @__PURE__ */ new Set()).add(t22);
  }
  async _$ET() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t32) {
      Promise.reject(t32);
    }
    const t22 = this.scheduleUpdate();
    return null != t22 && await t22, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t42, s32] of this._$Ep) this[t42] = s32;
        this._$Ep = void 0;
      }
      const t32 = this.constructor.elementProperties;
      if (t32.size > 0) for (const [s32, i32] of t32) true !== i32.wrapped || this._$AL.has(s32) || void 0 === this[s32] || this.P(s32, this[s32], i32);
    }
    let t22 = false;
    const s22 = this._$AL;
    try {
      t22 = this.shouldUpdate(s22), t22 ? (this.willUpdate(s22), this._$EO?.forEach((t32) => t32.hostUpdate?.()), this.update(s22)) : this._$EU();
    } catch (s32) {
      throw t22 = false, this._$EU(), s32;
    }
    t22 && this._$AE(s22);
  }
  willUpdate(t22) {
  }
  _$AE(t22) {
    this._$EO?.forEach((t32) => t32.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t22)), this.updated(t22);
  }
  _$EU() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t22) {
    return true;
  }
  update(t22) {
    this._$Ej &&= this._$Ej.forEach((t32) => this._$EC(t32, this[t32])), this._$EU();
  }
  updated(t22) {
  }
  firstUpdated(t22) {
  }
};
b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[d("elementProperties")] = /* @__PURE__ */ new Map(), b[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: b }), (a.reactiveElementVersions ??= []).push("2.0.4");
var n3 = globalThis;
var c3 = n3.trustedTypes;
var h2 = c3 ? c3.createPolicy("lit-html", { createHTML: (t22) => t22 }) : void 0;
var f2 = "$lit$";
var v = `lit$${Math.random().toFixed(9).slice(2)}$`;
var m = "?" + v;
var _ = `<${m}>`;
var w = document;
var lt = () => w.createComment("");
var st = (t22) => null === t22 || "object" != typeof t22 && "function" != typeof t22;
var g = Array.isArray;
var $ = (t22) => g(t22) || "function" == typeof t22?.[Symbol.iterator];
var x = "[ 	\n\f\r]";
var T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var E = /-->/g;
var k = />/g;
var O = RegExp(`>|${x}(?:([^\\s"'>=/]+)(${x}*=${x}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var S2 = /'/g;
var j = /"/g;
var M = /^(?:script|style|textarea|title)$/i;
var P = (t22) => (i32, ...s22) => ({ _$litType$: t22, strings: i32, values: s22 });
var ke = P(1);
var Oe = P(2);
var Se = P(3);
var R = Symbol.for("lit-noChange");
var D = Symbol.for("lit-nothing");
var V = /* @__PURE__ */ new WeakMap();
var I = w.createTreeWalker(w, 129);
function N(t22, i32) {
  if (!g(t22) || !t22.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== h2 ? h2.createHTML(i32) : i32;
}
var U = (t22, i32) => {
  const s22 = t22.length - 1, e42 = [];
  let h42, o42 = 2 === i32 ? "<svg>" : 3 === i32 ? "<math>" : "", n52 = T;
  for (let i42 = 0; i42 < s22; i42++) {
    const s32 = t22[i42];
    let r42, l22, c42 = -1, a22 = 0;
    for (; a22 < s32.length && (n52.lastIndex = a22, l22 = n52.exec(s32), null !== l22); ) a22 = n52.lastIndex, n52 === T ? "!--" === l22[1] ? n52 = E : void 0 !== l22[1] ? n52 = k : void 0 !== l22[2] ? (M.test(l22[2]) && (h42 = RegExp("</" + l22[2], "g")), n52 = O) : void 0 !== l22[3] && (n52 = O) : n52 === O ? ">" === l22[0] ? (n52 = h42 ?? T, c42 = -1) : void 0 === l22[1] ? c42 = -2 : (c42 = n52.lastIndex - l22[2].length, r42 = l22[1], n52 = void 0 === l22[3] ? O : '"' === l22[3] ? j : S2) : n52 === j || n52 === S2 ? n52 = O : n52 === E || n52 === k ? n52 = T : (n52 = O, h42 = void 0);
    const u22 = n52 === O && t22[i42 + 1].startsWith("/>") ? " " : "";
    o42 += n52 === T ? s32 + _ : c42 >= 0 ? (e42.push(r42), s32.slice(0, c42) + f2 + s32.slice(c42) + v + u22) : s32 + v + (-2 === c42 ? i42 : u22);
  }
  return [N(t22, o42 + (t22[s22] || "<?>") + (2 === i32 ? "</svg>" : 3 === i32 ? "</math>" : "")), e42];
};
var B = class _B {
  constructor({ strings: t22, _$litType$: i32 }, s22) {
    let e42;
    this.parts = [];
    let h42 = 0, o42 = 0;
    const n52 = t22.length - 1, r42 = this.parts, [l22, a22] = U(t22, i32);
    if (this.el = _B.createElement(l22, s22), I.currentNode = this.el.content, 2 === i32 || 3 === i32) {
      const t32 = this.el.content.firstChild;
      t32.replaceWith(...t32.childNodes);
    }
    for (; null !== (e42 = I.nextNode()) && r42.length < n52; ) {
      if (1 === e42.nodeType) {
        if (e42.hasAttributes()) for (const t32 of e42.getAttributeNames()) if (t32.endsWith(f2)) {
          const i42 = a22[o42++], s32 = e42.getAttribute(t32).split(v), n62 = /([.?@])?(.*)/.exec(i42);
          r42.push({ type: 1, index: h42, name: n62[2], strings: s32, ctor: "." === n62[1] ? Y : "?" === n62[1] ? Z : "@" === n62[1] ? q : G }), e42.removeAttribute(t32);
        } else t32.startsWith(v) && (r42.push({ type: 6, index: h42 }), e42.removeAttribute(t32));
        if (M.test(e42.tagName)) {
          const t32 = e42.textContent.split(v), i42 = t32.length - 1;
          if (i42 > 0) {
            e42.textContent = c3 ? c3.emptyScript : "";
            for (let s32 = 0; s32 < i42; s32++) e42.append(t32[s32], lt()), I.nextNode(), r42.push({ type: 2, index: ++h42 });
            e42.append(t32[i42], lt());
          }
        }
      } else if (8 === e42.nodeType) if (e42.data === m) r42.push({ type: 2, index: h42 });
      else {
        let t32 = -1;
        for (; -1 !== (t32 = e42.data.indexOf(v, t32 + 1)); ) r42.push({ type: 7, index: h42 }), t32 += v.length - 1;
      }
      h42++;
    }
  }
  static createElement(t22, i32) {
    const s22 = w.createElement("template");
    return s22.innerHTML = t22, s22;
  }
};
function z(t22, i32, s22 = t22, e42) {
  if (i32 === R) return i32;
  let h42 = void 0 !== e42 ? s22.o?.[e42] : s22.l;
  const o42 = st(i32) ? void 0 : i32._$litDirective$;
  return h42?.constructor !== o42 && (h42?._$AO?.(false), void 0 === o42 ? h42 = void 0 : (h42 = new o42(t22), h42._$AT(t22, s22, e42)), void 0 !== e42 ? (s22.o ??= [])[e42] = h42 : s22.l = h42), void 0 !== h42 && (i32 = z(t22, h42._$AS(t22, i32.values), h42, e42)), i32;
}
var F = class {
  constructor(t22, i32) {
    this._$AV = [], this._$AN = void 0, this._$AD = t22, this._$AM = i32;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t22) {
    const { el: { content: i32 }, parts: s22 } = this._$AD, e42 = (t22?.creationScope ?? w).importNode(i32, true);
    I.currentNode = e42;
    let h42 = I.nextNode(), o42 = 0, n52 = 0, r42 = s22[0];
    for (; void 0 !== r42; ) {
      if (o42 === r42.index) {
        let i42;
        2 === r42.type ? i42 = new et(h42, h42.nextSibling, this, t22) : 1 === r42.type ? i42 = new r42.ctor(h42, r42.name, r42.strings, this, t22) : 6 === r42.type && (i42 = new K(h42, this, t22)), this._$AV.push(i42), r42 = s22[++n52];
      }
      o42 !== r42?.index && (h42 = I.nextNode(), o42++);
    }
    return I.currentNode = w, e42;
  }
  p(t22) {
    let i32 = 0;
    for (const s22 of this._$AV) void 0 !== s22 && (void 0 !== s22.strings ? (s22._$AI(t22, s22, i32), i32 += s22.strings.length - 2) : s22._$AI(t22[i32])), i32++;
  }
};
var et = class _et {
  get _$AU() {
    return this._$AM?._$AU ?? this.v;
  }
  constructor(t22, i32, s22, e42) {
    this.type = 2, this._$AH = D, this._$AN = void 0, this._$AA = t22, this._$AB = i32, this._$AM = s22, this.options = e42, this.v = e42?.isConnected ?? true;
  }
  get parentNode() {
    let t22 = this._$AA.parentNode;
    const i32 = this._$AM;
    return void 0 !== i32 && 11 === t22?.nodeType && (t22 = i32.parentNode), t22;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t22, i32 = this) {
    t22 = z(this, t22, i32), st(t22) ? t22 === D || null == t22 || "" === t22 ? (this._$AH !== D && this._$AR(), this._$AH = D) : t22 !== this._$AH && t22 !== R && this._(t22) : void 0 !== t22._$litType$ ? this.$(t22) : void 0 !== t22.nodeType ? this.T(t22) : $(t22) ? this.k(t22) : this._(t22);
  }
  O(t22) {
    return this._$AA.parentNode.insertBefore(t22, this._$AB);
  }
  T(t22) {
    this._$AH !== t22 && (this._$AR(), this._$AH = this.O(t22));
  }
  _(t22) {
    this._$AH !== D && st(this._$AH) ? this._$AA.nextSibling.data = t22 : this.T(w.createTextNode(t22)), this._$AH = t22;
  }
  $(t22) {
    const { values: i32, _$litType$: s22 } = t22, e42 = "number" == typeof s22 ? this._$AC(t22) : (void 0 === s22.el && (s22.el = B.createElement(N(s22.h, s22.h[0]), this.options)), s22);
    if (this._$AH?._$AD === e42) this._$AH.p(i32);
    else {
      const t32 = new F(e42, this), s32 = t32.u(this.options);
      t32.p(i32), this.T(s32), this._$AH = t32;
    }
  }
  _$AC(t22) {
    let i32 = V.get(t22.strings);
    return void 0 === i32 && V.set(t22.strings, i32 = new B(t22)), i32;
  }
  k(t22) {
    g(this._$AH) || (this._$AH = [], this._$AR());
    const i32 = this._$AH;
    let s22, e42 = 0;
    for (const h42 of t22) e42 === i32.length ? i32.push(s22 = new _et(this.O(lt()), this.O(lt()), this, this.options)) : s22 = i32[e42], s22._$AI(h42), e42++;
    e42 < i32.length && (this._$AR(s22 && s22._$AB.nextSibling, e42), i32.length = e42);
  }
  _$AR(t22 = this._$AA.nextSibling, i32) {
    for (this._$AP?.(false, true, i32); t22 && t22 !== this._$AB; ) {
      const i42 = t22.nextSibling;
      t22.remove(), t22 = i42;
    }
  }
  setConnected(t22) {
    void 0 === this._$AM && (this.v = t22, this._$AP?.(t22));
  }
};
var G = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t22, i32, s22, e42, h42) {
    this.type = 1, this._$AH = D, this._$AN = void 0, this.element = t22, this.name = i32, this._$AM = e42, this.options = h42, s22.length > 2 || "" !== s22[0] || "" !== s22[1] ? (this._$AH = Array(s22.length - 1).fill(new String()), this.strings = s22) : this._$AH = D;
  }
  _$AI(t22, i32 = this, s22, e42) {
    const h42 = this.strings;
    let o42 = false;
    if (void 0 === h42) t22 = z(this, t22, i32, 0), o42 = !st(t22) || t22 !== this._$AH && t22 !== R, o42 && (this._$AH = t22);
    else {
      const e52 = t22;
      let n52, r42;
      for (t22 = h42[0], n52 = 0; n52 < h42.length - 1; n52++) r42 = z(this, e52[s22 + n52], i32, n52), r42 === R && (r42 = this._$AH[n52]), o42 ||= !st(r42) || r42 !== this._$AH[n52], r42 === D ? t22 = D : t22 !== D && (t22 += (r42 ?? "") + h42[n52 + 1]), this._$AH[n52] = r42;
    }
    o42 && !e42 && this.j(t22);
  }
  j(t22) {
    t22 === D ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t22 ?? "");
  }
};
var Y = class extends G {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t22) {
    this.element[this.name] = t22 === D ? void 0 : t22;
  }
};
var Z = class extends G {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t22) {
    this.element.toggleAttribute(this.name, !!t22 && t22 !== D);
  }
};
var q = class extends G {
  constructor(t22, i32, s22, e42, h42) {
    super(t22, i32, s22, e42, h42), this.type = 5;
  }
  _$AI(t22, i32 = this) {
    if ((t22 = z(this, t22, i32, 0) ?? D) === R) return;
    const s22 = this._$AH, e42 = t22 === D && s22 !== D || t22.capture !== s22.capture || t22.once !== s22.once || t22.passive !== s22.passive, h42 = t22 !== D && (s22 === D || e42);
    e42 && this.element.removeEventListener(this.name, this, s22), h42 && this.element.addEventListener(this.name, this, t22), this._$AH = t22;
  }
  handleEvent(t22) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t22) : this._$AH.handleEvent(t22);
  }
};
var K = class {
  constructor(t22, i32, s22) {
    this.element = t22, this.type = 6, this._$AN = void 0, this._$AM = i32, this.options = s22;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t22) {
    z(this, t22);
  }
};
var Re = n3.litHtmlPolyfillSupport;
Re?.(B, et), (n3.litHtmlVersions ??= []).push("3.2.0");
var Q = (t22, i32, s22) => {
  const e42 = s22?.renderBefore ?? i32;
  let h42 = e42._$litPart$;
  if (void 0 === h42) {
    const t32 = s22?.renderBefore ?? null;
    e42._$litPart$ = h42 = new et(i32.insertBefore(lt(), t32), t32, void 0, s22 ?? {});
  }
  return h42._$AI(t22), h42;
};
var h3 = class extends b {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this.o = void 0;
  }
  createRenderRoot() {
    const t22 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t22.firstChild, t22;
  }
  update(t22) {
    const e42 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t22), this.o = Q(e42, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this.o?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.o?.setConnected(false);
  }
  render() {
    return R;
  }
};
h3._$litElement$ = true, h3["finalized"] = true, globalThis.litElementHydrateSupport?.({ LitElement: h3 });
var f3 = globalThis.litElementPolyfillSupport;
f3?.({ LitElement: h3 });
(globalThis.litElementVersions ??= []).push("4.1.0");
var o3 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r3 = (t22 = o3, e42, r42) => {
  const { kind: n52, metadata: i32 } = r42;
  let s22 = globalThis.litPropertyMetadata.get(i32);
  if (void 0 === s22 && globalThis.litPropertyMetadata.set(i32, s22 = /* @__PURE__ */ new Map()), s22.set(r42.name, t22), "accessor" === n52) {
    const { name: o42 } = r42;
    return { set(r52) {
      const n62 = e42.get.call(this);
      e42.set.call(this, r52), this.requestUpdate(o42, n62, t22);
    }, init(e52) {
      return void 0 !== e52 && this.P(o42, void 0, t22), e52;
    } };
  }
  if ("setter" === n52) {
    const { name: o42 } = r42;
    return function(r52) {
      const n62 = this[o42];
      e42.call(this, r52), this.requestUpdate(o42, n62, t22);
    };
  }
  throw Error("Unsupported decorator location: " + n52);
};
function n4(t22) {
  return (e42, o42) => "object" == typeof o42 ? r3(t22, e42, o42) : ((t32, e52, o52) => {
    const r42 = e52.hasOwnProperty(o52);
    return e52.constructor.createProperty(o52, r42 ? { ...t32, wrapped: true } : t32), r42 ? Object.getOwnPropertyDescriptor(e52, o52) : void 0;
  })(t22, e42, o42);
}
var appliedClassMixins = /* @__PURE__ */ new WeakMap();
function wasMixinPreviouslyApplied(mixin, superClass) {
  let klass = superClass;
  while (klass) {
    if (appliedClassMixins.get(klass) === mixin) {
      return true;
    }
    klass = Object.getPrototypeOf(klass);
  }
  return false;
}
function dedupeMixin(mixin) {
  return (superClass) => {
    if (wasMixinPreviouslyApplied(mixin, superClass)) {
      return superClass;
    }
    const mixedClass = mixin(superClass);
    appliedClassMixins.set(mixedClass, mixin);
    return mixedClass;
  };
}
var version = "3.0.0";
var versions = window.scopedElementsVersions || (window.scopedElementsVersions = []);
if (!versions.includes(version)) {
  versions.push(version);
}
var ScopedElementsMixinImplementation = (superclass) => (
  /** @type {ScopedElementsHost} */
  class ScopedElementsHost extends superclass {
    /**
     * Obtains the scoped elements definitions map if specified.
     *
     * @type {ScopedElementsMap=}
     */
    static scopedElements;
    static get scopedElementsVersion() {
      return version;
    }
    /** @type {CustomElementRegistry=} */
    static __registry;
    /**
     * Obtains the CustomElementRegistry associated to the ShadowRoot.
     *
     * @returns {CustomElementRegistry=}
     */
    get registry() {
      return (
        /** @type {typeof ScopedElementsHost} */
        this.constructor.__registry
      );
    }
    /**
     * Set the CustomElementRegistry associated to the ShadowRoot
     *
     * @param {CustomElementRegistry} registry
     */
    set registry(registry2) {
      this.constructor.__registry = registry2;
    }
    /**
     * @param {ShadowRootInit} options
     * @returns {ShadowRoot}
     */
    attachShadow(options) {
      const { scopedElements } = (
        /** @type {typeof ScopedElementsHost} */
        this.constructor
      );
      const shouldCreateRegistry = !this.registry || // @ts-ignore
      this.registry === this.constructor.__registry && !Object.prototype.hasOwnProperty.call(this.constructor, "__registry");
      if (shouldCreateRegistry) {
        this.registry = new CustomElementRegistry();
        for (const [tagName, klass] of Object.entries(scopedElements ?? {})) {
          this.registry.define(tagName, klass);
        }
      }
      return super.attachShadow({
        ...options,
        // The polyfill currently expects the registry to be passed as `customElements`
        customElements: this.registry,
        // But the proposal has moved forward, and renamed it to `registry`
        // For backwards compatibility, we pass it as both
        registry: this.registry
      });
    }
  }
);
var ScopedElementsMixin = dedupeMixin(ScopedElementsMixinImplementation);
var ScopedElementsMixinImplementation2 = (superclass) => (
  /** @type {ScopedElementsHost} */
  class ScopedElementsHost extends ScopedElementsMixin(superclass) {
    createRenderRoot() {
      const { shadowRootOptions, elementStyles } = (
        /** @type {TypeofLitElement} */
        this.constructor
      );
      const shadowRoot = this.attachShadow(shadowRootOptions);
      this.renderOptions.creationScope = shadowRoot;
      S(shadowRoot, elementStyles);
      this.renderOptions.renderBefore ??= shadowRoot.firstChild;
      return shadowRoot;
    }
  }
);
var ScopedElementsMixin2 = dedupeMixin(ScopedElementsMixinImplementation2);
function action(decl) {
  return (target, context) => {
    function init() {
      this.constructor["actions"] = { ...this.constructor["actions"], [context.name]: decl };
    }
    context.addInitializer(init);
    function func(...args) {
      this._inTransaction = true;
      try {
        return target.apply(this, args);
      } finally {
        this._inTransaction = false;
      }
    }
    if (context.kind === "method") {
      return func;
    } else {
      context.access.set(this, func);
    }
  };
}
var _lang_dec;
var _contentEditable_dec;
var _a;
var _init;
var _contentEditable;
var _lang;
var LitElementWw = class extends (_a = ScopedElementsMixin2(h3), _contentEditable_dec = [n4({ type: String, attribute: true, reflect: true })], _lang_dec = [n4({ type: String, attribute: true, reflect: true })], _a) {
  constructor() {
    super(...arguments);
    __runInitializers2(_init, 5, this);
    __publicField2(this, "options");
    __publicField2(this, "actions", {});
    __publicField2(this, "localize");
    __privateAdd2(this, _contentEditable, __runInitializers2(_init, 8, this)), __runInitializers2(_init, 11, this);
    __privateAdd2(this, _lang, "");
    __publicField2(this, "_inTransaction", false);
  }
  get lang() {
    return (__privateGet2(this, _lang) || this.parentElement?.closest("[lang]")?.lang) ?? "";
  }
  set lang(value) {
    __privateSet2(this, _lang, value);
    this.localize?.setLocale(value).finally(() => this.requestUpdate("lang"));
  }
  connectedCallback() {
    super.connectedCallback();
    this.localize?.setLocale(this.lang).finally(() => this.requestUpdate());
    this.getAttributeNames().forEach((k22) => this.setAttribute(k22, this.getAttribute(k22)));
  }
};
_init = __decoratorStart2(_a);
_contentEditable = /* @__PURE__ */ new WeakMap();
_lang = /* @__PURE__ */ new WeakMap();
__decorateElement2(_init, 4, "contentEditable", _contentEditable_dec, LitElementWw, _contentEditable);
__decorateElement2(_init, 3, "lang", _lang_dec, LitElementWw);
__decoratorMetadata2(_init, LitElementWw);
__publicField2(LitElementWw, "shadowRootOptions", { ...h3.shadowRootOptions });
__publicField2(LitElementWw, "scopedElements", {});
__publicField2(LitElementWw, "options", {});
__publicField2(LitElementWw, "actions", {});

// node_modules/@lit/reactive-element/css-tag.js
var t2 = globalThis;
var e3 = t2.ShadowRoot && (void 0 === t2.ShadyCSS || t2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s2 = Symbol();
var o4 = /* @__PURE__ */ new WeakMap();
var n5 = class {
  constructor(t7, e12, o12) {
    if (this._$cssResult$ = true, o12 !== s2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t7, this.t = e12;
  }
  get styleSheet() {
    let t7 = this.o;
    const s4 = this.t;
    if (e3 && void 0 === t7) {
      const e12 = void 0 !== s4 && 1 === s4.length;
      e12 && (t7 = o4.get(s4)), void 0 === t7 && ((this.o = t7 = new CSSStyleSheet()).replaceSync(this.cssText), e12 && o4.set(s4, t7));
    }
    return t7;
  }
  toString() {
    return this.cssText;
  }
};
var r4 = (t7) => new n5("string" == typeof t7 ? t7 : t7 + "", void 0, s2);
var i = (t7, ...e12) => {
  const o12 = 1 === t7.length ? t7[0] : e12.reduce(((e13, s4, o13) => e13 + ((t8) => {
    if (true === t8._$cssResult$) return t8.cssText;
    if ("number" == typeof t8) return t8;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t8 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t7[o13 + 1]), t7[0]);
  return new n5(o12, t7, s2);
};
var S3 = (s4, o12) => {
  if (e3) s4.adoptedStyleSheets = o12.map(((t7) => t7 instanceof CSSStyleSheet ? t7 : t7.styleSheet));
  else for (const e12 of o12) {
    const o13 = document.createElement("style"), n10 = t2.litNonce;
    void 0 !== n10 && o13.setAttribute("nonce", n10), o13.textContent = e12.cssText, s4.appendChild(o13);
  }
};
var c4 = e3 ? (t7) => t7 : (t7) => t7 instanceof CSSStyleSheet ? ((t8) => {
  let e12 = "";
  for (const s4 of t8.cssRules) e12 += s4.cssText;
  return r4(e12);
})(t7) : t7;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i3, defineProperty: e4, getOwnPropertyDescriptor: r5, getOwnPropertyNames: h4, getOwnPropertySymbols: o5, getPrototypeOf: n6 } = Object;
var a2 = globalThis;
var c5 = a2.trustedTypes;
var l2 = c5 ? c5.emptyScript : "";
var p2 = a2.reactiveElementPolyfillSupport;
var d2 = (t7, s4) => t7;
var u2 = { toAttribute(t7, s4) {
  switch (s4) {
    case Boolean:
      t7 = t7 ? l2 : null;
      break;
    case Object:
    case Array:
      t7 = null == t7 ? t7 : JSON.stringify(t7);
  }
  return t7;
}, fromAttribute(t7, s4) {
  let i9 = t7;
  switch (s4) {
    case Boolean:
      i9 = null !== t7;
      break;
    case Number:
      i9 = null === t7 ? null : Number(t7);
      break;
    case Object:
    case Array:
      try {
        i9 = JSON.parse(t7);
      } catch (t8) {
        i9 = null;
      }
  }
  return i9;
} };
var f4 = (t7, s4) => !i3(t7, s4);
var y2 = { attribute: true, type: String, converter: u2, reflect: false, hasChanged: f4 };
Symbol.metadata ??= Symbol("metadata"), a2.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var b2 = class extends HTMLElement {
  static addInitializer(t7) {
    this._$Ei(), (this.l ??= []).push(t7);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t7, s4 = y2) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.elementProperties.set(t7, s4), !s4.noAccessor) {
      const i9 = Symbol(), r11 = this.getPropertyDescriptor(t7, i9, s4);
      void 0 !== r11 && e4(this.prototype, t7, r11);
    }
  }
  static getPropertyDescriptor(t7, s4, i9) {
    const { get: e12, set: h6 } = r5(this.prototype, t7) ?? { get() {
      return this[s4];
    }, set(t8) {
      this[s4] = t8;
    } };
    return { get() {
      return e12?.call(this);
    }, set(s5) {
      const r11 = e12?.call(this);
      h6.call(this, s5), this.requestUpdate(t7, r11, i9);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t7) {
    return this.elementProperties.get(t7) ?? y2;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d2("elementProperties"))) return;
    const t7 = n6(this);
    t7.finalize(), void 0 !== t7.l && (this.l = [...t7.l]), this.elementProperties = new Map(t7.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d2("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d2("properties"))) {
      const t8 = this.properties, s4 = [...h4(t8), ...o5(t8)];
      for (const i9 of s4) this.createProperty(i9, t8[i9]);
    }
    const t7 = this[Symbol.metadata];
    if (null !== t7) {
      const s4 = litPropertyMetadata.get(t7);
      if (void 0 !== s4) for (const [t8, i9] of s4) this.elementProperties.set(t8, i9);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t8, s4] of this.elementProperties) {
      const i9 = this._$Eu(t8, s4);
      void 0 !== i9 && this._$Eh.set(i9, t8);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i9 = [];
    if (Array.isArray(s4)) {
      const e12 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e12) i9.unshift(c4(s5));
    } else void 0 !== s4 && i9.push(c4(s4));
    return i9;
  }
  static _$Eu(t7, s4) {
    const i9 = s4.attribute;
    return false === i9 ? void 0 : "string" == typeof i9 ? i9 : "string" == typeof t7 ? t7.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise(((t7) => this.enableUpdating = t7)), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach(((t7) => t7(this)));
  }
  addController(t7) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t7), void 0 !== this.renderRoot && this.isConnected && t7.hostConnected?.();
  }
  removeController(t7) {
    this._$EO?.delete(t7);
  }
  _$E_() {
    const t7 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i9 of s4.keys()) this.hasOwnProperty(i9) && (t7.set(i9, this[i9]), delete this[i9]);
    t7.size > 0 && (this._$Ep = t7);
  }
  createRenderRoot() {
    const t7 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S3(t7, this.constructor.elementStyles), t7;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach(((t7) => t7.hostConnected?.()));
  }
  enableUpdating(t7) {
  }
  disconnectedCallback() {
    this._$EO?.forEach(((t7) => t7.hostDisconnected?.()));
  }
  attributeChangedCallback(t7, s4, i9) {
    this._$AK(t7, i9);
  }
  _$EC(t7, s4) {
    const i9 = this.constructor.elementProperties.get(t7), e12 = this.constructor._$Eu(t7, i9);
    if (void 0 !== e12 && true === i9.reflect) {
      const r11 = (void 0 !== i9.converter?.toAttribute ? i9.converter : u2).toAttribute(s4, i9.type);
      this._$Em = t7, null == r11 ? this.removeAttribute(e12) : this.setAttribute(e12, r11), this._$Em = null;
    }
  }
  _$AK(t7, s4) {
    const i9 = this.constructor, e12 = i9._$Eh.get(t7);
    if (void 0 !== e12 && this._$Em !== e12) {
      const t8 = i9.getPropertyOptions(e12), r11 = "function" == typeof t8.converter ? { fromAttribute: t8.converter } : void 0 !== t8.converter?.fromAttribute ? t8.converter : u2;
      this._$Em = e12, this[e12] = r11.fromAttribute(s4, t8.type), this._$Em = null;
    }
  }
  requestUpdate(t7, s4, i9) {
    if (void 0 !== t7) {
      if (i9 ??= this.constructor.getPropertyOptions(t7), !(i9.hasChanged ?? f4)(this[t7], s4)) return;
      this.P(t7, s4, i9);
    }
    false === this.isUpdatePending && (this._$ES = this._$ET());
  }
  P(t7, s4, i9) {
    this._$AL.has(t7) || this._$AL.set(t7, s4), true === i9.reflect && this._$Em !== t7 && (this._$Ej ??= /* @__PURE__ */ new Set()).add(t7);
  }
  async _$ET() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t8) {
      Promise.reject(t8);
    }
    const t7 = this.scheduleUpdate();
    return null != t7 && await t7, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t9, s5] of this._$Ep) this[t9] = s5;
        this._$Ep = void 0;
      }
      const t8 = this.constructor.elementProperties;
      if (t8.size > 0) for (const [s5, i9] of t8) true !== i9.wrapped || this._$AL.has(s5) || void 0 === this[s5] || this.P(s5, this[s5], i9);
    }
    let t7 = false;
    const s4 = this._$AL;
    try {
      t7 = this.shouldUpdate(s4), t7 ? (this.willUpdate(s4), this._$EO?.forEach(((t8) => t8.hostUpdate?.())), this.update(s4)) : this._$EU();
    } catch (s5) {
      throw t7 = false, this._$EU(), s5;
    }
    t7 && this._$AE(s4);
  }
  willUpdate(t7) {
  }
  _$AE(t7) {
    this._$EO?.forEach(((t8) => t8.hostUpdated?.())), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t7)), this.updated(t7);
  }
  _$EU() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t7) {
    return true;
  }
  update(t7) {
    this._$Ej &&= this._$Ej.forEach(((t8) => this._$EC(t8, this[t8]))), this._$EU();
  }
  updated(t7) {
  }
  firstUpdated(t7) {
  }
};
b2.elementStyles = [], b2.shadowRootOptions = { mode: "open" }, b2[d2("elementProperties")] = /* @__PURE__ */ new Map(), b2[d2("finalized")] = /* @__PURE__ */ new Map(), p2?.({ ReactiveElement: b2 }), (a2.reactiveElementVersions ??= []).push("2.0.4");

// node_modules/@lit/reactive-element/decorators/property.js
var o6 = { attribute: true, type: String, converter: u2, reflect: false, hasChanged: f4 };
var r6 = (t7 = o6, e12, r11) => {
  const { kind: n10, metadata: i9 } = r11;
  let s4 = globalThis.litPropertyMetadata.get(i9);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i9, s4 = /* @__PURE__ */ new Map()), s4.set(r11.name, t7), "accessor" === n10) {
    const { name: o12 } = r11;
    return { set(r12) {
      const n11 = e12.get.call(this);
      e12.set.call(this, r12), this.requestUpdate(o12, n11, t7);
    }, init(e13) {
      return void 0 !== e13 && this.P(o12, void 0, t7), e13;
    } };
  }
  if ("setter" === n10) {
    const { name: o12 } = r11;
    return function(r12) {
      const n11 = this[o12];
      e12.call(this, r12), this.requestUpdate(o12, n11, t7);
    };
  }
  throw Error("Unsupported decorator location: " + n10);
};
function n7(t7) {
  return (e12, o12) => "object" == typeof o12 ? r6(t7, e12, o12) : ((t8, e13, o13) => {
    const r11 = e13.hasOwnProperty(o13);
    return e13.constructor.createProperty(o13, r11 ? { ...t8, wrapped: true } : t8), r11 ? Object.getOwnPropertyDescriptor(e13, o13) : void 0;
  })(t7, e12, o12);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r7(r11) {
  return n7({ ...r11, state: true, attribute: false });
}

// node_modules/@lit/reactive-element/decorators/event-options.js
function t3(t7) {
  return (n10, o12) => {
    const c8 = "function" == typeof n10 ? n10 : n10[o12];
    Object.assign(c8, t7);
  };
}

// node_modules/@lit/reactive-element/decorators/base.js
var e5 = (e12, t7, c8) => (c8.configurable = true, c8.enumerable = true, Reflect.decorate && "object" != typeof t7 && Object.defineProperty(e12, t7, c8), c8);

// node_modules/@lit/reactive-element/decorators/query.js
function e6(e12, r11) {
  return (n10, s4, i9) => {
    const o12 = (t7) => t7.renderRoot?.querySelector(e12) ?? null;
    if (r11) {
      const { get: e13, set: r12 } = "object" == typeof s4 ? n10 : i9 ?? (() => {
        const t7 = Symbol();
        return { get() {
          return this[t7];
        }, set(e14) {
          this[t7] = e14;
        } };
      })();
      return e5(n10, s4, { get() {
        let t7 = e13.call(this);
        return void 0 === t7 && (t7 = o12(this), (null !== t7 || this.hasUpdated) && r12.call(this, t7)), t7;
      } });
    }
    return e5(n10, s4, { get() {
      return o12(this);
    } });
  };
}

// node_modules/lit-html/lit-html.js
var t4 = globalThis;
var i4 = t4.trustedTypes;
var s3 = i4 ? i4.createPolicy("lit-html", { createHTML: (t7) => t7 }) : void 0;
var e7 = "$lit$";
var h5 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var o7 = "?" + h5;
var n8 = `<${o7}>`;
var r8 = document;
var l3 = () => r8.createComment("");
var c6 = (t7) => null === t7 || "object" != typeof t7 && "function" != typeof t7;
var a3 = Array.isArray;
var u3 = (t7) => a3(t7) || "function" == typeof t7?.[Symbol.iterator];
var d3 = "[ 	\n\f\r]";
var f5 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var v2 = /-->/g;
var _2 = />/g;
var m2 = RegExp(`>|${d3}(?:([^\\s"'>=/]+)(${d3}*=${d3}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var p3 = /'/g;
var g2 = /"/g;
var $2 = /^(?:script|style|textarea|title)$/i;
var y3 = (t7) => (i9, ...s4) => ({ _$litType$: t7, strings: i9, values: s4 });
var x2 = y3(1);
var b3 = y3(2);
var w2 = y3(3);
var T2 = Symbol.for("lit-noChange");
var E2 = Symbol.for("lit-nothing");
var A = /* @__PURE__ */ new WeakMap();
var C = r8.createTreeWalker(r8, 129);
function P2(t7, i9) {
  if (!a3(t7) || !t7.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== s3 ? s3.createHTML(i9) : i9;
}
var V2 = (t7, i9) => {
  const s4 = t7.length - 1, o12 = [];
  let r11, l6 = 2 === i9 ? "<svg>" : 3 === i9 ? "<math>" : "", c8 = f5;
  for (let i10 = 0; i10 < s4; i10++) {
    const s5 = t7[i10];
    let a5, u6, d4 = -1, y4 = 0;
    for (; y4 < s5.length && (c8.lastIndex = y4, u6 = c8.exec(s5), null !== u6); ) y4 = c8.lastIndex, c8 === f5 ? "!--" === u6[1] ? c8 = v2 : void 0 !== u6[1] ? c8 = _2 : void 0 !== u6[2] ? ($2.test(u6[2]) && (r11 = RegExp("</" + u6[2], "g")), c8 = m2) : void 0 !== u6[3] && (c8 = m2) : c8 === m2 ? ">" === u6[0] ? (c8 = r11 ?? f5, d4 = -1) : void 0 === u6[1] ? d4 = -2 : (d4 = c8.lastIndex - u6[2].length, a5 = u6[1], c8 = void 0 === u6[3] ? m2 : '"' === u6[3] ? g2 : p3) : c8 === g2 || c8 === p3 ? c8 = m2 : c8 === v2 || c8 === _2 ? c8 = f5 : (c8 = m2, r11 = void 0);
    const x3 = c8 === m2 && t7[i10 + 1].startsWith("/>") ? " " : "";
    l6 += c8 === f5 ? s5 + n8 : d4 >= 0 ? (o12.push(a5), s5.slice(0, d4) + e7 + s5.slice(d4) + h5 + x3) : s5 + h5 + (-2 === d4 ? i10 : x3);
  }
  return [P2(t7, l6 + (t7[s4] || "<?>") + (2 === i9 ? "</svg>" : 3 === i9 ? "</math>" : "")), o12];
};
var N2 = class _N {
  constructor({ strings: t7, _$litType$: s4 }, n10) {
    let r11;
    this.parts = [];
    let c8 = 0, a5 = 0;
    const u6 = t7.length - 1, d4 = this.parts, [f7, v3] = V2(t7, s4);
    if (this.el = _N.createElement(f7, n10), C.currentNode = this.el.content, 2 === s4 || 3 === s4) {
      const t8 = this.el.content.firstChild;
      t8.replaceWith(...t8.childNodes);
    }
    for (; null !== (r11 = C.nextNode()) && d4.length < u6; ) {
      if (1 === r11.nodeType) {
        if (r11.hasAttributes()) for (const t8 of r11.getAttributeNames()) if (t8.endsWith(e7)) {
          const i9 = v3[a5++], s5 = r11.getAttribute(t8).split(h5), e12 = /([.?@])?(.*)/.exec(i9);
          d4.push({ type: 1, index: c8, name: e12[2], strings: s5, ctor: "." === e12[1] ? H : "?" === e12[1] ? I2 : "@" === e12[1] ? L : k2 }), r11.removeAttribute(t8);
        } else t8.startsWith(h5) && (d4.push({ type: 6, index: c8 }), r11.removeAttribute(t8));
        if ($2.test(r11.tagName)) {
          const t8 = r11.textContent.split(h5), s5 = t8.length - 1;
          if (s5 > 0) {
            r11.textContent = i4 ? i4.emptyScript : "";
            for (let i9 = 0; i9 < s5; i9++) r11.append(t8[i9], l3()), C.nextNode(), d4.push({ type: 2, index: ++c8 });
            r11.append(t8[s5], l3());
          }
        }
      } else if (8 === r11.nodeType) if (r11.data === o7) d4.push({ type: 2, index: c8 });
      else {
        let t8 = -1;
        for (; -1 !== (t8 = r11.data.indexOf(h5, t8 + 1)); ) d4.push({ type: 7, index: c8 }), t8 += h5.length - 1;
      }
      c8++;
    }
  }
  static createElement(t7, i9) {
    const s4 = r8.createElement("template");
    return s4.innerHTML = t7, s4;
  }
};
function S4(t7, i9, s4 = t7, e12) {
  if (i9 === T2) return i9;
  let h6 = void 0 !== e12 ? s4._$Co?.[e12] : s4._$Cl;
  const o12 = c6(i9) ? void 0 : i9._$litDirective$;
  return h6?.constructor !== o12 && (h6?._$AO?.(false), void 0 === o12 ? h6 = void 0 : (h6 = new o12(t7), h6._$AT(t7, s4, e12)), void 0 !== e12 ? (s4._$Co ??= [])[e12] = h6 : s4._$Cl = h6), void 0 !== h6 && (i9 = S4(t7, h6._$AS(t7, i9.values), h6, e12)), i9;
}
var M2 = class {
  constructor(t7, i9) {
    this._$AV = [], this._$AN = void 0, this._$AD = t7, this._$AM = i9;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t7) {
    const { el: { content: i9 }, parts: s4 } = this._$AD, e12 = (t7?.creationScope ?? r8).importNode(i9, true);
    C.currentNode = e12;
    let h6 = C.nextNode(), o12 = 0, n10 = 0, l6 = s4[0];
    for (; void 0 !== l6; ) {
      if (o12 === l6.index) {
        let i10;
        2 === l6.type ? i10 = new R2(h6, h6.nextSibling, this, t7) : 1 === l6.type ? i10 = new l6.ctor(h6, l6.name, l6.strings, this, t7) : 6 === l6.type && (i10 = new z2(h6, this, t7)), this._$AV.push(i10), l6 = s4[++n10];
      }
      o12 !== l6?.index && (h6 = C.nextNode(), o12++);
    }
    return C.currentNode = r8, e12;
  }
  p(t7) {
    let i9 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t7, s4, i9), i9 += s4.strings.length - 2) : s4._$AI(t7[i9])), i9++;
  }
};
var R2 = class _R {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t7, i9, s4, e12) {
    this.type = 2, this._$AH = E2, this._$AN = void 0, this._$AA = t7, this._$AB = i9, this._$AM = s4, this.options = e12, this._$Cv = e12?.isConnected ?? true;
  }
  get parentNode() {
    let t7 = this._$AA.parentNode;
    const i9 = this._$AM;
    return void 0 !== i9 && 11 === t7?.nodeType && (t7 = i9.parentNode), t7;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t7, i9 = this) {
    t7 = S4(this, t7, i9), c6(t7) ? t7 === E2 || null == t7 || "" === t7 ? (this._$AH !== E2 && this._$AR(), this._$AH = E2) : t7 !== this._$AH && t7 !== T2 && this._(t7) : void 0 !== t7._$litType$ ? this.$(t7) : void 0 !== t7.nodeType ? this.T(t7) : u3(t7) ? this.k(t7) : this._(t7);
  }
  O(t7) {
    return this._$AA.parentNode.insertBefore(t7, this._$AB);
  }
  T(t7) {
    this._$AH !== t7 && (this._$AR(), this._$AH = this.O(t7));
  }
  _(t7) {
    this._$AH !== E2 && c6(this._$AH) ? this._$AA.nextSibling.data = t7 : this.T(r8.createTextNode(t7)), this._$AH = t7;
  }
  $(t7) {
    const { values: i9, _$litType$: s4 } = t7, e12 = "number" == typeof s4 ? this._$AC(t7) : (void 0 === s4.el && (s4.el = N2.createElement(P2(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e12) this._$AH.p(i9);
    else {
      const t8 = new M2(e12, this), s5 = t8.u(this.options);
      t8.p(i9), this.T(s5), this._$AH = t8;
    }
  }
  _$AC(t7) {
    let i9 = A.get(t7.strings);
    return void 0 === i9 && A.set(t7.strings, i9 = new N2(t7)), i9;
  }
  k(t7) {
    a3(this._$AH) || (this._$AH = [], this._$AR());
    const i9 = this._$AH;
    let s4, e12 = 0;
    for (const h6 of t7) e12 === i9.length ? i9.push(s4 = new _R(this.O(l3()), this.O(l3()), this, this.options)) : s4 = i9[e12], s4._$AI(h6), e12++;
    e12 < i9.length && (this._$AR(s4 && s4._$AB.nextSibling, e12), i9.length = e12);
  }
  _$AR(t7 = this._$AA.nextSibling, i9) {
    for (this._$AP?.(false, true, i9); t7 && t7 !== this._$AB; ) {
      const i10 = t7.nextSibling;
      t7.remove(), t7 = i10;
    }
  }
  setConnected(t7) {
    void 0 === this._$AM && (this._$Cv = t7, this._$AP?.(t7));
  }
};
var k2 = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t7, i9, s4, e12, h6) {
    this.type = 1, this._$AH = E2, this._$AN = void 0, this.element = t7, this.name = i9, this._$AM = e12, this.options = h6, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = E2;
  }
  _$AI(t7, i9 = this, s4, e12) {
    const h6 = this.strings;
    let o12 = false;
    if (void 0 === h6) t7 = S4(this, t7, i9, 0), o12 = !c6(t7) || t7 !== this._$AH && t7 !== T2, o12 && (this._$AH = t7);
    else {
      const e13 = t7;
      let n10, r11;
      for (t7 = h6[0], n10 = 0; n10 < h6.length - 1; n10++) r11 = S4(this, e13[s4 + n10], i9, n10), r11 === T2 && (r11 = this._$AH[n10]), o12 ||= !c6(r11) || r11 !== this._$AH[n10], r11 === E2 ? t7 = E2 : t7 !== E2 && (t7 += (r11 ?? "") + h6[n10 + 1]), this._$AH[n10] = r11;
    }
    o12 && !e12 && this.j(t7);
  }
  j(t7) {
    t7 === E2 ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t7 ?? "");
  }
};
var H = class extends k2 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t7) {
    this.element[this.name] = t7 === E2 ? void 0 : t7;
  }
};
var I2 = class extends k2 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t7) {
    this.element.toggleAttribute(this.name, !!t7 && t7 !== E2);
  }
};
var L = class extends k2 {
  constructor(t7, i9, s4, e12, h6) {
    super(t7, i9, s4, e12, h6), this.type = 5;
  }
  _$AI(t7, i9 = this) {
    if ((t7 = S4(this, t7, i9, 0) ?? E2) === T2) return;
    const s4 = this._$AH, e12 = t7 === E2 && s4 !== E2 || t7.capture !== s4.capture || t7.once !== s4.once || t7.passive !== s4.passive, h6 = t7 !== E2 && (s4 === E2 || e12);
    e12 && this.element.removeEventListener(this.name, this, s4), h6 && this.element.addEventListener(this.name, this, t7), this._$AH = t7;
  }
  handleEvent(t7) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t7) : this._$AH.handleEvent(t7);
  }
};
var z2 = class {
  constructor(t7, i9, s4) {
    this.element = t7, this.type = 6, this._$AN = void 0, this._$AM = i9, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t7) {
    S4(this, t7);
  }
};
var Z2 = { M: e7, P: h5, A: o7, C: 1, L: V2, R: M2, D: u3, V: S4, I: R2, H: k2, N: I2, U: L, B: H, F: z2 };
var j2 = t4.litHtmlPolyfillSupport;
j2?.(N2, R2), (t4.litHtmlVersions ??= []).push("3.2.1");
var B2 = (t7, i9, s4) => {
  const e12 = s4?.renderBefore ?? i9;
  let h6 = e12._$litPart$;
  if (void 0 === h6) {
    const t8 = s4?.renderBefore ?? null;
    e12._$litPart$ = h6 = new R2(i9.insertBefore(l3(), t8), t8, void 0, s4 ?? {});
  }
  return h6._$AI(t7), h6;
};

// node_modules/lit-element/lit-element.js
var r9 = class extends b2 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t7 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t7.firstChild, t7;
  }
  update(t7) {
    const s4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t7), this._$Do = B2(s4, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return T2;
  }
};
r9._$litElement$ = true, r9["finalized"] = true, globalThis.litElementHydrateSupport?.({ LitElement: r9 });
var i5 = globalThis.litElementPolyfillSupport;
i5?.({ LitElement: r9 });
(globalThis.litElementVersions ??= []).push("4.1.1");

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.WQC6OWUE.js
var badge_styles_default = i`
  :host {
    display: inline-flex;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: max(12px, 0.75em);
    font-weight: var(--sl-font-weight-semibold);
    letter-spacing: var(--sl-letter-spacing-normal);
    line-height: 1;
    border-radius: var(--sl-border-radius-small);
    border: solid 1px var(--sl-color-neutral-0);
    white-space: nowrap;
    padding: 0.35em 0.6em;
    user-select: none;
    -webkit-user-select: none;
    cursor: inherit;
  }

  /* Variant modifiers */
  .badge--primary {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .badge--success {
    background-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .badge--neutral {
    background-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .badge--warning {
    background-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  .badge--danger {
    background-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  /* Pill modifier */
  .badge--pill {
    border-radius: var(--sl-border-radius-pill);
  }

  /* Pulse modifier */
  .badge--pulse {
    animation: pulse 1.5s infinite;
  }

  .badge--pulse.badge--primary {
    --pulse-color: var(--sl-color-primary-600);
  }

  .badge--pulse.badge--success {
    --pulse-color: var(--sl-color-success-600);
  }

  .badge--pulse.badge--neutral {
    --pulse-color: var(--sl-color-neutral-600);
  }

  .badge--pulse.badge--warning {
    --pulse-color: var(--sl-color-warning-600);
  }

  .badge--pulse.badge--danger {
    --pulse-color: var(--sl-color-danger-600);
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 var(--pulse-color);
    }
    70% {
      box-shadow: 0 0 0 0.5rem transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.TUVJKY7S.js
var component_styles_default = i`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden] {
    display: none !important;
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.KAW7D32O.js
var __defProp3 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc3 = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __knownSymbol3 = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError3 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a5, b4) => {
  for (var prop in b4 || (b4 = {}))
    if (__hasOwnProp.call(b4, prop))
      __defNormalProp3(a5, prop, b4[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b4)) {
      if (__propIsEnum.call(b4, prop))
        __defNormalProp3(a5, prop, b4[prop]);
    }
  return a5;
};
var __spreadProps = (a5, b4) => __defProps(a5, __getOwnPropDescs(b4));
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc3(target, key) : target;
  for (var i9 = decorators.length - 1, decorator; i9 >= 0; i9--)
    if (decorator = decorators[i9])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp3(target, key, result);
  return result;
};
var __accessCheck3 = (obj, member, msg) => member.has(obj) || __typeError3("Cannot " + msg);
var __privateGet3 = (obj, member, getter) => (__accessCheck3(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd3 = (obj, member, value) => member.has(obj) ? __typeError3("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet3 = (obj, member, value, setter) => (__accessCheck3(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __await = function(promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __yieldStar = (value) => {
  var obj = value[__knownSymbol3("asyncIterator")], isAwait = false, method, it = {};
  if (obj == null) {
    obj = value[__knownSymbol3("iterator")]();
    method = (k3) => it[k3] = (x3) => obj[k3](x3);
  } else {
    obj = obj.call(value);
    method = (k3) => it[k3] = (v3) => {
      if (isAwait) {
        isAwait = false;
        if (k3 === "throw") throw v3;
        return v3;
      }
      isAwait = true;
      return {
        done: false,
        value: new __await(new Promise((resolve) => {
          var x3 = obj[k3](v3);
          if (!(x3 instanceof Object)) __typeError3("Object expected");
          resolve(x3);
        }), 1)
      };
    };
  }
  return it[__knownSymbol3("iterator")] = () => it, method("next"), "throw" in obj ? method("throw") : it.throw = (x3) => {
    throw x3;
  }, "return" in obj && method("return"), it;
};

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.EMG3ZSPT.js
var _hasRecordedInitialProperties;
var ShoelaceElement = class extends r9 {
  constructor() {
    super();
    __privateAdd3(this, _hasRecordedInitialProperties, false);
    this.initialReflectedProperties = /* @__PURE__ */ new Map();
    Object.entries(this.constructor.dependencies).forEach(([name, component]) => {
      this.constructor.define(name, component);
    });
  }
  emit(name, options) {
    const event = new CustomEvent(name, __spreadValues({
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {}
    }, options));
    this.dispatchEvent(event);
    return event;
  }
  /* eslint-enable */
  static define(name, elementConstructor = this, options = {}) {
    const currentlyRegisteredConstructor = customElements.get(name);
    if (!currentlyRegisteredConstructor) {
      try {
        customElements.define(name, elementConstructor, options);
      } catch (_err) {
        customElements.define(name, class extends elementConstructor {
        }, options);
      }
      return;
    }
    let newVersion = " (unknown version)";
    let existingVersion = newVersion;
    if ("version" in elementConstructor && elementConstructor.version) {
      newVersion = " v" + elementConstructor.version;
    }
    if ("version" in currentlyRegisteredConstructor && currentlyRegisteredConstructor.version) {
      existingVersion = " v" + currentlyRegisteredConstructor.version;
    }
    if (newVersion && existingVersion && newVersion === existingVersion) {
      return;
    }
    console.warn(
      `Attempted to register <${name}>${newVersion}, but <${name}>${existingVersion} has already been registered.`
    );
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (!__privateGet3(this, _hasRecordedInitialProperties)) {
      this.constructor.elementProperties.forEach(
        (obj, prop) => {
          if (obj.reflect && this[prop] != null) {
            this.initialReflectedProperties.set(prop, this[prop]);
          }
        }
      );
      __privateSet3(this, _hasRecordedInitialProperties, true);
    }
    super.attributeChangedCallback(name, oldValue, newValue);
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    this.initialReflectedProperties.forEach((value, prop) => {
      if (changedProperties.has(prop) && this[prop] == null) {
        this[prop] = value;
      }
    });
  }
};
_hasRecordedInitialProperties = /* @__PURE__ */ new WeakMap();
ShoelaceElement.version = "2.19.1";
ShoelaceElement.dependencies = {};
__decorateClass([
  n7()
], ShoelaceElement.prototype, "dir", 2);
__decorateClass([
  n7()
], ShoelaceElement.prototype, "lang", 2);

// node_modules/lit-html/directive.js
var t5 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e8 = (t7) => (...e12) => ({ _$litDirective$: t7, values: e12 });
var i6 = class {
  constructor(t7) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t7, e12, i9) {
    this._$Ct = t7, this._$AM = e12, this._$Ci = i9;
  }
  _$AS(t7, e12) {
    return this.update(t7, e12);
  }
  update(t7, e12) {
    return this.render(...e12);
  }
};

// node_modules/lit-html/directives/class-map.js
var e9 = e8(class extends i6 {
  constructor(t7) {
    if (super(t7), t7.type !== t5.ATTRIBUTE || "class" !== t7.name || t7.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t7) {
    return " " + Object.keys(t7).filter(((s4) => t7[s4])).join(" ") + " ";
  }
  update(s4, [i9]) {
    if (void 0 === this.st) {
      this.st = /* @__PURE__ */ new Set(), void 0 !== s4.strings && (this.nt = new Set(s4.strings.join(" ").split(/\s/).filter(((t7) => "" !== t7))));
      for (const t7 in i9) i9[t7] && !this.nt?.has(t7) && this.st.add(t7);
      return this.render(i9);
    }
    const r11 = s4.element.classList;
    for (const t7 of this.st) t7 in i9 || (r11.remove(t7), this.st.delete(t7));
    for (const t7 in i9) {
      const s5 = !!i9[t7];
      s5 === this.st.has(t7) || this.nt?.has(t7) || (s5 ? (r11.add(t7), this.st.add(t7)) : (r11.remove(t7), this.st.delete(t7)));
    }
    return T2;
  }
});

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.XUX6RZ47.js
var SlBadge = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.variant = "primary";
    this.pill = false;
    this.pulse = false;
  }
  render() {
    return x2`
      <span
        part="base"
        class=${e9({
      badge: true,
      "badge--primary": this.variant === "primary",
      "badge--success": this.variant === "success",
      "badge--neutral": this.variant === "neutral",
      "badge--warning": this.variant === "warning",
      "badge--danger": this.variant === "danger",
      "badge--pill": this.pill,
      "badge--pulse": this.pulse
    })}
        role="status"
      >
        <slot></slot>
      </span>
    `;
  }
};
SlBadge.styles = [component_styles_default, badge_styles_default];
__decorateClass([
  n7({ reflect: true })
], SlBadge.prototype, "variant", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlBadge.prototype, "pill", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlBadge.prototype, "pulse", 2);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.7DUCI5S4.js
var spinner_styles_default = i`
  :host {
    --track-width: 2px;
    --track-color: rgb(128 128 128 / 25%);
    --indicator-color: var(--sl-color-primary-600);
    --speed: 2s;

    display: inline-flex;
    width: 1em;
    height: 1em;
    flex: none;
  }

  .spinner {
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
  }

  .spinner__track,
  .spinner__indicator {
    fill: none;
    stroke-width: var(--track-width);
    r: calc(0.5em - var(--track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
    transform-origin: 50% 50%;
  }

  .spinner__track {
    stroke: var(--track-color);
    transform-origin: 0% 0%;
  }

  .spinner__indicator {
    stroke: var(--indicator-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    animation: spin var(--speed) linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      stroke-dasharray: 0.05em, 3em;
    }

    50% {
      transform: rotate(450deg);
      stroke-dasharray: 1.375em, 1.375em;
    }

    100% {
      transform: rotate(1080deg);
      stroke-dasharray: 0.05em, 3em;
    }
  }
`;

// node_modules/@shoelace-style/localize/dist/index.js
var connectedElements = /* @__PURE__ */ new Set();
var translations = /* @__PURE__ */ new Map();
var fallback;
var documentDirection = "ltr";
var documentLanguage = "en";
var isClient = typeof MutationObserver !== "undefined" && typeof document !== "undefined" && typeof document.documentElement !== "undefined";
if (isClient) {
  const documentElementObserver = new MutationObserver(update);
  documentDirection = document.documentElement.dir || "ltr";
  documentLanguage = document.documentElement.lang || navigator.language;
  documentElementObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dir", "lang"]
  });
}
function registerTranslation(...translation2) {
  translation2.map((t7) => {
    const code = t7.$code.toLowerCase();
    if (translations.has(code)) {
      translations.set(code, Object.assign(Object.assign({}, translations.get(code)), t7));
    } else {
      translations.set(code, t7);
    }
    if (!fallback) {
      fallback = t7;
    }
  });
  update();
}
function update() {
  if (isClient) {
    documentDirection = document.documentElement.dir || "ltr";
    documentLanguage = document.documentElement.lang || navigator.language;
  }
  [...connectedElements.keys()].map((el) => {
    if (typeof el.requestUpdate === "function") {
      el.requestUpdate();
    }
  });
}
var LocalizeController = class {
  constructor(host) {
    this.host = host;
    this.host.addController(this);
  }
  hostConnected() {
    connectedElements.add(this.host);
  }
  hostDisconnected() {
    connectedElements.delete(this.host);
  }
  dir() {
    return `${this.host.dir || documentDirection}`.toLowerCase();
  }
  lang() {
    return `${this.host.lang || documentLanguage}`.toLowerCase();
  }
  getTranslationData(lang) {
    var _a3, _b;
    const locale = new Intl.Locale(lang.replace(/_/g, "-"));
    const language = locale === null || locale === void 0 ? void 0 : locale.language.toLowerCase();
    const region = (_b = (_a3 = locale === null || locale === void 0 ? void 0 : locale.region) === null || _a3 === void 0 ? void 0 : _a3.toLowerCase()) !== null && _b !== void 0 ? _b : "";
    const primary = translations.get(`${language}-${region}`);
    const secondary = translations.get(language);
    return { locale, language, region, primary, secondary };
  }
  exists(key, options) {
    var _a3;
    const { primary, secondary } = this.getTranslationData((_a3 = options.lang) !== null && _a3 !== void 0 ? _a3 : this.lang());
    options = Object.assign({ includeFallback: false }, options);
    if (primary && primary[key] || secondary && secondary[key] || options.includeFallback && fallback && fallback[key]) {
      return true;
    }
    return false;
  }
  term(key, ...args) {
    const { primary, secondary } = this.getTranslationData(this.lang());
    let term;
    if (primary && primary[key]) {
      term = primary[key];
    } else if (secondary && secondary[key]) {
      term = secondary[key];
    } else if (fallback && fallback[key]) {
      term = fallback[key];
    } else {
      console.error(`No translation found for: ${String(key)}`);
      return String(key);
    }
    if (typeof term === "function") {
      return term(...args);
    }
    return term;
  }
  date(dateToFormat, options) {
    dateToFormat = new Date(dateToFormat);
    return new Intl.DateTimeFormat(this.lang(), options).format(dateToFormat);
  }
  number(numberToFormat, options) {
    numberToFormat = Number(numberToFormat);
    return isNaN(numberToFormat) ? "" : new Intl.NumberFormat(this.lang(), options).format(numberToFormat);
  }
  relativeTime(value, unit, options) {
    return new Intl.RelativeTimeFormat(this.lang(), options).format(value, unit);
  }
};

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.7BTDLTNI.js
var translation = {
  $code: "en",
  $name: "English",
  $dir: "ltr",
  carousel: "Carousel",
  clearEntry: "Clear entry",
  close: "Close",
  copied: "Copied",
  copy: "Copy",
  currentValue: "Current value",
  error: "Error",
  goToSlide: (slide, count) => `Go to slide ${slide} of ${count}`,
  hidePassword: "Hide password",
  loading: "Loading",
  nextSlide: "Next slide",
  numOptionsSelected: (num) => {
    if (num === 0) return "No options selected";
    if (num === 1) return "1 option selected";
    return `${num} options selected`;
  },
  previousSlide: "Previous slide",
  progress: "Progress",
  remove: "Remove",
  resize: "Resize",
  scrollToEnd: "Scroll to end",
  scrollToStart: "Scroll to start",
  selectAColorFromTheScreen: "Select a color from the screen",
  showPassword: "Show password",
  slideNum: (slide) => `Slide ${slide}`,
  toggleColorFormat: "Toggle color format"
};
registerTranslation(translation);
var en_default = translation;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.6CTB5ZDJ.js
var LocalizeController2 = class extends LocalizeController {
};
registerTranslation(en_default);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.YB3JVLEN.js
var SlSpinner = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController2(this);
  }
  render() {
    return x2`
      <svg part="base" class="spinner" role="progressbar" aria-label=${this.localize.term("loading")}>
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `;
  }
};
SlSpinner.styles = [component_styles_default, spinner_styles_default];

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.3RPBFEDE.js
var formCollections = /* @__PURE__ */ new WeakMap();
var reportValidityOverloads = /* @__PURE__ */ new WeakMap();
var checkValidityOverloads = /* @__PURE__ */ new WeakMap();
var userInteractedControls = /* @__PURE__ */ new WeakSet();
var interactions = /* @__PURE__ */ new WeakMap();
var FormControlController = class {
  constructor(host, options) {
    this.handleFormData = (event) => {
      const disabled = this.options.disabled(this.host);
      const name = this.options.name(this.host);
      const value = this.options.value(this.host);
      const isButton = this.host.tagName.toLowerCase() === "sl-button";
      if (this.host.isConnected && !disabled && !isButton && typeof name === "string" && name.length > 0 && typeof value !== "undefined") {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            event.formData.append(name, val.toString());
          });
        } else {
          event.formData.append(name, value.toString());
        }
      }
    };
    this.handleFormSubmit = (event) => {
      var _a3;
      const disabled = this.options.disabled(this.host);
      const reportValidity = this.options.reportValidity;
      if (this.form && !this.form.noValidate) {
        (_a3 = formCollections.get(this.form)) == null ? void 0 : _a3.forEach((control) => {
          this.setUserInteracted(control, true);
        });
      }
      if (this.form && !this.form.noValidate && !disabled && !reportValidity(this.host)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    this.handleFormReset = () => {
      this.options.setValue(this.host, this.options.defaultValue(this.host));
      this.setUserInteracted(this.host, false);
      interactions.set(this.host, []);
    };
    this.handleInteraction = (event) => {
      const emittedEvents = interactions.get(this.host);
      if (!emittedEvents.includes(event.type)) {
        emittedEvents.push(event.type);
      }
      if (emittedEvents.length === this.options.assumeInteractionOn.length) {
        this.setUserInteracted(this.host, true);
      }
    };
    this.checkFormValidity = () => {
      if (this.form && !this.form.noValidate) {
        const elements = this.form.querySelectorAll("*");
        for (const element of elements) {
          if (typeof element.checkValidity === "function") {
            if (!element.checkValidity()) {
              return false;
            }
          }
        }
      }
      return true;
    };
    this.reportFormValidity = () => {
      if (this.form && !this.form.noValidate) {
        const elements = this.form.querySelectorAll("*");
        for (const element of elements) {
          if (typeof element.reportValidity === "function") {
            if (!element.reportValidity()) {
              return false;
            }
          }
        }
      }
      return true;
    };
    (this.host = host).addController(this);
    this.options = __spreadValues({
      form: (input) => {
        const formId = input.form;
        if (formId) {
          const root = input.getRootNode();
          const form = root.querySelector(`#${formId}`);
          if (form) {
            return form;
          }
        }
        return input.closest("form");
      },
      name: (input) => input.name,
      value: (input) => input.value,
      defaultValue: (input) => input.defaultValue,
      disabled: (input) => {
        var _a3;
        return (_a3 = input.disabled) != null ? _a3 : false;
      },
      reportValidity: (input) => typeof input.reportValidity === "function" ? input.reportValidity() : true,
      checkValidity: (input) => typeof input.checkValidity === "function" ? input.checkValidity() : true,
      setValue: (input, value) => input.value = value,
      assumeInteractionOn: ["sl-input"]
    }, options);
  }
  hostConnected() {
    const form = this.options.form(this.host);
    if (form) {
      this.attachForm(form);
    }
    interactions.set(this.host, []);
    this.options.assumeInteractionOn.forEach((event) => {
      this.host.addEventListener(event, this.handleInteraction);
    });
  }
  hostDisconnected() {
    this.detachForm();
    interactions.delete(this.host);
    this.options.assumeInteractionOn.forEach((event) => {
      this.host.removeEventListener(event, this.handleInteraction);
    });
  }
  hostUpdated() {
    const form = this.options.form(this.host);
    if (!form) {
      this.detachForm();
    }
    if (form && this.form !== form) {
      this.detachForm();
      this.attachForm(form);
    }
    if (this.host.hasUpdated) {
      this.setValidity(this.host.validity.valid);
    }
  }
  attachForm(form) {
    if (form) {
      this.form = form;
      if (formCollections.has(this.form)) {
        formCollections.get(this.form).add(this.host);
      } else {
        formCollections.set(this.form, /* @__PURE__ */ new Set([this.host]));
      }
      this.form.addEventListener("formdata", this.handleFormData);
      this.form.addEventListener("submit", this.handleFormSubmit);
      this.form.addEventListener("reset", this.handleFormReset);
      if (!reportValidityOverloads.has(this.form)) {
        reportValidityOverloads.set(this.form, this.form.reportValidity);
        this.form.reportValidity = () => this.reportFormValidity();
      }
      if (!checkValidityOverloads.has(this.form)) {
        checkValidityOverloads.set(this.form, this.form.checkValidity);
        this.form.checkValidity = () => this.checkFormValidity();
      }
    } else {
      this.form = void 0;
    }
  }
  detachForm() {
    if (!this.form) return;
    const formCollection = formCollections.get(this.form);
    if (!formCollection) {
      return;
    }
    formCollection.delete(this.host);
    if (formCollection.size <= 0) {
      this.form.removeEventListener("formdata", this.handleFormData);
      this.form.removeEventListener("submit", this.handleFormSubmit);
      this.form.removeEventListener("reset", this.handleFormReset);
      if (reportValidityOverloads.has(this.form)) {
        this.form.reportValidity = reportValidityOverloads.get(this.form);
        reportValidityOverloads.delete(this.form);
      }
      if (checkValidityOverloads.has(this.form)) {
        this.form.checkValidity = checkValidityOverloads.get(this.form);
        checkValidityOverloads.delete(this.form);
      }
      this.form = void 0;
    }
  }
  setUserInteracted(el, hasInteracted) {
    if (hasInteracted) {
      userInteractedControls.add(el);
    } else {
      userInteractedControls.delete(el);
    }
    el.requestUpdate();
  }
  doAction(type, submitter) {
    if (this.form) {
      const button = document.createElement("button");
      button.type = type;
      button.style.position = "absolute";
      button.style.width = "0";
      button.style.height = "0";
      button.style.clipPath = "inset(50%)";
      button.style.overflow = "hidden";
      button.style.whiteSpace = "nowrap";
      if (submitter) {
        button.name = submitter.name;
        button.value = submitter.value;
        ["formaction", "formenctype", "formmethod", "formnovalidate", "formtarget"].forEach((attr) => {
          if (submitter.hasAttribute(attr)) {
            button.setAttribute(attr, submitter.getAttribute(attr));
          }
        });
      }
      this.form.append(button);
      button.click();
      button.remove();
    }
  }
  /** Returns the associated `<form>` element, if one exists. */
  getForm() {
    var _a3;
    return (_a3 = this.form) != null ? _a3 : null;
  }
  /** Resets the form, restoring all the control to their default value */
  reset(submitter) {
    this.doAction("reset", submitter);
  }
  /** Submits the form, triggering validation and form data injection. */
  submit(submitter) {
    this.doAction("submit", submitter);
  }
  /**
   * Synchronously sets the form control's validity. Call this when you know the future validity but need to update
   * the host element immediately, i.e. before Lit updates the component in the next update.
   */
  setValidity(isValid) {
    const host = this.host;
    const hasInteracted = Boolean(userInteractedControls.has(host));
    const required = Boolean(host.required);
    host.toggleAttribute("data-required", required);
    host.toggleAttribute("data-optional", !required);
    host.toggleAttribute("data-invalid", !isValid);
    host.toggleAttribute("data-valid", isValid);
    host.toggleAttribute("data-user-invalid", !isValid && hasInteracted);
    host.toggleAttribute("data-user-valid", isValid && hasInteracted);
  }
  /**
   * Updates the form control's validity based on the current value of `host.validity.valid`. Call this when anything
   * that affects constraint validation changes so the component receives the correct validity states.
   */
  updateValidity() {
    const host = this.host;
    this.setValidity(host.validity.valid);
  }
  /**
   * Dispatches a non-bubbling, cancelable custom event of type `sl-invalid`.
   * If the `sl-invalid` event will be cancelled then the original `invalid`
   * event (which may have been passed as argument) will also be cancelled.
   * If no original `invalid` event has been passed then the `sl-invalid`
   * event will be cancelled before being dispatched.
   */
  emitInvalidEvent(originalInvalidEvent) {
    const slInvalidEvent = new CustomEvent("sl-invalid", {
      bubbles: false,
      composed: false,
      cancelable: true,
      detail: {}
    });
    if (!originalInvalidEvent) {
      slInvalidEvent.preventDefault();
    }
    if (!this.host.dispatchEvent(slInvalidEvent)) {
      originalInvalidEvent == null ? void 0 : originalInvalidEvent.preventDefault();
    }
  }
};
var validValidityState = Object.freeze({
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: true,
  valueMissing: false
});
var valueMissingValidityState = Object.freeze(__spreadProps(__spreadValues({}, validValidityState), {
  valid: false,
  valueMissing: true
}));
var customErrorValidityState = Object.freeze(__spreadProps(__spreadValues({}, validValidityState), {
  valid: false,
  customError: true
}));

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.MAQXLKQ7.js
var button_styles_default = i`
  :host {
    display: inline-block;
    position: relative;
    width: auto;
    cursor: pointer;
  }

  .button {
    display: inline-flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    border-style: solid;
    border-width: var(--sl-input-border-width);
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-font-weight-semibold);
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    padding: 0;
    transition:
      var(--sl-transition-x-fast) background-color,
      var(--sl-transition-x-fast) color,
      var(--sl-transition-x-fast) border,
      var(--sl-transition-x-fast) box-shadow;
    cursor: inherit;
  }

  .button::-moz-focus-inner {
    border: 0;
  }

  .button:focus {
    outline: none;
  }

  .button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* When disabled, prevent mouse events from bubbling up from children */
  .button--disabled * {
    pointer-events: none;
  }

  .button__prefix,
  .button__suffix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .button__label {
    display: inline-block;
  }

  .button__label::slotted(sl-icon) {
    vertical-align: -2px;
  }

  /*
   * Standard buttons
   */

  /* Default */
  .button--standard.button--default {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-input-border-color);
    color: var(--sl-color-neutral-700);
  }

  .button--standard.button--default:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-300);
    color: var(--sl-color-primary-700);
  }

  .button--standard.button--default:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-100);
    border-color: var(--sl-color-primary-400);
    color: var(--sl-color-primary-700);
  }

  /* Primary */
  .button--standard.button--primary {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--standard.button--success {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:hover:not(.button--disabled) {
    background-color: var(--sl-color-success-500);
    border-color: var(--sl-color-success-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:active:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--standard.button--neutral {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:hover:not(.button--disabled) {
    background-color: var(--sl-color-neutral-500);
    border-color: var(--sl-color-neutral-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:active:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--standard.button--warning {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }
  .button--standard.button--warning:hover:not(.button--disabled) {
    background-color: var(--sl-color-warning-500);
    border-color: var(--sl-color-warning-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--warning:active:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--standard.button--danger {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:hover:not(.button--disabled) {
    background-color: var(--sl-color-danger-500);
    border-color: var(--sl-color-danger-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:active:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  /*
   * Outline buttons
   */

  .button--outline {
    background: none;
    border: solid 1px;
  }

  /* Default */
  .button--outline.button--default {
    border-color: var(--sl-input-border-color);
    color: var(--sl-color-neutral-700);
  }

  .button--outline.button--default:hover:not(.button--disabled),
  .button--outline.button--default.button--checked:not(.button--disabled) {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--default:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Primary */
  .button--outline.button--primary {
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-primary-600);
  }

  .button--outline.button--primary:hover:not(.button--disabled),
  .button--outline.button--primary.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--primary:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--outline.button--success {
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-success-600);
  }

  .button--outline.button--success:hover:not(.button--disabled),
  .button--outline.button--success.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--success:active:not(.button--disabled) {
    border-color: var(--sl-color-success-700);
    background-color: var(--sl-color-success-700);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--outline.button--neutral {
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-600);
  }

  .button--outline.button--neutral:hover:not(.button--disabled),
  .button--outline.button--neutral.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--neutral:active:not(.button--disabled) {
    border-color: var(--sl-color-neutral-700);
    background-color: var(--sl-color-neutral-700);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--outline.button--warning {
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-warning-600);
  }

  .button--outline.button--warning:hover:not(.button--disabled),
  .button--outline.button--warning.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--warning:active:not(.button--disabled) {
    border-color: var(--sl-color-warning-700);
    background-color: var(--sl-color-warning-700);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--outline.button--danger {
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-danger-600);
  }

  .button--outline.button--danger:hover:not(.button--disabled),
  .button--outline.button--danger.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--danger:active:not(.button--disabled) {
    border-color: var(--sl-color-danger-700);
    background-color: var(--sl-color-danger-700);
    color: var(--sl-color-neutral-0);
  }

  @media (forced-colors: active) {
    .button.button--outline.button--checked:not(.button--disabled) {
      outline: solid 2px transparent;
    }
  }

  /*
   * Text buttons
   */

  .button--text {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-600);
  }

  .button--text:hover:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:focus-visible:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:active:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-700);
  }

  /*
   * Size modifiers
   */

  .button--small {
    height: auto;
    min-height: var(--sl-input-height-small);
    font-size: var(--sl-button-font-size-small);
    line-height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-small);
  }

  .button--medium {
    height: auto;
    min-height: var(--sl-input-height-medium);
    font-size: var(--sl-button-font-size-medium);
    line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-medium);
  }

  .button--large {
    height: auto;
    min-height: var(--sl-input-height-large);
    font-size: var(--sl-button-font-size-large);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
  }

  /*
   * Pill modifier
   */

  .button--pill.button--small {
    border-radius: var(--sl-input-height-small);
  }

  .button--pill.button--medium {
    border-radius: var(--sl-input-height-medium);
  }

  .button--pill.button--large {
    border-radius: var(--sl-input-height-large);
  }

  /*
   * Circle modifier
   */

  .button--circle {
    padding-left: 0;
    padding-right: 0;
  }

  .button--circle.button--small {
    width: var(--sl-input-height-small);
    border-radius: 50%;
  }

  .button--circle.button--medium {
    width: var(--sl-input-height-medium);
    border-radius: 50%;
  }

  .button--circle.button--large {
    width: var(--sl-input-height-large);
    border-radius: 50%;
  }

  .button--circle .button__prefix,
  .button--circle .button__suffix,
  .button--circle .button__caret {
    display: none;
  }

  /*
   * Caret modifier
   */

  .button--caret .button__suffix {
    display: none;
  }

  .button--caret .button__caret {
    height: auto;
  }

  /*
   * Loading modifier
   */

  .button--loading {
    position: relative;
    cursor: wait;
  }

  .button--loading .button__prefix,
  .button--loading .button__label,
  .button--loading .button__suffix,
  .button--loading .button__caret {
    visibility: hidden;
  }

  .button--loading sl-spinner {
    --indicator-color: currentColor;
    position: absolute;
    font-size: 1em;
    height: 1em;
    width: 1em;
    top: calc(50% - 0.5em);
    left: calc(50% - 0.5em);
  }

  /*
   * Badges
   */

  .button ::slotted(sl-badge) {
    position: absolute;
    top: 0;
    right: 0;
    translate: 50% -50%;
    pointer-events: none;
  }

  .button--rtl ::slotted(sl-badge) {
    right: auto;
    left: 0;
    translate: -50% -50%;
  }

  /*
   * Button spacing
   */

  .button--has-label.button--small .button__label {
    padding: 0 var(--sl-spacing-small);
  }

  .button--has-label.button--medium .button__label {
    padding: 0 var(--sl-spacing-medium);
  }

  .button--has-label.button--large .button__label {
    padding: 0 var(--sl-spacing-large);
  }

  .button--has-prefix.button--small {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--small .button__label {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--medium {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--medium .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-suffix.button--small,
  .button--caret.button--small {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--small .button__label,
  .button--caret.button--small .button__label {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--medium,
  .button--caret.button--medium {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--medium .button__label,
  .button--caret.button--medium .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large,
  .button--caret.button--large {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large .button__label,
  .button--caret.button--large .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  /*
   * Button groups support a variety of button types (e.g. buttons with tooltips, buttons as dropdown triggers, etc.).
   * This means buttons aren't always direct descendants of the button group, thus we can't target them with the
   * ::slotted selector. To work around this, the button group component does some magic to add these special classes to
   * buttons and we style them here instead.
   */

  :host([data-sl-button-group__button--first]:not([data-sl-button-group__button--last])) .button {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :host([data-sl-button-group__button--inner]) .button {
    border-radius: 0;
  }

  :host([data-sl-button-group__button--last]:not([data-sl-button-group__button--first])) .button {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /* All except the first */
  :host([data-sl-button-group__button]:not([data-sl-button-group__button--first])) {
    margin-inline-start: calc(-1 * var(--sl-input-border-width));
  }

  /* Add a visual separator between solid buttons */
  :host(
      [data-sl-button-group__button]:not(
          [data-sl-button-group__button--first],
          [data-sl-button-group__button--radio],
          [variant='default']
        ):not(:hover)
    )
    .button:after {
    content: '';
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    bottom: 0;
    border-left: solid 1px rgb(128 128 128 / 33%);
    mix-blend-mode: multiply;
  }

  /* Bump hovered, focused, and checked buttons up so their focus ring isn't clipped */
  :host([data-sl-button-group__button--hover]) {
    z-index: 1;
  }

  /* Focus and checked are always on top */
  :host([data-sl-button-group__button--focus]),
  :host([data-sl-button-group__button][checked]) {
    z-index: 2;
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.NYIIDP5N.js
var HasSlotController = class {
  constructor(host, ...slotNames) {
    this.slotNames = [];
    this.handleSlotChange = (event) => {
      const slot = event.target;
      if (this.slotNames.includes("[default]") && !slot.name || slot.name && this.slotNames.includes(slot.name)) {
        this.host.requestUpdate();
      }
    };
    (this.host = host).addController(this);
    this.slotNames = slotNames;
  }
  hasDefaultSlot() {
    return [...this.host.childNodes].some((node) => {
      if (node.nodeType === node.TEXT_NODE && node.textContent.trim() !== "") {
        return true;
      }
      if (node.nodeType === node.ELEMENT_NODE) {
        const el = node;
        const tagName = el.tagName.toLowerCase();
        if (tagName === "sl-visually-hidden") {
          return false;
        }
        if (!el.hasAttribute("slot")) {
          return true;
        }
      }
      return false;
    });
  }
  hasNamedSlot(name) {
    return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
  }
  test(slotName) {
    return slotName === "[default]" ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }
  hostConnected() {
    this.host.shadowRoot.addEventListener("slotchange", this.handleSlotChange);
  }
  hostDisconnected() {
    this.host.shadowRoot.removeEventListener("slotchange", this.handleSlotChange);
  }
};

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.QLXRCYS4.js
var icon_styles_default = i`
  :host {
    display: inline-block;
    width: 1em;
    height: 1em;
    box-sizing: content-box !important;
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.3Y6SB6QS.js
var basePath = "";
function setBasePath(path) {
  basePath = path;
}
function getBasePath(subpath = "") {
  if (!basePath) {
    const scripts = [...document.getElementsByTagName("script")];
    const configScript = scripts.find((script) => script.hasAttribute("data-shoelace"));
    if (configScript) {
      setBasePath(configScript.getAttribute("data-shoelace"));
    } else {
      const fallbackScript = scripts.find((s4) => {
        return /shoelace(\.min)?\.js($|\?)/.test(s4.src) || /shoelace-autoloader(\.min)?\.js($|\?)/.test(s4.src);
      });
      let path = "";
      if (fallbackScript) {
        path = fallbackScript.getAttribute("src");
      }
      setBasePath(path.split("/").slice(0, -1).join("/"));
    }
  }
  return basePath.replace(/\/$/, "") + (subpath ? `/${subpath.replace(/^\//, "")}` : ``);
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.P7ZG6EMR.js
var library = {
  name: "default",
  resolver: (name) => getBasePath(`assets/icons/${name}.svg`)
};
var library_default_default = library;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.3TFKS637.js
var icons = {
  caret: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,
  check: `
    <svg part="checked-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor">
          <g transform="translate(3.428571, 3.428571)">
            <path d="M0,5.71428571 L3.42857143,9.14285714"></path>
            <path d="M9.14285714,0 L3.42857143,9.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,
  "chevron-down": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,
  "chevron-left": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
    </svg>
  `,
  "chevron-right": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,
  copy: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
    </svg>
  `,
  eye: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  `,
  "eye-slash": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  `,
  eyedropper: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eyedropper" viewBox="0 0 16 16">
      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
    </svg>
  `,
  "grip-vertical": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16">
      <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
    </svg>
  `,
  indeterminate: `
    <svg part="indeterminate-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor" stroke-width="2">
          <g transform="translate(2.285714, 6.857143)">
            <path d="M10.2857143,1.14285714 L1.14285714,1.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,
  "person-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  `,
  "play-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
    </svg>
  `,
  "pause-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
    </svg>
  `,
  radio: `
    <svg part="checked-icon" class="radio__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill="currentColor">
          <circle cx="8" cy="8" r="3.42857143"></circle>
        </g>
      </g>
    </svg>
  `,
  "star-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
  `,
  "x-lg": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  `,
  "x-circle-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
    </svg>
  `
};
var systemLibrary = {
  name: "system",
  resolver: (name) => {
    if (name in icons) {
      return `data:image/svg+xml,${encodeURIComponent(icons[name])}`;
    }
    return "";
  }
};
var library_system_default = systemLibrary;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.ZL53POKZ.js
var registry = [library_default_default, library_system_default];
var watchedIcons = [];
function watchIcon(icon) {
  watchedIcons.push(icon);
}
function unwatchIcon(icon) {
  watchedIcons = watchedIcons.filter((el) => el !== icon);
}
function getIconLibrary(name) {
  return registry.find((lib) => lib.name === name);
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.GMYPQTFK.js
function watch(propertyName, options) {
  const resolvedOptions = __spreadValues({
    waitUntilFirstUpdate: false
  }, options);
  return (proto, decoratedFnName) => {
    const { update: update2 } = proto;
    const watchedProperties = Array.isArray(propertyName) ? propertyName : [propertyName];
    proto.update = function(changedProps) {
      watchedProperties.forEach((property) => {
        const key = property;
        if (changedProps.has(key)) {
          const oldValue = changedProps.get(key);
          const newValue = this[key];
          if (oldValue !== newValue) {
            if (!resolvedOptions.waitUntilFirstUpdate || this.hasUpdated) {
              this[decoratedFnName](oldValue, newValue);
            }
          }
        }
      });
      update2.call(this, changedProps);
    };
  };
}

// node_modules/lit-html/directive-helpers.js
var { I: t6 } = Z2;
var e10 = (o12, t7) => void 0 === t7 ? void 0 !== o12?._$litType$ : o12?._$litType$ === t7;
var f6 = (o12) => void 0 === o12.strings;
var u4 = {};
var m3 = (o12, t7 = u4) => o12._$AH = t7;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.5YPURQKE.js
var CACHEABLE_ERROR = Symbol();
var RETRYABLE_ERROR = Symbol();
var parser;
var iconCache = /* @__PURE__ */ new Map();
var SlIcon = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.initialRender = false;
    this.svg = null;
    this.label = "";
    this.library = "default";
  }
  /** Given a URL, this function returns the resulting SVG element or an appropriate error symbol. */
  async resolveIcon(url, library2) {
    var _a3;
    let fileData;
    if (library2 == null ? void 0 : library2.spriteSheet) {
      this.svg = x2`<svg part="svg">
        <use part="use" href="${url}"></use>
      </svg>`;
      return this.svg;
    }
    try {
      fileData = await fetch(url, { mode: "cors" });
      if (!fileData.ok) return fileData.status === 410 ? CACHEABLE_ERROR : RETRYABLE_ERROR;
    } catch (e12) {
      return RETRYABLE_ERROR;
    }
    try {
      const div = document.createElement("div");
      div.innerHTML = await fileData.text();
      const svg = div.firstElementChild;
      if (((_a3 = svg == null ? void 0 : svg.tagName) == null ? void 0 : _a3.toLowerCase()) !== "svg") return CACHEABLE_ERROR;
      if (!parser) parser = new DOMParser();
      const doc = parser.parseFromString(svg.outerHTML, "text/html");
      const svgEl = doc.body.querySelector("svg");
      if (!svgEl) return CACHEABLE_ERROR;
      svgEl.part.add("svg");
      return document.adoptNode(svgEl);
    } catch (e12) {
      return CACHEABLE_ERROR;
    }
  }
  connectedCallback() {
    super.connectedCallback();
    watchIcon(this);
  }
  firstUpdated() {
    this.initialRender = true;
    this.setIcon();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    unwatchIcon(this);
  }
  getIconSource() {
    const library2 = getIconLibrary(this.library);
    if (this.name && library2) {
      return {
        url: library2.resolver(this.name),
        fromLibrary: true
      };
    }
    return {
      url: this.src,
      fromLibrary: false
    };
  }
  handleLabelChange() {
    const hasLabel = typeof this.label === "string" && this.label.length > 0;
    if (hasLabel) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", this.label);
      this.removeAttribute("aria-hidden");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
      this.setAttribute("aria-hidden", "true");
    }
  }
  async setIcon() {
    var _a3;
    const { url, fromLibrary } = this.getIconSource();
    const library2 = fromLibrary ? getIconLibrary(this.library) : void 0;
    if (!url) {
      this.svg = null;
      return;
    }
    let iconResolver = iconCache.get(url);
    if (!iconResolver) {
      iconResolver = this.resolveIcon(url, library2);
      iconCache.set(url, iconResolver);
    }
    if (!this.initialRender) {
      return;
    }
    const svg = await iconResolver;
    if (svg === RETRYABLE_ERROR) {
      iconCache.delete(url);
    }
    if (url !== this.getIconSource().url) {
      return;
    }
    if (e10(svg)) {
      this.svg = svg;
      if (library2) {
        await this.updateComplete;
        const shadowSVG = this.shadowRoot.querySelector("[part='svg']");
        if (typeof library2.mutator === "function" && shadowSVG) {
          library2.mutator(shadowSVG);
        }
      }
      return;
    }
    switch (svg) {
      case RETRYABLE_ERROR:
      case CACHEABLE_ERROR:
        this.svg = null;
        this.emit("sl-error");
        break;
      default:
        this.svg = svg.cloneNode(true);
        (_a3 = library2 == null ? void 0 : library2.mutator) == null ? void 0 : _a3.call(library2, this.svg);
        this.emit("sl-load");
    }
  }
  render() {
    return this.svg;
  }
};
SlIcon.styles = [component_styles_default, icon_styles_default];
__decorateClass([
  r7()
], SlIcon.prototype, "svg", 2);
__decorateClass([
  n7({ reflect: true })
], SlIcon.prototype, "name", 2);
__decorateClass([
  n7()
], SlIcon.prototype, "src", 2);
__decorateClass([
  n7()
], SlIcon.prototype, "label", 2);
__decorateClass([
  n7({ reflect: true })
], SlIcon.prototype, "library", 2);
__decorateClass([
  watch("label")
], SlIcon.prototype, "handleLabelChange", 1);
__decorateClass([
  watch(["name", "src", "library"])
], SlIcon.prototype, "setIcon", 1);

// node_modules/lit-html/static.js
var a4 = Symbol.for("");
var o8 = (t7) => {
  if (t7?.r === a4) return t7?._$litStatic$;
};
var i7 = (t7, ...r11) => ({ _$litStatic$: r11.reduce(((r12, e12, a5) => r12 + ((t8) => {
  if (void 0 !== t8._$litStatic$) return t8._$litStatic$;
  throw Error(`Value passed to 'literal' function must be a 'literal' result: ${t8}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
})(e12) + t7[a5 + 1]), t7[0]), r: a4 });
var l4 = /* @__PURE__ */ new Map();
var n9 = (t7) => (r11, ...e12) => {
  const a5 = e12.length;
  let s4, i9;
  const n10 = [], u6 = [];
  let c8, $4 = 0, f7 = false;
  for (; $4 < a5; ) {
    for (c8 = r11[$4]; $4 < a5 && void 0 !== (i9 = e12[$4], s4 = o8(i9)); ) c8 += s4 + r11[++$4], f7 = true;
    $4 !== a5 && u6.push(i9), n10.push(c8), $4++;
  }
  if ($4 === a5 && n10.push(r11[a5]), f7) {
    const t8 = n10.join("$$lit$$");
    void 0 === (r11 = l4.get(t8)) && (n10.raw = n10, l4.set(t8, r11 = n10)), e12 = u6;
  }
  return t7(r11, ...e12);
};
var u5 = n9(x2);
var c7 = n9(b3);
var $3 = n9(w2);

// node_modules/lit-html/directives/if-defined.js
var o9 = (o12) => o12 ?? E2;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.HSRY62XN.js
var SlButton = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.formControlController = new FormControlController(this, {
      assumeInteractionOn: ["click"]
    });
    this.hasSlotController = new HasSlotController(this, "[default]", "prefix", "suffix");
    this.localize = new LocalizeController2(this);
    this.hasFocus = false;
    this.invalid = false;
    this.title = "";
    this.variant = "default";
    this.size = "medium";
    this.caret = false;
    this.disabled = false;
    this.loading = false;
    this.outline = false;
    this.pill = false;
    this.circle = false;
    this.type = "button";
    this.name = "";
    this.value = "";
    this.href = "";
    this.rel = "noreferrer noopener";
  }
  /** Gets the validity state object */
  get validity() {
    if (this.isButton()) {
      return this.button.validity;
    }
    return validValidityState;
  }
  /** Gets the validation message */
  get validationMessage() {
    if (this.isButton()) {
      return this.button.validationMessage;
    }
    return "";
  }
  firstUpdated() {
    if (this.isButton()) {
      this.formControlController.updateValidity();
    }
  }
  handleBlur() {
    this.hasFocus = false;
    this.emit("sl-blur");
  }
  handleFocus() {
    this.hasFocus = true;
    this.emit("sl-focus");
  }
  handleClick() {
    if (this.type === "submit") {
      this.formControlController.submit(this);
    }
    if (this.type === "reset") {
      this.formControlController.reset(this);
    }
  }
  handleInvalid(event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }
  isButton() {
    return this.href ? false : true;
  }
  isLink() {
    return this.href ? true : false;
  }
  handleDisabledChange() {
    if (this.isButton()) {
      this.formControlController.setValidity(this.disabled);
    }
  }
  /** Simulates a click on the button. */
  click() {
    this.button.click();
  }
  /** Sets focus on the button. */
  focus(options) {
    this.button.focus(options);
  }
  /** Removes focus from the button. */
  blur() {
    this.button.blur();
  }
  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    if (this.isButton()) {
      return this.button.checkValidity();
    }
    return true;
  }
  /** Gets the associated form, if one exists. */
  getForm() {
    return this.formControlController.getForm();
  }
  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    if (this.isButton()) {
      return this.button.reportValidity();
    }
    return true;
  }
  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message) {
    if (this.isButton()) {
      this.button.setCustomValidity(message);
      this.formControlController.updateValidity();
    }
  }
  render() {
    const isLink = this.isLink();
    const tag = isLink ? i7`a` : i7`button`;
    return u5`
      <${tag}
        part="base"
        class=${e9({
      button: true,
      "button--default": this.variant === "default",
      "button--primary": this.variant === "primary",
      "button--success": this.variant === "success",
      "button--neutral": this.variant === "neutral",
      "button--warning": this.variant === "warning",
      "button--danger": this.variant === "danger",
      "button--text": this.variant === "text",
      "button--small": this.size === "small",
      "button--medium": this.size === "medium",
      "button--large": this.size === "large",
      "button--caret": this.caret,
      "button--circle": this.circle,
      "button--disabled": this.disabled,
      "button--focused": this.hasFocus,
      "button--loading": this.loading,
      "button--standard": !this.outline,
      "button--outline": this.outline,
      "button--pill": this.pill,
      "button--rtl": this.localize.dir() === "rtl",
      "button--has-label": this.hasSlotController.test("[default]"),
      "button--has-prefix": this.hasSlotController.test("prefix"),
      "button--has-suffix": this.hasSlotController.test("suffix")
    })}
        ?disabled=${o9(isLink ? void 0 : this.disabled)}
        type=${o9(isLink ? void 0 : this.type)}
        title=${this.title}
        name=${o9(isLink ? void 0 : this.name)}
        value=${o9(isLink ? void 0 : this.value)}
        href=${o9(isLink && !this.disabled ? this.href : void 0)}
        target=${o9(isLink ? this.target : void 0)}
        download=${o9(isLink ? this.download : void 0)}
        rel=${o9(isLink ? this.rel : void 0)}
        role=${o9(isLink ? void 0 : "button")}
        aria-disabled=${this.disabled ? "true" : "false"}
        tabindex=${this.disabled ? "-1" : "0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @invalid=${this.isButton() ? this.handleInvalid : null}
        @click=${this.handleClick}
      >
        <slot name="prefix" part="prefix" class="button__prefix"></slot>
        <slot part="label" class="button__label"></slot>
        <slot name="suffix" part="suffix" class="button__suffix"></slot>
        ${this.caret ? u5` <sl-icon part="caret" class="button__caret" library="system" name="caret"></sl-icon> ` : ""}
        ${this.loading ? u5`<sl-spinner part="spinner"></sl-spinner>` : ""}
      </${tag}>
    `;
  }
};
SlButton.styles = [component_styles_default, button_styles_default];
SlButton.dependencies = {
  "sl-icon": SlIcon,
  "sl-spinner": SlSpinner
};
__decorateClass([
  e6(".button")
], SlButton.prototype, "button", 2);
__decorateClass([
  r7()
], SlButton.prototype, "hasFocus", 2);
__decorateClass([
  r7()
], SlButton.prototype, "invalid", 2);
__decorateClass([
  n7()
], SlButton.prototype, "title", 2);
__decorateClass([
  n7({ reflect: true })
], SlButton.prototype, "variant", 2);
__decorateClass([
  n7({ reflect: true })
], SlButton.prototype, "size", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlButton.prototype, "caret", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlButton.prototype, "disabled", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlButton.prototype, "loading", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlButton.prototype, "outline", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlButton.prototype, "pill", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlButton.prototype, "circle", 2);
__decorateClass([
  n7()
], SlButton.prototype, "type", 2);
__decorateClass([
  n7()
], SlButton.prototype, "name", 2);
__decorateClass([
  n7()
], SlButton.prototype, "value", 2);
__decorateClass([
  n7()
], SlButton.prototype, "href", 2);
__decorateClass([
  n7()
], SlButton.prototype, "target", 2);
__decorateClass([
  n7()
], SlButton.prototype, "rel", 2);
__decorateClass([
  n7()
], SlButton.prototype, "download", 2);
__decorateClass([
  n7()
], SlButton.prototype, "form", 2);
__decorateClass([
  n7({ attribute: "formaction" })
], SlButton.prototype, "formAction", 2);
__decorateClass([
  n7({ attribute: "formenctype" })
], SlButton.prototype, "formEnctype", 2);
__decorateClass([
  n7({ attribute: "formmethod" })
], SlButton.prototype, "formMethod", 2);
__decorateClass([
  n7({ attribute: "formnovalidate", type: Boolean })
], SlButton.prototype, "formNoValidate", 2);
__decorateClass([
  n7({ attribute: "formtarget" })
], SlButton.prototype, "formTarget", 2);
__decorateClass([
  watch("disabled", { waitUntilFirstUpdate: true })
], SlButton.prototype, "handleDisabledChange", 1);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.A5D6FTFY.js
var card_styles_default = i`
  :host {
    --border-color: var(--sl-color-neutral-200);
    --border-radius: var(--sl-border-radius-medium);
    --border-width: 1px;
    --padding: var(--sl-spacing-large);

    display: inline-block;
  }

  .card {
    display: flex;
    flex-direction: column;
    background-color: var(--sl-panel-background-color);
    box-shadow: var(--sl-shadow-x-small);
    border: solid var(--border-width) var(--border-color);
    border-radius: var(--border-radius);
  }

  .card__image {
    display: flex;
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    margin: calc(-1 * var(--border-width));
    overflow: hidden;
  }

  .card__image::slotted(img) {
    display: block;
    width: 100%;
  }

  .card:not(.card--has-image) .card__image {
    display: none;
  }

  .card__header {
    display: block;
    border-bottom: solid var(--border-width) var(--border-color);
    padding: calc(var(--padding) / 2) var(--padding);
  }

  .card:not(.card--has-header) .card__header {
    display: none;
  }

  .card:not(.card--has-image) .card__header {
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
  }

  .card__body {
    display: block;
    padding: var(--padding);
  }

  .card--has-footer .card__footer {
    display: block;
    border-top: solid var(--border-width) var(--border-color);
    padding: var(--padding);
  }

  .card:not(.card--has-footer) .card__footer {
    display: none;
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.X2VUYVGD.js
var SlCard = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "footer", "header", "image");
  }
  render() {
    return x2`
      <div
        part="base"
        class=${e9({
      card: true,
      "card--has-footer": this.hasSlotController.test("footer"),
      "card--has-image": this.hasSlotController.test("image"),
      "card--has-header": this.hasSlotController.test("header")
    })}
      >
        <slot name="image" part="image" class="card__image"></slot>
        <slot name="header" part="header" class="card__header"></slot>
        <slot part="body" class="card__body"></slot>
        <slot name="footer" part="footer" class="card__footer"></slot>
      </div>
    `;
  }
};
SlCard.styles = [component_styles_default, card_styles_default];

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.HF7GESMZ.js
function clamp(value, min2, max2) {
  const noNegativeZero = (n10) => Object.is(n10, -0) ? 0 : n10;
  if (value < min2) {
    return noNegativeZero(min2);
  }
  if (value > max2) {
    return noNegativeZero(max2);
  }
  return noNegativeZero(value);
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.F4VGSDIW.js
var AutoplayController = class {
  constructor(host, tickCallback) {
    this.timerId = 0;
    this.activeInteractions = 0;
    this.paused = false;
    this.stopped = true;
    this.pause = () => {
      if (!this.activeInteractions++) {
        this.paused = true;
        this.host.requestUpdate();
      }
    };
    this.resume = () => {
      if (!--this.activeInteractions) {
        this.paused = false;
        this.host.requestUpdate();
      }
    };
    host.addController(this);
    this.host = host;
    this.tickCallback = tickCallback;
  }
  hostConnected() {
    this.host.addEventListener("mouseenter", this.pause);
    this.host.addEventListener("mouseleave", this.resume);
    this.host.addEventListener("focusin", this.pause);
    this.host.addEventListener("focusout", this.resume);
    this.host.addEventListener("touchstart", this.pause, { passive: true });
    this.host.addEventListener("touchend", this.resume);
  }
  hostDisconnected() {
    this.stop();
    this.host.removeEventListener("mouseenter", this.pause);
    this.host.removeEventListener("mouseleave", this.resume);
    this.host.removeEventListener("focusin", this.pause);
    this.host.removeEventListener("focusout", this.resume);
    this.host.removeEventListener("touchstart", this.pause);
    this.host.removeEventListener("touchend", this.resume);
  }
  start(interval) {
    this.stop();
    this.stopped = false;
    this.timerId = window.setInterval(() => {
      if (!this.paused) {
        this.tickCallback();
      }
    }, interval);
  }
  stop() {
    clearInterval(this.timerId);
    this.stopped = true;
    this.host.requestUpdate();
  }
};

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.BMOWACWC.js
var carousel_styles_default = i`
  :host {
    --slide-gap: var(--sl-spacing-medium, 1rem);
    --aspect-ratio: 16 / 9;
    --scroll-hint: 0px;

    display: flex;
  }

  .carousel {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    grid-template-rows: 1fr min-content;
    grid-template-areas:
      '. slides .'
      '. pagination .';
    gap: var(--sl-spacing-medium);
    align-items: center;
    min-height: 100%;
    min-width: 100%;
    position: relative;
  }

  .carousel__pagination {
    grid-area: pagination;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--sl-spacing-small);
  }

  .carousel__slides {
    grid-area: slides;

    display: grid;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-items: center;
    overflow: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    aspect-ratio: calc(var(--aspect-ratio) * var(--slides-per-page));
    border-radius: var(--sl-border-radius-small);

    --slide-size: calc((100% - (var(--slides-per-page) - 1) * var(--slide-gap)) / var(--slides-per-page));
  }

  @media (prefers-reduced-motion) {
    :where(.carousel__slides) {
      scroll-behavior: auto;
    }
  }

  .carousel__slides--horizontal {
    grid-auto-flow: column;
    grid-auto-columns: var(--slide-size);
    grid-auto-rows: 100%;
    column-gap: var(--slide-gap);
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--scroll-hint);
    padding-inline: var(--scroll-hint);
    overflow-y: hidden;
  }

  .carousel__slides--vertical {
    grid-auto-flow: row;
    grid-auto-columns: 100%;
    grid-auto-rows: var(--slide-size);
    row-gap: var(--slide-gap);
    scroll-snap-type: y mandatory;
    scroll-padding-block: var(--scroll-hint);
    padding-block: var(--scroll-hint);
    overflow-x: hidden;
  }

  .carousel__slides--dragging {
  }

  :host([vertical]) ::slotted(sl-carousel-item) {
    height: 100%;
  }

  .carousel__slides::-webkit-scrollbar {
    display: none;
  }

  .carousel__navigation {
    grid-area: navigation;
    display: contents;
    font-size: var(--sl-font-size-x-large);
  }

  .carousel__navigation-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-small);
    font-size: inherit;
    color: var(--sl-color-neutral-600);
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-medium) color;
    appearance: none;
  }

  .carousel__navigation-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .carousel__navigation-button--disabled::part(base) {
    pointer-events: none;
  }

  .carousel__navigation-button--previous {
    grid-column: 1;
    grid-row: 1;
  }

  .carousel__navigation-button--next {
    grid-column: 3;
    grid-row: 1;
  }

  .carousel__pagination-item {
    display: block;
    cursor: pointer;
    background: none;
    border: 0;
    border-radius: var(--sl-border-radius-circle);
    width: var(--sl-spacing-small);
    height: var(--sl-spacing-small);
    background-color: var(--sl-color-neutral-300);
    padding: 0;
    margin: 0;
  }

  .carousel__pagination-item--active {
    background-color: var(--sl-color-neutral-700);
    transform: scale(1.2);
  }

  /* Focus styles */
  .carousel__slides:focus-visible,
  .carousel__navigation-button:focus-visible,
  .carousel__pagination-item:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.B4BZKR24.js
function waitForEvent(el, eventName) {
  return new Promise((resolve) => {
    function done(event) {
      if (event.target === el) {
        el.removeEventListener(eventName, done);
        resolve();
      }
    }
    el.addEventListener(eventName, done);
  });
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.AJ3ENQ5C.js
function animateTo(el, keyframes, options) {
  return new Promise((resolve) => {
    if ((options == null ? void 0 : options.duration) === Infinity) {
      throw new Error("Promise-based animations must be finite.");
    }
    const animation = el.animate(keyframes, __spreadProps(__spreadValues({}, options), {
      duration: prefersReducedMotion() ? 0 : options.duration
    }));
    animation.addEventListener("cancel", resolve, { once: true });
    animation.addEventListener("finish", resolve, { once: true });
  });
}
function parseDuration(delay) {
  delay = delay.toString().toLowerCase();
  if (delay.indexOf("ms") > -1) {
    return parseFloat(delay);
  }
  if (delay.indexOf("s") > -1) {
    return parseFloat(delay) * 1e3;
  }
  return parseFloat(delay);
}
function prefersReducedMotion() {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  return query.matches;
}
function stopAnimations(el) {
  return Promise.all(
    el.getAnimations().map((animation) => {
      return new Promise((resolve) => {
        animation.cancel();
        requestAnimationFrame(resolve);
      });
    })
  );
}

// node_modules/lit-html/directives/map.js
function* o10(o12, f7) {
  if (void 0 !== o12) {
    let i9 = 0;
    for (const t7 of o12) yield f7(t7, i9++);
  }
}

// node_modules/lit-html/directives/range.js
function* o11(o12, t7, e12 = 1) {
  const i9 = void 0 === t7 ? 0 : o12;
  t7 ??= o12;
  for (let o13 = i9; e12 > 0 ? o13 < t7 : t7 < o13; o13 += e12) yield o13;
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.WIPJVEWE.js
var SlCarousel = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.loop = false;
    this.navigation = false;
    this.pagination = false;
    this.autoplay = false;
    this.autoplayInterval = 3e3;
    this.slidesPerPage = 1;
    this.slidesPerMove = 1;
    this.orientation = "horizontal";
    this.mouseDragging = false;
    this.activeSlide = 0;
    this.scrolling = false;
    this.dragging = false;
    this.autoplayController = new AutoplayController(this, () => this.next());
    this.dragStartPosition = [-1, -1];
    this.localize = new LocalizeController2(this);
    this.pendingSlideChange = false;
    this.handleMouseDrag = (event) => {
      if (!this.dragging) {
        this.scrollContainer.style.setProperty("scroll-snap-type", "none");
        this.dragging = true;
        this.dragStartPosition = [event.clientX, event.clientY];
      }
      this.scrollContainer.scrollBy({
        left: -event.movementX,
        top: -event.movementY,
        behavior: "instant"
      });
    };
    this.handleMouseDragEnd = () => {
      const scrollContainer = this.scrollContainer;
      document.removeEventListener("pointermove", this.handleMouseDrag, { capture: true });
      const startLeft = scrollContainer.scrollLeft;
      const startTop = scrollContainer.scrollTop;
      scrollContainer.style.removeProperty("scroll-snap-type");
      scrollContainer.style.setProperty("overflow", "hidden");
      const finalLeft = scrollContainer.scrollLeft;
      const finalTop = scrollContainer.scrollTop;
      scrollContainer.style.removeProperty("overflow");
      scrollContainer.style.setProperty("scroll-snap-type", "none");
      scrollContainer.scrollTo({ left: startLeft, top: startTop, behavior: "instant" });
      requestAnimationFrame(async () => {
        if (startLeft !== finalLeft || startTop !== finalTop) {
          scrollContainer.scrollTo({
            left: finalLeft,
            top: finalTop,
            behavior: prefersReducedMotion() ? "auto" : "smooth"
          });
          await waitForEvent(scrollContainer, "scrollend");
        }
        scrollContainer.style.removeProperty("scroll-snap-type");
        this.dragging = false;
        this.dragStartPosition = [-1, -1];
        this.handleScrollEnd();
      });
    };
    this.handleSlotChange = (mutations) => {
      const needsInitialization = mutations.some(
        (mutation) => [...mutation.addedNodes, ...mutation.removedNodes].some(
          (el) => this.isCarouselItem(el) && !el.hasAttribute("data-clone")
        )
      );
      if (needsInitialization) {
        this.initializeSlides();
      }
      this.requestUpdate();
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "region");
    this.setAttribute("aria-label", this.localize.term("carousel"));
  }
  disconnectedCallback() {
    var _a3;
    super.disconnectedCallback();
    (_a3 = this.mutationObserver) == null ? void 0 : _a3.disconnect();
  }
  firstUpdated() {
    this.initializeSlides();
    this.mutationObserver = new MutationObserver(this.handleSlotChange);
    this.mutationObserver.observe(this, {
      childList: true,
      subtree: true
    });
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("slidesPerMove") || changedProperties.has("slidesPerPage")) {
      this.slidesPerMove = Math.min(this.slidesPerMove, this.slidesPerPage);
    }
  }
  getPageCount() {
    const slidesCount = this.getSlides().length;
    const { slidesPerPage, slidesPerMove, loop } = this;
    const pages = loop ? slidesCount / slidesPerMove : (slidesCount - slidesPerPage) / slidesPerMove + 1;
    return Math.ceil(pages);
  }
  getCurrentPage() {
    return Math.ceil(this.activeSlide / this.slidesPerMove);
  }
  canScrollNext() {
    return this.loop || this.getCurrentPage() < this.getPageCount() - 1;
  }
  canScrollPrev() {
    return this.loop || this.getCurrentPage() > 0;
  }
  /** @internal Gets all carousel items. */
  getSlides({ excludeClones = true } = {}) {
    return [...this.children].filter(
      (el) => this.isCarouselItem(el) && (!excludeClones || !el.hasAttribute("data-clone"))
    );
  }
  handleClick(event) {
    if (this.dragging && this.dragStartPosition[0] > 0 && this.dragStartPosition[1] > 0) {
      const deltaX = Math.abs(this.dragStartPosition[0] - event.clientX);
      const deltaY = Math.abs(this.dragStartPosition[1] - event.clientY);
      const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (delta >= 10) {
        event.preventDefault();
      }
    }
  }
  handleKeyDown(event) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      const target = event.target;
      const isRtl = this.localize.dir() === "rtl";
      const isFocusInPagination = target.closest('[part~="pagination-item"]') !== null;
      const isNext = event.key === "ArrowDown" || !isRtl && event.key === "ArrowRight" || isRtl && event.key === "ArrowLeft";
      const isPrevious = event.key === "ArrowUp" || !isRtl && event.key === "ArrowLeft" || isRtl && event.key === "ArrowRight";
      event.preventDefault();
      if (isPrevious) {
        this.previous();
      }
      if (isNext) {
        this.next();
      }
      if (event.key === "Home") {
        this.goToSlide(0);
      }
      if (event.key === "End") {
        this.goToSlide(this.getSlides().length - 1);
      }
      if (isFocusInPagination) {
        this.updateComplete.then(() => {
          var _a3;
          const activePaginationItem = (_a3 = this.shadowRoot) == null ? void 0 : _a3.querySelector(
            '[part~="pagination-item--active"]'
          );
          if (activePaginationItem) {
            activePaginationItem.focus();
          }
        });
      }
    }
  }
  handleMouseDragStart(event) {
    const canDrag = this.mouseDragging && event.button === 0;
    if (canDrag) {
      event.preventDefault();
      document.addEventListener("pointermove", this.handleMouseDrag, { capture: true, passive: true });
      document.addEventListener("pointerup", this.handleMouseDragEnd, { capture: true, once: true });
    }
  }
  handleScroll() {
    this.scrolling = true;
    if (!this.pendingSlideChange) {
      this.synchronizeSlides();
    }
  }
  /** @internal Synchronizes the slides with the IntersectionObserver API. */
  synchronizeSlides() {
    const io = new IntersectionObserver(
      (entries) => {
        io.disconnect();
        for (const entry of entries) {
          const slide = entry.target;
          slide.toggleAttribute("inert", !entry.isIntersecting);
          slide.classList.toggle("--in-view", entry.isIntersecting);
          slide.setAttribute("aria-hidden", entry.isIntersecting ? "false" : "true");
        }
        const firstIntersecting = entries.find((entry) => entry.isIntersecting);
        if (!firstIntersecting) {
          return;
        }
        const slidesWithClones = this.getSlides({ excludeClones: false });
        const slidesCount = this.getSlides().length;
        const slideIndex = slidesWithClones.indexOf(firstIntersecting.target);
        const normalizedIndex = this.loop ? slideIndex - this.slidesPerPage : slideIndex;
        this.activeSlide = (Math.ceil(normalizedIndex / this.slidesPerMove) * this.slidesPerMove + slidesCount) % slidesCount;
        if (!this.scrolling) {
          if (this.loop && firstIntersecting.target.hasAttribute("data-clone")) {
            const clonePosition = Number(firstIntersecting.target.getAttribute("data-clone"));
            this.goToSlide(clonePosition, "instant");
          }
        }
      },
      {
        root: this.scrollContainer,
        threshold: 0.6
      }
    );
    this.getSlides({ excludeClones: false }).forEach((slide) => {
      io.observe(slide);
    });
  }
  handleScrollEnd() {
    if (!this.scrolling || this.dragging) return;
    this.scrolling = false;
    this.pendingSlideChange = false;
    this.synchronizeSlides();
  }
  isCarouselItem(node) {
    return node instanceof Element && node.tagName.toLowerCase() === "sl-carousel-item";
  }
  initializeSlides() {
    this.getSlides({ excludeClones: false }).forEach((slide, index) => {
      slide.classList.remove("--in-view");
      slide.classList.remove("--is-active");
      slide.setAttribute("aria-label", this.localize.term("slideNum", index + 1));
      if (slide.hasAttribute("data-clone")) {
        slide.remove();
      }
    });
    this.updateSlidesSnap();
    if (this.loop) {
      this.createClones();
    }
    this.goToSlide(this.activeSlide, "auto");
    this.synchronizeSlides();
  }
  createClones() {
    const slides = this.getSlides();
    const slidesPerPage = this.slidesPerPage;
    const lastSlides = slides.slice(-slidesPerPage);
    const firstSlides = slides.slice(0, slidesPerPage);
    lastSlides.reverse().forEach((slide, i9) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("data-clone", String(slides.length - i9 - 1));
      this.prepend(clone);
    });
    firstSlides.forEach((slide, i9) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("data-clone", String(i9));
      this.append(clone);
    });
  }
  handleSlideChange() {
    const slides = this.getSlides();
    slides.forEach((slide, i9) => {
      slide.classList.toggle("--is-active", i9 === this.activeSlide);
    });
    if (this.hasUpdated) {
      this.emit("sl-slide-change", {
        detail: {
          index: this.activeSlide,
          slide: slides[this.activeSlide]
        }
      });
    }
  }
  updateSlidesSnap() {
    const slides = this.getSlides();
    const slidesPerMove = this.slidesPerMove;
    slides.forEach((slide, i9) => {
      const shouldSnap = (i9 + slidesPerMove) % slidesPerMove === 0;
      if (shouldSnap) {
        slide.style.removeProperty("scroll-snap-align");
      } else {
        slide.style.setProperty("scroll-snap-align", "none");
      }
    });
  }
  handleAutoplayChange() {
    this.autoplayController.stop();
    if (this.autoplay) {
      this.autoplayController.start(this.autoplayInterval);
    }
  }
  /**
   * Move the carousel backward by `slides-per-move` slides.
   *
   * @param behavior - The behavior used for scrolling.
   */
  previous(behavior = "smooth") {
    this.goToSlide(this.activeSlide - this.slidesPerMove, behavior);
  }
  /**
   * Move the carousel forward by `slides-per-move` slides.
   *
   * @param behavior - The behavior used for scrolling.
   */
  next(behavior = "smooth") {
    this.goToSlide(this.activeSlide + this.slidesPerMove, behavior);
  }
  /**
   * Scrolls the carousel to the slide specified by `index`.
   *
   * @param index - The slide index.
   * @param behavior - The behavior used for scrolling.
   */
  goToSlide(index, behavior = "smooth") {
    const { slidesPerPage, loop } = this;
    const slides = this.getSlides();
    const slidesWithClones = this.getSlides({ excludeClones: false });
    if (!slides.length) {
      return;
    }
    const newActiveSlide = loop ? (index + slides.length) % slides.length : clamp(index, 0, slides.length - slidesPerPage);
    this.activeSlide = newActiveSlide;
    const isRtl = this.localize.dir() === "rtl";
    const nextSlideIndex = clamp(
      index + (loop ? slidesPerPage : 0) + (isRtl ? slidesPerPage - 1 : 0),
      0,
      slidesWithClones.length - 1
    );
    const nextSlide = slidesWithClones[nextSlideIndex];
    this.scrollToSlide(nextSlide, prefersReducedMotion() ? "auto" : behavior);
  }
  scrollToSlide(slide, behavior = "smooth") {
    this.pendingSlideChange = true;
    window.requestAnimationFrame(() => {
      if (!this.scrollContainer) {
        return;
      }
      const scrollContainer = this.scrollContainer;
      const scrollContainerRect = scrollContainer.getBoundingClientRect();
      const nextSlideRect = slide.getBoundingClientRect();
      const nextLeft = nextSlideRect.left - scrollContainerRect.left;
      const nextTop = nextSlideRect.top - scrollContainerRect.top;
      if (nextLeft || nextTop) {
        this.pendingSlideChange = true;
        scrollContainer.scrollTo({
          left: nextLeft + scrollContainer.scrollLeft,
          top: nextTop + scrollContainer.scrollTop,
          behavior
        });
      } else {
        this.pendingSlideChange = false;
      }
    });
  }
  render() {
    const { slidesPerMove, scrolling } = this;
    const pagesCount = this.getPageCount();
    const currentPage = this.getCurrentPage();
    const prevEnabled = this.canScrollPrev();
    const nextEnabled = this.canScrollNext();
    const isLtr = this.localize.dir() === "ltr";
    return x2`
      <div part="base" class="carousel">
        <div
          id="scroll-container"
          part="scroll-container"
          class="${e9({
      carousel__slides: true,
      "carousel__slides--horizontal": this.orientation === "horizontal",
      "carousel__slides--vertical": this.orientation === "vertical",
      "carousel__slides--dragging": this.dragging
    })}"
          style="--slides-per-page: ${this.slidesPerPage};"
          aria-busy="${scrolling ? "true" : "false"}"
          aria-atomic="true"
          tabindex="0"
          @keydown=${this.handleKeyDown}
          @mousedown="${this.handleMouseDragStart}"
          @scroll="${this.handleScroll}"
          @scrollend=${this.handleScrollEnd}
          @click=${this.handleClick}
        >
          <slot></slot>
        </div>

        ${this.navigation ? x2`
              <div part="navigation" class="carousel__navigation">
                <button
                  part="navigation-button navigation-button--previous"
                  class="${e9({
      "carousel__navigation-button": true,
      "carousel__navigation-button--previous": true,
      "carousel__navigation-button--disabled": !prevEnabled
    })}"
                  aria-label="${this.localize.term("previousSlide")}"
                  aria-controls="scroll-container"
                  aria-disabled="${prevEnabled ? "false" : "true"}"
                  @click=${prevEnabled ? () => this.previous() : null}
                >
                  <slot name="previous-icon">
                    <sl-icon library="system" name="${isLtr ? "chevron-left" : "chevron-right"}"></sl-icon>
                  </slot>
                </button>

                <button
                  part="navigation-button navigation-button--next"
                  class=${e9({
      "carousel__navigation-button": true,
      "carousel__navigation-button--next": true,
      "carousel__navigation-button--disabled": !nextEnabled
    })}
                  aria-label="${this.localize.term("nextSlide")}"
                  aria-controls="scroll-container"
                  aria-disabled="${nextEnabled ? "false" : "true"}"
                  @click=${nextEnabled ? () => this.next() : null}
                >
                  <slot name="next-icon">
                    <sl-icon library="system" name="${isLtr ? "chevron-right" : "chevron-left"}"></sl-icon>
                  </slot>
                </button>
              </div>
            ` : ""}
        ${this.pagination ? x2`
              <div part="pagination" role="tablist" class="carousel__pagination" aria-controls="scroll-container">
                ${o10(o11(pagesCount), (index) => {
      const isActive = index === currentPage;
      return x2`
                    <button
                      part="pagination-item ${isActive ? "pagination-item--active" : ""}"
                      class="${e9({
        "carousel__pagination-item": true,
        "carousel__pagination-item--active": isActive
      })}"
                      role="tab"
                      aria-selected="${isActive ? "true" : "false"}"
                      aria-label="${this.localize.term("goToSlide", index + 1, pagesCount)}"
                      tabindex=${isActive ? "0" : "-1"}
                      @click=${() => this.goToSlide(index * slidesPerMove)}
                      @keydown=${this.handleKeyDown}
                    ></button>
                  `;
    })}
              </div>
            ` : ""}
      </div>
    `;
  }
};
SlCarousel.styles = [component_styles_default, carousel_styles_default];
SlCarousel.dependencies = { "sl-icon": SlIcon };
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlCarousel.prototype, "loop", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlCarousel.prototype, "navigation", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlCarousel.prototype, "pagination", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlCarousel.prototype, "autoplay", 2);
__decorateClass([
  n7({ type: Number, attribute: "autoplay-interval" })
], SlCarousel.prototype, "autoplayInterval", 2);
__decorateClass([
  n7({ type: Number, attribute: "slides-per-page" })
], SlCarousel.prototype, "slidesPerPage", 2);
__decorateClass([
  n7({ type: Number, attribute: "slides-per-move" })
], SlCarousel.prototype, "slidesPerMove", 2);
__decorateClass([
  n7()
], SlCarousel.prototype, "orientation", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true, attribute: "mouse-dragging" })
], SlCarousel.prototype, "mouseDragging", 2);
__decorateClass([
  e6(".carousel__slides")
], SlCarousel.prototype, "scrollContainer", 2);
__decorateClass([
  e6(".carousel__pagination")
], SlCarousel.prototype, "paginationContainer", 2);
__decorateClass([
  r7()
], SlCarousel.prototype, "activeSlide", 2);
__decorateClass([
  r7()
], SlCarousel.prototype, "scrolling", 2);
__decorateClass([
  r7()
], SlCarousel.prototype, "dragging", 2);
__decorateClass([
  t3({ passive: true })
], SlCarousel.prototype, "handleScroll", 1);
__decorateClass([
  watch("loop", { waitUntilFirstUpdate: true }),
  watch("slidesPerPage", { waitUntilFirstUpdate: true })
], SlCarousel.prototype, "initializeSlides", 1);
__decorateClass([
  watch("activeSlide")
], SlCarousel.prototype, "handleSlideChange", 1);
__decorateClass([
  watch("slidesPerMove")
], SlCarousel.prototype, "updateSlidesSnap", 1);
__decorateClass([
  watch("autoplay")
], SlCarousel.prototype, "handleAutoplayChange", 1);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.OQXPL73S.js
var debounce = (fn, delay) => {
  let timerId = 0;
  return function(...args) {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      fn.call(this, ...args);
    }, delay);
  };
};
var decorate = (proto, method, decorateFn) => {
  const superFn = proto[method];
  proto[method] = function(...args) {
    superFn.call(this, ...args);
    decorateFn.call(this, superFn, ...args);
  };
};
var isSupported = "onscrollend" in window;
if (!isSupported) {
  const pointers = /* @__PURE__ */ new Set();
  const scrollHandlers = /* @__PURE__ */ new WeakMap();
  const handlePointerDown = (event) => {
    for (const touch of event.changedTouches) {
      pointers.add(touch.identifier);
    }
  };
  const handlePointerUp = (event) => {
    for (const touch of event.changedTouches) {
      pointers.delete(touch.identifier);
    }
  };
  document.addEventListener("touchstart", handlePointerDown, true);
  document.addEventListener("touchend", handlePointerUp, true);
  document.addEventListener("touchcancel", handlePointerUp, true);
  decorate(EventTarget.prototype, "addEventListener", function(addEventListener, type) {
    if (type !== "scrollend") return;
    const handleScrollEnd = debounce(() => {
      if (!pointers.size) {
        this.dispatchEvent(new Event("scrollend"));
      } else {
        handleScrollEnd();
      }
    }, 100);
    addEventListener.call(this, "scroll", handleScrollEnd, { passive: true });
    scrollHandlers.set(this, handleScrollEnd);
  });
  decorate(EventTarget.prototype, "removeEventListener", function(removeEventListener, type) {
    if (type !== "scrollend") return;
    const scrollHandler = scrollHandlers.get(this);
    if (scrollHandler) {
      removeEventListener.call(this, "scroll", scrollHandler, { passive: true });
    }
  });
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.NQ44LUGM.js
var carousel_item_styles_default = i`
  :host {
    --aspect-ratio: inherit;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    max-height: 100%;
    aspect-ratio: var(--aspect-ratio);
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  ::slotted(img) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.XHATQV4E.js
var SlCarouselItem = class extends ShoelaceElement {
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "group");
  }
  render() {
    return x2` <slot></slot> `;
  }
};
SlCarouselItem.styles = [component_styles_default, carousel_item_styles_default];

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.LXDTFLWU.js
var computedStyleMap = /* @__PURE__ */ new WeakMap();
function getCachedComputedStyle(el) {
  let computedStyle = computedStyleMap.get(el);
  if (!computedStyle) {
    computedStyle = window.getComputedStyle(el, null);
    computedStyleMap.set(el, computedStyle);
  }
  return computedStyle;
}
function isVisible(el) {
  if (typeof el.checkVisibility === "function") {
    return el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true });
  }
  const computedStyle = getCachedComputedStyle(el);
  return computedStyle.visibility !== "hidden" && computedStyle.display !== "none";
}
function isOverflowingAndTabbable(el) {
  const computedStyle = getCachedComputedStyle(el);
  const { overflowY, overflowX } = computedStyle;
  if (overflowY === "scroll" || overflowX === "scroll") {
    return true;
  }
  if (overflowY !== "auto" || overflowX !== "auto") {
    return false;
  }
  const isOverflowingY = el.scrollHeight > el.clientHeight;
  if (isOverflowingY && overflowY === "auto") {
    return true;
  }
  const isOverflowingX = el.scrollWidth > el.clientWidth;
  if (isOverflowingX && overflowX === "auto") {
    return true;
  }
  return false;
}
function isTabbable(el) {
  const tag = el.tagName.toLowerCase();
  const tabindex = Number(el.getAttribute("tabindex"));
  const hasTabindex = el.hasAttribute("tabindex");
  if (hasTabindex && (isNaN(tabindex) || tabindex <= -1)) {
    return false;
  }
  if (el.hasAttribute("disabled")) {
    return false;
  }
  if (el.closest("[inert]")) {
    return false;
  }
  if (tag === "input" && el.getAttribute("type") === "radio" && !el.hasAttribute("checked")) {
    return false;
  }
  if (!isVisible(el)) {
    return false;
  }
  if ((tag === "audio" || tag === "video") && el.hasAttribute("controls")) {
    return true;
  }
  if (el.hasAttribute("tabindex")) {
    return true;
  }
  if (el.hasAttribute("contenteditable") && el.getAttribute("contenteditable") !== "false") {
    return true;
  }
  const isNativelyTabbable = [
    "button",
    "input",
    "select",
    "textarea",
    "a",
    "audio",
    "video",
    "summary",
    "iframe"
  ].includes(tag);
  if (isNativelyTabbable) {
    return true;
  }
  return isOverflowingAndTabbable(el);
}
function getSlottedChildrenOutsideRootElement(slotElement, root) {
  var _a3;
  return ((_a3 = slotElement.getRootNode({ composed: true })) == null ? void 0 : _a3.host) !== root;
}
function getTabbableElements(root) {
  const walkedEls = /* @__PURE__ */ new WeakMap();
  const tabbableElements = [];
  function walk(el) {
    if (el instanceof Element) {
      if (el.hasAttribute("inert") || el.closest("[inert]")) {
        return;
      }
      if (walkedEls.has(el)) {
        return;
      }
      walkedEls.set(el, true);
      if (!tabbableElements.includes(el) && isTabbable(el)) {
        tabbableElements.push(el);
      }
      if (el instanceof HTMLSlotElement && getSlottedChildrenOutsideRootElement(el, root)) {
        el.assignedElements({ flatten: true }).forEach((assignedEl) => {
          walk(assignedEl);
        });
      }
      if (el.shadowRoot !== null && el.shadowRoot.mode === "open") {
        walk(el.shadowRoot);
      }
    }
    for (const e12 of el.children) {
      walk(e12);
    }
  }
  walk(root);
  return tabbableElements.sort((a5, b4) => {
    const aTabindex = Number(a5.getAttribute("tabindex")) || 0;
    const bTabindex = Number(b4.getAttribute("tabindex")) || 0;
    return bTabindex - aTabindex;
  });
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.FRD7DRZ6.js
function* activeElements(activeElement = document.activeElement) {
  if (activeElement === null || activeElement === void 0) return;
  yield activeElement;
  if ("shadowRoot" in activeElement && activeElement.shadowRoot && activeElement.shadowRoot.mode !== "closed") {
    yield* __yieldStar(activeElements(activeElement.shadowRoot.activeElement));
  }
}
function getDeepestActiveElement() {
  return [...activeElements()].pop();
}
var activeModals = [];
var Modal = class {
  constructor(element) {
    this.tabDirection = "forward";
    this.handleFocusIn = () => {
      if (!this.isActive()) return;
      this.checkFocus();
    };
    this.handleKeyDown = (event) => {
      var _a3;
      if (event.key !== "Tab" || this.isExternalActivated) return;
      if (!this.isActive()) return;
      const currentActiveElement = getDeepestActiveElement();
      this.previousFocus = currentActiveElement;
      if (this.previousFocus && this.possiblyHasTabbableChildren(this.previousFocus)) {
        return;
      }
      if (event.shiftKey) {
        this.tabDirection = "backward";
      } else {
        this.tabDirection = "forward";
      }
      const tabbableElements = getTabbableElements(this.element);
      let currentFocusIndex = tabbableElements.findIndex((el) => el === currentActiveElement);
      this.previousFocus = this.currentFocus;
      const addition = this.tabDirection === "forward" ? 1 : -1;
      while (true) {
        if (currentFocusIndex + addition >= tabbableElements.length) {
          currentFocusIndex = 0;
        } else if (currentFocusIndex + addition < 0) {
          currentFocusIndex = tabbableElements.length - 1;
        } else {
          currentFocusIndex += addition;
        }
        this.previousFocus = this.currentFocus;
        const nextFocus = (
          /** @type {HTMLElement} */
          tabbableElements[currentFocusIndex]
        );
        if (this.tabDirection === "backward") {
          if (this.previousFocus && this.possiblyHasTabbableChildren(this.previousFocus)) {
            return;
          }
        }
        if (nextFocus && this.possiblyHasTabbableChildren(nextFocus)) {
          return;
        }
        event.preventDefault();
        this.currentFocus = nextFocus;
        (_a3 = this.currentFocus) == null ? void 0 : _a3.focus({ preventScroll: false });
        const allActiveElements = [...activeElements()];
        if (allActiveElements.includes(this.currentFocus) || !allActiveElements.includes(this.previousFocus)) {
          break;
        }
      }
      setTimeout(() => this.checkFocus());
    };
    this.handleKeyUp = () => {
      this.tabDirection = "forward";
    };
    this.element = element;
    this.elementsWithTabbableControls = ["iframe"];
  }
  /** Activates focus trapping. */
  activate() {
    activeModals.push(this.element);
    document.addEventListener("focusin", this.handleFocusIn);
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }
  /** Deactivates focus trapping. */
  deactivate() {
    activeModals = activeModals.filter((modal) => modal !== this.element);
    this.currentFocus = null;
    document.removeEventListener("focusin", this.handleFocusIn);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }
  /** Determines if this modal element is currently active or not. */
  isActive() {
    return activeModals[activeModals.length - 1] === this.element;
  }
  /** Activates external modal behavior and temporarily disables focus trapping. */
  activateExternal() {
    this.isExternalActivated = true;
  }
  /** Deactivates external modal behavior and re-enables focus trapping. */
  deactivateExternal() {
    this.isExternalActivated = false;
  }
  checkFocus() {
    if (this.isActive() && !this.isExternalActivated) {
      const tabbableElements = getTabbableElements(this.element);
      if (!this.element.matches(":focus-within")) {
        const start = tabbableElements[0];
        const end = tabbableElements[tabbableElements.length - 1];
        const target = this.tabDirection === "forward" ? start : end;
        if (typeof (target == null ? void 0 : target.focus) === "function") {
          this.currentFocus = target;
          target.focus({ preventScroll: false });
        }
      }
    }
  }
  possiblyHasTabbableChildren(element) {
    return this.elementsWithTabbableControls.includes(element.tagName.toLowerCase()) || element.hasAttribute("controls");
  }
};

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.RWUUFNUL.js
var locks = /* @__PURE__ */ new Set();
function getScrollbarWidth() {
  const documentWidth = document.documentElement.clientWidth;
  return Math.abs(window.innerWidth - documentWidth);
}
function getExistingBodyPadding() {
  const padding = Number(getComputedStyle(document.body).paddingRight.replace(/px/, ""));
  if (isNaN(padding) || !padding) {
    return 0;
  }
  return padding;
}
function lockBodyScrolling(lockingEl) {
  locks.add(lockingEl);
  if (!document.documentElement.classList.contains("sl-scroll-lock")) {
    const scrollbarWidth = getScrollbarWidth() + getExistingBodyPadding();
    let scrollbarGutterProperty = getComputedStyle(document.documentElement).scrollbarGutter;
    if (!scrollbarGutterProperty || scrollbarGutterProperty === "auto") {
      scrollbarGutterProperty = "stable";
    }
    if (scrollbarWidth < 2) {
      scrollbarGutterProperty = "";
    }
    document.documentElement.style.setProperty("--sl-scroll-lock-gutter", scrollbarGutterProperty);
    document.documentElement.classList.add("sl-scroll-lock");
    document.documentElement.style.setProperty("--sl-scroll-lock-size", `${scrollbarWidth}px`);
  }
}
function unlockBodyScrolling(lockingEl) {
  locks.delete(lockingEl);
  if (locks.size === 0) {
    document.documentElement.classList.remove("sl-scroll-lock");
    document.documentElement.style.removeProperty("--sl-scroll-lock-size");
  }
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.G5RKA5HF.js
var dialog_styles_default = i`
  :host {
    --width: 31rem;
    --header-spacing: var(--sl-spacing-large);
    --body-spacing: var(--sl-spacing-large);
    --footer-spacing: var(--sl-spacing-large);

    display: contents;
  }

  .dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--sl-z-index-dialog);
  }

  .dialog__panel {
    display: flex;
    flex-direction: column;
    z-index: 2;
    width: var(--width);
    max-width: calc(100% - var(--sl-spacing-2x-large));
    max-height: calc(100% - var(--sl-spacing-2x-large));
    background-color: var(--sl-panel-background-color);
    border-radius: var(--sl-border-radius-medium);
    box-shadow: var(--sl-shadow-x-large);
  }

  .dialog__panel:focus {
    outline: none;
  }

  /* Ensure there's enough vertical padding for phones that don't update vh when chrome appears (e.g. iPhone) */
  @media screen and (max-width: 420px) {
    .dialog__panel {
      max-height: 80vh;
    }
  }

  .dialog--open .dialog__panel {
    display: flex;
    opacity: 1;
  }

  .dialog__header {
    flex: 0 0 auto;
    display: flex;
  }

  .dialog__title {
    flex: 1 1 auto;
    font: inherit;
    font-size: var(--sl-font-size-large);
    line-height: var(--sl-line-height-dense);
    padding: var(--header-spacing);
    margin: 0;
  }

  .dialog__header-actions {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    gap: var(--sl-spacing-2x-small);
    padding: 0 var(--header-spacing);
  }

  .dialog__header-actions sl-icon-button,
  .dialog__header-actions ::slotted(sl-icon-button) {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
  }

  .dialog__body {
    flex: 1 1 auto;
    display: block;
    padding: var(--body-spacing);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dialog__footer {
    flex: 0 0 auto;
    text-align: right;
    padding: var(--footer-spacing);
  }

  .dialog__footer ::slotted(sl-button:not(:first-of-type)) {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  .dialog:not(.dialog--has-footer) .dialog__footer {
    display: none;
  }

  .dialog__overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--sl-overlay-background-color);
  }

  @media (forced-colors: active) {
    .dialog__panel {
      border: solid 1px var(--sl-color-neutral-0);
    }
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.6I2T3DLI.js
var icon_button_styles_default = i`
  :host {
    display: inline-block;
    color: var(--sl-color-neutral-600);
  }

  .icon-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    font-size: inherit;
    color: inherit;
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-x-fast) color;
    -webkit-appearance: none;
  }

  .icon-button:hover:not(.icon-button--disabled),
  .icon-button:focus-visible:not(.icon-button--disabled) {
    color: var(--sl-color-primary-600);
  }

  .icon-button:active:not(.icon-button--disabled) {
    color: var(--sl-color-primary-700);
  }

  .icon-button:focus {
    outline: none;
  }

  .icon-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .icon-button__icon {
    pointer-events: none;
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.MMEGYRNV.js
var SlIconButton = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.hasFocus = false;
    this.label = "";
    this.disabled = false;
  }
  handleBlur() {
    this.hasFocus = false;
    this.emit("sl-blur");
  }
  handleFocus() {
    this.hasFocus = true;
    this.emit("sl-focus");
  }
  handleClick(event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  /** Simulates a click on the icon button. */
  click() {
    this.button.click();
  }
  /** Sets focus on the icon button. */
  focus(options) {
    this.button.focus(options);
  }
  /** Removes focus from the icon button. */
  blur() {
    this.button.blur();
  }
  render() {
    const isLink = this.href ? true : false;
    const tag = isLink ? i7`a` : i7`button`;
    return u5`
      <${tag}
        part="base"
        class=${e9({
      "icon-button": true,
      "icon-button--disabled": !isLink && this.disabled,
      "icon-button--focused": this.hasFocus
    })}
        ?disabled=${o9(isLink ? void 0 : this.disabled)}
        type=${o9(isLink ? void 0 : "button")}
        href=${o9(isLink ? this.href : void 0)}
        target=${o9(isLink ? this.target : void 0)}
        download=${o9(isLink ? this.download : void 0)}
        rel=${o9(isLink && this.target ? "noreferrer noopener" : void 0)}
        role=${o9(isLink ? void 0 : "button")}
        aria-disabled=${this.disabled ? "true" : "false"}
        aria-label="${this.label}"
        tabindex=${this.disabled ? "-1" : "0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @click=${this.handleClick}
      >
        <sl-icon
          class="icon-button__icon"
          name=${o9(this.name)}
          library=${o9(this.library)}
          src=${o9(this.src)}
          aria-hidden="true"
        ></sl-icon>
      </${tag}>
    `;
  }
};
SlIconButton.styles = [component_styles_default, icon_button_styles_default];
SlIconButton.dependencies = { "sl-icon": SlIcon };
__decorateClass([
  e6(".icon-button")
], SlIconButton.prototype, "button", 2);
__decorateClass([
  r7()
], SlIconButton.prototype, "hasFocus", 2);
__decorateClass([
  n7()
], SlIconButton.prototype, "name", 2);
__decorateClass([
  n7()
], SlIconButton.prototype, "library", 2);
__decorateClass([
  n7()
], SlIconButton.prototype, "src", 2);
__decorateClass([
  n7()
], SlIconButton.prototype, "href", 2);
__decorateClass([
  n7()
], SlIconButton.prototype, "target", 2);
__decorateClass([
  n7()
], SlIconButton.prototype, "download", 2);
__decorateClass([
  n7()
], SlIconButton.prototype, "label", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlIconButton.prototype, "disabled", 2);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.K7JGTRV7.js
var defaultAnimationRegistry = /* @__PURE__ */ new Map();
var customAnimationRegistry = /* @__PURE__ */ new WeakMap();
function ensureAnimation(animation) {
  return animation != null ? animation : { keyframes: [], options: { duration: 0 } };
}
function getLogicalAnimation(animation, dir) {
  if (dir.toLowerCase() === "rtl") {
    return {
      keyframes: animation.rtlKeyframes || animation.keyframes,
      options: animation.options
    };
  }
  return animation;
}
function setDefaultAnimation(animationName, animation) {
  defaultAnimationRegistry.set(animationName, ensureAnimation(animation));
}
function getAnimation(el, animationName, options) {
  const customAnimation = customAnimationRegistry.get(el);
  if (customAnimation == null ? void 0 : customAnimation[animationName]) {
    return getLogicalAnimation(customAnimation[animationName], options.dir);
  }
  const defaultAnimation = defaultAnimationRegistry.get(animationName);
  if (defaultAnimation) {
    return getLogicalAnimation(defaultAnimation, options.dir);
  }
  return {
    keyframes: [],
    options: { duration: 0 }
  };
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.6SBTOKGT.js
var SlDialog = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "footer");
    this.localize = new LocalizeController2(this);
    this.modal = new Modal(this);
    this.open = false;
    this.label = "";
    this.noHeader = false;
    this.handleDocumentKeyDown = (event) => {
      if (event.key === "Escape" && this.modal.isActive() && this.open) {
        event.stopPropagation();
        this.requestClose("keyboard");
      }
    };
  }
  firstUpdated() {
    this.dialog.hidden = !this.open;
    if (this.open) {
      this.addOpenListeners();
      this.modal.activate();
      lockBodyScrolling(this);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.modal.deactivate();
    unlockBodyScrolling(this);
    this.removeOpenListeners();
  }
  requestClose(source) {
    const slRequestClose = this.emit("sl-request-close", {
      cancelable: true,
      detail: { source }
    });
    if (slRequestClose.defaultPrevented) {
      const animation = getAnimation(this, "dialog.denyClose", { dir: this.localize.dir() });
      animateTo(this.panel, animation.keyframes, animation.options);
      return;
    }
    this.hide();
  }
  addOpenListeners() {
    var _a3;
    if ("CloseWatcher" in window) {
      (_a3 = this.closeWatcher) == null ? void 0 : _a3.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => this.requestClose("keyboard");
    } else {
      document.addEventListener("keydown", this.handleDocumentKeyDown);
    }
  }
  removeOpenListeners() {
    var _a3;
    (_a3 = this.closeWatcher) == null ? void 0 : _a3.destroy();
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
  }
  async handleOpenChange() {
    if (this.open) {
      this.emit("sl-show");
      this.addOpenListeners();
      this.originalTrigger = document.activeElement;
      this.modal.activate();
      lockBodyScrolling(this);
      const autoFocusTarget = this.querySelector("[autofocus]");
      if (autoFocusTarget) {
        autoFocusTarget.removeAttribute("autofocus");
      }
      await Promise.all([stopAnimations(this.dialog), stopAnimations(this.overlay)]);
      this.dialog.hidden = false;
      requestAnimationFrame(() => {
        const slInitialFocus = this.emit("sl-initial-focus", { cancelable: true });
        if (!slInitialFocus.defaultPrevented) {
          if (autoFocusTarget) {
            autoFocusTarget.focus({ preventScroll: true });
          } else {
            this.panel.focus({ preventScroll: true });
          }
        }
        if (autoFocusTarget) {
          autoFocusTarget.setAttribute("autofocus", "");
        }
      });
      const panelAnimation = getAnimation(this, "dialog.show", { dir: this.localize.dir() });
      const overlayAnimation = getAnimation(this, "dialog.overlay.show", { dir: this.localize.dir() });
      await Promise.all([
        animateTo(this.panel, panelAnimation.keyframes, panelAnimation.options),
        animateTo(this.overlay, overlayAnimation.keyframes, overlayAnimation.options)
      ]);
      this.emit("sl-after-show");
    } else {
      this.emit("sl-hide");
      this.removeOpenListeners();
      this.modal.deactivate();
      await Promise.all([stopAnimations(this.dialog), stopAnimations(this.overlay)]);
      const panelAnimation = getAnimation(this, "dialog.hide", { dir: this.localize.dir() });
      const overlayAnimation = getAnimation(this, "dialog.overlay.hide", { dir: this.localize.dir() });
      await Promise.all([
        animateTo(this.overlay, overlayAnimation.keyframes, overlayAnimation.options).then(() => {
          this.overlay.hidden = true;
        }),
        animateTo(this.panel, panelAnimation.keyframes, panelAnimation.options).then(() => {
          this.panel.hidden = true;
        })
      ]);
      this.dialog.hidden = true;
      this.overlay.hidden = false;
      this.panel.hidden = false;
      unlockBodyScrolling(this);
      const trigger = this.originalTrigger;
      if (typeof (trigger == null ? void 0 : trigger.focus) === "function") {
        setTimeout(() => trigger.focus());
      }
      this.emit("sl-after-hide");
    }
  }
  /** Shows the dialog. */
  async show() {
    if (this.open) {
      return void 0;
    }
    this.open = true;
    return waitForEvent(this, "sl-after-show");
  }
  /** Hides the dialog */
  async hide() {
    if (!this.open) {
      return void 0;
    }
    this.open = false;
    return waitForEvent(this, "sl-after-hide");
  }
  render() {
    return x2`
      <div
        part="base"
        class=${e9({
      dialog: true,
      "dialog--open": this.open,
      "dialog--has-footer": this.hasSlotController.test("footer")
    })}
      >
        <div part="overlay" class="dialog__overlay" @click=${() => this.requestClose("overlay")} tabindex="-1"></div>

        <div
          part="panel"
          class="dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-hidden=${this.open ? "false" : "true"}
          aria-label=${o9(this.noHeader ? this.label : void 0)}
          aria-labelledby=${o9(!this.noHeader ? "title" : void 0)}
          tabindex="-1"
        >
          ${!this.noHeader ? x2`
                <header part="header" class="dialog__header">
                  <h2 part="title" class="dialog__title" id="title">
                    <slot name="label"> ${this.label.length > 0 ? this.label : String.fromCharCode(65279)} </slot>
                  </h2>
                  <div part="header-actions" class="dialog__header-actions">
                    <slot name="header-actions"></slot>
                    <sl-icon-button
                      part="close-button"
                      exportparts="base:close-button__base"
                      class="dialog__close"
                      name="x-lg"
                      label=${this.localize.term("close")}
                      library="system"
                      @click="${() => this.requestClose("close-button")}"
                    ></sl-icon-button>
                  </div>
                </header>
              ` : ""}
          ${""}
          <div part="body" class="dialog__body" tabindex="-1"><slot></slot></div>

          <footer part="footer" class="dialog__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    `;
  }
};
SlDialog.styles = [component_styles_default, dialog_styles_default];
SlDialog.dependencies = {
  "sl-icon-button": SlIconButton
};
__decorateClass([
  e6(".dialog")
], SlDialog.prototype, "dialog", 2);
__decorateClass([
  e6(".dialog__panel")
], SlDialog.prototype, "panel", 2);
__decorateClass([
  e6(".dialog__overlay")
], SlDialog.prototype, "overlay", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlDialog.prototype, "open", 2);
__decorateClass([
  n7({ reflect: true })
], SlDialog.prototype, "label", 2);
__decorateClass([
  n7({ attribute: "no-header", type: Boolean, reflect: true })
], SlDialog.prototype, "noHeader", 2);
__decorateClass([
  watch("open", { waitUntilFirstUpdate: true })
], SlDialog.prototype, "handleOpenChange", 1);
setDefaultAnimation("dialog.show", {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 250, easing: "ease" }
});
setDefaultAnimation("dialog.hide", {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 250, easing: "ease" }
});
setDefaultAnimation("dialog.denyClose", {
  keyframes: [{ scale: 1 }, { scale: 1.02 }, { scale: 1 }],
  options: { duration: 250 }
});
setDefaultAnimation("dialog.overlay.show", {
  keyframes: [{ opacity: 0 }, { opacity: 1 }],
  options: { duration: 250 }
});
setDefaultAnimation("dialog.overlay.hide", {
  keyframes: [{ opacity: 1 }, { opacity: 0 }],
  options: { duration: 250 }
});

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.SUSCR7CI.js
var divider_styles_default = i`
  :host {
    --color: var(--sl-panel-border-color);
    --width: var(--sl-panel-border-width);
    --spacing: var(--sl-spacing-medium);
  }

  :host(:not([vertical])) {
    display: block;
    border-top: solid var(--width) var(--color);
    margin: var(--spacing) 0;
  }

  :host([vertical]) {
    display: inline-block;
    height: 100%;
    border-left: solid var(--width) var(--color);
    margin: 0 var(--spacing);
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.FWNMG5P5.js
var SlDivider = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.vertical = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "separator");
  }
  handleVerticalChange() {
    this.setAttribute("aria-orientation", this.vertical ? "vertical" : "horizontal");
  }
};
SlDivider.styles = [component_styles_default, divider_styles_default];
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlDivider.prototype, "vertical", 2);
__decorateClass([
  watch("vertical")
], SlDivider.prototype, "handleVerticalChange", 1);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.GGT72J62.js
var input_styles_default = i`
  :host {
    display: block;
  }

  .input {
    flex: 1 1 auto;
    display: inline-flex;
    align-items: stretch;
    justify-content: start;
    position: relative;
    width: 100%;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    letter-spacing: var(--sl-input-letter-spacing);
    vertical-align: middle;
    overflow: hidden;
    cursor: text;
    transition:
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) border,
      var(--sl-transition-fast) box-shadow,
      var(--sl-transition-fast) background-color;
  }

  /* Standard inputs */
  .input--standard {
    background-color: var(--sl-input-background-color);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  }

  .input--standard:hover:not(.input--disabled) {
    background-color: var(--sl-input-background-color-hover);
    border-color: var(--sl-input-border-color-hover);
  }

  .input--standard.input--focused:not(.input--disabled) {
    background-color: var(--sl-input-background-color-focus);
    border-color: var(--sl-input-border-color-focus);
    box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
  }

  .input--standard.input--focused:not(.input--disabled) .input__control {
    color: var(--sl-input-color-focus);
  }

  .input--standard.input--disabled {
    background-color: var(--sl-input-background-color-disabled);
    border-color: var(--sl-input-border-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input--standard.input--disabled .input__control {
    color: var(--sl-input-color-disabled);
  }

  .input--standard.input--disabled .input__control::placeholder {
    color: var(--sl-input-placeholder-color-disabled);
  }

  /* Filled inputs */
  .input--filled {
    border: none;
    background-color: var(--sl-input-filled-background-color);
    color: var(--sl-input-color);
  }

  .input--filled:hover:not(.input--disabled) {
    background-color: var(--sl-input-filled-background-color-hover);
  }

  .input--filled.input--focused:not(.input--disabled) {
    background-color: var(--sl-input-filled-background-color-focus);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .input--filled.input--disabled {
    background-color: var(--sl-input-filled-background-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input__control {
    flex: 1 1 auto;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    min-width: 0;
    height: 100%;
    color: var(--sl-input-color);
    border: none;
    background: inherit;
    box-shadow: none;
    padding: 0;
    margin: 0;
    cursor: inherit;
    -webkit-appearance: none;
  }

  .input__control::-webkit-search-decoration,
  .input__control::-webkit-search-cancel-button,
  .input__control::-webkit-search-results-button,
  .input__control::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  .input__control:-webkit-autofill,
  .input__control:-webkit-autofill:hover,
  .input__control:-webkit-autofill:focus,
  .input__control:-webkit-autofill:active {
    box-shadow: 0 0 0 var(--sl-input-height-large) var(--sl-input-background-color-hover) inset !important;
    -webkit-text-fill-color: var(--sl-color-primary-500);
    caret-color: var(--sl-input-color);
  }

  .input--filled .input__control:-webkit-autofill,
  .input--filled .input__control:-webkit-autofill:hover,
  .input--filled .input__control:-webkit-autofill:focus,
  .input--filled .input__control:-webkit-autofill:active {
    box-shadow: 0 0 0 var(--sl-input-height-large) var(--sl-input-filled-background-color) inset !important;
  }

  .input__control::placeholder {
    color: var(--sl-input-placeholder-color);
    user-select: none;
    -webkit-user-select: none;
  }

  .input:hover:not(.input--disabled) .input__control {
    color: var(--sl-input-color-hover);
  }

  .input__control:focus {
    outline: none;
  }

  .input__prefix,
  .input__suffix {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    cursor: default;
  }

  .input__prefix ::slotted(sl-icon),
  .input__suffix ::slotted(sl-icon) {
    color: var(--sl-input-icon-color);
  }

  /*
   * Size modifiers
   */

  .input--small {
    border-radius: var(--sl-input-border-radius-small);
    font-size: var(--sl-input-font-size-small);
    height: var(--sl-input-height-small);
  }

  .input--small .input__control {
    height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-small);
  }

  .input--small .input__clear,
  .input--small .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-small) * 2);
  }

  .input--small .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-small);
  }

  .input--small .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-small);
  }

  .input--medium {
    border-radius: var(--sl-input-border-radius-medium);
    font-size: var(--sl-input-font-size-medium);
    height: var(--sl-input-height-medium);
  }

  .input--medium .input__control {
    height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-medium);
  }

  .input--medium .input__clear,
  .input--medium .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-medium) * 2);
  }

  .input--medium .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-medium);
  }

  .input--medium .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-medium);
  }

  .input--large {
    border-radius: var(--sl-input-border-radius-large);
    font-size: var(--sl-input-font-size-large);
    height: var(--sl-input-height-large);
  }

  .input--large .input__control {
    height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-large);
  }

  .input--large .input__clear,
  .input--large .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-large) * 2);
  }

  .input--large .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-large);
  }

  .input--large .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-large);
  }

  /*
   * Pill modifier
   */

  .input--pill.input--small {
    border-radius: var(--sl-input-height-small);
  }

  .input--pill.input--medium {
    border-radius: var(--sl-input-height-medium);
  }

  .input--pill.input--large {
    border-radius: var(--sl-input-height-large);
  }

  /*
   * Clearable + Password Toggle
   */

  .input__clear,
  .input__password-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
    color: var(--sl-input-icon-color);
    border: none;
    background: none;
    padding: 0;
    transition: var(--sl-transition-fast) color;
    cursor: pointer;
  }

  .input__clear:hover,
  .input__password-toggle:hover {
    color: var(--sl-input-icon-color-hover);
  }

  .input__clear:focus,
  .input__password-toggle:focus {
    outline: none;
  }

  /* Don't show the browser's password toggle in Edge */
  ::-ms-reveal {
    display: none;
  }

  /* Hide the built-in number spinner */
  .input--no-spin-buttons input[type='number']::-webkit-outer-spin-button,
  .input--no-spin-buttons input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    display: none;
  }

  .input--no-spin-buttons input[type='number'] {
    -moz-appearance: textfield;
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.GI7VDIWX.js
var defaultValue = (propertyName = "value") => (proto, key) => {
  const ctor = proto.constructor;
  const attributeChangedCallback = ctor.prototype.attributeChangedCallback;
  ctor.prototype.attributeChangedCallback = function(name, old, value) {
    var _a3;
    const options = ctor.getPropertyOptions(propertyName);
    const attributeName = typeof options.attribute === "string" ? options.attribute : propertyName;
    if (name === attributeName) {
      const converter = options.converter || u2;
      const fromAttribute = typeof converter === "function" ? converter : (_a3 = converter == null ? void 0 : converter.fromAttribute) != null ? _a3 : u2.fromAttribute;
      const newValue = fromAttribute(value, options.type);
      if (this[propertyName] !== newValue) {
        this[key] = newValue;
      }
    }
    attributeChangedCallback.call(this, name, old, value);
  };
};

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.SI4ACBFK.js
var form_control_styles_default = i`
  .form-control .form-control__label {
    display: none;
  }

  .form-control .form-control__help-text {
    display: none;
  }

  /* Label */
  .form-control--has-label .form-control__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    margin-bottom: var(--sl-spacing-3x-small);
  }

  .form-control--has-label.form-control--small .form-control__label {
    font-size: var(--sl-input-label-font-size-small);
  }

  .form-control--has-label.form-control--medium .form-control__label {
    font-size: var(--sl-input-label-font-size-medium);
  }

  .form-control--has-label.form-control--large .form-control__label {
    font-size: var(--sl-input-label-font-size-large);
  }

  :host([required]) .form-control--has-label .form-control__label::after {
    content: var(--sl-input-required-content);
    margin-inline-start: var(--sl-input-required-content-offset);
    color: var(--sl-input-required-content-color);
  }

  /* Help text */
  .form-control--has-help-text .form-control__help-text {
    display: block;
    color: var(--sl-input-help-text-color);
    margin-top: var(--sl-spacing-3x-small);
  }

  .form-control--has-help-text.form-control--small .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-small);
  }

  .form-control--has-help-text.form-control--medium .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-medium);
  }

  .form-control--has-help-text.form-control--large .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-large);
  }

  .form-control--has-help-text.form-control--radio-group .form-control__help-text {
    margin-top: var(--sl-spacing-2x-small);
  }
`;

// node_modules/lit-html/directives/live.js
var l5 = e8(class extends i6 {
  constructor(r11) {
    if (super(r11), r11.type !== t5.PROPERTY && r11.type !== t5.ATTRIBUTE && r11.type !== t5.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
    if (!f6(r11)) throw Error("`live` bindings can only contain a single expression");
  }
  render(r11) {
    return r11;
  }
  update(i9, [t7]) {
    if (t7 === T2 || t7 === E2) return t7;
    const o12 = i9.element, l6 = i9.name;
    if (i9.type === t5.PROPERTY) {
      if (t7 === o12[l6]) return T2;
    } else if (i9.type === t5.BOOLEAN_ATTRIBUTE) {
      if (!!t7 === o12.hasAttribute(l6)) return T2;
    } else if (i9.type === t5.ATTRIBUTE && o12.getAttribute(l6) === t7 + "") return T2;
    return m3(i9), t7;
  }
});

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.22JN5JYK.js
var SlInput = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.formControlController = new FormControlController(this, {
      assumeInteractionOn: ["sl-blur", "sl-input"]
    });
    this.hasSlotController = new HasSlotController(this, "help-text", "label");
    this.localize = new LocalizeController2(this);
    this.hasFocus = false;
    this.title = "";
    this.__numberInput = Object.assign(document.createElement("input"), { type: "number" });
    this.__dateInput = Object.assign(document.createElement("input"), { type: "date" });
    this.type = "text";
    this.name = "";
    this.value = "";
    this.defaultValue = "";
    this.size = "medium";
    this.filled = false;
    this.pill = false;
    this.label = "";
    this.helpText = "";
    this.clearable = false;
    this.disabled = false;
    this.placeholder = "";
    this.readonly = false;
    this.passwordToggle = false;
    this.passwordVisible = false;
    this.noSpinButtons = false;
    this.form = "";
    this.required = false;
    this.spellcheck = true;
  }
  //
  // NOTE: We use an in-memory input for these getters/setters instead of the one in the template because the properties
  // can be set before the component is rendered.
  //
  /**
   * Gets or sets the current value as a `Date` object. Returns `null` if the value can't be converted. This will use the native `<input type="{{type}}">` implementation and may result in an error.
   */
  get valueAsDate() {
    var _a3;
    this.__dateInput.type = this.type;
    this.__dateInput.value = this.value;
    return ((_a3 = this.input) == null ? void 0 : _a3.valueAsDate) || this.__dateInput.valueAsDate;
  }
  set valueAsDate(newValue) {
    this.__dateInput.type = this.type;
    this.__dateInput.valueAsDate = newValue;
    this.value = this.__dateInput.value;
  }
  /** Gets or sets the current value as a number. Returns `NaN` if the value can't be converted. */
  get valueAsNumber() {
    var _a3;
    this.__numberInput.value = this.value;
    return ((_a3 = this.input) == null ? void 0 : _a3.valueAsNumber) || this.__numberInput.valueAsNumber;
  }
  set valueAsNumber(newValue) {
    this.__numberInput.valueAsNumber = newValue;
    this.value = this.__numberInput.value;
  }
  /** Gets the validity state object */
  get validity() {
    return this.input.validity;
  }
  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }
  firstUpdated() {
    this.formControlController.updateValidity();
  }
  handleBlur() {
    this.hasFocus = false;
    this.emit("sl-blur");
  }
  handleChange() {
    this.value = this.input.value;
    this.emit("sl-change");
  }
  handleClearClick(event) {
    event.preventDefault();
    if (this.value !== "") {
      this.value = "";
      this.emit("sl-clear");
      this.emit("sl-input");
      this.emit("sl-change");
    }
    this.input.focus();
  }
  handleFocus() {
    this.hasFocus = true;
    this.emit("sl-focus");
  }
  handleInput() {
    this.value = this.input.value;
    this.formControlController.updateValidity();
    this.emit("sl-input");
  }
  handleInvalid(event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }
  handleKeyDown(event) {
    const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.key === "Enter" && !hasModifier) {
      setTimeout(() => {
        if (!event.defaultPrevented && !event.isComposing) {
          this.formControlController.submit();
        }
      });
    }
  }
  handlePasswordToggle() {
    this.passwordVisible = !this.passwordVisible;
  }
  handleDisabledChange() {
    this.formControlController.setValidity(this.disabled);
  }
  handleStepChange() {
    this.input.step = String(this.step);
    this.formControlController.updateValidity();
  }
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }
  /** Sets focus on the input. */
  focus(options) {
    this.input.focus(options);
  }
  /** Removes focus from the input. */
  blur() {
    this.input.blur();
  }
  /** Selects all the text in the input. */
  select() {
    this.input.select();
  }
  /** Sets the start and end positions of the text selection (0-based). */
  setSelectionRange(selectionStart, selectionEnd, selectionDirection = "none") {
    this.input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }
  /** Replaces a range of text with a new string. */
  setRangeText(replacement, start, end, selectMode = "preserve") {
    const selectionStart = start != null ? start : this.input.selectionStart;
    const selectionEnd = end != null ? end : this.input.selectionEnd;
    this.input.setRangeText(replacement, selectionStart, selectionEnd, selectMode);
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }
  /** Displays the browser picker for an input element (only works if the browser supports it for the input type). */
  showPicker() {
    if ("showPicker" in HTMLInputElement.prototype) {
      this.input.showPicker();
    }
  }
  /** Increments the value of a numeric input type by the value of the step attribute. */
  stepUp() {
    this.input.stepUp();
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }
  /** Decrements the value of a numeric input type by the value of the step attribute. */
  stepDown() {
    this.input.stepDown();
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }
  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    return this.input.checkValidity();
  }
  /** Gets the associated form, if one exists. */
  getForm() {
    return this.formControlController.getForm();
  }
  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.input.reportValidity();
  }
  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message) {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }
  render() {
    const hasLabelSlot = this.hasSlotController.test("label");
    const hasHelpTextSlot = this.hasSlotController.test("help-text");
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHelpText = this.helpText ? true : !!hasHelpTextSlot;
    const hasClearIcon = this.clearable && !this.disabled && !this.readonly;
    const isClearIconVisible = hasClearIcon && (typeof this.value === "number" || this.value.length > 0);
    return x2`
      <div
        part="form-control"
        class=${e9({
      "form-control": true,
      "form-control--small": this.size === "small",
      "form-control--medium": this.size === "medium",
      "form-control--large": this.size === "large",
      "form-control--has-label": hasLabel,
      "form-control--has-help-text": hasHelpText
    })}
      >
        <label
          part="form-control-label"
          class="form-control__label"
          for="input"
          aria-hidden=${hasLabel ? "false" : "true"}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <div
            part="base"
            class=${e9({
      input: true,
      // Sizes
      "input--small": this.size === "small",
      "input--medium": this.size === "medium",
      "input--large": this.size === "large",
      // States
      "input--pill": this.pill,
      "input--standard": !this.filled,
      "input--filled": this.filled,
      "input--disabled": this.disabled,
      "input--focused": this.hasFocus,
      "input--empty": !this.value,
      "input--no-spin-buttons": this.noSpinButtons
    })}
          >
            <span part="prefix" class="input__prefix">
              <slot name="prefix"></slot>
            </span>

            <input
              part="input"
              id="input"
              class="input__control"
              type=${this.type === "password" && this.passwordVisible ? "text" : this.type}
              title=${this.title}
              name=${o9(this.name)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              ?required=${this.required}
              placeholder=${o9(this.placeholder)}
              minlength=${o9(this.minlength)}
              maxlength=${o9(this.maxlength)}
              min=${o9(this.min)}
              max=${o9(this.max)}
              step=${o9(this.step)}
              .value=${l5(this.value)}
              autocapitalize=${o9(this.autocapitalize)}
              autocomplete=${o9(this.autocomplete)}
              autocorrect=${o9(this.autocorrect)}
              ?autofocus=${this.autofocus}
              spellcheck=${this.spellcheck}
              pattern=${o9(this.pattern)}
              enterkeyhint=${o9(this.enterkeyhint)}
              inputmode=${o9(this.inputmode)}
              aria-describedby="help-text"
              @change=${this.handleChange}
              @input=${this.handleInput}
              @invalid=${this.handleInvalid}
              @keydown=${this.handleKeyDown}
              @focus=${this.handleFocus}
              @blur=${this.handleBlur}
            />

            ${isClearIconVisible ? x2`
                  <button
                    part="clear-button"
                    class="input__clear"
                    type="button"
                    aria-label=${this.localize.term("clearEntry")}
                    @click=${this.handleClearClick}
                    tabindex="-1"
                  >
                    <slot name="clear-icon">
                      <sl-icon name="x-circle-fill" library="system"></sl-icon>
                    </slot>
                  </button>
                ` : ""}
            ${this.passwordToggle && !this.disabled ? x2`
                  <button
                    part="password-toggle-button"
                    class="input__password-toggle"
                    type="button"
                    aria-label=${this.localize.term(this.passwordVisible ? "hidePassword" : "showPassword")}
                    @click=${this.handlePasswordToggle}
                    tabindex="-1"
                  >
                    ${this.passwordVisible ? x2`
                          <slot name="show-password-icon">
                            <sl-icon name="eye-slash" library="system"></sl-icon>
                          </slot>
                        ` : x2`
                          <slot name="hide-password-icon">
                            <sl-icon name="eye" library="system"></sl-icon>
                          </slot>
                        `}
                  </button>
                ` : ""}

            <span part="suffix" class="input__suffix">
              <slot name="suffix"></slot>
            </span>
          </div>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? "false" : "true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `;
  }
};
SlInput.styles = [component_styles_default, form_control_styles_default, input_styles_default];
SlInput.dependencies = { "sl-icon": SlIcon };
__decorateClass([
  e6(".input__control")
], SlInput.prototype, "input", 2);
__decorateClass([
  r7()
], SlInput.prototype, "hasFocus", 2);
__decorateClass([
  n7()
], SlInput.prototype, "title", 2);
__decorateClass([
  n7({ reflect: true })
], SlInput.prototype, "type", 2);
__decorateClass([
  n7()
], SlInput.prototype, "name", 2);
__decorateClass([
  n7()
], SlInput.prototype, "value", 2);
__decorateClass([
  defaultValue()
], SlInput.prototype, "defaultValue", 2);
__decorateClass([
  n7({ reflect: true })
], SlInput.prototype, "size", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlInput.prototype, "filled", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlInput.prototype, "pill", 2);
__decorateClass([
  n7()
], SlInput.prototype, "label", 2);
__decorateClass([
  n7({ attribute: "help-text" })
], SlInput.prototype, "helpText", 2);
__decorateClass([
  n7({ type: Boolean })
], SlInput.prototype, "clearable", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlInput.prototype, "disabled", 2);
__decorateClass([
  n7()
], SlInput.prototype, "placeholder", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlInput.prototype, "readonly", 2);
__decorateClass([
  n7({ attribute: "password-toggle", type: Boolean })
], SlInput.prototype, "passwordToggle", 2);
__decorateClass([
  n7({ attribute: "password-visible", type: Boolean })
], SlInput.prototype, "passwordVisible", 2);
__decorateClass([
  n7({ attribute: "no-spin-buttons", type: Boolean })
], SlInput.prototype, "noSpinButtons", 2);
__decorateClass([
  n7({ reflect: true })
], SlInput.prototype, "form", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlInput.prototype, "required", 2);
__decorateClass([
  n7()
], SlInput.prototype, "pattern", 2);
__decorateClass([
  n7({ type: Number })
], SlInput.prototype, "minlength", 2);
__decorateClass([
  n7({ type: Number })
], SlInput.prototype, "maxlength", 2);
__decorateClass([
  n7()
], SlInput.prototype, "min", 2);
__decorateClass([
  n7()
], SlInput.prototype, "max", 2);
__decorateClass([
  n7()
], SlInput.prototype, "step", 2);
__decorateClass([
  n7()
], SlInput.prototype, "autocapitalize", 2);
__decorateClass([
  n7()
], SlInput.prototype, "autocorrect", 2);
__decorateClass([
  n7()
], SlInput.prototype, "autocomplete", 2);
__decorateClass([
  n7({ type: Boolean })
], SlInput.prototype, "autofocus", 2);
__decorateClass([
  n7()
], SlInput.prototype, "enterkeyhint", 2);
__decorateClass([
  n7({
    type: Boolean,
    converter: {
      // Allow "true|false" attribute values but keep the property boolean
      fromAttribute: (value) => !value || value === "false" ? false : true,
      toAttribute: (value) => value ? "true" : "false"
    }
  })
], SlInput.prototype, "spellcheck", 2);
__decorateClass([
  n7()
], SlInput.prototype, "inputmode", 2);
__decorateClass([
  watch("disabled", { waitUntilFirstUpdate: true })
], SlInput.prototype, "handleDisabledChange", 1);
__decorateClass([
  watch("step", { waitUntilFirstUpdate: true })
], SlInput.prototype, "handleStepChange", 1);
__decorateClass([
  watch("value", { waitUntilFirstUpdate: true })
], SlInput.prototype, "handleValueChange", 1);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.3KSWVBQ5.js
var popup_styles_default = i`
  :host {
    --arrow-color: var(--sl-color-neutral-1000);
    --arrow-size: 6px;

    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant
     * 0.7071 is derived from sin(45), which is the diagonal size of the arrow's container after rotating.
     */
    --arrow-size-diagonal: calc(var(--arrow-size) * 0.7071);
    --arrow-padding-offset: calc(var(--arrow-size-diagonal) - var(--arrow-size));

    display: contents;
  }

  .popup {
    position: absolute;
    isolation: isolate;
    max-width: var(--auto-size-available-width, none);
    max-height: var(--auto-size-available-height, none);
  }

  .popup--fixed {
    position: fixed;
  }

  .popup:not(.popup--active) {
    display: none;
  }

  .popup__arrow {
    position: absolute;
    width: calc(var(--arrow-size-diagonal) * 2);
    height: calc(var(--arrow-size-diagonal) * 2);
    rotate: 45deg;
    background: var(--arrow-color);
    z-index: -1;
  }

  /* Hover bridge */
  .popup-hover-bridge:not(.popup-hover-bridge--visible) {
    display: none;
  }

  .popup-hover-bridge {
    position: fixed;
    z-index: calc(var(--sl-z-index-dropdown) - 1);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }
`;

// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var min = Math.min;
var max = Math.max;
var round = Math.round;
var floor = Math.floor;
var createCoords = (v3) => ({
  x: v3,
  y: v3
});
var oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
var oppositeAlignmentMap = {
  start: "end",
  end: "start"
};
function clamp2(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ["left", "right"];
  const rl = ["right", "left"];
  const tb = ["top", "bottom"];
  const bt = ["bottom", "top"];
  switch (side) {
    case "top":
    case "bottom":
      if (rtl) return isStart ? rl : lr;
      return isStart ? lr : rl;
    case "left":
    case "right":
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x: x3,
    y: y4,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y4,
    left: x3,
    right: x3 + width,
    bottom: y4 + height,
    x: x3,
    y: y4
  };
}

// node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
var computePosition = async (reference, floating, config) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x: x3,
    y: y4
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i9 = 0; i9 < validMiddleware.length; i9++) {
    const {
      name,
      fn
    } = validMiddleware[i9];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x: x3,
      y: y4,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platform2,
      elements: {
        reference,
        floating
      }
    });
    x3 = nextX != null ? nextX : x3;
    y4 = nextY != null ? nextY : y4;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x: x3,
          y: y4
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i9 = -1;
    }
  }
  return {
    x: x3,
    y: y4,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x: x3,
    y: y4,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x: x3,
    y: y4,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
var arrow = (options) => ({
  name: "arrow",
  options,
  async fn(state) {
    const {
      x: x3,
      y: y4,
      placement,
      rects,
      platform: platform2,
      elements,
      middlewareData
    } = state;
    const {
      element,
      padding = 0
    } = evaluate(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x: x3,
      y: y4
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform2.getDimensions(element);
    const isYAxis = axis === "y";
    const minProp = isYAxis ? "top" : "left";
    const maxProp = isYAxis ? "bottom" : "right";
    const clientProp = isYAxis ? "clientHeight" : "clientWidth";
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
    if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
    const min$1 = minPadding;
    const max2 = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset3 = clamp2(min$1, center, max2);
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset3 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max2 : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset3,
        centerOffset: center - offset3 - alignmentOffset,
        ...shouldAddOffset && {
          alignmentOffset
        }
      },
      reset: shouldAddOffset
    };
  }
});
var flip = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements2 = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements2[nextIndex];
        if (nextPlacement) {
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d4) => d4.overflows[0] <= 0).sort((a5, b4) => a5.overflows[1] - b4.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d4) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d4.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d4) => [d4.placement, d4.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a5, b4) => a5[1] - b4[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
var offset = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x: x3,
        y: y4,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x3 + diffCoords.x,
        y: y4 + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
var shift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state) {
      const {
        x: x3,
        y: y4,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: (_ref) => {
            let {
              x: x4,
              y: y5
            } = _ref;
            return {
              x: x4,
              y: y5
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x: x3,
        y: y4
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === "y" ? "top" : "left";
        const maxSide = mainAxis === "y" ? "bottom" : "right";
        const min2 = mainAxisCoord + overflow[minSide];
        const max2 = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp2(min2, mainAxisCoord, max2);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === "y" ? "top" : "left";
        const maxSide = crossAxis === "y" ? "bottom" : "right";
        const min2 = crossAxisCoord + overflow[minSide];
        const max2 = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp2(min2, crossAxisCoord, max2);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x3,
          y: limitedCoords.y - y4,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};
var size = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "size",
    options,
    async fn(state) {
      var _state$middlewareData, _state$middlewareData2;
      const {
        placement,
        rects,
        platform: platform2,
        elements
      } = state;
      const {
        apply = () => {
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === "y";
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === "top" || side === "bottom") {
        heightSide = side;
        widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
      } else {
        widthSide = side;
        heightSide = alignment === "end" ? "top" : "bottom";
      }
      const maximumClippingHeight = height - overflow.top - overflow.bottom;
      const maximumClippingWidth = width - overflow.left - overflow.right;
      const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
      const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
      const noShift = !state.middlewareData.shift;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) {
        availableWidth = maximumClippingWidth;
      }
      if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) {
        availableHeight = maximumClippingHeight;
      }
      if (noShift && !alignment) {
        const xMin = max(overflow.left, 0);
        const xMax = max(overflow.right, 0);
        const yMin = max(overflow.top, 0);
        const yMax = max(overflow.bottom, 0);
        if (isYAxis) {
          availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
        } else {
          availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
        }
      }
      await apply({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform2.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};

// node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}
function isTableElement(element) {
  return ["table", "td", "th"].includes(getNodeName(element));
}
function isTopLayer(element) {
  return [":popover-open", ":modal"].some((selector) => {
    try {
      return element.matches(selector);
    } catch (e12) {
      return false;
    }
  });
}
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
  return ["transform", "translate", "scale", "rotate", "perspective"].some((value) => css[value] ? css[value] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || ["transform", "translate", "scale", "rotate", "perspective", "filter"].some((value) => (css.willChange || "").includes(value)) || ["paint", "layout", "strict", "content"].some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
function isLastTraversableNode(node) {
  return ["html", "body", "#document"].includes(getNodeName(node));
}
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
  const css = getComputedStyle2(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $: $4
  } = getCssDimensions(domElement);
  let x3 = ($4 ? round(rect.width) : rect.width) / width;
  let y4 = ($4 ? round(rect.height) : rect.height) / height;
  if (!x3 || !Number.isFinite(x3)) {
    x3 = 1;
  }
  if (!y4 || !Number.isFinite(y4)) {
    y4 = 1;
  }
  return {
    x: x3,
    y: y4
  };
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x3 = (clientRect.left + visualOffsets.x) / scale.x;
  let y4 = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle2(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x3 *= iframeScale.x;
      y4 *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x3 += left;
      y4 += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x: x3,
    y: y4
  });
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
  if (ignoreScrollbarX === void 0) {
    ignoreScrollbarX = false;
  }
  const htmlRect = documentElement.getBoundingClientRect();
  const x3 = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 : (
    // RTL <body> scrollbar.
    getWindowScrollBarX(documentElement, htmlRect)
  ));
  const y4 = htmlRect.top + scroll.scrollTop;
  return {
    x: x3,
    y: y4
  };
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x3 = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y4 = -scroll.scrollTop;
  if (getComputedStyle2(body).direction === "rtl") {
    x3 += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x: x3,
    y: y4
  };
}
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x3 = 0;
  let y4 = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x3 = visualViewport.offsetLeft;
      y4 = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x3,
    y: y4
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x3 = left * scale.x;
  const y4 = top * scale.y;
  return {
    width,
    height,
    x: x3,
    y: y4
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle2(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle2(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x3 = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y4 = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x: x3,
    y: y4,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle2(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle2(element).direction === "rtl";
}
var platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
function rectsAreEqual(a5, b4) {
  return a5.x === b4.x && a5.y === b4.y && a5.width === b4.width && a5.height === b4.height;
}
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1e3);
        } else {
          refresh(false, ratio);
        }
      }
      if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        refresh();
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e12) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update2, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update2, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update2);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update2) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver2;
          (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.observe(floating);
        });
      }
      update2();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update2();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update2();
  return () => {
    var _resizeObserver2;
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update2);
      ancestorResize && ancestor.removeEventListener("resize", update2);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
var offset2 = offset;
var shift2 = shift;
var flip2 = flip;
var size2 = size;
var arrow2 = arrow;
var computePosition2 = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

// node_modules/composed-offset-position/dist/composed-offset-position.browser.min.mjs
function e11(t7) {
  return i8(t7);
}
function r10(t7) {
  return t7.assignedSlot ? t7.assignedSlot : t7.parentNode instanceof ShadowRoot ? t7.parentNode.host : t7.parentNode;
}
function i8(e12) {
  for (let t7 = e12; t7; t7 = r10(t7)) if (t7 instanceof Element && "none" === getComputedStyle(t7).display) return null;
  for (let n10 = r10(e12); n10; n10 = r10(n10)) {
    if (!(n10 instanceof Element)) continue;
    const e13 = getComputedStyle(n10);
    if ("contents" !== e13.display) {
      if ("static" !== e13.position || isContainingBlock(e13)) return n10;
      if ("BODY" === n10.tagName) return n10;
    }
  }
  return null;
}

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.AR3BL5H3.js
function isVirtualElement(e12) {
  return e12 !== null && typeof e12 === "object" && "getBoundingClientRect" in e12 && ("contextElement" in e12 ? e12 instanceof Element : true);
}
var SlPopup = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController2(this);
    this.active = false;
    this.placement = "top";
    this.strategy = "absolute";
    this.distance = 0;
    this.skidding = 0;
    this.arrow = false;
    this.arrowPlacement = "anchor";
    this.arrowPadding = 10;
    this.flip = false;
    this.flipFallbackPlacements = "";
    this.flipFallbackStrategy = "best-fit";
    this.flipPadding = 0;
    this.shift = false;
    this.shiftPadding = 0;
    this.autoSizePadding = 0;
    this.hoverBridge = false;
    this.updateHoverBridge = () => {
      if (this.hoverBridge && this.anchorEl) {
        const anchorRect = this.anchorEl.getBoundingClientRect();
        const popupRect = this.popup.getBoundingClientRect();
        const isVertical = this.placement.includes("top") || this.placement.includes("bottom");
        let topLeftX = 0;
        let topLeftY = 0;
        let topRightX = 0;
        let topRightY = 0;
        let bottomLeftX = 0;
        let bottomLeftY = 0;
        let bottomRightX = 0;
        let bottomRightY = 0;
        if (isVertical) {
          if (anchorRect.top < popupRect.top) {
            topLeftX = anchorRect.left;
            topLeftY = anchorRect.bottom;
            topRightX = anchorRect.right;
            topRightY = anchorRect.bottom;
            bottomLeftX = popupRect.left;
            bottomLeftY = popupRect.top;
            bottomRightX = popupRect.right;
            bottomRightY = popupRect.top;
          } else {
            topLeftX = popupRect.left;
            topLeftY = popupRect.bottom;
            topRightX = popupRect.right;
            topRightY = popupRect.bottom;
            bottomLeftX = anchorRect.left;
            bottomLeftY = anchorRect.top;
            bottomRightX = anchorRect.right;
            bottomRightY = anchorRect.top;
          }
        } else {
          if (anchorRect.left < popupRect.left) {
            topLeftX = anchorRect.right;
            topLeftY = anchorRect.top;
            topRightX = popupRect.left;
            topRightY = popupRect.top;
            bottomLeftX = anchorRect.right;
            bottomLeftY = anchorRect.bottom;
            bottomRightX = popupRect.left;
            bottomRightY = popupRect.bottom;
          } else {
            topLeftX = popupRect.right;
            topLeftY = popupRect.top;
            topRightX = anchorRect.left;
            topRightY = anchorRect.top;
            bottomLeftX = popupRect.right;
            bottomLeftY = popupRect.bottom;
            bottomRightX = anchorRect.left;
            bottomRightY = anchorRect.bottom;
          }
        }
        this.style.setProperty("--hover-bridge-top-left-x", `${topLeftX}px`);
        this.style.setProperty("--hover-bridge-top-left-y", `${topLeftY}px`);
        this.style.setProperty("--hover-bridge-top-right-x", `${topRightX}px`);
        this.style.setProperty("--hover-bridge-top-right-y", `${topRightY}px`);
        this.style.setProperty("--hover-bridge-bottom-left-x", `${bottomLeftX}px`);
        this.style.setProperty("--hover-bridge-bottom-left-y", `${bottomLeftY}px`);
        this.style.setProperty("--hover-bridge-bottom-right-x", `${bottomRightX}px`);
        this.style.setProperty("--hover-bridge-bottom-right-y", `${bottomRightY}px`);
      }
    };
  }
  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    this.start();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();
  }
  async updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("active")) {
      if (this.active) {
        this.start();
      } else {
        this.stop();
      }
    }
    if (changedProps.has("anchor")) {
      this.handleAnchorChange();
    }
    if (this.active) {
      await this.updateComplete;
      this.reposition();
    }
  }
  async handleAnchorChange() {
    await this.stop();
    if (this.anchor && typeof this.anchor === "string") {
      const root = this.getRootNode();
      this.anchorEl = root.getElementById(this.anchor);
    } else if (this.anchor instanceof Element || isVirtualElement(this.anchor)) {
      this.anchorEl = this.anchor;
    } else {
      this.anchorEl = this.querySelector('[slot="anchor"]');
    }
    if (this.anchorEl instanceof HTMLSlotElement) {
      this.anchorEl = this.anchorEl.assignedElements({ flatten: true })[0];
    }
    if (this.anchorEl && this.active) {
      this.start();
    }
  }
  start() {
    if (!this.anchorEl || !this.active) {
      return;
    }
    this.cleanup = autoUpdate(this.anchorEl, this.popup, () => {
      this.reposition();
    });
  }
  async stop() {
    return new Promise((resolve) => {
      if (this.cleanup) {
        this.cleanup();
        this.cleanup = void 0;
        this.removeAttribute("data-current-placement");
        this.style.removeProperty("--auto-size-available-width");
        this.style.removeProperty("--auto-size-available-height");
        requestAnimationFrame(() => resolve());
      } else {
        resolve();
      }
    });
  }
  /** Forces the popup to recalculate and reposition itself. */
  reposition() {
    if (!this.active || !this.anchorEl) {
      return;
    }
    const middleware = [
      // The offset middleware goes first
      offset2({ mainAxis: this.distance, crossAxis: this.skidding })
    ];
    if (this.sync) {
      middleware.push(
        size2({
          apply: ({ rects }) => {
            const syncWidth = this.sync === "width" || this.sync === "both";
            const syncHeight = this.sync === "height" || this.sync === "both";
            this.popup.style.width = syncWidth ? `${rects.reference.width}px` : "";
            this.popup.style.height = syncHeight ? `${rects.reference.height}px` : "";
          }
        })
      );
    } else {
      this.popup.style.width = "";
      this.popup.style.height = "";
    }
    if (this.flip) {
      middleware.push(
        flip2({
          boundary: this.flipBoundary,
          // @ts-expect-error - We're converting a string attribute to an array here
          fallbackPlacements: this.flipFallbackPlacements,
          fallbackStrategy: this.flipFallbackStrategy === "best-fit" ? "bestFit" : "initialPlacement",
          padding: this.flipPadding
        })
      );
    }
    if (this.shift) {
      middleware.push(
        shift2({
          boundary: this.shiftBoundary,
          padding: this.shiftPadding
        })
      );
    }
    if (this.autoSize) {
      middleware.push(
        size2({
          boundary: this.autoSizeBoundary,
          padding: this.autoSizePadding,
          apply: ({ availableWidth, availableHeight }) => {
            if (this.autoSize === "vertical" || this.autoSize === "both") {
              this.style.setProperty("--auto-size-available-height", `${availableHeight}px`);
            } else {
              this.style.removeProperty("--auto-size-available-height");
            }
            if (this.autoSize === "horizontal" || this.autoSize === "both") {
              this.style.setProperty("--auto-size-available-width", `${availableWidth}px`);
            } else {
              this.style.removeProperty("--auto-size-available-width");
            }
          }
        })
      );
    } else {
      this.style.removeProperty("--auto-size-available-width");
      this.style.removeProperty("--auto-size-available-height");
    }
    if (this.arrow) {
      middleware.push(
        arrow2({
          element: this.arrowEl,
          padding: this.arrowPadding
        })
      );
    }
    const getOffsetParent2 = this.strategy === "absolute" ? (element) => platform.getOffsetParent(element, e11) : platform.getOffsetParent;
    computePosition2(this.anchorEl, this.popup, {
      placement: this.placement,
      middleware,
      strategy: this.strategy,
      platform: __spreadProps(__spreadValues({}, platform), {
        getOffsetParent: getOffsetParent2
      })
    }).then(({ x: x3, y: y4, middlewareData, placement }) => {
      const isRtl = this.localize.dir() === "rtl";
      const staticSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[placement.split("-")[0]];
      this.setAttribute("data-current-placement", placement);
      Object.assign(this.popup.style, {
        left: `${x3}px`,
        top: `${y4}px`
      });
      if (this.arrow) {
        const arrowX = middlewareData.arrow.x;
        const arrowY = middlewareData.arrow.y;
        let top = "";
        let right = "";
        let bottom = "";
        let left = "";
        if (this.arrowPlacement === "start") {
          const value = typeof arrowX === "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          top = typeof arrowY === "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          right = isRtl ? value : "";
          left = isRtl ? "" : value;
        } else if (this.arrowPlacement === "end") {
          const value = typeof arrowX === "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          right = isRtl ? "" : value;
          left = isRtl ? value : "";
          bottom = typeof arrowY === "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
        } else if (this.arrowPlacement === "center") {
          left = typeof arrowX === "number" ? `calc(50% - var(--arrow-size-diagonal))` : "";
          top = typeof arrowY === "number" ? `calc(50% - var(--arrow-size-diagonal))` : "";
        } else {
          left = typeof arrowX === "number" ? `${arrowX}px` : "";
          top = typeof arrowY === "number" ? `${arrowY}px` : "";
        }
        Object.assign(this.arrowEl.style, {
          top,
          right,
          bottom,
          left,
          [staticSide]: "calc(var(--arrow-size-diagonal) * -1)"
        });
      }
    });
    requestAnimationFrame(() => this.updateHoverBridge());
    this.emit("sl-reposition");
  }
  render() {
    return x2`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${e9({
      "popup-hover-bridge": true,
      "popup-hover-bridge--visible": this.hoverBridge && this.active
    })}
      ></span>

      <div
        part="popup"
        class=${e9({
      popup: true,
      "popup--active": this.active,
      "popup--fixed": this.strategy === "fixed",
      "popup--has-arrow": this.arrow
    })}
      >
        <slot></slot>
        ${this.arrow ? x2`<div part="arrow" class="popup__arrow" role="presentation"></div>` : ""}
      </div>
    `;
  }
};
SlPopup.styles = [component_styles_default, popup_styles_default];
__decorateClass([
  e6(".popup")
], SlPopup.prototype, "popup", 2);
__decorateClass([
  e6(".popup__arrow")
], SlPopup.prototype, "arrowEl", 2);
__decorateClass([
  n7()
], SlPopup.prototype, "anchor", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlPopup.prototype, "active", 2);
__decorateClass([
  n7({ reflect: true })
], SlPopup.prototype, "placement", 2);
__decorateClass([
  n7({ reflect: true })
], SlPopup.prototype, "strategy", 2);
__decorateClass([
  n7({ type: Number })
], SlPopup.prototype, "distance", 2);
__decorateClass([
  n7({ type: Number })
], SlPopup.prototype, "skidding", 2);
__decorateClass([
  n7({ type: Boolean })
], SlPopup.prototype, "arrow", 2);
__decorateClass([
  n7({ attribute: "arrow-placement" })
], SlPopup.prototype, "arrowPlacement", 2);
__decorateClass([
  n7({ attribute: "arrow-padding", type: Number })
], SlPopup.prototype, "arrowPadding", 2);
__decorateClass([
  n7({ type: Boolean })
], SlPopup.prototype, "flip", 2);
__decorateClass([
  n7({
    attribute: "flip-fallback-placements",
    converter: {
      fromAttribute: (value) => {
        return value.split(" ").map((p4) => p4.trim()).filter((p4) => p4 !== "");
      },
      toAttribute: (value) => {
        return value.join(" ");
      }
    }
  })
], SlPopup.prototype, "flipFallbackPlacements", 2);
__decorateClass([
  n7({ attribute: "flip-fallback-strategy" })
], SlPopup.prototype, "flipFallbackStrategy", 2);
__decorateClass([
  n7({ type: Object })
], SlPopup.prototype, "flipBoundary", 2);
__decorateClass([
  n7({ attribute: "flip-padding", type: Number })
], SlPopup.prototype, "flipPadding", 2);
__decorateClass([
  n7({ type: Boolean })
], SlPopup.prototype, "shift", 2);
__decorateClass([
  n7({ type: Object })
], SlPopup.prototype, "shiftBoundary", 2);
__decorateClass([
  n7({ attribute: "shift-padding", type: Number })
], SlPopup.prototype, "shiftPadding", 2);
__decorateClass([
  n7({ attribute: "auto-size" })
], SlPopup.prototype, "autoSize", 2);
__decorateClass([
  n7()
], SlPopup.prototype, "sync", 2);
__decorateClass([
  n7({ type: Object })
], SlPopup.prototype, "autoSizeBoundary", 2);
__decorateClass([
  n7({ attribute: "auto-size-padding", type: Number })
], SlPopup.prototype, "autoSizePadding", 2);
__decorateClass([
  n7({ attribute: "hover-bridge", type: Boolean })
], SlPopup.prototype, "hoverBridge", 2);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.V2OL7VMD.js
var tag_styles_default = i`
  :host {
    display: inline-block;
  }

  .tag {
    display: flex;
    align-items: center;
    border: solid 1px;
    line-height: 1;
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
  }

  .tag__remove::part(base) {
    color: inherit;
    padding: 0;
  }

  /*
   * Variant modifiers
   */

  .tag--primary {
    background-color: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-200);
    color: var(--sl-color-primary-800);
  }

  .tag--primary:active > sl-icon-button {
    color: var(--sl-color-primary-600);
  }

  .tag--success {
    background-color: var(--sl-color-success-50);
    border-color: var(--sl-color-success-200);
    color: var(--sl-color-success-800);
  }

  .tag--success:active > sl-icon-button {
    color: var(--sl-color-success-600);
  }

  .tag--neutral {
    background-color: var(--sl-color-neutral-50);
    border-color: var(--sl-color-neutral-200);
    color: var(--sl-color-neutral-800);
  }

  .tag--neutral:active > sl-icon-button {
    color: var(--sl-color-neutral-600);
  }

  .tag--warning {
    background-color: var(--sl-color-warning-50);
    border-color: var(--sl-color-warning-200);
    color: var(--sl-color-warning-800);
  }

  .tag--warning:active > sl-icon-button {
    color: var(--sl-color-warning-600);
  }

  .tag--danger {
    background-color: var(--sl-color-danger-50);
    border-color: var(--sl-color-danger-200);
    color: var(--sl-color-danger-800);
  }

  .tag--danger:active > sl-icon-button {
    color: var(--sl-color-danger-600);
  }

  /*
   * Size modifiers
   */

  .tag--small {
    font-size: var(--sl-button-font-size-small);
    height: calc(var(--sl-input-height-small) * 0.8);
    line-height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-small);
    padding: 0 var(--sl-spacing-x-small);
  }

  .tag--medium {
    font-size: var(--sl-button-font-size-medium);
    height: calc(var(--sl-input-height-medium) * 0.8);
    line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-medium);
    padding: 0 var(--sl-spacing-small);
  }

  .tag--large {
    font-size: var(--sl-button-font-size-large);
    height: calc(var(--sl-input-height-large) * 0.8);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
    padding: 0 var(--sl-spacing-medium);
  }

  .tag__remove {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  /*
   * Pill modifier
   */

  .tag--pill {
    border-radius: var(--sl-border-radius-pill);
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.JGSVFUWB.js
var SlTag = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController2(this);
    this.variant = "neutral";
    this.size = "medium";
    this.pill = false;
    this.removable = false;
  }
  handleRemoveClick() {
    this.emit("sl-remove");
  }
  render() {
    return x2`
      <span
        part="base"
        class=${e9({
      tag: true,
      // Types
      "tag--primary": this.variant === "primary",
      "tag--success": this.variant === "success",
      "tag--neutral": this.variant === "neutral",
      "tag--warning": this.variant === "warning",
      "tag--danger": this.variant === "danger",
      "tag--text": this.variant === "text",
      // Sizes
      "tag--small": this.size === "small",
      "tag--medium": this.size === "medium",
      "tag--large": this.size === "large",
      // Modifiers
      "tag--pill": this.pill,
      "tag--removable": this.removable
    })}
      >
        <slot part="content" class="tag__content"></slot>

        ${this.removable ? x2`
              <sl-icon-button
                part="remove-button"
                exportparts="base:remove-button__base"
                name="x-lg"
                library="system"
                label=${this.localize.term("remove")}
                class="tag__remove"
                @click=${this.handleRemoveClick}
                tabindex="-1"
              ></sl-icon-button>
            ` : ""}
      </span>
    `;
  }
};
SlTag.styles = [component_styles_default, tag_styles_default];
SlTag.dependencies = { "sl-icon-button": SlIconButton };
__decorateClass([
  n7({ reflect: true })
], SlTag.prototype, "variant", 2);
__decorateClass([
  n7({ reflect: true })
], SlTag.prototype, "size", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlTag.prototype, "pill", 2);
__decorateClass([
  n7({ type: Boolean })
], SlTag.prototype, "removable", 2);

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.FW7UWQXB.js
var tooltip_styles_default = i`
  :host {
    --max-width: 20rem;
    --hide-delay: 0ms;
    --show-delay: 150ms;

    display: contents;
  }

  .tooltip {
    --arrow-size: var(--sl-tooltip-arrow-size);
    --arrow-color: var(--sl-tooltip-background-color);
  }

  .tooltip::part(popup) {
    z-index: var(--sl-z-index-tooltip);
  }

  .tooltip[placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .tooltip[placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  .tooltip[placement^='left']::part(popup) {
    transform-origin: right;
  }

  .tooltip[placement^='right']::part(popup) {
    transform-origin: left;
  }

  .tooltip__body {
    display: block;
    width: max-content;
    max-width: var(--max-width);
    border-radius: var(--sl-tooltip-border-radius);
    background-color: var(--sl-tooltip-background-color);
    font-family: var(--sl-tooltip-font-family);
    font-size: var(--sl-tooltip-font-size);
    font-weight: var(--sl-tooltip-font-weight);
    line-height: var(--sl-tooltip-line-height);
    text-align: start;
    white-space: normal;
    color: var(--sl-tooltip-color);
    padding: var(--sl-tooltip-padding);
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
  }
`;

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.2E7JDME3.js
var SlTooltip = class extends ShoelaceElement {
  constructor() {
    super();
    this.localize = new LocalizeController2(this);
    this.content = "";
    this.placement = "top";
    this.disabled = false;
    this.distance = 8;
    this.open = false;
    this.skidding = 0;
    this.trigger = "hover focus";
    this.hoist = false;
    this.handleBlur = () => {
      if (this.hasTrigger("focus")) {
        this.hide();
      }
    };
    this.handleClick = () => {
      if (this.hasTrigger("click")) {
        if (this.open) {
          this.hide();
        } else {
          this.show();
        }
      }
    };
    this.handleFocus = () => {
      if (this.hasTrigger("focus")) {
        this.show();
      }
    };
    this.handleDocumentKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        this.hide();
      }
    };
    this.handleMouseOver = () => {
      if (this.hasTrigger("hover")) {
        const delay = parseDuration(getComputedStyle(this).getPropertyValue("--show-delay"));
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = window.setTimeout(() => this.show(), delay);
      }
    };
    this.handleMouseOut = () => {
      if (this.hasTrigger("hover")) {
        const delay = parseDuration(getComputedStyle(this).getPropertyValue("--hide-delay"));
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = window.setTimeout(() => this.hide(), delay);
      }
    };
    this.addEventListener("blur", this.handleBlur, true);
    this.addEventListener("focus", this.handleFocus, true);
    this.addEventListener("click", this.handleClick);
    this.addEventListener("mouseover", this.handleMouseOver);
    this.addEventListener("mouseout", this.handleMouseOut);
  }
  disconnectedCallback() {
    var _a3;
    super.disconnectedCallback();
    (_a3 = this.closeWatcher) == null ? void 0 : _a3.destroy();
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
  }
  firstUpdated() {
    this.body.hidden = !this.open;
    if (this.open) {
      this.popup.active = true;
      this.popup.reposition();
    }
  }
  hasTrigger(triggerType) {
    const triggers = this.trigger.split(" ");
    return triggers.includes(triggerType);
  }
  async handleOpenChange() {
    var _a3, _b;
    if (this.open) {
      if (this.disabled) {
        return;
      }
      this.emit("sl-show");
      if ("CloseWatcher" in window) {
        (_a3 = this.closeWatcher) == null ? void 0 : _a3.destroy();
        this.closeWatcher = new CloseWatcher();
        this.closeWatcher.onclose = () => {
          this.hide();
        };
      } else {
        document.addEventListener("keydown", this.handleDocumentKeyDown);
      }
      await stopAnimations(this.body);
      this.body.hidden = false;
      this.popup.active = true;
      const { keyframes, options } = getAnimation(this, "tooltip.show", { dir: this.localize.dir() });
      await animateTo(this.popup.popup, keyframes, options);
      this.popup.reposition();
      this.emit("sl-after-show");
    } else {
      this.emit("sl-hide");
      (_b = this.closeWatcher) == null ? void 0 : _b.destroy();
      document.removeEventListener("keydown", this.handleDocumentKeyDown);
      await stopAnimations(this.body);
      const { keyframes, options } = getAnimation(this, "tooltip.hide", { dir: this.localize.dir() });
      await animateTo(this.popup.popup, keyframes, options);
      this.popup.active = false;
      this.body.hidden = true;
      this.emit("sl-after-hide");
    }
  }
  async handleOptionsChange() {
    if (this.hasUpdated) {
      await this.updateComplete;
      this.popup.reposition();
    }
  }
  handleDisabledChange() {
    if (this.disabled && this.open) {
      this.hide();
    }
  }
  /** Shows the tooltip. */
  async show() {
    if (this.open) {
      return void 0;
    }
    this.open = true;
    return waitForEvent(this, "sl-after-show");
  }
  /** Hides the tooltip */
  async hide() {
    if (!this.open) {
      return void 0;
    }
    this.open = false;
    return waitForEvent(this, "sl-after-hide");
  }
  //
  // NOTE: Tooltip is a bit unique in that we're using aria-live instead of aria-labelledby to trick screen readers into
  // announcing the content. It works really well, but it violates an accessibility rule. We're also adding the
  // aria-describedby attribute to a slot, which is required by <sl-popup> to correctly locate the first assigned
  // element, otherwise positioning is incorrect.
  //
  render() {
    return x2`
      <sl-popup
        part="base"
        exportparts="
          popup:base__popup,
          arrow:base__arrow
        "
        class=${e9({
      tooltip: true,
      "tooltip--open": this.open
    })}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist ? "fixed" : "absolute"}
        flip
        shift
        arrow
        hover-bridge
      >
        ${""}
        <slot slot="anchor" aria-describedby="tooltip"></slot>

        ${""}
        <div part="body" id="tooltip" class="tooltip__body" role="tooltip" aria-live=${this.open ? "polite" : "off"}>
          <slot name="content">${this.content}</slot>
        </div>
      </sl-popup>
    `;
  }
};
SlTooltip.styles = [component_styles_default, tooltip_styles_default];
SlTooltip.dependencies = { "sl-popup": SlPopup };
__decorateClass([
  e6("slot:not([name])")
], SlTooltip.prototype, "defaultSlot", 2);
__decorateClass([
  e6(".tooltip__body")
], SlTooltip.prototype, "body", 2);
__decorateClass([
  e6("sl-popup")
], SlTooltip.prototype, "popup", 2);
__decorateClass([
  n7()
], SlTooltip.prototype, "content", 2);
__decorateClass([
  n7()
], SlTooltip.prototype, "placement", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlTooltip.prototype, "disabled", 2);
__decorateClass([
  n7({ type: Number })
], SlTooltip.prototype, "distance", 2);
__decorateClass([
  n7({ type: Boolean, reflect: true })
], SlTooltip.prototype, "open", 2);
__decorateClass([
  n7({ type: Number })
], SlTooltip.prototype, "skidding", 2);
__decorateClass([
  n7()
], SlTooltip.prototype, "trigger", 2);
__decorateClass([
  n7({ type: Boolean })
], SlTooltip.prototype, "hoist", 2);
__decorateClass([
  watch("open", { waitUntilFirstUpdate: true })
], SlTooltip.prototype, "handleOpenChange", 1);
__decorateClass([
  watch(["content", "distance", "hoist", "placement", "skidding"])
], SlTooltip.prototype, "handleOptionsChange", 1);
__decorateClass([
  watch("disabled")
], SlTooltip.prototype, "handleDisabledChange", 1);
setDefaultAnimation("tooltip.show", {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 150, easing: "ease" }
});
setDefaultAnimation("tooltip.hide", {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 150, easing: "ease" }
});

// data/periodic-table/elements.generated.ts
var PERIODIC_TABLE_CONDITIONS = {
  temperatureK: 298.15,
  pressureBar: 1
};
var PERIODIC_TABLE_SOURCES = {
  "pse-info": {
    publisher: "pse-info.de (Paul K\xF6hler)",
    title: "PSE-info element database",
    url: "https://github.com/komed3/periodic-table/blob/master/_db/elements.json",
    release: "2025-09-25",
    retrieved: "2026-11-19",
    license: "MIT",
    redistribution: "Vendored unchanged. The MIT licence requires the copyright notice and permission notice to travel with the data; both are reproduced in the attribution below.",
    attribution: "Element data from PSE-info, \xA9 2023\u20132026 Paul K\xF6hler, released under the MIT licence (https://pse-info.de/en/data).",
    input: "sources/pse-info-elements.json",
    sha256: "4891e8d0d7cb9ba22af0b4ea3be2199622a5d2e06a78a16ad99232de7347560b",
    fields: ["names.de", "period", "group", "block", "phase", "electron_config", "set", "temperature.melting", "temperature.boiling", "temperature.sublimation", "discovery", "radius.empirical", "negativity.pauling", "ionization.values"]
  },
  "pse-info-nuclides": {
    publisher: "pse-info.de (Paul K\xF6hler)",
    title: "PSE-info nuclide table, reduced to one nuclide per element",
    url: "https://github.com/komed3/periodic-table/blob/master/_db/nuclides.json",
    release: "2025-09-25",
    retrieved: "2026-11-20",
    license: "MIT",
    redistribution: "Derived extract, not the upstream file: the upstream table is 5.6 MB and lists every nuclide, so only one record per element is shipped. An element counts as stable when the upstream table marks any of its nuclides stable; otherwise the record keeps the nuclide with the longest half-life together with its mass number and that half-life in seconds. The extract names the upstream artifact, its digest and its size in its own header. The MIT licence requires the copyright notice and permission notice to travel with the data; both are reproduced in the attribution below.",
    attribution: "Nuclide data from PSE-info, \xA9 2023\u20132026 Paul K\xF6hler, released under the MIT licence (https://pse-info.de/en/data).",
    input: "sources/pse-info-nuclides.json",
    sha256: "c4ae4e63ec38fcca3c4c10364821f5c8d713f5dc0c9e8da5802688d9166b59da",
    fields: ["nuclides.half_life_sec", "nuclides.stable", "nuclides.m"]
  },
  "ciaaw": {
    publisher: "IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW)",
    title: "Standard Atomic Weights 2024",
    url: "https://www.ciaaw.org/atomic-weights.htm",
    release: "2024",
    retrieved: "2026-11-19",
    license: "Factual data, no separate licence",
    redistribution: "The table is reproduced as factual data with source attribution. Only the numeric weights, their uncertainty digits and the published note codes are shipped; the surrounding prose is not.",
    attribution: "Standard atomic weights from CIAAW, IUPAC (https://www.ciaaw.org/atomic-weights.htm), 2024 edition.",
    input: "sources/ciaaw-atomic-weights.json",
    sha256: "d6f9118592aa4379ab2bba484ef814ab90a67edd511c4cc58926f1a9512a0786",
    fields: ["symbol", "name", "standard atomic weight", "uncertainty digits", "note codes"]
  },
  "nist": {
    publisher: "National Institute of Standards and Technology (NIST)",
    title: "NIST Handbook of Basic Atomic Spectroscopic Data, ground-state configurations",
    url: "https://physics.nist.gov/PhysRefData/Handbook/periodictable.htm",
    release: "current at retrieval",
    retrieved: "2026-11-19",
    license: "Public domain (US government work)",
    redistribution: "Vendored as a verification input. Only the subshell occupation of the neutral ground state is shipped, and only after it agrees with the PSE-info configuration.",
    attribution: "Ground-state configurations cross-checked against the NIST Handbook of Basic Atomic Spectroscopic Data.",
    input: "sources/nist-configurations.json",
    sha256: "0e1d991355f806077d4666af2d241d5d6f40bc0033c9ae79747717755405041d",
    fields: ["neutral ground-state subshell occupation"]
  }
};
var PERIODIC_TABLE_CATEGORIES = {
  "alkali-metal": { en: "Alkali metal", de: "Alkalimetall" },
  "alkaline-earth-metal": { en: "Alkaline earth metal", de: "Erdalkalimetall" },
  "transition-metal": { en: "Transition metal", de: "\xDCbergangsmetall" },
  "post-transition-metal": { en: "Post-transition metal", de: "Hauptgruppenmetall" },
  "metalloid": { en: "Metalloid", de: "Halbmetall" },
  "nonmetal": { en: "Nonmetal", de: "Nichtmetall" },
  "halogen": { en: "Halogen", de: "Halogen" },
  "noble-gas": { en: "Noble gas", de: "Edelgas" },
  "lanthanide": { en: "Lanthanide", de: "Lanthanoid" },
  "actinide": { en: "Actinide", de: "Actinoid" },
  "unknown": { en: "Unknown", de: "Unbekannt" }
};
var PERIODIC_TABLE_LAYOUT = {
  columns: 18,
  periodRows: 7,
  seriesRows: [
    { row: 8, category: "lanthanide", firstAtomicNumber: 57, lastAtomicNumber: 71, firstColumn: 3 },
    { row: 9, category: "actinide", firstAtomicNumber: 89, lastAtomicNumber: 103, firstColumn: 3 }
  ],
  placeholders: [
    { row: 6, column: 3, category: "lanthanide" },
    { row: 7, column: 3, category: "actinide" }
  ]
};
var PERIODIC_TABLE_ELEMENTS = [
  { "atomicNumber": 1, "symbol": "H", "names": { "en": "Hydrogen", "de": "Wasserstoff" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#H" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "period": 1, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "weight": { "kind": "interval", "lower": "1.00784", "upper": "1.00811", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#H" } }, "configuration": { "status": "reported", "value": "1s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "shells": [1], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "melting": { "status": "reported", "value": 13.99, "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "boiling": { "status": "reported", "value": 20.271, "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "discovery": { "kind": "year", "year": 1766, "by": "Cavendish", "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "radius": { "status": "reported", "value": 25, "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "electronegativity": { "status": "reported", "value": 2.2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "ionization": { "status": "reported", "value": 13.59843449, "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#h" } } },
  { "atomicNumber": 2, "symbol": "He", "names": { "en": "Helium", "de": "Helium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#He" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "period": 1, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "weight": { "kind": "value", "decimal": "4.002602", "uncertaintyDigits": "2", "noteCodes": ["g", "r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#He" } }, "configuration": { "status": "reported", "value": "1s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "shells": [2], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "melting": { "status": "reported", "value": 0.95, "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "boiling": { "status": "reported", "value": 4.222, "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "discovery": { "kind": "year", "year": 1895, "by": "Ramsay, Crookes", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "ionization": { "status": "reported", "value": 24.5873888015, "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#he" } } },
  { "atomicNumber": 3, "symbol": "Li", "names": { "en": "Lithium", "de": "Lithium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Li" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "period": 2, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "weight": { "kind": "interval", "lower": "6.938", "upper": "6.997", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Li" } }, "configuration": { "status": "reported", "value": "[He] 2s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "shells": [2, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "melting": { "status": "reported", "value": 453.65, "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "boiling": { "status": "reported", "value": 1603, "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "discovery": { "kind": "year", "year": 1817, "by": "Arfwedson", "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "radius": { "status": "reported", "value": 152, "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "electronegativity": { "status": "reported", "value": 0.98, "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "ionization": { "status": "reported", "value": 5.39171495, "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#li" } } },
  { "atomicNumber": 4, "symbol": "Be", "names": { "en": "Beryllium", "de": "Beryllium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Be" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "period": 2, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "weight": { "kind": "value", "decimal": "9.0121831", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Be" } }, "configuration": { "status": "reported", "value": "[He] 2s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "shells": [2, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "melting": { "status": "reported", "value": 1560, "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "boiling": { "status": "reported", "value": 2742, "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "discovery": { "kind": "year", "year": 1797, "by": "Vauquelin", "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "radius": { "status": "reported", "value": 112, "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "electronegativity": { "status": "reported", "value": 1.57, "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "ionization": { "status": "reported", "value": 9.322699, "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#be" } } },
  { "atomicNumber": 5, "symbol": "B", "names": { "en": "Boron", "de": "Bor" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#B" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "period": 2, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "weight": { "kind": "interval", "lower": "10.806", "upper": "10.821", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#B" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "shells": [2, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "melting": { "status": "reported", "value": 2349, "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "boiling": { "status": "reported", "value": 4200, "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "discovery": { "kind": "year", "year": 1808, "by": "Davy, Gay-Lussac", "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "radius": { "status": "reported", "value": 90, "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "electronegativity": { "status": "reported", "value": 2.04, "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "ionization": { "status": "reported", "value": 8.298019, "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#b" } } },
  { "atomicNumber": 6, "symbol": "C", "names": { "en": "Carbon", "de": "Kohlenstoff" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#C" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "period": 2, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "weight": { "kind": "interval", "lower": "12.0096", "upper": "12.0116", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#C" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "shells": [2, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "sublimation": { "status": "reported", "value": 3915, "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "radius": { "status": "reported", "value": 70, "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "electronegativity": { "status": "reported", "value": 2.55, "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "ionization": { "status": "reported", "value": 11.260288, "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#c" } } },
  { "atomicNumber": 7, "symbol": "N", "names": { "en": "Nitrogen", "de": "Stickstoff" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#N" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "period": 2, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "weight": { "kind": "interval", "lower": "14.00643", "upper": "14.00728", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#N" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "shells": [2, 5], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "melting": { "status": "reported", "value": 63.23, "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "boiling": { "status": "reported", "value": 77.355, "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "discovery": { "kind": "year", "year": 1771, "by": "Scheele", "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "radius": { "status": "reported", "value": 65, "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "electronegativity": { "status": "reported", "value": 3.04, "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "ionization": { "status": "reported", "value": 14.53413, "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#n" } } },
  { "atomicNumber": 8, "symbol": "O", "names": { "en": "Oxygen", "de": "Sauerstoff" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#O" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "period": 2, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "weight": { "kind": "interval", "lower": "15.99903", "upper": "15.99977", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#O" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "shells": [2, 6], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "melting": { "status": "reported", "value": 54.36, "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "boiling": { "status": "reported", "value": 90.188, "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "discovery": { "kind": "year", "year": 1774, "by": "Priestley, Scheele", "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "radius": { "status": "reported", "value": 60, "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "electronegativity": { "status": "reported", "value": 3.44, "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "ionization": { "status": "reported", "value": 13.618055, "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#o" } } },
  { "atomicNumber": 9, "symbol": "F", "names": { "en": "Fluorine", "de": "Fluor" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#F" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "period": 2, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "weight": { "kind": "value", "decimal": "18.998403162", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#F" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "shells": [2, 7], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "melting": { "status": "reported", "value": 53.48, "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "boiling": { "status": "reported", "value": 85.03, "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "discovery": { "kind": "year", "year": 1886, "by": "Moissan", "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "radius": { "status": "reported", "value": 50, "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "electronegativity": { "status": "reported", "value": 3.98, "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "ionization": { "status": "reported", "value": 17.42282, "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#f" } } },
  { "atomicNumber": 10, "symbol": "Ne", "names": { "en": "Neon", "de": "Neon" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ne" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "period": 2, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "weight": { "kind": "value", "decimal": "20.1797", "uncertaintyDigits": "6", "noteCodes": ["g", "m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ne" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "shells": [2, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "melting": { "status": "reported", "value": 24.56, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "boiling": { "status": "reported", "value": 27.104, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "discovery": { "kind": "year", "year": 1898, "by": "Ramsay, Travers", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "ionization": { "status": "reported", "value": 21.56454, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ne" } } },
  { "atomicNumber": 11, "symbol": "Na", "names": { "en": "Sodium", "de": "Natrium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Na" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "period": 3, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "weight": { "kind": "value", "decimal": "22.98976928", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Na" } }, "configuration": { "status": "reported", "value": "[Ne] 3s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "shells": [2, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "melting": { "status": "reported", "value": 370.944, "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "boiling": { "status": "reported", "value": 1156.09, "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "discovery": { "kind": "year", "year": 1807, "by": "Davy", "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "radius": { "status": "reported", "value": 180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "electronegativity": { "status": "reported", "value": 0.93, "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "ionization": { "status": "reported", "value": 5.1390769, "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#na" } } },
  { "atomicNumber": 12, "symbol": "Mg", "names": { "en": "Magnesium", "de": "Magnesium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mg" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "period": 3, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "weight": { "kind": "interval", "lower": "24.304", "upper": "24.307", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mg" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "shells": [2, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "melting": { "status": "reported", "value": 923, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "boiling": { "status": "reported", "value": 1363, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "discovery": { "kind": "year", "year": 1828, "by": "Bussy", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "radius": { "status": "reported", "value": 150, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "electronegativity": { "status": "reported", "value": 1.31, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "ionization": { "status": "reported", "value": 7.646236, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#mg" } } },
  { "atomicNumber": 13, "symbol": "Al", "names": { "en": "Aluminium", "de": "Aluminium" }, "aliases": { "en": ["Aluminum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Al" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "period": 3, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "weight": { "kind": "value", "decimal": "26.9815384", "uncertaintyDigits": "3", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Al" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "shells": [2, 8, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "melting": { "status": "reported", "value": 933.47, "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "boiling": { "status": "reported", "value": 2743, "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "discovery": { "kind": "year", "year": 1825, "by": "\xD8rsted", "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "radius": { "status": "reported", "value": 143, "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "electronegativity": { "status": "reported", "value": 1.61, "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "ionization": { "status": "reported", "value": 5.985769, "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#al" } } },
  { "atomicNumber": 14, "symbol": "Si", "names": { "en": "Silicon", "de": "Silicium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Si" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "period": 3, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "weight": { "kind": "interval", "lower": "28.084", "upper": "28.086", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Si" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "shells": [2, 8, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "melting": { "status": "reported", "value": 1687, "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "boiling": { "status": "reported", "value": 3538, "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "discovery": { "kind": "year", "year": 1824, "by": "Berzelius", "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "radius": { "status": "reported", "value": 111, "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "electronegativity": { "status": "reported", "value": 1.9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "ionization": { "status": "reported", "value": 8.15168, "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#si" } } },
  { "atomicNumber": 15, "symbol": "P", "names": { "en": "Phosphorus", "de": "Phosphor" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#P" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "period": 3, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "weight": { "kind": "value", "decimal": "30.973761998", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#P" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "shells": [2, 8, 5], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "melting": { "status": "reported", "value": 317.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "boiling": { "status": "reported", "value": 553.7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "discovery": { "kind": "year", "year": 1669, "by": "Brand", "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "radius": { "status": "reported", "value": 100, "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "electronegativity": { "status": "reported", "value": 2.19, "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "ionization": { "status": "reported", "value": 10.486686, "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#p" } } },
  { "atomicNumber": 16, "symbol": "S", "names": { "en": "Sulfur", "de": "Schwefel" }, "aliases": { "en": ["Sulphur"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#S" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "period": 3, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "weight": { "kind": "interval", "lower": "32.059", "upper": "32.076", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#S" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "shells": [2, 8, 6], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "melting": { "status": "reported", "value": 388.36, "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "boiling": { "status": "reported", "value": 717.8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "radius": { "status": "reported", "value": 100, "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "electronegativity": { "status": "reported", "value": 2.58, "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "ionization": { "status": "reported", "value": 10.36001, "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#s" } } },
  { "atomicNumber": 17, "symbol": "Cl", "names": { "en": "Chlorine", "de": "Chlor" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cl" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "period": 3, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "weight": { "kind": "interval", "lower": "35.446", "upper": "35.457", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cl" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "shells": [2, 8, 7], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "melting": { "status": "reported", "value": 171.6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "boiling": { "status": "reported", "value": 239.11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "discovery": { "kind": "year", "year": 1774, "by": "Scheele", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "radius": { "status": "reported", "value": 100, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "electronegativity": { "status": "reported", "value": 3.16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "ionization": { "status": "reported", "value": 12.967632, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#cl" } } },
  { "atomicNumber": 18, "symbol": "Ar", "names": { "en": "Argon", "de": "Argon" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ar" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "period": 3, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "weight": { "kind": "interval", "lower": "39.792", "upper": "39.963", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ar" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "shells": [2, 8, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "melting": { "status": "reported", "value": 83.81, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "boiling": { "status": "reported", "value": 87.302, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "discovery": { "kind": "year", "year": 1894, "by": "Ramsay, Strutt", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "ionization": { "status": "reported", "value": 15.7596117, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ar" } } },
  { "atomicNumber": 19, "symbol": "K", "names": { "en": "Potassium", "de": "Kalium" }, "aliases": { "en": ["Kalium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#K" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "period": 4, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "weight": { "kind": "value", "decimal": "39.0983", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#K" } }, "configuration": { "status": "reported", "value": "[Ar] 4s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "shells": [2, 8, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "melting": { "status": "reported", "value": 336.7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "boiling": { "status": "reported", "value": 1030.793, "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "discovery": { "kind": "year", "year": 1807, "by": "Davy", "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "radius": { "status": "reported", "value": 227, "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "electronegativity": { "status": "reported", "value": 0.82, "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "ionization": { "status": "reported", "value": 4.34066369, "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#k" } } },
  { "atomicNumber": 20, "symbol": "Ca", "names": { "en": "Calcium", "de": "Calcium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ca" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "period": 4, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "weight": { "kind": "value", "decimal": "40.078", "uncertaintyDigits": "4", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ca" } }, "configuration": { "status": "reported", "value": "[Ar] 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "shells": [2, 8, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "melting": { "status": "reported", "value": 1115, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "boiling": { "status": "reported", "value": 1757, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "discovery": { "kind": "year", "year": 1808, "by": "Davy", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "radius": { "status": "reported", "value": 197, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "electronegativity": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "ionization": { "status": "reported", "value": 6.1131554, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ca" } } },
  { "atomicNumber": 21, "symbol": "Sc", "names": { "en": "Scandium", "de": "Scandium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sc" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "period": 4, "group": { "status": "reported", "value": 3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "weight": { "kind": "value", "decimal": "44.955907", "uncertaintyDigits": "4", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sc" } }, "configuration": { "status": "reported", "value": "[Ar] 3d1 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "shells": [2, 8, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "melting": { "status": "reported", "value": 1814, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "boiling": { "status": "reported", "value": 3109, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "discovery": { "kind": "year", "year": 1879, "by": "Nilson", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "radius": { "status": "reported", "value": 162, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "electronegativity": { "status": "reported", "value": 1.36, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "ionization": { "status": "reported", "value": 6.56149, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#sc" } } },
  { "atomicNumber": 22, "symbol": "Ti", "names": { "en": "Titanium", "de": "Titan" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ti" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "period": 4, "group": { "status": "reported", "value": 4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "weight": { "kind": "value", "decimal": "47.867", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ti" } }, "configuration": { "status": "reported", "value": "[Ar] 3d2 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "shells": [2, 8, 10, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "melting": { "status": "reported", "value": 1941, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "boiling": { "status": "reported", "value": 3560, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "discovery": { "kind": "year", "year": 1791, "by": "Gregor, Klaproth", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "radius": { "status": "reported", "value": 147, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "electronegativity": { "status": "reported", "value": 1.54, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "ionization": { "status": "reported", "value": 6.82812, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ti" } } },
  { "atomicNumber": 23, "symbol": "V", "names": { "en": "Vanadium", "de": "Vanadium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#V" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "period": 4, "group": { "status": "reported", "value": 5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "weight": { "kind": "value", "decimal": "50.9415", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#V" } }, "configuration": { "status": "reported", "value": "[Ar] 3d3 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "shells": [2, 8, 11, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "melting": { "status": "reported", "value": 2183, "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "boiling": { "status": "reported", "value": 3680, "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "discovery": { "kind": "year", "year": 1801, "by": "del R\xEDo", "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "radius": { "status": "reported", "value": 134, "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "electronegativity": { "status": "reported", "value": 1.63, "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "ionization": { "status": "reported", "value": 6.746187, "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#v" } } },
  { "atomicNumber": 24, "symbol": "Cr", "names": { "en": "Chromium", "de": "Chrom" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "period": 4, "group": { "status": "reported", "value": 6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "weight": { "kind": "value", "decimal": "51.9961", "uncertaintyDigits": "6", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cr" } }, "configuration": { "status": "reported", "value": "[Ar] 3d5 4s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "shells": [2, 8, 13, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "melting": { "status": "reported", "value": 2180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "boiling": { "status": "reported", "value": 2944, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "discovery": { "kind": "year", "year": 1797, "by": "Vauquelin", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "radius": { "status": "reported", "value": 128, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "electronegativity": { "status": "reported", "value": 1.66, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "ionization": { "status": "reported", "value": 6.76651, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#cr" } } },
  { "atomicNumber": 25, "symbol": "Mn", "names": { "en": "Manganese", "de": "Mangan" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "period": 4, "group": { "status": "reported", "value": 7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "weight": { "kind": "value", "decimal": "54.938043", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mn" } }, "configuration": { "status": "reported", "value": "[Ar] 3d5 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "shells": [2, 8, 13, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "melting": { "status": "reported", "value": 1519, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "boiling": { "status": "reported", "value": 2334, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "discovery": { "kind": "year", "year": 1774, "by": "Gahn", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "radius": { "status": "reported", "value": 127, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "electronegativity": { "status": "reported", "value": 1.55, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "ionization": { "status": "reported", "value": 7.4340379, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#mn" } } },
  { "atomicNumber": 26, "symbol": "Fe", "names": { "en": "Iron", "de": "Eisen" }, "aliases": { "en": ["Ferrum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fe" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "period": 4, "group": { "status": "reported", "value": 8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "weight": { "kind": "value", "decimal": "55.845", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fe" } }, "configuration": { "status": "reported", "value": "[Ar] 3d6 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "shells": [2, 8, 14, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "melting": { "status": "reported", "value": 1811, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "boiling": { "status": "reported", "value": 3134, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "radius": { "status": "reported", "value": 126, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "electronegativity": { "status": "reported", "value": 1.83, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "ionization": { "status": "reported", "value": 7.9024681, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#fe" } } },
  { "atomicNumber": 27, "symbol": "Co", "names": { "en": "Cobalt", "de": "Cobalt" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Co" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "period": 4, "group": { "status": "reported", "value": 9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "weight": { "kind": "value", "decimal": "58.933194", "uncertaintyDigits": "3", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Co" } }, "configuration": { "status": "reported", "value": "[Ar] 3d7 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "shells": [2, 8, 15, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "melting": { "status": "reported", "value": 1768, "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "boiling": { "status": "reported", "value": 3200, "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "discovery": { "kind": "year", "year": 1735, "by": "Brandt", "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "radius": { "status": "reported", "value": 125, "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "electronegativity": { "status": "reported", "value": 1.88, "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "ionization": { "status": "reported", "value": 7.88101, "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#co" } } },
  { "atomicNumber": 28, "symbol": "Ni", "names": { "en": "Nickel", "de": "Nickel" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ni" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "period": 4, "group": { "status": "reported", "value": 10, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "weight": { "kind": "value", "decimal": "58.6934", "uncertaintyDigits": "4", "noteCodes": ["r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ni" } }, "configuration": { "status": "reported", "value": "[Ar] 3d8 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "shells": [2, 8, 16, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "melting": { "status": "reported", "value": 1728, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "boiling": { "status": "reported", "value": 3003, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "discovery": { "kind": "year", "year": 1751, "by": "Cronstedt", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "radius": { "status": "reported", "value": 124, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "electronegativity": { "status": "reported", "value": 1.91, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "ionization": { "status": "reported", "value": 7.639878, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ni" } } },
  { "atomicNumber": 29, "symbol": "Cu", "names": { "en": "Copper", "de": "Kupfer" }, "aliases": { "en": ["Cuprum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cu" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "period": 4, "group": { "status": "reported", "value": 11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "weight": { "kind": "value", "decimal": "63.546", "uncertaintyDigits": "3", "noteCodes": ["r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cu" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "shells": [2, 8, 18, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "melting": { "status": "reported", "value": 1357.77, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "boiling": { "status": "reported", "value": 2835, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "radius": { "status": "reported", "value": 128, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "electronegativity": { "status": "reported", "value": 1.9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "ionization": { "status": "reported", "value": 7.72638, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#cu" } } },
  { "atomicNumber": 30, "symbol": "Zn", "names": { "en": "Zinc", "de": "Zink" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Zn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "period": 4, "group": { "status": "reported", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "weight": { "kind": "value", "decimal": "65.38", "uncertaintyDigits": "2", "noteCodes": ["r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Zn" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "shells": [2, 8, 18, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "melting": { "status": "reported", "value": 692.68, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "boiling": { "status": "reported", "value": 1180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "radius": { "status": "reported", "value": 134, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "electronegativity": { "status": "reported", "value": 1.65, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "ionization": { "status": "reported", "value": 9.394197, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#zn" } } },
  { "atomicNumber": 31, "symbol": "Ga", "names": { "en": "Gallium", "de": "Gallium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ga" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "period": 4, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "weight": { "kind": "value", "decimal": "69.723", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ga" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "shells": [2, 8, 18, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "melting": { "status": "reported", "value": 302.9146, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "boiling": { "status": "reported", "value": 2673, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "discovery": { "kind": "year", "year": 1875, "by": "Lecoq de Boisbaudran", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "radius": { "status": "reported", "value": 135, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "electronegativity": { "status": "reported", "value": 1.81, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "ionization": { "status": "reported", "value": 5.999302, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ga" } } },
  { "atomicNumber": 32, "symbol": "Ge", "names": { "en": "Germanium", "de": "Germanium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ge" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "period": 4, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "weight": { "kind": "value", "decimal": "72.630", "uncertaintyDigits": "8", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ge" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "shells": [2, 8, 18, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "melting": { "status": "reported", "value": 1211.4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "boiling": { "status": "reported", "value": 3106, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "discovery": { "kind": "year", "year": 1886, "by": "Winkler", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "radius": { "status": "reported", "value": 122, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "electronegativity": { "status": "reported", "value": 2.01, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "ionization": { "status": "reported", "value": 7.899435, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ge" } } },
  { "atomicNumber": 33, "symbol": "As", "names": { "en": "Arsenic", "de": "Arsen" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#As" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "period": 4, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "weight": { "kind": "value", "decimal": "74.921595", "uncertaintyDigits": "6", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#As" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "shells": [2, 8, 18, 5], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "sublimation": { "status": "reported", "value": 887, "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "discovery": { "kind": "year", "year": 1300, "by": "Albertus Magnus", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "radius": { "status": "reported", "value": 119, "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "electronegativity": { "status": "reported", "value": 2.18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "ionization": { "status": "reported", "value": 9.78855, "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#as" } } },
  { "atomicNumber": 34, "symbol": "Se", "names": { "en": "Selenium", "de": "Selen" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Se" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "period": 4, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "weight": { "kind": "value", "decimal": "78.971", "uncertaintyDigits": "8", "noteCodes": ["r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Se" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "shells": [2, 8, 18, 6], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "melting": { "status": "reported", "value": 494, "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "boiling": { "status": "reported", "value": 958, "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "discovery": { "kind": "year", "year": 1817, "by": "Berzelius", "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "radius": { "status": "reported", "value": 120, "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "electronegativity": { "status": "reported", "value": 2.55, "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "ionization": { "status": "reported", "value": 9.752392, "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#se" } } },
  { "atomicNumber": 35, "symbol": "Br", "names": { "en": "Bromine", "de": "Brom" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Br" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "period": 4, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "weight": { "kind": "interval", "lower": "79.901", "upper": "79.907", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Br" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "shells": [2, 8, 18, 7], "phase": { "status": "reported", "value": "liquid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "melting": { "status": "reported", "value": 265.8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "boiling": { "status": "reported", "value": 332, "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "discovery": { "kind": "year", "year": 1826, "by": "Balard", "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "radius": { "status": "reported", "value": 120, "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "electronegativity": { "status": "reported", "value": 2.96, "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "ionization": { "status": "reported", "value": 11.81381, "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#br" } } },
  { "atomicNumber": 36, "symbol": "Kr", "names": { "en": "Krypton", "de": "Krypton" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Kr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "period": 4, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "weight": { "kind": "value", "decimal": "83.798", "uncertaintyDigits": "2", "noteCodes": ["g", "m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Kr" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "shells": [2, 8, 18, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "melting": { "status": "reported", "value": 115.78, "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "boiling": { "status": "reported", "value": 119.93, "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "discovery": { "kind": "year", "year": 1898, "by": "Ramsay, Travers", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "electronegativity": { "status": "reported", "value": 3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "ionization": { "status": "reported", "value": 13.9996053, "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#kr" } } },
  { "atomicNumber": 37, "symbol": "Rb", "names": { "en": "Rubidium", "de": "Rubidium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "period": 5, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "weight": { "kind": "value", "decimal": "85.4678", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rb" } }, "configuration": { "status": "reported", "value": "[Kr] 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "shells": [2, 8, 18, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "melting": { "status": "reported", "value": 312.45, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "boiling": { "status": "reported", "value": 961, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "discovery": { "kind": "year", "year": 1861, "by": "Bunsen, Kirchhoff", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "radius": { "status": "reported", "value": 248, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "electronegativity": { "status": "reported", "value": 0.82, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "ionization": { "status": "reported", "value": 4.177128, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#rb" } } },
  { "atomicNumber": 38, "symbol": "Sr", "names": { "en": "Strontium", "de": "Strontium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "period": 5, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "weight": { "kind": "value", "decimal": "87.62", "uncertaintyDigits": "1", "noteCodes": ["g", "r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sr" } }, "configuration": { "status": "reported", "value": "[Kr] 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "shells": [2, 8, 18, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "melting": { "status": "reported", "value": 1050, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "boiling": { "status": "reported", "value": 1650, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "discovery": { "kind": "year", "year": 1798, "by": "Klaproth", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "radius": { "status": "reported", "value": 215, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "electronegativity": { "status": "reported", "value": 0.95, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "ionization": { "status": "reported", "value": 5.6948674, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#sr" } } },
  { "atomicNumber": 39, "symbol": "Y", "names": { "en": "Yttrium", "de": "Yttrium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Y" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "period": 5, "group": { "status": "reported", "value": 3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "weight": { "kind": "value", "decimal": "88.905838", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Y" } }, "configuration": { "status": "reported", "value": "[Kr] 4d1 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "shells": [2, 8, 18, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "melting": { "status": "reported", "value": 1799, "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "boiling": { "status": "reported", "value": 3203, "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "discovery": { "kind": "year", "year": 1794, "by": "Gadolin", "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "radius": { "status": "reported", "value": 180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "electronegativity": { "status": "reported", "value": 1.22, "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "ionization": { "status": "reported", "value": 6.21726, "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#y" } } },
  { "atomicNumber": 40, "symbol": "Zr", "names": { "en": "Zirconium", "de": "Zirconium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Zr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "period": 5, "group": { "status": "reported", "value": 4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "weight": { "kind": "value", "decimal": "91.222", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Zr" } }, "configuration": { "status": "reported", "value": "[Kr] 4d2 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "shells": [2, 8, 18, 10, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "melting": { "status": "reported", "value": 2125, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "boiling": { "status": "reported", "value": 4650, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "discovery": { "kind": "year", "year": 1789, "by": "Klaproth", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "radius": { "status": "reported", "value": 160, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "electronegativity": { "status": "reported", "value": 1.33, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "ionization": { "status": "reported", "value": 6.634126, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#zr" } } },
  { "atomicNumber": 41, "symbol": "Nb", "names": { "en": "Niobium", "de": "Niob" }, "aliases": { "en": ["Columbium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "period": 5, "group": { "status": "reported", "value": 5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "weight": { "kind": "value", "decimal": "92.90637", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nb" } }, "configuration": { "status": "reported", "value": "[Kr] 4d4 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "shells": [2, 8, 18, 12, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "melting": { "status": "reported", "value": 2750, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "boiling": { "status": "reported", "value": 5017, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "discovery": { "kind": "year", "year": 1801, "by": "Hatchet", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "radius": { "status": "reported", "value": 146, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "electronegativity": { "status": "reported", "value": 1.6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "ionization": { "status": "reported", "value": 6.75885, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#nb" } } },
  { "atomicNumber": 42, "symbol": "Mo", "names": { "en": "Molybdenum", "de": "Molybd\xE4n" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mo" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "period": 5, "group": { "status": "reported", "value": 6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "weight": { "kind": "value", "decimal": "95.95", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mo" } }, "configuration": { "status": "reported", "value": "[Kr] 4d5 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "shells": [2, 8, 18, 13, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "melting": { "status": "reported", "value": 2896, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "boiling": { "status": "reported", "value": 4912, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "discovery": { "kind": "year", "year": 1778, "by": "Scheele", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "radius": { "status": "reported", "value": 139, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "electronegativity": { "status": "reported", "value": 2.16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "ionization": { "status": "reported", "value": 7.09243, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#mo" } } },
  { "atomicNumber": 43, "symbol": "Tc", "names": { "en": "Technetium", "de": "Technetium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tc" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "period": 5, "group": { "status": "reported", "value": 7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tc" } }, "configuration": { "status": "reported", "value": "[Kr] 4d5 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "shells": [2, 8, 18, 13, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "melting": { "status": "reported", "value": 2430, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "boiling": { "status": "reported", "value": 4538, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "discovery": { "kind": "year", "year": 1937, "by": "Segr\xE8", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "radius": { "status": "reported", "value": 136, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "electronegativity": { "status": "reported", "value": 1.9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "ionization": { "status": "reported", "value": 7.11938, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "halfLife": { "kind": "value", "seconds": 13285465835303231e-2, "massNumber": 97, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#tc" } } },
  { "atomicNumber": 44, "symbol": "Ru", "names": { "en": "Ruthenium", "de": "Ruthenium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ru" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "period": 5, "group": { "status": "reported", "value": 8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "weight": { "kind": "value", "decimal": "101.07", "uncertaintyDigits": "2", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ru" } }, "configuration": { "status": "reported", "value": "[Kr] 4d7 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "shells": [2, 8, 18, 15, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "melting": { "status": "reported", "value": 2607, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "boiling": { "status": "reported", "value": 4423, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "discovery": { "kind": "year", "year": 1844, "by": "Claus", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "radius": { "status": "reported", "value": 134, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "electronegativity": { "status": "reported", "value": 2.2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "ionization": { "status": "reported", "value": 7.3605, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ru" } } },
  { "atomicNumber": 45, "symbol": "Rh", "names": { "en": "Rhodium", "de": "Rhodium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rh" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "period": 5, "group": { "status": "reported", "value": 9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "weight": { "kind": "value", "decimal": "102.90549", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rh" } }, "configuration": { "status": "reported", "value": "[Kr] 4d8 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "shells": [2, 8, 18, 16, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "melting": { "status": "reported", "value": 2237, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "boiling": { "status": "reported", "value": 3968, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "discovery": { "kind": "year", "year": 1803, "by": "Wollaston", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "radius": { "status": "reported", "value": 134, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "electronegativity": { "status": "reported", "value": 2.28, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "ionization": { "status": "reported", "value": 7.4589, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#rh" } } },
  { "atomicNumber": 46, "symbol": "Pd", "names": { "en": "Palladium", "de": "Palladium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pd" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "period": 5, "group": { "status": "reported", "value": 10, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "weight": { "kind": "value", "decimal": "106.42", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pd" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "shells": [2, 8, 18, 18], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "melting": { "status": "reported", "value": 1828.05, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "boiling": { "status": "reported", "value": 3236, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "discovery": { "kind": "year", "year": 1803, "by": "Wollaston", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "radius": { "status": "reported", "value": 137, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "electronegativity": { "status": "reported", "value": 2.2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "ionization": { "status": "reported", "value": 8.336839, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#pd" } } },
  { "atomicNumber": 47, "symbol": "Ag", "names": { "en": "Silver", "de": "Silber" }, "aliases": { "en": ["Argentum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ag" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "period": 5, "group": { "status": "reported", "value": 11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "weight": { "kind": "value", "decimal": "107.8682", "uncertaintyDigits": "2", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ag" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "shells": [2, 8, 18, 18, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "melting": { "status": "reported", "value": 1234.93, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "boiling": { "status": "reported", "value": 2435, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "radius": { "status": "reported", "value": 144, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "electronegativity": { "status": "reported", "value": 1.93, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "ionization": { "status": "reported", "value": 7.576234, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ag" } } },
  { "atomicNumber": 48, "symbol": "Cd", "names": { "en": "Cadmium", "de": "Cadmium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cd" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "period": 5, "group": { "status": "reported", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "weight": { "kind": "value", "decimal": "112.414", "uncertaintyDigits": "4", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cd" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "shells": [2, 8, 18, 18, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "melting": { "status": "reported", "value": 594.22, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "boiling": { "status": "reported", "value": 1040, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "discovery": { "kind": "year", "year": 1817, "by": "Stromeyer, Hermann", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "radius": { "status": "reported", "value": 151, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "electronegativity": { "status": "reported", "value": 1.69, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "ionization": { "status": "reported", "value": 8.99382, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#cd" } } },
  { "atomicNumber": 49, "symbol": "In", "names": { "en": "Indium", "de": "Indium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#In" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "period": 5, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "weight": { "kind": "value", "decimal": "114.818", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#In" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "shells": [2, 8, 18, 18, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "melting": { "status": "reported", "value": 429.7485, "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "boiling": { "status": "reported", "value": 2345, "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "discovery": { "kind": "year", "year": 1863, "by": "Reich, Richter", "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "radius": { "status": "reported", "value": 167, "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "electronegativity": { "status": "reported", "value": 1.78, "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "ionization": { "status": "reported", "value": 5.7863556, "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#in" } } },
  { "atomicNumber": 50, "symbol": "Sn", "names": { "en": "Tin", "de": "Zinn" }, "aliases": { "en": ["Stannum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "period": 5, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "weight": { "kind": "value", "decimal": "118.710", "uncertaintyDigits": "7", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sn" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "shells": [2, 8, 18, 18, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "melting": { "status": "reported", "value": 505.08, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "boiling": { "status": "reported", "value": 2875, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "radius": { "status": "reported", "value": 140, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "electronegativity": { "status": "reported", "value": 1.96, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "ionization": { "status": "reported", "value": 7.343918, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#sn" } } },
  { "atomicNumber": 51, "symbol": "Sb", "names": { "en": "Antimony", "de": "Antimon" }, "aliases": { "en": ["Stibium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "period": 5, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "weight": { "kind": "value", "decimal": "121.760", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sb" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "shells": [2, 8, 18, 18, 5], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "melting": { "status": "reported", "value": 903.78, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "boiling": { "status": "reported", "value": 1908, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "radius": { "status": "reported", "value": 140, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "electronegativity": { "status": "reported", "value": 2.05, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "ionization": { "status": "reported", "value": 8.608389, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#sb" } } },
  { "atomicNumber": 52, "symbol": "Te", "names": { "en": "Tellurium", "de": "Tellur" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Te" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "period": 5, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "weight": { "kind": "value", "decimal": "127.60", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Te" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "shells": [2, 8, 18, 18, 6], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "melting": { "status": "reported", "value": 722.66, "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "boiling": { "status": "reported", "value": 1261, "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "discovery": { "kind": "year", "year": 1782, "by": "von Reichenstein", "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "radius": { "status": "reported", "value": 140, "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "electronegativity": { "status": "reported", "value": 2.1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "ionization": { "status": "reported", "value": 9.009808, "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#te" } } },
  { "atomicNumber": 53, "symbol": "I", "names": { "en": "Iodine", "de": "Iod" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#I" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "period": 5, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "weight": { "kind": "value", "decimal": "126.90447", "uncertaintyDigits": "3", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#I" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "shells": [2, 8, 18, 18, 7], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "melting": { "status": "reported", "value": 386.85, "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "boiling": { "status": "reported", "value": 457.4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "discovery": { "kind": "year", "year": 1811, "by": "Courtois", "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "radius": { "status": "reported", "value": 140, "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "electronegativity": { "status": "reported", "value": 2.66, "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "ionization": { "status": "reported", "value": 10.45126, "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#i" } } },
  { "atomicNumber": 54, "symbol": "Xe", "names": { "en": "Xenon", "de": "Xenon" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Xe" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "period": 5, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "weight": { "kind": "value", "decimal": "131.293", "uncertaintyDigits": "6", "noteCodes": ["g", "m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Xe" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "shells": [2, 8, 18, 18, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "melting": { "status": "reported", "value": 161.4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "boiling": { "status": "reported", "value": 165.051, "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "discovery": { "kind": "year", "year": 1898, "by": "Ramsay, Travers", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "electronegativity": { "status": "reported", "value": 2.6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "ionization": { "status": "reported", "value": 12.1298436, "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#xe" } } },
  { "atomicNumber": 55, "symbol": "Cs", "names": { "en": "Caesium", "de": "Caesium" }, "aliases": { "en": ["Cesium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cs" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "period": 6, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "weight": { "kind": "value", "decimal": "132.90545196", "uncertaintyDigits": "6", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cs" } }, "configuration": { "status": "reported", "value": "[Xe] 6s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "shells": [2, 8, 18, 18, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "melting": { "status": "reported", "value": 301.7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "boiling": { "status": "reported", "value": 944, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "discovery": { "kind": "year", "year": 1860, "by": "Kirchhoff, Bunsen", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "radius": { "status": "reported", "value": 265, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "electronegativity": { "status": "reported", "value": 0.79, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "ionization": { "status": "reported", "value": 3.893905695, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#cs" } } },
  { "atomicNumber": 56, "symbol": "Ba", "names": { "en": "Barium", "de": "Barium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ba" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "period": 6, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "weight": { "kind": "value", "decimal": "137.327", "uncertaintyDigits": "7", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ba" } }, "configuration": { "status": "reported", "value": "[Xe] 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "shells": [2, 8, 18, 18, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "melting": { "status": "reported", "value": 1e3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "boiling": { "status": "reported", "value": 2118, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "discovery": { "kind": "year", "year": 1808, "by": "Davy", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "radius": { "status": "reported", "value": 222, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "electronegativity": { "status": "reported", "value": 0.89, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "ionization": { "status": "reported", "value": 5.2116646, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ba" } } },
  { "atomicNumber": 57, "symbol": "La", "names": { "en": "Lanthanum", "de": "Lanthan" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#La" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "period": 6, "group": { "status": "convention-dependent", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "weight": { "kind": "value", "decimal": "138.90547", "uncertaintyDigits": "7", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#La" } }, "configuration": { "status": "reported", "value": "[Xe] 5d1 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "shells": [2, 8, 18, 18, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "melting": { "status": "reported", "value": 1193, "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "boiling": { "status": "reported", "value": 3737, "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "discovery": { "kind": "year", "year": 1839, "by": "Mosander", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "radius": { "status": "reported", "value": 187, "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "electronegativity": { "status": "reported", "value": 1.1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "ionization": { "status": "reported", "value": 5.5769, "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#la" } } },
  { "atomicNumber": 58, "symbol": "Ce", "names": { "en": "Cerium", "de": "Cer" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ce" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "weight": { "kind": "value", "decimal": "140.116", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ce" } }, "configuration": { "status": "reported", "value": "[Xe] 4f1 5d1 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "shells": [2, 8, 18, 19, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "melting": { "status": "reported", "value": 1068, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "boiling": { "status": "reported", "value": 3716, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "discovery": { "kind": "year", "year": 1803, "by": "von Hisinger, Berzelius, Klaproth", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "radius": { "status": "reported", "value": 182, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "electronegativity": { "status": "reported", "value": 1.12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "ionization": { "status": "reported", "value": 5.5386, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ce" } } },
  { "atomicNumber": 59, "symbol": "Pr", "names": { "en": "Praseodymium", "de": "Praseodym" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "weight": { "kind": "value", "decimal": "140.90766", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pr" } }, "configuration": { "status": "reported", "value": "[Xe] 4f3 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "shells": [2, 8, 18, 21, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "melting": { "status": "reported", "value": 1208, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "boiling": { "status": "reported", "value": 3403, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "discovery": { "kind": "year", "year": 1895, "by": "von Welsbach", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "radius": { "status": "reported", "value": 182, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "electronegativity": { "status": "reported", "value": 1.13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "ionization": { "status": "reported", "value": 5.4702, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#pr" } } },
  { "atomicNumber": 60, "symbol": "Nd", "names": { "en": "Neodymium", "de": "Neodym" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nd" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "weight": { "kind": "value", "decimal": "144.242", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nd" } }, "configuration": { "status": "reported", "value": "[Xe] 4f4 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "shells": [2, 8, 18, 22, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "melting": { "status": "reported", "value": 1297, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "boiling": { "status": "reported", "value": 3347, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "discovery": { "kind": "year", "year": 1895, "by": "von Welsbach", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "radius": { "status": "reported", "value": 181, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "electronegativity": { "status": "reported", "value": 1.14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "ionization": { "status": "reported", "value": 5.525, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#nd" } } },
  { "atomicNumber": 61, "symbol": "Pm", "names": { "en": "Promethium", "de": "Promethium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pm" } }, "configuration": { "status": "reported", "value": "[Xe] 4f5 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "shells": [2, 8, 18, 23, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "melting": { "status": "reported", "value": 1315, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "boiling": { "status": "reported", "value": 3273, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "discovery": { "kind": "year", "year": 1945, "by": "Marinsky", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "radius": { "status": "reported", "value": 183, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "ionization": { "status": "reported", "value": 5.58187, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "halfLife": { "kind": "value", "seconds": 5585575897502784e-7, "massNumber": 145, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#pm" } } },
  { "atomicNumber": 62, "symbol": "Sm", "names": { "en": "Samarium", "de": "Samarium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "weight": { "kind": "value", "decimal": "150.36", "uncertaintyDigits": "2", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sm" } }, "configuration": { "status": "reported", "value": "[Xe] 4f6 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "shells": [2, 8, 18, 24, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "melting": { "status": "reported", "value": 1345, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "boiling": { "status": "reported", "value": 2173, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "discovery": { "kind": "year", "year": 1879, "by": "Lecoq de Boisbaudran", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "radius": { "status": "reported", "value": 180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "electronegativity": { "status": "reported", "value": 1.17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "ionization": { "status": "reported", "value": 5.64371, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#sm" } } },
  { "atomicNumber": 63, "symbol": "Eu", "names": { "en": "Europium", "de": "Europium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Eu" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "weight": { "kind": "value", "decimal": "151.964", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Eu" } }, "configuration": { "status": "reported", "value": "[Xe] 4f7 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "shells": [2, 8, 18, 25, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "melting": { "status": "reported", "value": 1099, "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "boiling": { "status": "reported", "value": 1802, "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "discovery": { "kind": "year", "year": 1901, "by": "Demar\xE7ay", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "radius": { "status": "reported", "value": 180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "ionization": { "status": "reported", "value": 5.670385, "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#eu" } } },
  { "atomicNumber": 64, "symbol": "Gd", "names": { "en": "Gadolinium", "de": "Gadolinium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Gd" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "weight": { "kind": "value", "decimal": "157.249", "uncertaintyDigits": "2", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Gd" } }, "configuration": { "status": "reported", "value": "[Xe] 4f7 5d1 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "shells": [2, 8, 18, 25, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "melting": { "status": "reported", "value": 1585, "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "boiling": { "status": "reported", "value": 3273, "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "discovery": { "kind": "year", "year": 1880, "by": "de Marignac", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "radius": { "status": "reported", "value": 180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "electronegativity": { "status": "reported", "value": 1.2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "ionization": { "status": "reported", "value": 6.1498, "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#gd" } } },
  { "atomicNumber": 65, "symbol": "Tb", "names": { "en": "Terbium", "de": "Terbium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "weight": { "kind": "value", "decimal": "158.925354", "uncertaintyDigits": "7", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tb" } }, "configuration": { "status": "reported", "value": "[Xe] 4f9 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "shells": [2, 8, 18, 27, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "melting": { "status": "reported", "value": 1629, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "boiling": { "status": "reported", "value": 3396, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "discovery": { "kind": "year", "year": 1843, "by": "Mosander", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "radius": { "status": "reported", "value": 177, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "ionization": { "status": "reported", "value": 5.8638, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#tb" } } },
  { "atomicNumber": 66, "symbol": "Dy", "names": { "en": "Dysprosium", "de": "Dysprosium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Dy" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "weight": { "kind": "value", "decimal": "162.500", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Dy" } }, "configuration": { "status": "reported", "value": "[Xe] 4f10 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "shells": [2, 8, 18, 28, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "melting": { "status": "reported", "value": 1680, "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "boiling": { "status": "reported", "value": 2840, "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "discovery": { "kind": "year", "year": 1886, "by": "Lecoq de Boisbaudran", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "radius": { "status": "reported", "value": 178, "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "electronegativity": { "status": "reported", "value": 1.22, "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "ionization": { "status": "reported", "value": 5.93905, "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#dy" } } },
  { "atomicNumber": 67, "symbol": "Ho", "names": { "en": "Holmium", "de": "Holmium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ho" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "weight": { "kind": "value", "decimal": "164.930329", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ho" } }, "configuration": { "status": "reported", "value": "[Xe] 4f11 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "shells": [2, 8, 18, 29, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "melting": { "status": "reported", "value": 1734, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "boiling": { "status": "reported", "value": 2873, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "discovery": { "kind": "year", "year": 1878, "by": "Soret", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "radius": { "status": "reported", "value": 176, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "electronegativity": { "status": "reported", "value": 1.23, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "ionization": { "status": "reported", "value": 6.0215, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ho" } } },
  { "atomicNumber": 68, "symbol": "Er", "names": { "en": "Erbium", "de": "Erbium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Er" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "weight": { "kind": "value", "decimal": "167.259", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Er" } }, "configuration": { "status": "reported", "value": "[Xe] 4f12 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "shells": [2, 8, 18, 30, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "melting": { "status": "reported", "value": 1802, "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "boiling": { "status": "reported", "value": 3141, "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "discovery": { "kind": "year", "year": 1842, "by": "Mosander", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "radius": { "status": "reported", "value": 176, "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "electronegativity": { "status": "reported", "value": 1.24, "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "ionization": { "status": "reported", "value": 6.1077, "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#er" } } },
  { "atomicNumber": 69, "symbol": "Tm", "names": { "en": "Thulium", "de": "Thulium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "weight": { "kind": "value", "decimal": "168.934219", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tm" } }, "configuration": { "status": "reported", "value": "[Xe] 4f13 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "shells": [2, 8, 18, 31, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "melting": { "status": "reported", "value": 1818, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "boiling": { "status": "reported", "value": 2223, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "discovery": { "kind": "year", "year": 1879, "by": "Cleve", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "radius": { "status": "reported", "value": 176, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "electronegativity": { "status": "reported", "value": 1.25, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "ionization": { "status": "reported", "value": 6.18431, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#tm" } } },
  { "atomicNumber": 70, "symbol": "Yb", "names": { "en": "Ytterbium", "de": "Ytterbium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Yb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "weight": { "kind": "value", "decimal": "173.045", "uncertaintyDigits": "10", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Yb" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "shells": [2, 8, 18, 32, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "melting": { "status": "reported", "value": 1097, "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "boiling": { "status": "reported", "value": 1469, "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "discovery": { "kind": "year", "year": 1878, "by": "de Marignac", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "radius": { "status": "reported", "value": 176, "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "ionization": { "status": "reported", "value": 6.25416, "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#yb" } } },
  { "atomicNumber": 71, "symbol": "Lu", "names": { "en": "Lutetium", "de": "Lutetium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lu" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "period": 6, "group": { "status": "convention-dependent", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "weight": { "kind": "value", "decimal": "174.96669", "uncertaintyDigits": "5", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lu" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d1 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "shells": [2, 8, 18, 32, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "melting": { "status": "reported", "value": 1925, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "boiling": { "status": "reported", "value": 3675, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "discovery": { "kind": "year", "year": 1907, "by": "von Welsbach, Urbain", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "radius": { "status": "reported", "value": 174, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "electronegativity": { "status": "reported", "value": 1.27, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "ionization": { "status": "reported", "value": 5.425871, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#lu" } } },
  { "atomicNumber": 72, "symbol": "Hf", "names": { "en": "Hafnium", "de": "Hafnium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hf" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "period": 6, "group": { "status": "reported", "value": 4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "weight": { "kind": "value", "decimal": "178.486", "uncertaintyDigits": "6", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hf" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d2 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "shells": [2, 8, 18, 32, 10, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "melting": { "status": "reported", "value": 2506, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "boiling": { "status": "reported", "value": 4876, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "discovery": { "kind": "year", "year": 1923, "by": "Coster, de Hevesy", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "radius": { "status": "reported", "value": 159, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "ionization": { "status": "reported", "value": 6.82507, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#hf" } } },
  { "atomicNumber": 73, "symbol": "Ta", "names": { "en": "Tantalum", "de": "Tantal" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ta" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "period": 6, "group": { "status": "reported", "value": 5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "weight": { "kind": "value", "decimal": "180.94788", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ta" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d3 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "shells": [2, 8, 18, 32, 11, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "melting": { "status": "reported", "value": 3290, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "boiling": { "status": "reported", "value": 5731, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "discovery": { "kind": "year", "year": 1802, "by": "Ekeberg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "radius": { "status": "reported", "value": 146, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "electronegativity": { "status": "reported", "value": 1.5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "ionization": { "status": "reported", "value": 7.549571, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ta" } } },
  { "atomicNumber": 74, "symbol": "W", "names": { "en": "Tungsten", "de": "Wolfram" }, "aliases": { "en": ["Wolfram"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#W" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "period": 6, "group": { "status": "reported", "value": 6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "weight": { "kind": "value", "decimal": "183.84", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#W" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d4 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "shells": [2, 8, 18, 32, 12, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "melting": { "status": "reported", "value": 3695, "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "boiling": { "status": "reported", "value": 6203, "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "discovery": { "kind": "year", "year": 1783, "by": "Fausto und Juan de Elhuyar", "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "radius": { "status": "reported", "value": 139, "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "electronegativity": { "status": "reported", "value": 2.36, "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "ionization": { "status": "reported", "value": 7.86403, "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#w" } } },
  { "atomicNumber": 75, "symbol": "Re", "names": { "en": "Rhenium", "de": "Rhenium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Re" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "period": 6, "group": { "status": "reported", "value": 7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "weight": { "kind": "value", "decimal": "186.207", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Re" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d5 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "shells": [2, 8, 18, 32, 13, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "melting": { "status": "reported", "value": 3459, "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "boiling": { "status": "reported", "value": 5903, "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "discovery": { "kind": "year", "year": 1925, "by": "Noddack, Tacke, Berg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "radius": { "status": "reported", "value": 137, "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "electronegativity": { "status": "reported", "value": 1.9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "ionization": { "status": "reported", "value": 7.83352, "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#re" } } },
  { "atomicNumber": 76, "symbol": "Os", "names": { "en": "Osmium", "de": "Osmium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Os" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "period": 6, "group": { "status": "reported", "value": 8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "weight": { "kind": "value", "decimal": "190.23", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Os" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d6 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "shells": [2, 8, 18, 32, 14, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "melting": { "status": "reported", "value": 3306, "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "boiling": { "status": "reported", "value": 5285, "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "discovery": { "kind": "year", "year": 1803, "by": "Tennant", "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "radius": { "status": "reported", "value": 135, "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "electronegativity": { "status": "reported", "value": 2.2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "ionization": { "status": "reported", "value": 8.43823, "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#os" } } },
  { "atomicNumber": 77, "symbol": "Ir", "names": { "en": "Iridium", "de": "Iridium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ir" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "period": 6, "group": { "status": "reported", "value": 9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "weight": { "kind": "value", "decimal": "192.217", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ir" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d7 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "shells": [2, 8, 18, 32, 15, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "melting": { "status": "reported", "value": 2719, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "boiling": { "status": "reported", "value": 4403, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "discovery": { "kind": "year", "year": 1803, "by": "Tennant", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "radius": { "status": "reported", "value": 136, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "electronegativity": { "status": "reported", "value": 2.2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "ionization": { "status": "reported", "value": 8.96702, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ir" } } },
  { "atomicNumber": 78, "symbol": "Pt", "names": { "en": "Platinum", "de": "Platin" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pt" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "period": 6, "group": { "status": "reported", "value": 10, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "weight": { "kind": "value", "decimal": "195.084", "uncertaintyDigits": "9", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pt" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d9 6s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "shells": [2, 8, 18, 32, 17, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "melting": { "status": "reported", "value": 2041.4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "boiling": { "status": "reported", "value": 4098, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "discovery": { "kind": "year", "year": 1557, "by": "Scaliger", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "radius": { "status": "reported", "value": 139, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "electronegativity": { "status": "reported", "value": 2.28, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "ionization": { "status": "reported", "value": 8.95883, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#pt" } } },
  { "atomicNumber": 79, "symbol": "Au", "names": { "en": "Gold", "de": "Gold" }, "aliases": { "en": ["Aurum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Au" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "period": 6, "group": { "status": "reported", "value": 11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "weight": { "kind": "value", "decimal": "196.966570", "uncertaintyDigits": "4", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Au" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "shells": [2, 8, 18, 32, 18, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "melting": { "status": "reported", "value": 1337.33, "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "boiling": { "status": "reported", "value": 3243, "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "radius": { "status": "reported", "value": 144, "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "electronegativity": { "status": "reported", "value": 2.54, "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "ionization": { "status": "reported", "value": 9.225554, "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#au" } } },
  { "atomicNumber": 80, "symbol": "Hg", "names": { "en": "Mercury", "de": "Quecksilber" }, "aliases": { "en": ["Hydrargyrum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hg" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "period": 6, "group": { "status": "reported", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "weight": { "kind": "value", "decimal": "200.592", "uncertaintyDigits": "3", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hg" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "shells": [2, 8, 18, 32, 18, 2], "phase": { "status": "reported", "value": "liquid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "melting": { "status": "reported", "value": 234.321, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "boiling": { "status": "reported", "value": 629.88, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "radius": { "status": "reported", "value": 151, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "electronegativity": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "ionization": { "status": "reported", "value": 10.437504, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#hg" } } },
  { "atomicNumber": 81, "symbol": "Tl", "names": { "en": "Thallium", "de": "Thallium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tl" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "period": 6, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "weight": { "kind": "interval", "lower": "204.382", "upper": "204.385", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tl" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "shells": [2, 8, 18, 32, 18, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "melting": { "status": "reported", "value": 577, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "boiling": { "status": "reported", "value": 1746, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "discovery": { "kind": "year", "year": 1861, "by": "Crookes", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "radius": { "status": "reported", "value": 170, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "electronegativity": { "status": "reported", "value": 1.62, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "ionization": { "status": "reported", "value": 6.1082873, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#tl" } } },
  { "atomicNumber": 82, "symbol": "Pb", "names": { "en": "Lead", "de": "Blei" }, "aliases": { "en": ["Plumbum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "period": 6, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "weight": { "kind": "interval", "lower": "206.14", "upper": "207.94", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pb" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "shells": [2, 8, 18, 32, 18, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "melting": { "status": "reported", "value": 600.61, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "boiling": { "status": "reported", "value": 2022, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "discovery": { "kind": "antiquity", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "radius": { "status": "reported", "value": 175, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "electronegativity": { "status": "reported", "value": 2.33, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "ionization": { "status": "reported", "value": 7.4166799, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "halfLife": { "kind": "stable", "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#pb" } } },
  { "atomicNumber": 83, "symbol": "Bi", "names": { "en": "Bismuth", "de": "Bismut" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bi" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "period": 6, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "weight": { "kind": "value", "decimal": "208.98040", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bi" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "shells": [2, 8, 18, 32, 18, 5], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "melting": { "status": "reported", "value": 544.7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "boiling": { "status": "reported", "value": 1837, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "discovery": { "kind": "year", "year": 1540, "by": "Agricola", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "radius": { "status": "reported", "value": 156, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "electronegativity": { "status": "reported", "value": 2.02, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "ionization": { "status": "reported", "value": 7.285516, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "halfLife": { "kind": "value", "seconds": 6342942120892992e11, "massNumber": 209, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#bi" } } },
  { "atomicNumber": 84, "symbol": "Po", "names": { "en": "Polonium", "de": "Polonium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Po" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "period": 6, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Po" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "shells": [2, 8, 18, 32, 18, 6], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "melting": { "status": "reported", "value": 527, "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "boiling": { "status": "reported", "value": 1235, "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "discovery": { "kind": "year", "year": 1898, "by": "Marie und Pierre Curie", "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "radius": { "status": "reported", "value": 168, "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "electronegativity": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "ionization": { "status": "reported", "value": 8.41807, "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "halfLife": { "kind": "value", "seconds": 3913058820849408e-6, "massNumber": 209, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#po" } } },
  { "atomicNumber": 85, "symbol": "At", "names": { "en": "Astatine", "de": "Astat" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#At" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "period": 6, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#At" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "shells": [2, 8, 18, 32, 18, 7], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "discovery": { "kind": "year", "year": 1940, "by": "Segr\xE8", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "electronegativity": { "status": "reported", "value": 2.2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "ionization": { "status": "reported", "value": 9.31751, "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "halfLife": { "kind": "value", "seconds": 29160, "massNumber": 210, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#at" } } },
  { "atomicNumber": 86, "symbol": "Rn", "names": { "en": "Radon", "de": "Radon" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "period": 6, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rn" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "shells": [2, 8, 18, 32, 18, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "melting": { "status": "reported", "value": 202, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "boiling": { "status": "reported", "value": 211.5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "discovery": { "kind": "year", "year": 1900, "by": "Dorn", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "ionization": { "status": "reported", "value": 10.7485, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "halfLife": { "kind": "value", "seconds": 330350.4, "massNumber": 222, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#rn" } } },
  { "atomicNumber": 87, "symbol": "Fr", "names": { "en": "Francium", "de": "Francium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "period": 7, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fr" } }, "configuration": { "status": "reported", "value": "[Rn] 7s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "shells": [2, 8, 18, 32, 18, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "melting": { "status": "reported", "value": 300, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "boiling": { "status": "reported", "value": 950, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "discovery": { "kind": "year", "year": 1939, "by": "Perey", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "electronegativity": { "status": "reported", "value": 0.7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "ionization": { "status": "reported", "value": 4.072741, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "halfLife": { "kind": "value", "seconds": 1320, "massNumber": 223, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#fr" } } },
  { "atomicNumber": 88, "symbol": "Ra", "names": { "en": "Radium", "de": "Radium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ra" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "period": 7, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ra" } }, "configuration": { "status": "reported", "value": "[Rn] 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "shells": [2, 8, 18, 32, 18, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "melting": { "status": "reported", "value": 973, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "boiling": { "status": "reported", "value": 2010, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "discovery": { "kind": "year", "year": 1898, "by": "Marie und Pierre Curie", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "electronegativity": { "status": "reported", "value": 0.9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "ionization": { "status": "reported", "value": 5.2784239, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "halfLife": { "kind": "value", "seconds": 504910815593472e-4, "massNumber": 226, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ra" } } },
  { "atomicNumber": 89, "symbol": "Ac", "names": { "en": "Actinium", "de": "Actinium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ac" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "period": 7, "group": { "status": "convention-dependent", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ac" } }, "configuration": { "status": "reported", "value": "[Rn] 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "shells": [2, 8, 18, 32, 18, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "melting": { "status": "reported", "value": 1500, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "boiling": { "status": "reported", "value": 3500, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "discovery": { "kind": "year", "year": 1899, "by": "Debierne", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "electronegativity": { "status": "reported", "value": 1.1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "ionization": { "status": "reported", "value": 5.380226, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "halfLife": { "kind": "value", "seconds": 687057392318817e-6, "massNumber": 227, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ac" } } },
  { "atomicNumber": 90, "symbol": "Th", "names": { "en": "Thorium", "de": "Thorium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Th" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "weight": { "kind": "value", "decimal": "232.0377", "uncertaintyDigits": "4", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Th" } }, "configuration": { "status": "reported", "value": "[Rn] 6d2 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "shells": [2, 8, 18, 32, 18, 10, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "melting": { "status": "reported", "value": 2023, "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "boiling": { "status": "reported", "value": 5061, "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "discovery": { "kind": "year", "year": 1829, "by": "Berzelius", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "radius": { "status": "reported", "value": 180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "ionization": { "status": "reported", "value": 6.3067, "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "halfLife": { "kind": "value", "seconds": 441796963644288e3, "massNumber": 232, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#th" } } },
  { "atomicNumber": 91, "symbol": "Pa", "names": { "en": "Protactinium", "de": "Protactinium" }, "aliases": { "en": ["Protoactinium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pa" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "weight": { "kind": "value", "decimal": "231.03588", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pa" } }, "configuration": { "status": "reported", "value": "[Rn] 5f2 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "shells": [2, 8, 18, 32, 20, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "melting": { "status": "reported", "value": 1841, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "boiling": { "status": "reported", "value": 4300, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "discovery": { "kind": "year", "year": 1917, "by": "Fajans, Hahn, Meitner", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "radius": { "status": "reported", "value": 163, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "electronegativity": { "status": "reported", "value": 1.5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "ionization": { "status": "reported", "value": 5.89, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "halfLife": { "kind": "value", "seconds": 10278090789924614e-4, "massNumber": 231, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#pa" } } },
  { "atomicNumber": 92, "symbol": "U", "names": { "en": "Uranium", "de": "Uran" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#U" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "weight": { "kind": "value", "decimal": "238.02891", "uncertaintyDigits": "3", "noteCodes": ["g", "m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#U" } }, "configuration": { "status": "reported", "value": "[Rn] 5f3 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "shells": [2, 8, 18, 32, 21, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "melting": { "status": "reported", "value": 1405.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "boiling": { "status": "reported", "value": 4404, "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "discovery": { "kind": "year", "year": 1789, "by": "Klaproth", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "radius": { "status": "reported", "value": 156, "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "electronegativity": { "status": "reported", "value": 1.38, "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "ionization": { "status": "reported", "value": 6.19405, "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "halfLife": { "kind": "value", "seconds": 140996345254477060, "massNumber": 238, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#u" } } },
  { "atomicNumber": 93, "symbol": "Np", "names": { "en": "Neptunium", "de": "Neptunium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Np" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Np" } }, "configuration": { "status": "reported", "value": "[Rn] 5f4 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "shells": [2, 8, 18, 32, 22, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "melting": { "status": "reported", "value": 912, "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "boiling": { "status": "predicted", "value": 4447, "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "discovery": { "kind": "year", "year": 1940, "by": "McMillan, Abelson", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "radius": { "status": "reported", "value": 155, "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "electronegativity": { "status": "reported", "value": 1.36, "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "ionization": { "status": "reported", "value": 6.26554, "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "halfLife": { "kind": "value", "seconds": 6765804928952525e-2, "massNumber": 237, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#np" } } },
  { "atomicNumber": 94, "symbol": "Pu", "names": { "en": "Plutonium", "de": "Plutonium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pu" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pu" } }, "configuration": { "status": "reported", "value": "[Rn] 5f6 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "shells": [2, 8, 18, 32, 24, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "melting": { "status": "reported", "value": 912.5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "boiling": { "status": "reported", "value": 3505, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "discovery": { "kind": "year", "year": 1940, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "radius": { "status": "reported", "value": 159, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "electronegativity": { "status": "reported", "value": 1.28, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "ionization": { "status": "reported", "value": 6.02576, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "halfLife": { "kind": "value", "seconds": 25655780817343295e-1, "massNumber": 244, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#pu" } } },
  { "atomicNumber": 95, "symbol": "Am", "names": { "en": "Americium", "de": "Americium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Am" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Am" } }, "configuration": { "status": "reported", "value": "[Rn] 5f7 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "shells": [2, 8, 18, 32, 25, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "melting": { "status": "reported", "value": 1449, "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "boiling": { "status": "reported", "value": 2880, "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "discovery": { "kind": "year", "year": 1944, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "radius": { "status": "reported", "value": 173, "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "ionization": { "status": "reported", "value": 5.97381, "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "halfLife": { "kind": "value", "seconds": 23238520287689548e-5, "massNumber": 243, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#am" } } },
  { "atomicNumber": 96, "symbol": "Cm", "names": { "en": "Curium", "de": "Curium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cm" } }, "configuration": { "status": "reported", "value": "[Rn] 5f7 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "shells": [2, 8, 18, 32, 25, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "melting": { "status": "reported", "value": 1613, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "boiling": { "status": "reported", "value": 3383, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "discovery": { "kind": "year", "year": 1944, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "radius": { "status": "reported", "value": 174, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "ionization": { "status": "reported", "value": 5.99141, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "halfLife": { "kind": "value", "seconds": 4922880452036352e-1, "massNumber": 247, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#cm" } } },
  { "atomicNumber": 97, "symbol": "Bk", "names": { "en": "Berkelium", "de": "Berkelium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bk" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bk" } }, "configuration": { "status": "reported", "value": "[Rn] 5f9 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "shells": [2, 8, 18, 32, 27, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "melting": { "status": "reported", "value": 1259, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "boiling": { "status": "reported", "value": 2900, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "discovery": { "kind": "year", "year": 1949, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "radius": { "status": "reported", "value": 170, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "ionization": { "status": "reported", "value": 6.19785, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "halfLife": { "kind": "value", "seconds": 4354855784493696e-5, "massNumber": 247, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#bk" } } },
  { "atomicNumber": 98, "symbol": "Cf", "names": { "en": "Californium", "de": "Californium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cf" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cf" } }, "configuration": { "status": "reported", "value": "[Rn] 5f10 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "shells": [2, 8, 18, 32, 28, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "melting": { "status": "reported", "value": 1173, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "boiling": { "status": "predicted", "value": 1743, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "discovery": { "kind": "year", "year": 1950, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "ionization": { "status": "reported", "value": 6.28166, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "halfLife": { "kind": "value", "seconds": 28338119525183617e-6, "massNumber": 251, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#cf" } } },
  { "atomicNumber": 99, "symbol": "Es", "names": { "en": "Einsteinium", "de": "Einsteinium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Es" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Es" } }, "configuration": { "status": "reported", "value": "[Rn] 5f11 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "shells": [2, 8, 18, 32, 29, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "melting": { "status": "reported", "value": 1133, "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "boiling": { "status": "predicted", "value": 1269, "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "discovery": { "kind": "year", "year": 1952, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "ionization": { "status": "reported", "value": 6.36758, "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "halfLife": { "kind": "value", "seconds": 40754880, "massNumber": 252, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#es" } } },
  { "atomicNumber": 100, "symbol": "Fm", "names": { "en": "Fermium", "de": "Fermium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fm" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f12 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "shells": [2, 8, 18, 32, 30, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "melting": { "status": "predicted", "value": 1800, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "discovery": { "kind": "year", "year": 1952, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "ionization": { "status": "predicted", "value": 6.5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "halfLife": { "kind": "value", "seconds": 8683200, "massNumber": 257, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#fm" } } },
  { "atomicNumber": 101, "symbol": "Md", "names": { "en": "Mendelevium", "de": "Mendelevium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Md" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Md" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f13 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "shells": [2, 8, 18, 32, 31, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "melting": { "status": "predicted", "value": 1100, "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "discovery": { "kind": "year", "year": 1955, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "ionization": { "status": "predicted", "value": 6.58, "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "halfLife": { "kind": "value", "seconds": 4449600, "massNumber": 258, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#md" } } },
  { "atomicNumber": 102, "symbol": "No", "names": { "en": "Nobelium", "de": "Nobelium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#No" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#No" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "shells": [2, 8, 18, 32, 32, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "melting": { "status": "predicted", "value": 1100, "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "discovery": { "kind": "year", "year": 1958, "by": "Seaborg", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "ionization": { "status": "predicted", "value": 6.62621, "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "halfLife": { "kind": "value", "seconds": 3480, "massNumber": 259, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#no" } } },
  { "atomicNumber": 103, "symbol": "Lr", "names": { "en": "Lawrencium", "de": "Lawrencium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "period": 7, "group": { "status": "convention-dependent", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lr" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 7s2 7p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "shells": [2, 8, 18, 32, 32, 8, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "melting": { "status": "predicted", "value": 1900, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "discovery": { "kind": "year", "year": 1961, "by": "Ghiorso", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "electronegativity": { "status": "reported", "value": 1.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "ionization": { "status": "predicted", "value": 4.96, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "halfLife": { "kind": "value", "seconds": 39600, "massNumber": 266, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#lr" } } },
  { "atomicNumber": 104, "symbol": "Rf", "names": { "en": "Rutherfordium", "de": "Rutherfordium" }, "aliases": { "en": ["Unnilquadium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rf" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "period": 7, "group": { "status": "reported", "value": 4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rf" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d2 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "shells": [2, 8, 18, 32, 32, 10, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "melting": { "status": "predicted", "value": 2400, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "boiling": { "status": "predicted", "value": 5800, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "discovery": { "kind": "year", "year": 1964, "by": "Ghiorso", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "radius": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "ionization": { "status": "predicted", "value": 6.02, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "halfLife": { "kind": "value", "seconds": 4680, "massNumber": 267, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#rf" } } },
  { "atomicNumber": 105, "symbol": "Db", "names": { "en": "Dubnium", "de": "Dubnium" }, "aliases": { "en": ["Hahnium", "Unnilpentium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Db" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "period": 7, "group": { "status": "reported", "value": 5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Db" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d3 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "shells": [2, 8, 18, 32, 32, 11, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "discovery": { "kind": "year", "year": 1967, "by": "Ghiorso", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "radius": { "status": "predicted", "value": 139, "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "ionization": { "status": "predicted", "value": 6.8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "halfLife": { "kind": "value", "seconds": 100800, "massNumber": 268, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#db" } } },
  { "atomicNumber": 106, "symbol": "Sg", "names": { "en": "Seaborgium", "de": "Seaborgium" }, "aliases": { "en": ["Unnilhexium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sg" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "period": 7, "group": { "status": "reported", "value": 6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sg" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d4 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "shells": [2, 8, 18, 32, 32, 12, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "discovery": { "kind": "year", "year": 1974, "by": "Oganessian", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "radius": { "status": "predicted", "value": 132, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "ionization": { "status": "predicted", "value": 7.8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "halfLife": { "kind": "value", "seconds": 130, "massNumber": 269, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#sg" } } },
  { "atomicNumber": 107, "symbol": "Bh", "names": { "en": "Bohrium", "de": "Bohrium" }, "aliases": { "en": ["Unnilseptium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bh" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "period": 7, "group": { "status": "reported", "value": 7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bh" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d5 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "shells": [2, 8, 18, 32, 32, 13, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "discovery": { "kind": "year", "year": 1976, "by": "Oganessian", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "radius": { "status": "predicted", "value": 128, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "ionization": { "status": "predicted", "value": 7.7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "halfLife": { "kind": "value", "seconds": 1140, "massNumber": 278, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#bh" } } },
  { "atomicNumber": 108, "symbol": "Hs", "names": { "en": "Hassium", "de": "Hassium" }, "aliases": { "en": ["Unniloctium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hs" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "period": 7, "group": { "status": "reported", "value": 8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hs" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d6 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "shells": [2, 8, 18, 32, 32, 14, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "discovery": { "kind": "year", "year": 1984, "by": "GSI", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "radius": { "status": "predicted", "value": 126, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "ionization": { "status": "predicted", "value": 7.6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "halfLife": { "kind": "value", "seconds": 1140, "massNumber": 278, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#hs" } } },
  { "atomicNumber": 109, "symbol": "Mt", "names": { "en": "Meitnerium", "de": "Meitnerium" }, "aliases": { "en": ["Unnilennium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mt" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "period": 7, "group": { "status": "reported", "value": 9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mt" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d7 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "shells": [2, 8, 18, 32, 32, 15, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "discovery": { "kind": "year", "year": 1982, "by": "GSI", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "radius": { "status": "predicted", "value": 128, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "ionization": { "status": "predicted", "value": 8.3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "halfLife": { "kind": "value", "seconds": 66, "massNumber": 282, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#mt" } } },
  { "atomicNumber": 110, "symbol": "Ds", "names": { "en": "Darmstadtium", "de": "Darmstadtium" }, "aliases": { "en": ["Ununnilium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ds" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "period": 7, "group": { "status": "reported", "value": 10, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ds" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d8 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "shells": [2, 8, 18, 32, 32, 16, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "discovery": { "kind": "year", "year": 1994, "by": "GSI", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "radius": { "status": "predicted", "value": 132, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "ionization": { "status": "predicted", "value": 9.9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "halfLife": { "kind": "value", "seconds": 66, "massNumber": 282, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ds" } } },
  { "atomicNumber": 111, "symbol": "Rg", "names": { "en": "Roentgenium", "de": "Roentgenium" }, "aliases": { "en": ["Unununium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rg" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "period": 7, "group": { "status": "reported", "value": 11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rg" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d9 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "shells": [2, 8, 18, 32, 32, 17, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "melting": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "discovery": { "kind": "year", "year": 1994, "by": "GSI", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "radius": { "status": "predicted", "value": 138, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "ionization": { "status": "predicted", "value": 10.6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "halfLife": { "kind": "value", "seconds": 660, "massNumber": 286, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#rg" } } },
  { "atomicNumber": 112, "symbol": "Cn", "names": { "en": "Copernicium", "de": "Copernicium" }, "aliases": { "en": ["Ununbium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "period": 7, "group": { "status": "reported", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cn" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "shells": [2, 8, 18, 32, 32, 18, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "melting": { "status": "predicted", "value": 283, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "boiling": { "status": "predicted", "value": 340, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "discovery": { "kind": "year", "year": 1996, "by": "GSI", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "radius": { "status": "predicted", "value": 147, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "ionization": { "status": "predicted", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "halfLife": { "kind": "value", "seconds": 660, "massNumber": 286, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#cn" } } },
  { "atomicNumber": 113, "symbol": "Nh", "names": { "en": "Nihonium", "de": "Nihonium" }, "aliases": { "en": ["Ununtrium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nh" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "period": 7, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nh" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "shells": [2, 8, 18, 32, 32, 18, 3], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "melting": { "status": "predicted", "value": 700, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "boiling": { "status": "predicted", "value": 1430, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "discovery": { "kind": "year", "year": 2006, "by": "JINR", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "radius": { "status": "predicted", "value": 170, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "ionization": { "status": "predicted", "value": 7.31, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "halfLife": { "kind": "value", "seconds": 9.5, "massNumber": 286, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#nh" } } },
  { "atomicNumber": 114, "symbol": "Fl", "names": { "en": "Flerovium", "de": "Flerovium" }, "aliases": { "en": ["Ununquadium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fl" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "period": 7, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fl" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "shells": [2, 8, 18, 32, 32, 18, 4], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "melting": { "status": "predicted", "value": 284, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "boiling": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "discovery": { "kind": "year", "year": 1999, "by": "JINR", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "radius": { "status": "predicted", "value": 180, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "ionization": { "status": "predicted", "value": 8.54, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "halfLife": { "kind": "value", "seconds": 19, "massNumber": 290, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#fl" } } },
  { "atomicNumber": 115, "symbol": "Mc", "names": { "en": "Moscovium", "de": "Moscovium" }, "aliases": { "en": ["Ununpentium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mc" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "period": 7, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mc" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "shells": [2, 8, 18, 32, 32, 18, 5], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "melting": { "status": "predicted", "value": 670, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "boiling": { "status": "predicted", "value": 1400, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "discovery": { "kind": "year", "year": 2006, "by": "JINR", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "radius": { "status": "predicted", "value": 187, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "ionization": { "status": "predicted", "value": 5.57, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "halfLife": { "kind": "value", "seconds": 0.65, "massNumber": 290, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#mc" } } },
  { "atomicNumber": 116, "symbol": "Lv", "names": { "en": "Livermorium", "de": "Livermorium" }, "aliases": { "en": ["Ununhexium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lv" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "period": 7, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lv" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "shells": [2, 8, 18, 32, 32, 18, 6], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "melting": { "status": "predicted", "value": 708.5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "boiling": { "status": "predicted", "value": 1085, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "discovery": { "kind": "year", "year": 2e3, "by": "JINR", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "radius": { "status": "predicted", "value": 183, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "ionization": { "status": "predicted", "value": 7.5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "halfLife": { "kind": "value", "seconds": 0.095, "massNumber": 293, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#lv" } } },
  { "atomicNumber": 117, "symbol": "Ts", "names": { "en": "Tennessine", "de": "Tenness" }, "aliases": { "en": ["Ununseptium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ts" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "period": 7, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ts" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "shells": [2, 8, 18, 32, 32, 18, 7], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "melting": { "status": "predicted", "value": 723, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "boiling": { "status": "predicted", "value": 883, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "discovery": { "kind": "year", "year": 2010, "by": "JINR", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "radius": { "status": "predicted", "value": 138, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "ionization": { "status": "predicted", "value": 7.7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "halfLife": { "kind": "value", "seconds": 0.051, "massNumber": 294, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#ts" } } },
  { "atomicNumber": 118, "symbol": "Og", "names": { "en": "Oganesson", "de": "Oganesson" }, "aliases": { "en": ["Ununoctium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Og" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "period": 7, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Og" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "shells": [2, 8, 18, 32, 32, 18, 8], "phase": { "status": "predicted", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "melting": { "status": "predicted", "value": 325, "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "boiling": { "status": "predicted", "value": 450, "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "sublimation": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "discovery": { "kind": "year", "year": 2006, "by": "JINR", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "radius": { "status": "predicted", "value": 152, "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "electronegativity": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "ionization": { "status": "predicted", "value": 8.7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "halfLife": { "kind": "value", "seconds": 58e-5, "massNumber": 294, "provenance": { "sourceId": "pse-info-nuclides", "locator": "nuclides.json#og" } } }
];
var PERIODIC_TABLE_PLACEMENT = {
  1: { row: 1, column: 1, category: "nonmetal" },
  2: { row: 1, column: 18, category: "noble-gas" },
  3: { row: 2, column: 1, category: "alkali-metal" },
  4: { row: 2, column: 2, category: "alkaline-earth-metal" },
  5: { row: 2, column: 13, category: "metalloid" },
  6: { row: 2, column: 14, category: "nonmetal" },
  7: { row: 2, column: 15, category: "nonmetal" },
  8: { row: 2, column: 16, category: "nonmetal" },
  9: { row: 2, column: 17, category: "halogen" },
  10: { row: 2, column: 18, category: "noble-gas" },
  11: { row: 3, column: 1, category: "alkali-metal" },
  12: { row: 3, column: 2, category: "alkaline-earth-metal" },
  13: { row: 3, column: 13, category: "post-transition-metal" },
  14: { row: 3, column: 14, category: "metalloid" },
  15: { row: 3, column: 15, category: "nonmetal" },
  16: { row: 3, column: 16, category: "nonmetal" },
  17: { row: 3, column: 17, category: "halogen" },
  18: { row: 3, column: 18, category: "noble-gas" },
  19: { row: 4, column: 1, category: "alkali-metal" },
  20: { row: 4, column: 2, category: "alkaline-earth-metal" },
  21: { row: 4, column: 3, category: "transition-metal" },
  22: { row: 4, column: 4, category: "transition-metal" },
  23: { row: 4, column: 5, category: "transition-metal" },
  24: { row: 4, column: 6, category: "transition-metal" },
  25: { row: 4, column: 7, category: "transition-metal" },
  26: { row: 4, column: 8, category: "transition-metal" },
  27: { row: 4, column: 9, category: "transition-metal" },
  28: { row: 4, column: 10, category: "transition-metal" },
  29: { row: 4, column: 11, category: "transition-metal" },
  30: { row: 4, column: 12, category: "transition-metal" },
  31: { row: 4, column: 13, category: "post-transition-metal" },
  32: { row: 4, column: 14, category: "metalloid" },
  33: { row: 4, column: 15, category: "metalloid" },
  34: { row: 4, column: 16, category: "metalloid" },
  35: { row: 4, column: 17, category: "halogen" },
  36: { row: 4, column: 18, category: "noble-gas" },
  37: { row: 5, column: 1, category: "alkali-metal" },
  38: { row: 5, column: 2, category: "alkaline-earth-metal" },
  39: { row: 5, column: 3, category: "transition-metal" },
  40: { row: 5, column: 4, category: "transition-metal" },
  41: { row: 5, column: 5, category: "transition-metal" },
  42: { row: 5, column: 6, category: "transition-metal" },
  43: { row: 5, column: 7, category: "transition-metal" },
  44: { row: 5, column: 8, category: "transition-metal" },
  45: { row: 5, column: 9, category: "transition-metal" },
  46: { row: 5, column: 10, category: "transition-metal" },
  47: { row: 5, column: 11, category: "transition-metal" },
  48: { row: 5, column: 12, category: "transition-metal" },
  49: { row: 5, column: 13, category: "post-transition-metal" },
  50: { row: 5, column: 14, category: "post-transition-metal" },
  51: { row: 5, column: 15, category: "metalloid" },
  52: { row: 5, column: 16, category: "metalloid" },
  53: { row: 5, column: 17, category: "halogen" },
  54: { row: 5, column: 18, category: "noble-gas" },
  55: { row: 6, column: 1, category: "alkali-metal" },
  56: { row: 6, column: 2, category: "alkaline-earth-metal" },
  57: { row: 8, column: 3, category: "lanthanide" },
  58: { row: 8, column: 4, category: "lanthanide" },
  59: { row: 8, column: 5, category: "lanthanide" },
  60: { row: 8, column: 6, category: "lanthanide" },
  61: { row: 8, column: 7, category: "lanthanide" },
  62: { row: 8, column: 8, category: "lanthanide" },
  63: { row: 8, column: 9, category: "lanthanide" },
  64: { row: 8, column: 10, category: "lanthanide" },
  65: { row: 8, column: 11, category: "lanthanide" },
  66: { row: 8, column: 12, category: "lanthanide" },
  67: { row: 8, column: 13, category: "lanthanide" },
  68: { row: 8, column: 14, category: "lanthanide" },
  69: { row: 8, column: 15, category: "lanthanide" },
  70: { row: 8, column: 16, category: "lanthanide" },
  71: { row: 8, column: 17, category: "lanthanide" },
  72: { row: 6, column: 4, category: "transition-metal" },
  73: { row: 6, column: 5, category: "transition-metal" },
  74: { row: 6, column: 6, category: "transition-metal" },
  75: { row: 6, column: 7, category: "transition-metal" },
  76: { row: 6, column: 8, category: "transition-metal" },
  77: { row: 6, column: 9, category: "transition-metal" },
  78: { row: 6, column: 10, category: "transition-metal" },
  79: { row: 6, column: 11, category: "transition-metal" },
  80: { row: 6, column: 12, category: "transition-metal" },
  81: { row: 6, column: 13, category: "post-transition-metal" },
  82: { row: 6, column: 14, category: "post-transition-metal" },
  83: { row: 6, column: 15, category: "post-transition-metal" },
  84: { row: 6, column: 16, category: "post-transition-metal" },
  85: { row: 6, column: 17, category: "halogen" },
  86: { row: 6, column: 18, category: "noble-gas" },
  87: { row: 7, column: 1, category: "alkali-metal" },
  88: { row: 7, column: 2, category: "alkaline-earth-metal" },
  89: { row: 9, column: 3, category: "actinide" },
  90: { row: 9, column: 4, category: "actinide" },
  91: { row: 9, column: 5, category: "actinide" },
  92: { row: 9, column: 6, category: "actinide" },
  93: { row: 9, column: 7, category: "actinide" },
  94: { row: 9, column: 8, category: "actinide" },
  95: { row: 9, column: 9, category: "actinide" },
  96: { row: 9, column: 10, category: "actinide" },
  97: { row: 9, column: 11, category: "actinide" },
  98: { row: 9, column: 12, category: "actinide" },
  99: { row: 9, column: 13, category: "actinide" },
  100: { row: 9, column: 14, category: "actinide" },
  101: { row: 9, column: 15, category: "actinide" },
  102: { row: 9, column: 16, category: "actinide" },
  103: { row: 9, column: 17, category: "actinide" },
  104: { row: 7, column: 4, category: "transition-metal" },
  105: { row: 7, column: 5, category: "transition-metal" },
  106: { row: 7, column: 6, category: "transition-metal" },
  107: { row: 7, column: 7, category: "transition-metal" },
  108: { row: 7, column: 8, category: "transition-metal" },
  109: { row: 7, column: 9, category: "unknown" },
  110: { row: 7, column: 10, category: "unknown" },
  111: { row: 7, column: 11, category: "unknown" },
  112: { row: 7, column: 12, category: "unknown" },
  113: { row: 7, column: 13, category: "unknown" },
  114: { row: 7, column: 14, category: "unknown" },
  115: { row: 7, column: 15, category: "unknown" },
  116: { row: 7, column: 16, category: "unknown" },
  117: { row: 7, column: 17, category: "unknown" },
  118: { row: 7, column: 18, category: "unknown" }
};

// periodic-table/element-reference.ts
var CONDITIONS = PERIODIC_TABLE_CONDITIONS;
var SOURCES = PERIODIC_TABLE_SOURCES;
var CATEGORIES = PERIODIC_TABLE_CATEGORIES;
var LAYOUT = PERIODIC_TABLE_LAYOUT;
var ELEMENTS = PERIODIC_TABLE_ELEMENTS;
var ELEMENT_COUNT = PERIODIC_TABLE_ELEMENTS.length;
var ELEMENTS_BY_NUMBER = new Map(
  PERIODIC_TABLE_ELEMENTS.map((element) => [element.atomicNumber, element])
);
var PLACEMENT_BY_NUMBER = new Map(
  Object.entries(PERIODIC_TABLE_PLACEMENT).map(([key, placement]) => [Number(key), placement])
);
function dataValue(value) {
  return value.status === "unavailable" ? void 0 : value.value;
}
function elementByAtomicNumber(atomicNumber) {
  if (!Number.isInteger(atomicNumber)) return void 0;
  return ELEMENTS_BY_NUMBER.get(atomicNumber);
}
function placementOf(atomicNumber) {
  if (!Number.isInteger(atomicNumber)) return void 0;
  return PLACEMENT_BY_NUMBER.get(atomicNumber);
}
function categoryOf(atomicNumber) {
  return placementOf(atomicNumber)?.category;
}
function atomicWeightText(weight, locale) {
  const separator = locale === "de" ? "," : ".";
  const localize = (decimal) => decimal.replace(".", separator);
  switch (weight.kind) {
    case "value":
      return {
        kind: "value",
        text: weight.uncertaintyDigits === void 0 ? localize(weight.decimal) : `${localize(weight.decimal)}(${weight.uncertaintyDigits})`
      };
    case "interval":
      return {
        kind: "interval",
        lower: localize(weight.lower),
        upper: localize(weight.upper)
      };
    case "none":
      return { kind: "none" };
    case "unavailable":
      return { kind: "unavailable" };
  }
}

// periodic-table/layout.ts
function buildGrid(layout = LAYOUT) {
  const seriesByCategory = new Map(layout.seriesRows.map((series) => [series.category, series]));
  const cells = [];
  for (const element of ELEMENTS) {
    const placement = placementOf(element.atomicNumber);
    if (!placement) continue;
    cells.push({
      atomicNumber: element.atomicNumber,
      row: placement.row,
      column: placement.column,
      category: placement.category,
      section: placement.row <= layout.periodRows ? "main" : "series"
    });
  }
  const rows = [];
  for (const row of [...new Set(cells.map((cell) => cell.row))].sort((a5, b4) => a5 - b4)) {
    rows.push({
      row,
      section: row <= layout.periodRows ? "main" : "series",
      cells: cells.filter((cell) => cell.row === row).sort((a5, b4) => a5.column - b4.column)
    });
  }
  const placeholders = layout.placeholders.map((placeholder) => ({
    row: placeholder.row,
    column: placeholder.column,
    category: placeholder.category,
    seriesRow: seriesByCategory.get(placeholder.category)?.row ?? null
  }));
  return {
    columns: layout.columns,
    periodRows: layout.periodRows,
    rows,
    cells,
    placeholders,
    seriesRows: layout.seriesRows
  };
}
var GRID = buildGrid();
var DETAIL_SLOT = { row: 1, column: 3, rowSpan: 3, columnSpan: 10 };
var CELLS_BY_NUMBER = new Map(
  GRID.cells.map((cell) => [cell.atomicNumber, cell])
);
var CELLS_BY_POSITION = new Map(
  GRID.cells.map((cell) => [`${cell.row}:${cell.column}`, cell])
);
function cellOf(atomicNumber, grid = GRID) {
  if (grid === GRID) return CELLS_BY_NUMBER.get(atomicNumber);
  return grid.cells.find((cell) => cell.atomicNumber === atomicNumber);
}
function cellAt(row, column, grid = GRID) {
  if (grid === GRID) return CELLS_BY_POSITION.get(`${row}:${column}`);
  return grid.cells.find((cell) => cell.row === row && cell.column === column);
}
function neighborAtomicNumber(atomicNumber, direction, grid = GRID) {
  const cell = cellOf(atomicNumber, grid);
  if (!cell) return null;
  if (direction === "left" || direction === "right") {
    const step2 = direction === "left" ? -1 : 1;
    for (let column = cell.column + step2; column >= 1 && column <= grid.columns; column += step2) {
      const found = cellAt(cell.row, column, grid);
      if (found) return found.atomicNumber;
    }
    return null;
  }
  const rows = grid.rows.filter((row) => row.section === cell.section).map((row) => row.row);
  const step = direction === "up" ? -1 : 1;
  for (let index = rows.indexOf(cell.row) + step; index >= 0 && index < rows.length; index += step) {
    const found = cellAt(rows[index], cell.column, grid);
    if (found) return found.atomicNumber;
  }
  return null;
}

// periodic-table/keyboard.ts
var GRID_KEYS = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End"
];
function isGridKey(key) {
  return GRID_KEYS.includes(key);
}
function firstAvailableInRow(row, isAvailable, grid = GRID) {
  const cells = grid.rows.find((entry) => entry.row === row)?.cells ?? [];
  for (const cell of cells) {
    if (isAvailable(cell.atomicNumber)) return cell.atomicNumber;
  }
  return null;
}
function lastAvailableInRow(row, isAvailable, grid = GRID) {
  const cells = grid.rows.find((entry) => entry.row === row)?.cells ?? [];
  for (let index = cells.length - 1; index >= 0; index -= 1) {
    if (isAvailable(cells[index].atomicNumber)) return cells[index].atomicNumber;
  }
  return null;
}
var ARROW_DIRECTIONS = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down"
};
function gridKeyTarget(atomicNumber, key, isAvailable, grid = GRID) {
  if (!isGridKey(key)) return { handled: false, atomicNumber: null };
  const cell = cellOf(atomicNumber, grid);
  if (!cell) return { handled: true, atomicNumber: null };
  if (key === "Home") {
    return { handled: true, atomicNumber: firstAvailableInRow(cell.row, isAvailable, grid) };
  }
  if (key === "End") {
    return { handled: true, atomicNumber: lastAvailableInRow(cell.row, isAvailable, grid) };
  }
  const direction = ARROW_DIRECTIONS[key];
  let current = atomicNumber;
  for (; ; ) {
    const next = neighborAtomicNumber(current, direction, grid);
    if (next === null) return { handled: true, atomicNumber: null };
    if (isAvailable(next)) return { handled: true, atomicNumber: next };
    current = next;
  }
}
function focusTargetAfterLayout(previous, isAvailable) {
  if (previous === null) return null;
  return isAvailable(previous) ? previous : null;
}

// periodic-table/search.ts
var KIND_RANK = {
  all: 0,
  number: 1,
  symbol: 2,
  name: 3,
  alias: 4,
  prefix: 5,
  substring: 6
};
function normalizeQuery(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
function tokensOf(element) {
  const tokens = [
    { text: normalizeQuery(element.symbol), kind: "symbol", language: null }
  ];
  for (const language of ["en", "de"]) {
    tokens.push({ text: normalizeQuery(element.names[language]), kind: "name", language });
    for (const alias of element.aliases?.[language] ?? []) {
      tokens.push({ text: normalizeQuery(alias), kind: "alias", language });
    }
  }
  return tokens;
}
var TOKENS = new Map(
  ELEMENTS.map((element) => [element.atomicNumber, tokensOf(element)])
);
function bestMatch(tokens, query, locale) {
  let best = null;
  for (const token of tokens) {
    let kind = null;
    if (token.text === query) kind = token.kind;
    else if (token.text.startsWith(query)) kind = "prefix";
    else if (token.text.includes(query)) kind = "substring";
    if (!kind) continue;
    const languageRank = token.language === null || token.language === locale ? 0 : 1;
    if (!best || KIND_RANK[kind] < KIND_RANK[best.kind] || KIND_RANK[kind] === KIND_RANK[best.kind] && languageRank < best.languageRank) {
      best = { kind, languageRank };
    }
  }
  return best;
}
function searchElements(query, options = {}) {
  const locale = options.locale ?? "en";
  const category = options.category ?? null;
  const candidates = ELEMENTS.filter(
    (element) => category === null || categoryOf(element.atomicNumber) === category
  );
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return candidates.map((element) => ({ atomicNumber: element.atomicNumber, kind: "all" }));
  }
  if (/^[0-9]+$/.test(normalized)) {
    const atomicNumber = Number(normalized);
    return candidates.some((element) => element.atomicNumber === atomicNumber) ? [{ atomicNumber, kind: "number" }] : [];
  }
  const ranked = [];
  for (const element of candidates) {
    const match = bestMatch(TOKENS.get(element.atomicNumber) ?? [], normalized, locale);
    if (!match) continue;
    ranked.push({
      result: { atomicNumber: element.atomicNumber, kind: match.kind },
      languageRank: match.languageRank
    });
  }
  ranked.sort(
    (a5, b4) => KIND_RANK[a5.result.kind] - KIND_RANK[b4.result.kind] || a5.languageRank - b4.languageRank || a5.result.atomicNumber - b4.result.atomicNumber
  );
  return ranked.map((entry) => entry.result);
}

// periodic-table/selection.ts
var ELEMENT_SELECTION_EVENT = "chemlab:element-selection";
var MIN_ATOMIC_NUMBER = 1;
var MAX_ATOMIC_NUMBER = 118;
var UNSET = Symbol("unset");
function isAtomicNumber(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_ATOMIC_NUMBER && value <= MAX_ATOMIC_NUMBER;
}
function parseAtomicNumberAttribute(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return isAtomicNumber(value) ? value : null;
}
function elementSelection(atomicNumber, sourceId) {
  return Object.freeze({
    version: 1,
    atomicNumber,
    ...sourceId ? { sourceId } : {}
  });
}
var SelectionModel = class {
  #value = UNSET;
  #authored = null;
  #written = false;
  /** Current selection; `null` when nothing is selected. */
  get value() {
    return this.#value === UNSET ? null : this.#value;
  }
  /** Whether a selection was ever established, by authored default or by a write. */
  get isSet() {
    return this.#value !== UNSET;
  }
  /** Authored default currently in effect, used by {@link reset}. */
  get authored() {
    return this.#authored;
  }
  /**
   * Applies the authored default during initialization.
   *
   * A valid live write that happened before the first render wins, including a
   * deliberate `null`.
   *
   * @param atomicNumber - Authored default or `null`.
   * @returns `true` when the selection changed.
   */
  initialize(atomicNumber) {
    this.#authored = atomicNumber;
    return this.#written ? false : this.#assign(atomicNumber);
  }
  /**
   * Reapplies a changed authored default, as an editor edit or undo/redo does.
   *
   * @param atomicNumber - New authored default or `null`.
   * @returns `true` when the selection changed.
   */
  applyAuthored(atomicNumber) {
    this.#authored = atomicNumber;
    return this.#assign(atomicNumber);
  }
  /**
   * Silent live write from a host property assignment.
   *
   * Invalid values are ignored and leave the previous selection in place.
   *
   * @param value - Candidate of unknown type.
   * @returns `true` when the value was accepted and changed the selection.
   */
  write(value) {
    if (value === null) {
      this.#written = true;
      return this.#assign(null);
    }
    if (!isAtomicNumber(value)) return false;
    this.#written = true;
    return this.#assign(value);
  }
  /**
   * User selection of a different element.
   *
   * @param atomicNumber - Atomic number the user picked.
   * @returns `true` when the selection changed.
   */
  select(atomicNumber) {
    return isAtomicNumber(atomicNumber) ? this.#assign(atomicNumber) : false;
  }
  /**
   * User clear action.
   *
   * @returns `true` when the selection changed.
   */
  clear() {
    return this.#assign(null);
  }
  /**
   * User reset action: back to the authored default.
   *
   * @returns `true` when the selection changed.
   */
  reset() {
    return this.#assign(this.#authored);
  }
  #assign(next) {
    const previous = this.value;
    this.#value = next;
    return previous !== next;
  }
};

// periodic-table/phase.ts
var TEMPERATURE_SLIDER = {
  /** Lowest slider value in degrees Celsius, close to absolute zero. */
  minCelsius: -273,
  /** Highest slider value in degrees Celsius, above the boiling point of tungsten. */
  maxCelsius: 6e3,
  /** Slider step in kelvin. */
  stepCelsius: 1,
  /** Value the table starts with, the reference temperature of the bundle. */
  defaultCelsius: 25
};
function kelvinFromCelsius(celsius) {
  return celsius + 273.15;
}
function celsiusFromKelvin(kelvin) {
  return kelvin - 273.15;
}
function celsiusText(kelvin, language) {
  const celsius = Math.round(celsiusFromKelvin(kelvin));
  return `${localizeNumber(celsius, language)} \xB0C`;
}
function localizeNumber(value, language) {
  const text = String(value);
  return language === "de" ? text.replace(".", ",") : text;
}
function matterState(element, temperatureK) {
  if (!(temperatureK > 0)) return "unknown";
  const melting = element.melting.status === "unavailable" ? void 0 : element.melting.value;
  if (melting !== void 0) {
    const boiling = element.boiling.status === "unavailable" ? void 0 : element.boiling.value;
    if (boiling === void 0) return temperatureK < melting ? "solid" : "unknown";
    if (boiling <= melting) return temperatureK < boiling ? "solid" : "gas";
    if (temperatureK < melting) return "solid";
    return temperatureK < boiling ? "liquid" : "gas";
  }
  if (element.sublimation.status === "unavailable") return "unknown";
  return temperatureK < element.sublimation.value ? "solid" : "gas";
}
function discoveryYear(element) {
  return element.discovery.kind === "year" ? element.discovery.year : void 0;
}
function knownAt(element, year) {
  switch (element.discovery.kind) {
    case "antiquity":
    case "unavailable":
      return true;
    case "year":
      return element.discovery.year <= year;
  }
}
var DISCOVERY_RANGE = (() => {
  let min2 = Number.POSITIVE_INFINITY;
  let max2 = Number.NEGATIVE_INFINITY;
  for (const element of ELEMENTS) {
    const year = discoveryYear(element);
    if (year === void 0) continue;
    if (year < min2) min2 = year;
    if (year > max2) max2 = year;
  }
  return Number.isFinite(min2) ? { min: min2, max: max2 } : { min: 0, max: 0 };
})();
var TABLE_MODES = [
  "off",
  "temperature",
  "discovery",
  "radius",
  "electronegativity",
  "ionization",
  "halfLife"
];
var MODE_CHOICES = TABLE_MODES.filter((mode) => mode !== "off");
function propertyRange(values, step) {
  let min2 = Number.POSITIVE_INFINITY;
  let max2 = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    if (value < min2) min2 = value;
    if (value > max2) max2 = value;
  }
  if (!Number.isFinite(min2)) return { min: 0, max: 0 };
  const round2 = (value) => Number((value * 1e4).toFixed(0)) / 1e4;
  return {
    min: round2(Math.floor(min2 / step) * step),
    max: round2(Math.ceil(max2 / step) * step)
  };
}
function propertyValues(read) {
  const values = [];
  for (const element of ELEMENTS) {
    const value = read(element);
    if (value !== void 0) values.push(value);
  }
  return values;
}
var RADIUS_RANGE = propertyRange(
  propertyValues((element) => dataValue(element.radius)),
  1
);
var ELECTRONEGATIVITY_RANGE = propertyRange(
  propertyValues((element) => dataValue(element.electronegativity)),
  0.01
);
var IONIZATION_RANGE = propertyRange(
  propertyValues((element) => dataValue(element.ionization)),
  0.01
);
var HALF_LIFE_RANGE = (() => {
  const logs = propertyValues(
    (element) => element.halfLife.kind === "value" ? Math.log10(element.halfLife.seconds) : void 0
  );
  const range = propertyRange(logs, 1);
  return { min: range.min, max: range.max };
})();
var DEFAULT_MODE_STATE = {
  mode: "off",
  temperatureK: kelvinFromCelsius(TEMPERATURE_SLIDER.defaultCelsius),
  year: DISCOVERY_RANGE.max,
  radiusPm: RADIUS_RANGE.max,
  electronegativity: ELECTRONEGATIVITY_RANGE.min,
  ionizationEv: IONIZATION_RANGE.min,
  halfLifeLogSeconds: HALF_LIFE_RANGE.min
};
var SECONDS_PER_YEAR = 31557600;
var HALF_LIFE_UNITS = [
  { seconds: SECONDS_PER_YEAR, symbol: "a" },
  { seconds: 86400, symbol: "d" },
  { seconds: 3600, symbol: "h" },
  { seconds: 60, symbol: "min" },
  { seconds: 1, symbol: "s" },
  { seconds: 1e-3, symbol: "ms" },
  { seconds: 1e-6, symbol: "\xB5s" }
];
var SUPERSCRIPT_DIGITS = ["\u2070", "\xB9", "\xB2", "\xB3", "\u2074", "\u2075", "\u2076", "\u2077", "\u2078", "\u2079"];
function superscript(exponent) {
  return String(exponent).split("").map((character) => character === "-" ? "\u207B" : SUPERSCRIPT_DIGITS[Number(character)] ?? character).join("");
}
function significantText(value, digits, language) {
  const exponent = Math.floor(Math.log10(value));
  if (exponent >= 4) {
    const mantissa = value / 10 ** exponent;
    return `${localizeNumber(Number(mantissa.toFixed(digits - 1)), language)}\xB710${superscript(exponent)}`;
  }
  const decimals = Math.max(0, digits - 1 - exponent);
  return localizeNumber(Number(value.toFixed(decimals)), language);
}
function halfLifeUnit(seconds) {
  return HALF_LIFE_UNITS.find((unit) => seconds / unit.seconds >= 1) ?? HALF_LIFE_UNITS[HALF_LIFE_UNITS.length - 1];
}
function halfLifeText(seconds, language, digits = 3) {
  const unit = halfLifeUnit(seconds);
  return `${significantText(seconds / unit.seconds, digits, language)} ${unit.symbol}`;
}
function halfLifeBadge(seconds, language) {
  const unit = halfLifeUnit(seconds);
  const amount = seconds / unit.seconds;
  const exponent = Math.floor(Math.log10(amount));
  const text = exponent >= 4 ? `10${superscript(exponent)}` : significantText(amount, 2, language);
  return `${text} ${unit.symbol}`;
}
function isotopeText(massNumber, symbol) {
  return `${superscript(massNumber)}${symbol}`;
}
function cellMode(element, state, language = "en") {
  switch (state.mode) {
    case "off":
      return { state: null, badge: null, hidden: false };
    case "temperature": {
      const matter = matterState(element, state.temperatureK);
      return { state: matter, badge: null, hidden: matter === "unknown" };
    }
    case "discovery": {
      const year = discoveryYear(element);
      return {
        state: null,
        badge: year === void 0 ? null : String(year),
        hidden: !knownAt(element, state.year)
      };
    }
    case "radius": {
      const radius = dataValue(element.radius);
      if (radius === void 0) return { state: null, badge: null, hidden: true };
      return {
        state: null,
        badge: String(radius),
        hidden: radius > state.radiusPm
      };
    }
    case "electronegativity": {
      const value = dataValue(element.electronegativity);
      if (value === void 0) return { state: null, badge: null, hidden: true };
      return {
        state: null,
        badge: significantText(value, 3, language),
        hidden: value < state.electronegativity
      };
    }
    case "ionization": {
      const value = dataValue(element.ionization);
      if (value === void 0) return { state: null, badge: null, hidden: true };
      return {
        state: null,
        badge: significantText(value, 3, language),
        hidden: value < state.ionizationEv
      };
    }
    case "halfLife": {
      if (element.halfLife.kind === "stable") {
        return { state: null, badge: "\u221E", hidden: false };
      }
      if (element.halfLife.kind === "unavailable") {
        return { state: null, badge: null, hidden: true };
      }
      const seconds = element.halfLife.seconds;
      return {
        state: null,
        badge: halfLifeBadge(seconds, language),
        hidden: Math.log10(seconds) < state.halfLifeLogSeconds
      };
    }
  }
}

// periodic-table/strings.ts
var EN = {
  widgetLabel: "Periodic table",
  filtersLabel: "Search and filter",
  searchLabel: "Search elements",
  searchPlaceholder: "Name, symbol, number",
  viewLabel: "Layout",
  viewTable: "Table",
  viewList: "List",
  reset: "Reset",
  resetMode: "Reset mode",
  resultCount: "{count} elements",
  resultCountOne: "1 element",
  noResults: "No element matches the search",
  legendLabel: "Families",
  gridLabel: "Periodic table of the elements",
  groupLabel: "Group {group}",
  periodLabel: "Period {period}",
  seriesLabel: "Detached series",
  cellLabel: "{number}, {name}, {symbol}, {category}",
  placeholderLabel: "{first} to {last}",
  detailsLabel: "Element details",
  detailsEmpty: "Select an element to see its details.",
  detailsHint: "Values refer to the neutral atom.",
  detailsExpand: "Show all details",
  detailsCollapse: "Show less",
  fieldGroup: "Group",
  fieldReferenceLattice: "Reference lattice",
  valueSolidMercury: "solid below 234.3 K",
  fieldPeriod: "Period",
  fieldFamily: "Family",
  fieldBlock: "Block",
  fieldWeight: "Standard atomic weight",
  fieldPhase: "State",
  fieldMelting: "Melting point",
  fieldBoiling: "Boiling point",
  fieldSublimation: "Sublimation point",
  fieldDiscovery: "Discovered",
  fieldConfiguration: "Electron configuration",
  fieldShells: "Electrons per shell",
  fieldRadius: "Atomic radius",
  fieldElectronegativity: "Electronegativity",
  fieldIonization: "Ionization energy",
  fieldHalfLife: "Half-life",
  fieldStableNuclide: "Stable nuclide",
  fieldMassNumber: "Mass number",
  sectionPosition: "Position",
  sectionProperties: "Properties",
  sectionHistory: "History",
  sectionStructure: "Structure",
  sectionTemperatures: "Temperatures",
  qualifierHint: "Predicted value, not measured",
  groupUnassigned: "Not assigned",
  groupConventionDependent: "Depends on the convention",
  weightNone: "No standard atomic weight",
  weightUnavailable: "Unavailable",
  valueUnavailable: "Unavailable",
  valuePredicted: "predicted",
  phaseSolid: "Solid",
  phaseLiquid: "Liquid",
  phaseGas: "Gas",
  conditions: "{temperature} \xB0C \xB7 {pressure} bar",
  discoveryAntiquity: "Antiquity",
  modeLabel: "Show",
  modeOff: "Off",
  modeTemperature: "Temperature",
  modeDiscovery: "Discovery",
  modeRadius: "Radius",
  modeElectronegativity: "Electronegativity",
  modeIonization: "Ionization",
  modeHalfLife: "Half-life",
  temperatureSlider: "Temperature",
  yearSlider: "Year",
  radiusSlider: "Largest atomic radius",
  electronegativitySlider: "Smallest electronegativity",
  ionizationSlider: "Smallest ionization energy",
  halfLifeSlider: "Shortest half-life",
  halfLifeStable: "stable",
  stateLegend: "State at these conditions",
  stateUnknown: "Unknown",
  infoLabel: "Sources and notes",
  infoIntro: "The table is built from the sources below. Every value keeps the state its source reports: reported, predicted or unavailable.",
  infoConditions: "States and temperatures refer to {conditions}.",
  infoPhaseModel: "At other temperatures the state follows the melting and boiling points at 1 bar. Carbon and arsenic sublime, so they have no liquid range at standard pressure.",
  infoDiscovery: "Years of discovery and first synthesis follow the source. Eleven elements have been in use since antiquity and carry no year.",
  infoFields: "Fields",
  infoSources: "Sources",
  infoNotes: "Notes",
  infoClose: "Close",
  sourceRelease: "Release {release}",
  sourceRetrieved: "Retrieved {retrieved}",
  sourceLicense: "License: {license}",
  fieldIdentity: "Identity",
  fieldGermanName: "German name",
  fieldSymbol: "Symbol",
  fieldName: "Name",
  fieldUncertainty: "Uncertainty digits",
  fieldNoteCodes: "Note codes",
  printTitle: "Periodic table"
};
var DE = {
  widgetLabel: "Periodensystem",
  filtersLabel: "Suchen und filtern",
  searchLabel: "Elemente suchen",
  searchPlaceholder: "Name, Symbol, Nummer",
  viewLabel: "Darstellung",
  viewTable: "Tabelle",
  viewList: "Liste",
  reset: "Zur\xFCcksetzen",
  resetMode: "Modus zur\xFCcksetzen",
  resultCount: "{count} Elemente",
  resultCountOne: "1 Element",
  noResults: "Kein Element passt zur Suche",
  legendLabel: "Stoffklassen",
  gridLabel: "Periodensystem der Elemente",
  groupLabel: "Gruppe {group}",
  periodLabel: "Periode {period}",
  seriesLabel: "Abgesetzte Reihen",
  cellLabel: "{number}, {name}, {symbol}, {category}",
  placeholderLabel: "{first} bis {last}",
  detailsLabel: "Elementdaten",
  detailsEmpty: "W\xE4hle ein Element, um seine Daten zu sehen.",
  detailsHint: "Die Werte gelten f\xFCr das neutrale Atom.",
  detailsExpand: "Alle Daten anzeigen",
  detailsCollapse: "Weniger anzeigen",
  fieldGroup: "Gruppe",
  fieldReferenceLattice: "Referenzgitter",
  valueSolidMercury: "fest unterhalb von 234,3 K",
  fieldPeriod: "Periode",
  fieldFamily: "Stoffklasse",
  fieldBlock: "Block",
  fieldWeight: "Standardatommasse",
  fieldPhase: "Aggregatzustand",
  fieldMelting: "Schmelzpunkt",
  fieldBoiling: "Siedepunkt",
  fieldSublimation: "Sublimationspunkt",
  fieldDiscovery: "Entdeckt",
  fieldConfiguration: "Elektronenkonfiguration",
  fieldShells: "Elektronen je Schale",
  fieldRadius: "Atomradius",
  fieldElectronegativity: "Elektronegativit\xE4t",
  fieldIonization: "Ionisierungsenergie",
  fieldHalfLife: "Halbwertszeit",
  fieldStableNuclide: "Stabiles Nuklid",
  fieldMassNumber: "Massenzahl",
  sectionPosition: "Position",
  sectionProperties: "Eigenschaften",
  sectionHistory: "Geschichte",
  sectionStructure: "Aufbau",
  sectionTemperatures: "Temperaturen",
  qualifierHint: "Vorhergesagter Wert, nicht gemessen",
  groupUnassigned: "Nicht zugeordnet",
  groupConventionDependent: "H\xE4ngt von der Konvention ab",
  weightNone: "Keine Standardatommasse",
  weightUnavailable: "Nicht verf\xFCgbar",
  valueUnavailable: "Nicht verf\xFCgbar",
  valuePredicted: "vorhergesagt",
  phaseSolid: "Fest",
  phaseLiquid: "Fl\xFCssig",
  phaseGas: "Gasf\xF6rmig",
  conditions: "{temperature} \xB0C \xB7 {pressure} bar",
  discoveryAntiquity: "Antike",
  modeLabel: "Anzeigen",
  modeOff: "Aus",
  modeTemperature: "Temperatur",
  modeDiscovery: "Entdeckung",
  modeRadius: "Radius",
  modeElectronegativity: "Elektronegativit\xE4t",
  modeIonization: "Ionisierung",
  modeHalfLife: "Halbwertszeit",
  temperatureSlider: "Temperatur",
  yearSlider: "Jahr",
  radiusSlider: "Gr\xF6\xDFter Atomradius",
  electronegativitySlider: "Kleinste Elektronegativit\xE4t",
  ionizationSlider: "Kleinste Ionisierungsenergie",
  halfLifeSlider: "K\xFCrzeste Halbwertszeit",
  halfLifeStable: "stabil",
  stateLegend: "Aggregatzustand bei diesen Bedingungen",
  stateUnknown: "Unbekannt",
  infoLabel: "Quellen und Hinweise",
  infoIntro: "Die Tabelle beruht auf den unten genannten Quellen. Jeder Wert beh\xE4lt den Stand seiner Quelle: berichtet, vorhergesagt oder nicht verf\xFCgbar.",
  infoConditions: "Aggregatzust\xE4nde und Temperaturen gelten f\xFCr {conditions}.",
  infoPhaseModel: "Bei anderen Temperaturen folgt der Aggregatzustand dem Schmelz- und dem Siedepunkt bei 1 bar. Kohlenstoff und Arsen sublimieren und haben bei Normaldruck keinen fl\xFCssigen Bereich.",
  infoDiscovery: "Jahreszahlen der Entdeckung und der ersten Darstellung folgen der Quelle. Elf Elemente sind seit der Antike in Gebrauch und tragen keine Jahreszahl.",
  infoFields: "Felder",
  infoSources: "Quellen",
  infoNotes: "Hinweise",
  infoClose: "Schlie\xDFen",
  sourceRelease: "Ausgabe {release}",
  sourceRetrieved: "Abgerufen am {retrieved}",
  sourceLicense: "Lizenz: {license}",
  fieldIdentity: "Identit\xE4t",
  fieldGermanName: "Deutscher Name",
  fieldSymbol: "Symbol",
  fieldName: "Name",
  fieldUncertainty: "Unsicherheitsstellen",
  fieldNoteCodes: "Fu\xDFnoten",
  printTitle: "Periodensystem"
};
var STRINGS = { en: EN, de: DE };
function languageFromTag(tag) {
  const base = (tag ?? "").trim().toLowerCase().split(/[-_]/)[0];
  return base === "de" ? "de" : "en";
}
function strings(language) {
  return STRINGS[language];
}
function format(template, values) {
  return template.replace(
    /\{(\w+)\}/g,
    (match, key) => Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}
function langOf(node) {
  if (typeof node.getAttribute !== "function") return null;
  return node.getAttribute("lang");
}
function parentOf(node) {
  if (node.parentElement) return node.parentElement;
  const root = typeof node.getRootNode === "function" ? node.getRootNode() : null;
  if (!root || root === node) return null;
  return root.host ?? null;
}
function resolveLanguage(node) {
  for (let current = node ?? null; current; current = parentOf(current)) {
    const tag = langOf(current);
    if (tag !== null && tag.trim() !== "") return languageFromTag(tag);
  }
  return "en";
}
function languageAncestors(node) {
  const chain = [];
  for (let current = node ?? null; current; current = parentOf(current)) chain.push(current);
  return chain;
}

// data/structures/metals.generated.json
var metals_generated_default = {
  "100": null,
  "101": null,
  "102": null,
  "103": null,
  "104": null,
  "105": null,
  "106": null,
  "107": null,
  "108": null,
  "109": null,
  "11": { version: 1, kind: "crystal", name: "Na", cell: { lengths: [4.23, 4.23, 4.23], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 11, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 11, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "110": null,
  "111": null,
  "112": null,
  "113": null,
  "114": null,
  "115": null,
  "116": null,
  "12": { version: 1, kind: "crystal", name: "Mg", cell: { lengths: [3.21, 3.21, 5.21304], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 12, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 12, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "13": { version: 1, kind: "crystal", name: "Al", cell: { lengths: [4.05, 4.05, 4.05], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 13, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 13, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 13, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 13, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "19": { version: 1, kind: "crystal", name: "K", cell: { lengths: [5.23, 5.23, 5.23], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 19, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 19, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "20": { version: 1, kind: "crystal", name: "Ca", cell: { lengths: [5.58, 5.58, 5.58], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 20, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 20, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 20, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 20, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "21": { version: 1, kind: "crystal", name: "Sc", cell: { lengths: [3.31, 3.31, 5.27614], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 21, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 21, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "22": { version: 1, kind: "crystal", name: "Ti", cell: { lengths: [2.95, 2.95, 4.6846], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 22, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 22, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "23": { version: 1, kind: "crystal", name: "V", cell: { lengths: [3.02, 3.02, 3.02], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 23, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 23, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "24": { version: 1, kind: "crystal", name: "Cr", cell: { lengths: [2.88, 2.88, 2.88], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 24, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 24, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "25": { version: 1, kind: "crystal", name: "Mn", cell: { lengths: [8.9125, 8.9125, 8.9125], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 25, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 25, charge: 0, fractional: [0.5, 0.5, 0.5] }, { id: 3, atomicNumber: 25, charge: 0, fractional: [0.316, 0.316, 0.316] }, { id: 4, atomicNumber: 25, charge: 0, fractional: [0.316, 0.684, 0.684] }, { id: 5, atomicNumber: 25, charge: 0, fractional: [0.684, 0.684, 0.316] }, { id: 6, atomicNumber: 25, charge: 0, fractional: [0.684, 0.316, 0.684] }, { id: 7, atomicNumber: 25, charge: 0, fractional: [0.816, 0.816, 0.816] }, { id: 8, atomicNumber: 25, charge: 0, fractional: [0.816, 0.184, 0.184] }, { id: 9, atomicNumber: 25, charge: 0, fractional: [0.184, 0.184, 0.816] }, { id: 10, atomicNumber: 25, charge: 0, fractional: [0.184, 0.816, 0.184] }, { id: 11, atomicNumber: 25, charge: 0, fractional: [0.356, 0.356, 0.034] }, { id: 12, atomicNumber: 25, charge: 0, fractional: [0.356, 0.644, 0.966] }, { id: 13, atomicNumber: 25, charge: 0, fractional: [0.644, 0.644, 0.034] }, { id: 14, atomicNumber: 25, charge: 0, fractional: [0.644, 0.356, 0.966] }, { id: 15, atomicNumber: 25, charge: 0, fractional: [0.034, 0.356, 0.356] }, { id: 16, atomicNumber: 25, charge: 0, fractional: [0.966, 0.356, 0.644] }, { id: 17, atomicNumber: 25, charge: 0, fractional: [0.034, 0.644, 0.644] }, { id: 18, atomicNumber: 25, charge: 0, fractional: [0.966, 0.644, 0.356] }, { id: 19, atomicNumber: 25, charge: 0, fractional: [0.356, 0.966, 0.644] }, { id: 20, atomicNumber: 25, charge: 0, fractional: [0.356, 0.034, 0.356] }, { id: 21, atomicNumber: 25, charge: 0, fractional: [0.644, 0.966, 0.356] }, { id: 22, atomicNumber: 25, charge: 0, fractional: [0.644, 0.034, 0.644] }, { id: 23, atomicNumber: 25, charge: 0, fractional: [0.856, 0.856, 0.534] }, { id: 24, atomicNumber: 25, charge: 0, fractional: [0.856, 0.144, 0.466] }, { id: 25, atomicNumber: 25, charge: 0, fractional: [0.144, 0.144, 0.534] }, { id: 26, atomicNumber: 25, charge: 0, fractional: [0.144, 0.856, 0.466] }, { id: 27, atomicNumber: 25, charge: 0, fractional: [0.534, 0.856, 0.856] }, { id: 28, atomicNumber: 25, charge: 0, fractional: [0.466, 0.856, 0.144] }, { id: 29, atomicNumber: 25, charge: 0, fractional: [0.534, 0.144, 0.144] }, { id: 30, atomicNumber: 25, charge: 0, fractional: [0.466, 0.144, 0.856] }, { id: 31, atomicNumber: 25, charge: 0, fractional: [0.856, 0.466, 0.144] }, { id: 32, atomicNumber: 25, charge: 0, fractional: [0.856, 0.534, 0.856] }, { id: 33, atomicNumber: 25, charge: 0, fractional: [0.144, 0.466, 0.856] }, { id: 34, atomicNumber: 25, charge: 0, fractional: [0.144, 0.534, 0.144] }, { id: 35, atomicNumber: 25, charge: 0, fractional: [0.089, 0.089, 0.282] }, { id: 36, atomicNumber: 25, charge: 0, fractional: [0.089, 0.911, 0.718] }, { id: 37, atomicNumber: 25, charge: 0, fractional: [0.911, 0.911, 0.282] }, { id: 38, atomicNumber: 25, charge: 0, fractional: [0.911, 0.089, 0.718] }, { id: 39, atomicNumber: 25, charge: 0, fractional: [0.282, 0.089, 0.089] }, { id: 40, atomicNumber: 25, charge: 0, fractional: [0.718, 0.089, 0.911] }, { id: 41, atomicNumber: 25, charge: 0, fractional: [0.282, 0.911, 0.911] }, { id: 42, atomicNumber: 25, charge: 0, fractional: [0.718, 0.911, 0.089] }, { id: 43, atomicNumber: 25, charge: 0, fractional: [0.089, 0.718, 0.911] }, { id: 44, atomicNumber: 25, charge: 0, fractional: [0.089, 0.282, 0.089] }, { id: 45, atomicNumber: 25, charge: 0, fractional: [0.911, 0.718, 0.089] }, { id: 46, atomicNumber: 25, charge: 0, fractional: [0.911, 0.282, 0.911] }, { id: 47, atomicNumber: 25, charge: 0, fractional: [0.589, 0.589, 0.782] }, { id: 48, atomicNumber: 25, charge: 0, fractional: [0.589, 0.411, 0.218] }, { id: 49, atomicNumber: 25, charge: 0, fractional: [0.411, 0.411, 0.782] }, { id: 50, atomicNumber: 25, charge: 0, fractional: [0.411, 0.589, 0.218] }, { id: 51, atomicNumber: 25, charge: 0, fractional: [0.782, 0.589, 0.589] }, { id: 52, atomicNumber: 25, charge: 0, fractional: [0.218, 0.589, 0.411] }, { id: 53, atomicNumber: 25, charge: 0, fractional: [0.782, 0.411, 0.411] }, { id: 54, atomicNumber: 25, charge: 0, fractional: [0.218, 0.411, 0.589] }, { id: 55, atomicNumber: 25, charge: 0, fractional: [0.589, 0.218, 0.411] }, { id: 56, atomicNumber: 25, charge: 0, fractional: [0.589, 0.782, 0.589] }, { id: 57, atomicNumber: 25, charge: 0, fractional: [0.411, 0.218, 0.589] }, { id: 58, atomicNumber: 25, charge: 0, fractional: [0.411, 0.782, 0.411] }], bravais: "cI", spaceGroup: "I-43m", source: "https://www.crystallography.net/cod/9011068.html", temperatureK: 298, conditions: null },
  "26": { version: 1, kind: "crystal", name: "Fe", cell: { lengths: [2.87, 2.87, 2.87], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 26, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 26, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "27": { version: 1, kind: "crystal", name: "Co", cell: { lengths: [2.51, 2.51, 4.07122], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 27, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 27, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "28": { version: 1, kind: "crystal", name: "Ni", cell: { lengths: [3.52, 3.52, 3.52], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 28, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 28, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 28, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 28, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "29": { version: 1, kind: "crystal", name: "Cu", cell: { lengths: [3.61, 3.61, 3.61], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 29, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 29, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 29, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 29, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "3": { version: 1, kind: "crystal", name: "Li", cell: { lengths: [3.49, 3.49, 3.49], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 3, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 3, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "30": { version: 1, kind: "crystal", name: "Zn", cell: { lengths: [2.66, 2.66, 4.93696], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 30, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 30, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "31": { version: 1, kind: "crystal", name: "Ga", cell: { lengths: [4.5167, 7.6448, 4.5107], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 31, charge: 0, fractional: [0, 0.1525, 0.0785] }, { id: 2, atomicNumber: 31, charge: 0, fractional: [0.5, 0.8475, 0.5785] }, { id: 3, atomicNumber: 31, charge: 0, fractional: [0, 0.8475, 0.9215] }, { id: 4, atomicNumber: 31, charge: 0, fractional: [0.5, 0.1525, 0.4215] }, { id: 5, atomicNumber: 31, charge: 0, fractional: [0.5, 0.6525, 0.0785] }, { id: 6, atomicNumber: 31, charge: 0, fractional: [0, 0.3475, 0.5785] }, { id: 7, atomicNumber: 31, charge: 0, fractional: [0.5, 0.3475, 0.9215] }, { id: 8, atomicNumber: 31, charge: 0, fractional: [0, 0.6525, 0.4215] }], bravais: "oC", spaceGroup: "Cmca", source: "https://www.crystallography.net/cod/8104301.html", temperatureK: null, conditions: null },
  "37": { version: 1, kind: "crystal", name: "Rb", cell: { lengths: [5.59, 5.59, 5.59], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 37, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 37, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "38": { version: 1, kind: "crystal", name: "Sr", cell: { lengths: [6.08, 6.08, 6.08], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 38, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 38, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 38, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 38, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "39": { version: 1, kind: "crystal", name: "Y", cell: { lengths: [3.65, 3.65, 5.73415], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 39, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 39, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "4": { version: 1, kind: "crystal", name: "Be", cell: { lengths: [2.29, 2.29, 3.58843], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 4, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 4, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "40": { version: 1, kind: "crystal", name: "Zr", cell: { lengths: [3.23, 3.23, 5.14539], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 40, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 40, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "41": { version: 1, kind: "crystal", name: "Nb", cell: { lengths: [3.3, 3.3, 3.3], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 41, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 41, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "42": { version: 1, kind: "crystal", name: "Mo", cell: { lengths: [3.15, 3.15, 3.15], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 42, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 42, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "43": { version: 1, kind: "crystal", name: "Tc", cell: { lengths: [2.74, 2.74, 4.39496], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 43, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 43, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "44": { version: 1, kind: "crystal", name: "Ru", cell: { lengths: [2.7, 2.7, 4.2768], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 44, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 44, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "45": { version: 1, kind: "crystal", name: "Rh", cell: { lengths: [3.8, 3.8, 3.8], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 45, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 45, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 45, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 45, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "46": { version: 1, kind: "crystal", name: "Pd", cell: { lengths: [3.89, 3.89, 3.89], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 46, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 46, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 46, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 46, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "47": { version: 1, kind: "crystal", name: "Ag", cell: { lengths: [4.09, 4.09, 4.09], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 47, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 47, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 47, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 47, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "48": { version: 1, kind: "crystal", name: "Cd", cell: { lengths: [2.98, 2.98, 5.62028], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 48, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 48, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "49": { version: 1, kind: "crystal", name: "In", cell: { lengths: [3.24562, 3.24562, 4.93884], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 49, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 49, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "tI", spaceGroup: "I4/mmm", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "50": { version: 1, kind: "crystal", name: "Sn", cell: { lengths: [5.82, 5.82, 3.17772], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 50, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 50, charge: 0, fractional: [0, 0.5, 0.25] }, { id: 3, atomicNumber: 50, charge: 0, fractional: [0.5, 0.5, 0.5] }, { id: 4, atomicNumber: 50, charge: 0, fractional: [0.5, 0, 0.75] }], bravais: "tI", spaceGroup: "I41/amd", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "55": { version: 1, kind: "crystal", name: "Cs", cell: { lengths: [6.05, 6.05, 6.05], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 55, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 55, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "56": { version: 1, kind: "crystal", name: "Ba", cell: { lengths: [5.02, 5.02, 5.02], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 56, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 56, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "57": { version: 1, kind: "crystal", name: "La", cell: { lengths: [3.77, 3.77, 12.159], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 57, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 57, charge: 0, fractional: [0.66666, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://www.crystallography.net/cod/9010986.html", temperatureK: null, conditions: null },
  "58": { version: 1, kind: "crystal", name: "Ce", cell: { lengths: [5.16, 5.16, 5.16], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 58, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 58, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 58, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 58, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "59": { version: 1, kind: "crystal", name: "Pr", cell: { lengths: [3.6725, 3.6725, 11.8354], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 59, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 59, charge: 0, fractional: [0.66666, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://www.crystallography.net/cod/9010988.html", temperatureK: null, conditions: null },
  "60": { version: 1, kind: "crystal", name: "Nd", cell: { lengths: [3.6579, 3.6579, 11.7992], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 60, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 60, charge: 0, fractional: [0.66666, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://www.crystallography.net/cod/9010989.html", temperatureK: null, conditions: null },
  "61": { version: 1, kind: "crystal", name: "Pm", cell: { lengths: [3.65, 3.65, 11.65], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 61, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 61, charge: 0, fractional: [0, 0, 0.5] }, { id: 3, atomicNumber: 61, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 4, atomicNumber: 61, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://www.sciencedirect.com/science/article/pii/0022508871901019", temperatureK: null, conditions: null },
  "62": { version: 1, kind: "crystal", name: "Sm", cell: { lengths: [9, 9, 9], angles: [23.13, 23.13, 23.13] }, sites: [{ id: 1, atomicNumber: 62, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 62, charge: 0, fractional: [0.778, 0.778, 0.778] }, { id: 3, atomicNumber: 62, charge: 0, fractional: [0.222, 0.222, 0.222] }], bravais: "hR", spaceGroup: "R-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "63": { version: 1, kind: "crystal", name: "Eu", cell: { lengths: [4.61, 4.61, 4.61], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 63, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 63, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "64": { version: 1, kind: "crystal", name: "Gd", cell: { lengths: [3.64, 3.64, 5.78032], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 64, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 64, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "65": { version: 1, kind: "crystal", name: "Tb", cell: { lengths: [3.6, 3.6, 5.6916], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 65, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 65, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "66": { version: 1, kind: "crystal", name: "Dy", cell: { lengths: [3.59, 3.59, 5.64707], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 66, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 66, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "67": { version: 1, kind: "crystal", name: "Ho", cell: { lengths: [3.58, 3.58, 5.6206], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 67, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 67, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "68": { version: 1, kind: "crystal", name: "Er", cell: { lengths: [3.56, 3.56, 5.5892], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 68, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 68, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "69": { version: 1, kind: "crystal", name: "Tm", cell: { lengths: [3.54, 3.54, 5.5578], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 69, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 69, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "70": { version: 1, kind: "crystal", name: "Yb", cell: { lengths: [5.49, 5.49, 5.49], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 70, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 70, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 70, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 70, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "71": { version: 1, kind: "crystal", name: "Lu", cell: { lengths: [3.51, 3.51, 5.56335], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 71, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 71, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "72": { version: 1, kind: "crystal", name: "Hf", cell: { lengths: [3.2, 3.2, 5.0624], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 72, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 72, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "73": { version: 1, kind: "crystal", name: "Ta", cell: { lengths: [3.31, 3.31, 3.31], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 73, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 73, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "74": { version: 1, kind: "crystal", name: "W", cell: { lengths: [3.16, 3.16, 3.16], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 74, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 74, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "75": { version: 1, kind: "crystal", name: "Re", cell: { lengths: [2.76, 2.76, 4.4574], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 75, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 75, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "76": { version: 1, kind: "crystal", name: "Os", cell: { lengths: [2.74, 2.74, 4.32646], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 76, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 76, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "77": { version: 1, kind: "crystal", name: "Ir", cell: { lengths: [3.84, 3.84, 3.84], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 77, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 77, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 77, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 77, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "78": { version: 1, kind: "crystal", name: "Pt", cell: { lengths: [3.92, 3.92, 3.92], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 78, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 78, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 78, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 78, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "79": { version: 1, kind: "crystal", name: "Au", cell: { lengths: [4.08, 4.08, 4.08], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 79, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 79, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 79, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 79, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "80": { version: 1, kind: "crystal", name: "Hg", cell: { lengths: [2.99, 2.99, 2.99], angles: [70.45, 70.45, 70.45] }, sites: [{ id: 1, atomicNumber: 80, charge: 0, fractional: [0, 0, 0] }], bravais: "hR", spaceGroup: "R-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: "\u03B1-Hg \xB7 solid below 234.3 K" },
  "81": { version: 1, kind: "crystal", name: "Tl", cell: { lengths: [3.46, 3.46, 5.53254], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 81, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 2, atomicNumber: 81, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "82": { version: 1, kind: "crystal", name: "Pb", cell: { lengths: [4.95, 4.95, 4.95], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 82, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 82, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 82, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 82, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "83": { version: 1, kind: "crystal", name: "Bi", cell: { lengths: [4.75, 4.75, 4.75], angles: [57.14, 57.14, 57.14] }, sites: [{ id: 1, atomicNumber: 83, charge: 0, fractional: [0.763, 0.763, 0.763] }, { id: 2, atomicNumber: 83, charge: 0, fractional: [0.237, 0.237, 0.237] }], bravais: "hR", spaceGroup: "R-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "84": { version: 1, kind: "crystal", name: "Po", cell: { lengths: [3.35, 3.35, 3.35], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 84, charge: 0, fractional: [0, 0, 0] }], bravais: "cP", spaceGroup: "Pm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "87": null,
  "88": { version: 1, kind: "crystal", name: "Ra", cell: { lengths: [5.148, 5.148, 5.148], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 88, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 88, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "cI", spaceGroup: "Im-3m", source: "https://www.crystallography.net/cod/1509139.html", temperatureK: null, conditions: null },
  "89": { version: 1, kind: "crystal", name: "Ac", cell: { lengths: [5.31, 5.31, 5.31], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 89, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 89, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 89, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 89, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "90": { version: 1, kind: "crystal", name: "Th", cell: { lengths: [5.08, 5.08, 5.08], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 90, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 90, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 90, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 90, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://ase.gitlab.io/ase/ase/data.html", temperatureK: null, conditions: null },
  "91": { version: 1, kind: "crystal", name: "Pa", cell: { lengths: [3.925, 3.925, 3.238], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 91, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 91, charge: 0, fractional: [0.5, 0.5, 0.5] }], bravais: "tI", spaceGroup: "I4/mmm", source: "https://www.crystallography.net/cod/2310022.html", temperatureK: null, conditions: null },
  "92": { version: 1, kind: "crystal", name: "U", cell: { lengths: [2.854, 5.869, 4.955], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 92, charge: 0, fractional: [0, 0.1025, 0.25] }, { id: 2, atomicNumber: 92, charge: 0, fractional: [0, 0.8975, 0.75] }, { id: 3, atomicNumber: 92, charge: 0, fractional: [0.5, 0.6025, 0.25] }, { id: 4, atomicNumber: 92, charge: 0, fractional: [0.5, 0.3975, 0.75] }], bravais: "oC", spaceGroup: "Cmcm", source: "https://www.crystallography.net/cod/9008584.html", temperatureK: null, conditions: null },
  "93": { version: 1, kind: "crystal", name: "Np", cell: { lengths: [4.723, 4.887, 6.663], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 93, charge: 0, fractional: [0.25, 0.208, 0.036] }, { id: 2, atomicNumber: 93, charge: 0, fractional: [0.25, 0.292, 0.536] }, { id: 3, atomicNumber: 93, charge: 0, fractional: [0.75, 0.792, 0.964] }, { id: 4, atomicNumber: 93, charge: 0, fractional: [0.75, 0.708, 0.464] }, { id: 5, atomicNumber: 93, charge: 0, fractional: [0.25, 0.842, 0.319] }, { id: 6, atomicNumber: 93, charge: 0, fractional: [0.25, 0.658, 0.819] }, { id: 7, atomicNumber: 93, charge: 0, fractional: [0.75, 0.158, 0.681] }, { id: 8, atomicNumber: 93, charge: 0, fractional: [0.75, 0.342, 0.181] }], bravais: "oP", spaceGroup: "Pmcn", source: "https://www.crystallography.net/cod/9008585.html", temperatureK: null, conditions: null },
  "94": { version: 1, kind: "crystal", name: "Pu", cell: { lengths: [6.18595, 4.82598, 10.9719], angles: [90, 101.787, 90] }, sites: [{ id: 1, atomicNumber: 94, charge: 0, fractional: [0.0314, 0.25, 0.621] }, { id: 2, atomicNumber: 94, charge: 0, fractional: [0.9686, 0.75, 0.379] }, { id: 3, atomicNumber: 94, charge: 0, fractional: [0.6605, 0.25, 0.4569] }, { id: 4, atomicNumber: 94, charge: 0, fractional: [0.3395, 0.75, 0.5431] }, { id: 5, atomicNumber: 94, charge: 0, fractional: [0.3275, 0.25, 0.9302] }, { id: 6, atomicNumber: 94, charge: 0, fractional: [0.6725, 0.75, 0.0698] }, { id: 7, atomicNumber: 94, charge: 0, fractional: [0.339, 0.25, 0.1565] }, { id: 8, atomicNumber: 94, charge: 0, fractional: [0.661, 0.75, 0.8435] }, { id: 9, atomicNumber: 94, charge: 0, fractional: [0.4719, 0.25, 0.6503] }, { id: 10, atomicNumber: 94, charge: 0, fractional: [0.5281, 0.75, 0.3497] }, { id: 11, atomicNumber: 94, charge: 0, fractional: [0.1345, 0.25, 0.3406] }, { id: 12, atomicNumber: 94, charge: 0, fractional: [0.8655, 0.75, 0.6594] }, { id: 13, atomicNumber: 94, charge: 0, fractional: [0.7704, 0.25, 0.1717] }, { id: 14, atomicNumber: 94, charge: 0, fractional: [0.2296, 0.75, 0.8283] }, { id: 15, atomicNumber: 94, charge: 0, fractional: [0.8707, 0.25, 0.8958] }, { id: 16, atomicNumber: 94, charge: 0, fractional: [0.1293, 0.75, 0.1042] }], bravais: "mP", spaceGroup: "P21/m", source: "https://www.crystallography.net/cod/1525989.html", temperatureK: null, conditions: null },
  "95": { version: 1, kind: "crystal", name: "Am", cell: { lengths: [3.474, 3.474, 11.25], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 95, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 95, charge: 0, fractional: [0, 0, 0.5] }, { id: 3, atomicNumber: 95, charge: 0, fractional: [0.33333, 0.66667, 0.75] }, { id: 4, atomicNumber: 95, charge: 0, fractional: [0.66666, 0.33333, 0.25] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://www.crystallography.net/cod/9008524.html", temperatureK: null, conditions: null },
  "96": { version: 1, kind: "crystal", name: "Cm", cell: { lengths: [3.496, 3.496, 11.331], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 96, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 96, charge: 0, fractional: [0, 0, 0.5] }, { id: 3, atomicNumber: 96, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 4, atomicNumber: 96, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://escholarship.org/content/qt98q8p9cg/qt98q8p9cg.pdf", temperatureK: null, conditions: null },
  "97": { version: 1, kind: "crystal", name: "Bk", cell: { lengths: [3.416, 3.416, 11.069], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 97, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 97, charge: 0, fractional: [0, 0, 0.5] }, { id: 3, atomicNumber: 97, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 4, atomicNumber: 97, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://escholarship.org/content/qt98q8p9cg/qt98q8p9cg.pdf", temperatureK: null, conditions: null },
  "98": { version: 1, kind: "crystal", name: "Cf", cell: { lengths: [3.39, 3.39, 11.01], angles: [90, 90, 120] }, sites: [{ id: 1, atomicNumber: 98, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 98, charge: 0, fractional: [0, 0, 0.5] }, { id: 3, atomicNumber: 98, charge: 0, fractional: [0.33333, 0.66667, 0.25] }, { id: 4, atomicNumber: 98, charge: 0, fractional: [0.66667, 0.33333, 0.75] }], bravais: "hP", spaceGroup: "P63/mmc", source: "https://escholarship.org/content/qt98q8p9cg/qt98q8p9cg.pdf", temperatureK: null, conditions: null },
  "99": { version: 1, kind: "crystal", name: "Es", cell: { lengths: [5.75, 5.75, 5.75], angles: [90, 90, 90] }, sites: [{ id: 1, atomicNumber: 99, charge: 0, fractional: [0, 0, 0] }, { id: 2, atomicNumber: 99, charge: 0, fractional: [0, 0.5, 0.5] }, { id: 3, atomicNumber: 99, charge: 0, fractional: [0.5, 0, 0.5] }, { id: 4, atomicNumber: 99, charge: 0, fractional: [0.5, 0.5, 0] }], bravais: "cF", spaceGroup: "Fm-3m", source: "https://escholarship.org/content/qt98q8p9cg/qt98q8p9cg.pdf", temperatureK: null, conditions: null }
};

// periodic-table/metal-reference.ts
var metalCells = metals_generated_default;
function metalCrystal(atomicNumber) {
  return metalCells[atomicNumber];
}

// periodic-table/details.ts
function conditionsText(language, temperatureK = CONDITIONS.temperatureK) {
  return format(strings(language).conditions, {
    temperature: numberText(celsiusFromKelvin(temperatureK), language),
    pressure: numberText(CONDITIONS.pressureBar, language)
  });
}
function numberText(value, language) {
  const text = String(Number(value.toFixed(2)));
  return language === "de" ? text.replace(".", ",") : text;
}
function temperatureText(kelvin, language) {
  const celsius = celsiusFromKelvin(kelvin);
  return `${numberText(kelvin, language)}\xA0K (${numberText(celsius, language)}\xA0\xB0C)`;
}
function stateText(state, t7) {
  switch (state) {
    case "solid":
      return t7.phaseSolid;
    case "liquid":
      return t7.phaseLiquid;
    case "gas":
      return t7.phaseGas;
    case "unknown":
      return t7.stateUnknown;
  }
}
function discoveryText(element, language) {
  const t7 = strings(language);
  switch (element.discovery.kind) {
    case "antiquity":
      return t7.discoveryAntiquity;
    case "unavailable":
      return t7.valueUnavailable;
    case "year":
      return element.discovery.by ? `${element.discovery.year} \xB7 ${element.discovery.by}` : String(element.discovery.year);
  }
}
function weightText(element, language) {
  const text = atomicWeightText(element.weight, language);
  switch (text.kind) {
    case "value":
      return text.text;
    case "interval":
      return language === "de" ? `[${text.lower}; ${text.upper}]` : `[${text.lower}, ${text.upper}]`;
    case "none":
      return strings(language).weightNone;
    case "unavailable":
      return strings(language).weightUnavailable;
  }
}
function groupText(element, language) {
  const t7 = strings(language);
  switch (element.group.status) {
    case "reported":
    case "predicted":
      return String(element.group.value);
    case "convention-dependent":
      return t7.groupConventionDependent;
    case "unassigned":
      return t7.groupUnassigned;
    case "unavailable":
      return t7.valueUnavailable;
  }
}
function categoryText(element, language) {
  const category = categoryOf(element.atomicNumber);
  return category ? CATEGORIES[category]?.[language] ?? category : "";
}
function detailRows(element, language, temperatureK = CONDITIONS.temperatureK) {
  const t7 = strings(language);
  const rows = [
    { key: "group", label: t7.fieldGroup, value: groupText(element, language), section: "position" },
    { key: "period", label: t7.fieldPeriod, value: String(element.period), section: "position" },
    { key: "family", label: t7.fieldFamily, value: categoryText(element, language), section: "header" }
  ];
  if (element.block.status === "unavailable") {
    rows.push({ key: "block", label: t7.fieldBlock, value: t7.valueUnavailable, section: "position" });
  } else {
    rows.push({
      key: "block",
      label: t7.fieldBlock,
      value: element.block.value,
      section: "position",
      ...element.block.status === "predicted" ? { qualifier: t7.valuePredicted } : {}
    });
  }
  rows.push({
    key: "weight",
    label: t7.fieldWeight,
    value: weightText(element, language),
    section: "properties"
  });
  const atBundle = temperatureK === CONDITIONS.temperatureK;
  if (!atBundle) {
    const state = matterState(element, temperatureK);
    rows.push({
      key: "phase",
      label: t7.fieldPhase,
      value: stateText(state, t7),
      section: "properties",
      swatch: state
    });
  } else if (element.phase.status === "unavailable") {
    rows.push({ key: "phase", label: t7.fieldPhase, value: t7.valueUnavailable, section: "properties" });
  } else {
    const phase = { solid: t7.phaseSolid, liquid: t7.phaseLiquid, gas: t7.phaseGas }[element.phase.value];
    rows.push({
      key: "phase",
      label: t7.fieldPhase,
      value: phase,
      section: "properties",
      swatch: element.phase.value,
      ...element.phase.status === "predicted" ? { qualifier: t7.valuePredicted } : {}
    });
  }
  rows.push({
    key: "radius",
    label: t7.fieldRadius,
    section: "properties",
    ...numericRow(element.radius, (value) => `${numberText(value, language)}\xA0pm`, t7)
  });
  rows.push({
    key: "electronegativity",
    label: t7.fieldElectronegativity,
    section: "properties",
    ...numericRow(element.electronegativity, (value) => numberText(value, language), t7)
  });
  rows.push({
    key: "ionization",
    label: t7.fieldIonization,
    section: "properties",
    ...numericRow(element.ionization, (value) => `${numberText(value, language)}\xA0eV`, t7)
  });
  rows.push({
    key: "halfLife",
    label: t7.fieldHalfLife,
    section: "properties",
    ...halfLifeRow(element, language, t7)
  });
  rows.push({
    key: "melting",
    label: t7.fieldMelting,
    section: "temperatures",
    ...temperatureRow(element.melting, language, t7)
  });
  rows.push({
    key: "boiling",
    label: t7.fieldBoiling,
    section: "temperatures",
    ...temperatureRow(element.boiling, language, t7)
  });
  if (element.sublimation.status !== "unavailable") {
    rows.push({
      key: "sublimation",
      label: t7.fieldSublimation,
      section: "temperatures",
      ...temperatureRow(element.sublimation, language, t7)
    });
  }
  rows.push({
    key: "discovery",
    label: t7.fieldDiscovery,
    value: discoveryText(element, language),
    section: "history"
  });
  if (element.configuration.status === "unavailable") {
    rows.push({
      key: "configuration",
      label: t7.fieldConfiguration,
      value: t7.valueUnavailable,
      section: "structure"
    });
  } else {
    rows.push({
      key: "configuration",
      label: t7.fieldConfiguration,
      value: element.configuration.value,
      section: "structure",
      ...element.configuration.status === "predicted" ? { qualifier: t7.valuePredicted } : {}
    });
  }
  rows.push({
    key: "shells",
    label: t7.fieldShells,
    value: element.shells.join(" \xB7 "),
    section: "structure"
  });
  const lattice = metalCrystal(element.atomicNumber);
  if (lattice !== void 0) {
    const lengths = lattice?.cell.lengths.map((length) => numberText(length, language)).join(" \xD7 ");
    const conditions = lattice?.temperatureK ? ` \xB7 ${numberText(lattice.temperatureK, language)} K` : lattice?.conditions?.startsWith("\u03B1-Hg") ? ` \xB7 ${t7.valueSolidMercury}` : "";
    rows.push({
      key: "referenceLattice",
      label: t7.fieldReferenceLattice,
      value: lattice ? `${lattice.bravais} \xB7 ${lattice.spaceGroup} \xB7 ${lengths} \xC5${conditions}` : t7.valueUnavailable,
      section: "structure"
    });
  }
  return rows;
}
function keyRows(rows, mode) {
  const answer = MODE_ROW[mode];
  return rows.filter((row) => row.key === "weight" || row.key === answer);
}
var MODE_ROW = {
  off: "phase",
  temperature: "phase",
  discovery: "discovery",
  radius: "radius",
  electronegativity: "electronegativity",
  ionization: "ionization",
  halfLife: "halfLife"
};
function temperatureRow(value, language, t7) {
  if (value.status === "unavailable") return { value: t7.valueUnavailable };
  return {
    value: temperatureText(value.value, language),
    ...value.status === "predicted" ? { qualifier: t7.valuePredicted } : {}
  };
}
function numericRow(value, render, t7) {
  if (value.status === "unavailable") return { value: t7.valueUnavailable };
  return {
    value: render(value.value),
    ...value.status === "predicted" ? { qualifier: t7.valuePredicted } : {}
  };
}
function halfLifeRow(element, language, t7) {
  const record = element.halfLife;
  switch (record.kind) {
    case "stable":
      return { value: t7.halfLifeStable };
    case "unavailable":
      return { value: t7.valueUnavailable };
    case "value":
      return {
        value: `${halfLifeText(record.seconds, language)} (${isotopeText(record.massNumber, element.symbol)})`
      };
  }
}
function sourceList() {
  return Object.values(SOURCES);
}
function sourceFieldText(field, t7) {
  switch (field) {
    case "names.de":
      return t7.fieldGermanName;
    case "period":
      return t7.fieldPeriod;
    case "group":
      return t7.fieldGroup;
    case "block":
      return t7.fieldBlock;
    case "phase":
      return t7.fieldPhase;
    case "electron_config":
      return t7.fieldConfiguration;
    case "set":
      return t7.fieldFamily;
    case "temperature.melting":
      return t7.fieldMelting;
    case "temperature.boiling":
      return t7.fieldBoiling;
    case "temperature.sublimation":
      return t7.fieldSublimation;
    case "discovery":
      return t7.fieldDiscovery;
    case "symbol":
      return t7.fieldSymbol;
    case "name":
      return t7.fieldName;
    case "standard atomic weight":
      return t7.fieldWeight;
    case "uncertainty digits":
      return t7.fieldUncertainty;
    case "note codes":
      return t7.fieldNoteCodes;
    case "neutral ground-state subshell occupation":
      return t7.fieldShells;
    case "radius.empirical":
      return t7.fieldRadius;
    case "negativity.pauling":
      return t7.fieldElectronegativity;
    case "ionization.values":
      return t7.fieldIonization;
    case "nuclides.half_life_sec":
      return t7.fieldHalfLife;
    case "nuclides.stable":
      return t7.fieldStableNuclide;
    case "nuclides.m":
      return t7.fieldMassNumber;
    default:
      return field;
  }
}

// periodic-table/styles.ts
var periodicTableStyles = i`
	/* The widget takes the same box as the lab widget: a fixed default size that
	   the author can shrink, and a corner grip outside fullscreen. The height is
	   fixed instead of grown by the content, so the table and the list scroll
	   inside the box and an embed never pushes the page around. The frame is the
	   lab widget's workspace outline: one pixel of neutral-300 with the same
	   5-pixel radius, so both widgets read as the same object on the page. */
	:host {
		display: block;
		box-sizing: border-box;
		inline-size: 800px;
		max-inline-size: 100%;
		block-size: 600px;
		min-inline-size: min(260px, 100%);
		min-block-size: 280px;
		padding: 0.75rem;
		border: 1px solid var(--pt-outline);
		border-radius: 5px;
		font-family: var(--sl-font-sans, system-ui, sans-serif);
		color: var(--sl-color-neutral-900, #1c1c1e);
		background: var(--sl-color-neutral-0, #ffffff);

		--pt-cell-height: 2.85rem;
		/* Height of one control in the ribbon. The family tags, the icon buttons
		   and the mode switch all take it, so the bar reads as one row of chips. */
		--pt-chip-height: 1.35rem;
		--pt-details-border: 1px;
		--pt-cell-bar: 0.22rem;
		--pt-gutter: 1.5rem;
		--pt-series-gap: 0.5rem;
		--pt-radius: 4px;
		--pt-border: var(--sl-color-neutral-200, #e2e2e6);
		/* The lab widget's workspace outline, one step darker than the cell
		   border so the frame of the widget reads as a frame and not as a cell. */
		--pt-outline: var(--sl-color-neutral-300, #c7c7cc);
		--pt-surface: var(--sl-color-neutral-0, #ffffff);
		--pt-inset: var(--sl-color-neutral-50, #f7f7f8);
		--pt-ink: var(--sl-color-neutral-900, #1c1c1e);
		--pt-ink-soft: var(--sl-color-neutral-700, #3f3f46);
		--pt-accent: var(--sl-color-primary-600, #0b6bcb);
		/* Surface and shadow of the lab widget's canvas controls and object info
		   panel, so the toolbar buttons and the detail card speak the same
		   visual language as the rest of ChemLab. */
		--pt-control-shadow: 0 1px 3px rgb(0 0 0 / 14%);
		--pt-panel-shadow: 0 2px 8px rgb(0 0 0 / 9%);
		/* The open detail card covers the cells below it, so it needs a shadow
		   that lifts it off the table instead of one that only softens an edge. */
		--pt-overlay-shadow: 0 10px 26px rgb(0 0 0 / 20%), 0 2px 6px rgb(0 0 0 / 10%);

		--pt-alkali-metal: #f2a3a3;
		--pt-alkaline-earth-metal: #f7c99a;
		--pt-transition-metal: #f0dd93;
		--pt-post-transition-metal: #cfe3a4;
		--pt-metalloid: #a9dcc6;
		--pt-nonmetal: #a6d2ee;
		--pt-halogen: #9fb8e8;
		--pt-noble-gas: #b9a8e0;
		--pt-lanthanide: #d8a8d8;
		--pt-actinide: #e8a8c0;
		--pt-unknown: #d8d8d8;

		--pt-state-solid: #d7e3f4;
		--pt-state-liquid: #cfe9d8;
		--pt-state-gas: #f6e3c0;
		--pt-state-unknown: #e6e6e9;
	}

	:host(:not(:fullscreen)) {
		resize: both;
		overflow: hidden;
	}

	:host([picker-mode]) {
		inline-size: 100%;
		block-size: auto;
		min-inline-size: 0;
		min-block-size: 0;
		padding: 0;
		resize: none;
		--pt-cell-height: 2.2rem;
		--pt-gutter: 0.8rem;
	}

	* {
		box-sizing: border-box;
	}

	/* The widget is the positioning context of the info button in its bottom left
	   corner, and the container the layout queries measure. */
	.widget {
		container-type: inline-size;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		block-size: 100%;
		min-block-size: 0;
	}

	.category-alkali-metal {
		--pt-cell-fill: var(--pt-alkali-metal);
	}
	.category-alkaline-earth-metal {
		--pt-cell-fill: var(--pt-alkaline-earth-metal);
	}
	.category-transition-metal {
		--pt-cell-fill: var(--pt-transition-metal);
	}
	.category-post-transition-metal {
		--pt-cell-fill: var(--pt-post-transition-metal);
	}
	.category-metalloid {
		--pt-cell-fill: var(--pt-metalloid);
	}
	.category-nonmetal {
		--pt-cell-fill: var(--pt-nonmetal);
	}
	.category-halogen {
		--pt-cell-fill: var(--pt-halogen);
	}
	.category-noble-gas {
		--pt-cell-fill: var(--pt-noble-gas);
	}
	.category-lanthanide {
		--pt-cell-fill: var(--pt-lanthanide);
	}
	.category-actinide {
		--pt-cell-fill: var(--pt-actinide);
	}
	.category-unknown {
		--pt-cell-fill: var(--pt-unknown);
	}

	/* The ribbon is the only band that is always visible: the filter toggle with
	   its panel, the mode toggle with its panel, and the layout switch, separated
	   by thin dividers. A panel opens inside the band, right beside the button
	   that opened it, so the controls stay where the toggle is. The band is
	   top-aligned: the buttons keep to the first row while an open panel grows
	   the band downwards, so the extra height sits under the panel alone and the
	   table below keeps the box it was given. */
	.ribbon {
		display: flex;
		flex: 0 0 auto;
		align-items: flex-start;
		gap: 0.3rem;
		padding: 0.3rem 0.35rem;
		border: 1px solid var(--pt-border);
		border-radius: 8px;
		background: var(--pt-inset);
	}

	/* The dividers mark the three groups of the band: filter, modes, layout. They
	   stretch with the band, so an open panel keeps them full height instead of
	   leaving a stub beside the buttons. */
	.ribbon-divider {
		flex: 0 0 auto;
		align-self: stretch;
		width: 1px;
		min-height: var(--pt-chip-height);
		background: var(--pt-border);
	}

	/* The toggles and the layout switch are compact icon buttons with a tooltip
	   and an accessible label, styled like the canvas controls of the lab widget:
	   a light surface with a small shadow on the shaded bar. */
	.ribbon sl-button::part(base) {
		background: var(--pt-surface);
		box-shadow: var(--pt-control-shadow);
	}

	.ribbon sl-button::part(label) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.4rem;
	}

	/* Every control in the ribbon takes the height of a family tag, so the bar
	   reads as one row of equal chips instead of a mix of sizes. */
	.ribbon sl-button {
		--sl-input-height-small: var(--pt-chip-height);
		--sl-button-font-size-small: 0.7rem;
	}

	/* An open panel fills its toggle in ChemLab blue, so the button says where the
	   controls went. A closed panel that still narrows the table keeps a small
	   accent dot, because a hidden filter must not look like no filter at all. */
	.ribbon-toggle.is-open::part(base) {
		border-color: var(--pt-accent);
		background: var(--pt-accent);
		color: var(--pt-surface);
	}

	.ribbon-toggle.is-active:not(.is-open)::part(base) {
		position: relative;
	}

	.ribbon-toggle.is-active:not(.is-open)::part(label)::after {
		content: "";
		position: absolute;
		top: 0.1rem;
		right: 0.1rem;
		width: 0.3rem;
		height: 0.3rem;
		border-radius: 50%;
		background: var(--pt-accent);
	}

	.views {
		display: flex;
		gap: 0.25rem;
		margin-inline-start: auto;
	}

	/* The active layout keeps the accent fill of its primary variant, because the
	   surface override would leave its white icon on a white box. */
	.views sl-button[variant="primary"]::part(base) {
		background: var(--pt-accent);
	}

	/* A panel is the opened layer of the ribbon: it sits beside its toggle and
	   takes the free width, so two open panels split it and one open panel fills
	   the band. It keeps a white surface and a light frame of its own, because
	   the band around it is shaded and the opened area has to read as one block
	   rather than as loose controls. */
	.ribbon-panel {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;
		padding: 0.3rem;
		border: 1px solid var(--pt-border);
		border-radius: 5px;
		background: var(--pt-surface);
	}

	.panel-row {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		min-width: 0;
	}

	/* Search and the family carousel share one height, so the two rows of the
	   filter panel line up with the ribbon chips above them. */
	.ribbon-panel .search {
		flex: 1 1 auto;
		min-width: 5rem;
		--sl-input-height-small: var(--pt-chip-height);
		--sl-input-font-size-small: 0.72rem;
	}

	/* The field names itself through its placeholder and its accessible label, so
	   the visible label is only kept for assistive technology. */
	.ribbon-panel .search::part(form-control-label) {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.ribbon-panel .reset {
		flex: 0 0 auto;
		--sl-input-height-small: var(--pt-chip-height);
	}

	.ribbon-panel .reset::part(base) {
		background: var(--pt-surface);
		box-shadow: var(--pt-control-shadow);
	}

	.ribbon-panel .reset::part(label) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.4rem;
	}

	/* The result count rides beside the family carousel as a pill badge; the full
	   sentence stays available to screen readers through the hidden live region. */
	.count-badge {
		flex: 0 0 auto;
	}

	.count-badge::part(base) {
		font-variant-numeric: tabular-nums;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* The info button sits in the bottom left corner of the widget, out of the
	   ribbon: the sources are a reference, not a control of the table, and the
	   corner keeps them reachable without taking a chip from the bar. */
	.info-button {
		position: absolute;
		bottom: 0.3rem;
		left: 0.3rem;
		z-index: 4;
		font-size: 0.7rem;
	}

	.info-button::part(base) {
		padding: 0.15rem;
		border: 1px solid var(--pt-border);
		border-radius: 50%;
		background: var(--pt-surface);
		box-shadow: var(--pt-control-shadow);
		color: var(--pt-ink-soft);
	}

	.info-button::part(base):hover {
		color: var(--pt-accent);
	}

	/* The pane is the only part that scrolls: the ribbon and the mode row stay
	   put while the table or the list moves under them, and the widget itself
	   never grows past the height it was given. The bottom padding keeps the
	   last row clear of the info button floating in the corner. */
	.table-pane {
		flex: 1 1 auto;
		min-width: 0;
		min-height: 0;
		overflow: auto;
		padding-bottom: 1.6rem;
	}

	:host([picker-mode]) .table-pane {
		padding: 3px;
		overscroll-behavior: contain;
		scrollbar-width: thin;
	}

	.grid {
		display: grid;
		grid-template-columns: var(--pt-gutter) repeat(18, minmax(0, 1fr));
		grid-template-rows:
			auto repeat(7, minmax(var(--pt-cell-height), auto))
			var(--pt-series-gap) repeat(2, minmax(var(--pt-cell-height), auto));
		gap: 2px;
		min-width: 30rem;
	}

	:host([picker-mode]) .grid {
		min-width: 21rem;
	}

	/* The picker in the molecule builder is much narrower than the widget, so the
	   atomic number moves above the symbol instead of sitting on its shoulder and
	   the family name shrinks into the gutter. Both would otherwise collide with
	   the symbol at the 20 px cells of a 410 px palette. */
	:host([picker-mode]) .cell {
		padding-block-start: 0.45rem;
		touch-action: manipulation;
	}

	:host([picker-mode]) .cell-number {
		inset-inline-start: 2px;
		font-size: 0.45rem;
	}

	:host([picker-mode]) .cell-year {
		font-size: 0.45rem;
	}

	:host([picker-mode]) .cell-symbol {
		font-size: 0.75rem;
	}

	:host([picker-mode]) .series-header {
		padding-right: 0.15rem;
		font-size: 0.5rem;
	}

	.grid-row {
		display: contents;
	}

	.cell,
	.gutter,
	.group-label,
	.placeholder,
	.series-header {
		grid-row: var(--pt-row);
		grid-column: var(--pt-column);
	}

	/* The detail card is a grid item of the table, so it starts in the free block
	   above the transition metals. The slot is only the box: the card inside it is
	   positioned and only as tall as its key rows, so it never stretches the rows
	   it spans and may reach over the cells below when it is expanded. The slot is
	   also the query container of the card, so the card can drop the conditions
	   when the block gets narrow. */
	.details-slot {
		position: relative;
		grid-row: var(--pt-row) / span var(--pt-row-span, 1);
		grid-column: var(--pt-column) / span var(--pt-column-span, 1);
		container-type: inline-size;
		min-width: 0;
		min-height: 0;
	}

	.group-label,
	.gutter {
		display: grid;
		place-items: center;
		font-size: 0.6rem;
		color: var(--pt-ink-soft);
	}

	.series-header {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 0.3rem;
		font-size: 0.65rem;
		color: var(--pt-ink-soft);
		text-align: right;
	}

	/* The cell keeps the element cards of the lab widget, but quieter: a neutral
	   border and one thin family-coloured edge along the bottom, so the family is
	   named once instead of framing the tile twice. The cell is its own container,
	   so the name appears exactly where it fits. */
	.cell {
		position: relative;
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 0;
		min-height: var(--pt-cell-height);
		padding: 2px 1px calc(var(--pt-cell-bar) + 2px);
		overflow: hidden;
		border: 1px solid var(--pt-border);
		border-radius: var(--pt-radius);
		background: var(--pt-surface);
		color: var(--pt-ink);
		font: inherit;
		line-height: 1.05;
		text-align: center;
		cursor: pointer;
	}

	.cell::after {
		content: "";
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		height: var(--pt-cell-bar);
		background: var(--pt-cell-fill, var(--pt-border));
	}

	/* A mode fills the card with the state colour and keeps the family edge, so
	   both readings stay visible at once. */
	.cell.state-solid {
		background: var(--pt-state-solid);
	}
	.cell.state-liquid {
		background: var(--pt-state-liquid);
	}
	.cell.state-gas {
		background: var(--pt-state-gas);
	}

	/* The atomic number sits in a consistent corner; the discovery year takes the
	   opposite one. */
	.cell-number {
		position: absolute;
		inset-block-start: 1px;
		inset-inline-start: 3px;
		font-size: 0.5rem;
		color: var(--pt-ink-soft);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}

	.cell-year {
		position: absolute;
		inset-block-start: 1px;
		inset-inline-end: 2px;
		font-size: 0.5rem;
		color: var(--pt-ink-soft);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}

	.cell:hover {
		border-color: color-mix(in srgb, var(--pt-ink) 35%, var(--pt-border));
	}

	/* The family filter fades the cells it leaves out instead of removing them:
	   the table keeps its shape, so the learner still reads where the family
	   sits. A light blur keeps the faded text from competing with the matching
	   cells, and the faded tile still answers a click. */
	.cell.is-faded,
	.placeholder.is-faded,
	.series-header.is-faded {
		opacity: 0.32;
		filter: blur(0.4px) saturate(0.45);
	}

	.cell.is-faded:hover,
	.cell.is-faded:focus-visible {
		opacity: 0.75;
		filter: none;
	}

	/* Selection stays ChemLab blue; keyboard focus gets its own dark outer ring,
	   so the two states never look alike. */
	.cell:focus-visible {
		outline: 2px solid var(--pt-ink);
		outline-offset: 1px;
	}

	.cell[aria-selected="true"] {
		border-color: var(--pt-accent);
		box-shadow: inset 0 0 0 2px var(--pt-accent);
	}

	.cell-symbol {
		font-size: 1rem;
		font-weight: 700;
	}

	.cell-name {
		display: none;
		max-width: 100%;
		overflow: hidden;
		font-size: 0.55rem;
		color: var(--pt-ink-soft);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The name shows where the cell itself is wide enough to hold it. The query
	   measures the content box, so the threshold sits below the 47 px a cell
	   reaches at a 1000 px host. */
	@container (min-width: 2.75rem) {
		.cell-name {
			display: block;
		}
	}

	.placeholder {
		display: flex;
	}

	.placeholder-text {
		display: grid;
		place-items: center;
		width: 100%;
		min-height: var(--pt-cell-height);
		border: 1px dashed color-mix(in srgb, var(--pt-ink) 25%, transparent);
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-inset));
		font-size: 0.6rem;
		color: var(--pt-ink-soft);
	}

	/* The families are a Shoelace carousel in the ribbon: one row that scrolls
	   sideways instead of wrapping into a second and third line, which is what
	   keeps the ribbon a single band at every width. The reset sits outside the
	   carousel, so it never scrolls out of reach. The small flex basis matters: a
	   basis of auto would be the full width of all tags, and the toolbar would
	   break the strip onto a line of its own before it ever shrank. */
	.family-strip {
		flex: 1 1 6rem;
		min-width: 7rem;
		--slide-gap: 0.25rem;
		/* The carousel sizes its slides from an aspect ratio, which would give a
		   one-row strip the height of a picture. Auto lets the tags decide the
		   height; the items inherit the same value. */
		--aspect-ratio: auto;
	}

	/* The carousel brings its own grid, gaps and arrow padding. The ribbon needs
	   the tags to sit as tightly as the rest of the bar, and each slide to take
	   the width of its own tag instead of an equal share of the strip. */
	.family-strip::part(base) {
		gap: 0.1rem;
	}

	.family-strip::part(scroll-container) {
		--slide-size: max-content;
	}

	/* The arrows take the height of a tag, so the strip reads as one row of
	   chips instead of a row of tags with two small buttons beside them. */
	.family-strip::part(navigation-button) {
		min-height: var(--pt-chip-height);
		padding: 0 0.1rem;
		font-size: 0.8rem;
	}

	/* Family names and the temperature key share one treatment: narrow
	   rectangular tags with a swatch, so neither reads as a competing control.
	   The family tags are the filter; the active one gets a clear selected state
	   in ChemLab blue. */
	.family-tag,
	.state-legend li {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.12rem 0.4rem;
		border: 1px solid var(--pt-border);
		border-radius: 3px;
		background: var(--pt-surface);
		color: var(--pt-ink-soft);
		font-size: 0.7rem;
	}

	.family-tag {
		flex: 0 0 auto;
		min-height: var(--pt-chip-height);
		font: inherit;
		font-size: 0.7rem;
		white-space: nowrap;
		cursor: pointer;
	}

	.family-tag[aria-pressed="true"] {
		border-color: var(--pt-accent);
		background: color-mix(in srgb, var(--pt-accent) 10%, var(--pt-surface));
		box-shadow: inset 0 0 0 1px var(--pt-accent);
		color: var(--pt-ink);
	}

	.family-tag:focus-visible,
	.list-row:focus-visible {
		outline: 2px solid var(--pt-ink);
		outline-offset: 1px;
	}

	.family-swatch,
	.state-swatch {
		width: 0.7rem;
		height: 0.7rem;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 15%, transparent);
		border-radius: 2px;
		background: var(--pt-cell-fill);
	}

	/* The property panel repeats the filter panel: a carousel of mode chips with
	   the reset at its end on top, the slider of the active mode underneath. The
	   chips are plain buttons in the family tag treatment, so the two panels read
	   as one system. */
	.mode-strip {
		/* The strip shares its row with the reset button, so it takes the free
		   width and leaves the button its own size, like the family strip beside
		   the count badge. */
		flex: 1 1 6rem;
		min-width: 7rem;
		--slide-gap: 0.25rem;
		/* The carousel sizes its slides from an aspect ratio, which would give a
		   one-row strip the height of a picture. Auto lets the chips decide the
		   height; the items inherit the same value. */
		--aspect-ratio: auto;
	}

	.mode-strip::part(base) {
		gap: 0.1rem;
	}

	.mode-strip::part(scroll-container) {
		--slide-size: max-content;
	}

	.mode-strip::part(navigation-button) {
		min-height: var(--pt-chip-height);
		padding: 0 0.1rem;
		font-size: 0.8rem;
	}

	.mode-tag {
		display: inline-flex;
		align-items: center;
		flex: 0 0 auto;
		min-height: var(--pt-chip-height);
		padding: 0.12rem 0.45rem;
		border: 1px solid var(--pt-border);
		border-radius: 3px;
		background: var(--pt-surface);
		color: var(--pt-ink-soft);
		font: inherit;
		font-size: 0.7rem;
		white-space: nowrap;
		cursor: pointer;
	}

	.mode-tag[aria-pressed="true"] {
		border-color: var(--pt-accent);
		background: color-mix(in srgb, var(--pt-accent) 10%, var(--pt-surface));
		box-shadow: inset 0 0 0 1px var(--pt-accent);
		color: var(--pt-ink);
	}

	.mode-tag:focus-visible {
		outline: 2px solid var(--pt-ink);
		outline-offset: 1px;
	}

	.mode-slider {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	/* The slider is a native range input: no component registration, the keyboard
	   and touch behaviour of the platform, and no fallback to plain text when a
	   Shoelace build is missing. The accent colour is the only styling it needs to
	   sit in the ChemLab palette. */
	.mode-range {
		flex: 1 1 auto;
		min-width: 4rem;
		height: var(--pt-chip-height);
		margin: 0;
		accent-color: var(--pt-accent);
		cursor: pointer;
	}

	.mode-range:focus-visible {
		outline: 2px solid var(--pt-ink);
		outline-offset: 2px;
	}

	/* The current slider value rides beside the slider as a small tag. */
	.mode-value {
		flex: 0 0 auto;
	}

	.mode-value::part(base) {
		font-variant-numeric: tabular-nums;
	}

	.state-legend {
		display: flex;
		flex: 0 0 auto;
		flex-wrap: wrap;
		gap: 0.25rem 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.state-swatch.state-solid {
		background: var(--pt-state-solid);
	}
	.state-swatch.state-liquid {
		background: var(--pt-state-liquid);
	}
	.state-swatch.state-gas {
		background: var(--pt-state-gas);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.list-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 2.75rem;
		padding: 0.3rem 0.5rem;
		border: 1px solid var(--pt-border);
		border-radius: var(--pt-radius);
		background: var(--pt-surface);
		color: var(--pt-ink);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	:host([picker-mode]) :is(.list-row, .cell) {
		cursor: grab;
		user-select: none;
	}

	:host([picker-mode]) .list-row {
		gap: 0.4rem;
		min-height: 2.25rem;
		padding: 0.2rem 0.35rem;
		font-size: 0.8rem;
		touch-action: pan-y;
	}

	:host([picker-mode]) .list-row[aria-pressed="true"] {
		border-color: var(--pt-accent);
		background: var(--pt-inset);
	}

	.list-row:hover {
		background: var(--pt-inset);
	}

	.list-number {
		width: 2rem;
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
		text-align: right;
	}

	.list-symbol {
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-inset));
		font-weight: 600;
	}

	.list-name {
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:host([picker-mode]) .list-name {
		white-space: normal;
		overflow-wrap: anywhere;
	}

	:host([picker-mode]) :is(.list-number, .list-symbol) {
		flex: none;
	}

	:host([picker-mode]) .list-number {
		width: 1.45rem;
	}

	.list-category {
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
	}

	/* The mode rides along at the end of the row: the state as a coloured tag,
	   the discovery year as a quiet one, so the narrow list keeps the mode's
	   meaning. */
	.list-state::part(base),
	.list-year::part(base) {
		height: auto;
		padding: 0 0.3rem;
		font-size: 0.6rem;
		line-height: 1.35;
	}

	.list-year::part(base) {
		font-variant-numeric: tabular-nums;
	}

	/* In the list the card stands in for the selected row, so it sits in the flow
	   of the list and is always open: no overlay, no fixed height, no toggle. */
	.list-details {
		position: relative;
		margin: 0.25rem 0;
	}

	.list-details .details-shell {
		position: static;
		max-height: none;
		/* The card is always open here, so nothing needs clipping. The shell
		   would otherwise cut off the focus ring of the card it holds. */
		overflow: visible;
	}

	/* In the list the card sits in the flow of the rows instead of over the
	   table, so it keeps the softer panel shadow. */
	.list-details .details-card::part(base) {
		height: auto;
		box-shadow: var(--pt-panel-shadow);
	}

	.list-details .details-card::part(body) {
		flex: 0 0 auto;
		padding-bottom: 6px;
		overflow: visible;
	}

	/* The detail card is a Shoelace card with the same white surface, subtle
	   outline and soft shadow as the object info panel of the lab widget. The
	   shell is the positioned box inside the slot: collapsed it takes only the
	   height of its content, so the card is as slim as its key rows and the
	   periods around it keep their cells. */
	.details-shell {
		position: absolute;
		inset: 0 0 auto 0;
		display: flex;
		max-height: 100%;
		min-width: 0;
		overflow: hidden;
	}

	/* The open card grows downwards from the top of the block and covers the
	   cells below it. The stronger shadow lifts it off the table, so the overlay
	   reads as a layer and not as a taller cell. */
	.details-shell.is-expanded {
		inset: 0 0 auto 0;
		height: auto;
		max-height: none;
		overflow: visible;
		z-index: 6;
	}

	.details-card {
		flex: 1;
		min-width: 0;
		min-height: 0;
		--padding: 0;
		--border-color: var(--sl-color-neutral-200, #e4e4e7);
		--border-width: var(--pt-details-border);
		--border-radius: 5px;
		--sl-panel-background-color: var(--pt-surface);
	}

	/* The card takes the height of its key rows instead of the height of the
	   block, so the panel stays slim and the periods around it keep their cells.
	   It floats over the block even when it is collapsed, so it always carries
	   the lifting shadow that sets it apart from the cells around it. */
	.details-card::part(base) {
		height: auto;
		overflow: hidden;
		box-shadow: var(--pt-overlay-shadow);
	}

	/* The card takes focus when it replaces the selected list row, so it needs a
	   ring of its own: the default one hugs the border and reads as a second
	   frame. It takes the selection blue, because the card is the selection. */
	.details-card:focus-visible {
		outline: 2px solid var(--pt-accent);
		outline-offset: 1px;
	}

	/* The header carries the identity of the element in one row: the coloured
	   thumbnail, the name, the atomic number, the family, and the conditions the
	   state values refer to. It sits on the inset surface, so the card reads as a
	   titled panel instead of a plain box. */
	.details-card::part(header) {
		padding: 4px 8px;
		border-bottom: 1px solid var(--pt-border);
		background: color-mix(in srgb, var(--pt-cell-fill, var(--pt-inset)) 16%, var(--pt-surface));
	}

	.details-head {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-width: 0;
	}

	.details-thumb {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 12%, transparent);
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-surface));
		font-size: 0.85rem;
		font-weight: 700;
		line-height: 1;
	}

	.details-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.15;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The number is a quiet badge on the inset band, the family a tag in the
	   colour of the cell, so the header names the element twice without shouting. */
	.details-number::part(base) {
		background: var(--pt-surface);
		border-color: var(--pt-border);
		color: var(--pt-ink-soft);
		font-size: 0.6rem;
		font-variant-numeric: tabular-nums;
	}

	.details-family::part(base) {
		height: auto;
		padding: 1px 0.35rem;
		border-color: color-mix(in srgb, var(--pt-cell-fill, var(--pt-border)) 55%, var(--pt-border));
		background: color-mix(in srgb, var(--pt-cell-fill, var(--pt-inset)) 45%, var(--pt-surface));
		color: var(--pt-ink);
		font-size: 0.6rem;
		line-height: 1.2;
	}

	.details-conditions {
		margin-inline-start: auto;
		padding-inline-start: 0.35rem;
		font-size: 0.6rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		color: var(--pt-ink-soft);
	}

	/* The body holds the key rows and, once the card is open, the sections below
	   them. Collapsed it keeps room for the toggle in its bottom-right corner and
	   scrolls if a value needs more lines than the block has. */
	.details-card::part(body) {
		display: flex;
		flex: 1;
		min-height: 0;
		padding: 6px 8px 1.5rem;
		overflow: auto;
	}

	/* The open card grows with its content instead of scrolling, and keeps room
	   for the toggle in its bottom-right corner. */
	.details-shell.is-expanded .details-card::part(body) {
		flex: 0 0 auto;
		overflow: visible;
		padding-bottom: 1.9rem;
	}

	/* The body is the single flex item of the card body, so it has to take the full
	   width itself: the key rows and the sections below them stack inside it. */
	.details-body {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	/* The key rows answer the two questions the table asks: how heavy the element
	   is, and what the current mode says about it. They are the only rows the
	   collapsed card shows, so they get the readable size. */
	.details-key .details-row {
		font-size: 0.8rem;
		line-height: 1.4;
	}

	/* The open card adds the remaining sections below the key rows, in as many
	   columns as the block allows: side by side while there is room, stacked when
	   the card is narrow. A wrapping flex row instead of a grid, because the
	   sections then share the width of their own line: a grid would open as many
	   narrow columns as fit and leave the rest of the row empty, which reads as a
	   hole in the wide card of the list view. */
	.details-more {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem 0.9rem;
		align-items: flex-start;
		margin-top: 0.4rem;
		padding-top: 0.4rem;
		border-top: 1px solid var(--pt-border);
	}

	.details-section {
		display: flex;
		flex: 1 1 8.5rem;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	/* The electron configuration and the shell counts are long values that wrap
	   badly in a third of the card, so the structure section takes the full width
	   and starts a row of its own. */
	.details-section-structure {
		flex-basis: 100%;
	}

	/* The section headings are tags, so they read as labels of the card instead of
	   as another line of running text. The tag keeps the width of its text; a
	   stretched tag would read as a divider bar. */
	.details-heading {
		align-self: flex-start;
	}

	.details-heading::part(base) {
		height: auto;
		padding: 0 0.3rem;
		border-color: var(--pt-border);
		background: var(--pt-inset);
		color: var(--pt-ink-soft);
		font-size: 0.58rem;
		font-weight: 600;
		line-height: 1.45;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.details-rows {
		display: flex;
		flex-direction: column;
		margin: 0;
	}

	/* Label and value share a row, the value keeps its own column so a long
	   configuration wraps under itself instead of under the label. */
	.details-row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: 0 0.3rem;
		min-width: 0;
		font-size: 0.75rem;
		line-height: 1.35;
	}

	.details-row dt {
		color: var(--pt-ink-soft);
		white-space: nowrap;
	}

	.details-row dt::after {
		content: ":";
	}

	.details-row dd {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin: 0;
		/* Break a long word only when it cannot fit a line of its own, so a value
		   like the parenthesised temperature wraps as a unit instead of leaving
		   its closing bracket behind. */
		overflow-wrap: break-word;
		font-variant-numeric: tabular-nums;
	}

	/* The state is a tag in the colour of the state, so the value is readable at a
	   glance instead of hanging on a dot of half a millimetre. The detail card and
	   the list rows share the tag. */
	.state-tag::part(base) {
		height: auto;
		padding: 0 0.3rem;
		border-color: color-mix(in srgb, var(--pt-ink) 18%, transparent);
		color: var(--pt-ink);
		font-size: 0.6rem;
		line-height: 1.35;
	}

	.state-tag.state-solid::part(base) {
		background: var(--pt-state-solid);
	}

	.state-tag.state-liquid::part(base) {
		background: var(--pt-state-liquid);
	}

	.state-tag.state-gas::part(base) {
		background: var(--pt-state-gas);
	}

	.state-tag.state-unknown::part(base) {
		background: var(--pt-state-unknown);
	}

	/* The toggle sits in the bottom-right corner of the card, where the eye ends
	   after the key rows. It is a compact icon button like the canvas controls, and
	   its arrow turns over while the card is open. */
	.details-toggle {
		position: absolute;
		right: 4px;
		bottom: 4px;
	}

	.details-toggle::part(base) {
		width: 1.35rem;
		height: 1.35rem;
		min-height: 0;
		padding: 0;
		border-color: var(--pt-border);
		background: var(--pt-surface);
		box-shadow: var(--pt-control-shadow);
		color: var(--pt-ink-soft);
	}

	.details-toggle::part(label) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.details-toggle svg {
		transition: transform 120ms ease;
	}

	.details-shell.is-expanded .details-toggle svg {
		transform: rotate(180deg);
	}

	.details-qualifier::part(base) {
		background: var(--pt-inset);
		border-color: var(--pt-border);
		color: var(--pt-ink-soft);
		font-size: 0.5rem;
		line-height: 1.3;
	}

	/* The empty card has no header, so its body takes the whole height. */
	.details-card-empty::part(body) {
		display: grid;
		place-items: center;
	}

	.details-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		margin: 0;
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
		text-align: center;
	}

	.details-empty-icon {
		font-size: 1.1rem;
		color: var(--pt-ink-soft);
	}

	/* A narrow card drops the conditions from the header: the temperature is set
	   by the slider above the table, so the line is the first thing that can go
	   without losing a value. */
	@container (max-width: 22rem) {
		.details-conditions {
			display: none;
		}
	}

	/* The sources and the model notes live in a dialog behind the info button, so
	   the card stays a card. The dialog gets wider margins than the Shoelace
	   default, because it carries running text and a list of sources.

	   Shoelace pins the dialog to the viewport, which would dim the page around
	   the widget and hide its frame. The base and the overlay are absolute
	   instead, so the dialog covers the widget's own box: the frame stays
	   visible, the panel centres in the widget, and its height follows the
	   widget instead of the window. */
	.info::part(base) {
		position: absolute;
		inset: 0;
	}

	.info::part(overlay) {
		position: absolute;
		inset: 0;
	}

	.info::part(panel) {
		max-width: min(44rem, 92%);
	}

	.info::part(header) {
		padding: 1.25rem 2rem 0;
	}

	.info::part(title) {
		font-size: 1.05rem;
	}

	.info::part(body) {
		padding: 1rem 2rem 1.5rem;
	}

	.info::part(footer) {
		padding: 0 2rem 1.5rem;
	}

	/* The widget ships no icon assets, so the built-in close button would ask a
	   CDN for its glyph. The footer button and Escape close the dialog instead. */
	.info::part(close-button) {
		display: none;
	}

	.info-intro {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.55;
	}

	.info-section {
		margin-top: 1.75rem;
	}

	.info-section h3 {
		margin: 0 0 0.6rem;
		font-size: 0.95rem;
	}

	.info-note {
		margin: 0.6rem 0 0;
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--pt-ink-soft);
	}

	.info-source {
		padding: 0.9rem 0;
		border-top: 1px solid var(--pt-border);
	}

	.info-source:first-of-type {
		padding-top: 0;
		border-top: none;
	}

	.info-source-title {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.info-source-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin: 0.4rem 0 0;
	}

	.info-source-text {
		margin: 0.4rem 0 0;
		font-size: 0.82rem;
		line-height: 1.5;
		color: var(--pt-ink-soft);
	}

	.info-source-link {
		font-size: 0.82rem;
		color: var(--pt-accent);
		overflow-wrap: anywhere;
	}


	.print-overview {
		display: none;
	}

	.print-title {
		margin: 0 0 0.4rem;
		font-size: 1rem;
	}

	.print-grid {
		display: grid;
		grid-template-columns: var(--pt-gutter) repeat(18, minmax(0, 1fr));
		grid-template-rows:
			auto repeat(7, minmax(1.5rem, auto))
			var(--pt-series-gap) repeat(2, minmax(1.5rem, auto));
		gap: 1px;
	}

	.print-cell,
	.print-gutter,
	.print-group,
	.print-placeholder,
	.print-series {
		grid-row: var(--pt-row);
		grid-column: var(--pt-column);
	}

	.print-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 30%, transparent);
		border-radius: 2px;
		background: var(--pt-cell-fill, var(--pt-inset));
		line-height: 1.05;
	}

	.print-number {
		font-size: 0.45rem;
		color: var(--pt-ink-soft);
	}

	.print-symbol {
		font-size: 0.7rem;
		font-weight: 600;
	}

	.print-gutter,
	.print-group {
		display: grid;
		place-items: center;
		font-size: 0.5rem;
		color: var(--pt-ink-soft);
	}

	.print-series {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 0.2rem;
		font-size: 0.55rem;
		color: var(--pt-ink-soft);
	}

	.print-placeholder {
		border: 1px dashed color-mix(in srgb, var(--pt-ink) 30%, transparent);
		border-radius: 2px;
		background: var(--pt-cell-fill, var(--pt-inset));
	}

	.print-details {
		margin-top: 0.6rem;
		font-size: 0.7rem;
	}

	.print-details h3 {
		margin: 0 0 0.2rem;
		font-size: 0.85rem;
	}

	.print-fields {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.1rem 0.5rem;
		margin: 0;
	}

	.print-fields div {
		display: contents;
	}

	.print-fields dt {
		color: var(--pt-ink-soft);
	}

	.print-fields dd {
		margin: 0;
	}

	.print-hint {
		margin: 0.3rem 0 0;
		color: var(--pt-ink-soft);
	}

	@media print {
		/* The printed sheet is as tall as its content, so the fixed box and the
		   scrolling pane are undone here. */
		:host {
			block-size: auto;
			min-block-size: 0;
			overflow: visible;
			padding: 0;
		}

		.widget {
			block-size: auto;
		}

		.ribbon,
		.ribbon-panel,
		.info-button,
		.table-pane {
			display: none !important;
		}

		.print-overview {
			display: block;
		}

		.print-cell,
		.print-placeholder {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
	}

	:host(.ww-beforeprint) .ribbon,
	:host(.ww-beforeprint) .ribbon-panel,
	:host(.ww-beforeprint) .info-button,
	:host(.ww-beforeprint) .table-pane {
		display: none !important;
	}

	:host(.ww-beforeprint) .print-overview {
		display: block;
	}

	@media (forced-colors: active) {
		.cell,
		.list-row,
		.family-tag,
		.mode-tag,
		.state-legend li,
		.details-card,
		.placeholder-text {
			border: 1px solid CanvasText;
			background: Canvas;
		}

		/* Focus is an outer ring, selection a thick border, so the two states
		   stay distinct without colour. */
		.cell:focus-visible,
		.list-row:focus-visible,
		.family-tag:focus-visible,
		.mode-tag:focus-visible {
			outline: 2px solid Highlight;
			outline-offset: 2px;
		}

		.cell[aria-selected="true"],
		.family-tag[aria-pressed="true"],
		.mode-tag[aria-pressed="true"] {
			border: 2px solid Highlight;
			box-shadow: none;
		}
	}
`;

// webwriter-chemlab-periodic-table.ts
setBasePath("@shoelace-style/shoelace/dist");
var VIEWS = ["auto", "table", "list"];
var LIST_BREAKPOINT = 680;
var STATES = ["solid", "liquid", "gas"];
var DETAIL_SECTIONS = [
  { section: "properties", label: "sectionProperties" },
  { section: "temperatures", label: "sectionTemperatures" },
  { section: "position", label: "sectionPosition" },
  { section: "history", label: "sectionHistory" },
  { section: "structure", label: "sectionStructure" }
];
var INFO_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="#3f3f46" stroke-width="1.3"/><circle cx="8" cy="4.9" r=".95" fill="#3f3f46"/><rect x="7.15" y="6.6" width="1.7" height="5.1" rx=".85" fill="#3f3f46"/></svg>'
)}`;
var POINTER_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 2v11l2.7-2.7 1.9 4 2-1-1.9-3.9H13z" fill="#3f3f46"/></svg>'
)}`;
var TABLE_ICON = x2`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
		<path d="M2 2.5h12v11H2z"/><path d="M6 2.5v11M10 2.5v11M2 6.2h12M2 9.9h12"/>
	</svg>
`;
var LIST_ICON = x2`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
		<path d="M5.8 4h8.2M5.8 8h8.2M5.8 12h8.2"/>
		<circle cx="2.8" cy="4" r="1" fill="currentColor" stroke="none"/>
		<circle cx="2.8" cy="8" r="1" fill="currentColor" stroke="none"/>
		<circle cx="2.8" cy="12" r="1" fill="currentColor" stroke="none"/>
	</svg>
`;
var RESET_ICON = x2`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
		<path d="M13.6 8a5.6 5.6 0 1 1-1.64-3.96"/><path d="M13.6 2.6v2.6h-2.6"/>
	</svg>
`;
var FILTER_ICON = x2`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M2.2 3.2h11.6l-4.5 5.1v4.5l-2.6 1.4V8.3z"/>
	</svg>
`;
var MODE_ICON = x2`
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true">
		<path d="M2.4 4.6h11.2M2.4 11.4h11.2"/>
		<circle cx="5.6" cy="4.6" r="1.7" fill="currentColor" stroke="none"/>
		<circle cx="10.4" cy="11.4" r="1.7" fill="currentColor" stroke="none"/>
	</svg>
`;
var CHEVRON_ICON = x2`
	<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M4 6.2 8 10.2l4-4"/>
	</svg>
`;
var CAROUSEL_PREVIOUS_ICON = x2`
	<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M10 3.5 5.5 8l4.5 4.5"/>
	</svg>
`;
var CAROUSEL_NEXT_ICON = x2`
	<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M6 3.5 10.5 8 6 12.5"/>
	</svg>
`;
function modeText(mode, t7) {
  switch (mode) {
    case "off":
      return t7.modeOff;
    case "temperature":
      return t7.modeTemperature;
    case "discovery":
      return t7.modeDiscovery;
    case "radius":
      return t7.modeRadius;
    case "electronegativity":
      return t7.modeElectronegativity;
    case "ionization":
      return t7.modeIonization;
    case "halfLife":
      return t7.modeHalfLife;
  }
}
function parseView(raw) {
  const value = (raw ?? "").trim().toLowerCase();
  return VIEWS.find((view) => view === value) ?? "auto";
}
var atomicNumberConverter = {
  fromAttribute: (value) => parseAtomicNumberAttribute(value),
  toAttribute: (value) => value === null ? null : String(value)
};
var viewConverter = {
  fromAttribute: (value) => parseView(value),
  toAttribute: (value) => value
};
var _clearInitialElement_dec, _pickerMode_dec, _view_dec, _initialElement_dec, _a2, _init2, _initialElement, _view, _pickerMode, _ChemLabPeriodicTable_instances, startElementDrag_fn, _selection, _initialized, _viewOverride, _query, _category, _width, _resizeObserver, _languageObserver, _matching, _rovingOverride, _focusBeforeLayout, _restoreFocusPending, _mode, _infoOpen, _detailsExpanded, _filtersOpen, _modesOpen, observeLanguage_fn, measure_fn, captureResultFocus_fn, reveal_fn, language_get, resolvedView_get, temperature_get, placeable_fn, matches_fn, selectFromUser_fn, listDetailsCard_fn, focusDetails_fn, clearFromUser_fn, _toggleDetails, _onDetailsKeydown, dispatchSelection_fn, setView_fn, toggleCategory_fn, setMode_fn, _onTemperatureInput, _onYearInput, _onRadiusInput, _onElectronegativityInput, _onIonizationInput, _onHalfLifeInput, _toggleFilters, _toggleModes, _openInfo, _closeInfo, _onInfoHide, focusElement_fn, reset_fn, _resetMode, _onQueryInput, _onSearchKeydown, _onCellKeydown, rovingTarget_fn, renderCount_fn, renderRibbon_fn, renderFilters_fn, slider_fn, renderModes_fn, renderStateLegend_fn, renderCell_fn, renderGrid_fn, renderList_fn, renderPrintOverview_fn, renderDetails_fn, renderDetailSections_fn, renderDetailRow_fn, renderInfo_fn;
var _ChemLabPeriodicTable = class _ChemLabPeriodicTable extends (_a2 = LitElementWw, _initialElement_dec = [n7({ type: Number, reflect: true, attribute: "initial-element", converter: atomicNumberConverter })], _view_dec = [n7({ type: String, reflect: true, converter: viewConverter })], _pickerMode_dec = [n7({ type: Boolean, reflect: true, attribute: "picker-mode" })], _clearInitialElement_dec = [action({ label: { _: "Clear initial element", "de-DE": "Startelement entfernen" } })], _a2) {
  constructor() {
    super(...arguments);
    __runInitializers(_init2, 5, this);
    __privateAdd(this, _ChemLabPeriodicTable_instances);
    __publicField(this, "options", _ChemLabPeriodicTable.options);
    __publicField(this, "optionGroups", _ChemLabPeriodicTable.optionGroups);
    __privateAdd(this, _initialElement, __runInitializers(_init2, 8, this, null)), __runInitializers(_init2, 11, this);
    __privateAdd(this, _view, __runInitializers(_init2, 12, this, "auto")), __runInitializers(_init2, 15, this);
    __privateAdd(this, _pickerMode, __runInitializers(_init2, 16, this, false)), __runInitializers(_init2, 19, this);
    __privateAdd(this, _selection, new SelectionModel());
    __privateAdd(this, _initialized, false);
    __privateAdd(this, _viewOverride, null);
    __privateAdd(this, _query, "");
    __privateAdd(this, _category, null);
    __privateAdd(this, _width, null);
    __privateAdd(this, _resizeObserver, null);
    __privateAdd(this, _languageObserver, null);
    /**
     * Atomic numbers the keyboard may reach.
     *
     * In the grid this is every cell the mode can place, because the family filter
     * only fades a cell and leaves it clickable; in the list it is the rows that
     * survive the filter, because the list drops the rest.
     */
    __privateAdd(this, _matching, /* @__PURE__ */ new Set());
    __privateAdd(this, _rovingOverride, null);
    __privateAdd(this, _focusBeforeLayout, null);
    __privateAdd(this, _restoreFocusPending, false);
    __privateAdd(this, _mode, DEFAULT_MODE_STATE);
    __privateAdd(this, _infoOpen, false);
    __privateAdd(this, _detailsExpanded, false);
    /** Whether the panel with the search field and the family carousel is open. */
    __privateAdd(this, _filtersOpen, false);
    /** Whether the panel with the property modes and their slider is open. */
    __privateAdd(this, _modesOpen, false);
    /** Opens or closes the full detail card. */
    __privateAdd(this, _toggleDetails, () => {
      __privateSet(this, _detailsExpanded, !__privateGet(this, _detailsExpanded));
      this.requestUpdate();
    });
    /**
     * Closes the open detail card on Escape.
     *
     * The card covers the cells below it, so the key that closes an overlay has to
     * work here as well. Focus stays on the toggle, which is still in the card.
     *
     * @param event - Key event of the card.
     */
    __privateAdd(this, _onDetailsKeydown, (event) => {
      if (event.key !== "Escape" || !__privateGet(this, _detailsExpanded)) return;
      event.stopPropagation();
      __privateSet(this, _detailsExpanded, false);
      this.requestUpdate();
    });
    /** Reads the temperature slider, which works in degrees Celsius. */
    __privateAdd(this, _onTemperatureInput, (event) => {
      const value = Number(event.target.value ?? "");
      if (!Number.isFinite(value)) return;
      __privateSet(this, _mode, { ...__privateGet(this, _mode), temperatureK: kelvinFromCelsius(value) });
      this.requestUpdate();
    });
    /** Reads the year slider. */
    __privateAdd(this, _onYearInput, (event) => {
      const value = Number(event.target.value ?? "");
      if (!Number.isFinite(value)) return;
      __privateSet(this, _mode, { ...__privateGet(this, _mode), year: value });
      this.requestUpdate();
    });
    /** Reads the atomic radius slider, which hides everything above the threshold. */
    __privateAdd(this, _onRadiusInput, (event) => {
      const value = Number(event.target.value ?? "");
      if (!Number.isFinite(value)) return;
      __privateSet(this, _mode, { ...__privateGet(this, _mode), radiusPm: value });
      this.requestUpdate();
    });
    /** Reads the electronegativity slider, which hides everything below the threshold. */
    __privateAdd(this, _onElectronegativityInput, (event) => {
      const value = Number(event.target.value ?? "");
      if (!Number.isFinite(value)) return;
      __privateSet(this, _mode, { ...__privateGet(this, _mode), electronegativity: value });
      this.requestUpdate();
    });
    /** Reads the ionization energy slider, which hides everything below the threshold. */
    __privateAdd(this, _onIonizationInput, (event) => {
      const value = Number(event.target.value ?? "");
      if (!Number.isFinite(value)) return;
      __privateSet(this, _mode, { ...__privateGet(this, _mode), ionizationEv: value });
      this.requestUpdate();
    });
    /** Reads the half-life slider, which works in decades of seconds. */
    __privateAdd(this, _onHalfLifeInput, (event) => {
      const value = Number(event.target.value ?? "");
      if (!Number.isFinite(value)) return;
      __privateSet(this, _mode, { ...__privateGet(this, _mode), halfLifeLogSeconds: value });
      this.requestUpdate();
    });
    /** Opens or closes the panel with the search field and the family filter. */
    __privateAdd(this, _toggleFilters, () => {
      __privateSet(this, _filtersOpen, !__privateGet(this, _filtersOpen));
      this.requestUpdate();
    });
    /** Opens or closes the panel with the property modes. */
    __privateAdd(this, _toggleModes, () => {
      __privateSet(this, _modesOpen, !__privateGet(this, _modesOpen));
      this.requestUpdate();
    });
    /** Opens the info dialog. */
    __privateAdd(this, _openInfo, () => {
      __privateSet(this, _infoOpen, true);
      this.requestUpdate();
    });
    /**
     * Closes the info dialog from its footer button.
     *
     * The flag is the only source of truth for the dialog's `open` attribute, so
     * the click has to ask for a render; without it the button would look dead.
     */
    __privateAdd(this, _closeInfo, () => {
      __privateSet(this, _infoOpen, false);
      this.requestUpdate();
    });
    /** Keeps the open flag in step when the dialog closes itself. */
    __privateAdd(this, _onInfoHide, () => {
      if (!__privateGet(this, _infoOpen)) return;
      __privateSet(this, _infoOpen, false);
      this.requestUpdate();
    });
    /**
     * Clears the property mode and restores the default thresholds.
     *
     * The mode panel carries no `off` chip, so this is the way back to the plain
     * table. It also puts every slider back to the end that hides nothing, so the
     * next mode starts from the reference state instead of the last threshold.
     */
    __privateAdd(this, _resetMode, () => {
      __privateSet(this, _mode, DEFAULT_MODE_STATE);
      this.requestUpdate();
    });
    /** Reads the search field. */
    __privateAdd(this, _onQueryInput, (event) => {
      const value = event.target.value ?? "";
      if (value === __privateGet(this, _query)) return;
      __privateSet(this, _query, value);
      this.requestUpdate();
    });
    /** Selects the best match on Enter, so the field works without a mouse. */
    __privateAdd(this, _onSearchKeydown, (event) => {
      if (event.key !== "Enter" || event.isComposing) return;
      const [first] = __privateMethod(this, _ChemLabPeriodicTable_instances, matches_fn).call(this);
      if (!first) return;
      event.preventDefault();
      __privateMethod(this, _ChemLabPeriodicTable_instances, selectFromUser_fn).call(this, first.atomicNumber);
      __privateMethod(this, _ChemLabPeriodicTable_instances, focusElement_fn).call(this, first.atomicNumber);
    });
    /**
     * Handles the grid keys of a cell.
     *
     * Enter and Space activate the cell through the native click of the button
     * wrapper, so only the navigation keys are handled here. A handled key is
     * consumed, which keeps WebWriter's own shortcuts out of the grid; every other
     * key keeps its default and still reaches the editor.
     *
     * @param event - Key event of the cell.
     * @param atomicNumber - Element of the cell.
     */
    __privateAdd(this, _onCellKeydown, (event, atomicNumber) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = gridKeyTarget(atomicNumber, event.key, (value) => __privateGet(this, _matching).has(value));
      if (!target.handled) return;
      event.preventDefault();
      event.stopPropagation();
      if (target.atomicNumber === null) return;
      __privateSet(this, _rovingOverride, target.atomicNumber);
      this.requestUpdate();
      __privateMethod(this, _ChemLabPeriodicTable_instances, focusElement_fn).call(this, target.atomicNumber);
    });
  }
  /**
   * Currently selected atomic number, `null` when nothing is selected.
   *
   * Live property without attribute reflection. Invalid writes are ignored and
   * keep the previous valid selection; a valid write dispatches no event.
   */
  get selectedAtomicNumber() {
    return __privateGet(this, _selection).value;
  }
  set selectedAtomicNumber(value) {
    __privateGet(this, _selection).write(value);
  }
  /** Layout actually rendered: the learner's temporary choice wins over the author default. */
  get effectiveView() {
    return __privateGet(this, _viewOverride) ?? this.view;
  }
  clearInitialElement() {
    this.initialElement = null;
  }
  /**
   * Applies the authored defaults once and follows later author edits.
   *
   * @param changed - Properties changed in this update cycle.
   */
  willUpdate(changed) {
    if (!__privateGet(this, _initialized)) {
      __privateSet(this, _initialized, true);
      __privateGet(this, _selection).initialize(this.initialElement);
    } else if (changed.has("initialElement")) {
      __privateGet(this, _selection).applyAuthored(this.initialElement);
    }
    if (changed.has("view")) __privateSet(this, _viewOverride, null);
  }
  /** Measures the host once and then follows every resize. */
  firstUpdated() {
    __privateMethod(this, _ChemLabPeriodicTable_instances, measure_fn).call(this);
    __privateMethod(this, _ChemLabPeriodicTable_instances, observeLanguage_fn).call(this);
    if (typeof ResizeObserver === "function") {
      __privateSet(this, _resizeObserver, new ResizeObserver(() => __privateMethod(this, _ChemLabPeriodicTable_instances, measure_fn).call(this)));
      __privateGet(this, _resizeObserver).observe(this);
    }
  }
  /** Follows the language of the enclosing content. */
  connectedCallback() {
    super.connectedCallback();
    __privateMethod(this, _ChemLabPeriodicTable_instances, observeLanguage_fn).call(this);
  }
  /** Stops observing the host and the enclosing content. */
  disconnectedCallback() {
    __privateGet(this, _resizeObserver)?.disconnect();
    __privateSet(this, _resizeObserver, null);
    __privateGet(this, _languageObserver)?.disconnect();
    __privateSet(this, _languageObserver, null);
    super.disconnectedCallback();
  }
  /**
   * Restores result focus after a layout change.
   *
   * The element that owned focus is remembered by atomic number, so it survives
   * the switch between the grid and the list. The list renders the selected row
   * as its card, so a remembered selection lands on the card; otherwise the
   * search field and then the layout switch are the stable fallbacks.
   */
  updated() {
    if (!__privateGet(this, _restoreFocusPending)) return;
    __privateSet(this, _restoreFocusPending, false);
    const previous = __privateGet(this, _focusBeforeLayout);
    __privateSet(this, _focusBeforeLayout, null);
    const target = focusTargetAfterLayout(previous, (atomicNumber) => __privateGet(this, _matching).has(atomicNumber));
    const element = target === null ? null : this.renderRoot.querySelector(`[data-atomic-number="${target}"]`);
    if (element) {
      element.focus();
      __privateMethod(this, _ChemLabPeriodicTable_instances, reveal_fn).call(this, element);
      return;
    }
    const card = __privateMethod(this, _ChemLabPeriodicTable_instances, listDetailsCard_fn).call(this);
    if (card) {
      card.focus();
      return;
    }
    const fallback2 = this.renderRoot.querySelector("sl-input") ?? this.renderRoot.querySelector(".toolbar-actions sl-button");
    fallback2?.focus();
  }
  render() {
    const language = __privateGet(this, _ChemLabPeriodicTable_instances, language_get);
    const t7 = strings(language);
    const resolved = __privateGet(this, _ChemLabPeriodicTable_instances, resolvedView_get);
    const matches = __privateMethod(this, _ChemLabPeriodicTable_instances, matches_fn).call(this).filter((match) => {
      const element2 = elementByAtomicNumber(match.atomicNumber);
      return element2 !== void 0 && !cellMode(element2, __privateGet(this, _mode)).hidden;
    });
    const matching = new Set(matches.map((match) => match.atomicNumber));
    __privateSet(this, _matching, resolved === "table" ? __privateMethod(this, _ChemLabPeriodicTable_instances, placeable_fn).call(this) : matching);
    const selected = __privateGet(this, _selection).value;
    const element = selected === null ? null : elementByAtomicNumber(selected) ?? null;
    const details = this.pickerMode ? null : __privateMethod(this, _ChemLabPeriodicTable_instances, renderDetails_fn).call(this, t7, language, element, {
      expanded: resolved === "list" || __privateGet(this, _detailsExpanded),
      collapsible: resolved === "table"
    });
    return x2`
			<div class="widget">
				${this.pickerMode ? E2 : __privateMethod(this, _ChemLabPeriodicTable_instances, renderRibbon_fn).call(this, t7, language, resolved, matches.length)}
				${resolved === "list" ? __privateMethod(this, _ChemLabPeriodicTable_instances, renderList_fn).call(this, t7, language, matches, element, details) : __privateMethod(this, _ChemLabPeriodicTable_instances, renderGrid_fn).call(this, t7, language, matching, details)}
				${this.pickerMode ? E2 : x2`
					${__privateMethod(this, _ChemLabPeriodicTable_instances, renderPrintOverview_fn).call(this, t7, language, element)}
					<sl-icon-button
						class="info-button"
						src=${INFO_ICON}
						label=${t7.infoLabel}
						title=${t7.infoLabel}
						@click=${__privateGet(this, _openInfo)}
					></sl-icon-button>
					${__privateMethod(this, _ChemLabPeriodicTable_instances, renderInfo_fn).call(this, t7, language)}
				`}
			</div>
		`;
  }
};
_init2 = __decoratorStart(_a2);
_initialElement = new WeakMap();
_view = new WeakMap();
_pickerMode = new WeakMap();
_ChemLabPeriodicTable_instances = new WeakSet();
startElementDrag_fn = function(event, atomicNumber) {
  if (!this.pickerMode || !event.isPrimary || event.button !== 0) return;
  this.dispatchEvent(new CustomEvent("chemlab:element-drag", {
    bubbles: true,
    composed: true,
    detail: { atomicNumber, pointerId: event.pointerId, x: event.clientX, y: event.clientY }
  }));
};
_selection = new WeakMap();
_initialized = new WeakMap();
_viewOverride = new WeakMap();
_query = new WeakMap();
_category = new WeakMap();
_width = new WeakMap();
_resizeObserver = new WeakMap();
_languageObserver = new WeakMap();
_matching = new WeakMap();
_rovingOverride = new WeakMap();
_focusBeforeLayout = new WeakMap();
_restoreFocusPending = new WeakMap();
_mode = new WeakMap();
_infoOpen = new WeakMap();
_detailsExpanded = new WeakMap();
_filtersOpen = new WeakMap();
_modesOpen = new WeakMap();
/** Watches every ancestor the language walk visits for a `lang` change. */
observeLanguage_fn = function() {
  __privateGet(this, _languageObserver)?.disconnect();
  __privateSet(this, _languageObserver, null);
  if (typeof MutationObserver !== "function") return;
  const observer = new MutationObserver(() => this.requestUpdate());
  for (const node of languageAncestors(this)) {
    const candidate = node;
    if (candidate?.nodeType !== 1) continue;
    observer.observe(candidate, { attributes: true, attributeFilter: ["lang"] });
  }
  __privateSet(this, _languageObserver, observer);
};
/** Records the host width, which decides the automatic layout. */
measure_fn = function() {
  const width = this.getBoundingClientRect().width;
  if (width <= 0 || width === __privateGet(this, _width)) return;
  const before = __privateGet(this, _ChemLabPeriodicTable_instances, resolvedView_get);
  __privateSet(this, _width, width);
  if (__privateGet(this, _ChemLabPeriodicTable_instances, resolvedView_get) !== before) __privateMethod(this, _ChemLabPeriodicTable_instances, captureResultFocus_fn).call(this);
  this.requestUpdate();
};
/**
 * Remembers which result owns focus before the layout changes.
 *
 * Only a focused result is restored; a click on a toolbar control leaves focus
 * where the user put it.
 */
captureResultFocus_fn = function() {
  const root = this.renderRoot;
  const active = root.activeElement ?? null;
  if (!active) {
    __privateSet(this, _restoreFocusPending, false);
    return;
  }
  const raw = active.dataset?.atomicNumber;
  __privateSet(this, _restoreFocusPending, true);
  __privateSet(this, _focusBeforeLayout, raw ? Number(raw) : null);
};
/**
 * Scrolls a focused result into the widget's own scroll area.
 *
 * @param target - Focused cell or list row.
 */
reveal_fn = function(target) {
  const pane = target.closest(".table-pane");
  if (!pane) return;
  const paneRect = pane.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  if (rect.left < paneRect.left) pane.scrollLeft += rect.left - paneRect.left;
  else if (rect.right > paneRect.right) pane.scrollLeft += rect.right - paneRect.right;
  if (rect.top < paneRect.top) pane.scrollTop += rect.top - paneRect.top;
  else if (rect.bottom > paneRect.bottom) pane.scrollTop += rect.bottom - paneRect.bottom;
};
language_get = function() {
  return resolveLanguage(this);
};
resolvedView_get = function() {
  const view = this.effectiveView;
  if (view !== "auto") return view;
  return __privateGet(this, _width) !== null && __privateGet(this, _width) < LIST_BREAKPOINT ? "list" : "table";
};
temperature_get = function() {
  return __privateGet(this, _mode).temperatureK;
};
/**
 * Atomic numbers of the cells the mode can place.
 *
 * The grid renders these cells and fades the ones the family filter leaves
 * out, so this set is what the keyboard may reach there.
 *
 * @returns The atomic numbers of every cell the grid shows.
 */
placeable_fn = function() {
  const placeable = /* @__PURE__ */ new Set();
  for (const cell of GRID.cells) {
    const element = elementByAtomicNumber(cell.atomicNumber);
    if (element !== void 0 && !cellMode(element, __privateGet(this, _mode)).hidden) {
      placeable.add(cell.atomicNumber);
    }
  }
  return placeable;
};
/**
 * Current search hits, best match first.
 *
 * The query applies to both layouts: the search field sits in the filter
 * panel, which the ribbon opens in either view, so a query narrows the grid
 * and the list alike. The family filter is part of the same call, so the two
 * filters combine instead of replacing each other.
 *
 * @returns The matching elements in display order.
 */
matches_fn = function() {
  return searchElements(__privateGet(this, _query), { locale: __privateGet(this, _ChemLabPeriodicTable_instances, language_get), category: __privateGet(this, _category) });
};
/**
 * Selects an element after a user action and reports the change.
 *
 * A new element starts with the collapsed card: the open card covers the
 * cells below it, so it would hide the table the learner is browsing. The list
 * keeps its card open, but the row that was pressed is gone, so focus moves to
 * the card that replaced it.
 *
 * @param atomicNumber - Atomic number the user picked.
 */
selectFromUser_fn = function(atomicNumber) {
  if (!__privateGet(this, _selection).select(atomicNumber)) return;
  __privateSet(this, _detailsExpanded, false);
  this.requestUpdate();
  __privateMethod(this, _ChemLabPeriodicTable_instances, dispatchSelection_fn).call(this);
  if (__privateGet(this, _ChemLabPeriodicTable_instances, resolvedView_get) === "list" && !this.pickerMode) __privateMethod(this, _ChemLabPeriodicTable_instances, focusDetails_fn).call(this);
};
/** The card that replaced the selected list row, if the list shows one. */
listDetailsCard_fn = function() {
  return this.renderRoot.querySelector(".list-details .details-card");
};
/** Focuses the card that replaced the selected list row. */
focusDetails_fn = function() {
  void this.updateComplete.then(() => __privateMethod(this, _ChemLabPeriodicTable_instances, listDetailsCard_fn).call(this)?.focus());
};
/** Clears the selection after a user action and reports the change. */
clearFromUser_fn = function() {
  if (!__privateGet(this, _selection).clear()) return;
  __privateSet(this, _detailsExpanded, false);
  this.requestUpdate();
  __privateMethod(this, _ChemLabPeriodicTable_instances, dispatchSelection_fn).call(this);
};
_toggleDetails = new WeakMap();
_onDetailsKeydown = new WeakMap();
/** Dispatches the current selection once, composed and bubbling. */
dispatchSelection_fn = function() {
  this.dispatchEvent(new CustomEvent(ELEMENT_SELECTION_EVENT, {
    bubbles: true,
    composed: true,
    detail: elementSelection(__privateGet(this, _selection).value, this.id || void 0)
  }));
};
/**
 * Switches the layout for this session only.
 *
 * @param view - Layout the learner asked for.
 */
setView_fn = function(view) {
  if (__privateGet(this, _ChemLabPeriodicTable_instances, resolvedView_get) === view) return;
  __privateMethod(this, _ChemLabPeriodicTable_instances, captureResultFocus_fn).call(this);
  __privateSet(this, _viewOverride, view);
  this.requestUpdate();
};
/**
 * Toggles the family filter.
 *
 * @param category - Category key the learner pressed.
 */
toggleCategory_fn = function(category) {
  __privateSet(this, _category, __privateGet(this, _category) === category ? null : category);
  this.requestUpdate();
};
/**
 * Switches the property the cells are coloured by.
 *
 * @param mode - Mode the learner pressed.
 */
setMode_fn = function(mode) {
  if (__privateGet(this, _mode).mode === mode) return;
  __privateSet(this, _mode, { ...__privateGet(this, _mode), mode });
  this.requestUpdate();
};
_onTemperatureInput = new WeakMap();
_onYearInput = new WeakMap();
_onRadiusInput = new WeakMap();
_onElectronegativityInput = new WeakMap();
_onIonizationInput = new WeakMap();
_onHalfLifeInput = new WeakMap();
_toggleFilters = new WeakMap();
_toggleModes = new WeakMap();
_openInfo = new WeakMap();
_closeInfo = new WeakMap();
_onInfoHide = new WeakMap();
/**
 * Focuses the cell or list row of an element once it is rendered.
 *
 * @param atomicNumber - Element to focus.
 */
focusElement_fn = function(atomicNumber) {
  void this.updateComplete.then(() => {
    const target = this.renderRoot.querySelector(
      `[data-atomic-number="${atomicNumber}"]`
    );
    target?.focus();
  });
};
/** Clears query, filter, layout override and selection. */
reset_fn = function() {
  __privateSet(this, _query, "");
  __privateSet(this, _category, null);
  __privateSet(this, _viewOverride, null);
  __privateMethod(this, _ChemLabPeriodicTable_instances, clearFromUser_fn).call(this);
  this.requestUpdate();
};
_resetMode = new WeakMap();
_onQueryInput = new WeakMap();
_onSearchKeydown = new WeakMap();
_onCellKeydown = new WeakMap();
/**
 * Picks the single cell that takes part in the tab order.
 *
 * @param matching - Atomic numbers that pass the current filter.
 * @returns The atomic number of the tabbable cell, or `null` when nothing matches.
 */
rovingTarget_fn = function(matching) {
  const selected = __privateGet(this, _selection).value;
  if (selected !== null && matching.has(selected)) return selected;
  const override = __privateGet(this, _rovingOverride);
  if (override !== null && matching.has(override)) return override;
  for (const cell of GRID.cells) {
    if (matching.has(cell.atomicNumber)) return cell.atomicNumber;
  }
  return null;
};
/**
 * Renders the result count line.
 *
 * @param t - Interface strings.
 * @param count - Number of matching elements.
 * @returns The live region text.
 */
renderCount_fn = function(t7, count) {
  if (count === 0) return t7.noResults;
  if (count === 1) return t7.resultCountOne;
  return format(t7.resultCount, { count });
};
/**
 * Renders the ribbon: the two layer toggles with their panels and the layout
 * switch.
 *
 * The ribbon is the only permanently visible band. It carries the filter
 * toggle with the filter panel beside it, the mode toggle with the property
 * panel beside it, and the layout switch on the far right, with a thin divider
 * between the three groups. A panel opens inside the band instead of below it,
 * so the controls stay where the button that opened them is. The band is
 * top-aligned: the buttons keep to the first row while an open panel grows the
 * band downwards, so the extra height sits under the panel alone. The table
 * below keeps its box, because the pane shrinks instead of the widget
 * overflowing.
 *
 * A toggle shows a filled state while its panel is open and a small dot while
 * the panel is closed but still narrows the table, so a hidden filter never
 * looks like no filter at all.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param resolved - Layout actually rendered.
 * @param count - Number of matching elements.
 * @returns The ribbon.
 */
renderRibbon_fn = function(t7, language, resolved, count) {
  const filtersActive = __privateGet(this, _query) !== "" || __privateGet(this, _category) !== null;
  const modesActive = __privateGet(this, _mode).mode !== "off";
  return x2`
			<div class="ribbon">
				<sl-button
					class="ribbon-toggle ${__privateGet(this, _filtersOpen) ? "is-open" : ""} ${filtersActive ? "is-active" : ""}"
					size="small"
					title=${t7.filtersLabel}
					aria-label=${t7.filtersLabel}
					aria-expanded=${__privateGet(this, _filtersOpen)}
					@click=${__privateGet(this, _toggleFilters)}
				>${FILTER_ICON}</sl-button>
				${__privateMethod(this, _ChemLabPeriodicTable_instances, renderFilters_fn).call(this, t7, language, count)}
				<span class="ribbon-divider" role="presentation"></span>
				<sl-button
					class="ribbon-toggle ${__privateGet(this, _modesOpen) ? "is-open" : ""} ${modesActive ? "is-active" : ""}"
					size="small"
					title=${t7.modeLabel}
					aria-label=${t7.modeLabel}
					aria-expanded=${__privateGet(this, _modesOpen)}
					@click=${__privateGet(this, _toggleModes)}
				>${MODE_ICON}</sl-button>
				${__privateMethod(this, _ChemLabPeriodicTable_instances, renderModes_fn).call(this, t7, language)}
				<span class="ribbon-divider" role="presentation"></span>
				<div class="views" role="group" aria-label=${t7.viewLabel}>
					<sl-button
						size="small"
						variant=${resolved === "table" ? "primary" : "default"}
						title=${t7.viewTable}
						aria-label=${t7.viewTable}
						aria-pressed=${resolved === "table"}
						@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, setView_fn).call(this, "table")}
					>${TABLE_ICON}</sl-button>
					<sl-button
						size="small"
						variant=${resolved === "list" ? "primary" : "default"}
						title=${t7.viewList}
						aria-label=${t7.viewList}
						aria-pressed=${resolved === "list"}
						@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, setView_fn).call(this, "list")}
					>${LIST_ICON}</sl-button>
				</div>
			</div>
		`;
};
/**
 * Renders the filter panel beside the first ribbon toggle.
 *
 * The panel holds the two controls that narrow the table, in the order they
 * are read: the search field with the reset beside it, then the family
 * carousel with the result count. Search and family filter combine, and both
 * apply to the grid and the list alike, because the panel is the same in both
 * layouts. The families are a Shoelace carousel of tags instead of a dropdown
 * plus a legend, because the tags double as the filter and the strip stays one
 * band at every width. It names itself through a hidden label instead of an
 * attribute, because the carousel writes its own generic label when it
 * connects. The reset sits outside the carousel, so it never scrolls out of
 * reach. The result count is a pill badge, and a hidden live region keeps the
 * full sentence for screen readers.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param count - Number of matching elements.
 * @returns The filter panel, or nothing while it is closed.
 */
renderFilters_fn = function(t7, language, count) {
  if (!__privateGet(this, _filtersOpen)) return null;
  const countText = __privateMethod(this, _ChemLabPeriodicTable_instances, renderCount_fn).call(this, t7, count);
  return x2`
			<div class="ribbon-panel filters">
				<div class="panel-row">
					<sl-input
						class="search"
						type="search"
						size="small"
						clearable
						label=${t7.searchLabel}
						placeholder=${t7.searchPlaceholder}
						.value=${__privateGet(this, _query)}
						@sl-input=${__privateGet(this, _onQueryInput)}
						@keydown=${__privateGet(this, _onSearchKeydown)}
					></sl-input>
					<sl-button
						class="reset"
						size="small"
						title=${t7.reset}
						aria-label=${t7.reset}
						@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, reset_fn).call(this)}
					>${RESET_ICON}</sl-button>
				</div>
				<div class="panel-row">
					<span class="visually-hidden" id="family-strip-label">${t7.legendLabel}</span>
					<sl-carousel
						class="family-strip"
						navigation
						mouse-dragging
						slides-per-page="4"
						slides-per-move="1"
						aria-labelledby="family-strip-label"
					>
						${Object.entries(CATEGORIES).map(([key, category]) => x2`
							<sl-carousel-item>
								<button
									class="family-tag category-${key}"
									type="button"
									aria-pressed=${__privateGet(this, _category) === key}
									@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, toggleCategory_fn).call(this, key)}
								>
									<span class="family-swatch"></span>${category[language]}
								</button>
							</sl-carousel-item>
						`)}
						<span slot="previous-icon">${CAROUSEL_PREVIOUS_ICON}</span>
						<span slot="next-icon">${CAROUSEL_NEXT_ICON}</span>
					</sl-carousel>
					<sl-badge class="count-badge" pill variant="neutral" title=${countText}>
						${count}
					</sl-badge>
					<p class="visually-hidden" role="status" aria-live="polite">${countText}</p>
				</div>
			</div>
		`;
};
/**
 * Describes the slider of the active mode.
 *
 * Every mode reads its slider as a threshold and states the direction in the
 * readout, so the number alone cannot be misread: the radius keeps the elements
 * up to the value, the other three keep the ones from it upwards.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @returns Bounds, value, readout and handler of the slider, or `null` when no mode is active.
 */
slider_fn = function(t7, language) {
  switch (__privateGet(this, _mode).mode) {
    case "off":
      return null;
    case "temperature":
      return {
        label: t7.temperatureSlider,
        min: TEMPERATURE_SLIDER.minCelsius,
        max: TEMPERATURE_SLIDER.maxCelsius,
        step: TEMPERATURE_SLIDER.stepCelsius,
        value: celsiusFromKelvin(__privateGet(this, _mode).temperatureK),
        readout: celsiusText(__privateGet(this, _mode).temperatureK, language),
        onInput: __privateGet(this, _onTemperatureInput)
      };
    case "discovery":
      return {
        label: t7.yearSlider,
        min: DISCOVERY_RANGE.min,
        max: DISCOVERY_RANGE.max,
        step: 1,
        value: __privateGet(this, _mode).year,
        readout: String(__privateGet(this, _mode).year),
        onInput: __privateGet(this, _onYearInput)
      };
    case "radius":
      return {
        label: t7.radiusSlider,
        min: RADIUS_RANGE.min,
        max: RADIUS_RANGE.max,
        step: 1,
        value: __privateGet(this, _mode).radiusPm,
        readout: `\u2264 ${numberText(__privateGet(this, _mode).radiusPm, language)}\xA0pm`,
        onInput: __privateGet(this, _onRadiusInput)
      };
    case "electronegativity":
      return {
        label: t7.electronegativitySlider,
        min: ELECTRONEGATIVITY_RANGE.min,
        max: ELECTRONEGATIVITY_RANGE.max,
        step: 0.01,
        value: __privateGet(this, _mode).electronegativity,
        readout: `\u2265 ${numberText(__privateGet(this, _mode).electronegativity, language)}`,
        onInput: __privateGet(this, _onElectronegativityInput)
      };
    case "ionization":
      return {
        label: t7.ionizationSlider,
        min: IONIZATION_RANGE.min,
        max: IONIZATION_RANGE.max,
        step: 0.01,
        value: __privateGet(this, _mode).ionizationEv,
        readout: `\u2265 ${numberText(__privateGet(this, _mode).ionizationEv, language)}\xA0eV`,
        onInput: __privateGet(this, _onIonizationInput)
      };
    case "halfLife":
      return {
        label: t7.halfLifeSlider,
        min: HALF_LIFE_RANGE.min,
        max: HALF_LIFE_RANGE.max,
        step: 0.1,
        value: __privateGet(this, _mode).halfLifeLogSeconds,
        readout: `\u2265 ${halfLifeText(10 ** __privateGet(this, _mode).halfLifeLogSeconds, language, 2)}`,
        onInput: __privateGet(this, _onHalfLifeInput)
      };
  }
};
/**
 * Renders the property panel beside the second ribbon toggle.
 *
 * The panel decides what the cells are coloured by: the state at the chosen
 * temperature, whether the element was already known in the chosen year, or
 * one of the four numeric properties. The modes sit in a carousel of chips, so
 * the row stays one band while the list of modes grows, and the slider of the
 * active mode sits underneath it with its value as a tag. The slider is a
 * native range input: it needs no component registration, keeps the keyboard
 * and touch behaviour of the platform, and cannot fall back to plain text when
 * a Shoelace build is missing. The legend of the temperature mode shares the
 * last row, because a row of its own would cost the table the height of one
 * period.
 *
 * The strip carries no `off` chip. The reset beside it is the way back to the
 * plain table, in the same place and the same treatment as the reset beside
 * the search, so both panels clear their own state with one button at the end
 * of their row instead of a chip that scrolls away with the modes.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @returns The property panel, or nothing while it is closed.
 */
renderModes_fn = function(t7, language) {
  if (!__privateGet(this, _modesOpen)) return null;
  const slider = __privateMethod(this, _ChemLabPeriodicTable_instances, slider_fn).call(this, t7, language);
  return x2`
			<div class="ribbon-panel modes">
				<div class="panel-row">
					<span class="visually-hidden" id="mode-strip-label">${t7.modeLabel}</span>
					<sl-carousel
						class="mode-strip"
						navigation
						mouse-dragging
						slides-per-page="4"
						slides-per-move="1"
						aria-labelledby="mode-strip-label"
					>
						${MODE_CHOICES.map((mode) => x2`
							<sl-carousel-item>
								<button
									class="mode-tag ${__privateGet(this, _mode).mode === mode ? "is-active" : ""}"
									type="button"
									aria-pressed=${__privateGet(this, _mode).mode === mode}
									@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, setMode_fn).call(this, mode)}
								>${modeText(mode, t7)}</button>
							</sl-carousel-item>
						`)}
						<span slot="previous-icon">${CAROUSEL_PREVIOUS_ICON}</span>
						<span slot="next-icon">${CAROUSEL_NEXT_ICON}</span>
					</sl-carousel>
					<sl-button
						class="reset"
						size="small"
						title=${t7.resetMode}
						aria-label=${t7.resetMode}
						@click=${__privateGet(this, _resetMode)}
					>${RESET_ICON}</sl-button>
				</div>
				${slider ? x2`
						<div class="mode-slider">
							<input
								class="mode-range"
								type="range"
								min=${slider.min}
								max=${slider.max}
								step=${slider.step}
								.value=${String(slider.value)}
								aria-label=${slider.label}
								@input=${slider.onInput}
							/>
							<sl-tag class="mode-value" size="small" variant="neutral">${slider.readout}</sl-tag>
						</div>
					` : null}
				${__privateMethod(this, _ChemLabPeriodicTable_instances, renderStateLegend_fn).call(this, t7)}
			</div>
		`;
};
/**
 * Renders the colour key of the temperature mode.
 *
 * @param t - Interface strings.
 * @returns The legend, or nothing while the temperature mode is off.
 */
renderStateLegend_fn = function(t7) {
  if (__privateGet(this, _mode).mode !== "temperature") return null;
  return x2`
			<ul class="state-legend" aria-label=${t7.stateLegend}>
				${STATES.map((state) => x2`
					<li>
						<span class="state-swatch state-${state}"></span>${stateText(state, t7)}
					</li>
				`)}
			</ul>
		`;
};
/**
 * Renders one element cell of the grid.
 *
 * A cell the family filter does not match stays in place and fades instead of
 * disappearing: the table keeps its shape, so the learner still reads where
 * the family sits. Only a mode that cannot place an element removes its cell,
 * because a state or a year the model does not know would read as a value.
 *
 * @param cell - Cell of the display grid.
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param roving - Atomic number of the tabbable cell.
 * @param faded - Whether the family filter leaves the cell out.
 * @returns The grid cell.
 */
renderCell_fn = function(cell, t7, language, roving, faded) {
  const element = elementByAtomicNumber(cell.atomicNumber);
  if (!element) return null;
  const selected = __privateGet(this, _selection).value === cell.atomicNumber;
  const displayRow = cell.section === "main" ? cell.row + 1 : cell.row + 2;
  const mode = cellMode(element, __privateGet(this, _mode), language);
  const state = mode.state === null ? null : stateText(mode.state, t7);
  const note = state ?? (mode.badge === null ? null : `${modeText(__privateGet(this, _mode).mode, t7)} ${mode.badge}`);
  const classes = ["cell", `category-${cell.category}`];
  if (mode.state !== null) classes.push(`state-${mode.state}`);
  if (faded) classes.push("is-faded");
  const label = format(t7.cellLabel, {
    number: element.atomicNumber,
    name: element.names[language],
    symbol: element.symbol,
    category: categoryText(element, language)
  }) + (note === null ? "" : ` \xB7 ${note}`);
  return x2`
			<div
				class=${classes.join(" ")}
				role="gridcell"
				aria-selected=${selected}
				aria-label=${label}
				tabindex=${cell.atomicNumber === roving ? 0 : -1}
				data-atomic-number=${cell.atomicNumber}
				style="--pt-row:${displayRow};--pt-column:${cell.column + 1}"
				@pointerdown=${(event) => __privateMethod(this, _ChemLabPeriodicTable_instances, startElementDrag_fn).call(this, event, cell.atomicNumber)}
				@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, selectFromUser_fn).call(this, cell.atomicNumber)}
				@keydown=${(event) => __privateGet(this, _onCellKeydown).call(this, event, cell.atomicNumber)}
			>
				<span class="cell-number">${cell.atomicNumber}</span>
				<span class="cell-symbol">${element.symbol}</span>
				<span class="cell-name">${element.names[language]}</span>
				${mode.badge === null ? null : x2`<span class="cell-year">${mode.badge}</span>`}
			</div>
		`;
};
/**
 * Renders the table layout.
 *
 * The detail card is a grid item of the table itself: it sits in the free block
 * above the transition metals, so the selection is read inside the table
 * instead of in a second column beside it. The card takes only the height of
 * its content, so the block keeps its own size and the periods around it never
 * stretch.
 *
 * Every cell the mode can place is rendered; the family filter only fades the
 * cells it leaves out, so the table keeps its shape while the filter is on.
 * The series labels and the placeholder cards belong to the detached rows and
 * fade with them, because they name the same family.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param matching - Atomic numbers that pass the current filter.
 * @param details - Rendered detail card.
 * @returns The grid with group labels, period gutter, placeholders and series rows.
 */
renderGrid_fn = function(t7, language, matching, details) {
  const roving = __privateMethod(this, _ChemLabPeriodicTable_instances, rovingTarget_fn).call(this, matching);
  const fadedCategory = (category) => __privateGet(this, _category) !== null && __privateGet(this, _category) !== category;
  const groupLabels = Array.from({ length: GRID.columns }, (_3, index) => x2`
			<div
				class="group-label"
				role="columnheader"
				style="--pt-row:1;--pt-column:${index + 2}"
			>${index + 1}</div>
		`);
  const cells = (row) => row.cells.map(
    (cell) => __privateMethod(this, _ChemLabPeriodicTable_instances, renderCell_fn).call(this, cell, t7, language, roving, !matching.has(cell.atomicNumber))
  );
  const mainRows = GRID.rows.filter((row) => row.section === "main").map((row) => x2`
				<div class="grid-row" role="row">
					<div
						class="gutter"
						role="rowheader"
						style="--pt-row:${row.row + 1};--pt-column:1"
					>${row.row}</div>
					${cells(row)}
				</div>
			`);
  const placeholders = GRID.placeholders.map((placeholder) => {
    const series = GRID.seriesRows.find((entry) => entry.row === placeholder.seriesRow);
    const text = series ? format(t7.placeholderLabel, {
      first: series.firstAtomicNumber,
      last: series.lastAtomicNumber
    }) : "";
    const faded = fadedCategory(placeholder.category) ? " is-faded" : "";
    return x2`
				<div
					class="placeholder category-${placeholder.category}${faded}"
					style="--pt-row:${placeholder.row + 1};--pt-column:${placeholder.column + 1}"
				>
					<span class="placeholder-text">${text}</span>
				</div>
			`;
  });
  const seriesRows = GRID.rows.filter((row) => row.section === "series").map((row) => {
    const series = GRID.seriesRows.find((entry) => entry.row === row.row);
    const name = series ? CATEGORIES[series.category]?.[language] ?? series.category : "";
    const faded = series && fadedCategory(series.category) ? " is-faded" : "";
    return x2`
					<div class="grid-row" role="row">
						<div
							class="series-header${faded}"
							role="rowheader"
							style="--pt-row:${row.row + 2};--pt-column:1 / span 3"
						>${name}</div>
						${cells(row)}
					</div>
				`;
  });
  return x2`
			<div class="table-pane">
				<div class="grid" role="grid" aria-label=${t7.gridLabel}>
					<div class="grid-row" role="row">
						<div class="gutter" role="columnheader" style="--pt-row:1;--pt-column:1"></div>
						${groupLabels}
					</div>
					${mainRows}
					${placeholders}
					${seriesRows}
					<div class="grid-row" role="row">
						<div
							class="details-slot"
							role="gridcell"
							style="--pt-row:${DETAIL_SLOT.row + 1};--pt-row-span:${DETAIL_SLOT.rowSpan};--pt-column:${DETAIL_SLOT.column + 1};--pt-column-span:${DETAIL_SLOT.columnSpan}"
						>${details}</div>
					</div>
				</div>
			</div>
		`;
};
/**
 * Renders the list layout with the detail card in place of the selected row.
 *
 * The card is always open here: the list has room for it, and a collapsed card
 * would only repeat the row it replaces. Rendering it instead of the row keeps
 * the identity of the element in one place, so the row and the card never show
 * the same name twice in two different styles. A selection the mode hides has
 * no row left, so its card moves to the top of the list.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param matches - Search hits in display order.
 * @param element - Selected element, or `null` when nothing is selected.
 * @param details - Rendered detail card.
 * @returns The list.
 */
renderList_fn = function(t7, language, matches, element, details) {
  const selected = __privateGet(this, _selection).value;
  const selectedVisible = matches.some((match) => match.atomicNumber === selected);
  const rows = matches.map((match) => {
    const entry = elementByAtomicNumber(match.atomicNumber);
    if (!entry) return null;
    if (!this.pickerMode && match.atomicNumber === selected) return x2`<li class="list-details">${details}</li>`;
    const mode = cellMode(entry, __privateGet(this, _mode), __privateGet(this, _ChemLabPeriodicTable_instances, language_get));
    return x2`
				<li>
					<button
						class="list-row category-${categoryOf(entry.atomicNumber) ?? "unknown"}"
						type="button"
						data-atomic-number=${entry.atomicNumber}
						aria-pressed=${match.atomicNumber === selected}
						@pointerdown=${(event) => __privateMethod(this, _ChemLabPeriodicTable_instances, startElementDrag_fn).call(this, event, entry.atomicNumber)}
						@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, selectFromUser_fn).call(this, entry.atomicNumber)}
					>
						<span class="list-number">${entry.atomicNumber}</span>
						<span class="list-symbol">${entry.symbol}</span>
						<span class="list-name">${entry.names[language]}</span>
						${this.pickerMode ? E2 : x2`<span class="list-category">${categoryText(entry, language)}</span>`}
						${mode.state === null ? mode.badge === null ? null : x2`<sl-tag class="list-year" size="small" variant="neutral">${mode.badge}</sl-tag>` : x2`
							<sl-tag class="state-tag list-state state-${mode.state}" size="small" variant="neutral">
								${stateText(mode.state, t7)}
							</sl-tag>
						`}
					</button>
				</li>
			`;
  });
  return x2`
			<div class="table-pane">
				<ul class="list" aria-label=${t7.gridLabel}>
					${!this.pickerMode && element !== null && !selectedVisible ? x2`<li class="list-details">${details}</li>` : null}
					${rows}
				</ul>
			</div>
		`;
};
/**
 * Renders the print-only overview.
 *
 * The overview is always in the DOM and hidden on screen, so both author
 * layouts print the same complete grid and the selected details. It carries no
 * interactive element and is hidden from assistive technology, because the
 * screen layout already exposes the same content.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param element - Selected element, or `null` for the empty card.
 * @returns The print overview.
 */
renderPrintOverview_fn = function(t7, language, element) {
  const groupLabels = Array.from({ length: GRID.columns }, (_3, index) => x2`
			<div class="print-group" style="--pt-row:1;--pt-column:${index + 2}">${index + 1}</div>
		`);
  const periodLabels = Array.from({ length: GRID.periodRows }, (_3, index) => x2`
			<div class="print-gutter" style="--pt-row:${index + 2};--pt-column:1">${index + 1}</div>
		`);
  const cells = GRID.cells.map((cell) => {
    const entry = elementByAtomicNumber(cell.atomicNumber);
    if (!entry) return null;
    const displayRow = cell.section === "main" ? cell.row + 1 : cell.row + 2;
    return x2`
				<div
					class="print-cell category-${cell.category}"
					style="--pt-row:${displayRow};--pt-column:${cell.column + 1}"
				>
					<span class="print-number">${cell.atomicNumber}</span>
					<span class="print-symbol">${entry.symbol}</span>
				</div>
			`;
  });
  const placeholders = GRID.placeholders.map((placeholder) => x2`
			<div
				class="print-placeholder category-${placeholder.category}"
				style="--pt-row:${placeholder.row + 1};--pt-column:${placeholder.column + 1}"
			></div>
		`);
  const seriesLabels = GRID.seriesRows.map((series) => x2`
			<div
				class="print-series"
				style="--pt-row:${series.row + 2};--pt-column:1 / span 3"
			>${CATEGORIES[series.category]?.[language] ?? series.category}</div>
		`);
  const rows = element ? detailRows(element, language, __privateGet(this, _ChemLabPeriodicTable_instances, temperature_get)) : [];
  return x2`
			<div class="print-overview" aria-hidden="true">
				<h2 class="print-title">${t7.widgetLabel}</h2>
				<div class="print-grid">
					<div class="print-gutter" style="--pt-row:1;--pt-column:1"></div>
					${groupLabels}
					${periodLabels}
					${cells}
					${placeholders}
					${seriesLabels}
				</div>
				<div class="print-details">
					${element ? x2`
							<h3>${element.symbol} · ${element.names[language]}</h3>
							<dl class="print-fields">
								${rows.map((row) => x2`
									<div>
										<dt>${row.label}</dt>
										<dd>${row.value}${row.qualifier ? ` (${row.qualifier})` : ""}</dd>
									</div>
								`)}
							</dl>
							<p class="print-hint">${t7.detailsHint} ${conditionsText(language, __privateGet(this, _ChemLabPeriodicTable_instances, temperature_get))}</p>
						` : x2`<p class="print-hint">${t7.detailsEmpty}</p>`}
				</div>
			</div>
		`;
};
/**
 * Renders the detail card of one element.
 *
 * The card is a Shoelace card, so it shares the surface and the border of the
 * rest of the widget. Its header carries the identity of the element in one
 * row. Below it the card shows the key rows — the weight and the answer of the
 * current mode — and stops there: the free block of the table is only three
 * rows tall, and a card that grew with its content would stretch the periods
 * around it. The toggle in the corner opens the rest as an overlay above the
 * cells. The list passes `collapsible: false`, because its card replaces the
 * selected row and has the room to stay open.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param element - Selected element, or `null` for the empty card.
 * @param options - Whether the card can collapse and whether it is open.
 * @returns The detail card with its shell.
 */
renderDetails_fn = function(t7, language, element, options) {
  if (!element) {
    return x2`
				<div class="details-shell">
					<sl-card class="details-card details-card-empty" tabindex="-1">
						<div class="details-empty">
							<sl-icon class="details-empty-icon" src=${POINTER_ICON}></sl-icon>
							<p>${t7.detailsEmpty}</p>
						</div>
					</sl-card>
				</div>
			`;
  }
  const rows = detailRows(element, language, __privateGet(this, _ChemLabPeriodicTable_instances, temperature_get));
  const key = keyRows(rows, __privateGet(this, _mode).mode);
  const rest = rows.filter((row) => !key.includes(row));
  const name = element.names[language];
  const expanded = options.expanded;
  const open = options.collapsible && expanded;
  return x2`
			<div
				class="details-shell ${open ? "is-expanded" : ""}"
				@keydown=${__privateGet(this, _onDetailsKeydown)}
			>
				<sl-card
					class="details-card category-${categoryOf(element.atomicNumber) ?? "unknown"}"
					tabindex="-1"
				>
					<div slot="header" class="details-head">
						<span class="details-thumb">${element.symbol}</span>
						<h5 class="details-title" title=${name}>${name}</h5>
						<sl-badge class="details-number" variant="neutral" pill>
							${element.atomicNumber}
						</sl-badge>
						<sl-tag class="details-family" size="small" variant="neutral">
							${categoryText(element, language)}
						</sl-tag>
						<sl-tooltip content=${t7.detailsHint} hoist>
							<span class="details-conditions">${conditionsText(language, __privateGet(this, _ChemLabPeriodicTable_instances, temperature_get))}</span>
						</sl-tooltip>
					</div>
					<div class="details-body">
						<dl class="details-rows details-key">
							${key.map((row) => __privateMethod(this, _ChemLabPeriodicTable_instances, renderDetailRow_fn).call(this, t7, row))}
						</dl>
						${expanded ? x2`<div class="details-more">${__privateMethod(this, _ChemLabPeriodicTable_instances, renderDetailSections_fn).call(this, t7, rest)}</div>` : null}
					</div>
				</sl-card>
				${options.collapsible ? x2`
						<sl-button
							class="details-toggle"
							size="small"
							title=${expanded ? t7.detailsCollapse : t7.detailsExpand}
							aria-label=${expanded ? t7.detailsCollapse : t7.detailsExpand}
							aria-expanded=${expanded}
							@click=${__privateGet(this, _toggleDetails)}
						>${CHEVRON_ICON}</sl-button>
					` : null}
			</div>
		`;
};
/**
 * Renders the sections the expanded card adds.
 *
 * A section without a row is dropped, which keeps the card free of empty
 * headings: the state row moves into the key rows in the temperature mode and
 * the discovery row in the discovery mode, so the section it came from can
 * become empty.
 *
 * @param t - Interface strings.
 * @param rows - Rows the key rows do not already show.
 * @returns The sections in display order.
 */
renderDetailSections_fn = function(t7, rows) {
  return DETAIL_SECTIONS.map((entry) => {
    const own = rows.filter((row) => row.section === entry.section);
    if (own.length === 0) return null;
    return x2`
				<section class="details-section details-section-${entry.section}">
					<sl-tag class="details-heading" size="small" variant="neutral">
						${t7[entry.label]}
					</sl-tag>
					<dl class="details-rows">
						${own.map((row) => __privateMethod(this, _ChemLabPeriodicTable_instances, renderDetailRow_fn).call(this, t7, row))}
					</dl>
				</section>
			`;
  });
};
/**
 * Renders one row of the detail card.
 *
 * The state value is a tag in the colour of the state, so the value is legible
 * at a glance. A predicted value carries a badge instead of a bare word, and
 * the badge explains itself in a tooltip, so the card stays short without
 * hiding what the qualifier means.
 *
 * @param t - Interface strings.
 * @param row - Row to render.
 * @returns The row.
 */
renderDetailRow_fn = function(t7, row) {
  return x2`
			<div class="details-row">
				<dt>${row.label}</dt>
				<dd>
					${row.swatch ? x2`
							<sl-tag
								class="state-tag state-${row.swatch}"
								size="small"
								variant="neutral"
							>
								${row.value}
							</sl-tag>
						` : x2`<span>${row.value}</span>`}
					${row.qualifier ? x2`
							<sl-tooltip content=${t7.qualifierHint} hoist>
								<sl-badge class="details-qualifier" variant="neutral" pill>
									${row.qualifier}
								</sl-badge>
							</sl-tooltip>
						` : null}
				</dd>
			</div>
		`;
};
/**
 * Renders the info dialog with the sources and the model notes.
 *
 * The sources are global, not per element, so they sit behind one button in
 * the toolbar instead of in the detail card. Each source carries its release
 * as a badge and its licence and retrieval date as tags, which keeps the
 * block scannable while the attribution and the URL stay in running text.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @returns The dialog, closed unless the info button was pressed.
 */
renderInfo_fn = function(t7, language) {
  return x2`
			<sl-dialog
				class="info"
				label=${t7.infoLabel}
				?open=${__privateGet(this, _infoOpen)}
				@sl-after-hide=${__privateGet(this, _onInfoHide)}
			>
				<p class="info-intro">${t7.infoIntro}</p>
				<section class="info-section">
					<h3>${t7.infoSources}</h3>
					${sourceList().map((source) => x2`
						<article class="info-source">
							<p class="info-source-title">${source.publisher} — ${source.title}</p>
							<div class="info-source-meta">
								<sl-badge variant="neutral" pill>
									${format(t7.sourceRelease, { release: source.release })}
								</sl-badge>
								<sl-tag size="small" variant="neutral">
									${format(t7.sourceLicense, { license: source.license })}
								</sl-tag>
								<sl-tag size="small" variant="neutral">
									${format(t7.sourceRetrieved, { retrieved: source.retrieved })}
								</sl-tag>
							</div>
							<p class="info-source-text">
								${t7.infoFields}: ${source.fields.map((field) => sourceFieldText(field, t7)).join(", ")}
							</p>
							<p class="info-source-text">${source.attribution}</p>
							<a
								class="info-source-link"
								href=${source.url}
								target="_blank"
								rel="noreferrer noopener"
							>${source.url}</a>
						</article>
					`)}
				</section>
				<section class="info-section">
					<h3>${t7.infoNotes}</h3>
					<p class="info-note">
						${format(t7.infoConditions, { conditions: conditionsText(language) })}
					</p>
					<p class="info-note">${t7.infoPhaseModel}</p>
					<p class="info-note">${t7.infoDiscovery}</p>
				</section>
				<sl-button slot="footer" variant="primary" @click=${__privateGet(this, _closeInfo)}>
					${t7.infoClose}
				</sl-button>
			</sl-dialog>
		`;
};
__decorateElement(_init2, 4, "initialElement", _initialElement_dec, _ChemLabPeriodicTable, _initialElement);
__decorateElement(_init2, 4, "view", _view_dec, _ChemLabPeriodicTable, _view);
__decorateElement(_init2, 4, "pickerMode", _pickerMode_dec, _ChemLabPeriodicTable, _pickerMode);
__decorateElement(_init2, 1, "clearInitialElement", _clearInitialElement_dec, _ChemLabPeriodicTable);
__decoratorMetadata(_init2, _ChemLabPeriodicTable);
/**
 * Shoelace components used inside the shadow root.
 *
 * `LitElementWw` renders through a scoped custom element registry, so a tag
 * that is missing here stays an unknown element: the toolbar would show the
 * bare text of its buttons and options instead of the controls. The entries
 * also keep the component modules in the bundle, because the imports are
 * otherwise unused and get tree-shaken away. The list includes the elements
 * the components use in their own templates, because a scoped registry does
 * not inherit them from the global one.
 */
__publicField(_ChemLabPeriodicTable, "scopedElements", {
  "sl-badge": SlBadge,
  "sl-button": SlButton,
  "sl-card": SlCard,
  "sl-carousel": SlCarousel,
  "sl-carousel-item": SlCarouselItem,
  "sl-dialog": SlDialog,
  "sl-divider": SlDivider,
  "sl-icon": SlIcon,
  "sl-icon-button": SlIconButton,
  "sl-input": SlInput,
  "sl-popup": SlPopup,
  "sl-spinner": SlSpinner,
  "sl-tag": SlTag,
  "sl-tooltip": SlTooltip
});
__publicField(_ChemLabPeriodicTable, "optionGroups", {
  content: { label: { _: "Content", "de-DE": "Inhalt" }, collapsible: true, advanced: false },
  appearance: { label: { _: "Appearance", "de-DE": "Darstellung" }, collapsible: true, advanced: false }
});
__publicField(_ChemLabPeriodicTable, "options", {
  initialElement: {
    type: "number",
    group: "content",
    attribute: "initial-element",
    label: { _: "Initial element (atomic number)", "de-DE": "Startelement (Ordnungszahl)" },
    description: {
      _: "Atomic number from 1 to 118. Leave empty for no initial selection.",
      "de-DE": "Ordnungszahl von 1 bis 118. Leer lassen f\xFCr keine Vorauswahl."
    },
    min: 1,
    max: 118,
    step: 1
  },
  view: {
    type: "select",
    group: "appearance",
    label: { _: "Layout", "de-DE": "Darstellung" },
    options: [
      { value: "auto", label: { _: "Automatic", "de-DE": "Automatisch" } },
      { value: "table", label: { _: "Table", "de-DE": "Tabelle" } },
      { value: "list", label: { _: "List", "de-DE": "Liste" } }
    ]
  }
});
/**
 * Registers the live selection as a reactive property without an attribute.
 *
 * The accessor pair below is declared on the prototype, so Lit wraps it and
 * keeps a value that a host wrote before the element upgraded.
 */
__publicField(_ChemLabPeriodicTable, "properties", {
  selectedAtomicNumber: { attribute: false }
});
__publicField(_ChemLabPeriodicTable, "styles", periodicTableStyles);
var ChemLabPeriodicTable = _ChemLabPeriodicTable;
if (!customElements.get("webwriter-chemlab-periodic-table")) {
  customElements.define("webwriter-chemlab-periodic-table", ChemLabPeriodicTable);
}
export {
  ChemLabPeriodicTable,
  LIST_ICON,
  TABLE_ICON
};
/*! Bundled license information:

@webwriter/lit/index.js:
  (*! Bundled license information:
  
  @lit/reactive-element/css-tag.js:
    (**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/reactive-element.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  lit-html/lit-html.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  lit-element/lit-element.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  lit-html/is-server.js:
    (**
     * @license
     * Copyright 2022 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/custom-element.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/property.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/state.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/event-options.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/base.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/query.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/query-all.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/query-async.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/query-assigned-elements.js:
    (**
     * @license
     * Copyright 2021 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  
  @lit/reactive-element/decorators/query-assigned-nodes.js:
    (**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     *)
  *)

@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/reactive-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
lit-html/directives/map.js:
lit-html/directives/range.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
lit-html/static.js:
lit-html/directives/live.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
