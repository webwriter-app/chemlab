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
  for (var i6 = 0, fns = array[flags >> 1], n9 = fns && fns.length; i6 < n9; i6++) flags & 1 ? fns[i6].call(self) : value = fns[i6].call(self, value);
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
  for (var i6 = decorators.length - 1; i6 >= 0; i6--) {
    ctx = __decoratorContext(k3, name, done = {}, array[3], extraInitializers);
    if (k3) {
      ctx.static = s4, ctx.private = p4, access = ctx.access = { has: p4 ? (x3) => __privateIn(target, x3) : (x3) => name in x3 };
      if (k3 ^ 3) access.get = p4 ? (x3) => (k3 ^ 1 ? __privateGet : __privateMethod)(x3, target, k3 ^ 4 ? extra : desc.get) : (x3) => x3[name];
      if (k3 > 2) access.set = p4 ? (x3, y4) => __privateSet(x3, target, y4, k3 ^ 4 ? extra : desc.set) : (x3, y4) => x3[name] = y4;
    }
    it = (0, decorators[i6])(k3 ? k3 < 4 ? p4 ? extra : desc[key] : k3 > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
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
    set registry(registry) {
      this.constructor.__registry = registry;
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

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t2 = (t5) => (e7, o8) => {
  void 0 !== o8 ? o8.addInitializer((() => {
    customElements.define(t5, e7);
  })) : customElements.define(t5, e7);
};

// node_modules/@lit/reactive-element/css-tag.js
var t3 = globalThis;
var e3 = t3.ShadowRoot && (void 0 === t3.ShadyCSS || t3.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s2 = Symbol();
var o4 = /* @__PURE__ */ new WeakMap();
var n5 = class {
  constructor(t5, e7, o8) {
    if (this._$cssResult$ = true, o8 !== s2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t5, this.t = e7;
  }
  get styleSheet() {
    let t5 = this.o;
    const s4 = this.t;
    if (e3 && void 0 === t5) {
      const e7 = void 0 !== s4 && 1 === s4.length;
      e7 && (t5 = o4.get(s4)), void 0 === t5 && ((this.o = t5 = new CSSStyleSheet()).replaceSync(this.cssText), e7 && o4.set(s4, t5));
    }
    return t5;
  }
  toString() {
    return this.cssText;
  }
};
var r4 = (t5) => new n5("string" == typeof t5 ? t5 : t5 + "", void 0, s2);
var i = (t5, ...e7) => {
  const o8 = 1 === t5.length ? t5[0] : e7.reduce(((e8, s4, o9) => e8 + ((t6) => {
    if (true === t6._$cssResult$) return t6.cssText;
    if ("number" == typeof t6) return t6;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t6 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t5[o9 + 1]), t5[0]);
  return new n5(o8, t5, s2);
};
var S3 = (s4, o8) => {
  if (e3) s4.adoptedStyleSheets = o8.map(((t5) => t5 instanceof CSSStyleSheet ? t5 : t5.styleSheet));
  else for (const e7 of o8) {
    const o9 = document.createElement("style"), n9 = t3.litNonce;
    void 0 !== n9 && o9.setAttribute("nonce", n9), o9.textContent = e7.cssText, s4.appendChild(o9);
  }
};
var c4 = e3 ? (t5) => t5 : (t5) => t5 instanceof CSSStyleSheet ? ((t6) => {
  let e7 = "";
  for (const s4 of t6.cssRules) e7 += s4.cssText;
  return r4(e7);
})(t5) : t5;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i3, defineProperty: e4, getOwnPropertyDescriptor: r5, getOwnPropertyNames: h4, getOwnPropertySymbols: o5, getPrototypeOf: n6 } = Object;
var a2 = globalThis;
var c5 = a2.trustedTypes;
var l2 = c5 ? c5.emptyScript : "";
var p2 = a2.reactiveElementPolyfillSupport;
var d2 = (t5, s4) => t5;
var u2 = { toAttribute(t5, s4) {
  switch (s4) {
    case Boolean:
      t5 = t5 ? l2 : null;
      break;
    case Object:
    case Array:
      t5 = null == t5 ? t5 : JSON.stringify(t5);
  }
  return t5;
}, fromAttribute(t5, s4) {
  let i6 = t5;
  switch (s4) {
    case Boolean:
      i6 = null !== t5;
      break;
    case Number:
      i6 = null === t5 ? null : Number(t5);
      break;
    case Object:
    case Array:
      try {
        i6 = JSON.parse(t5);
      } catch (t6) {
        i6 = null;
      }
  }
  return i6;
} };
var f4 = (t5, s4) => !i3(t5, s4);
var y2 = { attribute: true, type: String, converter: u2, reflect: false, hasChanged: f4 };
Symbol.metadata ??= Symbol("metadata"), a2.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var b2 = class extends HTMLElement {
  static addInitializer(t5) {
    this._$Ei(), (this.l ??= []).push(t5);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t5, s4 = y2) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.elementProperties.set(t5, s4), !s4.noAccessor) {
      const i6 = Symbol(), r9 = this.getPropertyDescriptor(t5, i6, s4);
      void 0 !== r9 && e4(this.prototype, t5, r9);
    }
  }
  static getPropertyDescriptor(t5, s4, i6) {
    const { get: e7, set: h6 } = r5(this.prototype, t5) ?? { get() {
      return this[s4];
    }, set(t6) {
      this[s4] = t6;
    } };
    return { get() {
      return e7?.call(this);
    }, set(s5) {
      const r9 = e7?.call(this);
      h6.call(this, s5), this.requestUpdate(t5, r9, i6);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t5) {
    return this.elementProperties.get(t5) ?? y2;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d2("elementProperties"))) return;
    const t5 = n6(this);
    t5.finalize(), void 0 !== t5.l && (this.l = [...t5.l]), this.elementProperties = new Map(t5.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d2("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d2("properties"))) {
      const t6 = this.properties, s4 = [...h4(t6), ...o5(t6)];
      for (const i6 of s4) this.createProperty(i6, t6[i6]);
    }
    const t5 = this[Symbol.metadata];
    if (null !== t5) {
      const s4 = litPropertyMetadata.get(t5);
      if (void 0 !== s4) for (const [t6, i6] of s4) this.elementProperties.set(t6, i6);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t6, s4] of this.elementProperties) {
      const i6 = this._$Eu(t6, s4);
      void 0 !== i6 && this._$Eh.set(i6, t6);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i6 = [];
    if (Array.isArray(s4)) {
      const e7 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e7) i6.unshift(c4(s5));
    } else void 0 !== s4 && i6.push(c4(s4));
    return i6;
  }
  static _$Eu(t5, s4) {
    const i6 = s4.attribute;
    return false === i6 ? void 0 : "string" == typeof i6 ? i6 : "string" == typeof t5 ? t5.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise(((t5) => this.enableUpdating = t5)), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach(((t5) => t5(this)));
  }
  addController(t5) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t5), void 0 !== this.renderRoot && this.isConnected && t5.hostConnected?.();
  }
  removeController(t5) {
    this._$EO?.delete(t5);
  }
  _$E_() {
    const t5 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i6 of s4.keys()) this.hasOwnProperty(i6) && (t5.set(i6, this[i6]), delete this[i6]);
    t5.size > 0 && (this._$Ep = t5);
  }
  createRenderRoot() {
    const t5 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S3(t5, this.constructor.elementStyles), t5;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach(((t5) => t5.hostConnected?.()));
  }
  enableUpdating(t5) {
  }
  disconnectedCallback() {
    this._$EO?.forEach(((t5) => t5.hostDisconnected?.()));
  }
  attributeChangedCallback(t5, s4, i6) {
    this._$AK(t5, i6);
  }
  _$EC(t5, s4) {
    const i6 = this.constructor.elementProperties.get(t5), e7 = this.constructor._$Eu(t5, i6);
    if (void 0 !== e7 && true === i6.reflect) {
      const r9 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u2).toAttribute(s4, i6.type);
      this._$Em = t5, null == r9 ? this.removeAttribute(e7) : this.setAttribute(e7, r9), this._$Em = null;
    }
  }
  _$AK(t5, s4) {
    const i6 = this.constructor, e7 = i6._$Eh.get(t5);
    if (void 0 !== e7 && this._$Em !== e7) {
      const t6 = i6.getPropertyOptions(e7), r9 = "function" == typeof t6.converter ? { fromAttribute: t6.converter } : void 0 !== t6.converter?.fromAttribute ? t6.converter : u2;
      this._$Em = e7, this[e7] = r9.fromAttribute(s4, t6.type), this._$Em = null;
    }
  }
  requestUpdate(t5, s4, i6) {
    if (void 0 !== t5) {
      if (i6 ??= this.constructor.getPropertyOptions(t5), !(i6.hasChanged ?? f4)(this[t5], s4)) return;
      this.P(t5, s4, i6);
    }
    false === this.isUpdatePending && (this._$ES = this._$ET());
  }
  P(t5, s4, i6) {
    this._$AL.has(t5) || this._$AL.set(t5, s4), true === i6.reflect && this._$Em !== t5 && (this._$Ej ??= /* @__PURE__ */ new Set()).add(t5);
  }
  async _$ET() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t6) {
      Promise.reject(t6);
    }
    const t5 = this.scheduleUpdate();
    return null != t5 && await t5, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t7, s5] of this._$Ep) this[t7] = s5;
        this._$Ep = void 0;
      }
      const t6 = this.constructor.elementProperties;
      if (t6.size > 0) for (const [s5, i6] of t6) true !== i6.wrapped || this._$AL.has(s5) || void 0 === this[s5] || this.P(s5, this[s5], i6);
    }
    let t5 = false;
    const s4 = this._$AL;
    try {
      t5 = this.shouldUpdate(s4), t5 ? (this.willUpdate(s4), this._$EO?.forEach(((t6) => t6.hostUpdate?.())), this.update(s4)) : this._$EU();
    } catch (s5) {
      throw t5 = false, this._$EU(), s5;
    }
    t5 && this._$AE(s4);
  }
  willUpdate(t5) {
  }
  _$AE(t5) {
    this._$EO?.forEach(((t6) => t6.hostUpdated?.())), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t5)), this.updated(t5);
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
  shouldUpdate(t5) {
    return true;
  }
  update(t5) {
    this._$Ej &&= this._$Ej.forEach(((t6) => this._$EC(t6, this[t6]))), this._$EU();
  }
  updated(t5) {
  }
  firstUpdated(t5) {
  }
};
b2.elementStyles = [], b2.shadowRootOptions = { mode: "open" }, b2[d2("elementProperties")] = /* @__PURE__ */ new Map(), b2[d2("finalized")] = /* @__PURE__ */ new Map(), p2?.({ ReactiveElement: b2 }), (a2.reactiveElementVersions ??= []).push("2.0.4");

// node_modules/@lit/reactive-element/decorators/property.js
var o6 = { attribute: true, type: String, converter: u2, reflect: false, hasChanged: f4 };
var r6 = (t5 = o6, e7, r9) => {
  const { kind: n9, metadata: i6 } = r9;
  let s4 = globalThis.litPropertyMetadata.get(i6);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i6, s4 = /* @__PURE__ */ new Map()), s4.set(r9.name, t5), "accessor" === n9) {
    const { name: o8 } = r9;
    return { set(r10) {
      const n10 = e7.get.call(this);
      e7.set.call(this, r10), this.requestUpdate(o8, n10, t5);
    }, init(e8) {
      return void 0 !== e8 && this.P(o8, void 0, t5), e8;
    } };
  }
  if ("setter" === n9) {
    const { name: o8 } = r9;
    return function(r10) {
      const n10 = this[o8];
      e7.call(this, r10), this.requestUpdate(o8, n10, t5);
    };
  }
  throw Error("Unsupported decorator location: " + n9);
};
function n7(t5) {
  return (e7, o8) => "object" == typeof o8 ? r6(t5, e7, o8) : ((t6, e8, o9) => {
    const r9 = e8.hasOwnProperty(o9);
    return e8.constructor.createProperty(o9, r9 ? { ...t6, wrapped: true } : t6), r9 ? Object.getOwnPropertyDescriptor(e8, o9) : void 0;
  })(t5, e7, o8);
}

// node_modules/lit-html/lit-html.js
var t4 = globalThis;
var i4 = t4.trustedTypes;
var s3 = i4 ? i4.createPolicy("lit-html", { createHTML: (t5) => t5 }) : void 0;
var e6 = "$lit$";
var h5 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var o7 = "?" + h5;
var n8 = `<${o7}>`;
var r7 = document;
var l3 = () => r7.createComment("");
var c6 = (t5) => null === t5 || "object" != typeof t5 && "function" != typeof t5;
var a3 = Array.isArray;
var u3 = (t5) => a3(t5) || "function" == typeof t5?.[Symbol.iterator];
var d3 = "[ 	\n\f\r]";
var f5 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var v2 = /-->/g;
var _2 = />/g;
var m2 = RegExp(`>|${d3}(?:([^\\s"'>=/]+)(${d3}*=${d3}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var p3 = /'/g;
var g2 = /"/g;
var $2 = /^(?:script|style|textarea|title)$/i;
var y3 = (t5) => (i6, ...s4) => ({ _$litType$: t5, strings: i6, values: s4 });
var x2 = y3(1);
var b3 = y3(2);
var w2 = y3(3);
var T2 = Symbol.for("lit-noChange");
var E2 = Symbol.for("lit-nothing");
var A = /* @__PURE__ */ new WeakMap();
var C = r7.createTreeWalker(r7, 129);
function P2(t5, i6) {
  if (!a3(t5) || !t5.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== s3 ? s3.createHTML(i6) : i6;
}
var V2 = (t5, i6) => {
  const s4 = t5.length - 1, o8 = [];
  let r9, l4 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c7 = f5;
  for (let i7 = 0; i7 < s4; i7++) {
    const s5 = t5[i7];
    let a4, u4, d4 = -1, y4 = 0;
    for (; y4 < s5.length && (c7.lastIndex = y4, u4 = c7.exec(s5), null !== u4); ) y4 = c7.lastIndex, c7 === f5 ? "!--" === u4[1] ? c7 = v2 : void 0 !== u4[1] ? c7 = _2 : void 0 !== u4[2] ? ($2.test(u4[2]) && (r9 = RegExp("</" + u4[2], "g")), c7 = m2) : void 0 !== u4[3] && (c7 = m2) : c7 === m2 ? ">" === u4[0] ? (c7 = r9 ?? f5, d4 = -1) : void 0 === u4[1] ? d4 = -2 : (d4 = c7.lastIndex - u4[2].length, a4 = u4[1], c7 = void 0 === u4[3] ? m2 : '"' === u4[3] ? g2 : p3) : c7 === g2 || c7 === p3 ? c7 = m2 : c7 === v2 || c7 === _2 ? c7 = f5 : (c7 = m2, r9 = void 0);
    const x3 = c7 === m2 && t5[i7 + 1].startsWith("/>") ? " " : "";
    l4 += c7 === f5 ? s5 + n8 : d4 >= 0 ? (o8.push(a4), s5.slice(0, d4) + e6 + s5.slice(d4) + h5 + x3) : s5 + h5 + (-2 === d4 ? i7 : x3);
  }
  return [P2(t5, l4 + (t5[s4] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), o8];
};
var N2 = class _N {
  constructor({ strings: t5, _$litType$: s4 }, n9) {
    let r9;
    this.parts = [];
    let c7 = 0, a4 = 0;
    const u4 = t5.length - 1, d4 = this.parts, [f6, v3] = V2(t5, s4);
    if (this.el = _N.createElement(f6, n9), C.currentNode = this.el.content, 2 === s4 || 3 === s4) {
      const t6 = this.el.content.firstChild;
      t6.replaceWith(...t6.childNodes);
    }
    for (; null !== (r9 = C.nextNode()) && d4.length < u4; ) {
      if (1 === r9.nodeType) {
        if (r9.hasAttributes()) for (const t6 of r9.getAttributeNames()) if (t6.endsWith(e6)) {
          const i6 = v3[a4++], s5 = r9.getAttribute(t6).split(h5), e7 = /([.?@])?(.*)/.exec(i6);
          d4.push({ type: 1, index: c7, name: e7[2], strings: s5, ctor: "." === e7[1] ? H : "?" === e7[1] ? I2 : "@" === e7[1] ? L : k2 }), r9.removeAttribute(t6);
        } else t6.startsWith(h5) && (d4.push({ type: 6, index: c7 }), r9.removeAttribute(t6));
        if ($2.test(r9.tagName)) {
          const t6 = r9.textContent.split(h5), s5 = t6.length - 1;
          if (s5 > 0) {
            r9.textContent = i4 ? i4.emptyScript : "";
            for (let i6 = 0; i6 < s5; i6++) r9.append(t6[i6], l3()), C.nextNode(), d4.push({ type: 2, index: ++c7 });
            r9.append(t6[s5], l3());
          }
        }
      } else if (8 === r9.nodeType) if (r9.data === o7) d4.push({ type: 2, index: c7 });
      else {
        let t6 = -1;
        for (; -1 !== (t6 = r9.data.indexOf(h5, t6 + 1)); ) d4.push({ type: 7, index: c7 }), t6 += h5.length - 1;
      }
      c7++;
    }
  }
  static createElement(t5, i6) {
    const s4 = r7.createElement("template");
    return s4.innerHTML = t5, s4;
  }
};
function S4(t5, i6, s4 = t5, e7) {
  if (i6 === T2) return i6;
  let h6 = void 0 !== e7 ? s4._$Co?.[e7] : s4._$Cl;
  const o8 = c6(i6) ? void 0 : i6._$litDirective$;
  return h6?.constructor !== o8 && (h6?._$AO?.(false), void 0 === o8 ? h6 = void 0 : (h6 = new o8(t5), h6._$AT(t5, s4, e7)), void 0 !== e7 ? (s4._$Co ??= [])[e7] = h6 : s4._$Cl = h6), void 0 !== h6 && (i6 = S4(t5, h6._$AS(t5, i6.values), h6, e7)), i6;
}
var M2 = class {
  constructor(t5, i6) {
    this._$AV = [], this._$AN = void 0, this._$AD = t5, this._$AM = i6;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t5) {
    const { el: { content: i6 }, parts: s4 } = this._$AD, e7 = (t5?.creationScope ?? r7).importNode(i6, true);
    C.currentNode = e7;
    let h6 = C.nextNode(), o8 = 0, n9 = 0, l4 = s4[0];
    for (; void 0 !== l4; ) {
      if (o8 === l4.index) {
        let i7;
        2 === l4.type ? i7 = new R2(h6, h6.nextSibling, this, t5) : 1 === l4.type ? i7 = new l4.ctor(h6, l4.name, l4.strings, this, t5) : 6 === l4.type && (i7 = new z2(h6, this, t5)), this._$AV.push(i7), l4 = s4[++n9];
      }
      o8 !== l4?.index && (h6 = C.nextNode(), o8++);
    }
    return C.currentNode = r7, e7;
  }
  p(t5) {
    let i6 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t5, s4, i6), i6 += s4.strings.length - 2) : s4._$AI(t5[i6])), i6++;
  }
};
var R2 = class _R {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t5, i6, s4, e7) {
    this.type = 2, this._$AH = E2, this._$AN = void 0, this._$AA = t5, this._$AB = i6, this._$AM = s4, this.options = e7, this._$Cv = e7?.isConnected ?? true;
  }
  get parentNode() {
    let t5 = this._$AA.parentNode;
    const i6 = this._$AM;
    return void 0 !== i6 && 11 === t5?.nodeType && (t5 = i6.parentNode), t5;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t5, i6 = this) {
    t5 = S4(this, t5, i6), c6(t5) ? t5 === E2 || null == t5 || "" === t5 ? (this._$AH !== E2 && this._$AR(), this._$AH = E2) : t5 !== this._$AH && t5 !== T2 && this._(t5) : void 0 !== t5._$litType$ ? this.$(t5) : void 0 !== t5.nodeType ? this.T(t5) : u3(t5) ? this.k(t5) : this._(t5);
  }
  O(t5) {
    return this._$AA.parentNode.insertBefore(t5, this._$AB);
  }
  T(t5) {
    this._$AH !== t5 && (this._$AR(), this._$AH = this.O(t5));
  }
  _(t5) {
    this._$AH !== E2 && c6(this._$AH) ? this._$AA.nextSibling.data = t5 : this.T(r7.createTextNode(t5)), this._$AH = t5;
  }
  $(t5) {
    const { values: i6, _$litType$: s4 } = t5, e7 = "number" == typeof s4 ? this._$AC(t5) : (void 0 === s4.el && (s4.el = N2.createElement(P2(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e7) this._$AH.p(i6);
    else {
      const t6 = new M2(e7, this), s5 = t6.u(this.options);
      t6.p(i6), this.T(s5), this._$AH = t6;
    }
  }
  _$AC(t5) {
    let i6 = A.get(t5.strings);
    return void 0 === i6 && A.set(t5.strings, i6 = new N2(t5)), i6;
  }
  k(t5) {
    a3(this._$AH) || (this._$AH = [], this._$AR());
    const i6 = this._$AH;
    let s4, e7 = 0;
    for (const h6 of t5) e7 === i6.length ? i6.push(s4 = new _R(this.O(l3()), this.O(l3()), this, this.options)) : s4 = i6[e7], s4._$AI(h6), e7++;
    e7 < i6.length && (this._$AR(s4 && s4._$AB.nextSibling, e7), i6.length = e7);
  }
  _$AR(t5 = this._$AA.nextSibling, i6) {
    for (this._$AP?.(false, true, i6); t5 && t5 !== this._$AB; ) {
      const i7 = t5.nextSibling;
      t5.remove(), t5 = i7;
    }
  }
  setConnected(t5) {
    void 0 === this._$AM && (this._$Cv = t5, this._$AP?.(t5));
  }
};
var k2 = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t5, i6, s4, e7, h6) {
    this.type = 1, this._$AH = E2, this._$AN = void 0, this.element = t5, this.name = i6, this._$AM = e7, this.options = h6, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = E2;
  }
  _$AI(t5, i6 = this, s4, e7) {
    const h6 = this.strings;
    let o8 = false;
    if (void 0 === h6) t5 = S4(this, t5, i6, 0), o8 = !c6(t5) || t5 !== this._$AH && t5 !== T2, o8 && (this._$AH = t5);
    else {
      const e8 = t5;
      let n9, r9;
      for (t5 = h6[0], n9 = 0; n9 < h6.length - 1; n9++) r9 = S4(this, e8[s4 + n9], i6, n9), r9 === T2 && (r9 = this._$AH[n9]), o8 ||= !c6(r9) || r9 !== this._$AH[n9], r9 === E2 ? t5 = E2 : t5 !== E2 && (t5 += (r9 ?? "") + h6[n9 + 1]), this._$AH[n9] = r9;
    }
    o8 && !e7 && this.j(t5);
  }
  j(t5) {
    t5 === E2 ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t5 ?? "");
  }
};
var H = class extends k2 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t5) {
    this.element[this.name] = t5 === E2 ? void 0 : t5;
  }
};
var I2 = class extends k2 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t5) {
    this.element.toggleAttribute(this.name, !!t5 && t5 !== E2);
  }
};
var L = class extends k2 {
  constructor(t5, i6, s4, e7, h6) {
    super(t5, i6, s4, e7, h6), this.type = 5;
  }
  _$AI(t5, i6 = this) {
    if ((t5 = S4(this, t5, i6, 0) ?? E2) === T2) return;
    const s4 = this._$AH, e7 = t5 === E2 && s4 !== E2 || t5.capture !== s4.capture || t5.once !== s4.once || t5.passive !== s4.passive, h6 = t5 !== E2 && (s4 === E2 || e7);
    e7 && this.element.removeEventListener(this.name, this, s4), h6 && this.element.addEventListener(this.name, this, t5), this._$AH = t5;
  }
  handleEvent(t5) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t5) : this._$AH.handleEvent(t5);
  }
};
var z2 = class {
  constructor(t5, i6, s4) {
    this.element = t5, this.type = 6, this._$AN = void 0, this._$AM = i6, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t5) {
    S4(this, t5);
  }
};
var j2 = t4.litHtmlPolyfillSupport;
j2?.(N2, R2), (t4.litHtmlVersions ??= []).push("3.2.1");
var B2 = (t5, i6, s4) => {
  const e7 = s4?.renderBefore ?? i6;
  let h6 = e7._$litPart$;
  if (void 0 === h6) {
    const t6 = s4?.renderBefore ?? null;
    e7._$litPart$ = h6 = new R2(i6.insertBefore(l3(), t6), t6, void 0, s4 ?? {});
  }
  return h6._$AI(t5), h6;
};

// node_modules/lit-element/lit-element.js
var r8 = class extends b2 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t5 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t5.firstChild, t5;
  }
  update(t5) {
    const s4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t5), this._$Do = B2(s4, this.renderRoot, this.renderOptions);
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
r8._$litElement$ = true, r8["finalized"] = true, globalThis.litElementHydrateSupport?.({ LitElement: r8 });
var i5 = globalThis.litElementPolyfillSupport;
i5?.({ LitElement: r8 });
(globalThis.litElementVersions ??= []).push("4.1.1");

// node_modules/@shoelace-style/shoelace/dist/chunks/chunk.3Y6SB6QS.js
var basePath = "";
function setBasePath(path) {
  basePath = path;
}

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
    sha256: "4891e8d0d7cb9ba22af0b4ea3be2199622a5d2e06a78a16ad99232de7347560b"
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
    sha256: "d6f9118592aa4379ab2bba484ef814ab90a67edd511c4cc58926f1a9512a0786"
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
    sha256: "0e1d991355f806077d4666af2d241d5d6f40bc0033c9ae79747717755405041d"
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
  { "atomicNumber": 1, "symbol": "H", "names": { "en": "Hydrogen", "de": "Wasserstoff" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#H" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "period": 1, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "weight": { "kind": "interval", "lower": "1.00784", "upper": "1.00811", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#H" } }, "configuration": { "status": "reported", "value": "1s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } }, "shells": [1], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#h" } } },
  { "atomicNumber": 2, "symbol": "He", "names": { "en": "Helium", "de": "Helium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#He" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "period": 1, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "weight": { "kind": "value", "decimal": "4.002602", "uncertaintyDigits": "2", "noteCodes": ["g", "r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#He" } }, "configuration": { "status": "reported", "value": "1s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } }, "shells": [2], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#he" } } },
  { "atomicNumber": 3, "symbol": "Li", "names": { "en": "Lithium", "de": "Lithium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Li" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "period": 2, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "weight": { "kind": "interval", "lower": "6.938", "upper": "6.997", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Li" } }, "configuration": { "status": "reported", "value": "[He] 2s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } }, "shells": [2, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#li" } } },
  { "atomicNumber": 4, "symbol": "Be", "names": { "en": "Beryllium", "de": "Beryllium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Be" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "period": 2, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "weight": { "kind": "value", "decimal": "9.0121831", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Be" } }, "configuration": { "status": "reported", "value": "[He] 2s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } }, "shells": [2, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#be" } } },
  { "atomicNumber": 5, "symbol": "B", "names": { "en": "Boron", "de": "Bor" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#B" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "period": 2, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "weight": { "kind": "interval", "lower": "10.806", "upper": "10.821", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#B" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } }, "shells": [2, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#b" } } },
  { "atomicNumber": 6, "symbol": "C", "names": { "en": "Carbon", "de": "Kohlenstoff" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#C" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "period": 2, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "weight": { "kind": "interval", "lower": "12.0096", "upper": "12.0116", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#C" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } }, "shells": [2, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#c" } } },
  { "atomicNumber": 7, "symbol": "N", "names": { "en": "Nitrogen", "de": "Stickstoff" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#N" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "period": 2, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "weight": { "kind": "interval", "lower": "14.00643", "upper": "14.00728", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#N" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } }, "shells": [2, 5], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#n" } } },
  { "atomicNumber": 8, "symbol": "O", "names": { "en": "Oxygen", "de": "Sauerstoff" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#O" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "period": 2, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "weight": { "kind": "interval", "lower": "15.99903", "upper": "15.99977", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#O" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } }, "shells": [2, 6], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#o" } } },
  { "atomicNumber": 9, "symbol": "F", "names": { "en": "Fluorine", "de": "Fluor" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#F" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "period": 2, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "weight": { "kind": "value", "decimal": "18.998403162", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#F" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } }, "shells": [2, 7], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#f" } } },
  { "atomicNumber": 10, "symbol": "Ne", "names": { "en": "Neon", "de": "Neon" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ne" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "period": 2, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "weight": { "kind": "value", "decimal": "20.1797", "uncertaintyDigits": "6", "noteCodes": ["g", "m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ne" } }, "configuration": { "status": "reported", "value": "[He] 2s2 2p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } }, "shells": [2, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ne" } } },
  { "atomicNumber": 11, "symbol": "Na", "names": { "en": "Sodium", "de": "Natrium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Na" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "period": 3, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "weight": { "kind": "value", "decimal": "22.98976928", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Na" } }, "configuration": { "status": "reported", "value": "[Ne] 3s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } }, "shells": [2, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#na" } } },
  { "atomicNumber": 12, "symbol": "Mg", "names": { "en": "Magnesium", "de": "Magnesium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mg" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "period": 3, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "weight": { "kind": "interval", "lower": "24.304", "upper": "24.307", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mg" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } }, "shells": [2, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mg" } } },
  { "atomicNumber": 13, "symbol": "Al", "names": { "en": "Aluminium", "de": "Aluminium" }, "aliases": { "en": ["Aluminum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Al" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "period": 3, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "weight": { "kind": "value", "decimal": "26.9815384", "uncertaintyDigits": "3", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Al" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } }, "shells": [2, 8, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#al" } } },
  { "atomicNumber": 14, "symbol": "Si", "names": { "en": "Silicon", "de": "Silicium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Si" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "period": 3, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "weight": { "kind": "interval", "lower": "28.084", "upper": "28.086", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Si" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } }, "shells": [2, 8, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#si" } } },
  { "atomicNumber": 15, "symbol": "P", "names": { "en": "Phosphorus", "de": "Phosphor" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#P" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "period": 3, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "weight": { "kind": "value", "decimal": "30.973761998", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#P" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } }, "shells": [2, 8, 5], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#p" } } },
  { "atomicNumber": 16, "symbol": "S", "names": { "en": "Sulfur", "de": "Schwefel" }, "aliases": { "en": ["Sulphur"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#S" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "period": 3, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "weight": { "kind": "interval", "lower": "32.059", "upper": "32.076", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#S" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } }, "shells": [2, 8, 6], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#s" } } },
  { "atomicNumber": 17, "symbol": "Cl", "names": { "en": "Chlorine", "de": "Chlor" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cl" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "period": 3, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "weight": { "kind": "interval", "lower": "35.446", "upper": "35.457", "noteCodes": ["m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cl" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } }, "shells": [2, 8, 7], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cl" } } },
  { "atomicNumber": 18, "symbol": "Ar", "names": { "en": "Argon", "de": "Argon" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ar" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "period": 3, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "weight": { "kind": "interval", "lower": "39.792", "upper": "39.963", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ar" } }, "configuration": { "status": "reported", "value": "[Ne] 3s2 3p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } }, "shells": [2, 8, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ar" } } },
  { "atomicNumber": 19, "symbol": "K", "names": { "en": "Potassium", "de": "Kalium" }, "aliases": { "en": ["Kalium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#K" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "period": 4, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "weight": { "kind": "value", "decimal": "39.0983", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#K" } }, "configuration": { "status": "reported", "value": "[Ar] 4s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } }, "shells": [2, 8, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#k" } } },
  { "atomicNumber": 20, "symbol": "Ca", "names": { "en": "Calcium", "de": "Calcium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ca" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "period": 4, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "weight": { "kind": "value", "decimal": "40.078", "uncertaintyDigits": "4", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ca" } }, "configuration": { "status": "reported", "value": "[Ar] 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } }, "shells": [2, 8, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ca" } } },
  { "atomicNumber": 21, "symbol": "Sc", "names": { "en": "Scandium", "de": "Scandium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sc" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "period": 4, "group": { "status": "reported", "value": 3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "weight": { "kind": "value", "decimal": "44.955907", "uncertaintyDigits": "4", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sc" } }, "configuration": { "status": "reported", "value": "[Ar] 3d1 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } }, "shells": [2, 8, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sc" } } },
  { "atomicNumber": 22, "symbol": "Ti", "names": { "en": "Titanium", "de": "Titan" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ti" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "period": 4, "group": { "status": "reported", "value": 4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "weight": { "kind": "value", "decimal": "47.867", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ti" } }, "configuration": { "status": "reported", "value": "[Ar] 3d2 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } }, "shells": [2, 8, 10, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ti" } } },
  { "atomicNumber": 23, "symbol": "V", "names": { "en": "Vanadium", "de": "Vanadium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#V" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "period": 4, "group": { "status": "reported", "value": 5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "weight": { "kind": "value", "decimal": "50.9415", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#V" } }, "configuration": { "status": "reported", "value": "[Ar] 3d3 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } }, "shells": [2, 8, 11, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#v" } } },
  { "atomicNumber": 24, "symbol": "Cr", "names": { "en": "Chromium", "de": "Chrom" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "period": 4, "group": { "status": "reported", "value": 6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "weight": { "kind": "value", "decimal": "51.9961", "uncertaintyDigits": "6", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cr" } }, "configuration": { "status": "reported", "value": "[Ar] 3d5 4s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } }, "shells": [2, 8, 13, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cr" } } },
  { "atomicNumber": 25, "symbol": "Mn", "names": { "en": "Manganese", "de": "Mangan" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "period": 4, "group": { "status": "reported", "value": 7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "weight": { "kind": "value", "decimal": "54.938043", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mn" } }, "configuration": { "status": "reported", "value": "[Ar] 3d5 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } }, "shells": [2, 8, 13, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mn" } } },
  { "atomicNumber": 26, "symbol": "Fe", "names": { "en": "Iron", "de": "Eisen" }, "aliases": { "en": ["Ferrum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fe" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "period": 4, "group": { "status": "reported", "value": 8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "weight": { "kind": "value", "decimal": "55.845", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fe" } }, "configuration": { "status": "reported", "value": "[Ar] 3d6 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } }, "shells": [2, 8, 14, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fe" } } },
  { "atomicNumber": 27, "symbol": "Co", "names": { "en": "Cobalt", "de": "Cobalt" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Co" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "period": 4, "group": { "status": "reported", "value": 9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "weight": { "kind": "value", "decimal": "58.933194", "uncertaintyDigits": "3", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Co" } }, "configuration": { "status": "reported", "value": "[Ar] 3d7 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } }, "shells": [2, 8, 15, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#co" } } },
  { "atomicNumber": 28, "symbol": "Ni", "names": { "en": "Nickel", "de": "Nickel" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ni" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "period": 4, "group": { "status": "reported", "value": 10, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "weight": { "kind": "value", "decimal": "58.6934", "uncertaintyDigits": "4", "noteCodes": ["r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ni" } }, "configuration": { "status": "reported", "value": "[Ar] 3d8 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } }, "shells": [2, 8, 16, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ni" } } },
  { "atomicNumber": 29, "symbol": "Cu", "names": { "en": "Copper", "de": "Kupfer" }, "aliases": { "en": ["Cuprum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cu" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "period": 4, "group": { "status": "reported", "value": 11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "weight": { "kind": "value", "decimal": "63.546", "uncertaintyDigits": "3", "noteCodes": ["r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cu" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } }, "shells": [2, 8, 18, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cu" } } },
  { "atomicNumber": 30, "symbol": "Zn", "names": { "en": "Zinc", "de": "Zink" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Zn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "period": 4, "group": { "status": "reported", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "weight": { "kind": "value", "decimal": "65.38", "uncertaintyDigits": "2", "noteCodes": ["r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Zn" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } }, "shells": [2, 8, 18, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zn" } } },
  { "atomicNumber": 31, "symbol": "Ga", "names": { "en": "Gallium", "de": "Gallium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ga" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "period": 4, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "weight": { "kind": "value", "decimal": "69.723", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ga" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } }, "shells": [2, 8, 18, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ga" } } },
  { "atomicNumber": 32, "symbol": "Ge", "names": { "en": "Germanium", "de": "Germanium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ge" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "period": 4, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "weight": { "kind": "value", "decimal": "72.630", "uncertaintyDigits": "8", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ge" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } }, "shells": [2, 8, 18, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ge" } } },
  { "atomicNumber": 33, "symbol": "As", "names": { "en": "Arsenic", "de": "Arsen" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#As" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "period": 4, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "weight": { "kind": "value", "decimal": "74.921595", "uncertaintyDigits": "6", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#As" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } }, "shells": [2, 8, 18, 5], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#as" } } },
  { "atomicNumber": 34, "symbol": "Se", "names": { "en": "Selenium", "de": "Selen" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Se" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "period": 4, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "weight": { "kind": "value", "decimal": "78.971", "uncertaintyDigits": "8", "noteCodes": ["r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Se" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } }, "shells": [2, 8, 18, 6], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#se" } } },
  { "atomicNumber": 35, "symbol": "Br", "names": { "en": "Bromine", "de": "Brom" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Br" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "period": 4, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "weight": { "kind": "interval", "lower": "79.901", "upper": "79.907", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Br" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } }, "shells": [2, 8, 18, 7], "phase": { "status": "reported", "value": "liquid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#br" } } },
  { "atomicNumber": 36, "symbol": "Kr", "names": { "en": "Krypton", "de": "Krypton" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Kr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "period": 4, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "weight": { "kind": "value", "decimal": "83.798", "uncertaintyDigits": "2", "noteCodes": ["g", "m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Kr" } }, "configuration": { "status": "reported", "value": "[Ar] 3d10 4s2 4p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } }, "shells": [2, 8, 18, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#kr" } } },
  { "atomicNumber": 37, "symbol": "Rb", "names": { "en": "Rubidium", "de": "Rubidium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "period": 5, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "weight": { "kind": "value", "decimal": "85.4678", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rb" } }, "configuration": { "status": "reported", "value": "[Kr] 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } }, "shells": [2, 8, 18, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rb" } } },
  { "atomicNumber": 38, "symbol": "Sr", "names": { "en": "Strontium", "de": "Strontium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "period": 5, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "weight": { "kind": "value", "decimal": "87.62", "uncertaintyDigits": "1", "noteCodes": ["g", "r"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sr" } }, "configuration": { "status": "reported", "value": "[Kr] 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } }, "shells": [2, 8, 18, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sr" } } },
  { "atomicNumber": 39, "symbol": "Y", "names": { "en": "Yttrium", "de": "Yttrium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Y" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "period": 5, "group": { "status": "reported", "value": 3, "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "weight": { "kind": "value", "decimal": "88.905838", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Y" } }, "configuration": { "status": "reported", "value": "[Kr] 4d1 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } }, "shells": [2, 8, 18, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#y" } } },
  { "atomicNumber": 40, "symbol": "Zr", "names": { "en": "Zirconium", "de": "Zirconium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Zr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "period": 5, "group": { "status": "reported", "value": 4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "weight": { "kind": "value", "decimal": "91.222", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Zr" } }, "configuration": { "status": "reported", "value": "[Kr] 4d2 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } }, "shells": [2, 8, 18, 10, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#zr" } } },
  { "atomicNumber": 41, "symbol": "Nb", "names": { "en": "Niobium", "de": "Niob" }, "aliases": { "en": ["Columbium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "period": 5, "group": { "status": "reported", "value": 5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "weight": { "kind": "value", "decimal": "92.90637", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nb" } }, "configuration": { "status": "reported", "value": "[Kr] 4d4 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } }, "shells": [2, 8, 18, 12, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nb" } } },
  { "atomicNumber": 42, "symbol": "Mo", "names": { "en": "Molybdenum", "de": "Molybd\xE4n" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mo" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "period": 5, "group": { "status": "reported", "value": 6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "weight": { "kind": "value", "decimal": "95.95", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mo" } }, "configuration": { "status": "reported", "value": "[Kr] 4d5 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } }, "shells": [2, 8, 18, 13, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mo" } } },
  { "atomicNumber": 43, "symbol": "Tc", "names": { "en": "Technetium", "de": "Technetium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tc" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "period": 5, "group": { "status": "reported", "value": 7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tc" } }, "configuration": { "status": "reported", "value": "[Kr] 4d5 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } }, "shells": [2, 8, 18, 13, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tc" } } },
  { "atomicNumber": 44, "symbol": "Ru", "names": { "en": "Ruthenium", "de": "Ruthenium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ru" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "period": 5, "group": { "status": "reported", "value": 8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "weight": { "kind": "value", "decimal": "101.07", "uncertaintyDigits": "2", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ru" } }, "configuration": { "status": "reported", "value": "[Kr] 4d7 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } }, "shells": [2, 8, 18, 15, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ru" } } },
  { "atomicNumber": 45, "symbol": "Rh", "names": { "en": "Rhodium", "de": "Rhodium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rh" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "period": 5, "group": { "status": "reported", "value": 9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "weight": { "kind": "value", "decimal": "102.90549", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rh" } }, "configuration": { "status": "reported", "value": "[Kr] 4d8 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } }, "shells": [2, 8, 18, 16, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rh" } } },
  { "atomicNumber": 46, "symbol": "Pd", "names": { "en": "Palladium", "de": "Palladium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pd" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "period": 5, "group": { "status": "reported", "value": 10, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "weight": { "kind": "value", "decimal": "106.42", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pd" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } }, "shells": [2, 8, 18, 18], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pd" } } },
  { "atomicNumber": 47, "symbol": "Ag", "names": { "en": "Silver", "de": "Silber" }, "aliases": { "en": ["Argentum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ag" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "period": 5, "group": { "status": "reported", "value": 11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "weight": { "kind": "value", "decimal": "107.8682", "uncertaintyDigits": "2", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ag" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } }, "shells": [2, 8, 18, 18, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ag" } } },
  { "atomicNumber": 48, "symbol": "Cd", "names": { "en": "Cadmium", "de": "Cadmium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cd" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "period": 5, "group": { "status": "reported", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "weight": { "kind": "value", "decimal": "112.414", "uncertaintyDigits": "4", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cd" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } }, "shells": [2, 8, 18, 18, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cd" } } },
  { "atomicNumber": 49, "symbol": "In", "names": { "en": "Indium", "de": "Indium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#In" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "period": 5, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "weight": { "kind": "value", "decimal": "114.818", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#In" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } }, "shells": [2, 8, 18, 18, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#in" } } },
  { "atomicNumber": 50, "symbol": "Sn", "names": { "en": "Tin", "de": "Zinn" }, "aliases": { "en": ["Stannum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "period": 5, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "weight": { "kind": "value", "decimal": "118.710", "uncertaintyDigits": "7", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sn" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } }, "shells": [2, 8, 18, 18, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sn" } } },
  { "atomicNumber": 51, "symbol": "Sb", "names": { "en": "Antimony", "de": "Antimon" }, "aliases": { "en": ["Stibium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "period": 5, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "weight": { "kind": "value", "decimal": "121.760", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sb" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } }, "shells": [2, 8, 18, 18, 5], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sb" } } },
  { "atomicNumber": 52, "symbol": "Te", "names": { "en": "Tellurium", "de": "Tellur" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Te" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "period": 5, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "weight": { "kind": "value", "decimal": "127.60", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Te" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } }, "shells": [2, 8, 18, 18, 6], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#te" } } },
  { "atomicNumber": 53, "symbol": "I", "names": { "en": "Iodine", "de": "Iod" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#I" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "period": 5, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "weight": { "kind": "value", "decimal": "126.90447", "uncertaintyDigits": "3", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#I" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } }, "shells": [2, 8, 18, 18, 7], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#i" } } },
  { "atomicNumber": 54, "symbol": "Xe", "names": { "en": "Xenon", "de": "Xenon" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Xe" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "period": 5, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "weight": { "kind": "value", "decimal": "131.293", "uncertaintyDigits": "6", "noteCodes": ["g", "m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Xe" } }, "configuration": { "status": "reported", "value": "[Kr] 4d10 5s2 5p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } }, "shells": [2, 8, 18, 18, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#xe" } } },
  { "atomicNumber": 55, "symbol": "Cs", "names": { "en": "Caesium", "de": "Caesium" }, "aliases": { "en": ["Cesium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cs" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "period": 6, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "weight": { "kind": "value", "decimal": "132.90545196", "uncertaintyDigits": "6", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cs" } }, "configuration": { "status": "reported", "value": "[Xe] 6s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } }, "shells": [2, 8, 18, 18, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cs" } } },
  { "atomicNumber": 56, "symbol": "Ba", "names": { "en": "Barium", "de": "Barium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ba" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "period": 6, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "weight": { "kind": "value", "decimal": "137.327", "uncertaintyDigits": "7", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ba" } }, "configuration": { "status": "reported", "value": "[Xe] 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } }, "shells": [2, 8, 18, 18, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ba" } } },
  { "atomicNumber": 57, "symbol": "La", "names": { "en": "Lanthanum", "de": "Lanthan" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#La" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "period": 6, "group": { "status": "convention-dependent", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "weight": { "kind": "value", "decimal": "138.90547", "uncertaintyDigits": "7", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#La" } }, "configuration": { "status": "reported", "value": "[Xe] 5d1 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } }, "shells": [2, 8, 18, 18, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#la" } } },
  { "atomicNumber": 58, "symbol": "Ce", "names": { "en": "Cerium", "de": "Cer" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ce" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "weight": { "kind": "value", "decimal": "140.116", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ce" } }, "configuration": { "status": "reported", "value": "[Xe] 4f1 5d1 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } }, "shells": [2, 8, 18, 19, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ce" } } },
  { "atomicNumber": 59, "symbol": "Pr", "names": { "en": "Praseodymium", "de": "Praseodym" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "weight": { "kind": "value", "decimal": "140.90766", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pr" } }, "configuration": { "status": "reported", "value": "[Xe] 4f3 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } }, "shells": [2, 8, 18, 21, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pr" } } },
  { "atomicNumber": 60, "symbol": "Nd", "names": { "en": "Neodymium", "de": "Neodym" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nd" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "weight": { "kind": "value", "decimal": "144.242", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nd" } }, "configuration": { "status": "reported", "value": "[Xe] 4f4 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } }, "shells": [2, 8, 18, 22, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nd" } } },
  { "atomicNumber": 61, "symbol": "Pm", "names": { "en": "Promethium", "de": "Promethium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pm" } }, "configuration": { "status": "reported", "value": "[Xe] 4f5 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } }, "shells": [2, 8, 18, 23, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pm" } } },
  { "atomicNumber": 62, "symbol": "Sm", "names": { "en": "Samarium", "de": "Samarium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "weight": { "kind": "value", "decimal": "150.36", "uncertaintyDigits": "2", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sm" } }, "configuration": { "status": "reported", "value": "[Xe] 4f6 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } }, "shells": [2, 8, 18, 24, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sm" } } },
  { "atomicNumber": 63, "symbol": "Eu", "names": { "en": "Europium", "de": "Europium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Eu" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "weight": { "kind": "value", "decimal": "151.964", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Eu" } }, "configuration": { "status": "reported", "value": "[Xe] 4f7 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } }, "shells": [2, 8, 18, 25, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#eu" } } },
  { "atomicNumber": 64, "symbol": "Gd", "names": { "en": "Gadolinium", "de": "Gadolinium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Gd" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "weight": { "kind": "value", "decimal": "157.249", "uncertaintyDigits": "2", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Gd" } }, "configuration": { "status": "reported", "value": "[Xe] 4f7 5d1 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } }, "shells": [2, 8, 18, 25, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#gd" } } },
  { "atomicNumber": 65, "symbol": "Tb", "names": { "en": "Terbium", "de": "Terbium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "weight": { "kind": "value", "decimal": "158.925354", "uncertaintyDigits": "7", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tb" } }, "configuration": { "status": "reported", "value": "[Xe] 4f9 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } }, "shells": [2, 8, 18, 27, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tb" } } },
  { "atomicNumber": 66, "symbol": "Dy", "names": { "en": "Dysprosium", "de": "Dysprosium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Dy" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "weight": { "kind": "value", "decimal": "162.500", "uncertaintyDigits": "1", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Dy" } }, "configuration": { "status": "reported", "value": "[Xe] 4f10 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } }, "shells": [2, 8, 18, 28, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#dy" } } },
  { "atomicNumber": 67, "symbol": "Ho", "names": { "en": "Holmium", "de": "Holmium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ho" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "weight": { "kind": "value", "decimal": "164.930329", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ho" } }, "configuration": { "status": "reported", "value": "[Xe] 4f11 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } }, "shells": [2, 8, 18, 29, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ho" } } },
  { "atomicNumber": 68, "symbol": "Er", "names": { "en": "Erbium", "de": "Erbium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Er" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "weight": { "kind": "value", "decimal": "167.259", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Er" } }, "configuration": { "status": "reported", "value": "[Xe] 4f12 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } }, "shells": [2, 8, 18, 30, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#er" } } },
  { "atomicNumber": 69, "symbol": "Tm", "names": { "en": "Thulium", "de": "Thulium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "weight": { "kind": "value", "decimal": "168.934219", "uncertaintyDigits": "5", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tm" } }, "configuration": { "status": "reported", "value": "[Xe] 4f13 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } }, "shells": [2, 8, 18, 31, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tm" } } },
  { "atomicNumber": 70, "symbol": "Yb", "names": { "en": "Ytterbium", "de": "Ytterbium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Yb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "period": 6, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "weight": { "kind": "value", "decimal": "173.045", "uncertaintyDigits": "10", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Yb" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } }, "shells": [2, 8, 18, 32, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#yb" } } },
  { "atomicNumber": 71, "symbol": "Lu", "names": { "en": "Lutetium", "de": "Lutetium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lu" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "period": 6, "group": { "status": "convention-dependent", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "weight": { "kind": "value", "decimal": "174.96669", "uncertaintyDigits": "5", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lu" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d1 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } }, "shells": [2, 8, 18, 32, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lu" } } },
  { "atomicNumber": 72, "symbol": "Hf", "names": { "en": "Hafnium", "de": "Hafnium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hf" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "period": 6, "group": { "status": "reported", "value": 4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "weight": { "kind": "value", "decimal": "178.486", "uncertaintyDigits": "6", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hf" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d2 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } }, "shells": [2, 8, 18, 32, 10, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hf" } } },
  { "atomicNumber": 73, "symbol": "Ta", "names": { "en": "Tantalum", "de": "Tantal" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ta" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "period": 6, "group": { "status": "reported", "value": 5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "weight": { "kind": "value", "decimal": "180.94788", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ta" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d3 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } }, "shells": [2, 8, 18, 32, 11, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ta" } } },
  { "atomicNumber": 74, "symbol": "W", "names": { "en": "Tungsten", "de": "Wolfram" }, "aliases": { "en": ["Wolfram"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#W" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "period": 6, "group": { "status": "reported", "value": 6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "weight": { "kind": "value", "decimal": "183.84", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#W" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d4 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } }, "shells": [2, 8, 18, 32, 12, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#w" } } },
  { "atomicNumber": 75, "symbol": "Re", "names": { "en": "Rhenium", "de": "Rhenium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Re" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "period": 6, "group": { "status": "reported", "value": 7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "weight": { "kind": "value", "decimal": "186.207", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Re" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d5 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } }, "shells": [2, 8, 18, 32, 13, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#re" } } },
  { "atomicNumber": 76, "symbol": "Os", "names": { "en": "Osmium", "de": "Osmium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Os" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "period": 6, "group": { "status": "reported", "value": 8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "weight": { "kind": "value", "decimal": "190.23", "uncertaintyDigits": "3", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Os" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d6 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } }, "shells": [2, 8, 18, 32, 14, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#os" } } },
  { "atomicNumber": 77, "symbol": "Ir", "names": { "en": "Iridium", "de": "Iridium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ir" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "period": 6, "group": { "status": "reported", "value": 9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "weight": { "kind": "value", "decimal": "192.217", "uncertaintyDigits": "2", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ir" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d7 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } }, "shells": [2, 8, 18, 32, 15, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ir" } } },
  { "atomicNumber": 78, "symbol": "Pt", "names": { "en": "Platinum", "de": "Platin" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pt" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "period": 6, "group": { "status": "reported", "value": 10, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "weight": { "kind": "value", "decimal": "195.084", "uncertaintyDigits": "9", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pt" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d9 6s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } }, "shells": [2, 8, 18, 32, 17, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pt" } } },
  { "atomicNumber": 79, "symbol": "Au", "names": { "en": "Gold", "de": "Gold" }, "aliases": { "en": ["Aurum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Au" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "period": 6, "group": { "status": "reported", "value": 11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "weight": { "kind": "value", "decimal": "196.966570", "uncertaintyDigits": "4", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Au" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } }, "shells": [2, 8, 18, 32, 18, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#au" } } },
  { "atomicNumber": 80, "symbol": "Hg", "names": { "en": "Mercury", "de": "Quecksilber" }, "aliases": { "en": ["Hydrargyrum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hg" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "period": 6, "group": { "status": "reported", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "weight": { "kind": "value", "decimal": "200.592", "uncertaintyDigits": "3", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hg" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } }, "shells": [2, 8, 18, 32, 18, 2], "phase": { "status": "reported", "value": "liquid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hg" } } },
  { "atomicNumber": 81, "symbol": "Tl", "names": { "en": "Thallium", "de": "Thallium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tl" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "period": 6, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "weight": { "kind": "interval", "lower": "204.382", "upper": "204.385", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Tl" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } }, "shells": [2, 8, 18, 32, 18, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#tl" } } },
  { "atomicNumber": 82, "symbol": "Pb", "names": { "en": "Lead", "de": "Blei" }, "aliases": { "en": ["Plumbum"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pb" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "period": 6, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "weight": { "kind": "interval", "lower": "206.14", "upper": "207.94", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pb" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } }, "shells": [2, 8, 18, 32, 18, 4], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pb" } } },
  { "atomicNumber": 83, "symbol": "Bi", "names": { "en": "Bismuth", "de": "Bismut" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bi" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "period": 6, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "weight": { "kind": "value", "decimal": "208.98040", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bi" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } }, "shells": [2, 8, 18, 32, 18, 5], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bi" } } },
  { "atomicNumber": 84, "symbol": "Po", "names": { "en": "Polonium", "de": "Polonium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Po" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "period": 6, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Po" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } }, "shells": [2, 8, 18, 32, 18, 6], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#po" } } },
  { "atomicNumber": 85, "symbol": "At", "names": { "en": "Astatine", "de": "Astat" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#At" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "period": 6, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#At" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } }, "shells": [2, 8, 18, 32, 18, 7], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#at" } } },
  { "atomicNumber": 86, "symbol": "Rn", "names": { "en": "Radon", "de": "Radon" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "period": 6, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rn" } }, "configuration": { "status": "reported", "value": "[Xe] 4f14 5d10 6s2 6p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } }, "shells": [2, 8, 18, 32, 18, 8], "phase": { "status": "reported", "value": "gas", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rn" } } },
  { "atomicNumber": 87, "symbol": "Fr", "names": { "en": "Francium", "de": "Francium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "period": 7, "group": { "status": "reported", "value": 1, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fr" } }, "configuration": { "status": "reported", "value": "[Rn] 7s1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } }, "shells": [2, 8, 18, 32, 18, 8, 1], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fr" } } },
  { "atomicNumber": 88, "symbol": "Ra", "names": { "en": "Radium", "de": "Radium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ra" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "period": 7, "group": { "status": "reported", "value": 2, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "block": { "status": "reported", "value": "s", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ra" } }, "configuration": { "status": "reported", "value": "[Rn] 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } }, "shells": [2, 8, 18, 32, 18, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ra" } } },
  { "atomicNumber": 89, "symbol": "Ac", "names": { "en": "Actinium", "de": "Actinium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ac" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "period": 7, "group": { "status": "convention-dependent", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ac" } }, "configuration": { "status": "reported", "value": "[Rn] 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } }, "shells": [2, 8, 18, 32, 18, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ac" } } },
  { "atomicNumber": 90, "symbol": "Th", "names": { "en": "Thorium", "de": "Thorium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Th" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "weight": { "kind": "value", "decimal": "232.0377", "uncertaintyDigits": "4", "noteCodes": ["g"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Th" } }, "configuration": { "status": "reported", "value": "[Rn] 6d2 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } }, "shells": [2, 8, 18, 32, 18, 10, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#th" } } },
  { "atomicNumber": 91, "symbol": "Pa", "names": { "en": "Protactinium", "de": "Protactinium" }, "aliases": { "en": ["Protoactinium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pa" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "weight": { "kind": "value", "decimal": "231.03588", "uncertaintyDigits": "1", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pa" } }, "configuration": { "status": "reported", "value": "[Rn] 5f2 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } }, "shells": [2, 8, 18, 32, 20, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pa" } } },
  { "atomicNumber": 92, "symbol": "U", "names": { "en": "Uranium", "de": "Uran" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#U" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "weight": { "kind": "value", "decimal": "238.02891", "uncertaintyDigits": "3", "noteCodes": ["g", "m"], "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#U" } }, "configuration": { "status": "reported", "value": "[Rn] 5f3 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } }, "shells": [2, 8, 18, 32, 21, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#u" } } },
  { "atomicNumber": 93, "symbol": "Np", "names": { "en": "Neptunium", "de": "Neptunium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Np" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Np" } }, "configuration": { "status": "reported", "value": "[Rn] 5f4 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } }, "shells": [2, 8, 18, 32, 22, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#np" } } },
  { "atomicNumber": 94, "symbol": "Pu", "names": { "en": "Plutonium", "de": "Plutonium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pu" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Pu" } }, "configuration": { "status": "reported", "value": "[Rn] 5f6 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } }, "shells": [2, 8, 18, 32, 24, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#pu" } } },
  { "atomicNumber": 95, "symbol": "Am", "names": { "en": "Americium", "de": "Americium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Am" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Am" } }, "configuration": { "status": "reported", "value": "[Rn] 5f7 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } }, "shells": [2, 8, 18, 32, 25, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#am" } } },
  { "atomicNumber": 96, "symbol": "Cm", "names": { "en": "Curium", "de": "Curium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cm" } }, "configuration": { "status": "reported", "value": "[Rn] 5f7 6d1 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } }, "shells": [2, 8, 18, 32, 25, 9, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cm" } } },
  { "atomicNumber": 97, "symbol": "Bk", "names": { "en": "Berkelium", "de": "Berkelium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bk" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bk" } }, "configuration": { "status": "reported", "value": "[Rn] 5f9 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } }, "shells": [2, 8, 18, 32, 27, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bk" } } },
  { "atomicNumber": 98, "symbol": "Cf", "names": { "en": "Californium", "de": "Californium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cf" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cf" } }, "configuration": { "status": "reported", "value": "[Rn] 5f10 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } }, "shells": [2, 8, 18, 32, 28, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cf" } } },
  { "atomicNumber": 99, "symbol": "Es", "names": { "en": "Einsteinium", "de": "Einsteinium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Es" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Es" } }, "configuration": { "status": "reported", "value": "[Rn] 5f11 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } }, "shells": [2, 8, 18, 32, 29, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#es" } } },
  { "atomicNumber": 100, "symbol": "Fm", "names": { "en": "Fermium", "de": "Fermium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fm" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fm" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f12 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } }, "shells": [2, 8, 18, 32, 30, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fm" } } },
  { "atomicNumber": 101, "symbol": "Md", "names": { "en": "Mendelevium", "de": "Mendelevium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Md" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Md" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f13 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } }, "shells": [2, 8, 18, 32, 31, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#md" } } },
  { "atomicNumber": 102, "symbol": "No", "names": { "en": "Nobelium", "de": "Nobelium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#No" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "period": 7, "group": { "status": "unassigned", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#No" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } }, "shells": [2, 8, 18, 32, 32, 8, 2], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#no" } } },
  { "atomicNumber": 103, "symbol": "Lr", "names": { "en": "Lawrencium", "de": "Lawrencium" }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lr" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "period": 7, "group": { "status": "convention-dependent", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "block": { "status": "reported", "value": "f", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lr" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 7s2 7p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } }, "shells": [2, 8, 18, 32, 32, 8, 3], "phase": { "status": "reported", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lr" } } },
  { "atomicNumber": 104, "symbol": "Rf", "names": { "en": "Rutherfordium", "de": "Rutherfordium" }, "aliases": { "en": ["Unnilquadium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rf" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "period": 7, "group": { "status": "reported", "value": 4, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rf" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d2 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } }, "shells": [2, 8, 18, 32, 32, 10, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rf" } } },
  { "atomicNumber": 105, "symbol": "Db", "names": { "en": "Dubnium", "de": "Dubnium" }, "aliases": { "en": ["Hahnium", "Unnilpentium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Db" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "period": 7, "group": { "status": "reported", "value": 5, "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Db" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d3 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } }, "shells": [2, 8, 18, 32, 32, 11, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#db" } } },
  { "atomicNumber": 106, "symbol": "Sg", "names": { "en": "Seaborgium", "de": "Seaborgium" }, "aliases": { "en": ["Unnilhexium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sg" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "period": 7, "group": { "status": "reported", "value": 6, "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Sg" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d4 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } }, "shells": [2, 8, 18, 32, 32, 12, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#sg" } } },
  { "atomicNumber": 107, "symbol": "Bh", "names": { "en": "Bohrium", "de": "Bohrium" }, "aliases": { "en": ["Unnilseptium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bh" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "period": 7, "group": { "status": "reported", "value": 7, "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Bh" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d5 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } }, "shells": [2, 8, 18, 32, 32, 13, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#bh" } } },
  { "atomicNumber": 108, "symbol": "Hs", "names": { "en": "Hassium", "de": "Hassium" }, "aliases": { "en": ["Unniloctium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hs" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "period": 7, "group": { "status": "reported", "value": 8, "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Hs" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d6 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } }, "shells": [2, 8, 18, 32, 32, 14, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#hs" } } },
  { "atomicNumber": 109, "symbol": "Mt", "names": { "en": "Meitnerium", "de": "Meitnerium" }, "aliases": { "en": ["Unnilennium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mt" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "period": 7, "group": { "status": "reported", "value": 9, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mt" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d7 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } }, "shells": [2, 8, 18, 32, 32, 15, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mt" } } },
  { "atomicNumber": 110, "symbol": "Ds", "names": { "en": "Darmstadtium", "de": "Darmstadtium" }, "aliases": { "en": ["Ununnilium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ds" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "period": 7, "group": { "status": "reported", "value": 10, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ds" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d8 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } }, "shells": [2, 8, 18, 32, 32, 16, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ds" } } },
  { "atomicNumber": 111, "symbol": "Rg", "names": { "en": "Roentgenium", "de": "Roentgenium" }, "aliases": { "en": ["Unununium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rg" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "period": 7, "group": { "status": "reported", "value": 11, "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Rg" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d9 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } }, "shells": [2, 8, 18, 32, 32, 17, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#rg" } } },
  { "atomicNumber": 112, "symbol": "Cn", "names": { "en": "Copernicium", "de": "Copernicium" }, "aliases": { "en": ["Ununbium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cn" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "period": 7, "group": { "status": "reported", "value": 12, "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "block": { "status": "reported", "value": "d", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Cn" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } }, "shells": [2, 8, 18, 32, 32, 18, 2], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#cn" } } },
  { "atomicNumber": 113, "symbol": "Nh", "names": { "en": "Nihonium", "de": "Nihonium" }, "aliases": { "en": ["Ununtrium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nh" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "period": 7, "group": { "status": "reported", "value": 13, "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Nh" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p1", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } }, "shells": [2, 8, 18, 32, 32, 18, 3], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#nh" } } },
  { "atomicNumber": 114, "symbol": "Fl", "names": { "en": "Flerovium", "de": "Flerovium" }, "aliases": { "en": ["Ununquadium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fl" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "period": 7, "group": { "status": "reported", "value": 14, "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Fl" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p2", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } }, "shells": [2, 8, 18, 32, 32, 18, 4], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#fl" } } },
  { "atomicNumber": 115, "symbol": "Mc", "names": { "en": "Moscovium", "de": "Moscovium" }, "aliases": { "en": ["Ununpentium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mc" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "period": 7, "group": { "status": "reported", "value": 15, "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Mc" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p3", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } }, "shells": [2, 8, 18, 32, 32, 18, 5], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#mc" } } },
  { "atomicNumber": 116, "symbol": "Lv", "names": { "en": "Livermorium", "de": "Livermorium" }, "aliases": { "en": ["Ununhexium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lv" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "period": 7, "group": { "status": "reported", "value": 16, "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Lv" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p4", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } }, "shells": [2, 8, 18, 32, 32, 18, 6], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#lv" } } },
  { "atomicNumber": 117, "symbol": "Ts", "names": { "en": "Tennessine", "de": "Tenness" }, "aliases": { "en": ["Ununseptium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ts" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "period": 7, "group": { "status": "reported", "value": 17, "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Ts" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p5", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } }, "shells": [2, 8, 18, 32, 32, 18, 7], "phase": { "status": "unavailable", "provenance": { "sourceId": "pse-info", "locator": "elements.json#ts" } } },
  { "atomicNumber": 118, "symbol": "Og", "names": { "en": "Oganesson", "de": "Oganesson" }, "aliases": { "en": ["Ununoctium"] }, "identitySources": { "iupac": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Og" }, "germanName": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "period": 7, "group": { "status": "reported", "value": 18, "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "block": { "status": "reported", "value": "p", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "weight": { "kind": "none", "provenance": { "sourceId": "ciaaw", "locator": "atomic-weights.htm#Og" } }, "configuration": { "status": "predicted", "value": "[Rn] 5f14 6d10 7s2 7p6", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } }, "shells": [2, 8, 18, 32, 32, 18, 8], "phase": { "status": "predicted", "value": "solid", "provenance": { "sourceId": "pse-info", "locator": "elements.json#og" } } }
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
  for (const row of [...new Set(cells.map((cell) => cell.row))].sort((a4, b4) => a4 - b4)) {
    rows.push({
      row,
      section: row <= layout.periodRows ? "main" : "series",
      cells: cells.filter((cell) => cell.row === row).sort((a4, b4) => a4.column - b4.column)
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
function firstInRow(row, grid = GRID) {
  return grid.rows.find((entry) => entry.row === row)?.cells[0]?.atomicNumber ?? null;
}
function seriesJumpTarget(seriesRow, grid = GRID) {
  return firstInRow(seriesRow, grid);
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
    (a4, b4) => KIND_RANK[a4.result.kind] - KIND_RANK[b4.result.kind] || a4.languageRank - b4.languageRank || a4.result.atomicNumber - b4.result.atomicNumber
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

// periodic-table/strings.ts
var EN = {
  widgetLabel: "Periodic table",
  searchLabel: "Search elements",
  searchPlaceholder: "Name, symbol or atomic number",
  filterLabel: "Family",
  filterAll: "All families",
  viewLabel: "Layout",
  viewTable: "Table",
  viewList: "List",
  reset: "Reset",
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
  jumpToSeries: "Jump to {series}",
  detailsLabel: "Element details",
  detailsEmpty: "Select an element to see its details.",
  detailsHint: "Values refer to the neutral atom at 25 \xB0C and 1 bar.",
  fieldGroup: "Group",
  fieldPeriod: "Period",
  fieldFamily: "Family",
  fieldBlock: "Block",
  fieldWeight: "Standard atomic weight",
  fieldPhase: "State",
  fieldConfiguration: "Electron configuration",
  fieldShells: "Electrons per shell",
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
  sourcesLabel: "Sources",
  sourcesHint: "Each field names the source it was taken from.",
  sourceRelease: "Release {release}",
  sourceRetrieved: "Retrieved {retrieved}",
  sourceLicense: "License: {license}",
  fieldIdentity: "Identity",
  fieldGermanName: "German name",
  printTitle: "Periodic table"
};
var DE = {
  widgetLabel: "Periodensystem",
  searchLabel: "Elemente suchen",
  searchPlaceholder: "Name, Symbol oder Ordnungszahl",
  filterLabel: "Stoffklasse",
  filterAll: "Alle Stoffklassen",
  viewLabel: "Darstellung",
  viewTable: "Tabelle",
  viewList: "Liste",
  reset: "Zur\xFCcksetzen",
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
  jumpToSeries: "Zu {series} springen",
  detailsLabel: "Elementdaten",
  detailsEmpty: "W\xE4hle ein Element, um seine Daten zu sehen.",
  detailsHint: "Die Werte gelten f\xFCr das neutrale Atom bei 25 \xB0C und 1 bar.",
  fieldGroup: "Gruppe",
  fieldPeriod: "Periode",
  fieldFamily: "Stoffklasse",
  fieldBlock: "Block",
  fieldWeight: "Standardatommasse",
  fieldPhase: "Aggregatzustand",
  fieldConfiguration: "Elektronenkonfiguration",
  fieldShells: "Elektronen je Schale",
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
  sourcesLabel: "Quellen",
  sourcesHint: "Jedes Feld nennt die Quelle, aus der es stammt.",
  sourceRelease: "Ausgabe {release}",
  sourceRetrieved: "Abgerufen am {retrieved}",
  sourceLicense: "Lizenz: {license}",
  fieldIdentity: "Identit\xE4t",
  fieldGermanName: "Deutscher Name",
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

// periodic-table/details.ts
function conditionsText(language) {
  return format(strings(language).conditions, {
    temperature: CONDITIONS.temperatureK - 273.15,
    pressure: CONDITIONS.pressureBar
  });
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
  const t5 = strings(language);
  switch (element.group.status) {
    case "reported":
    case "predicted":
      return String(element.group.value);
    case "convention-dependent":
      return t5.groupConventionDependent;
    case "unassigned":
      return t5.groupUnassigned;
    case "unavailable":
      return t5.valueUnavailable;
  }
}
function categoryText(element, language) {
  const category = categoryOf(element.atomicNumber);
  return category ? CATEGORIES[category]?.[language] ?? category : "";
}
function detailRows(element, language) {
  const t5 = strings(language);
  const rows = [
    { key: "group", label: t5.fieldGroup, value: groupText(element, language) },
    { key: "period", label: t5.fieldPeriod, value: String(element.period) },
    { key: "family", label: t5.fieldFamily, value: categoryText(element, language) }
  ];
  if (element.block.status === "unavailable") {
    rows.push({ key: "block", label: t5.fieldBlock, value: t5.valueUnavailable });
  } else {
    rows.push({
      key: "block",
      label: t5.fieldBlock,
      value: element.block.value,
      ...element.block.status === "predicted" ? { qualifier: t5.valuePredicted } : {}
    });
  }
  rows.push({ key: "weight", label: t5.fieldWeight, value: weightText(element, language) });
  if (element.phase.status === "unavailable") {
    rows.push({ key: "phase", label: t5.fieldPhase, value: t5.valueUnavailable });
  } else {
    const phase = { solid: t5.phaseSolid, liquid: t5.phaseLiquid, gas: t5.phaseGas }[element.phase.value];
    rows.push({
      key: "phase",
      label: t5.fieldPhase,
      value: phase,
      ...element.phase.status === "predicted" ? { qualifier: t5.valuePredicted } : {}
    });
  }
  if (element.configuration.status === "unavailable") {
    rows.push({ key: "configuration", label: t5.fieldConfiguration, value: t5.valueUnavailable });
  } else {
    rows.push({
      key: "configuration",
      label: t5.fieldConfiguration,
      value: element.configuration.value,
      ...element.configuration.status === "predicted" ? { qualifier: t5.valuePredicted } : {}
    });
  }
  rows.push({ key: "shells", label: t5.fieldShells, value: element.shells.join(" \xB7 ") });
  return rows;
}
function sourceUsage(element, language) {
  const t5 = strings(language);
  const fields = [
    [t5.fieldIdentity, element.identitySources.iupac],
    [t5.fieldGermanName, element.identitySources.germanName],
    [t5.fieldGroup, element.group.provenance],
    [t5.fieldBlock, element.block.provenance],
    [t5.fieldWeight, element.weight.kind === "unavailable" ? void 0 : element.weight.provenance],
    [t5.fieldPhase, element.phase.provenance],
    [t5.fieldConfiguration, element.configuration.provenance]
  ];
  const usage = /* @__PURE__ */ new Map();
  for (const [label, provenance] of fields) {
    if (!provenance) continue;
    const entry = usage.get(provenance.sourceId);
    if (entry) entry.push(label);
    else usage.set(provenance.sourceId, [label]);
  }
  return [...usage].map(([sourceId, labels]) => ({ sourceId, fields: labels }));
}
function sourceOf(sourceId) {
  return SOURCES[sourceId];
}

// periodic-table/styles.ts
var periodicTableStyles = i`
	:host {
		display: block;
		box-sizing: border-box;
		padding: 0.75rem;
		font-family: var(--sl-font-sans, system-ui, sans-serif);
		color: var(--sl-color-neutral-900, #1c1c1e);
		background: var(--sl-color-neutral-0, #ffffff);

		--pt-cell-height: 2.6rem;
		--pt-gutter: 1.5rem;
		--pt-series-gap: 0.5rem;
		--pt-radius: 4px;
		--pt-border: var(--sl-color-neutral-200, #e2e2e6);
		--pt-surface: var(--sl-color-neutral-0, #ffffff);
		--pt-inset: var(--sl-color-neutral-50, #f7f7f8);
		--pt-ink: var(--sl-color-neutral-900, #1c1c1e);
		--pt-ink-soft: var(--sl-color-neutral-700, #3f3f46);
		--pt-accent: var(--sl-color-primary-600, #0b6bcb);

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
	}

	* {
		box-sizing: border-box;
	}

	.widget {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 0.5rem;
	}

	.toolbar .search {
		flex: 1 1 12rem;
		min-width: 8rem;
	}

	.toolbar .filter {
		flex: 0 1 11rem;
		min-width: 8rem;
	}

	.toolbar sl-input::part(form-control-label),
	.toolbar sl-select::part(form-control-label) {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.views {
		display: flex;
		gap: 0.25rem;
	}

	.result-count {
		min-height: 1rem;
		margin: 0;
		font-size: 0.8rem;
		color: var(--pt-ink-soft);
	}

	.body {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
		align-items: start;
	}

	@container (min-width: 1000px) {
		.body {
			grid-template-columns: minmax(0, 1fr) 18rem;
		}
	}

	.table-pane {
		min-width: 0;
		overflow-x: auto;
		padding-bottom: 0.25rem;
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

	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 0;
		min-height: var(--pt-cell-height);
		padding: 2px 1px;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 12%, transparent);
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-inset));
		color: var(--pt-ink);
		font: inherit;
		line-height: 1.05;
		text-align: center;
		cursor: pointer;
	}

	.cell:hover {
		filter: brightness(0.96);
	}

	.cell[aria-disabled="true"] {
		opacity: 0.3;
		cursor: default;
	}

	.cell[aria-disabled="true"]:hover {
		filter: none;
	}

	.cell:focus-visible {
		outline: 2px solid var(--pt-accent);
		outline-offset: 1px;
	}

	.cell[aria-selected="true"] {
		border-color: var(--pt-accent);
		box-shadow: inset 0 0 0 2px var(--pt-accent);
	}

	.cell-number {
		font-size: 0.55rem;
		color: var(--pt-ink-soft);
	}

	.cell-symbol {
		font-size: 0.85rem;
		font-weight: 600;
	}

	.cell-name {
		display: none;
		max-width: 100%;
		overflow: hidden;
		font-size: 0.5rem;
		color: var(--pt-ink-soft);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@container (min-width: 1000px) {
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

	.series-jumps {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.4rem;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.4rem;
		margin: 0.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.15rem 0.45rem;
		border: 1px solid var(--pt-border);
		border-radius: 999px;
		background: var(--pt-surface);
		color: var(--pt-ink-soft);
		font: inherit;
		font-size: 0.7rem;
		cursor: pointer;
	}

	.legend-item[aria-pressed="true"] {
		border-color: var(--pt-accent);
		color: var(--pt-ink);
		box-shadow: inset 0 0 0 1px var(--pt-accent);
	}

	.legend-item:focus-visible {
		outline: 2px solid var(--pt-accent);
		outline-offset: 1px;
	}

	.legend-swatch {
		width: 0.7rem;
		height: 0.7rem;
		border: 1px solid color-mix(in srgb, var(--pt-ink) 15%, transparent);
		border-radius: 2px;
		background: var(--pt-cell-fill);
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

	.list-row:hover {
		background: var(--pt-inset);
	}

	.list-row:focus-visible {
		outline: 2px solid var(--pt-accent);
		outline-offset: 1px;
	}

	.list-row[aria-pressed="true"] {
		border-color: var(--pt-accent);
		box-shadow: inset 0 0 0 1px var(--pt-accent);
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

	.list-category {
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
	}

	.list-details {
		margin: 0.25rem 0 0.5rem;
	}

	.details {
		min-width: 0;
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--pt-border);
		border-radius: 6px;
		background: var(--pt-surface);
	}

	.details-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.details-symbol {
		display: grid;
		place-items: center;
		width: 2.6rem;
		height: 2.6rem;
		border-radius: var(--pt-radius);
		background: var(--pt-cell-fill, var(--pt-inset));
		font-size: 1.1rem;
		font-weight: 600;
	}

	.details-name {
		margin: 0;
		font-size: 1rem;
	}

	.details-sub {
		margin: 0;
		font-size: 0.75rem;
		color: var(--pt-ink-soft);
	}

	.details-fields {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.2rem 0.6rem;
		margin: 0.6rem 0 0;
		font-size: 0.78rem;
	}

	.details-row {
		display: contents;
	}

	.details-row dt {
		color: var(--pt-ink-soft);
	}

	.details-row dd {
		margin: 0;
		overflow-wrap: anywhere;
	}

	.qualifier {
		margin-left: 0.3rem;
		font-size: 0.65rem;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--pt-ink-soft);
	}

	.details-hint {
		margin: 0.5rem 0 0;
		font-size: 0.7rem;
		color: var(--pt-ink-soft);
	}

	.details-empty {
		margin: 0;
		font-size: 0.8rem;
		color: var(--pt-ink-soft);
	}

	.sources {
		margin-top: 0.6rem;
		font-size: 0.75rem;
	}

	.source {
		margin-top: 0.4rem;
	}

	.source-title {
		margin: 0;
		font-size: 0.78rem;
	}

	.source-line {
		margin: 0.1rem 0 0;
		color: var(--pt-ink-soft);
	}

	.source-link {
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
		:host {
			padding: 0;
		}

		.toolbar,
		.result-count,
		.table-pane,
		.details-pane,
		.series-jumps,
		.legend {
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

	:host(.ww-beforeprint) .toolbar,
	:host(.ww-beforeprint) .result-count,
	:host(.ww-beforeprint) .table-pane,
	:host(.ww-beforeprint) .details-pane,
	:host(.ww-beforeprint) .series-jumps,
	:host(.ww-beforeprint) .legend {
		display: none !important;
	}

	:host(.ww-beforeprint) .print-overview {
		display: block;
	}

	@media (forced-colors: active) {
		.cell,
		.list-row,
		.legend-item,
		.details,
		.placeholder-text {
			border: 1px solid CanvasText;
			background: Canvas;
		}

		.cell:focus-visible,
		.list-row:focus-visible,
		.legend-item:focus-visible {
			outline: 2px solid Highlight;
		}

		.cell[aria-selected="true"],
		.list-row[aria-pressed="true"] {
			outline: 2px solid Highlight;
		}
	}
`;

// webwriter-chemlab-periodic-table.ts
setBasePath("@shoelace-style/shoelace/dist");
var VIEWS = ["auto", "table", "list"];
var LIST_BREAKPOINT = 680;
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
var _clearInitialElement_dec, _view_dec, _initialElement_dec, _a2, _ChemLabPeriodicTable_decorators, _init2, _initialElement, _view, _selection, _initialized, _viewOverride, _query, _category, _width, _resizeObserver, _languageObserver, _matching, _rovingOverride, _focusBeforeLayout, _restoreFocusPending, _ChemLabPeriodicTable_instances, observeLanguage_fn, measure_fn, captureResultFocus_fn, reveal_fn, language_get, resolvedView_get, matches_fn, selectFromUser_fn, clearFromUser_fn, dispatchSelection_fn, setView_fn, toggleCategory_fn, jumpToSeries_fn, focusElement_fn, reset_fn, _onQueryInput, _onSearchKeydown, _onCategoryChange, _onCellKeydown, rovingTarget_fn, renderCount_fn, renderToolbar_fn, renderCell_fn, renderGrid_fn, renderList_fn, renderPrintOverview_fn, renderDetails_fn;
_ChemLabPeriodicTable_decorators = [t2("webwriter-chemlab-periodic-table")];
var _ChemLabPeriodicTable = class _ChemLabPeriodicTable extends (_a2 = LitElementWw, _initialElement_dec = [n7({ type: Number, reflect: true, attribute: "initial-element", converter: atomicNumberConverter })], _view_dec = [n7({ type: String, reflect: true, converter: viewConverter })], _clearInitialElement_dec = [action({ label: { _: "Clear initial element", "de-DE": "Startelement entfernen" } })], _a2) {
  constructor() {
    super(...arguments);
    __runInitializers(_init2, 5, this);
    __privateAdd(this, _ChemLabPeriodicTable_instances);
    __publicField(this, "options", _ChemLabPeriodicTable.options);
    __publicField(this, "optionGroups", _ChemLabPeriodicTable.optionGroups);
    __privateAdd(this, _initialElement, __runInitializers(_init2, 8, this, null)), __runInitializers(_init2, 11, this);
    __privateAdd(this, _view, __runInitializers(_init2, 12, this, "auto")), __runInitializers(_init2, 15, this);
    __privateAdd(this, _selection, new SelectionModel());
    __privateAdd(this, _initialized, false);
    __privateAdd(this, _viewOverride, null);
    __privateAdd(this, _query, "");
    __privateAdd(this, _category, null);
    __privateAdd(this, _width, null);
    __privateAdd(this, _resizeObserver, null);
    __privateAdd(this, _languageObserver, null);
    __privateAdd(this, _matching, /* @__PURE__ */ new Set());
    __privateAdd(this, _rovingOverride, null);
    __privateAdd(this, _focusBeforeLayout, null);
    __privateAdd(this, _restoreFocusPending, false);
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
    /** Reads the family filter. */
    __privateAdd(this, _onCategoryChange, (event) => {
      const value = event.target.value ?? "";
      __privateSet(this, _category, value === "" ? null : value);
      this.requestUpdate();
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
   * the switch between the grid and the list. When it is no longer part of the
   * results, the search field is the stable fallback.
   */
  updated() {
    if (!__privateGet(this, _restoreFocusPending)) return;
    __privateSet(this, _restoreFocusPending, false);
    const previous = __privateGet(this, _focusBeforeLayout);
    __privateSet(this, _focusBeforeLayout, null);
    const target = focusTargetAfterLayout(previous, (atomicNumber) => __privateGet(this, _matching).has(atomicNumber));
    const element = target === null ? null : this.renderRoot.querySelector(`[data-atomic-number="${target}"]`);
    if (!element) {
      this.renderRoot.querySelector("sl-input")?.focus();
      return;
    }
    element.focus();
    __privateMethod(this, _ChemLabPeriodicTable_instances, reveal_fn).call(this, element);
  }
  render() {
    const language = __privateGet(this, _ChemLabPeriodicTable_instances, language_get);
    const t5 = strings(language);
    const matches = __privateMethod(this, _ChemLabPeriodicTable_instances, matches_fn).call(this);
    const matching = new Set(matches.map((match) => match.atomicNumber));
    __privateSet(this, _matching, matching);
    const selected = __privateGet(this, _selection).value;
    const element = selected === null ? null : elementByAtomicNumber(selected) ?? null;
    const details = __privateMethod(this, _ChemLabPeriodicTable_instances, renderDetails_fn).call(this, t5, language, element);
    const resolved = __privateGet(this, _ChemLabPeriodicTable_instances, resolvedView_get);
    return x2`
			<div class="widget">
				${__privateMethod(this, _ChemLabPeriodicTable_instances, renderToolbar_fn).call(this, t5, language)}
				<p class="result-count" aria-live="polite">${__privateMethod(this, _ChemLabPeriodicTable_instances, renderCount_fn).call(this, t5, matches.length)}</p>
				${resolved === "list" ? __privateMethod(this, _ChemLabPeriodicTable_instances, renderList_fn).call(this, t5, language, matches, details) : x2`
						<div class="body">
							${__privateMethod(this, _ChemLabPeriodicTable_instances, renderGrid_fn).call(this, t5, language, matching)}
							<div class="details-pane">${details}</div>
						</div>
					`}
				${__privateMethod(this, _ChemLabPeriodicTable_instances, renderPrintOverview_fn).call(this, t5, language, element)}
			</div>
		`;
  }
};
_init2 = __decoratorStart(_a2);
_initialElement = new WeakMap();
_view = new WeakMap();
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
_ChemLabPeriodicTable_instances = new WeakSet();
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
/** Current search hits, best match first. */
matches_fn = function() {
  return searchElements(__privateGet(this, _query), { locale: __privateGet(this, _ChemLabPeriodicTable_instances, language_get), category: __privateGet(this, _category) });
};
/**
 * Selects an element after a user action and reports the change.
 *
 * @param atomicNumber - Atomic number the user picked.
 */
selectFromUser_fn = function(atomicNumber) {
  if (!__privateGet(this, _selection).select(atomicNumber)) return;
  this.requestUpdate();
  __privateMethod(this, _ChemLabPeriodicTable_instances, dispatchSelection_fn).call(this);
};
/** Clears the selection after a user action and reports the change. */
clearFromUser_fn = function() {
  if (!__privateGet(this, _selection).clear()) return;
  this.requestUpdate();
  __privateMethod(this, _ChemLabPeriodicTable_instances, dispatchSelection_fn).call(this);
};
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
 * Moves focus to the first element of a detached series.
 *
 * The jump is a navigation aid, not a selection: it changes no selection and
 * dispatches no event. The tab order follows the jump so Tab returns there.
 *
 * @param seriesRow - Row of the detached series.
 */
jumpToSeries_fn = function(seriesRow) {
  const target = seriesJumpTarget(seriesRow);
  if (target === null) return;
  __privateSet(this, _rovingOverride, target);
  this.requestUpdate();
  __privateMethod(this, _ChemLabPeriodicTable_instances, focusElement_fn).call(this, target);
};
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
_onQueryInput = new WeakMap();
_onSearchKeydown = new WeakMap();
_onCategoryChange = new WeakMap();
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
renderCount_fn = function(t5, count) {
  if (count === 0) return t5.noResults;
  if (count === 1) return t5.resultCountOne;
  return format(t5.resultCount, { count });
};
/**
 * Renders the toolbar with search, family filter, layout switch and reset.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @returns The toolbar.
 */
renderToolbar_fn = function(t5, language) {
  const resolved = __privateGet(this, _ChemLabPeriodicTable_instances, resolvedView_get);
  return x2`
			<div class="toolbar">
				<sl-input
					class="search"
					type="search"
					size="small"
					clearable
					label=${t5.searchLabel}
					placeholder=${t5.searchPlaceholder}
					.value=${__privateGet(this, _query)}
					@sl-input=${__privateGet(this, _onQueryInput)}
					@keydown=${__privateGet(this, _onSearchKeydown)}
				></sl-input>
				<sl-select
					class="filter"
					size="small"
					clearable
					label=${t5.filterLabel}
					placeholder=${t5.filterAll}
					.value=${__privateGet(this, _category) ?? ""}
					@sl-change=${__privateGet(this, _onCategoryChange)}
				>
					${Object.entries(CATEGORIES).map(([key, category]) => x2`
						<sl-option value=${key}>${category[language]}</sl-option>
					`)}
				</sl-select>
				<div class="views" role="group" aria-label=${t5.viewLabel}>
					<sl-button
						size="small"
						variant=${resolved === "table" ? "primary" : "default"}
						@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, setView_fn).call(this, "table")}
					>${t5.viewTable}</sl-button>
					<sl-button
						size="small"
						variant=${resolved === "list" ? "primary" : "default"}
						@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, setView_fn).call(this, "list")}
					>${t5.viewList}</sl-button>
				</div>
				<sl-button size="small" @click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, reset_fn).call(this)}>${t5.reset}</sl-button>
			</div>
		`;
};
/**
 * Renders one element cell of the grid.
 *
 * @param cell - Cell of the display grid.
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param matching - Atomic numbers that pass the current filter.
 * @param roving - Atomic number of the tabbable cell.
 * @returns The grid cell.
 */
renderCell_fn = function(cell, t5, language, matching, roving) {
  const element = elementByAtomicNumber(cell.atomicNumber);
  if (!element) return null;
  const enabled = matching.has(cell.atomicNumber);
  const selected = __privateGet(this, _selection).value === cell.atomicNumber;
  const displayRow = cell.section === "main" ? cell.row + 1 : cell.row + 2;
  const label = format(t5.cellLabel, {
    number: element.atomicNumber,
    name: element.names[language],
    symbol: element.symbol,
    category: categoryText(element, language)
  });
  return x2`
			<div
				class="cell category-${cell.category}"
				role="gridcell"
				aria-selected=${selected}
				aria-disabled=${!enabled}
				aria-label=${label}
				tabindex=${cell.atomicNumber === roving ? 0 : -1}
				data-atomic-number=${cell.atomicNumber}
				style="--pt-row:${displayRow};--pt-column:${cell.column + 1}"
				@click=${() => enabled && __privateMethod(this, _ChemLabPeriodicTable_instances, selectFromUser_fn).call(this, cell.atomicNumber)}
				@keydown=${(event) => enabled && __privateGet(this, _onCellKeydown).call(this, event, cell.atomicNumber)}
			>
				<span class="cell-number">${cell.atomicNumber}</span>
				<span class="cell-symbol">${element.symbol}</span>
				<span class="cell-name">${element.names[language]}</span>
			</div>
		`;
};
/**
 * Renders the table layout.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param matching - Atomic numbers that pass the current filter.
 * @returns The grid with group labels, period gutter, placeholders and series rows.
 */
renderGrid_fn = function(t5, language, matching) {
  const roving = __privateMethod(this, _ChemLabPeriodicTable_instances, rovingTarget_fn).call(this, matching);
  const groupLabels = Array.from({ length: GRID.columns }, (_3, index) => x2`
			<div
				class="group-label"
				role="columnheader"
				style="--pt-row:1;--pt-column:${index + 2}"
			>${index + 1}</div>
		`);
  const mainRows = GRID.rows.filter((row) => row.section === "main").map((row) => x2`
				<div class="grid-row" role="row">
					<div
						class="gutter"
						role="rowheader"
						style="--pt-row:${row.row + 1};--pt-column:1"
					>${row.row}</div>
					${row.cells.map((cell) => __privateMethod(this, _ChemLabPeriodicTable_instances, renderCell_fn).call(this, cell, t5, language, matching, roving))}
				</div>
			`);
  const placeholders = GRID.placeholders.map((placeholder) => {
    const series = GRID.seriesRows.find((entry) => entry.row === placeholder.seriesRow);
    const text = series ? format(t5.placeholderLabel, {
      first: series.firstAtomicNumber,
      last: series.lastAtomicNumber
    }) : "";
    return x2`
				<div
					class="placeholder category-${placeholder.category}"
					style="--pt-row:${placeholder.row + 1};--pt-column:${placeholder.column + 1}"
				>
					<span class="placeholder-text">${text}</span>
				</div>
			`;
  });
  const seriesRows = GRID.rows.filter((row) => row.section === "series").map((row) => {
    const series = GRID.seriesRows.find((entry) => entry.row === row.row);
    const name = series ? CATEGORIES[series.category]?.[language] ?? series.category : "";
    return x2`
					<div class="grid-row" role="row">
						<div
							class="series-header"
							role="rowheader"
							style="--pt-row:${row.row + 2};--pt-column:1 / span 3"
						>${name}</div>
						${row.cells.map((cell) => __privateMethod(this, _ChemLabPeriodicTable_instances, renderCell_fn).call(this, cell, t5, language, matching, roving))}
					</div>
				`;
  });
  return x2`
			<div class="table-pane">
				<div class="grid" role="grid" aria-label=${t5.gridLabel}>
					<div class="grid-row" role="row">
						<div class="gutter" role="columnheader" style="--pt-row:1;--pt-column:1"></div>
						${groupLabels}
					</div>
					${mainRows}
					${placeholders}
					${seriesRows}
				</div>
				<div class="series-jumps">
					${LAYOUT.seriesRows.map((series) => x2`
						<sl-button size="small" @click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, jumpToSeries_fn).call(this, series.row)}>
							${format(t5.jumpToSeries, {
    series: CATEGORIES[series.category]?.[language] ?? series.category
  })}
						</sl-button>
					`)}
				</div>
				<ul class="legend" aria-label=${t5.legendLabel}>
					${Object.entries(CATEGORIES).map(([key, category]) => x2`
						<li>
							<button
								class="legend-item category-${key}"
								type="button"
								aria-pressed=${__privateGet(this, _category) === key}
								@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, toggleCategory_fn).call(this, key)}
							>
								<span class="legend-swatch"></span>${category[language]}
							</button>
						</li>
					`)}
				</ul>
			</div>
		`;
};
/**
 * Renders the list layout with the detail card after the selected row.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param matches - Search hits in display order.
 * @param details - Rendered detail card.
 * @returns The list.
 */
renderList_fn = function(t5, language, matches, details) {
  const selected = __privateGet(this, _selection).value;
  const selectedVisible = matches.some((match) => match.atomicNumber === selected);
  const rows = matches.map((match) => {
    const element = elementByAtomicNumber(match.atomicNumber);
    if (!element) return null;
    const isSelected = match.atomicNumber === selected;
    return x2`
				<li>
					<button
						class="list-row category-${categoryOf(element.atomicNumber) ?? "unknown"}"
						type="button"
						aria-pressed=${isSelected}
						data-atomic-number=${element.atomicNumber}
						@click=${() => __privateMethod(this, _ChemLabPeriodicTable_instances, selectFromUser_fn).call(this, element.atomicNumber)}
					>
						<span class="list-number">${element.atomicNumber}</span>
						<span class="list-symbol">${element.symbol}</span>
						<span class="list-name">${element.names[language]}</span>
						<span class="list-category">${categoryText(element, language)}</span>
					</button>
					${isSelected ? x2`<div class="list-details">${details}</div>` : null}
				</li>
			`;
  });
  return x2`
			<div class="table-pane">
				<ul class="list" aria-label=${t5.gridLabel}>
					${selectedVisible ? null : x2`<li class="list-details">${details}</li>`}
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
renderPrintOverview_fn = function(t5, language, element) {
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
  const rows = element ? detailRows(element, language) : [];
  return x2`
			<div class="print-overview" aria-hidden="true">
				<h2 class="print-title">${t5.widgetLabel}</h2>
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
							<p class="print-hint">${t5.detailsHint} ${conditionsText(language)}</p>
						` : x2`<p class="print-hint">${t5.detailsEmpty}</p>`}
				</div>
			</div>
		`;
};
/**
 * Renders the detail card of one element.
 *
 * @param t - Interface strings.
 * @param language - Interface language.
 * @param element - Selected element, or `null` for the empty card.
 * @returns The detail card.
 */
renderDetails_fn = function(t5, language, element) {
  if (!element) {
    return x2`<div class="details"><p class="details-empty">${t5.detailsEmpty}</p></div>`;
  }
  const rows = detailRows(element, language);
  const usage = sourceUsage(element, language);
  return x2`
			<div class="details category-${categoryOf(element.atomicNumber) ?? "unknown"}">
				<div class="details-head">
					<div class="details-symbol">${element.symbol}</div>
					<div>
						<h3 class="details-name">${element.names[language]}</h3>
						<p class="details-sub">
							${element.atomicNumber} · ${element.symbol} · ${categoryText(element, language)}
						</p>
					</div>
				</div>
				<dl class="details-fields">
					${rows.map((row) => x2`
						<div class="details-row">
							<dt>${row.label}</dt>
							<dd>
								${row.value}${row.qualifier ? x2`<span class="qualifier">${row.qualifier}</span>` : null}
							</dd>
						</div>
					`)}
				</dl>
				<p class="details-hint">${t5.detailsHint} ${conditionsText(language)}</p>
				<sl-details class="sources" summary=${t5.sourcesLabel}>
					<p class="details-hint">${t5.sourcesHint}</p>
					${usage.map((entry) => {
    const source = sourceOf(entry.sourceId);
    if (!source) return null;
    return x2`
							<div class="source">
								<p class="source-title">${source.publisher} — ${source.title}</p>
								<p class="source-line">${entry.fields.join(", ")}</p>
								<p class="source-line">
									${format(t5.sourceRelease, { release: source.release })} ·
									${format(t5.sourceRetrieved, { retrieved: source.retrieved })}
								</p>
								<p class="source-line">
									${format(t5.sourceLicense, { license: source.license })}
								</p>
								<a
									class="source-link"
									href=${source.url}
									target="_blank"
									rel="noreferrer noopener"
								>${source.url}</a>
							</div>
						`;
  })}
				</sl-details>
			</div>
		`;
};
__decorateElement(_init2, 4, "initialElement", _initialElement_dec, _ChemLabPeriodicTable, _initialElement);
__decorateElement(_init2, 4, "view", _view_dec, _ChemLabPeriodicTable, _view);
__decorateElement(_init2, 1, "clearInitialElement", _clearInitialElement_dec, _ChemLabPeriodicTable);
_ChemLabPeriodicTable = __decorateElement(_init2, 0, "ChemLabPeriodicTable", _ChemLabPeriodicTable_decorators, _ChemLabPeriodicTable);
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
__runInitializers(_init2, 1, _ChemLabPeriodicTable);
var ChemLabPeriodicTable = _ChemLabPeriodicTable;
export {
  ChemLabPeriodicTable
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
*/
