import { wrapFieldsWithMeta as Wt, Button as k4, defineStaticConfig as j4 } from "tinacms";
import * as T from "react";
import R, { useLayoutEffect as U4, useEffect as Q, useRef as a1, useState as F1, forwardRef as F4, Fragment as s0, isValidElement as q4, cloneElement as W4, createElement as G4, createContext as G1, useContext as E1, useMemo as i1, useReducer as X4, createRef as dt } from "react";
var K4 = { exports: {} }, v2 = { exports: {} }, R1 = {};
Object.defineProperty(R1, "__esModule", {
  value: !0
});
R1.default = Y4;
function Y4() {
  return u2.apply(this, arguments);
}
function u2() {
  return u2 = Object.assign || function(t) {
    for (var e = 1; e < arguments.length; e++) {
      var r = arguments[e];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
    }
    return t;
  }, u2.apply(this, arguments);
}
var l1 = {};
Object.defineProperty(l1, "__esModule", {
  value: !0
});
l1.default = Q4;
function Q4(t) {
  return t && t.__esModule ? t : {
    default: t
  };
}
var X1 = {};
Object.defineProperty(X1, "__esModule", {
  value: !0
});
X1.default = J4;
function J4(t) {
  if (t && t.__esModule)
    return t;
  if (t === null || typeof t != "object" && typeof t != "function")
    return {
      default: t
    };
  var e = Gt();
  if (e && e.has(t))
    return e.get(t);
  var r = {}, n = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var c in t)
    if (Object.prototype.hasOwnProperty.call(t, c)) {
      var i = n ? Object.getOwnPropertyDescriptor(t, c) : null;
      i && (i.get || i.set) ? Object.defineProperty(r, c, i) : r[c] = t[c];
    }
  return r.default = t, e && e.set(t, r), r;
}
function Gt() {
  if (typeof WeakMap != "function")
    return null;
  var t = /* @__PURE__ */ new WeakMap();
  return Gt = function() {
    return t;
  }, t;
}
var P2 = {};
Object.defineProperty(P2, "__esModule", {
  value: !0
});
P2.default = te;
var Z4 = X1.default, S2 = Z4(R);
function te(t) {
  const { headManager: e, reduceComponentsToState: r } = t;
  function n() {
    if (e && e.mountedInstances) {
      const i = S2.Children.toArray(Array.from(e.mountedInstances).filter(Boolean));
      e.updateHead(r(i, t));
    }
  }
  if (E2) {
    var c;
    e == null || (c = e.mountedInstances) == null || c.add(t.children), n();
  }
  return gt(() => {
    var i;
    return e == null || (i = e.mountedInstances) == null || i.add(t.children), () => {
      var l;
      e == null || (l = e.mountedInstances) == null || l.delete(t.children);
    };
  }), gt(() => (e && (e._pendingUpdate = n), () => {
    e && (e._pendingUpdate = n);
  })), ee(() => (e && e._pendingUpdate && (e._pendingUpdate(), e._pendingUpdate = null), () => {
    e && e._pendingUpdate && (e._pendingUpdate(), e._pendingUpdate = null);
  })), null;
}
const E2 = typeof window > "u", gt = E2 ? () => {
} : S2.useLayoutEffect, ee = E2 ? () => {
} : S2.useEffect;
var D0 = {};
Object.defineProperty(D0, "__esModule", {
  value: !0
});
D0.AmpStateContext = void 0;
var ae = l1.default, re = ae(R);
const Xt = re.default.createContext({});
D0.AmpStateContext = Xt;
process.env.NODE_ENV !== "production" && (Xt.displayName = "AmpStateContext");
var f0 = {};
Object.defineProperty(f0, "__esModule", {
  value: !0
});
f0.HeadManagerContext = void 0;
var ne = l1.default, ce = ne(R);
const Kt = ce.default.createContext({});
f0.HeadManagerContext = Kt;
process.env.NODE_ENV !== "production" && (Kt.displayName = "HeadManagerContext");
var R2 = {};
Object.defineProperty(R2, "__esModule", {
  value: !0
});
R2.isInAmpMode = ie;
function ie({ ampFirst: t = !1, hybrid: e = !1, hasQuery: r = !1 } = {}) {
  return t || e && r;
}
var U = {}, k0 = {};
Object.defineProperty(k0, "__esModule", {
  value: !0
});
k0.default = le;
function le(t) {
  return function() {
    var e = this, r = arguments;
    return new Promise(function(n, c) {
      var i = t.apply(e, r);
      function l(o) {
        ft(i, n, c, l, s, "next", o);
      }
      function s(o) {
        ft(i, n, c, l, s, "throw", o);
      }
      l(void 0);
    });
  };
}
function ft(t, e, r, n, c, i, l) {
  try {
    var s = t[i](l), o = s.value;
  } catch (h) {
    r(h);
    return;
  }
  s.done ? e(o) : Promise.resolve(o).then(n, c);
}
Object.defineProperty(U, "__esModule", {
  value: !0
});
U.execOnce = he;
U.getLocationOrigin = Yt;
U.getURL = ue;
U.getDisplayName = b0;
U.isResSent = Qt;
U.normalizeRepeatedSlashes = de;
U.loadGetInitialProps = Jt;
U.ST = U.SP = U.warnOnce = U.isAbsoluteUrl = void 0;
var oe = k0.default;
function he(t) {
  let e = !1, r;
  return (...n) => (e || (e = !0, r = t(...n)), r);
}
const se = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/, ve = (t) => se.test(t);
U.isAbsoluteUrl = ve;
function Yt() {
  const { protocol: t, hostname: e, port: r } = window.location;
  return `${t}//${e}${r ? ":" + r : ""}`;
}
function ue() {
  const { href: t } = window.location, e = Yt();
  return t.substring(e.length);
}
function b0(t) {
  return typeof t == "string" ? t : t.displayName || t.name || "Unknown";
}
function Qt(t) {
  return t.finished || t.headersSent;
}
function de(t) {
  const e = t.split("?");
  return e[0].replace(/\\/g, "/").replace(/\/\/+/g, "/") + (e[1] ? `?${e.slice(1).join("?")}` : "");
}
function Jt(t, e) {
  return d2.apply(this, arguments);
}
function d2() {
  return d2 = oe(function* (t, e) {
    if (process.env.NODE_ENV !== "production") {
      var r;
      if ((r = t.prototype) != null && r.getInitialProps) {
        const i = `"${b0(t)}.getInitialProps()" is defined as an instance method - visit https://nextjs.org/docs/messages/get-initial-props-as-an-instance-method for more information.`;
        throw new Error(i);
      }
    }
    const n = e.res || e.ctx && e.ctx.res;
    if (!t.getInitialProps)
      return e.ctx && e.Component ? {
        pageProps: yield Jt(e.Component, e.ctx)
      } : {};
    const c = yield t.getInitialProps(e);
    if (n && Qt(n))
      return c;
    if (!c) {
      const i = `"${b0(t)}.getInitialProps()" should resolve to an object. But found "${c}" instead.`;
      throw new Error(i);
    }
    return process.env.NODE_ENV !== "production" && Object.keys(c).length === 0 && !e.ctx && console.warn(`${b0(t)} returned an empty object from \`getInitialProps\`. This de-optimizes and prevents automatic static optimization. https://nextjs.org/docs/messages/empty-object-getInitialProps`), c;
  }), d2.apply(this, arguments);
}
let Zt = (t) => {
};
if (process.env.NODE_ENV !== "production") {
  const t = /* @__PURE__ */ new Set();
  U.warnOnce = Zt = (e) => {
    t.has(e) || console.warn(e), t.add(e);
  };
}
const t4 = typeof performance < "u";
U.SP = t4;
const ge = t4 && [
  "mark",
  "measure",
  "getEntriesByName"
].every((t) => typeof performance[t] == "function");
U.ST = ge;
class fe extends Error {
}
U.DecodeError = fe;
class pe extends Error {
}
U.NormalizeError = pe;
class ze extends Error {
  constructor(e) {
    super(), this.code = "ENOENT", this.message = `Cannot find module for page: ${e}`;
  }
}
U.PageNotFoundError = ze;
class me extends Error {
  constructor(e, r) {
    super(), this.message = `Failed to load static file for page: ${e} ${r}`;
  }
}
U.MissingStaticPage = me;
class Me extends Error {
  constructor() {
    super(), this.code = "ENOENT", this.message = "Cannot find the middleware module";
  }
}
U.MiddlewareNotFoundError = Me;
U.warnOnce = Zt;
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.defaultHead = d, e.default = void 0;
  var r = R1.default, n = l1.default, c = X1.default, i = c(R), l = n(P2), s = D0, o = f0, h = R2, v = U;
  function d(y = !1) {
    const H = [
      /* @__PURE__ */ i.default.createElement("meta", {
        charSet: "utf-8"
      })
    ];
    return y || H.push(/* @__PURE__ */ i.default.createElement("meta", {
      name: "viewport",
      content: "width=device-width"
    })), H;
  }
  function g(y, H) {
    return typeof H == "string" || typeof H == "number" ? y : H.type === i.default.Fragment ? y.concat(i.default.Children.toArray(H.props.children).reduce((u, m) => typeof m == "string" || typeof m == "number" ? u : u.concat(m), [])) : y.concat(H);
  }
  const f = [
    "name",
    "httpEquiv",
    "charSet",
    "itemProp"
  ];
  function M() {
    const y = /* @__PURE__ */ new Set(), H = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set(), m = {};
    return (w) => {
      let C = !0, A = !1;
      if (w.key && typeof w.key != "number" && w.key.indexOf("$") > 0) {
        A = !0;
        const V = w.key.slice(w.key.indexOf("$") + 1);
        y.has(V) ? C = !1 : y.add(V);
      }
      switch (w.type) {
        case "title":
        case "base":
          H.has(w.type) ? C = !1 : H.add(w.type);
          break;
        case "meta":
          for (let V = 0, _ = f.length; V < _; V++) {
            const L = f[V];
            if (!!w.props.hasOwnProperty(L))
              if (L === "charSet")
                u.has(L) ? C = !1 : u.add(L);
              else {
                const S = w.props[L], B = m[L] || /* @__PURE__ */ new Set();
                (L !== "name" || !A) && B.has(S) ? C = !1 : (B.add(S), m[L] = B);
              }
          }
          break;
      }
      return C;
    };
  }
  function x(y, H) {
    return y.reduce(g, []).reverse().concat(d(H.inAmpMode).reverse()).filter(M()).reverse().map((u, m) => {
      const w = u.key || m;
      if (process.env.NODE_ENV !== "development" && process.env.__NEXT_OPTIMIZE_FONTS && !H.inAmpMode && u.type === "link" && u.props.href && [
        "https://fonts.googleapis.com/css",
        "https://use.typekit.net/"
      ].some((C) => u.props.href.startsWith(C))) {
        const C = r({}, u.props || {});
        return C["data-href"] = C.href, C.href = void 0, C["data-optimized-fonts"] = !0, /* @__PURE__ */ i.default.cloneElement(u, C);
      }
      if (process.env.NODE_ENV === "development" && process.env.__NEXT_REACT_ROOT)
        if (u.type === "script" && u.props.type !== "application/ld+json") {
          const C = u.props.src ? `<script> tag with src="${u.props.src}"` : "inline <script>";
          v.warnOnce(`Do not add <script> tags using next/head (see ${C}). Use next/script instead. 
See more info here: https://nextjs.org/docs/messages/no-script-tags-in-head-component`);
        } else
          u.type === "link" && u.props.rel === "stylesheet" && v.warnOnce(`Do not add stylesheets using next/head (see <link rel="stylesheet"> tag with href="${u.props.href}"). Use Document instead. 
See more info here: https://nextjs.org/docs/messages/no-stylesheets-in-head-component`);
      return /* @__PURE__ */ i.default.cloneElement(u, {
        key: w
      });
    });
  }
  function z({ children: y }) {
    const H = i.useContext(s.AmpStateContext), u = i.useContext(o.HeadManagerContext);
    return /* @__PURE__ */ i.default.createElement(l.default, {
      reduceComponentsToState: x,
      headManager: u,
      inAmpMode: h.isInAmpMode(H)
    }, y);
  }
  var p = z;
  e.default = p, (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(v2, v2.exports);
(function(t) {
  t.exports = v2.exports;
})(K4);
var Be = { exports: {} }, g2 = { exports: {} }, j0 = {};
Object.defineProperty(j0, "__esModule", {
  value: !0
});
j0.default = He;
function He(t, e) {
  if (t == null)
    return {};
  var r = {}, n = Object.keys(t), c, i;
  for (i = 0; i < n.length; i++)
    c = n[i], !(e.indexOf(c) >= 0) && (r[c] = t[c]);
  return r;
}
var M1 = {}, d0 = { exports: {} }, K1 = {};
Object.defineProperty(K1, "__esModule", {
  value: !0
});
K1.removeTrailingSlash = we;
function we(t) {
  return t.replace(/\/$/, "") || "/";
}
var T1 = {};
Object.defineProperty(T1, "__esModule", {
  value: !0
});
T1.parsePath = xe;
function xe(t) {
  const e = t.indexOf("#"), r = t.indexOf("?"), n = r > -1 && (e < 0 || r < e);
  return n || e > -1 ? {
    pathname: t.substring(0, n ? r : e),
    query: n ? t.substring(r, e > -1 ? e : void 0) : "",
    hash: e > -1 ? t.slice(e) : ""
  } : {
    pathname: t,
    query: "",
    hash: ""
  };
}
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.normalizePathTrailingSlash = void 0;
  var r = K1, n = T1;
  const c = (i) => {
    if (!i.startsWith("/"))
      return i;
    const { pathname: l, query: s, hash: o } = n.parsePath(i);
    return process.env.__NEXT_TRAILING_SLASH ? /\.[^/]+\/?$/.test(l) ? `${r.removeTrailingSlash(l)}${s}${o}` : l.endsWith("/") ? `${l}${s}${o}` : `${l}/${s}${o}` : `${r.removeTrailingSlash(l)}${s}${o}`;
  };
  e.normalizePathTrailingSlash = c, (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(d0, d0.exports);
var f2 = { exports: {} }, T2 = {};
Object.defineProperty(T2, "__esModule", {
  value: !0
});
T2.default = Ve;
function Ve(t, e = "") {
  return (t === "/" ? "/index" : /^\/index(\/|$)/.test(t) ? `/index${t}` : `${t}`) + e;
}
var p2 = { exports: {} };
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.__unsafeCreateTrustedScriptURL = c;
  let r;
  function n() {
    if (typeof r > "u" && typeof window < "u") {
      var i;
      r = ((i = window.trustedTypes) == null ? void 0 : i.createPolicy("nextjs", {
        createHTML: (l) => l,
        createScript: (l) => l,
        createScriptURL: (l) => l
      })) || null;
    }
    return r;
  }
  function c(i) {
    var l;
    return ((l = n()) == null ? void 0 : l.createScriptURL(i)) || i;
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(p2, p2.exports);
var g0 = { exports: {} };
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.cancelIdleCallback = e.requestIdleCallback = void 0;
  const r = typeof self < "u" && self.requestIdleCallback && self.requestIdleCallback.bind(window) || function(c) {
    let i = Date.now();
    return setTimeout(function() {
      c({
        didTimeout: !1,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - i));
        }
      });
    }, 1);
  };
  e.requestIdleCallback = r;
  const n = typeof self < "u" && self.cancelIdleCallback && self.cancelIdleCallback.bind(window) || function(c) {
    return clearTimeout(c);
  };
  e.cancelIdleCallback = n, (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(g0, g0.exports);
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.markAssetError = g, e.isAssetError = f, e.getClientBuildManifest = p, e.createRouteLoader = H;
  var r = l1.default, n = r(T2), c = p2.exports, i = g0.exports;
  const l = 3800;
  function s(u, m, w) {
    let C = m.get(u);
    if (C)
      return "future" in C ? C.future : Promise.resolve(C);
    let A;
    const V = new Promise((_) => {
      A = _;
    });
    return m.set(u, C = {
      resolve: A,
      future: V
    }), w ? w().then((_) => (A(_), _)).catch((_) => {
      throw m.delete(u), _;
    }) : V;
  }
  function o(u) {
    try {
      return u = document.createElement("link"), !!window.MSInputMethodContext && !!document.documentMode || u.relList.supports("prefetch");
    } catch {
      return !1;
    }
  }
  const h = o();
  function v(u, m, w) {
    return new Promise((C, A) => {
      const V = `
      link[rel="prefetch"][href^="${u}"],
      link[rel="preload"][href^="${u}"],
      script[src^="${u}"]`;
      if (document.querySelector(V))
        return C();
      w = document.createElement("link"), m && (w.as = m), w.rel = "prefetch", w.crossOrigin = process.env.__NEXT_CROSS_ORIGIN, w.onload = C, w.onerror = A, w.href = u, document.head.appendChild(w);
    });
  }
  const d = Symbol("ASSET_LOAD_ERROR");
  function g(u) {
    return Object.defineProperty(u, d, {});
  }
  function f(u) {
    return u && d in u;
  }
  function M(u, m) {
    return new Promise((w, C) => {
      m = document.createElement("script"), m.onload = w, m.onerror = () => C(g(new Error(`Failed to load script: ${u}`))), m.crossOrigin = process.env.__NEXT_CROSS_ORIGIN, m.src = u, document.body.appendChild(m);
    });
  }
  let x;
  function z(u, m, w) {
    return new Promise((C, A) => {
      let V = !1;
      u.then((_) => {
        V = !0, C(_);
      }).catch(A), process.env.NODE_ENV === "development" && (x || Promise.resolve()).then(() => {
        i.requestIdleCallback(() => setTimeout(() => {
          V || A(w);
        }, m));
      }), process.env.NODE_ENV !== "development" && i.requestIdleCallback(() => setTimeout(() => {
        V || A(w);
      }, m));
    });
  }
  function p() {
    if (self.__BUILD_MANIFEST)
      return Promise.resolve(self.__BUILD_MANIFEST);
    const u = new Promise((m) => {
      const w = self.__BUILD_MANIFEST_CB;
      self.__BUILD_MANIFEST_CB = () => {
        m(self.__BUILD_MANIFEST), w && w();
      };
    });
    return z(u, l, g(new Error("Failed to load client build manifest")));
  }
  function y(u, m) {
    if (process.env.NODE_ENV === "development") {
      const w = u + "/_next/static/chunks/pages" + encodeURI(n.default(m, ".js"));
      return Promise.resolve({
        scripts: [
          c.__unsafeCreateTrustedScriptURL(w)
        ],
        css: []
      });
    }
    return p().then((w) => {
      if (!(m in w))
        throw g(new Error(`Failed to lookup route: ${m}`));
      const C = w[m].map((A) => u + "/_next/" + encodeURI(A));
      return {
        scripts: C.filter((A) => A.endsWith(".js")).map((A) => c.__unsafeCreateTrustedScriptURL(A)),
        css: C.filter((A) => A.endsWith(".css"))
      };
    });
  }
  function H(u) {
    const m = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map();
    function V(L) {
      if (process.env.NODE_ENV !== "development") {
        let S = w.get(L.toString());
        return S || (document.querySelector(`script[src^="${L}"]`) ? Promise.resolve() : (w.set(L.toString(), S = M(L)), S));
      } else
        return M(L);
    }
    function _(L) {
      let S = C.get(L);
      return S || (C.set(L, S = fetch(L).then((B) => {
        if (!B.ok)
          throw new Error(`Failed to load stylesheet: ${L}`);
        return B.text().then((E) => ({
          href: L,
          content: E
        }));
      }).catch((B) => {
        throw g(B);
      })), S);
    }
    return {
      whenEntrypoint(L) {
        return s(L, m);
      },
      onEntrypoint(L, S) {
        (S ? Promise.resolve().then(() => S()).then((B) => ({
          component: B && B.default || B,
          exports: B
        }), (B) => ({
          error: B
        })) : Promise.resolve(void 0)).then((B) => {
          const E = m.get(L);
          E && "resolve" in E ? B && (m.set(L, B), E.resolve(B)) : (B ? m.set(L, B) : m.delete(L), A.delete(L));
        });
      },
      loadRoute(L, S) {
        return s(L, A, () => {
          let B;
          return process.env.NODE_ENV === "development" && (x = new Promise((E) => {
            B = E;
          })), z(y(u, L).then(({ scripts: E, css: N }) => Promise.all([
            m.has(L) ? [] : Promise.all(E.map(V)),
            Promise.all(N.map(_))
          ])).then((E) => this.whenEntrypoint(L).then((N) => ({
            entrypoint: N,
            styles: E[1]
          }))), l, g(new Error(`Route did not complete loading: ${L}`))).then(({ entrypoint: E, styles: N }) => {
            const b = Object.assign({
              styles: N
            }, E);
            return "error" in E ? E : b;
          }).catch((E) => {
            if (S)
              throw E;
            return {
              error: E
            };
          }).finally(() => B == null ? void 0 : B());
        });
      },
      prefetch(L) {
        let S;
        return (S = navigator.connection) && (S.saveData || /2g/.test(S.effectiveType)) ? Promise.resolve() : y(u, L).then((B) => Promise.all(h ? B.scripts.map((E) => v(E.toString(), "script")) : [])).then(() => {
          i.requestIdleCallback(() => this.loadRoute(L, !0).catch(() => {
          }));
        }).catch(
          () => {
          }
        );
      }
    };
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(f2, f2.exports);
var z2 = { exports: {} }, m2 = { exports: {} };
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = r, e.isEqualNode = i, e.DOMAttributeNames = void 0;
  function r() {
    return {
      mountedInstances: /* @__PURE__ */ new Set(),
      updateHead: (s) => {
        const o = {};
        s.forEach((d) => {
          if (d.type === "link" && d.props["data-optimized-fonts"]) {
            if (document.querySelector(`style[data-href="${d.props["data-href"]}"]`))
              return;
            d.props.href = d.props["data-href"], d.props["data-href"] = void 0;
          }
          const g = o[d.type] || [];
          g.push(d), o[d.type] = g;
        });
        const h = o.title ? o.title[0] : null;
        let v = "";
        if (h) {
          const { children: d } = h.props;
          v = typeof d == "string" ? d : Array.isArray(d) ? d.join("") : "";
        }
        v !== document.title && (document.title = v), [
          "meta",
          "base",
          "link",
          "style",
          "script"
        ].forEach((d) => {
          l(d, o[d] || []);
        });
      }
    };
  }
  const n = {
    acceptCharset: "accept-charset",
    className: "class",
    htmlFor: "for",
    httpEquiv: "http-equiv",
    noModule: "noModule"
  };
  e.DOMAttributeNames = n;
  function c({ type: s, props: o }) {
    const h = document.createElement(s);
    for (const g in o) {
      if (!o.hasOwnProperty(g) || g === "children" || g === "dangerouslySetInnerHTML" || o[g] === void 0)
        continue;
      const f = n[g] || g.toLowerCase();
      s === "script" && (f === "async" || f === "defer" || f === "noModule") ? h[f] = !!o[g] : h.setAttribute(f, o[g]);
    }
    const { children: v, dangerouslySetInnerHTML: d } = o;
    return d ? h.innerHTML = d.__html || "" : v && (h.textContent = typeof v == "string" ? v : Array.isArray(v) ? v.join("") : ""), h;
  }
  function i(s, o) {
    if (s instanceof HTMLElement && o instanceof HTMLElement) {
      const h = o.getAttribute("nonce");
      if (h && !s.getAttribute("nonce")) {
        const v = o.cloneNode(!0);
        return v.setAttribute("nonce", ""), v.nonce = h, h === s.nonce && s.isEqualNode(v);
      }
    }
    return s.isEqualNode(o);
  }
  function l(s, o) {
    const h = document.getElementsByTagName("head")[0], v = h.querySelector("meta[name=next-head-count]");
    if (process.env.NODE_ENV !== "production" && !v) {
      console.error("Warning: next-head-count is missing. https://nextjs.org/docs/messages/next-head-count-missing");
      return;
    }
    const d = Number(v.content), g = [];
    for (let x = 0, z = v.previousElementSibling; x < d; x++, z = (z == null ? void 0 : z.previousElementSibling) || null) {
      var f;
      (z == null || (f = z.tagName) == null ? void 0 : f.toLowerCase()) === s && g.push(z);
    }
    const M = o.map(c).filter((x) => {
      for (let z = 0, p = g.length; z < p; z++) {
        const y = g[z];
        if (i(y, x))
          return g.splice(z, 1), !1;
      }
      return !0;
    });
    g.forEach((x) => {
      var z;
      return (z = x.parentNode) == null ? void 0 : z.removeChild(x);
    }), M.forEach((x) => h.insertBefore(x, v)), v.content = (d - g.length + M.length).toString();
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(m2, m2.exports);
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.handleClientScriptLoad = f, e.initScriptLoader = z, e.default = void 0;
  var r = R1.default, n = X1.default, c = j0.default, i = n(R), l = f0, s = m2.exports, o = g0.exports;
  const h = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Set(), d = [
    "onLoad",
    "onReady",
    "dangerouslySetInnerHTML",
    "children",
    "onError",
    "strategy"
  ], g = (H) => {
    const { src: u, id: m, onLoad: w = () => {
    }, onReady: C = null, dangerouslySetInnerHTML: A, children: V = "", strategy: _ = "afterInteractive", onError: L } = H, S = m || u;
    if (S && v.has(S))
      return;
    if (h.has(u)) {
      v.add(S), h.get(u).then(w, L);
      return;
    }
    const B = document.createElement("script"), E = new Promise((N, b) => {
      B.addEventListener("load", function($) {
        N(), w && w.call(this, $), C && C();
      }), B.addEventListener("error", function($) {
        b($);
      });
    }).catch(function(N) {
      L && L(N);
    });
    u && h.set(u, E), v.add(S), A ? B.innerHTML = A.__html || "" : V ? B.textContent = typeof V == "string" ? V : Array.isArray(V) ? V.join("") : "" : u && (B.src = u);
    for (const [N, b] of Object.entries(H)) {
      if (b === void 0 || d.includes(N))
        continue;
      const $ = s.DOMAttributeNames[N] || N.toLowerCase();
      B.setAttribute($, b);
    }
    _ === "worker" && B.setAttribute("type", "text/partytown"), B.setAttribute("data-nscript", _), document.body.appendChild(B);
  };
  function f(H) {
    const { strategy: u = "afterInteractive" } = H;
    u === "lazyOnload" ? window.addEventListener("load", () => {
      o.requestIdleCallback(() => g(H));
    }) : g(H);
  }
  function M(H) {
    document.readyState === "complete" ? o.requestIdleCallback(() => g(H)) : window.addEventListener("load", () => {
      o.requestIdleCallback(() => g(H));
    });
  }
  function x() {
    [
      ...document.querySelectorAll('[data-nscript="beforeInteractive"]'),
      ...document.querySelectorAll('[data-nscript="beforePageRender"]')
    ].forEach((u) => {
      const m = u.id || u.getAttribute("src");
      v.add(m);
    });
  }
  function z(H) {
    H.forEach(f), x();
  }
  function p(H) {
    const { id: u, src: m = "", onLoad: w = () => {
    }, onReady: C = null, strategy: A = "afterInteractive", onError: V } = H, _ = c(H, [
      "id",
      "src",
      "onLoad",
      "onReady",
      "strategy",
      "onError"
    ]), { updateScripts: L, scripts: S, getIsSsr: B } = i.useContext(l.HeadManagerContext);
    return i.useEffect(() => {
      const E = u || m;
      C && E && v.has(E) && C();
    }, [
      C,
      u,
      m
    ]), i.useEffect(() => {
      A === "afterInteractive" ? g(H) : A === "lazyOnload" && M(H);
    }, [
      H,
      A
    ]), (A === "beforeInteractive" || A === "worker") && (L ? (S[A] = (S[A] || []).concat([
      r({
        id: u,
        src: m,
        onLoad: w,
        onReady: C,
        onError: V
      }, _)
    ]), L(S)) : B && B() ? v.add(u || m) : B && !B() && g(H)), null;
  }
  var y = p;
  e.default = y, (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(z2, z2.exports);
var p0 = {}, U0 = {};
Object.defineProperty(U0, "__esModule", {
  value: !0
});
U0.getObjectClassLabel = e4;
U0.isPlainObject = ye;
function e4(t) {
  return Object.prototype.toString.call(t);
}
function ye(t) {
  if (e4(t) !== "[object Object]")
    return !1;
  const e = Object.getPrototypeOf(t);
  return e === null || e.hasOwnProperty("isPrototypeOf");
}
Object.defineProperty(p0, "__esModule", {
  value: !0
});
p0.default = a4;
p0.getProperError = Le;
var Ce = U0;
function a4(t) {
  return typeof t == "object" && t !== null && "name" in t && "message" in t;
}
function Le(t) {
  if (a4(t))
    return t;
  if (process.env.NODE_ENV === "development") {
    if (typeof t > "u")
      return new Error("An undefined error was thrown, see here for more info: https://nextjs.org/docs/messages/threw-undefined");
    if (t === null)
      return new Error("A null error was thrown, see here for more info: https://nextjs.org/docs/messages/threw-undefined");
  }
  return new Error(Ce.isPlainObject(t) ? JSON.stringify(t) : t + "");
}
var O2 = {}, r4 = {}, N2 = {};
Object.defineProperty(N2, "__esModule", {
  value: !0
});
N2.getSortedRoutes = _e;
class $2 {
  insert(e) {
    this._insert(e.split("/").filter(Boolean), [], !1);
  }
  smoosh() {
    return this._smoosh();
  }
  _smoosh(e = "/") {
    const r = [
      ...this.children.keys()
    ].sort();
    this.slugName !== null && r.splice(r.indexOf("[]"), 1), this.restSlugName !== null && r.splice(r.indexOf("[...]"), 1), this.optionalRestSlugName !== null && r.splice(r.indexOf("[[...]]"), 1);
    const n = r.map((c) => this.children.get(c)._smoosh(`${e}${c}/`)).reduce((c, i) => [
      ...c,
      ...i
    ], []);
    if (this.slugName !== null && n.push(...this.children.get("[]")._smoosh(`${e}[${this.slugName}]/`)), !this.placeholder) {
      const c = e === "/" ? "/" : e.slice(0, -1);
      if (this.optionalRestSlugName != null)
        throw new Error(`You cannot define a route with the same specificity as a optional catch-all route ("${c}" and "${c}[[...${this.optionalRestSlugName}]]").`);
      n.unshift(c);
    }
    return this.restSlugName !== null && n.push(...this.children.get("[...]")._smoosh(`${e}[...${this.restSlugName}]/`)), this.optionalRestSlugName !== null && n.push(...this.children.get("[[...]]")._smoosh(`${e}[[...${this.optionalRestSlugName}]]/`)), n;
  }
  _insert(e, r, n) {
    if (e.length === 0) {
      this.placeholder = !1;
      return;
    }
    if (n)
      throw new Error("Catch-all must be the last part of the URL.");
    let c = e[0];
    if (c.startsWith("[") && c.endsWith("]")) {
      let s = function(o, h) {
        if (o !== null && o !== h)
          throw new Error(`You cannot use different slug names for the same dynamic path ('${o}' !== '${h}').`);
        r.forEach((v) => {
          if (v === h)
            throw new Error(`You cannot have the same slug name "${h}" repeat within a single dynamic path`);
          if (v.replace(/\W/g, "") === c.replace(/\W/g, ""))
            throw new Error(`You cannot have the slug names "${v}" and "${h}" differ only by non-word symbols within a single dynamic path`);
        }), r.push(h);
      }, i = c.slice(1, -1), l = !1;
      if (i.startsWith("[") && i.endsWith("]") && (i = i.slice(1, -1), l = !0), i.startsWith("...") && (i = i.substring(3), n = !0), i.startsWith("[") || i.endsWith("]"))
        throw new Error(`Segment names may not start or end with extra brackets ('${i}').`);
      if (i.startsWith("."))
        throw new Error(`Segment names may not start with erroneous periods ('${i}').`);
      if (n)
        if (l) {
          if (this.restSlugName != null)
            throw new Error(`You cannot use both an required and optional catch-all route at the same level ("[...${this.restSlugName}]" and "${e[0]}" ).`);
          s(this.optionalRestSlugName, i), this.optionalRestSlugName = i, c = "[[...]]";
        } else {
          if (this.optionalRestSlugName != null)
            throw new Error(`You cannot use both an optional and required catch-all route at the same level ("[[...${this.optionalRestSlugName}]]" and "${e[0]}").`);
          s(this.restSlugName, i), this.restSlugName = i, c = "[...]";
        }
      else {
        if (l)
          throw new Error(`Optional route parameters are not yet supported ("${e[0]}").`);
        s(this.slugName, i), this.slugName = i, c = "[]";
      }
    }
    this.children.has(c) || this.children.set(c, new $2()), this.children.get(c)._insert(e.slice(1), r, n);
  }
  constructor() {
    this.placeholder = !0, this.children = /* @__PURE__ */ new Map(), this.slugName = null, this.restSlugName = null, this.optionalRestSlugName = null;
  }
}
function _e(t) {
  const e = new $2();
  return t.forEach((r) => e.insert(r)), e.smoosh();
}
var F0 = {};
Object.defineProperty(F0, "__esModule", {
  value: !0
});
F0.isDynamicRoute = be;
const Ae = /\/\[[^/]+?\](?=\/|$)/;
function be(t) {
  return Ae.test(t);
}
(function(t) {
  Object.defineProperty(t, "__esModule", {
    value: !0
  }), Object.defineProperty(t, "getSortedRoutes", {
    enumerable: !0,
    get: function() {
      return e.getSortedRoutes;
    }
  }), Object.defineProperty(t, "isDynamicRoute", {
    enumerable: !0,
    get: function() {
      return r.isDynamicRoute;
    }
  });
  var e = N2, r = F0;
})(r4);
var I2 = {};
Object.defineProperty(I2, "__esModule", {
  value: !0
});
I2.normalizePathSep = Pe;
function Pe(t) {
  return t.replace(/\\/g, "/");
}
Object.defineProperty(O2, "__esModule", {
  value: !0
});
O2.denormalizePagePath = Re;
var Se = r4, Ee = I2;
function Re(t) {
  let e = Ee.normalizePathSep(t);
  return e.startsWith("/index/") && !Se.isDynamicRoute(e) ? e.slice(6) : e !== "/index" ? e : "/";
}
var n0 = {};
Object.defineProperty(n0, "__esModule", {
  value: !0
});
n0.normalizeLocalePath = Te;
function Te(t, e) {
  let r;
  const n = t.split("/");
  return (e || []).some((c) => n[1] && n[1].toLowerCase() === c.toLowerCase() ? (r = c, n.splice(1, 1), t = n.join("/") || "/", !0) : !1), {
    pathname: t,
    detectedLocale: r
  };
}
var D2 = {};
Object.defineProperty(D2, "__esModule", {
  value: !0
});
D2.default = Oe;
function Oe() {
  const t = /* @__PURE__ */ Object.create(null);
  return {
    on(e, r) {
      (t[e] || (t[e] = [])).push(r);
    },
    off(e, r) {
      t[e] && t[e].splice(t[e].indexOf(r) >>> 0, 1);
    },
    emit(e, ...r) {
      (t[e] || []).slice().map((n) => {
        n(...r);
      });
    }
  };
}
var z0 = {}, O1 = {};
Object.defineProperty(O1, "__esModule", {
  value: !0
});
O1.searchParamsToUrlQuery = Ne;
O1.urlQueryToSearchParams = $e;
O1.assign = Ie;
function Ne(t) {
  const e = {};
  return t.forEach((r, n) => {
    typeof e[n] > "u" ? e[n] = r : Array.isArray(e[n]) ? e[n].push(r) : e[n] = [
      e[n],
      r
    ];
  }), e;
}
function pt(t) {
  return typeof t == "string" || typeof t == "number" && !isNaN(t) || typeof t == "boolean" ? String(t) : "";
}
function $e(t) {
  const e = new URLSearchParams();
  return Object.entries(t).forEach(([r, n]) => {
    Array.isArray(n) ? n.forEach((c) => e.append(r, pt(c))) : e.set(r, pt(n));
  }), e;
}
function Ie(t, ...e) {
  return e.forEach((r) => {
    Array.from(r.keys()).forEach((n) => t.delete(n)), r.forEach((n, c) => t.append(c, n));
  }), t;
}
Object.defineProperty(z0, "__esModule", {
  value: !0
});
z0.parseRelativeUrl = je;
var De = U, ke = O1;
function je(t, e) {
  const r = new URL(typeof window > "u" ? "http://n" : De.getLocationOrigin()), n = e ? new URL(e, r) : t.startsWith(".") ? new URL(typeof window > "u" ? "http://n" : window.location.href) : r, { pathname: c, searchParams: i, search: l, hash: s, href: o, origin: h } = new URL(t, n);
  if (h !== r.origin)
    throw new Error(`invariant: invalid relative URL, router received ${t}`);
  return {
    pathname: c,
    query: ke.searchParamsToUrlQuery(i),
    search: l,
    hash: s,
    href: o.slice(r.origin.length)
  };
}
var k2 = {}, j2 = {}, u1 = {};
Object.defineProperty(u1, "__esModule", { value: !0 });
function Ue(t) {
  for (var e = [], r = 0; r < t.length; ) {
    var n = t[r];
    if (n === "*" || n === "+" || n === "?") {
      e.push({ type: "MODIFIER", index: r, value: t[r++] });
      continue;
    }
    if (n === "\\") {
      e.push({ type: "ESCAPED_CHAR", index: r++, value: t[r++] });
      continue;
    }
    if (n === "{") {
      e.push({ type: "OPEN", index: r, value: t[r++] });
      continue;
    }
    if (n === "}") {
      e.push({ type: "CLOSE", index: r, value: t[r++] });
      continue;
    }
    if (n === ":") {
      for (var c = "", i = r + 1; i < t.length; ) {
        var l = t.charCodeAt(i);
        if (l >= 48 && l <= 57 || l >= 65 && l <= 90 || l >= 97 && l <= 122 || l === 95) {
          c += t[i++];
          continue;
        }
        break;
      }
      if (!c)
        throw new TypeError("Missing parameter name at " + r);
      e.push({ type: "NAME", index: r, value: c }), r = i;
      continue;
    }
    if (n === "(") {
      var s = 1, o = "", i = r + 1;
      if (t[i] === "?")
        throw new TypeError('Pattern cannot start with "?" at ' + i);
      for (; i < t.length; ) {
        if (t[i] === "\\") {
          o += t[i++] + t[i++];
          continue;
        }
        if (t[i] === ")") {
          if (s--, s === 0) {
            i++;
            break;
          }
        } else if (t[i] === "(" && (s++, t[i + 1] !== "?"))
          throw new TypeError("Capturing groups are not allowed at " + i);
        o += t[i++];
      }
      if (s)
        throw new TypeError("Unbalanced pattern at " + r);
      if (!o)
        throw new TypeError("Missing pattern at " + r);
      e.push({ type: "PATTERN", index: r, value: o }), r = i;
      continue;
    }
    e.push({ type: "CHAR", index: r, value: t[r++] });
  }
  return e.push({ type: "END", index: r, value: "" }), e;
}
function U2(t, e) {
  e === void 0 && (e = {});
  for (var r = Ue(t), n = e.prefixes, c = n === void 0 ? "./" : n, i = "[^" + Z1(e.delimiter || "/#?") + "]+?", l = [], s = 0, o = 0, h = "", v = function(w) {
    if (o < r.length && r[o].type === w)
      return r[o++].value;
  }, d = function(w) {
    var C = v(w);
    if (C !== void 0)
      return C;
    var A = r[o], V = A.type, _ = A.index;
    throw new TypeError("Unexpected " + V + " at " + _ + ", expected " + w);
  }, g = function() {
    for (var w = "", C; C = v("CHAR") || v("ESCAPED_CHAR"); )
      w += C;
    return w;
  }; o < r.length; ) {
    var f = v("CHAR"), M = v("NAME"), x = v("PATTERN");
    if (M || x) {
      var z = f || "";
      c.indexOf(z) === -1 && (h += z, z = ""), h && (l.push(h), h = ""), l.push({
        name: M || s++,
        prefix: z,
        suffix: "",
        pattern: x || i,
        modifier: v("MODIFIER") || ""
      });
      continue;
    }
    var p = f || v("ESCAPED_CHAR");
    if (p) {
      h += p;
      continue;
    }
    h && (l.push(h), h = "");
    var y = v("OPEN");
    if (y) {
      var z = g(), H = v("NAME") || "", u = v("PATTERN") || "", m = g();
      d("CLOSE"), l.push({
        name: H || (u ? s++ : ""),
        pattern: H && !u ? i : u,
        prefix: z,
        suffix: m,
        modifier: v("MODIFIER") || ""
      });
      continue;
    }
    d("END");
  }
  return l;
}
u1.parse = U2;
function Fe(t, e) {
  return n4(U2(t, e), e);
}
u1.compile = Fe;
function n4(t, e) {
  e === void 0 && (e = {});
  var r = F2(e), n = e.encode, c = n === void 0 ? function(o) {
    return o;
  } : n, i = e.validate, l = i === void 0 ? !0 : i, s = t.map(function(o) {
    if (typeof o == "object")
      return new RegExp("^(?:" + o.pattern + ")$", r);
  });
  return function(o) {
    for (var h = "", v = 0; v < t.length; v++) {
      var d = t[v];
      if (typeof d == "string") {
        h += d;
        continue;
      }
      var g = o ? o[d.name] : void 0, f = d.modifier === "?" || d.modifier === "*", M = d.modifier === "*" || d.modifier === "+";
      if (Array.isArray(g)) {
        if (!M)
          throw new TypeError('Expected "' + d.name + '" to not repeat, but got an array');
        if (g.length === 0) {
          if (f)
            continue;
          throw new TypeError('Expected "' + d.name + '" to not be empty');
        }
        for (var x = 0; x < g.length; x++) {
          var z = c(g[x], d);
          if (l && !s[v].test(z))
            throw new TypeError('Expected all "' + d.name + '" to match "' + d.pattern + '", but got "' + z + '"');
          h += d.prefix + z + d.suffix;
        }
        continue;
      }
      if (typeof g == "string" || typeof g == "number") {
        var z = c(String(g), d);
        if (l && !s[v].test(z))
          throw new TypeError('Expected "' + d.name + '" to match "' + d.pattern + '", but got "' + z + '"');
        h += d.prefix + z + d.suffix;
        continue;
      }
      if (!f) {
        var p = M ? "an array" : "a string";
        throw new TypeError('Expected "' + d.name + '" to be ' + p);
      }
    }
    return h;
  };
}
u1.tokensToFunction = n4;
function qe(t, e) {
  var r = [], n = q2(t, r, e);
  return c4(n, r, e);
}
u1.match = qe;
function c4(t, e, r) {
  r === void 0 && (r = {});
  var n = r.decode, c = n === void 0 ? function(i) {
    return i;
  } : n;
  return function(i) {
    var l = t.exec(i);
    if (!l)
      return !1;
    for (var s = l[0], o = l.index, h = /* @__PURE__ */ Object.create(null), v = function(g) {
      if (l[g] === void 0)
        return "continue";
      var f = e[g - 1];
      f.modifier === "*" || f.modifier === "+" ? h[f.name] = l[g].split(f.prefix + f.suffix).map(function(M) {
        return c(M, f);
      }) : h[f.name] = c(l[g], f);
    }, d = 1; d < l.length; d++)
      v(d);
    return { path: s, index: o, params: h };
  };
}
u1.regexpToFunction = c4;
function Z1(t) {
  return t.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function F2(t) {
  return t && t.sensitive ? "" : "i";
}
function We(t, e) {
  if (!e)
    return t;
  var r = t.source.match(/\((?!\?)/g);
  if (r)
    for (var n = 0; n < r.length; n++)
      e.push({
        name: n,
        prefix: "",
        suffix: "",
        modifier: "",
        pattern: ""
      });
  return t;
}
function Ge(t, e, r) {
  var n = t.map(function(c) {
    return q2(c, e, r).source;
  });
  return new RegExp("(?:" + n.join("|") + ")", F2(r));
}
function Xe(t, e, r) {
  return i4(U2(t, r), e, r);
}
function i4(t, e, r) {
  r === void 0 && (r = {});
  for (var n = r.strict, c = n === void 0 ? !1 : n, i = r.start, l = i === void 0 ? !0 : i, s = r.end, o = s === void 0 ? !0 : s, h = r.encode, v = h === void 0 ? function(w) {
    return w;
  } : h, d = "[" + Z1(r.endsWith || "") + "]|$", g = "[" + Z1(r.delimiter || "/#?") + "]", f = l ? "^" : "", M = 0, x = t; M < x.length; M++) {
    var z = x[M];
    if (typeof z == "string")
      f += Z1(v(z));
    else {
      var p = Z1(v(z.prefix)), y = Z1(v(z.suffix));
      if (z.pattern)
        if (e && e.push(z), p || y)
          if (z.modifier === "+" || z.modifier === "*") {
            var H = z.modifier === "*" ? "?" : "";
            f += "(?:" + p + "((?:" + z.pattern + ")(?:" + y + p + "(?:" + z.pattern + "))*)" + y + ")" + H;
          } else
            f += "(?:" + p + "(" + z.pattern + ")" + y + ")" + z.modifier;
        else
          f += "(" + z.pattern + ")" + z.modifier;
      else
        f += "(?:" + p + y + ")" + z.modifier;
    }
  }
  if (o)
    c || (f += g + "?"), f += r.endsWith ? "(?=" + d + ")" : "$";
  else {
    var u = t[t.length - 1], m = typeof u == "string" ? g.indexOf(u[u.length - 1]) > -1 : u === void 0;
    c || (f += "(?:" + g + "(?=" + d + "))?"), m || (f += "(?=" + g + "|" + d + ")");
  }
  return new RegExp(f, F2(r));
}
u1.tokensToRegexp = i4;
function q2(t, e, r) {
  return t instanceof RegExp ? We(t, e) : Array.isArray(t) ? Ge(t, e, r) : Xe(t, e, r);
}
u1.pathToRegexp = q2;
Object.defineProperty(j2, "__esModule", {
  value: !0
});
j2.getPathMatch = Ye;
var Ke = R1.default, zt = u1;
function Ye(t, e) {
  const r = [], n = zt.pathToRegexp(t, r, {
    delimiter: "/",
    sensitive: !1,
    strict: e == null ? void 0 : e.strict
  }), c = zt.regexpToFunction(e != null && e.regexModifier ? new RegExp(e.regexModifier(n.source), n.flags) : n, r);
  return (i, l) => {
    const s = i == null ? !1 : c(i);
    if (!s)
      return !1;
    if (e != null && e.removeUnnamedParams)
      for (const o of r)
        typeof o.name == "number" && delete s.params[o.name];
    return Ke({}, l, s.params);
  };
}
var m0 = {}, q0 = {};
Object.defineProperty(q0, "__esModule", {
  value: !0
});
q0.escapeStringRegexp = Ze;
const Qe = /[|\\{}()[\]^$+*?.-]/, Je = /[|\\{}()[\]^$+*?.-]/g;
function Ze(t) {
  return Qe.test(t) ? t.replace(Je, "\\$&") : t;
}
var W2 = {};
Object.defineProperty(W2, "__esModule", {
  value: !0
});
W2.parseUrl = aa;
var ta = O1, ea = z0;
function aa(t) {
  if (t.startsWith("/"))
    return ea.parseRelativeUrl(t);
  const e = new URL(t);
  return {
    hash: e.hash,
    hostname: e.hostname,
    href: e.href,
    pathname: e.pathname,
    port: e.port,
    protocol: e.protocol,
    query: ta.searchParamsToUrlQuery(e.searchParams),
    search: e.search
  };
}
Object.defineProperty(m0, "__esModule", {
  value: !0
});
m0.matchHas = ca;
m0.compileNonPath = M2;
m0.prepareDestination = ia;
var mt = R1.default, h0 = u1, ra = q0, na = W2;
function ca(t, e, r) {
  const n = {};
  return e.every((i) => {
    let l, s = i.key;
    switch (i.type) {
      case "header": {
        s = s.toLowerCase(), l = t.headers[s];
        break;
      }
      case "cookie": {
        l = t.cookies[i.key];
        break;
      }
      case "query": {
        l = r[s];
        break;
      }
      case "host": {
        const { host: o } = (t == null ? void 0 : t.headers) || {};
        l = o == null ? void 0 : o.split(":")[0].toLowerCase();
        break;
      }
    }
    if (!i.value && l)
      return n[la(s)] = l, !0;
    if (l) {
      const o = new RegExp(`^${i.value}$`), h = Array.isArray(l) ? l.slice(-1)[0].match(o) : l.match(o);
      if (h)
        return Array.isArray(h) && (h.groups ? Object.keys(h.groups).forEach((v) => {
          n[v] = h.groups[v];
        }) : i.type === "host" && h[0] && (n.host = h[0])), !0;
    }
    return !1;
  }) ? n : !1;
}
function M2(t, e) {
  if (!t.includes(":"))
    return t;
  for (const r of Object.keys(e))
    t.includes(`:${r}`) && (t = t.replace(new RegExp(`:${r}\\*`, "g"), `:${r}--ESCAPED_PARAM_ASTERISKS`).replace(new RegExp(`:${r}\\?`, "g"), `:${r}--ESCAPED_PARAM_QUESTION`).replace(new RegExp(`:${r}\\+`, "g"), `:${r}--ESCAPED_PARAM_PLUS`).replace(new RegExp(`:${r}(?!\\w)`, "g"), `--ESCAPED_PARAM_COLON${r}`));
  return t = t.replace(/(:|\*|\?|\+|\(|\)|\{|\})/g, "\\$1").replace(/--ESCAPED_PARAM_PLUS/g, "+").replace(/--ESCAPED_PARAM_COLON/g, ":").replace(/--ESCAPED_PARAM_QUESTION/g, "?").replace(/--ESCAPED_PARAM_ASTERISKS/g, "*"), h0.compile(`/${t}`, {
    validate: !1
  })(e).slice(1);
}
function ia(t) {
  const e = Object.assign({}, t.query);
  delete e.__nextLocale, delete e.__nextDefaultLocale, delete e.__nextDataReq;
  let r = t.destination;
  for (const M of Object.keys(mt({}, t.params, e)))
    r = oa(r, M);
  const n = na.parseUrl(r), c = n.query, i = H0(`${n.pathname}${n.hash || ""}`), l = H0(n.hostname || ""), s = [], o = [];
  h0.pathToRegexp(i, s), h0.pathToRegexp(l, o);
  const h = [];
  s.forEach((M) => h.push(M.name)), o.forEach((M) => h.push(M.name));
  const v = h0.compile(
    i,
    {
      validate: !1
    }
  ), d = h0.compile(l, {
    validate: !1
  });
  for (const [M, x] of Object.entries(c))
    Array.isArray(x) ? c[M] = x.map((z) => M2(H0(z), t.params)) : c[M] = M2(H0(x), t.params);
  let g = Object.keys(t.params).filter((M) => M !== "nextInternalLocale");
  if (t.appendParamsToQuery && !g.some((M) => h.includes(M)))
    for (const M of g)
      M in c || (c[M] = t.params[M]);
  let f;
  try {
    f = v(t.params);
    const [M, x] = f.split("#");
    n.hostname = d(t.params), n.pathname = M, n.hash = `${x ? "#" : ""}${x || ""}`, delete n.search;
  } catch (M) {
    throw M.message.match(/Expected .*? to not repeat, but got an array/) ? new Error("To use a multi-match in the destination you must add `*` at the end of the param name to signify it should repeat. https://nextjs.org/docs/messages/invalid-multi-match") : M;
  }
  return n.query = mt({}, e, n.query), {
    newUrl: f,
    destQuery: c,
    parsedDestination: n
  };
}
function la(t) {
  let e = "";
  for (let r = 0; r < t.length; r++) {
    const n = t.charCodeAt(r);
    (n > 64 && n < 91 || n > 96 && n < 123) && (e += t[r]);
  }
  return e;
}
function oa(t, e) {
  return t.replace(new RegExp(`:${ra.escapeStringRegexp(e)}`, "g"), `__ESC_COLON_${e}`);
}
function H0(t) {
  return t.replace(/__ESC_COLON_/gi, ":");
}
var S0 = { exports: {} }, E0 = { exports: {} }, c0 = {};
Object.defineProperty(c0, "__esModule", {
  value: !0
});
c0.pathHasPrefix = sa;
var ha = T1;
function sa(t, e) {
  if (typeof t != "string")
    return !1;
  const { pathname: r } = ha.parsePath(t);
  return r === e || r.startsWith(e + "/");
}
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.hasBasePath = c;
  var r = c0;
  const n = process.env.__NEXT_ROUTER_BASEPATH || "";
  function c(i) {
    return r.pathHasPrefix(i, n);
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(E0, E0.exports);
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.removeBasePath = c;
  var r = E0.exports;
  const n = process.env.__NEXT_ROUTER_BASEPATH || "";
  function c(i) {
    return process.env.__NEXT_MANUAL_CLIENT_BASE_PATH && !r.hasBasePath(i) || (i = i.slice(n.length), i.startsWith("/") || (i = `/${i}`)), i;
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(S0, S0.exports);
Object.defineProperty(k2, "__esModule", {
  value: !0
});
k2.default = da;
var va = j2, Mt = m0, Bt = K1, Ht = n0, wt = S0.exports, ua = z0;
function da(t, e, r, n, c, i) {
  let l = !1, s = !1, o = ua.parseRelativeUrl(t), h = Bt.removeTrailingSlash(Ht.normalizeLocalePath(wt.removeBasePath(o.pathname), i).pathname), v;
  const d = (f) => {
    let x = va.getPathMatch(f.source + (process.env.__NEXT_TRAILING_SLASH ? "(/)?" : ""), {
      removeUnnamedParams: !0,
      strict: !0
    })(o.pathname);
    if (f.has && x) {
      const z = Mt.matchHas({
        headers: {
          host: document.location.hostname
        },
        cookies: document.cookie.split("; ").reduce((p, y) => {
          const [H, ...u] = y.split("=");
          return p[H] = u.join("="), p;
        }, {})
      }, f.has, o.query);
      z ? Object.assign(x, z) : x = !1;
    }
    if (x) {
      if (!f.destination)
        return s = !0, !0;
      const z = Mt.prepareDestination({
        appendParamsToQuery: !0,
        destination: f.destination,
        params: x,
        query: n
      });
      if (o = z.parsedDestination, t = z.newUrl, Object.assign(n, z.parsedDestination.query), h = Bt.removeTrailingSlash(Ht.normalizeLocalePath(wt.removeBasePath(t), i).pathname), e.includes(h))
        return l = !0, v = h, !0;
      if (v = c(h), v !== t && e.includes(v))
        return l = !0, !0;
    }
  };
  let g = !1;
  for (let f = 0; f < r.beforeFiles.length; f++)
    d(r.beforeFiles[f]);
  if (l = e.includes(h), !l) {
    if (!g) {
      for (let f = 0; f < r.afterFiles.length; f++)
        if (d(r.afterFiles[f])) {
          g = !0;
          break;
        }
    }
    if (g || (v = c(h), l = e.includes(v), g = l), !g) {
      for (let f = 0; f < r.fallback.length; f++)
        if (d(r.fallback[f])) {
          g = !0;
          break;
        }
    }
  }
  return {
    asPath: t,
    parsedAs: o,
    matchedPage: l,
    resolvedHref: v,
    externalDest: s
  };
}
var G2 = {};
Object.defineProperty(G2, "__esModule", {
  value: !0
});
G2.getRouteMatcher = fa;
var ga = U;
function fa({ re: t, groups: e }) {
  return (r) => {
    const n = t.exec(r);
    if (!n)
      return !1;
    const c = (l) => {
      try {
        return decodeURIComponent(l);
      } catch {
        throw new ga.DecodeError("failed to decode param");
      }
    }, i = {};
    return Object.keys(e).forEach((l) => {
      const s = e[l], o = n[s.pos];
      o !== void 0 && (i[l] = ~o.indexOf("/") ? o.split("/").map((h) => c(h)) : s.repeat ? [
        c(o)
      ] : c(o));
    }), i;
  };
}
var i0 = {};
Object.defineProperty(i0, "__esModule", {
  value: !0
});
i0.getRouteRegex = h4;
i0.getNamedRouteRegex = za;
i0.getMiddlewareRegex = Ma;
i0.getNamedMiddlewareRegex = Ba;
var pa = R1.default, l4 = q0, o4 = K1;
function h4(t) {
  const { parameterizedRoute: e, groups: r } = X2(t);
  return {
    re: new RegExp(`^${e}(?:/)?$`),
    groups: r
  };
}
function za(t) {
  const e = s4(t);
  return pa({}, h4(t), {
    namedRegex: `^${e.namedParameterizedRoute}(?:/)?$`,
    routeKeys: e.routeKeys
  });
}
function X2(t) {
  const e = o4.removeTrailingSlash(t).slice(1).split("/"), r = {};
  let n = 1;
  return {
    parameterizedRoute: e.map((c) => {
      if (c.startsWith("[") && c.endsWith("]")) {
        const { key: i, optional: l, repeat: s } = v4(c.slice(1, -1));
        return r[i] = {
          pos: n++,
          repeat: s,
          optional: l
        }, s ? l ? "(?:/(.+?))?" : "/(.+?)" : "/([^/]+?)";
      } else
        return `/${l4.escapeStringRegexp(c)}`;
    }).join(""),
    groups: r
  };
}
function s4(t) {
  const e = o4.removeTrailingSlash(t).slice(1).split("/"), r = ma(), n = {};
  return {
    namedParameterizedRoute: e.map((c) => {
      if (c.startsWith("[") && c.endsWith("]")) {
        const { key: i, optional: l, repeat: s } = v4(c.slice(1, -1));
        let o = i.replace(/\W/g, ""), h = !1;
        return (o.length === 0 || o.length > 30) && (h = !0), isNaN(parseInt(o.slice(0, 1))) || (h = !0), h && (o = r()), n[o] = i, s ? l ? `(?:/(?<${o}>.+?))?` : `/(?<${o}>.+?)` : `/(?<${o}>[^/]+?)`;
      } else
        return `/${l4.escapeStringRegexp(c)}`;
    }).join(""),
    routeKeys: n
  };
}
function v4(t) {
  const e = t.startsWith("[") && t.endsWith("]");
  e && (t = t.slice(1, -1));
  const r = t.startsWith("...");
  return r && (t = t.slice(3)), {
    key: t,
    repeat: r,
    optional: e
  };
}
function ma() {
  let t = 97, e = 1;
  return () => {
    let r = "";
    for (let n = 0; n < e; n++)
      r += String.fromCharCode(t), t++, t > 122 && (e++, t = 97);
    return r;
  };
}
function Ma(t, e) {
  const { parameterizedRoute: r, groups: n } = X2(t), { catchAll: c = !0 } = e != null ? e : {};
  if (r === "/") {
    let l = c ? ".*" : "";
    return {
      groups: {},
      re: new RegExp(`^/${l}$`)
    };
  }
  let i = c ? "(?:(/.*)?)" : "";
  return {
    groups: n,
    re: new RegExp(`^${r}${i}$`)
  };
}
function Ba(t, e) {
  const { parameterizedRoute: r } = X2(t), { catchAll: n = !0 } = e;
  if (r === "/")
    return {
      namedRegex: `^/${n ? ".*" : ""}$`
    };
  const { namedParameterizedRoute: c } = s4(t);
  return {
    namedRegex: `^${c}${n ? "(?:(/.*)?)" : ""}$`
  };
}
var l0 = {};
Object.defineProperty(l0, "__esModule", {
  value: !0
});
l0.formatUrl = u4;
l0.formatWithValidation = Va;
l0.urlObjectKeys = void 0;
var Ha = X1.default, wa = Ha(O1);
const xa = /https?|ftp|gopher|file/;
function u4(t) {
  let { auth: e, hostname: r } = t, n = t.protocol || "", c = t.pathname || "", i = t.hash || "", l = t.query || "", s = !1;
  e = e ? encodeURIComponent(e).replace(/%3A/i, ":") + "@" : "", t.host ? s = e + t.host : r && (s = e + (~r.indexOf(":") ? `[${r}]` : r), t.port && (s += ":" + t.port)), l && typeof l == "object" && (l = String(wa.urlQueryToSearchParams(l)));
  let o = t.search || l && `?${l}` || "";
  return n && !n.endsWith(":") && (n += ":"), t.slashes || (!n || xa.test(n)) && s !== !1 ? (s = "//" + (s || ""), c && c[0] !== "/" && (c = "/" + c)) : s || (s = ""), i && i[0] !== "#" && (i = "#" + i), o && o[0] !== "?" && (o = "?" + o), c = c.replace(/[?#]/g, encodeURIComponent), o = o.replace("#", "%23"), `${n}${s}${c}${o}${i}`;
}
const d4 = [
  "auth",
  "hash",
  "host",
  "hostname",
  "href",
  "path",
  "pathname",
  "port",
  "protocol",
  "query",
  "search",
  "slashes"
];
l0.urlObjectKeys = d4;
function Va(t) {
  return process.env.NODE_ENV === "development" && t !== null && typeof t == "object" && Object.keys(t).forEach((e) => {
    d4.indexOf(e) === -1 && console.warn(`Unknown key passed via urlObject into url.format: ${e}`);
  }), u4(t);
}
var R0 = { exports: {} }, w0 = {}, xt;
function ya() {
  if (xt)
    return w0;
  xt = 1, Object.defineProperty(w0, "__esModule", {
    value: !0
  }), w0.detectDomainLocale = t;
  function t(e, r, n) {
    let c;
    if (e) {
      n && (n = n.toLowerCase());
      for (const s of e) {
        var i, l;
        const o = (i = s.domain) == null ? void 0 : i.split(":")[0].toLowerCase();
        if (r === o || n === s.defaultLocale.toLowerCase() || ((l = s.locales) == null ? void 0 : l.some((h) => h.toLowerCase() === n))) {
          c = s;
          break;
        }
      }
    }
    return c;
  }
  return w0;
}
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.detectDomainLocale = void 0;
  const r = (...n) => {
    if (process.env.__NEXT_I18N_SUPPORT)
      return ya().detectDomainLocale(...n);
  };
  e.detectDomainLocale = r, (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(R0, R0.exports);
var T0 = { exports: {} }, W0 = {}, M0 = {};
Object.defineProperty(M0, "__esModule", {
  value: !0
});
M0.addPathPrefix = La;
var Ca = T1;
function La(t, e) {
  if (!t.startsWith("/") || !e)
    return t;
  const { pathname: r, query: n, hash: c } = Ca.parsePath(t);
  return `${e}${r}${n}${c}`;
}
Object.defineProperty(W0, "__esModule", {
  value: !0
});
W0.addLocale = Aa;
var _a = M0, Vt = c0;
function Aa(t, e, r, n) {
  return e && e !== r && (n || !Vt.pathHasPrefix(t.toLowerCase(), `/${e.toLowerCase()}`) && !Vt.pathHasPrefix(t.toLowerCase(), "/api")) ? _a.addPathPrefix(t, `/${e}`) : t;
}
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.addLocale = void 0;
  var r = d0.exports;
  const n = (c, ...i) => process.env.__NEXT_I18N_SUPPORT ? r.normalizePathTrailingSlash(W0.addLocale(c, ...i)) : c;
  e.addLocale = n, (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(T0, T0.exports);
var B2 = { exports: {} };
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.removeLocale = n;
  var r = T1;
  function n(c, i) {
    if (process.env.__NEXT_I18N_SUPPORT) {
      const { pathname: l } = r.parsePath(c), s = l.toLowerCase(), o = i == null ? void 0 : i.toLowerCase();
      return i && (s.startsWith(`/${o}/`) || s === `/${o}`) ? `${l.length === i.length + 1 ? "/" : ""}${c.slice(i.length + 1)}` : c;
    }
    return c;
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(B2, B2.exports);
var O0 = { exports: {} };
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.addBasePath = i;
  var r = M0, n = d0.exports;
  const c = process.env.__NEXT_ROUTER_BASEPATH || "";
  function i(l, s) {
    return process.env.__NEXT_MANUAL_CLIENT_BASE_PATH && !s ? l : n.normalizePathTrailingSlash(r.addPathPrefix(l, c));
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(O0, O0.exports);
var K2 = {}, Y2 = {};
Object.defineProperty(Y2, "__esModule", {
  value: !0
});
Y2.removePathPrefix = Pa;
var ba = c0;
function Pa(t, e) {
  if (ba.pathHasPrefix(t, e)) {
    const r = t.slice(e.length);
    return r.startsWith("/") ? r : `/${r}`;
  }
  return t;
}
Object.defineProperty(K2, "__esModule", {
  value: !0
});
K2.getNextPathnameInfo = Ta;
var Sa = n0, Ea = Y2, Ra = c0;
function Ta(t, e) {
  var r;
  const { basePath: n, i18n: c, trailingSlash: i } = (r = e.nextConfig) != null ? r : {}, l = {
    pathname: t,
    trailingSlash: t !== "/" ? t.endsWith("/") : i
  };
  if (n && Ra.pathHasPrefix(l.pathname, n) && (l.pathname = Ea.removePathPrefix(l.pathname, n), l.basePath = n), e.parseData === !0 && l.pathname.startsWith("/_next/data/") && l.pathname.endsWith(".json")) {
    const s = l.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/"), o = s[0];
    l.pathname = s[1] !== "index" ? `/${s.slice(1).join("/")}` : "/", l.buildId = o;
  }
  if (c) {
    const s = Sa.normalizeLocalePath(l.pathname, c.locales);
    l.locale = s == null ? void 0 : s.detectedLocale, l.pathname = (s == null ? void 0 : s.pathname) || l.pathname;
  }
  return l;
}
var Q2 = {}, J2 = {};
Object.defineProperty(J2, "__esModule", {
  value: !0
});
J2.addPathSuffix = Na;
var Oa = T1;
function Na(t, e) {
  if (!t.startsWith("/") || !e)
    return t;
  const { pathname: r, query: n, hash: c } = Oa.parsePath(t);
  return `${r}${e}${n}${c}`;
}
Object.defineProperty(Q2, "__esModule", {
  value: !0
});
Q2.formatNextPathnameInfo = Da;
var $a = K1, yt = M0, Ct = J2, Ia = W0;
function Da(t) {
  let e = Ia.addLocale(t.pathname, t.locale, t.buildId ? void 0 : t.defaultLocale, t.ignorePrefix);
  return t.buildId && (e = Ct.addPathSuffix(yt.addPathPrefix(e, `/_next/data/${t.buildId}`), t.pathname === "/" ? "index.json" : ".json")), e = yt.addPathPrefix(e, t.basePath), t.trailingSlash ? !t.buildId && !e.endsWith("/") ? Ct.addPathSuffix(e, "/") : e : $a.removeTrailingSlash(e);
}
var Z2 = {};
Object.defineProperty(Z2, "__esModule", {
  value: !0
});
Z2.compareRouterStates = ka;
function ka(t, e) {
  const r = Object.keys(t);
  if (r.length !== Object.keys(e).length)
    return !1;
  for (let n = r.length; n--; ) {
    const c = r[n];
    if (c === "query") {
      const i = Object.keys(t.query);
      if (i.length !== Object.keys(e.query).length)
        return !1;
      for (let l = i.length; l--; ) {
        const s = i[l];
        if (!e.query.hasOwnProperty(s) || t.query[s] !== e.query[s])
          return !1;
      }
    } else if (!e.hasOwnProperty(c) || t[c] !== e[c])
      return !1;
  }
  return !0;
}
var t2 = { exports: {} }, D = {};
/** @license React v17.0.2
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Lt;
function ja() {
  if (Lt)
    return D;
  Lt = 1;
  var t = 60103, e = 60106, r = 60107, n = 60108, c = 60114, i = 60109, l = 60110, s = 60112, o = 60113, h = 60120, v = 60115, d = 60116, g = 60121, f = 60122, M = 60117, x = 60129, z = 60131;
  if (typeof Symbol == "function" && Symbol.for) {
    var p = Symbol.for;
    t = p("react.element"), e = p("react.portal"), r = p("react.fragment"), n = p("react.strict_mode"), c = p("react.profiler"), i = p("react.provider"), l = p("react.context"), s = p("react.forward_ref"), o = p("react.suspense"), h = p("react.suspense_list"), v = p("react.memo"), d = p("react.lazy"), g = p("react.block"), f = p("react.server.block"), M = p("react.fundamental"), x = p("react.debug_trace_mode"), z = p("react.legacy_hidden");
  }
  function y(B) {
    if (typeof B == "object" && B !== null) {
      var E = B.$$typeof;
      switch (E) {
        case t:
          switch (B = B.type, B) {
            case r:
            case c:
            case n:
            case o:
            case h:
              return B;
            default:
              switch (B = B && B.$$typeof, B) {
                case l:
                case s:
                case d:
                case v:
                case i:
                  return B;
                default:
                  return E;
              }
          }
        case e:
          return E;
      }
    }
  }
  var H = i, u = t, m = s, w = r, C = d, A = v, V = e, _ = c, L = n, S = o;
  return D.ContextConsumer = l, D.ContextProvider = H, D.Element = u, D.ForwardRef = m, D.Fragment = w, D.Lazy = C, D.Memo = A, D.Portal = V, D.Profiler = _, D.StrictMode = L, D.Suspense = S, D.isAsyncMode = function() {
    return !1;
  }, D.isConcurrentMode = function() {
    return !1;
  }, D.isContextConsumer = function(B) {
    return y(B) === l;
  }, D.isContextProvider = function(B) {
    return y(B) === i;
  }, D.isElement = function(B) {
    return typeof B == "object" && B !== null && B.$$typeof === t;
  }, D.isForwardRef = function(B) {
    return y(B) === s;
  }, D.isFragment = function(B) {
    return y(B) === r;
  }, D.isLazy = function(B) {
    return y(B) === d;
  }, D.isMemo = function(B) {
    return y(B) === v;
  }, D.isPortal = function(B) {
    return y(B) === e;
  }, D.isProfiler = function(B) {
    return y(B) === c;
  }, D.isStrictMode = function(B) {
    return y(B) === n;
  }, D.isSuspense = function(B) {
    return y(B) === o;
  }, D.isValidElementType = function(B) {
    return typeof B == "string" || typeof B == "function" || B === r || B === c || B === x || B === n || B === o || B === h || B === z || typeof B == "object" && B !== null && (B.$$typeof === d || B.$$typeof === v || B.$$typeof === i || B.$$typeof === l || B.$$typeof === s || B.$$typeof === M || B.$$typeof === g || B[0] === f);
  }, D.typeOf = y, D;
}
var k = {};
/** @license React v17.0.2
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var _t;
function Ua() {
  return _t || (_t = 1, process.env.NODE_ENV !== "production" && function() {
    var t = 60103, e = 60106, r = 60107, n = 60108, c = 60114, i = 60109, l = 60110, s = 60112, o = 60113, h = 60120, v = 60115, d = 60116, g = 60121, f = 60122, M = 60117, x = 60129, z = 60131;
    if (typeof Symbol == "function" && Symbol.for) {
      var p = Symbol.for;
      t = p("react.element"), e = p("react.portal"), r = p("react.fragment"), n = p("react.strict_mode"), c = p("react.profiler"), i = p("react.provider"), l = p("react.context"), s = p("react.forward_ref"), o = p("react.suspense"), h = p("react.suspense_list"), v = p("react.memo"), d = p("react.lazy"), g = p("react.block"), f = p("react.server.block"), M = p("react.fundamental"), p("react.scope"), p("react.opaque.id"), x = p("react.debug_trace_mode"), p("react.offscreen"), z = p("react.legacy_hidden");
    }
    var y = !1;
    function H(P) {
      return !!(typeof P == "string" || typeof P == "function" || P === r || P === c || P === x || P === n || P === o || P === h || P === z || y || typeof P == "object" && P !== null && (P.$$typeof === d || P.$$typeof === v || P.$$typeof === i || P.$$typeof === l || P.$$typeof === s || P.$$typeof === M || P.$$typeof === g || P[0] === f));
    }
    function u(P) {
      if (typeof P == "object" && P !== null) {
        var d1 = P.$$typeof;
        switch (d1) {
          case t:
            var $1 = P.type;
            switch ($1) {
              case r:
              case c:
              case n:
              case o:
              case h:
                return $1;
              default:
                var o0 = $1 && $1.$$typeof;
                switch (o0) {
                  case l:
                  case s:
                  case d:
                  case v:
                  case i:
                    return o0;
                  default:
                    return d1;
                }
            }
          case e:
            return d1;
        }
      }
    }
    var m = l, w = i, C = t, A = s, V = r, _ = d, L = v, S = e, B = c, E = n, N = o, b = !1, $ = !1;
    function j(P) {
      return b || (b = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.")), !1;
    }
    function X(P) {
      return $ || ($ = !0, console.warn("The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.")), !1;
    }
    function W(P) {
      return u(P) === l;
    }
    function o1(P) {
      return u(P) === i;
    }
    function H1(P) {
      return typeof P == "object" && P !== null && P.$$typeof === t;
    }
    function Y1(P) {
      return u(P) === s;
    }
    function F(P) {
      return u(P) === r;
    }
    function w1(P) {
      return u(P) === d;
    }
    function Z(P) {
      return u(P) === v;
    }
    function r1(P) {
      return u(P) === e;
    }
    function G(P) {
      return u(P) === c;
    }
    function K(P) {
      return u(P) === n;
    }
    function q(P) {
      return u(P) === o;
    }
    k.ContextConsumer = m, k.ContextProvider = w, k.Element = C, k.ForwardRef = A, k.Fragment = V, k.Lazy = _, k.Memo = L, k.Portal = S, k.Profiler = B, k.StrictMode = E, k.Suspense = N, k.isAsyncMode = j, k.isConcurrentMode = X, k.isContextConsumer = W, k.isContextProvider = o1, k.isElement = H1, k.isForwardRef = Y1, k.isFragment = F, k.isLazy = w1, k.isMemo = Z, k.isPortal = r1, k.isProfiler = G, k.isStrictMode = K, k.isSuspense = q, k.isValidElementType = H, k.typeOf = u;
  }()), k;
}
var At;
function Fa() {
  return At || (At = 1, function(t) {
    process.env.NODE_ENV === "production" ? t.exports = ja() : t.exports = Ua();
  }(t2)), t2.exports;
}
Object.defineProperty(M1, "__esModule", {
  value: !0
});
M1.isLocalURL = N0;
M1.interpolateAs = $0;
M1.resolveHref = w2;
M1.createKey = x2;
M1.default = void 0;
var Q1 = k0.default, f1 = R1.default, g4 = l1.default, qa = X1.default, Wa = d0.exports, C1 = K1, v0 = f2.exports, Ga = z2.exports, x0 = qa(p0), Xa = O2, V1 = n0, Ka = g4(D2), v1 = U, p1 = F0, s1 = z0, Ya = O1, H2 = g4(k2), u0 = G2, e0 = i0, t1 = l0, bt = R0.exports, a0 = T1, L1 = T0.exports, e2 = B2.exports, n1 = S0.exports, e1 = O0.exports, D1 = E0.exports, V0 = K2, Pt = Q2, Qa = Z2;
function St() {
  return Object.assign(new Error("Route Cancelled"), {
    cancelled: !0
  });
}
function N0(t) {
  if (!v1.isAbsoluteUrl(t))
    return !0;
  try {
    const e = v1.getLocationOrigin(), r = new URL(t, e);
    return r.origin === e && D1.hasBasePath(r.pathname);
  } catch {
    return !1;
  }
}
function $0(t, e, r) {
  let n = "";
  const c = e0.getRouteRegex(t), i = c.groups, l = (e !== t ? u0.getRouteMatcher(c)(e) : "") || r;
  n = t;
  const s = Object.keys(i);
  return s.every((o) => {
    let h = l[o] || "";
    const { repeat: v, optional: d } = i[o];
    let g = `[${v ? "..." : ""}${o}]`;
    return d && (g = `${h ? "" : "/"}[${g}]`), v && !Array.isArray(h) && (h = [
      h
    ]), (d || o in l) && (n = n.replace(g, v ? h.map(
      (f) => encodeURIComponent(f)
    ).join("/") : encodeURIComponent(h)) || "/");
  }) || (n = ""), {
    params: s,
    result: n
  };
}
function f4(t, e) {
  const r = {};
  return Object.keys(t).forEach((n) => {
    e.includes(n) || (r[n] = t[n]);
  }), r;
}
function w2(t, e, r) {
  let n, c = typeof e == "string" ? e : t1.formatWithValidation(e);
  const i = c.match(/^[a-zA-Z]{1,}:\/\//), l = i ? c.slice(i[0].length) : c;
  if ((l.split("?")[0] || "").match(/(\/\/|\\)/)) {
    console.error(`Invalid href passed to next/router: ${c}, repeated forward-slashes (//) or backslashes \\ are not valid in the href`);
    const o = v1.normalizeRepeatedSlashes(l);
    c = (i ? i[0] : "") + o;
  }
  if (!N0(c))
    return r ? [
      c
    ] : c;
  try {
    n = new URL(c.startsWith("#") ? t.asPath : t.pathname, "http://n");
  } catch {
    n = new URL("/", "http://n");
  }
  try {
    const o = new URL(c, n);
    o.pathname = Wa.normalizePathTrailingSlash(o.pathname);
    let h = "";
    if (p1.isDynamicRoute(o.pathname) && o.searchParams && r) {
      const d = Ya.searchParamsToUrlQuery(o.searchParams), { result: g, params: f } = $0(o.pathname, o.pathname, d);
      g && (h = t1.formatWithValidation({
        pathname: g,
        hash: o.hash,
        query: f4(d, f)
      }));
    }
    const v = o.origin === n.origin ? o.href.slice(o.origin.length) : o.href;
    return r ? [
      v,
      h || v
    ] : v;
  } catch {
    return r ? [
      c
    ] : c;
  }
}
function a2(t) {
  const e = v1.getLocationOrigin();
  return t.startsWith(e) ? t.substring(e.length) : t;
}
function r2(t, e, r) {
  let [n, c] = w2(t, e, !0);
  const i = v1.getLocationOrigin(), l = n.startsWith(i), s = c && c.startsWith(i);
  n = a2(n), c = c && a2(c);
  const o = l ? n : e1.addBasePath(n), h = r ? a2(w2(t, r)) : c || n;
  return {
    url: o,
    as: s ? h : e1.addBasePath(h)
  };
}
function _1(t, e) {
  const r = C1.removeTrailingSlash(Xa.denormalizePagePath(t));
  return r === "/404" || r === "/_error" ? t : (e.includes(r) || e.some((n) => {
    if (p1.isDynamicRoute(n) && e0.getRouteRegex(n).re.test(r))
      return t = n, !0;
  }), C1.removeTrailingSlash(t));
}
const n2 = process.env.__NEXT_SCROLL_RESTORATION && typeof window < "u" && "scrollRestoration" in window.history && !!function() {
  try {
    let t = "__next";
    return sessionStorage.setItem(t, t), sessionStorage.removeItem(t), !0;
  } catch {
  }
}(), p4 = Symbol("SSG_DATA_NOT_FOUND");
function z4(t, e, r) {
  return fetch(t, {
    credentials: "same-origin",
    method: r.method || "GET",
    headers: Object.assign({}, r.headers, {
      "x-nextjs-data": "1"
    })
  }).then((n) => !n.ok && e > 1 && n.status >= 500 ? z4(t, e - 1, r) : n);
}
const Ja = {};
function J1({ dataHref: t, inflightCache: e, isPrefetch: r, hasMiddleware: n, isServerRender: c, parseJSON: i, persistCache: l, isBackground: s, unstable_skipClientCache: o }) {
  const { href: h } = new URL(t, window.location.href);
  var v;
  const d = (g) => z4(t, c ? 3 : 1, {
    headers: r ? {
      purpose: "prefetch"
    } : {},
    method: (v = g == null ? void 0 : g.method) != null ? v : "GET"
  }).then((f) => f.ok && (g == null ? void 0 : g.method) === "HEAD" ? {
    dataHref: t,
    response: f,
    text: "",
    json: {}
  } : f.text().then((M) => {
    if (!f.ok) {
      if (n && [
        301,
        302,
        307,
        308
      ].includes(f.status))
        return {
          dataHref: t,
          response: f,
          text: M,
          json: {}
        };
      if (!n && f.status === 404) {
        var x;
        if ((x = Et(M)) != null && x.notFound)
          return {
            dataHref: t,
            json: {
              notFound: p4
            },
            response: f,
            text: M
          };
      }
      const z = new Error("Failed to load static props");
      throw c || v0.markAssetError(z), z;
    }
    return {
      dataHref: t,
      json: i ? Et(M) : null,
      response: f,
      text: M
    };
  })).then((f) => ((!l || process.env.NODE_ENV !== "production" || f.response.headers.get("x-middleware-cache") === "no-cache") && delete e[h], f)).catch((f) => {
    throw delete e[h], f;
  });
  return o && l ? d({}).then((g) => (e[h] = Promise.resolve(g), g)) : e[h] !== void 0 ? e[h] : e[h] = d(s ? {
    method: "HEAD"
  } : {});
}
function Et(t) {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
function x2() {
  return Math.random().toString(36).slice(2, 10);
}
function h1({ url: t, router: e }) {
  if (t === e1.addBasePath(L1.addLocale(e.asPath, e.locale)))
    throw new Error(`Invariant: attempted to hard navigate to the same URL ${t} ${location.href}`);
  window.location.href = t;
}
const Rt = ({ route: t, router: e }) => {
  let r = !1;
  const n = e.clc = () => {
    r = !0;
  };
  return () => {
    if (r) {
      const i = new Error(`Abort fetching component for route: "${t}"`);
      throw i.cancelled = !0, i;
    }
    n === e.clc && (e.clc = null);
  };
};
class c1 {
  reload() {
    window.location.reload();
  }
  back() {
    window.history.back();
  }
  push(e, r, n = {}) {
    if (process.env.__NEXT_SCROLL_RESTORATION && n2)
      try {
        sessionStorage.setItem("__next_scroll_" + this._key, JSON.stringify({
          x: self.pageXOffset,
          y: self.pageYOffset
        }));
      } catch {
      }
    return { url: e, as: r } = r2(this, e, r), this.change("pushState", e, r, n);
  }
  replace(e, r, n = {}) {
    return { url: e, as: r } = r2(this, e, r), this.change("replaceState", e, r, n);
  }
  change(e, r, n, c, i) {
    var l = this;
    return Q1(function* () {
      if (!N0(r))
        return h1({
          url: r,
          router: l
        }), !1;
      const s = c._h, o = s || c._shouldResolveHref || a0.parsePath(r).pathname === a0.parsePath(n).pathname, h = f1({}, l.state), v = l.isReady !== !0;
      l.isReady = !0;
      const d = l.isSsr;
      if (s || (l.isSsr = !1), s && l.clc)
        return !1;
      const g = h.locale;
      if (process.env.__NEXT_I18N_SUPPORT) {
        h.locale = c.locale === !1 ? l.defaultLocale : c.locale || h.locale, typeof c.locale > "u" && (c.locale = h.locale);
        const b = s1.parseRelativeUrl(D1.hasBasePath(n) ? n1.removeBasePath(n) : n), $ = V1.normalizeLocalePath(b.pathname, l.locales);
        $.detectedLocale && (h.locale = $.detectedLocale, b.pathname = e1.addBasePath(b.pathname), n = t1.formatWithValidation(b), r = e1.addBasePath(V1.normalizeLocalePath(D1.hasBasePath(r) ? n1.removeBasePath(r) : r, l.locales).pathname));
        let j = !1;
        if (process.env.__NEXT_I18N_SUPPORT) {
          var f;
          (f = l.locales) != null && f.includes(h.locale) || (b.pathname = L1.addLocale(b.pathname, h.locale), h1({
            url: t1.formatWithValidation(b),
            router: l
          }), j = !0);
        }
        const X = bt.detectDomainLocale(l.domainLocales, void 0, h.locale);
        if (process.env.__NEXT_I18N_SUPPORT && !j && X && l.isLocaleDomain && self.location.hostname !== X.domain) {
          const W = n1.removeBasePath(n);
          h1({
            url: `http${X.http ? "" : "s"}://${X.domain}${e1.addBasePath(`${h.locale === X.defaultLocale ? "" : `/${h.locale}`}${W === "/" ? "" : W}` || "/")}`,
            router: l
          }), j = !0;
        }
        if (j)
          return new Promise(() => {
          });
      }
      v1.ST && performance.mark("routeChange");
      const { shallow: M = !1, scroll: x = !0 } = c, z = {
        shallow: M
      };
      l._inFlightRoute && l.clc && (d || c1.events.emit("routeChangeError", St(), l._inFlightRoute, z), l.clc(), l.clc = null), n = e1.addBasePath(L1.addLocale(D1.hasBasePath(n) ? n1.removeBasePath(n) : n, c.locale, l.defaultLocale));
      const p = e2.removeLocale(D1.hasBasePath(n) ? n1.removeBasePath(n) : n, h.locale);
      l._inFlightRoute = n;
      const y = g !== h.locale;
      if (!s && l.onlyAHashChange(p) && !y) {
        h.asPath = p, c1.events.emit("hashChangeStart", n, z), l.changeState(e, r, n, f1({}, c, {
          scroll: !1
        })), x && l.scrollToHash(p);
        try {
          yield l.set(h, l.components[h.route], null);
        } catch (b) {
          throw x0.default(b) && b.cancelled && c1.events.emit("routeChangeError", b, p, z), b;
        }
        return c1.events.emit("hashChangeComplete", n, z), !0;
      }
      let H = s1.parseRelativeUrl(r), { pathname: u, query: m } = H, w, C;
      try {
        [w, { __rewrites: C }] = yield Promise.all([
          l.pageLoader.getPageList(),
          v0.getClientBuildManifest(),
          l.pageLoader.getMiddleware()
        ]);
      } catch {
        return h1({
          url: n,
          router: l
        }), !1;
      }
      !l.urlIsNew(p) && !y && (e = "replaceState");
      let A = n;
      u = u && C1.removeTrailingSlash(n1.removeBasePath(u));
      const V = yield P0({
        asPath: n,
        locale: h.locale,
        router: l
      });
      if (c.shallow && V && (u = l.pathname), o && u !== "/_error")
        if (c._shouldResolveHref = !0, process.env.__NEXT_HAS_REWRITES && n.startsWith("/")) {
          const b = H2.default(e1.addBasePath(L1.addLocale(p, h.locale), !0), w, C, m, ($) => _1($, w), l.locales);
          if (b.externalDest)
            return h1({
              url: n,
              router: l
            }), !0;
          V || (A = b.asPath), b.matchedPage && b.resolvedHref && (u = b.resolvedHref, H.pathname = e1.addBasePath(u), V || (r = t1.formatWithValidation(H)));
        } else
          H.pathname = _1(u, w), H.pathname !== u && (u = H.pathname, H.pathname = e1.addBasePath(u), V || (r = t1.formatWithValidation(H)));
      if (!N0(n)) {
        if (process.env.NODE_ENV !== "production")
          throw new Error(`Invalid href: "${r}" and as: "${n}", received relative href and external as
See more info: https://nextjs.org/docs/messages/invalid-relative-url-external-as`);
        return h1({
          url: n,
          router: l
        }), !1;
      }
      A = e2.removeLocale(n1.removeBasePath(A), h.locale);
      let _ = C1.removeTrailingSlash(u), L = !1;
      if (p1.isDynamicRoute(_)) {
        const b = s1.parseRelativeUrl(A), $ = b.pathname, j = e0.getRouteRegex(_);
        L = u0.getRouteMatcher(j)($);
        const X = _ === $, W = X ? $0(_, $, m) : {};
        if (!L || X && !W.result) {
          const o1 = Object.keys(j.groups).filter((H1) => !m[H1]);
          if (o1.length > 0 && !V)
            throw process.env.NODE_ENV !== "production" && console.warn(`${X ? "Interpolating href" : "Mismatching `as` and `href`"} failed to manually provide the params: ${o1.join(", ")} in the \`href\`'s \`query\``), new Error((X ? `The provided \`href\` (${r}) value is missing query values (${o1.join(", ")}) to be interpolated properly. ` : `The provided \`as\` value (${$}) is incompatible with the \`href\` value (${_}). `) + `Read more: https://nextjs.org/docs/messages/${X ? "href-interpolation-failed" : "incompatible-href-as"}`);
        } else
          X ? n = t1.formatWithValidation(Object.assign({}, b, {
            pathname: W.result,
            query: f4(m, W.params)
          })) : Object.assign(m, L);
      }
      s || c1.events.emit("routeChangeStart", n, z);
      try {
        var S, B;
        let b = yield l.getRouteInfo({
          route: _,
          pathname: u,
          query: m,
          as: n,
          resolvedAs: A,
          routeProps: z,
          locale: h.locale,
          isPreview: h.isPreview,
          hasMiddleware: V
        });
        if ("route" in b && V && (u = b.route || _, _ = u, z.shallow || (m = Object.assign({}, b.query || {}, m)), L && u !== H.pathname && Object.keys(L).forEach((G) => {
          L && m[G] === L[G] && delete m[G];
        }), p1.isDynamicRoute(u))) {
          let K = !z.shallow && b.resolvedAs ? b.resolvedAs : e1.addBasePath(L1.addLocale(new URL(n, location.href).pathname, h.locale), !0);
          if (D1.hasBasePath(K) && (K = n1.removeBasePath(K)), process.env.__NEXT_I18N_SUPPORT) {
            const d1 = V1.normalizeLocalePath(K, l.locales);
            h.locale = d1.detectedLocale || h.locale, K = d1.pathname;
          }
          const q = e0.getRouteRegex(u), P = u0.getRouteMatcher(q)(K);
          P && Object.assign(m, P);
        }
        if ("type" in b)
          return b.type === "redirect-internal" ? l.change(e, b.newUrl, b.newAs, c) : (h1({
            url: b.destination,
            router: l
          }), new Promise(() => {
          }));
        let { error: $, props: j, __N_SSG: X, __N_SSP: W } = b;
        const o1 = b.Component;
        if (o1 && o1.unstable_scriptLoader && [].concat(o1.unstable_scriptLoader()).forEach((K) => {
          Ga.handleClientScriptLoad(K.props);
        }), (X || W) && j) {
          if (j.pageProps && j.pageProps.__N_REDIRECT) {
            c.locale = !1;
            const G = j.pageProps.__N_REDIRECT;
            if (G.startsWith("/") && j.pageProps.__N_REDIRECT_BASE_PATH !== !1) {
              const K = s1.parseRelativeUrl(G);
              K.pathname = _1(K.pathname, w);
              const { url: q, as: P } = r2(l, G, G);
              return l.change(e, q, P, c);
            }
            return h1({
              url: G,
              router: l
            }), new Promise(() => {
            });
          }
          if (h.isPreview = !!j.__N_PREVIEW, j.notFound === p4) {
            let G;
            try {
              yield l.fetchComponent("/404"), G = "/404";
            } catch {
              G = "/_error";
            }
            if (b = yield l.getRouteInfo({
              route: G,
              pathname: G,
              query: m,
              as: n,
              resolvedAs: A,
              routeProps: {
                shallow: !1
              },
              locale: h.locale,
              isPreview: h.isPreview
            }), "type" in b)
              throw new Error("Unexpected middleware effect on /404");
          }
        }
        c1.events.emit("beforeHistoryChange", n, z), l.changeState(e, r, n, c), s && u === "/_error" && ((S = self.__NEXT_DATA__.props) == null || (B = S.pageProps) == null ? void 0 : B.statusCode) === 500 && (j == null ? void 0 : j.pageProps) && (j.pageProps.statusCode = 500);
        var E;
        const H1 = c.shallow && h.route === ((E = b.route) != null ? E : _);
        var N;
        const Y1 = (N = c.scroll) != null ? N : !c._h && !H1, F = Y1 ? {
          x: 0,
          y: 0
        } : null, w1 = f1({}, h, {
          route: _,
          pathname: u,
          query: m,
          asPath: p,
          isFallback: !1
        }), Z = i != null ? i : F;
        if (!(c._h && !Z && !v && !y && Qa.compareRouterStates(w1, l.state))) {
          if (yield l.set(w1, b, Z).catch((K) => {
            if (K.cancelled)
              $ = $ || K;
            else
              throw K;
          }), $)
            throw s || c1.events.emit("routeChangeError", $, p, z), $;
          process.env.__NEXT_I18N_SUPPORT && h.locale && (document.documentElement.lang = h.locale), s || c1.events.emit("routeChangeComplete", n, z), Y1 && /#.+$/.test(n) && l.scrollToHash(n);
        }
        return !0;
      } catch (b) {
        if (x0.default(b) && b.cancelled)
          return !1;
        throw b;
      }
    })();
  }
  changeState(e, r, n, c = {}) {
    if (process.env.NODE_ENV !== "production") {
      if (typeof window.history > "u") {
        console.error("Warning: window.history is not available.");
        return;
      }
      if (typeof window.history[e] > "u") {
        console.error(`Warning: window.history.${e} is not available`);
        return;
      }
    }
    (e !== "pushState" || v1.getURL() !== n) && (this._shallow = c.shallow, window.history[e](
      {
        url: r,
        as: n,
        options: c,
        __N: !0,
        key: this._key = e !== "pushState" ? this._key : x2()
      },
      "",
      n
    ));
  }
  handleRouteInfoError(e, r, n, c, i, l) {
    var s = this;
    return Q1(function* () {
      if (console.error(e), e.cancelled)
        throw e;
      if (v0.isAssetError(e) || l)
        throw c1.events.emit("routeChangeError", e, c, i), h1({
          url: c,
          router: s
        }), St();
      try {
        let o;
        const { page: h, styleSheets: v } = yield s.fetchComponent("/_error"), d = {
          props: o,
          Component: h,
          styleSheets: v,
          err: e,
          error: e
        };
        if (!d.props)
          try {
            d.props = yield s.getInitialProps(h, {
              err: e,
              pathname: r,
              query: n
            });
          } catch (g) {
            console.error("Error in error page `getInitialProps`: ", g), d.props = {};
          }
        return d;
      } catch (o) {
        return s.handleRouteInfoError(x0.default(o) ? o : new Error(o + ""), r, n, c, i, !0);
      }
    })();
  }
  getRouteInfo({ route: e, pathname: r, query: n, as: c, resolvedAs: i, routeProps: l, locale: s, hasMiddleware: o, isPreview: h, unstable_skipClientCache: v }) {
    var d = this;
    return Q1(function* () {
      let g = e;
      try {
        var f, M, x;
        const z = Rt({
          route: g,
          router: d
        });
        let p = d.components[g];
        if (l.shallow && p && d.route === g)
          return p;
        o && (p = void 0);
        let y = p && !("initial" in p) && process.env.NODE_ENV !== "development" ? p : void 0;
        const H = {
          dataHref: d.pageLoader.getDataHref({
            href: t1.formatWithValidation({
              pathname: r,
              query: n
            }),
            skipInterpolation: !0,
            asPath: i,
            locale: s
          }),
          hasMiddleware: !0,
          isServerRender: d.isSsr,
          parseJSON: !0,
          inflightCache: d.sdc,
          persistCache: !h,
          isPrefetch: !1,
          unstable_skipClientCache: v
        }, u = yield Tt({
          fetchData: () => J1(H),
          asPath: i,
          locale: s,
          router: d
        });
        if (z(), (u == null || (f = u.effect) == null ? void 0 : f.type) === "redirect-internal" || (u == null || (M = u.effect) == null ? void 0 : M.type) === "redirect-external")
          return u.effect;
        if ((u == null || (x = u.effect) == null ? void 0 : x.type) === "rewrite" && (g = C1.removeTrailingSlash(u.effect.resolvedHref), r = u.effect.resolvedHref, n = f1({}, n, u.effect.parsedAs.query), i = n1.removeBasePath(V1.normalizeLocalePath(u.effect.parsedAs.pathname, d.locales).pathname), p = d.components[g], l.shallow && p && d.route === g && !o))
          return f1({}, p, {
            route: g
          });
        if (g === "/api" || g.startsWith("/api/"))
          return h1({
            url: c,
            router: d
          }), new Promise(() => {
          });
        const m = y || (yield d.fetchComponent(g).then((_) => ({
          Component: _.page,
          styleSheets: _.styleSheets,
          __N_SSG: _.mod.__N_SSG,
          __N_SSP: _.mod.__N_SSP,
          __N_RSC: !!_.mod.__next_rsc__
        })));
        if (process.env.NODE_ENV !== "production") {
          const { isValidElementType: _ } = Fa();
          if (!_(m.Component))
            throw new Error(`The default export is not a React Component in page: "${r}"`);
        }
        const w = m.__N_RSC && (process.env.NODE_ENV !== "production" || m.__N_SSP), C = m.__N_SSG || m.__N_SSP || m.__N_RSC, { props: A } = yield d._getData(Q1(function* () {
          if (C && !w) {
            const { json: _ } = u != null && u.json ? u : yield J1({
              dataHref: d.pageLoader.getDataHref({
                href: t1.formatWithValidation({
                  pathname: r,
                  query: n
                }),
                asPath: i,
                locale: s
              }),
              isServerRender: d.isSsr,
              parseJSON: !0,
              inflightCache: d.sdc,
              persistCache: !h,
              isPrefetch: !1,
              unstable_skipClientCache: v
            });
            return {
              props: _ || {}
            };
          }
          return {
            headers: {},
            props: yield d.getInitialProps(
              m.Component,
              {
                pathname: r,
                query: n,
                asPath: c,
                locale: s,
                locales: d.locales,
                defaultLocale: d.defaultLocale
              }
            )
          };
        }));
        if (m.__N_SSP && H.dataHref) {
          const _ = new URL(H.dataHref, window.location.href).href;
          delete d.sdc[_];
        }
        !d.isPreview && m.__N_SSG && process.env.NODE_ENV !== "development" && J1(Object.assign({}, H, {
          isBackground: !0,
          persistCache: !1,
          inflightCache: Ja
        })).catch(() => {
        });
        let V;
        return m.__N_RSC && (V = {
          __flight__: w ? (yield d._getData(() => d._getFlightData(t1.formatWithValidation({
            query: f1({}, n, {
              __flight__: "1"
            }),
            pathname: p1.isDynamicRoute(g) ? $0(r, s1.parseRelativeUrl(i).pathname, n).result : r
          })))).data : A.__flight__
        }), A.pageProps = Object.assign({}, A.pageProps, V), m.props = A, m.route = g, m.query = n, m.resolvedAs = i, d.components[g] = m, m;
      } catch (z) {
        return d.handleRouteInfoError(x0.getProperError(z), r, n, c, l);
      }
    })();
  }
  set(e, r, n) {
    return this.state = e, this.sub(r, this.components["/_app"].Component, n);
  }
  beforePopState(e) {
    this._bps = e;
  }
  onlyAHashChange(e) {
    if (!this.asPath)
      return !1;
    const [r, n] = this.asPath.split("#"), [c, i] = e.split("#");
    return i && r === c && n === i ? !0 : r !== c ? !1 : n !== i;
  }
  scrollToHash(e) {
    const [, r = ""] = e.split("#");
    if (r === "" || r === "top") {
      window.scrollTo(0, 0);
      return;
    }
    const n = decodeURIComponent(r), c = document.getElementById(n);
    if (c) {
      c.scrollIntoView();
      return;
    }
    const i = document.getElementsByName(n)[0];
    i && i.scrollIntoView();
  }
  urlIsNew(e) {
    return this.asPath !== e;
  }
  prefetch(e, r = e, n = {}) {
    var c = this;
    return Q1(function* () {
      let i = s1.parseRelativeUrl(e), { pathname: l, query: s } = i;
      if (process.env.__NEXT_I18N_SUPPORT && n.locale === !1) {
        l = V1.normalizeLocalePath(l, c.locales).pathname, i.pathname = l, e = t1.formatWithValidation(i);
        let M = s1.parseRelativeUrl(r);
        const x = V1.normalizeLocalePath(M.pathname, c.locales);
        M.pathname = x.pathname, n.locale = x.detectedLocale || c.defaultLocale, r = t1.formatWithValidation(M);
      }
      const o = yield c.pageLoader.getPageList();
      let h = r;
      const v = typeof n.locale < "u" ? n.locale || void 0 : c.locale, d = yield P0({
        asPath: r,
        locale: v,
        router: c
      });
      if (process.env.__NEXT_HAS_REWRITES && r.startsWith("/")) {
        let M;
        ({ __rewrites: M } = yield v0.getClientBuildManifest());
        const x = H2.default(e1.addBasePath(L1.addLocale(r, c.locale), !0), o, M, i.query, (z) => _1(z, o), c.locales);
        if (x.externalDest)
          return;
        h = e2.removeLocale(n1.removeBasePath(x.asPath), c.locale), x.matchedPage && x.resolvedHref && (l = x.resolvedHref, i.pathname = l, d || (e = t1.formatWithValidation(i)));
      }
      if (i.pathname = _1(i.pathname, o), p1.isDynamicRoute(i.pathname) && (l = i.pathname, i.pathname = l, Object.assign(s, u0.getRouteMatcher(e0.getRouteRegex(i.pathname))(a0.parsePath(r).pathname) || {}), d || (e = t1.formatWithValidation(i))), process.env.NODE_ENV !== "production")
        return;
      const g = yield Tt({
        fetchData: () => J1({
          dataHref: c.pageLoader.getDataHref({
            href: t1.formatWithValidation({
              pathname: l,
              query: s
            }),
            skipInterpolation: !0,
            asPath: h,
            locale: v
          }),
          hasMiddleware: !0,
          isServerRender: c.isSsr,
          parseJSON: !0,
          inflightCache: c.sdc,
          persistCache: !c.isPreview,
          isPrefetch: !0
        }),
        asPath: r,
        locale: v,
        router: c
      });
      if ((g == null ? void 0 : g.effect.type) === "rewrite" && (i.pathname = g.effect.resolvedHref, l = g.effect.resolvedHref, s = f1({}, s, g.effect.parsedAs.query), h = g.effect.parsedAs.pathname, e = t1.formatWithValidation(i)), (g == null ? void 0 : g.effect.type) === "redirect-external")
        return;
      const f = C1.removeTrailingSlash(l);
      yield Promise.all([
        c.pageLoader._isSsg(f).then((M) => M ? J1({
          dataHref: (g == null ? void 0 : g.dataHref) || c.pageLoader.getDataHref({
            href: e,
            asPath: h,
            locale: v
          }),
          isServerRender: !1,
          parseJSON: !0,
          inflightCache: c.sdc,
          persistCache: !c.isPreview,
          isPrefetch: !0,
          unstable_skipClientCache: n.unstable_skipClientCache || n.priority && !!process.env.__NEXT_OPTIMISTIC_CLIENT_CACHE
        }).then(() => !1) : !1),
        c.pageLoader[n.priority ? "loadPage" : "prefetch"](f)
      ]);
    })();
  }
  fetchComponent(e) {
    var r = this;
    return Q1(function* () {
      const n = Rt({
        route: e,
        router: r
      });
      try {
        const c = yield r.pageLoader.loadPage(e);
        return n(), c;
      } catch (c) {
        throw n(), c;
      }
    })();
  }
  _getData(e) {
    let r = !1;
    const n = () => {
      r = !0;
    };
    return this.clc = n, e().then((c) => {
      if (n === this.clc && (this.clc = null), r) {
        const i = new Error("Loading initial props cancelled");
        throw i.cancelled = !0, i;
      }
      return c;
    });
  }
  _getFlightData(e) {
    return J1({
      dataHref: e,
      isServerRender: !0,
      parseJSON: !1,
      inflightCache: this.sdc,
      persistCache: !1,
      isPrefetch: !1
    }).then(({ text: r }) => ({
      data: r
    }));
  }
  getInitialProps(e, r) {
    const { Component: n } = this.components["/_app"], c = this._wrapApp(n);
    return r.AppTree = c, v1.loadGetInitialProps(n, {
      AppTree: c,
      Component: e,
      router: this,
      ctx: r
    });
  }
  get route() {
    return this.state.route;
  }
  get pathname() {
    return this.state.pathname;
  }
  get query() {
    return this.state.query;
  }
  get asPath() {
    return this.state.asPath;
  }
  get locale() {
    return this.state.locale;
  }
  get isFallback() {
    return this.state.isFallback;
  }
  get isPreview() {
    return this.state.isPreview;
  }
  constructor(e, r, n, { initialProps: c, pageLoader: i, App: l, wrapApp: s, Component: o, err: h, subscription: v, isFallback: d, locale: g, locales: f, defaultLocale: M, domainLocales: x, isPreview: z, isRsc: p }) {
    this.sdc = {}, this.isFirstPopStateEvent = !0, this._key = x2(), this.onPopState = (u) => {
      const { isFirstPopStateEvent: m } = this;
      this.isFirstPopStateEvent = !1;
      const w = u.state;
      if (!w) {
        const { pathname: B, query: E } = this;
        this.changeState("replaceState", t1.formatWithValidation({
          pathname: e1.addBasePath(B),
          query: E
        }), v1.getURL());
        return;
      }
      if (w.__NA) {
        window.location.reload();
        return;
      }
      if (!w.__N || m && this.locale === w.options.locale && w.as === this.asPath)
        return;
      let C;
      const { url: A, as: V, options: _, key: L } = w;
      if (process.env.__NEXT_SCROLL_RESTORATION && n2 && this._key !== L) {
        try {
          sessionStorage.setItem("__next_scroll_" + this._key, JSON.stringify({
            x: self.pageXOffset,
            y: self.pageYOffset
          }));
        } catch {
        }
        try {
          const B = sessionStorage.getItem("__next_scroll_" + L);
          C = JSON.parse(B);
        } catch {
          C = {
            x: 0,
            y: 0
          };
        }
      }
      this._key = L;
      const { pathname: S } = s1.parseRelativeUrl(A);
      this.isSsr && V === e1.addBasePath(this.asPath) && S === e1.addBasePath(this.pathname) || this._bps && !this._bps(w) || this.change("replaceState", A, V, Object.assign({}, _, {
        shallow: _.shallow && this._shallow,
        locale: _.locale || this.defaultLocale,
        _h: 0
      }), C);
    };
    const y = C1.removeTrailingSlash(e);
    this.components = {}, e !== "/_error" && (this.components[y] = {
      Component: o,
      initial: !0,
      props: c,
      err: h,
      __N_SSG: c && c.__N_SSG,
      __N_SSP: c && c.__N_SSP,
      __N_RSC: !!p
    }), this.components["/_app"] = {
      Component: l,
      styleSheets: []
    }, this.events = c1.events, this.pageLoader = i;
    const H = p1.isDynamicRoute(e) && self.__NEXT_DATA__.autoExport;
    if (this.basePath = process.env.__NEXT_ROUTER_BASEPATH || "", this.sub = v, this.clc = null, this._wrapApp = s, this.isSsr = !0, this.isLocaleDomain = !1, this.isReady = !!(self.__NEXT_DATA__.gssp || self.__NEXT_DATA__.gip || self.__NEXT_DATA__.appGip && !self.__NEXT_DATA__.gsp || !H && !self.location.search && !process.env.__NEXT_HAS_REWRITES), process.env.__NEXT_I18N_SUPPORT && (this.locales = f, this.defaultLocale = M, this.domainLocales = x, this.isLocaleDomain = !!bt.detectDomainLocale(x, self.location.hostname)), this.state = {
      route: y,
      pathname: e,
      query: r,
      asPath: H ? e : n,
      isPreview: !!z,
      locale: process.env.__NEXT_I18N_SUPPORT ? g : void 0,
      isFallback: d
    }, this._initialMatchesMiddlewarePromise = Promise.resolve(!1), typeof window < "u") {
      if (!n.startsWith("//")) {
        const u = {
          locale: g
        }, m = v1.getURL();
        this._initialMatchesMiddlewarePromise = P0({
          router: this,
          locale: g,
          asPath: m
        }).then((w) => (u._shouldResolveHref = n !== e, this.changeState("replaceState", w ? m : t1.formatWithValidation({
          pathname: e1.addBasePath(e),
          query: r
        }), m, u), w));
      }
      window.addEventListener("popstate", this.onPopState), process.env.__NEXT_SCROLL_RESTORATION && n2 && (window.history.scrollRestoration = "manual");
    }
  }
}
c1.events = Ka.default();
function P0(t) {
  return Promise.resolve(t.router.pageLoader.getMiddleware()).then((e) => {
    const { pathname: r } = a0.parsePath(t.asPath), n = D1.hasBasePath(r) ? n1.removeBasePath(r) : r, c = e == null ? void 0 : e.location;
    return !!c && new RegExp(c).test(L1.addLocale(n, t.locale));
  });
}
function Tt(t) {
  return P0(t).then((e) => e && t.fetchData ? t.fetchData().then((r) => Za(r.dataHref, r.response, t).then((n) => ({
    dataHref: r.dataHref,
    json: r.json,
    response: r.response,
    text: r.text,
    effect: n
  }))).catch((r) => null) : null);
}
function Za(t, e, r) {
  const n = {
    basePath: r.router.basePath,
    i18n: {
      locales: r.router.locales
    },
    trailingSlash: Boolean(process.env.__NEXT_TRAILING_SLASH)
  }, c = e.headers.get("x-nextjs-rewrite");
  let i = c || e.headers.get("x-nextjs-matched-path");
  const l = e.headers.get("x-matched-path");
  if (l && !i && !l.includes("__next_data_catchall") && !l.includes("/_error") && !l.includes("/404") && (i = l), i) {
    if (i.startsWith("/")) {
      const v = s1.parseRelativeUrl(i), d = V0.getNextPathnameInfo(v.pathname, {
        nextConfig: n,
        parseData: !0
      });
      let g = C1.removeTrailingSlash(d.pathname);
      return Promise.all([
        r.router.pageLoader.getPageList(),
        v0.getClientBuildManifest()
      ]).then(([f, { __rewrites: M }]) => {
        let x = L1.addLocale(d.pathname, d.locale);
        if (p1.isDynamicRoute(x) || !c && f.includes(V1.normalizeLocalePath(n1.removeBasePath(x), r.router.locales).pathname)) {
          const p = V0.getNextPathnameInfo(s1.parseRelativeUrl(t).pathname, {
            parseData: !0
          });
          x = e1.addBasePath(p.pathname), v.pathname = x;
        }
        if (process.env.__NEXT_HAS_REWRITES) {
          const p = H2.default(x, f, M, v.query, (y) => _1(y, f), r.router.locales);
          p.matchedPage && (v.pathname = p.parsedAs.pathname, x = v.pathname, Object.assign(v.query, p.parsedAs.query));
        } else if (!f.includes(g)) {
          const p = _1(g, f);
          p !== g && (g = p);
        }
        const z = f.includes(g) ? g : _1(V1.normalizeLocalePath(n1.removeBasePath(v.pathname), r.router.locales).pathname, f);
        if (p1.isDynamicRoute(z)) {
          const p = u0.getRouteMatcher(e0.getRouteRegex(z))(x);
          Object.assign(v.query, p || {});
        }
        return {
          type: "rewrite",
          parsedAs: v,
          resolvedHref: z
        };
      });
    }
    const o = a0.parsePath(t), h = Pt.formatNextPathnameInfo(f1({}, V0.getNextPathnameInfo(o.pathname, {
      nextConfig: n,
      parseData: !0
    }), {
      defaultLocale: r.router.defaultLocale,
      buildId: ""
    }));
    return Promise.resolve({
      type: "redirect-external",
      destination: `${h}${o.query}${o.hash}`
    });
  }
  const s = e.headers.get("x-nextjs-redirect");
  if (s) {
    if (s.startsWith("/")) {
      const o = a0.parsePath(s), h = Pt.formatNextPathnameInfo(f1({}, V0.getNextPathnameInfo(o.pathname, {
        nextConfig: n,
        parseData: !0
      }), {
        defaultLocale: r.router.defaultLocale,
        buildId: ""
      }));
      return Promise.resolve({
        type: "redirect-internal",
        newAs: `${h}${o.query}${o.hash}`,
        newUrl: `${h}${o.query}${o.hash}`
      });
    }
    return Promise.resolve({
      type: "redirect-external",
      destination: s
    });
  }
  return Promise.resolve({
    type: "next"
  });
}
M1.default = c1;
var B0 = {};
Object.defineProperty(B0, "__esModule", {
  value: !0
});
B0.RouterContext = void 0;
var t3 = l1.default, e3 = t3(R);
const m4 = e3.default.createContext(null);
B0.RouterContext = m4;
process.env.NODE_ENV !== "production" && (m4.displayName = "RouterContext");
var A1 = {};
Object.defineProperty(A1, "__esModule", {
  value: !0
});
A1.GlobalLayoutRouterContext = A1.LayoutRouterContext = A1.AppRouterContext = void 0;
var a3 = l1.default, tt = a3(R);
const M4 = tt.default.createContext(null);
A1.AppRouterContext = M4;
const B4 = tt.default.createContext(null);
A1.LayoutRouterContext = B4;
const H4 = tt.default.createContext(null);
A1.GlobalLayoutRouterContext = H4;
process.env.NODE_ENV !== "production" && (M4.displayName = "AppRouterContext", B4.displayName = "LayoutRouterContext", H4.displayName = "GlobalLayoutRouterContext");
var V2 = { exports: {} };
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.useIntersection = i;
  var r = R, n = g0.exports;
  const c = typeof IntersectionObserver == "function";
  function i({ rootRef: v, rootMargin: d, disabled: g }) {
    const f = g || !c, M = r.useRef(), [x, z] = r.useState(!1), [p, y] = r.useState(null);
    r.useEffect(() => {
      if (c)
        return M.current && (M.current(), M.current = void 0), f || x ? void 0 : (p && p.tagName && (M.current = l(p, (u) => u && z(u), {
          root: v == null ? void 0 : v.current,
          rootMargin: d
        })), () => {
          M.current == null || M.current(), M.current = void 0;
        });
      if (!x) {
        const u = n.requestIdleCallback(() => z(!0));
        return () => n.cancelIdleCallback(u);
      }
    }, [
      p,
      f,
      d,
      v,
      x
    ]);
    const H = r.useCallback(() => {
      z(!1);
    }, []);
    return [
      y,
      x,
      H
    ];
  }
  function l(v, d, g) {
    const { id: f, observer: M, elements: x } = h(g);
    return x.set(v, d), M.observe(v), function() {
      if (x.delete(v), M.unobserve(v), x.size === 0) {
        M.disconnect(), s.delete(f);
        const p = o.findIndex((y) => y.root === f.root && y.margin === f.margin);
        p > -1 && o.splice(p, 1);
      }
    };
  }
  const s = /* @__PURE__ */ new Map(), o = [];
  function h(v) {
    const d = {
      root: v.root || null,
      margin: v.rootMargin || ""
    }, g = o.find((z) => z.root === d.root && z.margin === d.margin);
    let f;
    if (g && (f = s.get(g), f))
      return f;
    const M = /* @__PURE__ */ new Map(), x = new IntersectionObserver((z) => {
      z.forEach((p) => {
        const y = M.get(p.target), H = p.isIntersecting || p.intersectionRatio > 0;
        y && H && y(H);
      });
    }, v);
    return f = {
      id: d,
      observer: x,
      elements: M
    }, o.push(d), s.set(d, f), f;
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(V2, V2.exports);
var y2 = { exports: {} }, y0 = { exports: {} }, Ot;
function r3() {
  return Ot || (Ot = 1, function(t, e) {
    Object.defineProperty(e, "__esModule", {
      value: !0
    }), e.normalizeLocalePath = void 0;
    const r = (n, c) => process.env.__NEXT_I18N_SUPPORT ? n0.normalizeLocalePath(n, c) : {
      pathname: n,
      detectedLocale: void 0
    };
    e.normalizeLocalePath = r, (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
  }(y0, y0.exports)), y0.exports;
}
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.getDomainLocale = n;
  const r = process.env.__NEXT_ROUTER_BASEPATH || "";
  function n(c, i, l, s) {
    if (process.env.__NEXT_I18N_SUPPORT) {
      const o = r3().normalizeLocalePath, h = R0.exports.detectDomainLocale, v = i || o(c, l).detectedLocale, d = h(s, void 0, v);
      if (d) {
        const g = `http${d.http ? "" : "s"}://`, f = v === d.defaultLocale ? "" : `/${v}`;
        return `${g}${d.domain}${r}${f}${c}`;
      }
      return !1;
    } else
      return !1;
  }
  (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(y2, y2.exports);
(function(t, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = void 0;
  var r = l1.default, n = j0.default, c = r(R), i = M1, l = T0.exports, s = B0, o = A1, h = V2.exports, v = y2.exports, d = O0.exports;
  const g = typeof c.default.useTransition < "u", f = {};
  function M(H, u, m, w) {
    if (typeof window > "u" || !H || !i.isLocalURL(u))
      return;
    H.prefetch(u, m, w).catch((A) => {
      if (process.env.NODE_ENV !== "production")
        throw A;
    });
    const C = w && typeof w.locale < "u" ? w.locale : H && H.locale;
    f[u + "%" + m + (C ? "%" + C : "")] = !0;
  }
  function x(H) {
    const { target: u } = H.currentTarget;
    return u && u !== "_self" || H.metaKey || H.ctrlKey || H.shiftKey || H.altKey || H.nativeEvent && H.nativeEvent.which === 2;
  }
  function z(H, u, m, w, C, A, V, _, L, S) {
    const { nodeName: B } = H.currentTarget;
    if (B.toUpperCase() === "A" && (x(H) || !i.isLocalURL(m)))
      return;
    H.preventDefault();
    const N = () => {
      "softPush" in u && "softReplace" in u ? u[A ? C ? "softReplace" : "softPush" : C ? "replace" : "push"](m) : u[C ? "replace" : "push"](m, w, {
        shallow: V,
        locale: L,
        scroll: _
      });
    };
    S ? S(N) : N();
  }
  var y = /* @__PURE__ */ c.default.forwardRef(function(u, m) {
    if (process.env.NODE_ENV !== "production") {
      let I = function(O) {
        return new Error(`Failed prop type: The prop \`${O.key}\` expects a ${O.expected} in \`<Link>\`, but got \`${O.actual}\` instead.` + (typeof window < "u" ? `
Open your browser's console to view the Component stack trace.` : ""));
      };
      Object.keys({
        href: !0
      }).forEach((O) => {
        if (O === "href" && (u[O] == null || typeof u[O] != "string" && typeof u[O] != "object"))
          throw I({
            key: O,
            expected: "`string` or `object`",
            actual: u[O] === null ? "null" : typeof u[O]
          });
      }), Object.keys({
        as: !0,
        replace: !0,
        soft: !0,
        scroll: !0,
        shallow: !0,
        passHref: !0,
        prefetch: !0,
        locale: !0,
        onClick: !0,
        onMouseEnter: !0,
        onTouchStart: !0,
        legacyBehavior: !0
      }).forEach((O) => {
        const g1 = typeof u[O];
        if (O === "as") {
          if (u[O] && g1 !== "string" && g1 !== "object")
            throw I({
              key: O,
              expected: "`string` or `object`",
              actual: g1
            });
        } else if (O === "locale") {
          if (u[O] && g1 !== "string")
            throw I({
              key: O,
              expected: "`string`",
              actual: g1
            });
        } else if (O === "onClick" || O === "onMouseEnter" || O === "onTouchStart") {
          if (u[O] && g1 !== "function")
            throw I({
              key: O,
              expected: "`function`",
              actual: g1
            });
        } else if ((O === "replace" || O === "soft" || O === "scroll" || O === "shallow" || O === "passHref" || O === "prefetch" || O === "legacyBehavior") && u[O] != null && g1 !== "boolean")
          throw I({
            key: O,
            expected: "`boolean`",
            actual: g1
          });
      });
      const ut = c.default.useRef(!1);
      u.prefetch && !ut.current && (ut.current = !0, console.warn("Next.js auto-prefetches automatically based on viewport. The prefetch attribute is no longer needed. More: https://nextjs.org/docs/messages/prefetch-true-deprecated"));
    }
    let w;
    const { href: C, as: A, children: V, prefetch: _, passHref: L, replace: S, soft: B, shallow: E, scroll: N, locale: b, onClick: $, onMouseEnter: j, onTouchStart: X, legacyBehavior: W = Boolean(process.env.__NEXT_NEW_LINK_BEHAVIOR) !== !0 } = u, o1 = n(u, [
      "href",
      "as",
      "children",
      "prefetch",
      "passHref",
      "replace",
      "soft",
      "shallow",
      "scroll",
      "locale",
      "onClick",
      "onMouseEnter",
      "onTouchStart",
      "legacyBehavior"
    ]);
    w = V, W && (typeof w == "string" || typeof w == "number") && (w = /* @__PURE__ */ c.default.createElement("a", null, w));
    const H1 = _ !== !1, [, Y1] = g ? c.default.useTransition() : [];
    let F = c.default.useContext(s.RouterContext);
    const w1 = c.default.useContext(o.AppRouterContext);
    w1 && (F = w1);
    const { href: Z, as: r1 } = c.default.useMemo(() => {
      const [I, x1] = i.resolveHref(F, C, !0);
      return {
        href: I,
        as: A ? i.resolveHref(F, A) : x1 || I
      };
    }, [
      F,
      C,
      A
    ]), G = c.default.useRef(Z), K = c.default.useRef(r1);
    let q;
    if (W)
      if (process.env.NODE_ENV === "development") {
        $ && console.warn(`"onClick" was passed to <Link> with \`href\` of \`${C}\` but "legacyBehavior" was set. The legacy behavior requires onClick be set on the child of next/link`), j && console.warn(`"onMouseEnter" was passed to <Link> with \`href\` of \`${C}\` but "legacyBehavior" was set. The legacy behavior requires onMouseEnter be set on the child of next/link`);
        try {
          q = c.default.Children.only(w);
        } catch {
          throw w ? new Error(`Multiple children were passed to <Link> with \`href\` of \`${C}\` but only one child is supported https://nextjs.org/docs/messages/link-multiple-children` + (typeof window < "u" ? ` 
Open your browser's console to view the Component stack trace.` : "")) : new Error(`No children were passed to <Link> with \`href\` of \`${C}\` but one child is required https://nextjs.org/docs/messages/link-no-children`);
        }
      } else
        q = c.default.Children.only(w);
    const P = W ? q && typeof q == "object" && q.ref : m, [d1, $1, o0] = h.useIntersection({
      rootMargin: "200px"
    }), D4 = c.default.useCallback((I) => {
      (K.current !== r1 || G.current !== Z) && (o0(), K.current = r1, G.current = Z), d1(I), P && (typeof P == "function" ? P(I) : typeof P == "object" && (P.current = I));
    }, [
      r1,
      P,
      Z,
      o0,
      d1
    ]);
    c.default.useEffect(() => {
      const I = $1 && H1 && i.isLocalURL(Z), x1 = typeof b < "u" ? b : F && F.locale, vt = f[Z + "%" + r1 + (x1 ? "%" + x1 : "")];
      I && !vt && M(F, Z, r1, {
        locale: x1
      });
    }, [
      r1,
      Z,
      $1,
      b,
      H1,
      F
    ]);
    const Z0 = {
      ref: D4,
      onClick: (I) => {
        if (process.env.NODE_ENV !== "production" && !I)
          throw new Error('Component rendered inside next/link has to pass click event to "onClick" prop.');
        !W && typeof $ == "function" && $(I), W && q.props && typeof q.props.onClick == "function" && q.props.onClick(I), I.defaultPrevented || z(I, F, Z, r1, S, B, E, N, b, w1 ? Y1 : void 0);
      },
      onMouseEnter: (I) => {
        !W && typeof j == "function" && j(I), W && q.props && typeof q.props.onMouseEnter == "function" && q.props.onMouseEnter(I), i.isLocalURL(Z) && M(F, Z, r1, {
          priority: !0
        });
      },
      onTouchStart: (I) => {
        !W && typeof X == "function" && X(I), W && q.props && typeof q.props.onTouchStart == "function" && q.props.onTouchStart(I), i.isLocalURL(Z) && M(F, Z, r1, {
          priority: !0
        });
      }
    };
    if (!W || L || q.type === "a" && !("href" in q.props)) {
      const I = typeof b < "u" ? b : F && F.locale, x1 = F && F.isLocaleDomain && v.getDomainLocale(r1, I, F.locales, F.domainLocales);
      Z0.href = x1 || d.addBasePath(l.addLocale(r1, I, F && F.defaultLocale));
    }
    return W ? /* @__PURE__ */ c.default.cloneElement(q, Z0) : /* @__PURE__ */ c.default.createElement("a", Object.assign({}, o1, Z0), w);
  });
  e.default = y, (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
})(g2, g2.exports);
(function(t) {
  t.exports = g2.exports;
})(Be);
var n3 = { exports: {} }, C0 = { exports: {} }, L0 = { exports: {} }, Nt;
function c3() {
  return Nt || (Nt = 1, function(t, e) {
    Object.defineProperty(e, "__esModule", {
      value: !0
    }), e.default = i;
    var r = l1.default, n = r(R), c = w4();
    function i(l) {
      function s(o) {
        return /* @__PURE__ */ n.default.createElement(l, Object.assign({
          router: c.useRouter()
        }, o));
      }
      if (s.getInitialProps = l.getInitialProps, s.origGetInitialProps = l.origGetInitialProps, process.env.NODE_ENV !== "production") {
        const o = l.displayName || l.name || "Unknown";
        s.displayName = `withRouter(${o})`;
      }
      return s;
    }
    (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
  }(L0, L0.exports)), L0.exports;
}
var $t;
function w4() {
  return $t || ($t = 1, function(t, e) {
    Object.defineProperty(e, "__esModule", {
      value: !0
    }), Object.defineProperty(e, "Router", {
      enumerable: !0,
      get: function() {
        return c.default;
      }
    }), Object.defineProperty(e, "withRouter", {
      enumerable: !0,
      get: function() {
        return s.default;
      }
    }), e.useRouter = M, e.createRouter = x, e.makePublicRouterInstance = z, e.default = void 0;
    var r = l1.default, n = r(R), c = r(M1), i = B0, l = r(p0), s = r(c3());
    const o = {
      router: null,
      readyCallbacks: [],
      ready(p) {
        if (this.router)
          return p();
        typeof window < "u" && this.readyCallbacks.push(p);
      }
    }, h = [
      "pathname",
      "route",
      "query",
      "asPath",
      "components",
      "isFallback",
      "basePath",
      "locale",
      "locales",
      "defaultLocale",
      "isReady",
      "isPreview",
      "isLocaleDomain",
      "domainLocales"
    ], v = [
      "routeChangeStart",
      "beforeHistoryChange",
      "routeChangeComplete",
      "routeChangeError",
      "hashChangeStart",
      "hashChangeComplete"
    ], d = [
      "push",
      "replace",
      "reload",
      "back",
      "prefetch",
      "beforePopState"
    ];
    Object.defineProperty(o, "events", {
      get() {
        return c.default.events;
      }
    }), h.forEach((p) => {
      Object.defineProperty(o, p, {
        get() {
          return g()[p];
        }
      });
    }), d.forEach((p) => {
      o[p] = (...y) => g()[p](...y);
    }), v.forEach((p) => {
      o.ready(() => {
        c.default.events.on(p, (...y) => {
          const H = `on${p.charAt(0).toUpperCase()}${p.substring(1)}`, u = o;
          if (u[H])
            try {
              u[H](...y);
            } catch (m) {
              console.error(`Error when running the Router event: ${H}`), console.error(l.default(m) ? `${m.message}
${m.stack}` : m + "");
            }
        });
      });
    });
    function g() {
      if (!o.router) {
        const p = `No router instance found.
You should only use "next/router" on the client side of your app.
`;
        throw new Error(p);
      }
      return o.router;
    }
    var f = o;
    e.default = f;
    function M() {
      return n.default.useContext(i.RouterContext);
    }
    function x(...p) {
      return o.router = new c.default(...p), o.readyCallbacks.forEach((y) => y()), o.readyCallbacks = [], o.router;
    }
    function z(p) {
      const y = p, H = {};
      for (const u of h) {
        if (typeof y[u] == "object") {
          H[u] = Object.assign(Array.isArray(y[u]) ? [] : {}, y[u]);
          continue;
        }
        H[u] = y[u];
      }
      return H.events = c.default.events, d.forEach((u) => {
        H[u] = (...m) => y[u](...m);
      }), H;
    }
    (typeof e.default == "function" || typeof e.default == "object" && e.default !== null) && typeof e.default.__esModule > "u" && (Object.defineProperty(e.default, "__esModule", { value: !0 }), Object.assign(e.default, e), t.exports = e.default);
  }(C0, C0.exports)), C0.exports;
}
(function(t) {
  t.exports = w4();
})(n3);
const i3 = [
  "blue",
  "teal",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "purple",
  "white"
], x4 = Wt(({ input: t }) => {
  const e = {
    blue: "bg-blue-500 border-blue-600",
    teal: "bg-teal-500 border-teal-600",
    green: "bg-green-500 border-green-600",
    yellow: "bg-yellow-500 border-yellow-600",
    orange: "bg-orange-500 border-orange-600",
    red: "bg-red-500 border-red-600",
    pink: "bg-pink-500 border-pink-600",
    purple: "bg-purple-500 border-purple-600",
    white: "bg-white border-gray-150"
  };
  return /* @__PURE__ */ T.createElement(T.Fragment, null, /* @__PURE__ */ T.createElement("input", {
    type: "text",
    id: t.name,
    className: "hidden",
    ...t
  }), /* @__PURE__ */ T.createElement("div", {
    className: "flex gap-2 flex-wrap"
  }, i3.map((r) => /* @__PURE__ */ T.createElement("button", {
    className: `w-9 h-9 rounded-full shadow border ${e[r]} ${t.value === r ? "ring-[3px] ring-offset-2 ring-blue-400" : ""}`,
    onClick: () => {
      t.onChange(r);
    }
  }))));
});
var V4 = {
  color: void 0,
  size: void 0,
  className: void 0,
  style: void 0,
  attr: void 0
}, It = R.createContext && R.createContext(V4), b1 = globalThis && globalThis.__assign || function() {
  return b1 = Object.assign || function(t) {
    for (var e, r = 1, n = arguments.length; r < n; r++) {
      e = arguments[r];
      for (var c in e)
        Object.prototype.hasOwnProperty.call(e, c) && (t[c] = e[c]);
    }
    return t;
  }, b1.apply(this, arguments);
}, l3 = globalThis && globalThis.__rest || function(t, e) {
  var r = {};
  for (var n in t)
    Object.prototype.hasOwnProperty.call(t, n) && e.indexOf(n) < 0 && (r[n] = t[n]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var c = 0, n = Object.getOwnPropertySymbols(t); c < n.length; c++)
      e.indexOf(n[c]) < 0 && Object.prototype.propertyIsEnumerable.call(t, n[c]) && (r[n[c]] = t[n[c]]);
  return r;
};
function y4(t) {
  return t && t.map(function(e, r) {
    return R.createElement(e.tag, b1({
      key: r
    }, e.attr), y4(e.child));
  });
}
function a(t) {
  return function(e) {
    return R.createElement(o3, b1({
      attr: b1({}, t.attr)
    }, e), y4(t.child));
  };
}
function o3(t) {
  var e = function(r) {
    var n = t.attr, c = t.size, i = t.title, l = l3(t, ["attr", "size", "title"]), s = c || r.size || "1em", o;
    return r.className && (o = r.className), t.className && (o = (o ? o + " " : "") + t.className), R.createElement("svg", b1({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, r.attr, n, l, {
      className: o,
      style: b1(b1({
        color: t.color || r.color
      }, r.style), t.style),
      height: s,
      width: s,
      xmlns: "http://www.w3.org/2000/svg"
    }), i && R.createElement("title", null, i), t.children);
  };
  return It !== void 0 ? R.createElement(It.Consumer, null, function(r) {
    return e(r);
  }) : e(V4);
}
function h3(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 14 16" }, child: [{ tag: "path", attr: { fillRule: "evenodd", d: "M7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 1.3c1.3 0 2.5.44 3.47 1.17l-8 8A5.755 5.755 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zm0 11.41c-1.3 0-2.5-.44-3.47-1.17l8-8c.73.97 1.17 2.17 1.17 3.47 0 3.14-2.56 5.7-5.7 5.7z" } }] })(t);
}
let q1 = typeof window < "u" ? U4 : Q;
function P1(t) {
  let e = a1(t);
  return q1(() => {
    e.current = t;
  }, [t]), e;
}
function G0() {
  let t = [], e = [], r = { enqueue(n) {
    e.push(n);
  }, addEventListener(n, c, i, l) {
    return n.addEventListener(c, i, l), r.add(() => n.removeEventListener(c, i, l));
  }, requestAnimationFrame(...n) {
    let c = requestAnimationFrame(...n);
    return r.add(() => cancelAnimationFrame(c));
  }, nextFrame(...n) {
    return r.requestAnimationFrame(() => r.requestAnimationFrame(...n));
  }, setTimeout(...n) {
    let c = setTimeout(...n);
    return r.add(() => clearTimeout(c));
  }, add(n) {
    return t.push(n), () => {
      let c = t.indexOf(n);
      if (c >= 0) {
        let [i] = t.splice(c, 1);
        i();
      }
    };
  }, dispose() {
    for (let n of t.splice(0))
      n();
  }, async workQueue() {
    for (let n of e.splice(0))
      await n();
  } };
  return r;
}
function s3() {
  let [t] = F1(G0);
  return Q(() => () => t.dispose(), [t]), t;
}
let Y = function(t) {
  let e = P1(t);
  return R.useCallback((...r) => e.current(...r), [e]);
}, c2 = { serverHandoffComplete: !1 };
function et() {
  let [t, e] = F1(c2.serverHandoffComplete);
  return Q(() => {
    t !== !0 && e(!0);
  }, [t]), Q(() => {
    c2.serverHandoffComplete === !1 && (c2.serverHandoffComplete = !0);
  }, []), t;
}
var Dt;
let v3 = 0;
function kt() {
  return ++v3;
}
let W1 = (Dt = R.useId) != null ? Dt : function() {
  let t = et(), [e, r] = R.useState(t ? kt : null);
  return q1(() => {
    e === null && r(kt());
  }, [e]), e != null ? "" + e : void 0;
};
function J(t, e, ...r) {
  if (t in e) {
    let c = e[t];
    return typeof c == "function" ? c(...r) : c;
  }
  let n = new Error(`Tried to handle "${t}" but there is no handler defined. Only defined handlers are: ${Object.keys(e).map((c) => `"${c}"`).join(", ")}.`);
  throw Error.captureStackTrace && Error.captureStackTrace(n, J), n;
}
function at(t) {
  return typeof window > "u" ? null : t instanceof Node ? t.ownerDocument : t != null && t.hasOwnProperty("current") && t.current instanceof Node ? t.current.ownerDocument : document;
}
let C2 = ["[contentEditable=true]", "[tabindex]", "a[href]", "area[href]", "button:not([disabled])", "iframe", "input:not([disabled])", "select:not([disabled])", "textarea:not([disabled])"].map((t) => `${t}:not([tabindex='-1'])`).join(",");
var k1 = ((t) => (t[t.First = 1] = "First", t[t.Previous = 2] = "Previous", t[t.Next = 4] = "Next", t[t.Last = 8] = "Last", t[t.WrapAround = 16] = "WrapAround", t[t.NoScroll = 32] = "NoScroll", t))(k1 || {}), u3 = ((t) => (t[t.Error = 0] = "Error", t[t.Overflow = 1] = "Overflow", t[t.Success = 2] = "Success", t[t.Underflow = 3] = "Underflow", t))(u3 || {}), d3 = ((t) => (t[t.Previous = -1] = "Previous", t[t.Next = 1] = "Next", t))(d3 || {});
function C4(t = document.body) {
  return t == null ? [] : Array.from(t.querySelectorAll(C2));
}
var rt = ((t) => (t[t.Strict = 0] = "Strict", t[t.Loose = 1] = "Loose", t))(rt || {});
function L4(t, e = 0) {
  var r;
  return t === ((r = at(t)) == null ? void 0 : r.body) ? !1 : J(e, { [0]() {
    return t.matches(C2);
  }, [1]() {
    let n = t;
    for (; n !== null; ) {
      if (n.matches(C2))
        return !0;
      n = n.parentElement;
    }
    return !1;
  } });
}
let g3 = ["textarea", "input"].join(",");
function f3(t) {
  var e, r;
  return (r = (e = t == null ? void 0 : t.matches) == null ? void 0 : e.call(t, g3)) != null ? r : !1;
}
function p3(t, e = (r) => r) {
  return t.slice().sort((r, n) => {
    let c = e(r), i = e(n);
    if (c === null || i === null)
      return 0;
    let l = c.compareDocumentPosition(i);
    return l & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : l & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
  });
}
function t0(t, e, r = !0) {
  let n = Array.isArray(t) ? t.length > 0 ? t[0].ownerDocument : document : t.ownerDocument, c = Array.isArray(t) ? r ? p3(t) : t : C4(t), i = n.activeElement, l = (() => {
    if (e & 5)
      return 1;
    if (e & 10)
      return -1;
    throw new Error("Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last");
  })(), s = (() => {
    if (e & 1)
      return 0;
    if (e & 2)
      return Math.max(0, c.indexOf(i)) - 1;
    if (e & 4)
      return Math.max(0, c.indexOf(i)) + 1;
    if (e & 8)
      return c.length - 1;
    throw new Error("Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last");
  })(), o = e & 32 ? { preventScroll: !0 } : {}, h = 0, v = c.length, d;
  do {
    if (h >= v || h + v <= 0)
      return 0;
    let g = s + h;
    if (e & 16)
      g = (g + v) % v;
    else {
      if (g < 0)
        return 3;
      if (g >= v)
        return 1;
    }
    d = c[g], d == null || d.focus(o), h += l;
  } while (d !== n.activeElement);
  return e & 6 && f3(d) && d.select(), d.hasAttribute("tabindex") || d.setAttribute("tabindex", "0"), 2;
}
function L2(t, e, r) {
  let n = P1(e);
  Q(() => {
    function c(i) {
      n.current(i);
    }
    return window.addEventListener(t, c, r), () => window.removeEventListener(t, c, r);
  }, [t, r]);
}
function z3(t, e, r = !0) {
  let n = a1(!1);
  Q(() => {
    requestAnimationFrame(() => {
      n.current = r;
    });
  }, [r]);
  function c(i, l) {
    if (!n.current || i.defaultPrevented)
      return;
    let s = function h(v) {
      return typeof v == "function" ? h(v()) : Array.isArray(v) || v instanceof Set ? v : [v];
    }(t), o = l(i);
    if (o !== null && !!o.ownerDocument.documentElement.contains(o)) {
      for (let h of s) {
        if (h === null)
          continue;
        let v = h instanceof HTMLElement ? h : h.current;
        if (v != null && v.contains(o))
          return;
      }
      return !L4(o, rt.Loose) && o.tabIndex !== -1 && i.preventDefault(), e(i, o);
    }
  }
  L2("click", (i) => c(i, (l) => l.target), !0), L2("blur", (i) => c(i, () => window.document.activeElement instanceof HTMLIFrameElement ? window.document.activeElement : null), !0);
}
function jt(t) {
  var e;
  if (t.type)
    return t.type;
  let r = (e = t.as) != null ? e : "button";
  if (typeof r == "string" && r.toLowerCase() === "button")
    return "button";
}
function m3(t, e) {
  let [r, n] = F1(() => jt(t));
  return q1(() => {
    n(jt(t));
  }, [t.type, t.as]), q1(() => {
    r || !e.current || e.current instanceof HTMLButtonElement && !e.current.hasAttribute("type") && n("button");
  }, [r, e]), r;
}
let _4 = Symbol();
function M3(t, e = !0) {
  return Object.assign(t, { [_4]: e });
}
function S1(...t) {
  let e = a1(t);
  Q(() => {
    e.current = t;
  }, [t]);
  let r = Y((n) => {
    for (let c of e.current)
      c != null && (typeof c == "function" ? c(n) : c.current = n);
  });
  return t.every((n) => n == null || (n == null ? void 0 : n[_4])) ? void 0 : r;
}
var r0 = ((t) => (t[t.None = 0] = "None", t[t.RenderStrategy = 1] = "RenderStrategy", t[t.Static = 2] = "Static", t))(r0 || {}), z1 = ((t) => (t[t.Unmount = 0] = "Unmount", t[t.Hidden = 1] = "Hidden", t))(z1 || {});
function N1({ ourProps: t, theirProps: e, slot: r, defaultTag: n, features: c, visible: i = !0, name: l }) {
  let s = A4(e, t);
  if (i)
    return _0(s, r, n, l);
  let o = c != null ? c : 0;
  if (o & 2) {
    let { static: h = !1, ...v } = s;
    if (h)
      return _0(v, r, n, l);
  }
  if (o & 1) {
    let { unmount: h = !0, ...v } = s;
    return J(h ? 0 : 1, { [0]() {
      return null;
    }, [1]() {
      return _0({ ...v, hidden: !0, style: { display: "none" } }, r, n, l);
    } });
  }
  return _0(s, r, n, l);
}
function _0(t, e = {}, r, n) {
  let { as: c = r, children: i, refName: l = "ref", ...s } = i2(t, ["unmount", "static"]), o = t.ref !== void 0 ? { [l]: t.ref } : {}, h = typeof i == "function" ? i(e) : i;
  s.className && typeof s.className == "function" && (s.className = s.className(e));
  let v = {};
  if (c === s0 && Object.keys(Ut(s)).length > 0) {
    if (!q4(h) || Array.isArray(h) && h.length > 1)
      throw new Error(['Passing props on "Fragment"!', "", `The current component <${n} /> is rendering a "Fragment".`, "However we need to passthrough the following props:", Object.keys(s).map((d) => `  - ${d}`).join(`
`), "", "You can apply a few solutions:", ['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".', "Render a single element as the child so that we can forward the props onto that element."].map((d) => `  - ${d}`).join(`
`)].join(`
`));
    return W4(h, Object.assign({}, A4(h.props, Ut(i2(s, ["ref"]))), v, o));
  }
  return G4(c, Object.assign({}, i2(s, ["ref"]), c !== s0 && o, c !== s0 && v), h);
}
function A4(...t) {
  if (t.length === 0)
    return {};
  if (t.length === 1)
    return t[0];
  let e = {}, r = {};
  for (let n of t)
    for (let c in n)
      c.startsWith("on") && typeof n[c] == "function" ? (r[c] != null || (r[c] = []), r[c].push(n[c])) : e[c] = n[c];
  if (e.disabled || e["aria-disabled"])
    return Object.assign(e, Object.fromEntries(Object.keys(r).map((n) => [n, void 0])));
  for (let n in r)
    Object.assign(e, { [n](c, ...i) {
      let l = r[n];
      for (let s of l) {
        if (c.defaultPrevented)
          return;
        s(c, ...i);
      }
    } });
  return e;
}
function B1(t) {
  var e;
  return Object.assign(F4(t), { displayName: (e = t.displayName) != null ? e : t.name });
}
function Ut(t) {
  let e = Object.assign({}, t);
  for (let r in e)
    e[r] === void 0 && delete e[r];
  return e;
}
function i2(t, e = []) {
  let r = Object.assign({}, t);
  for (let n of e)
    n in r && delete r[n];
  return r;
}
function b4(t) {
  let e = t.parentElement, r = null;
  for (; e && !(e instanceof HTMLFieldSetElement); )
    e instanceof HTMLLegendElement && (r = e), e = e.parentElement;
  let n = (e == null ? void 0 : e.getAttribute("disabled")) === "";
  return n && B3(r) ? !1 : n;
}
function B3(t) {
  if (!t)
    return !1;
  let e = t.previousElementSibling;
  for (; e !== null; ) {
    if (e instanceof HTMLLegendElement)
      return !1;
    e = e.previousElementSibling;
  }
  return !0;
}
let H3 = "div";
var I0 = ((t) => (t[t.None = 1] = "None", t[t.Focusable = 2] = "Focusable", t[t.Hidden = 4] = "Hidden", t))(I0 || {});
let _2 = B1(function(t, e) {
  let { features: r = 1, ...n } = t, c = { ref: e, "aria-hidden": (r & 2) === 2 ? !0 : void 0, style: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0", ...(r & 4) === 4 && (r & 2) !== 2 && { display: "none" } } };
  return N1({ ourProps: c, theirProps: n, slot: {}, defaultTag: H3, name: "Hidden" });
}), nt = G1(null);
nt.displayName = "OpenClosedContext";
var m1 = ((t) => (t[t.Open = 0] = "Open", t[t.Closed = 1] = "Closed", t))(m1 || {});
function X0() {
  return E1(nt);
}
function P4({ value: t, children: e }) {
  return R.createElement(nt.Provider, { value: t }, e);
}
var y1 = ((t) => (t.Space = " ", t.Enter = "Enter", t.Escape = "Escape", t.Backspace = "Backspace", t.Delete = "Delete", t.ArrowLeft = "ArrowLeft", t.ArrowUp = "ArrowUp", t.ArrowRight = "ArrowRight", t.ArrowDown = "ArrowDown", t.Home = "Home", t.End = "End", t.PageUp = "PageUp", t.PageDown = "PageDown", t.Tab = "Tab", t))(y1 || {}), j1 = ((t) => (t[t.Forwards = 0] = "Forwards", t[t.Backwards = 1] = "Backwards", t))(j1 || {});
function S4() {
  let t = a1(0);
  return L2("keydown", (e) => {
    e.key === "Tab" && (t.current = e.shiftKey ? 1 : 0);
  }, !0), t;
}
function E4() {
  let t = a1(!1);
  return q1(() => (t.current = !0, () => {
    t.current = !1;
  }), []), t;
}
function ct(...t) {
  return i1(() => at(...t), [...t]);
}
function w3(t, e, r, n) {
  let c = P1(r);
  Q(() => {
    t = t != null ? t : window;
    function i(l) {
      c.current(l);
    }
    return t.addEventListener(e, i, n), () => t.removeEventListener(e, i, n);
  }, [t, e, n]);
}
function x3(t) {
  typeof queueMicrotask == "function" ? queueMicrotask(t) : Promise.resolve().then(t).catch((e) => setTimeout(() => {
    throw e;
  }));
}
var V3 = ((t) => (t[t.Open = 0] = "Open", t[t.Closed = 1] = "Closed", t))(V3 || {}), y3 = ((t) => (t[t.TogglePopover = 0] = "TogglePopover", t[t.ClosePopover = 1] = "ClosePopover", t[t.SetButton = 2] = "SetButton", t[t.SetButtonId = 3] = "SetButtonId", t[t.SetPanel = 4] = "SetPanel", t[t.SetPanelId = 5] = "SetPanelId", t))(y3 || {});
let C3 = { [0]: (t) => ({ ...t, popoverState: J(t.popoverState, { [0]: 1, [1]: 0 }) }), [1](t) {
  return t.popoverState === 1 ? t : { ...t, popoverState: 1 };
}, [2](t, e) {
  return t.button === e.button ? t : { ...t, button: e.button };
}, [3](t, e) {
  return t.buttonId === e.buttonId ? t : { ...t, buttonId: e.buttonId };
}, [4](t, e) {
  return t.panel === e.panel ? t : { ...t, panel: e.panel };
}, [5](t, e) {
  return t.panelId === e.panelId ? t : { ...t, panelId: e.panelId };
} }, it = G1(null);
it.displayName = "PopoverContext";
function K0(t) {
  let e = E1(it);
  if (e === null) {
    let r = new Error(`<${t} /> is missing a parent <Popover /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(r, K0), r;
  }
  return e;
}
let lt = G1(null);
lt.displayName = "PopoverAPIContext";
function ot(t) {
  let e = E1(lt);
  if (e === null) {
    let r = new Error(`<${t} /> is missing a parent <Popover /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(r, ot), r;
  }
  return e;
}
let ht = G1(null);
ht.displayName = "PopoverGroupContext";
function R4() {
  return E1(ht);
}
let st = G1(null);
st.displayName = "PopoverPanelContext";
function L3() {
  return E1(st);
}
function _3(t, e) {
  return J(e.type, C3, t, e);
}
let A3 = "div", b3 = B1(function(t, e) {
  var r;
  let n = `headlessui-popover-button-${W1()}`, c = `headlessui-popover-panel-${W1()}`, i = a1(null), l = S1(e, M3((V) => {
    i.current = V;
  })), s = X4(_3, { popoverState: 1, button: null, buttonId: n, panel: null, panelId: c, beforePanelSentinel: dt(), afterPanelSentinel: dt() }), [{ popoverState: o, button: h, panel: v, beforePanelSentinel: d, afterPanelSentinel: g }, f] = s, M = ct((r = i.current) != null ? r : h);
  Q(() => f({ type: 3, buttonId: n }), [n, f]), Q(() => f({ type: 5, panelId: c }), [c, f]);
  let x = i1(() => {
    if (!h || !v)
      return !1;
    for (let V of document.querySelectorAll("body > *"))
      if (Number(V == null ? void 0 : V.contains(h)) ^ Number(V == null ? void 0 : V.contains(v)))
        return !0;
    return !1;
  }, [h, v]), z = i1(() => ({ buttonId: n, panelId: c, close: () => f({ type: 1 }) }), [n, c, f]), p = R4(), y = p == null ? void 0 : p.registerPopover, H = Y(() => {
    var V;
    return (V = p == null ? void 0 : p.isFocusWithinPopoverGroup()) != null ? V : (M == null ? void 0 : M.activeElement) && ((h == null ? void 0 : h.contains(M.activeElement)) || (v == null ? void 0 : v.contains(M.activeElement)));
  });
  Q(() => y == null ? void 0 : y(z), [y, z]), w3(M == null ? void 0 : M.defaultView, "focus", (V) => {
    var _, L, S, B;
    o === 0 && (H() || !h || !v || (L = (_ = d.current) == null ? void 0 : _.contains) != null && L.call(_, V.target) || (B = (S = g.current) == null ? void 0 : S.contains) != null && B.call(S, V.target) || f({ type: 1 }));
  }, !0), z3([h, v], (V, _) => {
    f({ type: 1 }), L4(_, rt.Loose) || (V.preventDefault(), h == null || h.focus());
  }, o === 0);
  let u = Y((V) => {
    f({ type: 1 });
    let _ = (() => V ? V instanceof HTMLElement ? V : V.current instanceof HTMLElement ? V.current : h : h)();
    _ == null || _.focus();
  }), m = i1(() => ({ close: u, isPortalled: x }), [u, x]), w = i1(() => ({ open: o === 0, close: u }), [o, u]), C = t, A = { ref: l };
  return R.createElement(it.Provider, { value: s }, R.createElement(lt.Provider, { value: m }, R.createElement(P4, { value: J(o, { [0]: m1.Open, [1]: m1.Closed }) }, N1({ ourProps: A, theirProps: C, slot: w, defaultTag: A3, name: "Popover" }))));
}), P3 = "button", S3 = B1(function(t, e) {
  let [r, n] = K0("Popover.Button"), { isPortalled: c } = ot("Popover.Button"), i = a1(null), l = `headlessui-focus-sentinel-${W1()}`, s = R4(), o = s == null ? void 0 : s.closeOthers, h = L3(), v = h === null ? !1 : h === r.panelId, d = S1(i, e, v ? null : (V) => n({ type: 2, button: V })), g = S1(i, e), f = ct(i), M = Y((V) => {
    var _, L, S;
    if (v) {
      if (r.popoverState === 1)
        return;
      switch (V.key) {
        case y1.Space:
        case y1.Enter:
          V.preventDefault(), (L = (_ = V.target).click) == null || L.call(_), n({ type: 1 }), (S = r.button) == null || S.focus();
          break;
      }
    } else
      switch (V.key) {
        case y1.Space:
        case y1.Enter:
          V.preventDefault(), V.stopPropagation(), r.popoverState === 1 && (o == null || o(r.buttonId)), n({ type: 0 });
          break;
        case y1.Escape:
          if (r.popoverState !== 0)
            return o == null ? void 0 : o(r.buttonId);
          if (!i.current || (f == null ? void 0 : f.activeElement) && !i.current.contains(f.activeElement))
            return;
          V.preventDefault(), V.stopPropagation(), n({ type: 1 });
          break;
      }
  }), x = Y((V) => {
    v || V.key === y1.Space && V.preventDefault();
  }), z = Y((V) => {
    var _, L;
    b4(V.currentTarget) || t.disabled || (v ? (n({ type: 1 }), (_ = r.button) == null || _.focus()) : (V.preventDefault(), V.stopPropagation(), r.popoverState === 1 && (o == null || o(r.buttonId)), n({ type: 0 }), (L = r.button) == null || L.focus()));
  }), p = Y((V) => {
    V.preventDefault(), V.stopPropagation();
  }), y = r.popoverState === 0, H = i1(() => ({ open: y }), [y]), u = m3(t, i), m = t, w = v ? { ref: g, type: u, onKeyDown: M, onClick: z } : { ref: d, id: r.buttonId, type: u, "aria-expanded": t.disabled ? void 0 : r.popoverState === 0, "aria-controls": r.panel ? r.panelId : void 0, onKeyDown: M, onKeyUp: x, onClick: z, onMouseDown: p }, C = S4(), A = Y(() => {
    let V = r.panel;
    if (!V)
      return;
    function _() {
      J(C.current, { [j1.Forwards]: () => t0(V, k1.First), [j1.Backwards]: () => t0(V, k1.Last) });
    }
    _();
  });
  return R.createElement(R.Fragment, null, N1({ ourProps: w, theirProps: m, slot: H, defaultTag: P3, name: "Popover.Button" }), y && !v && c && R.createElement(_2, { id: l, features: I0.Focusable, as: "button", type: "button", onFocus: A }));
}), E3 = "div", R3 = r0.RenderStrategy | r0.Static, T3 = B1(function(t, e) {
  let [{ popoverState: r }, n] = K0("Popover.Overlay"), c = S1(e), i = `headlessui-popover-overlay-${W1()}`, l = X0(), s = (() => l !== null ? l === m1.Open : r === 0)(), o = Y((v) => {
    if (b4(v.currentTarget))
      return v.preventDefault();
    n({ type: 1 });
  }), h = i1(() => ({ open: r === 0 }), [r]);
  return N1({ ourProps: { ref: c, id: i, "aria-hidden": !0, onClick: o }, theirProps: t, slot: h, defaultTag: E3, features: R3, visible: s, name: "Popover.Overlay" });
}), O3 = "div", N3 = r0.RenderStrategy | r0.Static, $3 = B1(function(t, e) {
  let { focus: r = !1, ...n } = t, [c, i] = K0("Popover.Panel"), { close: l, isPortalled: s } = ot("Popover.Panel"), o = `headlessui-focus-sentinel-before-${W1()}`, h = `headlessui-focus-sentinel-after-${W1()}`, v = a1(null), d = S1(v, e, (m) => {
    i({ type: 4, panel: m });
  }), g = ct(v), f = X0(), M = (() => f !== null ? f === m1.Open : c.popoverState === 0)(), x = Y((m) => {
    var w;
    switch (m.key) {
      case y1.Escape:
        if (c.popoverState !== 0 || !v.current || (g == null ? void 0 : g.activeElement) && !v.current.contains(g.activeElement))
          return;
        m.preventDefault(), m.stopPropagation(), i({ type: 1 }), (w = c.button) == null || w.focus();
        break;
    }
  });
  Q(() => {
    var m;
    t.static || c.popoverState === 1 && ((m = t.unmount) != null ? m : !0) && i({ type: 4, panel: null });
  }, [c.popoverState, t.unmount, t.static, i]), Q(() => {
    if (!r || c.popoverState !== 0 || !v.current)
      return;
    let m = g == null ? void 0 : g.activeElement;
    v.current.contains(m) || t0(v.current, k1.First);
  }, [r, v, c.popoverState]);
  let z = i1(() => ({ open: c.popoverState === 0, close: l }), [c, l]), p = { ref: d, id: c.panelId, onKeyDown: x, onBlur: r && c.popoverState === 0 ? (m) => {
    var w, C, A, V, _;
    let L = m.relatedTarget;
    !L || !v.current || (w = v.current) != null && w.contains(L) || (i({ type: 1 }), (((A = (C = c.beforePanelSentinel.current) == null ? void 0 : C.contains) == null ? void 0 : A.call(C, L)) || ((_ = (V = c.afterPanelSentinel.current) == null ? void 0 : V.contains) == null ? void 0 : _.call(V, L))) && L.focus({ preventScroll: !0 }));
  } : void 0, tabIndex: -1 }, y = S4(), H = Y(() => {
    let m = v.current;
    if (!m)
      return;
    function w() {
      J(y.current, { [j1.Forwards]: () => {
        t0(m, k1.First);
      }, [j1.Backwards]: () => {
        var C;
        (C = c.button) == null || C.focus({ preventScroll: !0 });
      } });
    }
    w();
  }), u = Y(() => {
    let m = v.current;
    if (!m)
      return;
    function w() {
      J(y.current, { [j1.Forwards]: () => {
        var C, A, V;
        if (!c.button)
          return;
        let _ = C4(), L = _.indexOf(c.button), S = _.slice(0, L + 1), B = [..._.slice(L + 1), ...S];
        for (let E of B.slice())
          if (((A = (C = E == null ? void 0 : E.id) == null ? void 0 : C.startsWith) == null ? void 0 : A.call(C, "headlessui-focus-sentinel-")) || ((V = c.panel) == null ? void 0 : V.contains(E))) {
            let N = B.indexOf(E);
            N !== -1 && B.splice(N, 1);
          }
        t0(B, k1.First, !1);
      }, [j1.Backwards]: () => t0(m, k1.Last) });
    }
    w();
  });
  return R.createElement(st.Provider, { value: c.panelId }, M && s && R.createElement(_2, { id: o, ref: c.beforePanelSentinel, features: I0.Focusable, as: "button", type: "button", onFocus: H }), N1({ ourProps: p, theirProps: n, slot: z, defaultTag: O3, features: N3, visible: M, name: "Popover.Panel" }), M && s && R.createElement(_2, { id: h, ref: c.afterPanelSentinel, features: I0.Focusable, as: "button", type: "button", onFocus: u }));
}), I3 = "div", D3 = B1(function(t, e) {
  let r = a1(null), n = S1(r, e), [c, i] = F1([]), l = Y((M) => {
    i((x) => {
      let z = x.indexOf(M);
      if (z !== -1) {
        let p = x.slice();
        return p.splice(z, 1), p;
      }
      return x;
    });
  }), s = Y((M) => (i((x) => [...x, M]), () => l(M))), o = Y(() => {
    var M;
    let x = at(r);
    if (!x)
      return !1;
    let z = x.activeElement;
    return (M = r.current) != null && M.contains(z) ? !0 : c.some((p) => {
      var y, H;
      return ((y = x.getElementById(p.buttonId)) == null ? void 0 : y.contains(z)) || ((H = x.getElementById(p.panelId)) == null ? void 0 : H.contains(z));
    });
  }), h = Y((M) => {
    for (let x of c)
      x.buttonId !== M && x.close();
  }), v = i1(() => ({ registerPopover: s, unregisterPopover: l, isFocusWithinPopoverGroup: o, closeOthers: h }), [s, l, o, h]), d = i1(() => ({}), []), g = t, f = { ref: n };
  return R.createElement(ht.Provider, { value: v }, N1({ ourProps: f, theirProps: g, slot: d, defaultTag: I3, name: "Popover.Group" }));
}), l2 = Object.assign(b3, { Button: S3, Overlay: T3, Panel: $3, Group: D3 });
function k3(t) {
  let e = { called: !1 };
  return (...r) => {
    if (!e.called)
      return e.called = !0, t(...r);
  };
}
function o2(t, ...e) {
  t && e.length > 0 && t.classList.add(...e);
}
function h2(t, ...e) {
  t && e.length > 0 && t.classList.remove(...e);
}
var A2 = ((t) => (t.Ended = "ended", t.Cancelled = "cancelled", t))(A2 || {});
function j3(t, e) {
  let r = G0();
  if (!t)
    return r.dispose;
  let { transitionDuration: n, transitionDelay: c } = getComputedStyle(t), [i, l] = [n, c].map((s) => {
    let [o = 0] = s.split(",").filter(Boolean).map((h) => h.includes("ms") ? parseFloat(h) : parseFloat(h) * 1e3).sort((h, v) => v - h);
    return o;
  });
  if (i + l !== 0) {
    let s = [];
    s.push(r.addEventListener(t, "transitionrun", (o) => {
      o.target === o.currentTarget && (s.splice(0).forEach((h) => h()), s.push(r.addEventListener(t, "transitionend", (h) => {
        h.target === h.currentTarget && (e("ended"), s.splice(0).forEach((v) => v()));
      }), r.addEventListener(t, "transitioncancel", (h) => {
        h.target === h.currentTarget && (e("cancelled"), s.splice(0).forEach((v) => v()));
      })));
    }));
  } else
    e("ended");
  return r.add(() => e("cancelled")), r.dispose;
}
function U3(t, e, r, n) {
  let c = r ? "enter" : "leave", i = G0(), l = n !== void 0 ? k3(n) : () => {
  }, s = J(c, { enter: () => e.enter, leave: () => e.leave }), o = J(c, { enter: () => e.enterTo, leave: () => e.leaveTo }), h = J(c, { enter: () => e.enterFrom, leave: () => e.leaveFrom });
  return h2(t, ...e.enter, ...e.enterTo, ...e.enterFrom, ...e.leave, ...e.leaveFrom, ...e.leaveTo, ...e.entered), o2(t, ...s, ...h), i.nextFrame(() => {
    h2(t, ...h), o2(t, ...o), j3(t, (v) => (v === "ended" && (h2(t, ...s), o2(t, ...e.entered)), l(v)));
  }), i.dispose;
}
function F3({ container: t, direction: e, classes: r, events: n, onStart: c, onStop: i }) {
  let l = E4(), s = s3(), o = P1(e), h = Y(() => J(o.current, { enter: () => n.current.beforeEnter(), leave: () => n.current.beforeLeave(), idle: () => {
  } })), v = Y(() => J(o.current, { enter: () => n.current.afterEnter(), leave: () => n.current.afterLeave(), idle: () => {
  } }));
  q1(() => {
    let d = G0();
    s.add(d.dispose);
    let g = t.current;
    if (!!g && o.current !== "idle" && !!l.current)
      return d.dispose(), h(), c.current(o.current), d.add(U3(g, r.current, o.current === "enter", (f) => {
        d.dispose(), J(f, { [A2.Ended]() {
          v(), i.current(o.current);
        }, [A2.Cancelled]: () => {
        } });
      })), d.dispose;
  }, [e]);
}
function I1(t = "") {
  return t.split(" ").filter((e) => e.trim().length > 1);
}
let Y0 = G1(null);
Y0.displayName = "TransitionContext";
var q3 = ((t) => (t.Visible = "visible", t.Hidden = "hidden", t))(q3 || {});
function W3() {
  let t = E1(Y0);
  if (t === null)
    throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");
  return t;
}
function G3() {
  let t = E1(Q0);
  if (t === null)
    throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");
  return t;
}
let Q0 = G1(null);
Q0.displayName = "NestingContext";
function J0(t) {
  return "children" in t ? J0(t.children) : t.current.filter(({ state: e }) => e === "visible").length > 0;
}
function T4(t) {
  let e = P1(t), r = a1([]), n = E4(), c = Y((l, s = z1.Hidden) => {
    let o = r.current.findIndex(({ id: h }) => h === l);
    o !== -1 && (J(s, { [z1.Unmount]() {
      r.current.splice(o, 1);
    }, [z1.Hidden]() {
      r.current[o].state = "hidden";
    } }), x3(() => {
      var h;
      !J0(r) && n.current && ((h = e.current) == null || h.call(e));
    }));
  }), i = Y((l) => {
    let s = r.current.find(({ id: o }) => o === l);
    return s ? s.state !== "visible" && (s.state = "visible") : r.current.push({ id: l, state: "visible" }), () => c(l, z1.Unmount);
  });
  return i1(() => ({ children: r, register: i, unregister: c }), [i, c, r]);
}
function X3() {
}
let K3 = ["beforeEnter", "afterEnter", "beforeLeave", "afterLeave"];
function Ft(t) {
  var e;
  let r = {};
  for (let n of K3)
    r[n] = (e = t[n]) != null ? e : X3;
  return r;
}
function Y3(t) {
  let e = a1(Ft(t));
  return Q(() => {
    e.current = Ft(t);
  }, [t]), e;
}
let Q3 = "div", O4 = r0.RenderStrategy, N4 = B1(function(t, e) {
  let { beforeEnter: r, afterEnter: n, beforeLeave: c, afterLeave: i, enter: l, enterFrom: s, enterTo: o, entered: h, leave: v, leaveFrom: d, leaveTo: g, ...f } = t, M = a1(null), x = S1(M, e), [z, p] = F1("visible"), y = f.unmount ? z1.Unmount : z1.Hidden, { show: H, appear: u, initial: m } = W3(), { register: w, unregister: C } = G3(), A = a1(null), V = W1();
  Q(() => {
    if (V)
      return w(V);
  }, [w, V]), Q(() => {
    if (y === z1.Hidden && !!V) {
      if (H && z !== "visible") {
        p("visible");
        return;
      }
      J(z, { hidden: () => C(V), visible: () => w(V) });
    }
  }, [z, V, w, C, H, y]);
  let _ = P1({ enter: I1(l), enterFrom: I1(s), enterTo: I1(o), entered: I1(h), leave: I1(v), leaveFrom: I1(d), leaveTo: I1(g) }), L = Y3({ beforeEnter: r, afterEnter: n, beforeLeave: c, afterLeave: i }), S = et();
  Q(() => {
    if (S && z === "visible" && M.current === null)
      throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?");
  }, [M, z, S]);
  let B = m && !u, E = (() => !S || B || A.current === H ? "idle" : H ? "enter" : "leave")(), N = a1(!1), b = T4(() => {
    N.current || (p("hidden"), C(V));
  });
  F3({ container: M, classes: _, events: L, direction: E, onStart: P1(() => {
    N.current = !0;
  }), onStop: P1((X) => {
    N.current = !1, X === "leave" && !J0(b) && (p("hidden"), C(V));
  }) }), Q(() => {
    !B || (y === z1.Hidden ? A.current = null : A.current = H);
  }, [H, B, z]);
  let $ = f, j = { ref: x };
  return R.createElement(Q0.Provider, { value: b }, R.createElement(P4, { value: J(z, { visible: m1.Open, hidden: m1.Closed }) }, N1({ ourProps: j, theirProps: $, defaultTag: Q3, features: O4, visible: z === "visible", name: "Transition.Child" })));
}), b2 = B1(function(t, e) {
  let { show: r, appear: n = !1, unmount: c, ...i } = t, l = a1(null), s = S1(l, e);
  et();
  let o = X0();
  if (r === void 0 && o !== null && (r = J(o, { [m1.Open]: !0, [m1.Closed]: !1 })), ![!0, !1].includes(r))
    throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");
  let [h, v] = F1(r ? "visible" : "hidden"), d = T4(() => {
    v("hidden");
  }), [g, f] = F1(!0), M = a1([r]);
  q1(() => {
    g !== !1 && M.current[M.current.length - 1] !== r && (M.current.push(r), f(!1));
  }, [M, r]);
  let x = i1(() => ({ show: r, appear: n, initial: g }), [r, n, g]);
  Q(() => {
    if (r)
      v("visible");
    else if (!J0(d))
      v("hidden");
    else {
      let p = l.current;
      if (!p)
        return;
      let y = p.getBoundingClientRect();
      y.x === 0 && y.y === 0 && y.width === 0 && y.height === 0 && v("hidden");
    }
  }, [r, d]);
  let z = { unmount: c };
  return R.createElement(Q0.Provider, { value: d }, R.createElement(Y0.Provider, { value: x }, N1({ ourProps: { ...z, as: s0, children: R.createElement(N4, { ref: s, ...z, ...i }) }, theirProps: {}, defaultTag: s0, features: O4, visible: h === "visible", name: "Transition" })));
}), J3 = B1(function(t, e) {
  let r = E1(Y0) !== null, n = X0() !== null;
  return R.createElement(R.Fragment, null, !r && n ? R.createElement(b2, { ref: e, ...t }) : R.createElement(N4, { ref: e, ...t }));
}), Z3 = Object.assign(b2, { Child: J3, Root: b2 });
function t9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M2 3h2v18H2zm18 0h2v18h-2zM5 13h2v1h2v-1h2v1h2v-1h4v1h2v-4h-2v1h-4v-1h-2v1H9v-1H7v1H5zm0-9v4h2V7h8v1h2V7h2V5h-2V4h-2v1H7V4zm0 13v3h2v-1h2v1h2v-1h8v-2h-8v-1H9v1H7v-1H5z" } }] })(t);
}
function e9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "18", cy: "4", r: "2" } }, { tag: "path", attr: { d: "m17.836 12.014-4.345.725 3.29-4.113a1 1 0 0 0-.227-1.457l-6-4a.999.999 0 0 0-1.262.125l-4 4 1.414 1.414 3.42-3.42 2.584 1.723-2.681 3.352a5.913 5.913 0 0 0-5.5.752l1.451 1.451A3.972 3.972 0 0 1 8 12c2.206 0 4 1.794 4 4 0 .739-.216 1.425-.566 2.02l1.451 1.451A5.961 5.961 0 0 0 14 16c0-.445-.053-.878-.145-1.295L17 14.181V20h2v-7a.998.998 0 0 0-1.164-.986zM8 20c-2.206 0-4-1.794-4-4 0-.739.216-1.425.566-2.02l-1.451-1.451A5.961 5.961 0 0 0 2 16c0 3.309 2.691 6 6 6 1.294 0 2.49-.416 3.471-1.115l-1.451-1.451A3.972 3.972 0 0 1 8 20z" } }] })(t);
}
function a9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H8c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM8 16V4h12l.002 12H8z" } }, { tag: "path", attr: { d: "M4 8H2v12c0 1.103.897 2 2 2h12v-2H4V8zm11-2h-2v3h-3v2h3v3h2v-3h3V9h-3z" } }] })(t);
}
function r9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z" } }, { tag: "path", attr: { d: "M19 12a7 7 0 0 0-7-7v14a7 7 0 0 0 7-7z" } }] })(t);
}
function n9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 4c-4.879 0-9 4.121-9 9s4.121 9 9 9 9-4.121 9-9-4.121-9-9-9zm0 16c-3.794 0-7-3.206-7-7s3.206-7 7-7 7 3.206 7 7-3.206 7-7 7z" } }, { tag: "path", attr: { d: "M13 8h-2v4H7v2h4v4h2v-4h4v-2h-4zm7.292-1.292-3.01-3 1.412-1.417 3.01 3zM5.282 2.294 6.7 3.706l-2.99 3-1.417-1.413z" } }] })(t);
}
function c9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22c4.879 0 9-4.121 9-9s-4.121-9-9-9-9 4.121-9 9 4.121 9 9 9zm0-16c3.794 0 7 3.206 7 7s-3.206 7-7 7-7-3.206-7-7 3.206-7 7-7zm5.284-2.293 1.412-1.416 3.01 3-1.413 1.417zM5.282 2.294 6.7 3.706l-2.99 3-1.417-1.413z" } }, { tag: "path", attr: { d: "M11 9h2v5h-2zm0 6h2v2h-2z" } }] })(t);
}
function i9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.292 6.708-3.01-3 1.412-1.417 3.01 3zm1.415 13.585-2.287-2.287C20.409 16.563 21 14.838 21 13c0-4.879-4.121-9-9-9-1.838 0-3.563.591-5.006 1.58L5.91 4.496l.788-.79-1.416-1.412-.786.788-.789-.789-1.414 1.414 18 18 1.414-1.414zM12 6c3.794 0 7 3.206 7 7 0 1.292-.387 2.507-1.027 3.559L15.414 14H17v-2h-3.586L13 11.586V8h-2v1.586L8.441 7.027C9.493 6.387 10.708 6 12 6zM4.305 8.426A8.792 8.792 0 0 0 3 13c0 4.879 4.121 9 9 9a8.792 8.792 0 0 0 4.574-1.305l-1.461-1.461A6.801 6.801 0 0 1 12 20c-3.794 0-7-3.206-7-7 0-1.111.281-2.169.766-3.113L4.305 8.426z" } }] })(t);
}
function l9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 4c-4.879 0-9 4.121-9 9s4.121 9 9 9 9-4.121 9-9-4.121-9-9-9zm0 16c-3.794 0-7-3.206-7-7s3.206-7 7-7 7 3.206 7 7-3.206 7-7 7zm8.292-13.292-3.01-3 1.412-1.417 3.01 3zM6.698 3.707l-2.99 2.999L2.29 5.294l2.99-3z" } }, { tag: "path", attr: { d: "M14.832 10.555A1 1 0 0 0 14 9H9v2h3.132l-2.964 4.445A1 1 0 0 0 10 17h5v-2h-3.132l2.964-4.445z" } }] })(t);
}
function o9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 4c-4.879 0-9 4.121-9 9s4.121 9 9 9 9-4.121 9-9-4.121-9-9-9zm0 16c-3.794 0-7-3.206-7-7s3.206-7 7-7 7 3.206 7 7-3.206 7-7 7z" } }, { tag: "path", attr: { d: "M13 12V8h-2v6h6v-2zm4.284-8.293 1.412-1.416 3.01 3-1.413 1.417zm-10.586 0-2.99 2.999L2.29 5.294l2.99-3z" } }] })(t);
}
function h9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "11.99", cy: "11.99", r: "2.01" } }, { tag: "path", attr: { d: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" } }, { tag: "path", attr: { d: "M12 6a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4z" } }] })(t);
}
function s9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 7h16v2H4zm0-4h16v2H4zm0 8h16v2H4zm0 4h16v2H4zm2 4h12v2H6z" } }] })(t);
}
function v9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 19h16v2H4zm0-4h11v2H4zm0-4h16v2H4zm0-8h16v2H4zm0 4h11v2H4z" } }] })(t);
}
function u9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 19h16v2H4zm3-4h10v2H7zm-3-4h16v2H4zm0-8h16v2H4zm3 4h10v2H7z" } }] })(t);
}
function d9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 19h16v2H4zm5-4h11v2H9zm-5-4h16v2H4zm0-8h16v2H4zm5 4h11v2H9z" } }] })(t);
}
function g9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M2 12h2a7.986 7.986 0 0 1 2.337-5.663 7.91 7.91 0 0 1 2.542-1.71 8.12 8.12 0 0 1 6.13-.041A2.488 2.488 0 0 0 17.5 7C18.886 7 20 5.886 20 4.5S18.886 2 17.5 2c-.689 0-1.312.276-1.763.725-2.431-.973-5.223-.958-7.635.059a9.928 9.928 0 0 0-3.18 2.139 9.92 9.92 0 0 0-2.14 3.179A10.005 10.005 0 0 0 2 12zm17.373 3.122c-.401.952-.977 1.808-1.71 2.541s-1.589 1.309-2.542 1.71a8.12 8.12 0 0 1-6.13.041A2.488 2.488 0 0 0 6.5 17C5.114 17 4 18.114 4 19.5S5.114 22 6.5 22c.689 0 1.312-.276 1.763-.725A9.965 9.965 0 0 0 12 22a9.983 9.983 0 0 0 9.217-6.102A9.992 9.992 0 0 0 22 12h-2a7.993 7.993 0 0 1-.627 3.122z" } }, { tag: "path", attr: { d: "M12 7.462c-2.502 0-4.538 2.036-4.538 4.538S9.498 16.538 12 16.538s4.538-2.036 4.538-4.538S14.502 7.462 12 7.462zm0 7.076c-1.399 0-2.538-1.139-2.538-2.538S10.601 9.462 12 9.462s2.538 1.139 2.538 2.538-1.139 2.538-2.538 2.538z" } }] })(t);
}
function f9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m22 15-3-4-3 4h1.906c-.436 2.469-2.438 4.471-4.906 4.906V13h2v-2h-2V9.336c1.543-.459 2.714-1.923 2.714-3.621C15.714 3.666 14.048 2 12 2S8.286 3.666 8.286 5.715c0 1.698 1.171 3.162 2.714 3.621V11H9v2h2v6.906C8.531 19.471 6.529 17.469 6.094 15H8l-3-4-3 4h2.073c.511 3.885 3.929 7 7.927 7s7.416-3.115 7.927-7H22zM10.286 5.715C10.286 4.77 11.055 4 12 4s1.714.77 1.714 1.715c0 .951-.801 1.785-1.714 1.785s-1.714-.834-1.714-1.785z" } }] })(t);
}
function p9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M12 14c-3 0-4 3-4 3h8s-1-3-4-3zm-2.439-2.439c.014-.014.023-.03.037-.044l1.031.413.742-1.857-5-2-.742 1.856 1.373.549L7 10.5a1.499 1.499 0 0 0 2.561 1.061zm3.068-1.49.742 1.857 1.037-.415c.011.011.019.024.029.035a1.488 1.488 0 0 0 2.112 0c.271-.271.438-.644.438-1.056l-.001-.01 1.386-.554-.742-1.857-5.001 2z" } }] })(t);
}
function z9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.579 2 2 6.579 2 12s4.579 10 10 10 10-4.579 10-10S17.421 2 12 2zm2.113 13H9.986l-1.723-3.094L10.202 9h3.736l1.871 3.062L14.113 15zM4 12c0-.953.186-1.87.508-2.727L7.696 15H4.61A7.757 7.757 0 0 1 4 12zm12.283-3h3.106A7.74 7.74 0 0 1 20 12c0 .844-.143 1.66-.397 2.432L16.283 9zm1.905-2h-6.653l1.905-2.857c1.886.359 3.562 1.403 4.748 2.857zm-7.095-2.941L9.132 7H9v.197L7.17 9.942 5.65 7.214c1.3-1.703 3.249-2.895 5.443-3.155zM5.812 17h7.147l-1.709 2.961C9.084 19.748 7.141 18.63 5.812 17zm7.828 2.82 3.357-5.815 1.544 2.526c-1.154 1.642-2.901 2.854-4.901 3.289z" } }] })(t);
}
function m9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 22h1v-6.995c.006-.502.177-3.005 3-3.005s2.994 2.503 3 3v7h7v-2h-1V4h1V2H2v2h1v16H2v2h6zM19 4v2H5V4h14zM5 8h14v12h-2v-5c0-1.729-1.045-5-5-5s-5 3.271-5 5v5H5V8z" } }] })(t);
}
function M9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.706 5.292-2.999-2.999A.996.996 0 0 0 18 2H6a.996.996 0 0 0-.707.293L2.294 5.292A.994.994 0 0 0 2 6v13c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6a.994.994 0 0 0-.294-.708zM6.414 4h11.172l1 1H5.414l1-1zM4 19V7h16l.002 12H4z" } }, { tag: "path", attr: { d: "M14 9h-4v3H7l5 5 5-5h-3z" } }] })(t);
}
function B9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.706 5.292-2.999-2.999A.996.996 0 0 0 18 2H6a.996.996 0 0 0-.707.293L2.294 5.292A.994.994 0 0 0 2 6v13c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6a.994.994 0 0 0-.294-.708zM6.414 4h11.172l1 1H5.414l1-1zM4 19V7h16l.002 12H4z" } }, { tag: "path", attr: { d: "M7 14h3v3h4v-3h3l-5-5z" } }] })(t);
}
function H9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.706 5.291-2.999-2.998A.996.996 0 0 0 18 2H6a.996.996 0 0 0-.707.293L2.294 5.291A.994.994 0 0 0 2 5.999V19c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5.999a.994.994 0 0 0-.294-.708zM6.414 4h11.172l.999.999H5.415L6.414 4zM4 19V6.999h16L20.002 19H4z" } }, { tag: "path", attr: { d: "M15 12H9v-2H7v4h10v-4h-2z" } }] })(t);
}
function w9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 5v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2zm16.002 14H5V5h14l.002 14z" } }, { tag: "path", attr: { d: "M15 12h2V7h-5v2h3zm-3 3H9v-3H7v5h5z" } }] })(t);
}
function x9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 11H6.414l5.293-5.293-1.414-1.414L2.586 12l7.707 7.707 1.414-1.414L6.414 13H21z" } }] })(t);
}
function V9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 18h12v2H6zm6-14.414-6.707 6.707 1.414 1.414L11 7.414V16h2V7.414l4.293 4.293 1.414-1.414z" } }] })(t);
}
function y9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 6h2v12H4zm4 7h8.586l-4.293 4.293 1.414 1.414L20.414 12l-6.707-6.707-1.414 1.414L16.586 11H8z" } }] })(t);
}
function C9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 6h2v12h-2zm-2 5H7.414l4.293-4.293-1.414-1.414L3.586 12l6.707 6.707 1.414-1.414L7.414 13H16z" } }] })(t);
}
function L9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 4h12v2H6zm6 16.414 6.707-6.707-1.414-1.414L13 16.586V8h-2v8.586l-4.293-4.293-1.414 1.414z" } }] })(t);
}
function _9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 18h12v2H6zm5-14v8.586L6.707 8.293 5.293 9.707 12 16.414l6.707-6.707-1.414-1.414L13 12.586V4z" } }] })(t);
}
function A9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 6h2v12H4zm10.293-.707L7.586 12l6.707 6.707 1.414-1.414L11.414 13H20v-2h-8.586l4.293-4.293z" } }] })(t);
}
function b9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 6h2v12h-2zM4 13h8.586l-4.293 4.293 1.414 1.414L16.414 12 9.707 5.293 8.293 6.707 12.586 11H4z" } }] })(t);
}
function P9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 4h12v2H6zm.707 11.707L11 11.414V20h2v-8.586l4.293 4.293 1.414-1.414L12 7.586l-6.707 6.707z" } }] })(t);
}
function S9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10c1.466 0 2.961-.371 4.442-1.104l-.885-1.793C14.353 19.698 13.156 20 12 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8v1c0 .692-.313 2-1.5 2-1.396 0-1.494-1.819-1.5-2V8h-2v.025A4.954 4.954 0 0 0 12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5c1.45 0 2.748-.631 3.662-1.621.524.89 1.408 1.621 2.838 1.621 2.273 0 3.5-2.061 3.5-4v-1c0-5.514-4.486-10-10-10zm0 13c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z" } }] })(t);
}
function E9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3.102 20.898c.698.699 1.696 1.068 2.887 1.068 1.742 0 3.855-.778 6.012-2.127 2.156 1.35 4.27 2.127 6.012 2.127 1.19 0 2.188-.369 2.887-1.068 1.269-1.269 1.411-3.413.401-6.039-.358-.932-.854-1.895-1.457-2.859a16.792 16.792 0 0 0 1.457-2.859c1.01-2.626.867-4.771-.401-6.039-.698-.699-1.696-1.068-2.887-1.068-1.742 0-3.855.778-6.012 2.127-2.156-1.35-4.27-2.127-6.012-2.127-1.19 0-2.188.369-2.887 1.068C1.833 4.371 1.69 6.515 2.7 9.141c.359.932.854 1.895 1.457 2.859A16.792 16.792 0 0 0 2.7 14.859c-1.01 2.626-.867 4.77.402 6.039zm16.331-5.321c.689 1.79.708 3.251.052 3.907-.32.32-.815.482-1.473.482-1.167 0-2.646-.503-4.208-1.38a26.611 26.611 0 0 0 4.783-4.784c.336.601.623 1.196.846 1.775zM12 17.417a23.568 23.568 0 0 1-2.934-2.483A23.998 23.998 0 0 1 6.566 12 23.74 23.74 0 0 1 12 6.583a23.568 23.568 0 0 1 2.934 2.483 23.998 23.998 0 0 1 2.5 2.934A23.74 23.74 0 0 1 12 17.417zm6.012-13.383c.657 0 1.152.162 1.473.482.656.656.638 2.117-.052 3.907-.223.579-.51 1.174-.846 1.775a26.448 26.448 0 0 0-4.783-4.784c1.562-.876 3.041-1.38 4.208-1.38zM4.567 8.423c-.689-1.79-.708-3.251-.052-3.907.32-.32.815-.482 1.473-.482 1.167 0 2.646.503 4.208 1.38a26.448 26.448 0 0 0-4.783 4.784 13.934 13.934 0 0 1-.846-1.775zm0 7.154c.223-.579.51-1.174.846-1.775a26.448 26.448 0 0 0 4.783 4.784c-1.563.877-3.041 1.38-4.208 1.38-.657 0-1.152-.162-1.473-.482-.656-.656-.637-2.117.052-3.907z" } }, { tag: "circle", attr: { cx: "12", cy: "12", r: "2.574" } }] })(t);
}
function R9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 8.999c0 1.902.765 3.627 2 4.89V21a.998.998 0 0 0 1.447.895L12 20.118l3.553 1.776a.992.992 0 0 0 .972-.043c.295-.183.475-.504.475-.851v-7.11a6.976 6.976 0 0 0 2-4.891C19 5.14 15.86 2 12 2S5 5.14 5 8.999zm7.447 9.106a1 1 0 0 0-.895 0L9 19.382v-4.067c.911.434 1.926.685 3 .685s2.089-.25 3-.685v4.066l-2.553-1.276zM12 4c2.756 0 5 2.242 5 4.999A5.006 5.006 0 0 1 12 14c-2.757 0-5-2.243-5-5.001A5.005 5.005 0 0 1 12 4z" } }] })(t);
}
function T9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4.035 15.479A3.976 3.976 0 0 0 4 16c0 2.378 2.138 4.284 4.521 3.964C9.214 21.198 10.534 22 12 22s2.786-.802 3.479-2.036C17.857 20.284 20 18.378 20 16c0-.173-.012-.347-.035-.521C21.198 14.786 22 13.465 22 12s-.802-2.786-2.035-3.479C19.988 8.347 20 8.173 20 8c0-2.378-2.143-4.288-4.521-3.964C14.786 2.802 13.466 2 12 2s-2.786.802-3.479 2.036C6.138 3.712 4 5.622 4 8c0 .173.012.347.035.521C2.802 9.214 2 10.535 2 12s.802 2.786 2.035 3.479zm1.442-5.403 1.102-.293-.434-1.053A1.932 1.932 0 0 1 6 8c0-1.103.897-2 2-2 .247 0 .499.05.73.145l1.054.434.293-1.102a1.99 1.99 0 0 1 3.846 0l.293 1.102 1.054-.434C15.501 6.05 15.753 6 16 6c1.103 0 2 .897 2 2 0 .247-.05.5-.145.73l-.434 1.053 1.102.293a1.993 1.993 0 0 1 0 3.848l-1.102.293.434 1.053c.095.23.145.483.145.73 0 1.103-.897 2-2 2-.247 0-.499-.05-.73-.145l-1.054-.434-.293 1.102a1.99 1.99 0 0 1-3.846 0l-.293-1.102-1.054.434A1.935 1.935 0 0 1 8 18c-1.103 0-2-.897-2-2 0-.247.05-.5.145-.73l.434-1.053-1.102-.293a1.993 1.993 0 0 1 0-3.848z" } }, { tag: "path", attr: { d: "m15.742 10.71-1.408-1.42-3.331 3.299-1.296-1.296-1.414 1.414 2.704 2.704z" } }] })(t);
}
function O9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.965 8.521C19.988 8.347 20 8.173 20 8c0-2.378-2.143-4.288-4.521-3.964C14.786 2.802 13.466 2 12 2s-2.786.802-3.479 2.036C6.138 3.712 4 5.622 4 8c0 .173.012.347.035.521C2.802 9.214 2 10.535 2 12s.802 2.786 2.035 3.479A3.976 3.976 0 0 0 4 16c0 2.378 2.138 4.284 4.521 3.964C9.214 21.198 10.534 22 12 22s2.786-.802 3.479-2.036C17.857 20.284 20 18.378 20 16c0-.173-.012-.347-.035-.521C21.198 14.786 22 13.465 22 12s-.802-2.786-2.035-3.479zm-1.442 5.403-1.102.293.434 1.053c.095.23.145.483.145.73 0 1.103-.897 2-2 2-.247 0-.499-.05-.73-.145l-1.054-.434-.293 1.102a1.99 1.99 0 0 1-3.846 0l-.293-1.102-1.054.434A1.935 1.935 0 0 1 8 18c-1.103 0-2-.897-2-2 0-.247.05-.5.145-.73l.434-1.053-1.102-.293a1.993 1.993 0 0 1 0-3.848l1.102-.293-.434-1.053A1.932 1.932 0 0 1 6 8c0-1.103.897-2 2-2 .247 0 .499.05.73.145l1.054.434.293-1.102a1.99 1.99 0 0 1 3.846 0l.293 1.102 1.054-.434C15.501 6.05 15.753 6 16 6c1.103 0 2 .897 2 2 0 .247-.05.5-.145.73l-.434 1.053 1.102.293a1.993 1.993 0 0 1 0 3.848z" } }] })(t);
}
function N9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3.76 21a17.68 17.68 0 0 0 4 .43 13.89 13.89 0 0 0 9.93-3.69C23 12.37 21.06 4.11 21 3.76a1 1 0 0 0-.76-.76 17.91 17.91 0 0 0-4-.43 13.82 13.82 0 0 0-9.96 3.71C.94 11.63 2.94 19.89 3 20.24a1 1 0 0 0 .76.76zM7.7 7.7a11.86 11.86 0 0 1 8.49-3.1 17.57 17.57 0 0 1 3 .25c.31 1.87.91 7.67-2.86 11.44a11.91 11.91 0 0 1-8.55 3.11 17.16 17.16 0 0 1-2.93-.25c-.32-1.88-.92-7.67 2.85-11.45z" } }, { tag: "path", attr: { d: "m7.29 15.29 1.42 1.42 1.79-1.79 1.79 1.79 1.42-1.42-1.8-1.79 1.59-1.59 1.79 1.8 1.42-1.42-1.8-1.79 1.8-1.79-1.42-1.42-1.79 1.8-1.79-1.8-1.42 1.42 1.8 1.79-1.59 1.59-1.79-1.8-1.42 1.42 1.8 1.79z" } }] })(t);
}
function $9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.111 21.889a5.962 5.962 0 0 0 4.242-1.757l7.778-7.778a6.007 6.007 0 0 0 0-8.485 5.965 5.965 0 0 0-4.243-1.757 5.962 5.962 0 0 0-4.242 1.757l-7.778 7.778a6.007 6.007 0 0 0 0 8.485 5.965 5.965 0 0 0 4.243 1.757zm-2.829-8.828 7.778-7.778a3.976 3.976 0 0 1 2.828-1.171c1.069 0 2.073.416 2.829 1.171a4.006 4.006 0 0 1 0 5.657l-7.778 7.778a3.976 3.976 0 0 1-2.828 1.171 3.977 3.977 0 0 1-2.829-1.171 4.008 4.008 0 0 1 0-5.657z" } }, { tag: "circle", attr: { cx: "9", cy: "12", r: "1" } }, { tag: "circle", attr: { cx: "15", cy: "12", r: "1" } }, { tag: "circle", attr: { cx: "12", cy: "15", r: "1" } }, { tag: "circle", attr: { cx: "12", cy: "9", r: "1" } }] })(t);
}
function I9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 7h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H4c-1.103 0-2 .897-2 2v9a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9c0-1.103-.897-2-2-2zM4 11h4v8H4v-8zm6-1V4h4v15h-4v-9zm10 9h-4V9h4v10z" } }] })(t);
}
function D9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 6h2v11h-2zm4-3h2v14h-2zM9 9h2v8H9zM4 19h16v2H4zm1-7h2v5H5z" } }] })(t);
}
function k9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 5v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2zm16.001 14H5V5h14l.001 14z" } }, { tag: "path", attr: { d: "M11 7h2v10h-2zm4 3h2v7h-2zm-8 2h2v5H7z" } }] })(t);
}
function j9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 6h2v14H9zm4 2h2v12h-2zm4-4h2v16h-2zM5 12h2v8H5z" } }] })(t);
}
function U9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 7h2v10H5zm9 0h1v10h-1zm-4 0h3v10h-3zM8 7h1v10H8zm8 0h3v10h-3z" } }, { tag: "path", attr: { d: "M4 5h4V3H4c-1.103 0-2 .897-2 2v4h2V5zm0 16h4v-2H4v-4H2v4c0 1.103.897 2 2 2zM20 3h-4v2h4v4h2V5c0-1.103-.897-2-2-2zm0 16h-4v2h4c1.103 0 2-.897 2-2v-4h-2v4z" } }] })(t);
}
function F9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM4 18V6h16v12z" } }, { tag: "path", attr: { d: "M6 8h2v8H6zm3 0h1v8H9zm8 0h1v8h-1zm-4 0h3v8h-3zm-2 0h1v8h-1z" } }] })(t);
}
function q9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.99 2a9.937 9.937 0 0 0-7.071 2.938c-3.898 3.898-3.898 10.243 0 14.143 1.895 1.895 4.405 2.938 7.071 2.938s5.177-1.043 7.071-2.938c3.899-3.899 3.899-10.244 0-14.143A9.937 9.937 0 0 0 11.99 2zm5.657 15.667a7.957 7.957 0 0 1-3.816 2.129l-.001-.037a6.199 6.199 0 0 1 .421-2.259l-1.863-.729a8.188 8.188 0 0 0-.552 3.239 7.953 7.953 0 0 1-5.503-2.344 7.965 7.965 0 0 1-2.332-5.503c.08.002.16.005.24.005a8.16 8.16 0 0 0 2.988-.558l-.73-1.862a6.156 6.156 0 0 1-2.281.412 7.936 7.936 0 0 1 2.115-3.809 7.963 7.963 0 0 1 3.972-2.168 5.974 5.974 0 0 1-.357 1.95l1.881.681a7.92 7.92 0 0 0 .482-2.701c0-.033-.004-.065-.005-.098 2.013.079 3.9.896 5.342 2.336a7.959 7.959 0 0 1 2.324 5.348 7.908 7.908 0 0 0-2.787.473l.684 1.88a5.91 5.91 0 0 1 1.935-.361 7.953 7.953 0 0 1-2.157 3.976z" } }, { tag: "path", attr: { d: "M14.112 14.13a7.599 7.599 0 0 0-.926 1.121l1.656 1.12c.2-.296.43-.574.683-.826a6.428 6.428 0 0 1 1.178-.929l-1.049-1.703a8.408 8.408 0 0 0-1.542 1.217zM8.456 8.474a5.713 5.713 0 0 1-.827.681l1.119 1.658a7.72 7.72 0 0 0 1.122-.926 8.501 8.501 0 0 0 1.217-1.542L9.384 7.297a6.519 6.519 0 0 1-.928 1.177z" } }] })(t);
}
function W9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 9h-1.42l-3.712-6.496-1.736.992L17.277 9H6.723l3.146-5.504-1.737-.992L4.42 9H3a1.001 1.001 0 0 0-.965 1.263l2.799 10.264A2.005 2.005 0 0 0 6.764 22h10.473c.898 0 1.692-.605 1.93-1.475l2.799-10.263A.998.998 0 0 0 21 9zm-3.764 11v1-1H6.764L4.31 11h15.38l-2.454 9z" } }, { tag: "path", attr: { d: "M9 13h2v5H9zm4 0h2v5h-2z" } }] })(t);
}
function G9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4.929 19.071c1.895 1.895 4.405 2.938 7.071 2.938s5.177-1.043 7.071-2.938c3.899-3.899 3.899-10.243 0-14.143C17.177 3.034 14.665 1.99 12 1.99S6.823 3.034 4.929 4.929c-3.899 3.898-3.899 10.243 0 14.142zm7.38-15.065a7.912 7.912 0 0 1 4.594 1.678L12 10.586l-1.46-1.46c1.161-1.479 1.792-3.308 1.769-5.12zM9.11 7.696 7.098 5.684a7.929 7.929 0 0 1 3.218-1.51c-.015 1.236-.445 2.477-1.206 3.522zM7.686 9.1a6.065 6.065 0 0 1-3.459 1.057 7.923 7.923 0 0 1 1.458-3.058L7.686 9.1zm-3.675 3.046c.077.002.154.014.231.014a8.05 8.05 0 0 0 4.877-1.626L10.586 12l-4.901 4.901a7.972 7.972 0 0 1-1.674-4.755zm12.294 2.745c1.042-.758 2.28-1.188 3.508-1.206a7.947 7.947 0 0 1-1.497 3.217l-2.011-2.011zm.597 3.425a7.935 7.935 0 0 1-3.059 1.47 6.05 6.05 0 0 1 1.057-3.472l2.002 2.002zm-5.044 1.686a7.922 7.922 0 0 1-4.761-1.686L12 13.414l1.463 1.463c-1.103 1.444-1.659 3.266-1.605 5.125zm8.124-8.31c-1.807-.018-3.633.61-5.108 1.768L13.414 12l4.901-4.901a7.968 7.968 0 0 1 1.667 4.593z" } }] })(t);
}
function X9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 10H7V7c0-1.103.897-2 2-2s2 .897 2 2h2c0-2.206-1.794-4-4-4S5 4.794 5 7v3H3a1 1 0 0 0-1 1v2c0 2.606 1.674 4.823 4 5.65V22h2v-3h8v3h2v-3.35c2.326-.827 4-3.044 4-5.65v-2a1 1 0 0 0-1-1zm-1 3c0 2.206-1.794 4-4 4H8c-2.206 0-4-1.794-4-4v-1h16v1z" } }] })(t);
}
function K9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 18h14c1.103 0 2-.897 2-2v-2h2v-4h-2V8c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2zM4 8h14l.002 8H4V8z" } }] })(t);
}
function Y9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 9.557V3h-2v2H6V3H4v6.557C2.81 10.25 2 11.525 2 13v4a1 1 0 0 0 1 1h1v4h2v-4h12v4h2v-4h1a1 1 0 0 0 1-1v-4c0-1.475-.811-2.75-2-3.443zM18 7v2h-5V7h5zM6 7h5v2H6V7zm14 9H4v-3c0-1.103.897-2 2-2h12c1.103 0 2 .897 2 2v3z" } }] })(t);
}
function Q9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C7.589 2 4 5.589 4 9.995c-.029 6.445 7.116 11.604 7.42 11.819a.998.998 0 0 0 1.16 0C12.884 21.599 20.029 16.44 20 10c0-4.411-3.589-8-8-8zm0 17.735C10.389 18.427 5.979 14.441 6 10c0-3.309 2.691-6 6-6s6 2.691 6 6.005c.021 4.437-4.388 8.423-6 9.73z" } }, { tag: "path", attr: { d: "M11 11.586 8.707 9.293l-1.414 1.414L11 14.414l5.707-5.707-1.414-1.414z" } }] })(t);
}
function J9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 6h-2V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v15c0 1.654 1.346 3 3 3h10c1.654 0 3-1.346 3-3v-1h2c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-4 13c0 .551-.448 1-1 1H5c-.552 0-1-.449-1-1V5h12v14zm4-3h-2V8h2v8z" } }, { tag: "path", attr: { d: "M6 7h2v10H6zm6 0h2v10h-2z" } }] })(t);
}
function Z9(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.707 15.293 19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z" } }, { tag: "path", attr: { d: "M8.037 10h7.926v2H8.037z" } }] })(t);
}
function tr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22zm9-4v-2a.996.996 0 0 0-.293-.707L19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258c-1.323.364-2.463 1.128-3.346 2.127L3.707 2.293 2.293 3.707l18 18 1.414-1.414-1.362-1.362A.993.993 0 0 0 21 18zM12 5c2.757 0 5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17h-.586L8.207 6.793C9.12 5.705 10.471 5 12 5zm-5.293 9.707A.996.996 0 0 0 7 14v-2.879L5.068 9.189C5.037 9.457 5 9.724 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h10.879l-2-2H5v-.586l1.707-1.707z" } }] })(t);
}
function er(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 7.037h-2V10H8.037v2H11v2.963h2V12h2.963v-2H13z" } }, { tag: "path", attr: { d: "M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z" } }] })(t);
}
function ar(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z" } }] })(t);
}
function rr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 22h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3zM5 8V5c0-.805.55-.988 1-1h13v12H5V8z" } }, { tag: "path", attr: { d: "M11 14h2v-4h2V8h-2V6h-2v2H9v2h2z" } }] })(t);
}
function nr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 13v4H6v2h3v2h2v-2h2v2h2v-2.051c1.968-.249 3.5-1.915 3.5-3.949 0-1.32-.65-2.484-1.64-3.213A3.982 3.982 0 0 0 18 9c0-1.858-1.279-3.411-3-3.858V3h-2v2h-2V3H9v2H6v2h2v6zm6.5 4H10v-4h4.5c1.103 0 2 .897 2 2s-.897 2-2 2zM10 7h4c1.103 0 2 .897 2 2s-.897 2-2 2h-4V7z" } }] })(t);
}
function cr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H7C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h12c1.654 0 3-1.346 3-3s-1.346-3-3-3H6v2h13a1 1 0 0 1 0 2H7c-1.654 0-3-1.346-3-3s1.346-3 3-3h13c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 10H7a4.973 4.973 0 0 0-3 1.002V7c0-1.654 1.346-3 3-3h13v8z" } }] })(t);
}
function ir(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM4 12c0-1.846.634-3.542 1.688-4.897l11.209 11.209A7.946 7.946 0 0 1 12 20c-4.411 0-8-3.589-8-8zm14.312 4.897L7.103 5.688A7.948 7.948 0 0 1 12 4c4.411 0 8 3.589 8 8a7.954 7.954 0 0 1-1.688 4.897z" } }] })(t);
}
function lr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m4.41 16.192 1.18 1.615L10 14.584V21a1 1 0 0 0 1.541.841l7-4.5a.999.999 0 0 0 .049-1.649L13.537 12l5.053-3.692a1.002 1.002 0 0 0-.049-1.65l-7-4.5a1.002 1.002 0 0 0-1.021-.037c-.32.176-.52.513-.52.879v6.416L5.59 6.192 4.41 7.808 10 11.893v.215l-5.59 4.084zM12 4.832l4.232 2.721L12 10.646V4.832zm0 8.522 4.232 3.093L12 19.168v-5.814z" } }] })(t);
}
function or(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "4", r: "2" } }, { tag: "path", attr: { d: "M15 22V9h5V7H4v2h5v13h2v-7h2v7z" } }] })(t);
}
function hr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.061 11.22A4.46 4.46 0 0 0 18 8.5C18 6.019 15.981 4 13.5 4H6v15h8c2.481 0 4.5-2.019 4.5-4.5a4.48 4.48 0 0 0-1.439-3.28zM13.5 7c.827 0 1.5.673 1.5 1.5s-.673 1.5-1.5 1.5H9V7h4.5zm.5 9H9v-3h5c.827 0 1.5.673 1.5 1.5S14.827 16 14 16z" } }] })(t);
}
function sr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "m13 6-6 7h4v5l6-7h-4z" } }] })(t);
}
function vr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 3.001c-1.4 0-2.584 1.167-2.707 1.293L17.207 5.38l-1.091-1.088a.999.999 0 0 0-1.413.001L13.46 5.537A8.353 8.353 0 0 0 10.5 5C5.813 5 2 8.813 2 13.5S5.813 22 10.5 22s8.5-3.813 8.5-8.5c0-.909-.144-1.8-.428-2.658l1.345-1.345a1.002 1.002 0 0 0-.001-1.415l-1.293-1.29 1.088-1.088c.229-.229.845-.703 1.289-.703h1v-2h-1zm-4.511 7.978c.339.804.511 1.652.511 2.521 0 3.584-2.916 6.5-6.5 6.5S4 17.084 4 13.5 6.916 7 10.5 7c.96 0 1.89.21 2.762.624.381.181.837.103 1.136-.196l1.014-1.014 2.384 2.377-1.092 1.092a.998.998 0 0 0-.215 1.096z" } }, { tag: "path", attr: { d: "M6 13.5a4.47 4.47 0 0 0 1.318 3.182l1.414-1.414C8.26 14.795 8 14.168 8 13.5s.26-1.295.732-1.768A2.484 2.484 0 0 1 10.5 11V9a4.469 4.469 0 0 0-3.182 1.318A4.47 4.47 0 0 0 6 13.5z" } }] })(t);
}
function ur(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.049 4.951a3.953 3.953 0 0 0-1.028-1.801c-1.51-1.51-4.146-1.51-5.656 0a4.009 4.009 0 0 0-.618 4.86l-3.714 3.714c-1.505-.89-3.591-.649-4.86.618a4.004 4.004 0 0 0 0 5.657 3.946 3.946 0 0 0 1.8 1.028c.178.681.53 1.302 1.028 1.8A3.966 3.966 0 0 0 8.829 22a3.973 3.973 0 0 0 2.828-1.172 4.007 4.007 0 0 0 .617-4.859l3.714-3.714c1.507.891 3.593.65 4.861-.619a4.003 4.003 0 0 0 0-5.656 3.942 3.942 0 0 0-1.8-1.029zm.387 5.271c-.756.755-2.073.756-2.829 0l-.707-.707-6.363 6.364.707.707a2.003 2.003 0 0 1 0 2.828c-.757.757-2.074.755-2.829 0a1.963 1.963 0 0 1-.571-1.31l-.047-.9-.9-.047a1.972 1.972 0 0 1-1.31-.571 2.003 2.003 0 0 1 0-2.829c.377-.377.879-.585 1.413-.585s1.036.208 1.414.585l.707.707 6.364-6.363-.707-.707a2.003 2.003 0 0 1 0-2.829c.756-.754 2.072-.754 2.828 0 .343.343.546.809.572 1.312l.048.897.897.048c.503.026.969.229 1.312.572.377.378.585.88.585 1.414s-.207 1.036-.584 1.414z" } }] })(t);
}
function dr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m19.293 8.293-2.069 2.069A7.017 7.017 0 0 0 15 8.681V4h1V2H8v2h1v4.681A7.01 7.01 0 0 0 5 15c0 3.859 3.141 7 7 7s7-3.141 7-7a6.958 6.958 0 0 0-.652-2.934l2.359-2.359-1.414-1.414zm-8.959 1.998.666-.235V4h2v6.056l.666.235A5.006 5.006 0 0 1 16.886 14H7.114a5.006 5.006 0 0 1 3.22-3.709zM12 20a5.007 5.007 0 0 1-4.898-4h9.797A5.009 5.009 0 0 1 12 20z" } }] })(t);
}
function gr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 8v11c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.806 5 19c0-.101.009-.191.024-.273.112-.576.584-.717.988-.727H21V4c0-1.103-.897-2-2-2H6c-1.206 0-3 .799-3 3v3zm3-4h13v12H5V5c0-.806.55-.988 1-1z" } }, { tag: "path", attr: { d: "M11 14h2v-3h3V9h-3V6h-2v3H8v2h3z" } }] })(t);
}
function fr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.806 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" } }] })(t);
}
function pr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 2.01H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.998 5 19.815 5 19.01c0-.101.009-.191.024-.273.112-.575.583-.717.987-.727H20c.018 0 .031-.009.049-.01H21V4.01c0-1.103-.897-2-2-2zm0 14H5v-11c0-.806.55-.988 1-1h7v7l2-1 2 1v-7h2v12z" } }] })(t);
}
function zr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h7v14H4zm9 0V5h7l.001 14H13z" } }, { tag: "path", attr: { d: "M15 7h3v2h-3zm0 4h3v2h-3z" } }] })(t);
}
function mr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 8v11c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.806 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2H6c-1.206 0-3 .799-3 3v3zm3-4h13v12H5V5c0-.806.55-.988 1-1z" } }, { tag: "path", attr: { d: "m11.997 14 3.35-3.289a2.129 2.129 0 0 0 0-3.069 2.225 2.225 0 0 0-3.126 0l-.224.218-.224-.219a2.224 2.224 0 0 0-3.125 0 2.129 2.129 0 0 0 0 3.069L11.997 14z" } }] })(t);
}
function Mr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 3h-7a2.98 2.98 0 0 0-2 .78A2.98 2.98 0 0 0 10 3H3a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h5.758c.526 0 1.042.214 1.414.586l1.121 1.121c.009.009.021.012.03.021.086.079.182.149.294.196h.002a.996.996 0 0 0 .762 0h.002c.112-.047.208-.117.294-.196.009-.009.021-.012.03-.021l1.121-1.121A2.015 2.015 0 0 1 15.242 20H21a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.758 18H4V5h6c.552 0 1 .449 1 1v12.689A4.032 4.032 0 0 0 8.758 18zM20 18h-4.758c-.799 0-1.584.246-2.242.689V6c0-.551.448-1 1-1h6v13z" } }] })(t);
}
function Br(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 8c-.202 0-4.85.029-9 2.008C7.85 8.029 3.202 8 3 8a1 1 0 0 0-1 1v9.883a1 1 0 0 0 .305.719c.195.188.48.305.729.28l.127-.001c.683 0 4.296.098 8.416 2.025.016.008.034.005.05.011.119.049.244.083.373.083s.254-.034.374-.083c.016-.006.034-.003.05-.011 4.12-1.928 7.733-2.025 8.416-2.025l.127.001c.238.025.533-.092.729-.28.194-.189.304-.449.304-.719V9a1 1 0 0 0-1-1zM4 10.049c1.485.111 4.381.48 7 1.692v7.742c-3-1.175-5.59-1.494-7-1.576v-7.858zm16 7.858c-1.41.082-4 .401-7 1.576v-7.742c2.619-1.212 5.515-1.581 7-1.692v7.858z" } }, { tag: "circle", attr: { cx: "12", cy: "5", r: "3" } }] })(t);
}
function Hr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 22h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3zM5 8V5c0-.805.55-.988 1-1h13v12H5V8z" } }, { tag: "path", attr: { d: "M8 6h9v2H8z" } }] })(t);
}
function wr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.5 2h-12C4.57 2 3 3.57 3 5.5V22l7-3.5 7 3.5v-9h5V5.5C22 3.57 20.43 2 18.5 2zM15 18.764l-5-2.5-5 2.5V5.5C5 4.673 5.673 4 6.5 4h8.852A3.451 3.451 0 0 0 15 5.5v13.264zM20 11h-3V5.5c0-.827.673-1.5 1.5-1.5s1.5.673 1.5 1.5V11z" } }, { tag: "path", attr: { d: "M7 9h6v2H7z" } }] })(t);
}
function xr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.5 2h-12C4.57 2 3 3.57 3 5.5V22l7-3.5 7 3.5v-9h5V5.5C22 3.57 20.43 2 18.5 2zM15 18.764l-5-2.5-5 2.5V5.5C5 4.673 5.673 4 6.5 4h8.852A3.451 3.451 0 0 0 15 5.5v13.264zM20 11h-3V5.5c0-.827.673-1.5 1.5-1.5s1.5.673 1.5 1.5V11z" } }, { tag: "path", attr: { d: "M11 7H9v2H7v2h2v2h2v-2h2V9h-2z" } }] })(t);
}
function Vr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.5 2h-12C4.57 2 3 3.57 3 5.5V22l7-3.5 7 3.5v-9h5V5.5C22 3.57 20.43 2 18.5 2zM15 18.764l-5-2.5-5 2.5V5.5C5 4.673 5.673 4 6.5 4h8.852A3.451 3.451 0 0 0 15 5.5v13.264zM20 11h-3V5.5c0-.827.673-1.5 1.5-1.5s1.5.673 1.5 1.5V11z" } }] })(t);
}
function yr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 22V4c0-1.103-.897-2-2-2H6c-1.103 0-2 .897-2 2v18l8-4.572L20 22zM6 10V4h12v14.553l-6-3.428-6 3.428V10z" } }, { tag: "path", attr: { d: "M15.409 9.512c.361-.372.585-.888.585-1.456s-.223-1.083-.585-1.456a1.962 1.962 0 0 0-1.412-.603S13.001 5.994 12 7.026c-1.001-1.032-1.997-1.029-1.997-1.029-.552 0-1.051.23-1.412.603-.362.373-.585.887-.585 1.456s.223 1.084.585 1.456L12 13.203l3.409-3.691z" } }] })(t);
}
function Cr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 9h8v2H8z" } }, { tag: "path", attr: { d: "M20 22V4c0-1.103-.897-2-2-2H6c-1.103 0-2 .897-2 2v18l8-4.572L20 22zM6 10V4h12v14.553l-6-3.428-6 3.428V10z" } }] })(t);
}
function Lr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 14v-3h3V9h-3V6h-2v3H8v2h3v3z" } }, { tag: "path", attr: { d: "M20 22V4c0-1.103-.897-2-2-2H6c-1.103 0-2 .897-2 2v18l8-4.572L20 22zM6 10V4h12v14.553l-6-3.428-6 3.428V10z" } }] })(t);
}
function _r(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 2H6c-1.103 0-2 .897-2 2v18l8-4.572L20 22V4c0-1.103-.897-2-2-2zm0 16.553-6-3.428-6 3.428V4h12v14.553z" } }] })(t);
}
function Ar(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14 5H6c-1.103 0-2 .897-2 2v16l6-3.601L16 23V7c0-1.103-.897-2-2-2zm0 14.467-4-2.399-4 2.399V7h8v12.467z" } }, { tag: "path", attr: { d: "M18 1h-8c-1.103 0-2 .897-2 2h8c1.103 0 2 .897 2 2v10.443l2 2.489V3c0-1.103-.897-2-2-2z" } }] })(t);
}
function br(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 21h12V3H3v18h6zm10-4v2h-6v-6h6v4zM15 5h4v6h-6V5h2zM5 7V5h6v6H5V7zm0 12v-6h6v6H5z" } }] })(t);
}
function Pr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 7h2v2H3zm0 4h2v2H3zm0 4h2v2H3zM3 3h2v2H3zm8 0h2v2h-2zM7 3h2v2H7zm8 0h2v2h-2zm4 0h2v2h-2zm0 12h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2zm-4 4h2v2h-2zm-8 0h2v2H7zm4-4h2v2h-2zm0 8h2v2h-2zm0-4h2v2h-2zm6 8H3v2h18v-2h-2z" } }] })(t);
}
function Sr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 19h2v2h-2zM7 19h2v2H7zm8 0h2v2h-2zM3 19h2v2H3zm0-4h2v2H3zm0-8h2v2H3zm0-4h2v2H3zm12 0h2v2h-2zM7 3h2v2H7zm12 0h2v2h-2zm0 12h2v2h-2zm0-8h2v2h-2z" } }, { tag: "path", attr: { d: "M5 13h6v8h2v-8h8v-2h-8V3h-2v8H3v2h1.93z" } }] })(t);
}
function Er(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 3h2v2h-2zm4 0h2v2h-2zM7 3h2v2H7zm12 0h2v2h-2zm0 8h2v2h-2zm0 4h2v2h-2zm0-8h2v2h-2zm0 12h2v2h-2zm-4 0h2v2h-2zm-8 0h2v2H7zm4 0h2v2h-2zm0-4h2v2h-2zm0-8h2v2h-2zm4 4h2v2h-2zm-8 0h2v2H7zm4 0h2v2h-2zM3 5v16h2V3H3z" } }] })(t);
}
function Rr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 19h2v2h-2zm-8 0h2v2h-2zm4 0h2v2h-2zm-8 0h2v2H7zm-4 0h2v2H3zM3 7h2v2H3zm0 8h2v2H3zm0-4h2v2H3zm0-8h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm-8-8h2v2h-2zm0 8h2v2h-2zm-4-4h2v2H7zm8 0h2v2h-2zm-4 0h2v2h-2z" } }] })(t);
}
function Tr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 7h2v2h-2zm0 8h2v2h-2zm-4-4h2v2H7zm8 0h2v2h-2zm-4 0h2v2h-2z" } }, { tag: "path", attr: { d: "M19 3H3v18h18V3h-2zm0 4v12H5V5h14v2z" } }] })(t);
}
function Or(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 19h2v2h-2zM7 19h2v2H7zm8 0h2v2h-2zm-4 0h2v2h-2zm-8 0h2v2H3zm0-4h2v2H3zm0-8h2v2H3zm0 4h2v2H3zm0-8h2v2H3zm4 0h2v2H7zm12 12h2v2h-2zM16 3h-5v2h5c1.654 0 3 1.346 3 3v5h2V8c0-2.757-2.243-5-5-5z" } }] })(t);
}
function Nr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15 19h2v2h-2zm-4 0h2v2h-2zm-4 0h2v2H7zm-4 0h2v2H3zM3 7h2v2H3zm0 8h2v2H3zm0-4h2v2H3zm0-8h2v2H3zm12 0h2v2h-2zm-4 0h2v2h-2zM7 3h2v2H7zm4 4h2v2h-2zm0 8h2v2h-2zm-4-4h2v2H7zm8 0h2v2h-2zm-4 0h2v2h-2zm8-6v16h2V3h-2z" } }] })(t);
}
function $r(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 11h2v2h-2zm0 4h2v2h-2zm0-8h2v2h-2zm0 12h2v2h-2zm-8 0h2v2h-2zm4 0h2v2h-2zm-8 0h2v2H7zm-4 0h2v2H3zm0-8h2v2H3zm0 4h2v2H3zm0-8h2v2H3zm4 4h2v2H7zm8 0h2v2h-2zm-4-4h2v2h-2zm0 8h2v2h-2zm0-4h2v2h-2zm10-8H3v2h18z" } }] })(t);
}
function Ir(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.928 11.607c-.202-.488-.635-.605-.928-.633V8c0-1.103-.897-2-2-2h-6V4.61c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5c-1.103 0-2 .897-2 2v2.997l-.082.006A1 1 0 0 0 1.99 12v2a1 1 0 0 0 1 1H3v5c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5a1 1 0 0 0 1-1v-1.938a1.006 1.006 0 0 0-.072-.455zM5 20V8h14l.001 3.996L19 12v2l.001.005.001 5.995H5z" } }, { tag: "ellipse", attr: { cx: "8.5", cy: "12", rx: "1.5", ry: "2" } }, { tag: "ellipse", attr: { cx: "15.5", cy: "12", rx: "1.5", ry: "2" } }, { tag: "path", attr: { d: "M8 16h8v2H8z" } }] })(t);
}
function Dr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "7.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "10.5", cy: "7.5", r: "1.5" } }, { tag: "circle", attr: { cx: "11.5", cy: "11.5", r: "1.5" } }] })(t);
}
function kr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4a2 2 0 0 0-2 2v2a2 2 0 0 0 1 1.72V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.72A2 2 0 0 0 22 7V5a2 2 0 0 0-2-2zM4 5h16v2H4zm1 14V9h14v10z" } }, { tag: "path", attr: { d: "M8 11h8v2H8z" } }] })(t);
}
function jr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 4V2H4v20h6v-2H6V4zm4 16v2h6V2h-6v2h4v16z" } }] })(t);
}
function Ur(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "4", cy: "7", r: "2" } }, { tag: "circle", attr: { cx: "9", cy: "12", r: "2" } }, { tag: "circle", attr: { cx: "15", cy: "7", r: "2" } }, { tag: "circle", attr: { cx: "15", cy: "12", r: "2" } }, { tag: "circle", attr: { cx: "15", cy: "17", r: "2" } }, { tag: "circle", attr: { cx: "20", cy: "7", r: "2" } }, { tag: "circle", attr: { cx: "4", cy: "17", r: "2" } }] })(t);
}
function Fr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.864 8.465a3.505 3.505 0 0 0-3.03-4.449A3.005 3.005 0 0 0 14 2a2.98 2.98 0 0 0-2 .78A2.98 2.98 0 0 0 10 2c-1.301 0-2.41.831-2.825 2.015a3.505 3.505 0 0 0-3.039 4.45A4.028 4.028 0 0 0 2 12c0 1.075.428 2.086 1.172 2.832A4.067 4.067 0 0 0 3 16c0 1.957 1.412 3.59 3.306 3.934A3.515 3.515 0 0 0 9.5 22c.979 0 1.864-.407 2.5-1.059A3.484 3.484 0 0 0 14.5 22a3.51 3.51 0 0 0 3.19-2.06 4.006 4.006 0 0 0 3.138-5.108A4.003 4.003 0 0 0 22 12a4.028 4.028 0 0 0-2.136-3.535zM9.5 20c-.711 0-1.33-.504-1.47-1.198L7.818 18H7c-1.103 0-2-.897-2-2 0-.352.085-.682.253-.981l.456-.816-.784-.51A2.019 2.019 0 0 1 4 12c0-.977.723-1.824 1.682-1.972l1.693-.26-1.059-1.346a1.502 1.502 0 0 1 1.498-2.39L9 6.207V5a1 1 0 0 1 2 0v13.5c0 .827-.673 1.5-1.5 1.5zm9.575-6.308-.784.51.456.816c.168.3.253.63.253.982 0 1.103-.897 2-2.05 2h-.818l-.162.802A1.502 1.502 0 0 1 14.5 20c-.827 0-1.5-.673-1.5-1.5V5c0-.552.448-1 1-1s1 .448 1 1.05v1.207l1.186-.225a1.502 1.502 0 0 1 1.498 2.39l-1.059 1.347 1.693.26A2.002 2.002 0 0 1 20 12c0 .683-.346 1.315-.925 1.692z" } }] })(t);
}
function qr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM4 8h16v4h-3v-2h-2v2H9v-2H7v2H4V8zm0 11v-5h3v2h2v-2h6v2h2v-2h3.001v5H4z" } }] })(t);
}
function Wr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-4 2v11H8V8h8zm-1-4v2H9V4h6zM4 8h2v11H4V8zm14 11V8h2l.001 11H18z" } }] })(t);
}
function Gr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM8 8h12v3H4V8h4zM4 19v-6h6v2h4v-2h6l.001 6H4z" } }] })(t);
}
function Xr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.707 11.293-2-2L19 8.586V6a1 1 0 0 0-1-1h-2.586l-.707-.707-2-2a.999.999 0 0 0-1.414 0l-2 2L8.586 5H6a1 1 0 0 0-1 1v2.586l-.707.707-2 2a.999.999 0 0 0 0 1.414l2 2 .707.707V18a1 1 0 0 0 1 1h2.586l.707.707 2 2a.997.997 0 0 0 1.414 0l2-2 .707-.707H18a1 1 0 0 0 1-1v-2.586l.707-.707 2-2a.999.999 0 0 0 0-1.414zm-4.414 3-.293.293V17h-2.414l-.293.293-1 1L12 19.586l-1.293-1.293-1-1L9.414 17H7v-2.414l-.293-.293-1-1L4.414 12l1.293-1.293 1-1L7 9.414V7h2.414l.293-.293 1-1L12 4.414l1.293 1.293 1 1 .293.293H17v2.414l.293.293 1 1L19.586 12l-1.293 1.293-1 1z" } }, { tag: "path", attr: { d: "M12 8v8c2.206 0 4-1.794 4-4s-1.794-4-4-4z" } }] })(t);
}
function Kr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.707 9.293 19 8.586V6a1 1 0 0 0-1-1h-2.586l-.707-.707-2-2a.999.999 0 0 0-1.414 0l-2 2L8.586 5H6a1 1 0 0 0-1 1v2.586l-.707.707-2 2a.999.999 0 0 0 0 1.414l2 2 .707.707V18a1 1 0 0 0 1 1h2.586l.707.707 2 2a.997.997 0 0 0 1.414 0l2-2 .707-.707H18a1 1 0 0 0 1-1v-2.586l.707-.707 2-2a.999.999 0 0 0 0-1.414l-2-2zm-2.414 5-.293.293V17h-2.414l-.293.293-1 1L12 19.586l-1.293-1.293-1-1L9.414 17H7v-2.414l-.293-.293-1-1L4.414 12l1.293-1.293 1-1L7 9.414V7h2.414l.293-.293 1-1L12 4.414l1.293 1.293 1 1 .293.293H17v2.414l.293.293 1 1L19.586 12l-1.293 1.293-1 1z" } }, { tag: "path", attr: { d: "M12 8c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z" } }] })(t);
}
function Yr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m19.707 4.293-1.414 1.414c2.733 2.733 2.733 7.353 0 10.086l1.414 1.414c3.5-3.5 3.5-9.414 0-12.914zm-4.414 4.414c.566.566.879 1.292.879 2.043s-.313 1.477-.879 2.043l1.414 1.414c.944-.943 1.465-2.172 1.465-3.457s-.521-2.514-1.465-3.457l-1.414 1.414zm-9.086-3L4.793 4.293c-3.5 3.5-3.5 9.414 0 12.914l1.414-1.414c-2.733-2.733-2.733-7.353 0-10.086z" } }, { tag: "path", attr: { d: "M7.293 7.293c-.944.943-1.465 2.172-1.465 3.457s.521 2.514 1.465 3.457l1.414-1.414c-.566-.566-.879-1.292-.879-2.043s.313-1.477.879-2.043L7.293 7.293zM14 10.5a2 2 0 0 0-4 0 1.993 1.993 0 0 0 .895 1.666L10.002 22h3.996l-.893-9.835c.54-.358.895-.97.895-1.665z" } }] })(t);
}
function Qr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 8.001h-4V4.999a2.92 2.92 0 0 0-.874-2.108 2.943 2.943 0 0 0-2.39-.879C10.202 2.144 9 3.508 9 5.117V8H5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-9.999c0-1.103-.897-2-2-2zM5 10h6V5.117c0-.57.407-1.07 1.002-1.117.266 0 .512.103.712.307a.956.956 0 0 1 .286.692V10h.995l.005.001h5V12H5v-2zm0 10v-6h14l.002 6H5z" } }] })(t);
}
function Jr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13.707 2.293a.999.999 0 0 0-1.414 0l-5.84 5.84c-.015-.001-.029-.009-.044-.009a.997.997 0 0 0-.707.293L4.288 9.831a2.985 2.985 0 0 0-.878 2.122c0 .802.313 1.556.879 2.121l.707.707-2.122 2.122A2.92 2.92 0 0 0 2 19.012a2.968 2.968 0 0 0 1.063 2.308c.519.439 1.188.68 1.885.68.834 0 1.654-.341 2.25-.937l2.04-2.039.707.706c1.134 1.133 3.109 1.134 4.242.001l1.415-1.414a.997.997 0 0 0 .293-.707c0-.026-.013-.05-.015-.076l5.827-5.827a.999.999 0 0 0 0-1.414l-8-8zm-.935 16.024a1.023 1.023 0 0 1-1.414-.001l-1.414-1.413a.999.999 0 0 0-1.414 0l-2.746 2.745a1.19 1.19 0 0 1-.836.352.91.91 0 0 1-.594-.208A.978.978 0 0 1 4 19.01a.959.959 0 0 1 .287-.692l2.829-2.829a.999.999 0 0 0 0-1.414L5.701 12.66a.99.99 0 0 1-.292-.706c0-.268.104-.519.293-.708l.707-.707 7.071 7.072-.708.706zm1.889-2.392L8.075 9.339 13 4.414 19.586 11l-4.925 4.925z" } }] })(t);
}
function Zr(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 9h6v2H9zm0 4h6v2H9z" } }, { tag: "path", attr: { d: "m18 5.414 1.707-1.707-1.414-1.414-1.563 1.562C15.483 2.708 13.824 2 12 2s-3.483.708-4.73 1.855L5.707 2.293 4.293 3.707 6 5.414A6.937 6.937 0 0 0 5 9H3v2h2v2H3v2h2c0 3.86 3.141 7 7 7s7-3.14 7-7h2v-2h-2v-2h2V9h-2a6.937 6.937 0 0 0-1-3.586zM17 13v2c0 2.757-2.243 5-5 5s-5-2.243-5-5V9c0-2.757 2.243-5 5-5s5 2.243 5 5v4z" } }] })(t);
}
function t5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m16.895 6.519 2.813-2.812-1.414-1.414-2.846 2.846a6.575 6.575 0 0 0-.723-.454 5.778 5.778 0 0 0-5.45 0c-.25.132-.488.287-.722.453L5.707 2.293 4.293 3.707l2.813 2.812A8.473 8.473 0 0 0 5.756 9H2v2h2.307c-.065.495-.107.997-.107 1.5 0 .507.042 1.013.107 1.511H2v2h2.753c.013.039.021.08.034.118.188.555.421 1.093.695 1.6.044.081.095.155.141.234l-2.33 2.33 1.414 1.414 2.11-2.111a7.477 7.477 0 0 0 2.068 1.619c.479.253.982.449 1.496.58a6.515 6.515 0 0 0 3.237.001 6.812 6.812 0 0 0 1.496-.58c.465-.246.914-.55 1.333-.904.258-.218.5-.462.734-.716l2.111 2.111 1.414-1.414-2.33-2.33c.047-.08.098-.155.142-.236.273-.505.507-1.043.694-1.599.013-.039.021-.079.034-.118H22v-2h-2.308c.065-.499.107-1.004.107-1.511 0-.503-.042-1.005-.106-1.5H22V9h-3.756a8.494 8.494 0 0 0-1.349-2.481zM8.681 7.748c.445-.558.96-.993 1.528-1.294a3.773 3.773 0 0 1 3.581 0 4.894 4.894 0 0 1 1.53 1.295c.299.373.54.8.753 1.251H7.927c.214-.451.454-.879.754-1.252zM17.8 12.5c0 .522-.042 1.044-.126 1.553-.079.49-.199.973-.355 1.436a8.28 8.28 0 0 1-.559 1.288 7.59 7.59 0 0 1-.733 1.11c-.267.333-.56.636-.869.898-.31.261-.639.484-.979.664s-.695.317-1.057.41c-.04.01-.082.014-.122.023V14h-2v5.881c-.04-.009-.082-.013-.122-.023-.361-.093-.717-.23-1.057-.41s-.669-.403-.978-.664a6.462 6.462 0 0 1-.871-.899 7.402 7.402 0 0 1-.731-1.108 8.337 8.337 0 0 1-.56-1.289 9.075 9.075 0 0 1-.356-1.438A9.61 9.61 0 0 1 6.319 11H17.68c.079.491.12.995.12 1.5z" } }] })(t);
}
function e5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z" } }, { tag: "path", attr: { d: "M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z" } }] })(t);
}
function a5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 2H6c-1.103 0-2 .897-2 2v17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm0 18H6V4h12v16z" } }, { tag: "path", attr: { d: "M8 6h3v2H8zm5 0h3v2h-3zm-5 4h3v2H8zm5 .031h3V12h-3zM8 14h3v2H8zm5 0h3v2h-3z" } }] })(t);
}
function r5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 2H9c-1.103 0-2 .897-2 2v6H5c-1.103 0-2 .897-2 2v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zM5 12h6v8H5v-8zm14 8h-6v-8c0-1.103-.897-2-2-2H9V4h10v16z" } }, { tag: "path", attr: { d: "M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 .001h2v2H7z" } }] })(t);
}
function n5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 20h6v2H9zm7.906-6.288C17.936 12.506 19 11.259 19 9c0-3.859-3.141-7-7-7S5 5.141 5 9c0 2.285 1.067 3.528 2.101 4.73.358.418.729.851 1.084 1.349.144.206.38.996.591 1.921H8v2h8v-2h-.774c.213-.927.45-1.719.593-1.925.352-.503.726-.94 1.087-1.363zm-2.724.213c-.434.617-.796 2.075-1.006 3.075h-2.351c-.209-1.002-.572-2.463-1.011-3.08a20.502 20.502 0 0 0-1.196-1.492C7.644 11.294 7 10.544 7 9c0-2.757 2.243-5 5-5s5 2.243 5 5c0 1.521-.643 2.274-1.615 3.413-.373.438-.796.933-1.203 1.512z" } }] })(t);
}
function c5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" } }, { tag: "path", attr: { d: "M12 2C6.579 2 2 6.579 2 12s4.579 10 10 10 10-4.579 10-10S17.421 2 12 2zm0 18c-4.337 0-8-3.663-8-8s3.663-8 8-8 8 3.663 8 8-3.663 8-8 8z" } }, { tag: "path", attr: { d: "M12 10c-1.081 0-2 .919-2 2s.919 2 2 2 2-.919 2-2-.919-2-2-2z" } }] })(t);
}
function i5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.411 7H16v.031A5.037 5.037 0 0 0 14.969 8H15V4.589A8.039 8.039 0 0 1 19.411 9zM12 15c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm1-10.931v3.032a4.988 4.988 0 0 0-2 0V4.069c.328-.041.66-.069 1-.069s.672.028 1 .069zm-4 .52V8h.031A5.037 5.037 0 0 0 8 9.031V9H4.589C5.402 7 6.999 5.402 9 4.589zM4.069 11h3.032a4.995 4.995 0 0 0 .001 2H4.069C4.028 12.672 4 12.339 4 12s.028-.672.069-1zm.52 4H8v-.031c.284.381.621.718 1 1.005v3.437A8.039 8.039 0 0 1 4.589 15zM11 19.931v-3.032a4.988 4.988 0 0 0 2 0v3.032c-.328.041-.66.069-1 .069s-.672-.028-1-.069zm4-.52v-3.437a5.038 5.038 0 0 0 1-1.005V15h3.411A8.039 8.039 0 0 1 15 19.411zM19.931 13h-3.032a4.995 4.995 0 0 0-.001-2h3.032c.042.328.07.661.07 1s-.028.672-.069 1z" } }] })(t);
}
function l5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.259 11.948A.986.986 0 0 0 22 11V8a.999.999 0 0 0-.996-.999V6H21c0-2.206-1.794-4-4-4H7C4.794 2 3 3.794 3 6v1a1 1 0 0 0-1 1v3c0 .461.317.832.742.948a3.953 3.953 0 0 0-.741 2.298l.004 3.757c.001.733.404 1.369.995 1.716V21a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.274a2.02 2.02 0 0 0 .421-.313c.377-.378.585-.881.584-1.415l-.004-3.759a3.966 3.966 0 0 0-.742-2.291zM5 18h-.995l-.004-3.757c-.001-.459.161-.89.443-1.243h15.111c.283.353.445.783.446 1.242L20.006 18H5zm6.004-10v3H5V8h6.004zM19 11h-5.996V8H19v3zM7 4h10c1.103 0 2 .897 2 2h-4V5H9v1H5c0-1.103.897-2 2-2z" } }, { tag: "circle", attr: { cx: "6.5", cy: "15.5", r: "1.5" } }, { tag: "circle", attr: { cx: "17.5", cy: "15.5", r: "1.5" } }] })(t);
}
function o5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.004 7.975V6c0-2.206-1.794-4-4-4h-10c-2.206 0-4 1.794-4 4v1.998l-.076.004A1 1 0 0 0 2 9v2a1 1 0 0 0 1 1h.004v6c0 .735.403 1.372.996 1.72V21a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h10v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.276A1.994 1.994 0 0 0 21.004 18v-6a1 1 0 0 0 1-1V9.062a1.006 1.006 0 0 0-.072-.455c-.203-.487-.635-.604-.928-.632zM19.006 18H5.004v-5h14.001l.001 5zM11.004 7v4h-6V7h6zm8 0v4h-6V7h6zm-12-3h10c.736 0 1.375.405 1.722 1H5.282c.347-.595.986-1 1.722-1z" } }, { tag: "circle", attr: { cx: "7.5", cy: "15.5", r: "1.5" } }, { tag: "circle", attr: { cx: "16.5", cy: "15.5", r: "1.5" } }] })(t);
}
function h5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 4c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V4zM5 4h14v7H5V4zm0 16v-7h14.001v7H5z" } }, { tag: "path", attr: { d: "M14 7h-4V6H8v3h8V6h-2zm0 8v1h-4v-1H8v3h8v-3z" } }] })(t);
}
function s5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 5h-6V2h-2v3H5C3.346 5 2 6.346 2 8v10c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.654-1.346-3-3-3zM5 7h14a1 1 0 0 1 1 1l.001 3.12c-.896.228-1.469.734-1.916 1.132-.507.45-.842.748-1.588.748-.745 0-1.08-.298-1.587-.747-.595-.529-1.409-1.253-2.915-1.253-1.505 0-2.319.724-2.914 1.253-.507.45-.841.747-1.586.747-.743 0-1.077-.297-1.582-.747-.447-.398-1.018-.905-1.913-1.133V8a1 1 0 0 1 1-1zM4 18v-4.714c.191.123.374.274.583.461C5.178 14.276 5.991 15 7.495 15c1.505 0 2.319-.724 2.914-1.253.507-.45.841-.747 1.586-.747s1.08.298 1.587.747c.595.529 1.409 1.253 2.915 1.253s2.321-.724 2.916-1.253c.211-.188.395-.34.588-.464L20.002 18H4z" } }] })(t);
}
function v5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 2H5c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM5 20V4h14l.001 16H5z" } }, { tag: "path", attr: { d: "M7 12h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zM7 6h10v4H7zm4 10h2v2h-2zm4-4h2v6h-2z" } }] })(t);
}
function u5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7v2H5a2 2 0 0 0-2 2zm16 14H5V8h14z" } }] })(t);
}
function d5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.002 16H5V8h14l.002 12z" } }, { tag: "path", attr: { d: "m11 17.414 5.707-5.707-1.414-1.414L11 14.586l-2.293-2.293-1.414 1.414z" } }] })(t);
}
function g5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V7h14V6l.002 14H5z" } }, { tag: "path", attr: { d: "m15.628 12.183-1.8-1.799 1.37-1.371 1.8 1.799zm-7.623 4.018V18h1.799l4.976-4.97-1.799-1.799z" } }] })(t);
}
function f5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 12h6v6h-6z" } }, { tag: "path", attr: { d: "M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.001 16H5V8h14l.001 12z" } }] })(t);
}
function p5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.002 16H5V8h14l.002 12z" } }, { tag: "path", attr: { d: "M11 10h2v5h-2zm0 6h2v2h-2z" } }] })(t);
}
function z5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.648 14.711 11.997 18l3.35-3.289a2.129 2.129 0 0 0 0-3.069 2.225 2.225 0 0 0-3.126 0l-.224.219-.224-.219a2.224 2.224 0 0 0-3.125 0 2.129 2.129 0 0 0 0 3.069z" } }, { tag: "path", attr: { d: "M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.002 16H5V8h14l.002 12z" } }] })(t);
}
function m5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 13h8v2H8z" } }, { tag: "path", attr: { d: "M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.002 16H5V8h14l.002 12z" } }] })(t);
}
function M5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 15h3v3h2v-3h3v-2h-3v-3h-2v3H8z" } }, { tag: "path", attr: { d: "M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.002 16H5V8h14l.002 12z" } }] })(t);
}
function B5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m9.981 14.811-.467 2.726 2.449-1.287 2.449 1.287-.468-2.726 1.982-1.932-2.738-.398L11.963 10l-1.225 2.481L8 12.879z" } }, { tag: "path", attr: { d: "M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.002 16H5V8h14l.002 12z" } }] })(t);
}
function H5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V7h14V6l.002 14H5z" } }, { tag: "path", attr: { d: "M7 10v2h10V9H7z" } }] })(t);
}
function w5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m8.293 16.293 1.414 1.414L12 15.414l2.293 2.293 1.414-1.414L13.414 14l2.293-2.293-1.414-1.414L12 12.586l-2.293-2.293-1.414 1.414L10.586 14z" } }, { tag: "path", attr: { d: "M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.002 16H5V8h14l.002 12z" } }] })(t);
}
function x5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z" } }, { tag: "path", attr: { d: "M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z" } }] })(t);
}
function V5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.125 2H5.875A1.877 1.877 0 0 0 4 3.875v12.25C4 17.159 4.841 18 5.875 18H11v2H7v2h10v-2h-4v-2h5.125A1.877 1.877 0 0 0 20 16.125V3.875A1.877 1.877 0 0 0 18.125 2zM18 16H6V4h12v12z" } }, { tag: "path", attr: { d: "M12 14c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z" } }] })(t);
}
function y5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 11c0-.959-.68-1.761-1.581-1.954C16.779 8.445 17 7.75 17 7c0-2.206-1.794-4-4-4-1.517 0-2.821.857-3.5 2.104C8.821 3.857 7.517 3 6 3 3.794 3 2 4.794 2 7c0 .902.312 1.727.817 2.396A1.994 1.994 0 0 0 2 11v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-2.638l4 2v-7l-4 2V11zm-5-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zM6 5c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zM4 19v-8h12l.002 8H4z" } }] })(t);
}
function C5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.014 12.135c.074 2.062 1.789 3.777 3.851 3.851l-3.851-3.851z" } }, { tag: "path", attr: { d: "M4 20h11.879l-2-2H4V8.121L2.144 6.265A1.976 1.976 0 0 0 2 7v11c0 1.103.897 2 2 2zM20 5h-2.586l-2.707-2.707A.996.996 0 0 0 14 2h-4a.997.997 0 0 0-.707.293L6.586 5h-.172L3.707 2.293 2.293 3.707l18 18 1.414-1.414-.626-.626A1.98 1.98 0 0 0 22 18V7c0-1.103-.897-2-2-2zm-6.081 7.505-2.424-2.425c.163-.046.331-.08.505-.08 1.065 0 2 .935 2 2 0 .174-.033.342-.081.505zm1.502 1.501A3.881 3.881 0 0 0 16 12c0-2.168-1.832-4-4-4-.729 0-1.412.22-2.007.579L7.914 6.5l2.5-2.5h3.172l2.707 2.707A.996.996 0 0 0 17 7l3-.001V18h-.586l-3.993-3.994z" } }] })(t);
}
function L5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 8c-2.168 0-4 1.832-4 4s1.832 4 4 4 4-1.832 4-4-1.832-4-4-4zm0 6c-1.065 0-2-.935-2-2s.935-2 2-2 2 .935 2 2-.935 2-2 2z" } }, { tag: "path", attr: { d: "M20 5h-2.586l-2.707-2.707A.996.996 0 0 0 14 2h-4a.996.996 0 0 0-.707.293L6.586 5H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM4 18V7h3c.266 0 .52-.105.707-.293L10.414 4h3.172l2.707 2.707A.996.996 0 0 0 17 7h3l.002 11H4z" } }] })(t);
}
function _5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.999 20.133a4.969 4.969 0 0 0 3.536-1.465l7.134-7.133a5.007 5.007 0 0 0-.001-7.072C18.723 3.52 17.467 3 16.132 3s-2.591.52-3.534 1.464l-7.134 7.134a5.009 5.009 0 0 0 0 7.072 4.97 4.97 0 0 0 3.535 1.463zm5.013-14.255A2.979 2.979 0 0 1 16.132 5c.802 0 1.556.313 2.122.878a3.004 3.004 0 0 1 .001 4.243l-2.893 2.892L11.12 8.77l2.892-2.892zm-7.134 7.134 2.828-2.828 4.242 4.243-2.827 2.827c-1.133 1.133-3.11 1.132-4.243.001a3.005 3.005 0 0 1 0-4.243z" } }] })(t);
}
function A5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 10v4c0 1.103.897 2 2 2h3v-2H8v-4h3V8H8c-1.103 0-2 .897-2 2zm7 0v4c0 1.103.897 2 2 2h3v-2h-3v-4h3V8h-3c-1.103 0-2 .897-2 2z" } }, { tag: "path", attr: { d: "M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V6h16l.002 12H4z" } }] })(t);
}
function b5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.772 10.156-1.368-4.105A2.995 2.995 0 0 0 16.559 4H7.441a2.995 2.995 0 0 0-2.845 2.051l-1.368 4.105A2.003 2.003 0 0 0 2 12v5c0 .753.423 1.402 1.039 1.743-.013.066-.039.126-.039.195V21a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2h12v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2.062c0-.069-.026-.13-.039-.195A1.993 1.993 0 0 0 22 17v-5c0-.829-.508-1.541-1.228-1.844zM4 17v-5h16l.002 5H4zM7.441 6h9.117c.431 0 .813.274.949.684L18.613 10H5.387l1.105-3.316A1 1 0 0 1 7.441 6z" } }, { tag: "circle", attr: { cx: "6.5", cy: "14.5", r: "1.5" } }, { tag: "circle", attr: { cx: "17.5", cy: "14.5", r: "1.5" } }] })(t);
}
function P5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.999 17c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-12c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h12zm-12-12h12l.002 10H5.999V5zm-2 14h16v2h-16z" } }] })(t);
}
function S5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12 16 5-6H7z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function E5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12 16 5-6H7z" } }, { tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }] })(t);
}
function R5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m11.998 17 7-8h-14z" } }] })(t);
}
function T5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14 17V7l-6 5z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function O5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14 17V7l-6 5z" } }, { tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }] })(t);
}
function N5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15 19V5l-8 7z" } }] })(t);
}
function $5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m10 17 6-5-6-5z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function I5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m10 17 6-5-6-5z" } }, { tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }] })(t);
}
function D5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m9 19 8-7-8-7z" } }] })(t);
}
function k5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 14h10l-5-6z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function j5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 14h10l-5-6z" } }, { tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }] })(t);
}
function U5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 15h14l-7-8z" } }] })(t);
}
function F5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 19h2c0 1.103.897 2 2 2h8c1.103 0 2-.897 2-2h2c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2h-2c0-1.103-.897-2-2-2H8c-1.103 0-2 .897-2 2H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2zM20 7v10h-2V7h2zM8 5h8l.001 14H8V5zM4 7h2v10H4V7z" } }] })(t);
}
function q5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 4H2v2h2.3l3.28 9a3 3 0 0 0 2.82 2H19v-2h-8.6a1 1 0 0 1-.94-.66L9 13h9.28a2 2 0 0 0 1.92-1.45L22 5.27A1 1 0 0 0 21.27 4 .84.84 0 0 0 21 4zm-2.75 7h-10L6.43 6h13.24z" } }, { tag: "circle", attr: { cx: "10.5", cy: "19.5", r: "1.5" } }, { tag: "circle", attr: { cx: "16.5", cy: "19.5", r: "1.5" } }] })(t);
}
function W5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.822 7.431A1 1 0 0 0 21 7H7.333L6.179 4.23A1.994 1.994 0 0 0 4.333 3H2v2h2.333l4.744 11.385A1 1 0 0 0 10 17h8c.417 0 .79-.259.937-.648l3-8a1 1 0 0 0-.115-.921zM17.307 15h-6.64l-2.5-6h11.39l-2.25 6z" } }, { tag: "circle", attr: { cx: "10.5", cy: "19.5", r: "1.5" } }, { tag: "circle", attr: { cx: "17.5", cy: "19.5", r: "1.5" } }] })(t);
}
function G5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 21.001h2C13 14.935 8.065 10 2 10v2c4.962 0 9 4.038 9 9.001z" } }, { tag: "path", attr: { d: "M7 21.001h2C9 17.141 5.86 14 2 14v2c2.757 0 5 2.243 5 5.001z" } }, { tag: "circle", attr: { cx: "3.5", cy: "19.5", r: "1.5" } }, { tag: "path", attr: { d: "M20 4H4c-1.103 0-2 .897-2 2v2.052c.68.025 1.349.094 2 .217V6h16v13h-5.269c.123.651.191 1.32.217 2H20c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2z" } }] })(t);
}
function X5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11 4h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-4v-4h4v4zM17 3c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zM7 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" } }] })(t);
}
function K5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11-6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 6h-4V5h4v4zm-9 4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6H5v-4h4v4zm8-6c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" } }] })(t);
}
function Y5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.916 9.564a.998.998 0 0 0-.513-1.316L7.328 2.492c-.995-.438-2.22.051-2.645 1.042l-2.21 5.154a2.001 2.001 0 0 0 1.052 2.624L9.563 13.9 8.323 17H4v-3H2v8h2v-3h4.323c.823 0 1.552-.494 1.856-1.258l1.222-3.054 5.205 2.23a1 1 0 0 0 1.31-.517l.312-.71 1.701.68 2-5-1.536-.613.523-1.194zm-4.434 5.126L4.313 9.475l2.208-5.152 12.162 5.354-2.201 5.013z" } }] })(t);
}
function Q5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M2.06 14.68a1 1 0 0 0 .46.6l1.91 1.11v2.2a1 1 0 0 0 1 1h2.2l1.11 1.91a1 1 0 0 0 .86.5 1 1 0 0 0 .51-.14l1.9-1.1 1.91 1.1a1 1 0 0 0 1.37-.36l1.1-1.91h2.2a1 1 0 0 0 1-1v-2.2l1.91-1.11a1 1 0 0 0 .37-1.36L20.76 12l1.11-1.91a1 1 0 0 0-.37-1.36l-1.91-1.1v-2.2a1 1 0 0 0-1-1h-2.2l-1.1-1.91a1 1 0 0 0-.61-.46 1 1 0 0 0-.76.1L12 3.26l-1.9-1.1a1 1 0 0 0-1.36.36L7.63 4.43h-2.2a1 1 0 0 0-1 1v2.2l-1.9 1.1a1 1 0 0 0-.37 1.37l1.1 1.9-1.1 1.91a1 1 0 0 0-.1.77zm3.22-3.17L4.39 10l1.55-.9a1 1 0 0 0 .49-.86V6.43h1.78a1 1 0 0 0 .87-.5L10 4.39l1.54.89a1 1 0 0 0 1 0l1.55-.89.91 1.54a1 1 0 0 0 .87.5h1.77v1.78a1 1 0 0 0 .5.86l1.54.9-.89 1.54a1 1 0 0 0 0 1l.89 1.54-1.54.9a1 1 0 0 0-.5.86v1.78h-1.83a1 1 0 0 0-.86.5l-.89 1.54-1.55-.89a1 1 0 0 0-1 0l-1.51.89-.89-1.54a1 1 0 0 0-.87-.5H6.43v-1.78a1 1 0 0 0-.49-.81l-1.55-.9.89-1.54a1 1 0 0 0 0-1.05z" } }] })(t);
}
function J5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 13V4c0-1.103-.897-2-2-2H7c-1.103 0-2 .897-2 2v9a1 1 0 0 0-1 1v8h2v-5h12v5h2v-8a1 1 0 0 0-1-1zm-2-9v9h-2V4h2zm-4 0v9h-2V4h2zM7 4h2v9H7V4z" } }] })(t);
}
function Z5(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h4l-1.8 2.4 1.6 1.2 2.7-3.6h3l2.7 3.6 1.6-1.2L16 18h4c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 16V5h16l.001 11H4z" } }, { tag: "path", attr: { d: "M6 12h4v2H6z" } }] })(t);
}
function t8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM5 5h14l.001 14H5V5z" } }, { tag: "path", attr: { d: "m13.553 11.658-4-2-2.448 4.895 1.79.894 1.552-3.105 4 2 2.448-4.895-1.79-.894z" } }] })(t);
}
function e8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 18v3.766l1.515-.909L11.277 18H16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h1zM4 8h12v8h-5.277L7 18.234V16H4V8z" } }, { tag: "path", attr: { d: "M20 2H8c-1.103 0-2 .897-2 2h12c1.103 0 2 .897 2 2v8c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2z" } }] })(t);
}
function a8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M9.999 13.587 7.7 11.292l-1.412 1.416 3.713 3.705 6.706-6.706-1.414-1.414z" } }] })(t);
}
function r8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m2.394 13.742 4.743 3.62 7.616-8.704-1.506-1.316-6.384 7.296-3.257-2.486zm19.359-5.084-1.506-1.316-6.369 7.279-.753-.602-1.25 1.562 2.247 1.798z" } }] })(t);
}
function n8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.995 6.9a.998.998 0 0 0-.548-.795l-8-4a1 1 0 0 0-.895 0l-8 4a1.002 1.002 0 0 0-.547.795c-.011.107-.961 10.767 8.589 15.014a.987.987 0 0 0 .812 0c9.55-4.247 8.6-14.906 8.589-15.014zM12 19.897C5.231 16.625 4.911 9.642 4.966 7.635L12 4.118l7.029 3.515c.037 1.989-.328 9.018-7.029 12.264z" } }, { tag: "path", attr: { d: "m11 12.586-2.293-2.293-1.414 1.414L11 15.414l5.707-5.707-1.414-1.414z" } }] })(t);
}
function c8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m10.933 13.519-2.226-2.226-1.414 1.414 3.774 3.774 5.702-6.84-1.538-1.282z" } }, { tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }] })(t);
}
function i8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z" } }] })(t);
}
function l8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2H7zm0 12V7h10l.002 10H7z" } }, { tag: "path", attr: { d: "M10.996 12.556 9.7 11.285l-1.4 1.43 2.704 2.647 4.699-4.651-1.406-1.422z" } }] })(t);
}
function o8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9.01 11h6v2h-6z" } }, { tag: "path", attr: { d: "M17 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM7 17V7h10v10z" } }] })(t);
}
function h8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 9h6v6H9z" } }, { tag: "path", attr: { d: "M19 17V7c0-1.103-.897-2-2-2H7c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2zM7 7h10l.002 10H7V7z" } }] })(t);
}
function s8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2H7zm0 12V7h10l.002 10H7z" } }] })(t);
}
function v8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707-1.414-1.414z" } }] })(t);
}
function u8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM5 5h14l.001 14H5V5z" } }, { tag: "path", attr: { d: "M12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707-1.414-1.414z" } }] })(t);
}
function d8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z" } }] })(t);
}
function g8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" } }] })(t);
}
function f8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM5 5h14l.001 14H5V5z" } }, { tag: "path", attr: { d: "M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" } }] })(t);
}
function p8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" } }] })(t);
}
function z8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M9.293 7.707 13.586 12l-4.293 4.293 1.414 1.414L16.414 12l-5.707-5.707z" } }] })(t);
}
function m8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM5 5h14l.001 14H5V5z" } }, { tag: "path", attr: { d: "M9.293 7.707 13.586 12l-4.293 4.293 1.414 1.414L16.414 12l-5.707-5.707z" } }] })(t);
}
function $4(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z" } }] })(t);
}
function M8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z" } }] })(t);
}
function B8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 21h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM5 5h14l.001 14H5V5z" } }, { tag: "path", attr: { d: "m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z" } }] })(t);
}
function H8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z" } }] })(t);
}
function w8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12 15.586-4.293-4.293-1.414 1.414L12 18.414l5.707-5.707-1.414-1.414z" } }, { tag: "path", attr: { d: "m17.707 7.707-1.414-1.414L12 10.586 7.707 6.293 6.293 7.707 12 13.414z" } }] })(t);
}
function x8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12.707 7.707-1.414-1.414L5.586 12l5.707 5.707 1.414-1.414L8.414 12z" } }, { tag: "path", attr: { d: "M16.293 6.293 10.586 12l5.707 5.707 1.414-1.414L13.414 12l4.293-4.293z" } }] })(t);
}
function V8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10.296 7.71 14.621 12l-4.325 4.29 1.408 1.42L17.461 12l-5.757-5.71z" } }, { tag: "path", attr: { d: "M6.704 6.29 5.296 7.71 9.621 12l-4.325 4.29 1.408 1.42L12.461 12z" } }] })(t);
}
function y8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m6.293 11.293 1.414 1.414L12 8.414l4.293 4.293 1.414-1.414L12 5.586z" } }, { tag: "path", attr: { d: "m6.293 16.293 1.414 1.414L12 13.414l4.293 4.293 1.414-1.414L12 10.586z" } }] })(t);
}
function C8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 9h6v6H9z" } }, { tag: "path", attr: { d: "M20 6c0-1.103-.897-2-2-2h-2V2h-2v2h-4V2H8v2H6c-1.103 0-2 .897-2 2v2H2v2h2v4H2v2h2v2c0 1.103.897 2 2 2h2v2h2v-2h4v2h2v-2h2c1.103 0 2-.897 2-2v-2h2v-2h-2v-4h2V8h-2V6zM6 18V6h12l.002 12H6z" } }] })(t);
}
function L8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.447 14.105 18 12.382V12a1 1 0 0 0-.485-.857L13 8.434V6h2V4h-2V2h-2v2H9v2h2v2.434l-4.515 2.709A1 1 0 0 0 6 12v.382l-3.447 1.724A.998.998 0 0 0 2 15v6a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-6c0-.379-.214-.725-.553-.895zM4 15.618l2-1V20H4v-4.382zM12 15a2 2 0 0 0-2 2v3H8v-7.434l4-2.4 4 2.4V20h-2v-3a2 2 0 0 0-2-2zm8 5h-2v-5.382l2 1V20z" } }] })(t);
}
function _8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12c.001 5.515 4.487 10.001 10 10.001 5.514 0 10-4.486 10.001-10.001 0-5.514-4.486-10-10.001-10zm0 18.001c-4.41 0-7.999-3.589-8-8.001 0-4.411 3.589-8 8-8 4.412 0 8.001 3.589 8.001 8-.001 4.412-3.59 8.001-8.001 8.001z" } }] })(t);
}
function A8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12.707 2.293a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a.999.999 0 0 0 .707-1.707l-9-9zM18.001 20H6v-9.586l6-6 6 6V15l.001 5z" } }, { tag: "path", attr: { d: "M13 10h-2v3H8v2h3v3h2v-3h3v-2h-3z" } }] })(t);
}
function b8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3h-2.25a1 1 0 0 0-1-1h-7.5a1 1 0 0 0-1 1H5c-1.103 0-2 .897-2 2v15c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm0 17H5V5h2v2h10V5h2v15z" } }] })(t);
}
function P8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 10.551v-.678A4.005 4.005 0 0 0 16 6c0-2.206-1.794-4-4-4S8 3.794 8 6h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2a1 1 0 0 0-1 1v1.551l-8.665 7.702A1.001 1.001 0 0 0 3 20h18a1.001 1.001 0 0 0 .664-1.748L13 10.551zM5.63 18 12 12.338 18.37 18H5.63z" } }] })(t);
}
function S8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.948 11.112C18.511 7.67 15.563 5 12.004 5c-2.756 0-5.15 1.611-6.243 4.15-2.148.642-3.757 2.67-3.757 4.85 0 2.757 2.243 5 5 5h1v-2h-1c-1.654 0-3-1.346-3-3 0-1.404 1.199-2.757 2.673-3.016l.581-.102.192-.558C8.153 8.273 9.898 7 12.004 7c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-2v2h2c2.206 0 4-1.794 4-4a4.008 4.008 0 0 0-3.056-3.888z" } }, { tag: "path", attr: { d: "M13.004 14v-4h-2v4h-3l4 5 4-5z" } }] })(t);
}
function E8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 13h2v3H8zm0 4h2v3H8zm3-2h2v3h-2zm0 4h2v3h-2zm3-6h2v3h-2zm0 4h2v3h-2z" } }, { tag: "path", attr: { d: "M18.944 10.112C18.507 6.67 15.56 4 12 4 9.245 4 6.85 5.611 5.757 8.15 3.609 8.792 2 10.819 2 13c0 2.757 2.243 5 5 5v-2c-1.654 0-3-1.346-3-3 0-1.403 1.199-2.756 2.673-3.015l.582-.103.191-.559C8.149 7.273 9.895 6 12 6c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-1v2h1c2.206 0 4-1.794 4-4a4.008 4.008 0 0 0-3.056-3.888z" } }] })(t);
}
function R8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 13h2v4H8zm0 5h2v2H8zm3-3h2v4h-2zm0 5h2v2h-2zm3-7h2v4h-2zm0 5h2v2h-2z" } }, { tag: "path", attr: { d: "M18.944 10.112C18.507 6.67 15.56 4 12 4 9.244 4 6.85 5.611 5.757 8.15 3.609 8.792 2 10.819 2 13c0 2.757 2.243 5 5 5v-2c-1.654 0-3-1.346-3-3 0-1.403 1.199-2.756 2.673-3.015l.581-.103.192-.559C8.149 7.273 9.895 6 12 6c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-1v2h1c2.206 0 4-1.794 4-4a4.008 4.008 0 0 0-3.056-3.888z" } }] })(t);
}
function T8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m10 13-1 5h2v4l3.975-6H13l1-3z" } }, { tag: "path", attr: { d: "M18.944 10.112C18.507 6.67 15.56 4 12 4 9.244 4 6.85 5.611 5.757 8.15 3.609 8.792 2 10.819 2 13c0 2.757 2.243 5 5 5v-2c-1.654 0-3-1.346-3-3 0-1.403 1.199-2.756 2.673-3.015l.581-.103.192-.559C8.149 7.273 9.895 6 12 6c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-1v2h1c2.206 0 4-1.794 4-4a4.008 4.008 0 0 0-3.056-3.888z" } }] })(t);
}
function O8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 13h2v7H8zm3 2h2v7h-2zm3-2h2v7h-2z" } }, { tag: "path", attr: { d: "M18.944 10.113C18.507 6.671 15.56 4.001 12 4.001c-2.756 0-5.15 1.611-6.243 4.15C3.609 8.793 2 10.82 2 13.001c0 2.757 2.243 5 5 5v-2c-1.654 0-3-1.346-3-3 0-1.403 1.199-2.756 2.673-3.015l.581-.103.192-.559C8.149 7.274 9.895 6.001 12 6.001c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-1v2h1c2.206 0 4-1.794 4-4a4.008 4.008 0 0 0-3.056-3.888z" } }] })(t);
}
function N8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.944 10.112C18.507 6.67 15.56 4 12 4 9.244 4 6.85 5.611 5.757 8.15 3.609 8.792 2 10.819 2 13c0 2.757 2.243 5 5 5v-2c-1.654 0-3-1.346-3-3 0-1.403 1.199-2.756 2.673-3.015l.581-.103.192-.559C8.149 7.273 9.895 6 12 6c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-1v2h1c2.206 0 4-1.794 4-4a4.008 4.008 0 0 0-3.056-3.888z" } }, { tag: "circle", attr: { cx: "15", cy: "16", r: "1" } }, { tag: "circle", attr: { cx: "15", cy: "19", r: "1" } }, { tag: "circle", attr: { cx: "12", cy: "18", r: "1" } }, { tag: "circle", attr: { cx: "12", cy: "21", r: "1" } }, { tag: "circle", attr: { cx: "9", cy: "19", r: "1" } }, { tag: "circle", attr: { cx: "9", cy: "16", r: "1" } }] })(t);
}
function $8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 19v-4h3l-4-5-4 5h3v4z" } }, { tag: "path", attr: { d: "M7 19h2v-2H7c-1.654 0-3-1.346-3-3 0-1.404 1.199-2.756 2.673-3.015l.581-.102.192-.558C8.149 8.274 9.895 7 12 7c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2h-3v2h3c2.206 0 4-1.794 4-4a4.01 4.01 0 0 0-3.056-3.888C18.507 7.67 15.56 5 12 5 9.244 5 6.85 6.611 5.757 9.15 3.609 9.792 2 11.82 2 14c0 2.757 2.243 5 5 5z" } }] })(t);
}
function I8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.944 11.112C18.507 7.67 15.56 5 12 5 9.244 5 6.85 6.611 5.757 9.15 3.609 9.792 2 11.82 2 14c0 2.757 2.243 5 5 5h11c2.206 0 4-1.794 4-4a4.01 4.01 0 0 0-3.056-3.888zM18 17H7c-1.654 0-3-1.346-3-3 0-1.404 1.199-2.756 2.673-3.015l.581-.102.192-.558C8.149 8.274 9.895 7 12 7c2.757 0 5 2.243 5 5v1h1c1.103 0 2 .897 2 2s-.897 2-2 2z" } }] })(t);
}
function D8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m7.375 16.781 1.25-1.562L4.601 12l4.024-3.219-1.25-1.562-5 4a1 1 0 0 0 0 1.562l5 4zm9.25-9.562-1.25 1.562L19.399 12l-4.024 3.219 1.25 1.562 5-4a1 1 0 0 0 0-1.562l-5-4zm-1.649-4.003-4 18-1.953-.434 4-18z" } }] })(t);
}
function k8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V7h16l.002 12H4z" } }, { tag: "path", attr: { d: "M9.293 9.293 5.586 13l3.707 3.707 1.414-1.414L8.414 13l2.293-2.293zm5.414 0-1.414 1.414L15.586 13l-2.293 2.293 1.414 1.414L18.414 13z" } }] })(t);
}
function j8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 22h1v-2h-.989C8.703 19.994 6 19.827 6 16c0-1.993-.665-3.246-1.502-4C5.335 11.246 6 9.993 6 8c0-3.827 2.703-3.994 3-4h1V2H8.998C7.269 2.004 4 3.264 4 8c0 2.8-1.678 2.99-2.014 3L2 13c.082 0 2 .034 2 3 0 4.736 3.269 5.996 5 6zm13-11c-.082 0-2-.034-2-3 0-4.736-3.269-5.996-5-6h-1v2h.989c.308.006 3.011.173 3.011 4 0 1.993.665 3.246 1.502 4-.837.754-1.502 2.007-1.502 4 0 3.827-2.703 3.994-3 4h-1v2h1.002C16.731 21.996 20 20.736 20 16c0-2.8 1.678-2.99 2.014-3L22 11z" } }] })(t);
}
function U8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.293 6.293 2.586 12l5.707 5.707 1.414-1.414L5.414 12l4.293-4.293zm7.414 11.414L21.414 12l-5.707-5.707-1.414 1.414L18.586 12l-4.293 4.293z" } }] })(t);
}
function F8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 22h10a1 1 0 0 0 .99-.858L19.867 8H21V6h-1.382l-1.724-3.447A.998.998 0 0 0 17 2H7c-.379 0-.725.214-.895.553L4.382 6H3v2h1.133L6.01 21.142A1 1 0 0 0 7 22zm10.418-11H6.582l-.429-3h11.693l-.428 3zm-9.551 9-.429-3h9.123l-.429 3H7.867zM7.618 4h8.764l1 2H6.618l1-2z" } }] })(t);
}
function q8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 2h2v3H5zm4 0h2v3H9zm4 0h2v3h-2zm6 7h-2V7H3v11c0 1.654 1.346 3 3 3h8c1.654 0 3-1.346 3-3h2c1.103 0 2-.897 2-2v-5c0-1.103-.897-2-2-2zm-4 9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9h10v9zm2-2v-5h2l.002 5H17z" } }] })(t);
}
function W8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z" } }, { tag: "path", attr: { d: "m2.845 16.136 1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 0 0 9 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 0 0 1.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 0 0-.731-2.732l-.505-.292a7.718 7.718 0 0 0 0-2.224l.505-.292a2.002 2.002 0 0 0 .731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0 0 15 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 0 0-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 0 0 .731 2.732l.505.292a7.683 7.683 0 0 0 0 2.223l-.505.292a2.003 2.003 0 0 0-.731 2.733zm3.326-2.758A5.703 5.703 0 0 1 6 12c0-.462.058-.926.17-1.378a.999.999 0 0 0-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 0 0 1.188-.142 6.071 6.071 0 0 1 2.384-1.399A1 1 0 0 0 11 5.3V4h2v1.3a1 1 0 0 0 .708.956 6.083 6.083 0 0 1 2.384 1.399.999.999 0 0 0 1.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 0 0-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 0 0 .471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 0 0-1.188.142 6.071 6.071 0 0 1-2.384 1.399A1 1 0 0 0 13 18.7l.002 1.3H11v-1.3a1 1 0 0 0-.708-.956 6.083 6.083 0 0 1-2.384-1.399.992.992 0 0 0-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 0 0 .471-1.108z" } }] })(t);
}
function G8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22c3.976 0 8-1.374 8-4V6c0-2.626-4.024-4-8-4S4 3.374 4 6v12c0 2.626 4.024 4 8 4zm0-2c-3.722 0-6-1.295-6-2v-1.268C7.541 17.57 9.777 18 12 18s4.459-.43 6-1.268V18c0 .705-2.278 2-6 2zm0-16c3.722 0 6 1.295 6 2s-2.278 2-6 2-6-1.295-6-2 2.278-2 6-2zM6 8.732C7.541 9.57 9.777 10 12 10s4.459-.43 6-1.268V10c0 .705-2.278 2-6 2s-6-1.295-6-2V8.732zm0 4C7.541 13.57 9.777 14 12 14s4.459-.43 6-1.268V14c0 .705-2.278 2-6 2s-6-1.295-6-2v-1.268z" } }] })(t);
}
function X8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 6C7.03 6 2 7.546 2 10.5v4C2 17.454 7.03 19 12 19s10-1.546 10-4.5v-4C22 7.546 16.97 6 12 6zm-8 8.5v-1.197a9.989 9.989 0 0 0 2 .86v1.881c-1.312-.514-2-1.126-2-1.544zm12 .148v1.971c-.867.179-1.867.31-3 .358v-2a21.75 21.75 0 0 0 3-.329zm-5 2.33a18.788 18.788 0 0 1-3-.358v-1.971c.959.174 1.972.287 3 .33v1.999zm7-.934v-1.881a9.931 9.931 0 0 0 2-.86V14.5c0 .418-.687 1.03-2 1.544zM12 13c-5.177 0-8-1.651-8-2.5S6.823 8 12 8s8 1.651 8 2.5-2.823 2.5-8 2.5z" } }] })(t);
}
function K8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.121 6.465 14 4.344V10h5.656l-2.121-2.121 3.172-3.172-1.414-1.414zM4.707 3.293 3.293 4.707l3.172 3.172L4.344 10H10V4.344L7.879 6.465zM19.656 14H14v5.656l2.121-2.121 3.172 3.172 1.414-1.414-3.172-3.172zM6.465 16.121l-3.172 3.172 1.414 1.414 3.172-3.172L10 19.656V14H4.344z" } }] })(t);
}
function Y8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 10H5c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2zM5 20v-8h14l.002 8H5zM5 6h14v2H5zm2-4h10v2H7z" } }] })(t);
}
function Q8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 13.998c-.092.065-2 2.083-2 3.5 0 1.494.949 2.448 2 2.5.906.044 2-.891 2-2.5 0-1.5-1.908-3.435-2-3.5zm-16.586-1c0 .534.208 1.036.586 1.414l5.586 5.586c.378.378.88.586 1.414.586s1.036-.208 1.414-.586l7-7-.707-.707L11 4.584 8.707 2.291 7.293 3.705l2.293 2.293L4 11.584c-.378.378-.586.88-.586 1.414zM11 7.412l5.586 5.586L11 18.584h.001l-.001 1v-1l-5.586-5.586L11 7.412z" } }] })(t);
}
function J8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.893 3.001H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h15.893c1.103 0 2-.897 2-2V5a2.003 2.003 0 0 0-2-1.999zM8 19.001H4V8h4v11.001zm6 0h-4V8h4v11.001zm2 0V8h3.893l.001 11.001H16z" } }] })(t);
}
function Z8(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 14c-2.206 0-4 1.794-4 4s1.794 4 4 4a4.003 4.003 0 0 0 3.998-3.98H10V16h4v2.039h.004A4.002 4.002 0 0 0 18 22c2.206 0 4-1.794 4-4s-1.794-4-4-4h-2v-4h2c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4v2h-4V5.98h-.002A4.003 4.003 0 0 0 6 2C3.794 2 2 3.794 2 6s1.794 4 4 4h2v4H6zm2 4c0 1.122-.879 2-2 2s-2-.878-2-2 .879-2 2-2h2v2zm10-2c1.121 0 2 .878 2 2s-.879 2-2 2-2-.878-2-2v-2h2zM16 6c0-1.122.879-2 2-2s2 .878 2 2-.879 2-2 2h-2V6zM6 8c-1.121 0-2-.878-2-2s.879-2 2-2 2 .878 2 2v2H6zm4 2h4v4h-4v-4z" } }] })(t);
}
function t7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 14h2v-3h3V9h-3V6h-2v3H8v2h3z" } }, { tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }] })(t);
}
function e7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m17.207 8.207-1.414-1.414L11 11.586 8.707 9.293l-1.414 1.414L11 14.414z" } }, { tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }] })(t);
}
function a7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 7h10v2H7zm0 4h7v2H7z" } }, { tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }] })(t);
}
function r7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }, { tag: "circle", attr: { cx: "15", cy: "10", r: "2" } }, { tag: "circle", attr: { cx: "9", cy: "10", r: "2" } }] })(t);
}
function n7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m13.771 9.123-1.399-1.398-3.869 3.864v1.398h1.398zM14.098 6l1.398 1.398-1.067 1.067-1.398-1.398z" } }, { tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }] })(t);
}
function c7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 6h2v5h-2zm0 6h2v2h-2z" } }, { tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }] })(t);
}
function i7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 9h8v2H8z" } }, { tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }] })(t);
}
function l7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9.707 13.707 12 11.414l2.293 2.293 1.414-1.414L13.414 10l2.293-2.293-1.414-1.414L12 8.586 9.707 6.293 8.293 7.707 10.586 10l-2.293 2.293z" } }, { tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }] })(t);
}
function o7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z" } }] })(t);
}
function h7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "m8 16 5.991-2L16 8l-6 2z" } }] })(t);
}
function s7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "8.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.493", cy: "10.493", r: "1.493" } }, { tag: "path", attr: { d: "m8.124 16.992-.248-1.984 8-1 .248 1.984z" } }] })(t);
}
function v7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 14h.5c.827 0 1.5-.673 1.5-1.5v-9c0-.827-.673-1.5-1.5-1.5h-13C2.673 2 2 2.673 2 3.5V18l5.333-4H16zm-9.333-2L4 14V4h12v8H6.667z" } }, { tag: "path", attr: { d: "M20.5 8H20v6.001c0 1.1-.893 1.993-1.99 1.999H8v.5c0 .827.673 1.5 1.5 1.5h7.167L22 22V9.5c0-.827-.673-1.5-1.5-1.5z" } }] })(t);
}
function u7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.598 11.064a1.006 1.006 0 0 0-.854-.172A2.938 2.938 0 0 1 20 11c-1.654 0-3-1.346-3.003-2.937.005-.034.016-.136.017-.17a.998.998 0 0 0-1.254-1.006A2.963 2.963 0 0 1 15 7c-1.654 0-3-1.346-3-3 0-.217.031-.444.099-.716a1 1 0 0 0-1.067-1.236A9.956 9.956 0 0 0 2 12c0 5.514 4.486 10 10 10s10-4.486 10-10c0-.049-.003-.097-.007-.16a1.004 1.004 0 0 0-.395-.776zM12 20c-4.411 0-8-3.589-8-8a7.962 7.962 0 0 1 6.006-7.75A5.006 5.006 0 0 0 15 9l.101-.001a5.007 5.007 0 0 0 4.837 4C19.444 16.941 16.073 20 12 20z" } }, { tag: "circle", attr: { cx: "12.5", cy: "11.5", r: "1.5" } }, { tag: "circle", attr: { cx: "8.5", cy: "8.5", r: "1.5" } }, { tag: "circle", attr: { cx: "7.5", cy: "12.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.5", cy: "15.5", r: "1.5" } }, { tag: "circle", attr: { cx: "10.5", cy: "16.5", r: "1.5" } }] })(t);
}
function d7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14.683 14.828a4.055 4.055 0 0 1-1.272.858 4.002 4.002 0 0 1-4.875-1.45l-1.658 1.119a6.063 6.063 0 0 0 1.621 1.62 5.963 5.963 0 0 0 2.148.903 6.035 6.035 0 0 0 3.542-.35 6.048 6.048 0 0 0 1.907-1.284c.272-.271.52-.571.734-.889l-1.658-1.119a4.147 4.147 0 0 1-.489.592z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 2c2.953 0 5.531 1.613 6.918 4H5.082C6.469 5.613 9.047 4 12 4zm0 16c-4.411 0-8-3.589-8-8 0-.691.098-1.359.264-2H5v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1h.736c.166.641.264 1.309.264 2 0 4.411-3.589 8-8 8z" } }] })(t);
}
function g7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z" } }, { tag: "path", attr: { d: "M6 12h6v2H6zm0 4h6v2H6z" } }] })(t);
}
function f7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z" } }] })(t);
}
function p7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22c5.421 0 10-4.579 10-10S17.421 2 12 2 2 6.579 2 12s4.579 10 10 10zm0-18c4.337 0 8 3.663 8 8s-3.663 8-8 8-8-3.663-8-8 3.663-8 8-8z" } }, { tag: "path", attr: { d: "M12 17c.901 0 2.581-.168 3.707-1.292l-1.414-1.416C13.85 14.735 12.992 15 12 15c-1.626 0-3-1.374-3-3s1.374-3 3-3c.993 0 1.851.265 2.293.707l1.414-1.414C14.582 7.168 12.901 7 12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5z" } }] })(t);
}
function z7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "15.5", cy: "13.5", r: "2.5" } }, { tag: "path", attr: { d: "M12 13.5c0-.815.396-1.532 1-1.988A2.47 2.47 0 0 0 11.5 11a2.5 2.5 0 1 0 0 5 2.47 2.47 0 0 0 1.5-.512 2.486 2.486 0 0 1-1-1.988z" } }, { tag: "path", attr: { d: "M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V6h16l.002 12H4z" } }] })(t);
}
function m7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V6h16l.001 12H4z" } }, { tag: "path", attr: { d: "M6.5 11h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5zM6 14h6v2.001H6zm7 0h5v2.001h-5z" } }] })(t);
}
function M7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 6h16v2H4V6zm0 12v-6h16.001l.001 6H4z" } }, { tag: "path", attr: { d: "M6 14h6v2H6z" } }] })(t);
}
function B7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 7c0-1.103-.897-2-2-2H7V2H5v3H2v2h15v15h2v-3h3v-2h-3V7z" } }, { tag: "path", attr: { d: "M5 9v8c0 1.103.897 2 2 2h8v-2H7V9H5z" } }] })(t);
}
function H7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 17.931V17h-2v2.931A8.008 8.008 0 0 1 4.069 13H7v-2H4.069A8.008 8.008 0 0 1 11 4.069V7h2V4.069A8.007 8.007 0 0 1 19.931 11H17v2h2.931A8.008 8.008 0 0 1 13 19.931z" } }] })(t);
}
function w7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.219 3.375 8 7.399 4.781 3.375A1.002 1.002 0 0 0 3 4v15c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V4a1.002 1.002 0 0 0-1.781-.625L16 7.399l-3.219-4.024c-.381-.474-1.181-.474-1.562 0zM5 19v-2h14.001v2H5zm10.219-9.375c.381.475 1.182.475 1.563 0L19 6.851 19.001 15H5V6.851l2.219 2.774c.381.475 1.182.475 1.563 0L12 5.601l3.219 4.024z" } }] })(t);
}
function x7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.895 3.553A1.001 1.001 0 0 0 17 3H7c-.379 0-.725.214-.895.553l-4 8a1 1 0 0 0 0 .895l4 8c.17.338.516.552.895.552h10c.379 0 .725-.214.895-.553l4-8a1 1 0 0 0 0-.895l-4-7.999zM19.382 11h-7.764l-3-6h7.764l3 6zM4.118 12 7 6.236 9.882 12 7 17.764 4.118 12zm12.264 7H8.618l3-6h7.764l-3 6z" } }] })(t);
}
function V7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.406 6.086-9-4a1.001 1.001 0 0 0-.813 0l-9 4c-.02.009-.034.024-.054.035-.028.014-.058.023-.084.04-.022.015-.039.034-.06.05a.87.87 0 0 0-.19.194c-.02.028-.041.053-.059.081a1.119 1.119 0 0 0-.076.165c-.009.027-.023.052-.031.079A1.013 1.013 0 0 0 2 7v10c0 .396.232.753.594.914l9 4c.13.058.268.086.406.086a.997.997 0 0 0 .402-.096l.004.01 9-4A.999.999 0 0 0 22 17V7a.999.999 0 0 0-.594-.914zM12 4.095 18.538 7 12 9.905l-1.308-.581L5.463 7 12 4.095zM4 16.351V8.539l7 3.111v7.811l-7-3.11zm9 3.11V11.65l7-3.111v7.812l-7 3.11z" } }] })(t);
}
function y7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.707 2.293A.996.996 0 0 0 16 2H8c-.414 0-.785.255-.934.641l-5 13a.999.999 0 0 0 .227 1.066l5 5A.996.996 0 0 0 8 22h8c.414 0 .785-.255.934-.641l5-13a.999.999 0 0 0-.227-1.066l-5-5zM18.585 7h-5.171l-3-3h5.172l2.999 3zM8.381 4.795l3.438 3.438-4.462 10.71-3.19-3.191L8.381 4.795zM15.313 20h-6.23l4.583-11h5.878l-4.231 11z" } }] })(t);
}
function C7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "12", r: "4" } }, { tag: "path", attr: { d: "M13 4.069V2h-2v2.069A8.01 8.01 0 0 0 4.069 11H2v2h2.069A8.008 8.008 0 0 0 11 19.931V22h2v-2.069A8.007 8.007 0 0 0 19.931 13H22v-2h-2.069A8.008 8.008 0 0 0 13 4.069zM12 18c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" } }] })(t);
}
function L7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm1-6h4v4H5V5zm15-2h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 6h-4V5h4v4zm-9 12a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6zm-5-6h4v4H5v-4zm13-1h-2v2h-2v2h2v2h2v-2h2v-2h-2z" } }] })(t);
}
function _7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 6.5C10 4.57 8.43 3 6.5 3S3 4.57 3 6.5 4.57 10 6.5 10a3.45 3.45 0 0 0 1.613-.413l2.357 2.528-2.318 2.318A3.46 3.46 0 0 0 6.5 14C4.57 14 3 15.57 3 17.5S4.57 21 6.5 21s3.5-1.57 3.5-3.5c0-.601-.166-1.158-.434-1.652l2.269-2.268L17 19.121a3 3 0 0 0 2.121.879H22L9.35 8.518c.406-.572.65-1.265.65-2.018zM6.5 8C5.673 8 5 7.327 5 6.5S5.673 5 6.5 5 8 5.673 8 6.5 7.327 8 6.5 8zm0 11c-.827 0-1.5-.673-1.5-1.5S5.673 16 6.5 16s1.5.673 1.5 1.5S7.327 19 6.5 19z" } }, { tag: "path", attr: { d: "m17 4.879-3.707 4.414 1.414 1.414L22 4h-2.879A3 3 0 0 0 17 4.879z" } }] })(t);
}
function A7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 15.414V20h2v-4.586c0-.526-.214-1.042-.586-1.414l-2-2L13 9.414l2 2c.372.372.888.586 1.414.586H20v-2h-3.586l-3.707-3.707a.999.999 0 0 0-1.414 0L8 9.586c-.378.378-.586.88-.586 1.414s.208 1.036.586 1.414l3 3z" } }, { tag: "circle", attr: { cx: "16", cy: "5", r: "2" } }, { tag: "path", attr: { d: "M18 14c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zM6 22c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z" } }] })(t);
}
function b7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22c5.131 0 9-1.935 9-4.5V7h-.053c.033-.164.053-.33.053-.5C21 3.935 17.131 2 12 2 7.209 2 3.52 3.688 3.053 6H3v11.5c0 2.565 3.869 4.5 9 4.5zm0-2c-4.273 0-7-1.48-7-2.5V9.394C6.623 10.387 9.111 11 12 11s5.377-.613 7-1.606V17.5c0 1.02-2.727 2.5-7 2.5zm0-16c4.273 0 7 1.48 7 2.5S16.273 9 12 9 5 7.52 5 6.5 7.727 4 12 4z" } }] })(t);
}
function P7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 17V7c0-2.168-3.663-4-8-4S4 4.832 4 7v10c0 2.168 3.663 4 8 4s8-1.832 8-4zM12 5c3.691 0 5.931 1.507 6 1.994C17.931 7.493 15.691 9 12 9S6.069 7.493 6 7.006C6.069 6.507 8.309 5 12 5zM6 9.607C7.479 10.454 9.637 11 12 11s4.521-.546 6-1.393v2.387c-.069.499-2.309 2.006-6 2.006s-5.931-1.507-6-2V9.607zM6 17v-2.393C7.479 15.454 9.637 16 12 16s4.521-.546 6-1.393v2.387c-.069.499-2.309 2.006-6 2.006s-5.931-1.507-6-2z" } }] })(t);
}
function S7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h7v2H8v2h8v-2h-3v-2h7c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 14V5h16l.002 9H4z" } }] })(t);
}
function E7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h16l.002 14H4z" } }, { tag: "path", attr: { d: "M6 7h12v2H6zm0 4h12v2H6zm0 4h6v2H6z" } }] })(t);
}
function R7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H7c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h6c1.103 0 2-.897 2-2h8c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM9.997 19H4V9h6l-.003 10zm10-2H12V9c0-1.103-.897-2-2-2H7V5h13l-.003 12z" } }] })(t);
}
function T7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "6", r: "2" } }, { tag: "circle", attr: { cx: "6", cy: "6", r: "2" } }, { tag: "circle", attr: { cx: "18", cy: "6", r: "2" } }, { tag: "circle", attr: { cx: "12", cy: "12", r: "2" } }, { tag: "circle", attr: { cx: "6", cy: "12", r: "2" } }, { tag: "circle", attr: { cx: "18", cy: "12", r: "2" } }, { tag: "circle", attr: { cx: "12", cy: "18", r: "2" } }] })(t);
}
function O7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 3h4v3h-4zm0 5h4v3h-4zm0 5h4v3h-4zm6-10h4v3h-4zm0 5h4v3h-4zm0 5h4v3h-4zM4 3h4v3H4zm0 5h4v3H4zm0 5h4v3H4zm6 5h4v3h-4z" } }] })(t);
}
function N7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.813 3.838A2 2 0 0 0 16.187 3H7.813c-.644 0-1.252.313-1.667.899l-4 6.581a.999.999 0 0 0 .111 1.188l9 10a.995.995 0 0 0 1.486.001l9-10a.997.997 0 0 0 .111-1.188l-4.041-6.643zM12 19.505 5.245 12h13.509L12 19.505zM4.777 10l3.036-5 8.332-.062L19.222 10H4.777z" } }] })(t);
}
function $7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }, { tag: "circle", attr: { cx: "12", cy: "12", r: "1.5" } }] })(t);
}
function I7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }, { tag: "circle", attr: { cx: "9.5", cy: "12", r: "1.5" } }, { tag: "circle", attr: { cx: "14.5", cy: "12", r: "1.5" } }] })(t);
}
function D7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }, { tag: "circle", attr: { cx: "8", cy: "8", r: "1.5" } }, { tag: "circle", attr: { cx: "12", cy: "12", r: "1.5" } }, { tag: "circle", attr: { cx: "16", cy: "16", r: "1.5" } }] })(t);
}
function k7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }, { tag: "circle", attr: { cx: "8", cy: "8", r: "1.5" } }, { tag: "circle", attr: { cx: "16", cy: "16", r: "1.5" } }, { tag: "circle", attr: { cx: "8", cy: "16", r: "1.5" } }, { tag: "circle", attr: { cx: "16", cy: "8", r: "1.5" } }] })(t);
}
function j7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }, { tag: "circle", attr: { cx: "8", cy: "8", r: "1.5" } }, { tag: "circle", attr: { cx: "12", cy: "12", r: "1.5" } }, { tag: "circle", attr: { cx: "16", cy: "16", r: "1.5" } }, { tag: "circle", attr: { cx: "8", cy: "16", r: "1.5" } }, { tag: "circle", attr: { cx: "16", cy: "8", r: "1.5" } }] })(t);
}
function U7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }, { tag: "circle", attr: { cx: "8", cy: "8", r: "1.5" } }, { tag: "circle", attr: { cx: "8", cy: "12", r: "1.5" } }, { tag: "circle", attr: { cx: "16", cy: "12", r: "1.5" } }, { tag: "circle", attr: { cx: "16", cy: "16", r: "1.5" } }, { tag: "circle", attr: { cx: "8", cy: "16", r: "1.5" } }, { tag: "circle", attr: { cx: "16", cy: "8", r: "1.5" } }] })(t);
}
function F7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.781 13.875-2-2.5A1 1 0 0 0 19 11h-6V9h6c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5a1 1 0 0 0-.781.375l-2 2.5a1.001 1.001 0 0 0 0 1.25l2 2.5A1 1 0 0 0 5 9h6v2H5c-1.103 0-2 .897-2 2v3c0 1.103.897 2 2 2h6v4h2v-4h6a1 1 0 0 0 .781-.375l2-2.5a1.001 1.001 0 0 0 0-1.25zM4.281 5.5 5.48 4H19l.002 3H5.48L4.281 5.5zM18.52 16H5v-3h13.52l1.2 1.5-1.2 1.5z" } }] })(t);
}
function q7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" } }, { tag: "path", attr: { d: "M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z" } }] })(t);
}
function W7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 15c0-4.625-3.507-8.441-8-8.941V4h-2v2.059c-4.493.5-8 4.316-8 8.941v2h18v-2zM5 15c0-3.859 3.141-7 7-7s7 3.141 7 7H5zm-3 3h20v2H2z" } }] })(t);
}
function G7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H6.693A2.01 2.01 0 0 0 4.82 4.298l-2.757 7.351A1 1 0 0 0 2 12v2c0 1.103.897 2 2 2h5.612L8.49 19.367a2.004 2.004 0 0 0 .274 1.802c.376.52.982.831 1.624.831H12c.297 0 .578-.132.769-.36l4.7-5.64H20c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm-8.469 17h-1.145l1.562-4.684A1 1 0 0 0 11 14H4v-1.819L6.693 5H16v9.638L11.531 20zM18 14V5h2l.001 9H18z" } }] })(t);
}
function X7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M10.707 12.293 9.414 11l1.293-1.293-1.414-1.414L8 9.586 6.707 8.293 5.293 9.707 6.586 11l-1.293 1.293 1.414 1.414L8 12.414l1.293 1.293zm6.586-4L16 9.586l-1.293-1.293-1.414 1.414L14.586 11l-1.293 1.293 1.414 1.414L16 12.414l1.293 1.293 1.414-1.414L17.414 11l1.293-1.293zM10 16h4v2h-4z" } }] })(t);
}
function K7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15.794 11.09c.332-.263.648-.542.947-.84l.136-.142c.283-.293.552-.598.801-.919l.062-.075c.255-.335.486-.688.702-1.049l.128-.22c.205-.364.395-.737.559-1.123.02-.047.035-.095.055-.142.147-.361.274-.731.383-1.109.021-.07.044-.14.063-.211.107-.402.189-.813.251-1.229.013-.087.021-.175.032-.263.051-.432.087-.869.087-1.311V2h-2v.457c0 .184-.031.361-.042.543H6.022C6.012 2.819 6 2.64 6 2.457V2H4v.457c0 4.876 3.269 9.218 7.952 10.569l.028.009c2.881.823 5.056 3.146 5.769 5.965H6.251l.799-2h7.607a7.416 7.416 0 0 0-2.063-2h-4c.445-.424.956-.774 1.491-1.09a9.922 9.922 0 0 1-2.08-1.014C5.55 14.812 4 17.779 4 21.015V23h2v-1.985L6.001 21h11.998l.001.015V23h2v-1.985c0-3.83-2.159-7.303-5.443-9.07a11.1 11.1 0 0 0 1.072-.729c.055-.042.11-.082.165-.126zm-1.19-1.604a8.945 8.945 0 0 1-2.325 1.348c-.092.036-.185.068-.278.102A8.95 8.95 0 0 1 8.836 9h6.292c-.171.161-.332.333-.517.48l-.007.006zM17.619 5c-.005.016-.007.033-.012.049l-.044.151a9.089 9.089 0 0 1-.513 1.252c-.096.19-.213.365-.321.548h-9.48a9.066 9.066 0 0 1-.871-2h11.241z" } }] })(t);
}
function Y7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 2v9H5V5zM5 19v-3h14v3z" } }] })(t);
}
function Q7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 5h3v14H5zm5 14V5h9v14z" } }] })(t);
}
function J7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 5h9v14H5zm11 14V5h3v14z" } }] })(t);
}
function Z7(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 2v3H5V5zM5 19v-9h14v9z" } }] })(t);
}
function t6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" } }, { tag: "path", attr: { d: "M12 11c-2 0-2-.63-2-1s.7-1 2-1 1.39.64 1.4 1h2A3 3 0 0 0 13 7.12V6h-2v1.09C9 7.42 8 8.71 8 10c0 1.12.52 3 4 3 2 0 2 .68 2 1s-.62 1-2 1c-1.84 0-2-.86-2-1H8c0 .92.66 2.55 3 2.92V18h2v-1.08c2-.34 3-1.63 3-2.92 0-1.12-.52-3-4-3z" } }] })(t);
}
function e6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15.999 8.5h2c0-2.837-2.755-4.131-5-4.429V2h-2v2.071c-2.245.298-5 1.592-5 4.429 0 2.706 2.666 4.113 5 4.43v4.97c-1.448-.251-3-1.024-3-2.4h-2c0 2.589 2.425 4.119 5 4.436V22h2v-2.07c2.245-.298 5-1.593 5-4.43s-2.755-4.131-5-4.429V6.1c1.33.239 3 .941 3 2.4zm-8 0c0-1.459 1.67-2.161 3-2.4v4.799c-1.371-.253-3-1.002-3-2.399zm8 7c0 1.459-1.67 2.161-3 2.4v-4.8c1.33.239 3 .941 3 2.4z" } }] })(t);
}
function a6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 21h9.62a3.995 3.995 0 0 0 3.037-1.397l5.102-5.952a1 1 0 0 0-.442-1.6l-1.968-.656a3.043 3.043 0 0 0-2.823.503l-3.185 2.547-.617-1.235A3.98 3.98 0 0 0 9.146 11H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h5.146c.763 0 1.448.423 1.789 1.105l.447.895H7v2h6.014a.996.996 0 0 0 .442-.11l.003-.001.004-.002h.003l.002-.001h.004l.001-.001c.011.003.003-.001.003-.001.012 0 .002-.001.002-.001h.001l.002-.001.003-.001.002-.001.002-.001.003-.001.002-.001.002-.001.003-.002.002-.001.002-.001.003-.001.002-.001h.001l.002-.001h.001l.002-.001.002-.001c.011-.001.003-.001.003-.001l.002-.001a.915.915 0 0 0 .11-.078l4.146-3.317c.261-.208.623-.273.94-.167l.557.186-4.133 4.823a2.029 2.029 0 0 1-1.52.688H4v-6zm9.761-10.674C13.3 2.832 11 5.457 11 7.5c0 1.93 1.57 3.5 3.5 3.5S18 9.43 18 7.5c0-2.043-2.3-4.668-2.761-5.174-.379-.416-1.099-.416-1.478 0zM16 7.5c0 .827-.673 1.5-1.5 1.5S13 8.327 13 7.5c0-.708.738-1.934 1.5-2.934.762 1 1.5 2.226 1.5 2.934z" } }] })(t);
}
function r6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 21h9.62a3.995 3.995 0 0 0 3.037-1.397l5.102-5.952a1 1 0 0 0-.442-1.6l-1.968-.656a3.043 3.043 0 0 0-2.823.503l-3.185 2.547-.617-1.235A3.98 3.98 0 0 0 9.146 11H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h5.146c.763 0 1.448.423 1.789 1.105l.447.895H7v2h6.014a.996.996 0 0 0 .442-.11l.003-.001.004-.002h.003l.002-.001h.004l.001-.001c.009.003.003-.001.003-.001.01 0 .002-.001.002-.001h.001l.002-.001.003-.001.002-.001.002-.001.003-.001.002-.001c.003 0 .001-.001.002-.001l.003-.002.002-.001.002-.001.003-.001.002-.001h.001l.002-.001h.001l.002-.001.002-.001c.009-.001.003-.001.003-.001l.002-.001a.915.915 0 0 0 .11-.078l4.146-3.317c.262-.208.623-.273.94-.167l.557.186-4.133 4.823a2.029 2.029 0 0 1-1.52.688H4v-6zM16 2h-.017c-.163.002-1.006.039-1.983.705-.951-.648-1.774-.7-1.968-.704L12.002 2h-.004c-.801 0-1.555.313-2.119.878C9.313 3.445 9 4.198 9 5s.313 1.555.861 2.104l3.414 3.586a1.006 1.006 0 0 0 1.45-.001l3.396-3.568C18.688 6.555 19 5.802 19 5s-.313-1.555-.878-2.121A2.978 2.978 0 0 0 16.002 2H16zm1 3c0 .267-.104.518-.311.725L14 8.55l-2.707-2.843C11.104 5.518 11 5.267 11 5s.104-.518.294-.708A.977.977 0 0 1 11.979 4c.025.001.502.032 1.067.485.081.065.163.139.247.222l.707.707.707-.707c.084-.083.166-.157.247-.222.529-.425.976-.478 1.052-.484a.987.987 0 0 1 .701.292c.189.189.293.44.293.707z" } }] })(t);
}
function n6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10.385 21.788a.997.997 0 0 0 .857.182l8-2A.999.999 0 0 0 20 19V5a1 1 0 0 0-.758-.97l-8-2A1.003 1.003 0 0 0 10 3v1H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4v1c0 .308.142.599.385.788zM12 4.281l6 1.5v12.438l-6 1.5V4.281zM7 18V6h3v12H7z" } }, { tag: "path", attr: { d: "M14.242 13.159c.446-.112.758-.512.758-.971v-.377a1 1 0 1 0-2 .001v.377a1 1 0 0 0 1.242.97z" } }] })(t);
}
function c6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" } }] })(t);
}
function i6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 10h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4z" } }] })(t);
}
function l6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" } }] })(t);
}
function o6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 10h4v4h-4zm0-6h4v4h-4zm0 12h4v4h-4z" } }] })(t);
}
function h6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-3.032A5.013 5.013 0 0 0 13 7.102V4.069A8.008 8.008 0 0 1 19.931 11zM12 9c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm0 11c-4.411 0-8-3.589-8-8 0-4.072 3.061-7.436 7-7.931v3.032A5.009 5.009 0 0 0 7 12c0 2.757 2.243 5 5 5a5.007 5.007 0 0 0 4.898-4h3.032c-.494 3.939-3.858 7-7.93 7z" } }] })(t);
}
function s6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m18.707 12.707-1.414-1.414L13 15.586V6h-2v9.586l-4.293-4.293-1.414 1.414L12 19.414z" } }] })(t);
}
function v6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 1.993C6.486 1.994 2 6.48 2 11.994c0 5.513 4.486 9.999 10 10 5.514 0 10-4.486 10-10s-4.485-10-10-10.001zm0 18.001c-4.411-.001-8-3.59-8-8 0-4.411 3.589-8 8-8.001 4.411.001 8 3.59 8 8.001s-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M13 8h-2v4H7.991l4.005 4.005L16 12h-3z" } }] })(t);
}
function u6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.886 5.536A1.002 1.002 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13a.998.998 0 0 0 1.644 0l9-13a.998.998 0 0 0 .064-1.033zM12 17.243 4.908 7h14.184L12 17.243z" } }] })(t);
}
function d6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12 16 4-5h-3V4h-2v7H8z" } }, { tag: "path", attr: { d: "M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z" } }] })(t);
}
function g6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.901 10.566A1.001 1.001 0 0 0 20 10h-4V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7H4a1.001 1.001 0 0 0-.781 1.625l8 10a1 1 0 0 0 1.562 0l8-10c.24-.301.286-.712.12-1.059zM12 19.399 6.081 12H10V4h4v8h3.919L12 19.399z" } }] })(t);
}
function f6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.832 4.555A1 1 0 0 0 20 3H4a1 1 0 0 0-.832 1.554L11 16.303V20H8v2h8v-2h-3v-3.697l7.832-11.748zM12 14.197 8.535 9h6.93L12 14.197zM18.132 5l-1.333 2H7.201L5.868 5h12.264z" } }] })(t);
}
function p6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22c4.636 0 8-3.468 8-8.246C20 7.522 12.882 2.4 12.579 2.185a1 1 0 0 0-1.156-.001C11.12 2.397 4 7.503 4 13.75 4 18.53 7.364 22 12 22zm-.001-17.74C13.604 5.55 18 9.474 18 13.754 18 17.432 15.532 20 12 20s-6-2.57-6-6.25c0-4.29 4.394-8.203 5.999-9.49z" } }] })(t);
}
function z6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 5v14h3v-6h6v6h3V5h-3v6H9V5zM3 15a1 1 0 0 0 1 1h1V8H4a1 1 0 0 0-1 1v2H2v2h1v2zm18-6a1 1 0 0 0-1-1h-1v8h1a1 1 0 0 0 1-1v-2h1v-2h-1V9z" } }] })(t);
}
function m6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 10H9v3H6v2h3v3h2v-3h3v-2h-3z" } }, { tag: "path", attr: { d: "M4 22h12c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2zM4 8h12l.002 12H4V8z" } }, { tag: "path", attr: { d: "M20 2H8v2h12v12h2V4c0-1.103-.897-2-2-2z" } }] })(t);
}
function M6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3 1.587 1.585-1.59 1.584-1.586-1.585 1.589-1.584zM6 16v-1.585l7.04-7.018 1.586 1.586L7.587 16H6zm-2 4h16v2H4z" } }] })(t);
}
function B6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z" } }, { tag: "path", attr: { d: "M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z" } }] })(t);
}
function H6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.555 8.168-9-6a1 1 0 0 0-1.109 0l-9 6A1 1 0 0 0 2 9v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-.334-.167-.646-.445-.832zM12 4.202 19.197 9 12 13.798 4.803 9 12 4.202zM4 20v-9.131l7.445 4.963a1 1 0 0 0 1.11 0L20 10.869 19.997 20H4z" } }] })(t);
}
function w6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l7.386 5.745a.994.994 0 0 0 1.228 0L20 9.044 20.002 18H4z" } }] })(t);
}
function x6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 9h2v6h-2zm4-3h2v12h-2zM7 4h2v16H7zm12 7h2v2h-2zM3 10h2v4H3z" } }] })(t);
}
function V6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m2.586 15.408 4.299 4.299a.996.996 0 0 0 .707.293h12.001v-2h-6.958l7.222-7.222c.78-.779.78-2.049 0-2.828L14.906 3a2.003 2.003 0 0 0-2.828 0l-4.75 4.749-4.754 4.843a2.007 2.007 0 0 0 .012 2.816zM13.492 4.414l4.95 4.95-2.586 2.586L10.906 7l2.586-2.586zM8.749 9.156l.743-.742 4.95 4.95-4.557 4.557a1.026 1.026 0 0 0-.069.079h-1.81l-4.005-4.007 4.748-4.837z" } }] })(t);
}
function y6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 7h2v7h-2zm0 8h2v2h-2z" } }, { tag: "path", attr: { d: "m21.707 7.293-5-5A.996.996 0 0 0 16 2H8a.996.996 0 0 0-.707.293l-5 5A.996.996 0 0 0 2 8v8c0 .266.105.52.293.707l5 5A.996.996 0 0 0 8 22h8c.266 0 .52-.105.707-.293l5-5A.996.996 0 0 0 22 16V8a.996.996 0 0 0-.293-.707zM20 15.586 15.586 20H8.414L4 15.586V8.414L8.414 4h7.172L20 8.414v7.172z" } }] })(t);
}
function C6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M11 7h2v7h-2zm0 8h2v2h-2z" } }] })(t);
}
function L6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.001 10h2v5h-2zM11 16h2v2h-2z" } }, { tag: "path", attr: { d: "M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19 12 5.137 19.344 19H4.661z" } }] })(t);
}
function _6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13.464 6c1.43 0 2.779.613 3.799 1.726l1.475-1.352C17.334 4.843 15.461 4 13.464 4c-1.998 0-3.87.843-5.272 2.375A8.034 8.034 0 0 0 6.589 9H4v2h2.114c-.038.33-.064.663-.064 1s.026.67.064 1H4v2h2.589c.362.97.901 1.861 1.603 2.626C9.594 19.157 11.466 20 13.464 20c1.997 0 3.87-.843 5.273-2.374l-1.475-1.352C16.243 17.387 14.894 18 13.464 18s-2.778-.612-3.798-1.726A5.937 5.937 0 0 1 8.801 15H13v-2H8.139c-.05-.328-.089-.66-.089-1s.039-.672.089-1H13V9H8.801c.24-.457.516-.893.865-1.274C10.686 6.613 12.034 6 13.464 6z" } }] })(t);
}
function A6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 8h-3V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2zm-4 7H9V9h6v6z" } }] })(t);
}
function b6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 4H8v4H4v2h6zM8 20h2v-6H4v2h4zm12-6h-6v6h2v-4h4zm0-6h-4V4h-2v6h6z" } }] })(t);
}
function P6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.002 3h-14c-1.103 0-2 .897-2 2v4h2V5h14v14h-14v-4h-2v4c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.898-2-2-2z" } }, { tag: "path", attr: { d: "m11 16 5-4-5-4v3.001H3v2h8z" } }] })(t);
}
function S6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 12H3v9h9v-2H5zm7-7h7v7h2V3h-9z" } }] })(t);
}
function E6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21 15.344-2.121 2.121-3.172-3.172-1.414 1.414 3.172 3.172L15.344 21H21zM3 8.656l2.121-2.121 3.172 3.172 1.414-1.414-3.172-3.172L8.656 3H3zM21 3h-5.656l2.121 2.121-3.172 3.172 1.414 1.414 3.172-3.172L21 8.656zM3 21h5.656l-2.121-2.121 3.172-3.172-1.414-1.414-3.172 3.172L3 15.344z" } }] })(t);
}
function R6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 16h2V7h3l-4-5-4 5h3z" } }, { tag: "path", attr: { d: "M5 22h14c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-4v2h4v9H5v-9h4V9H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2z" } }] })(t);
}
function T6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 10V7c0-1.103-.897-2-2-2h-3c0-1.654-1.346-3-3-3S8 3.346 8 5H5c-1.103 0-2 .897-2 2v3.881l.659.239C4.461 11.41 5 12.166 5 13s-.539 1.59-1.341 1.88L3 15.119V19c0 1.103.897 2 2 2h3.881l.239-.659C9.41 19.539 10.166 19 11 19s1.59.539 1.88 1.341l.239.659H17c1.103 0 2-.897 2-2v-3c1.654 0 3-1.346 3-3s-1.346-3-3-3zm0 4h-2l-.003 5h-2.545c-.711-1.22-2.022-2-3.452-2s-2.741.78-3.452 2H5v-2.548C6.22 15.741 7 14.43 7 13s-.78-2.741-2-3.452V7h5V5a1 1 0 0 1 2 0v2h5v5h2a1 1 0 0 1 0 2z" } }] })(t);
}
function O6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 2c3.213 0 5.982 1.908 7.254 4.648a7.8 7.8 0 0 1-.895-.498c-.409-.258-.873-.551-1.46-.772-.669-.255-1.4-.378-2.234-.378s-1.565.123-2.234.377c-.587.223-1.051.516-1.472.781-.378.237-.703.443-1.103.594C9.41 8.921 8.926 9 8.33 9c-.595 0-1.079-.079-1.524-.248-.4-.151-.728-.358-1.106-.598-.161-.101-.34-.208-.52-.313C6.587 5.542 9.113 4 12 4zm0 16c-4.411 0-8-3.589-8-8 0-.81.123-1.59.348-2.327.094.058.185.11.283.173.411.26.876.554 1.466.776.669.255 1.399.378 2.233.378.833 0 1.564-.123 2.235-.377.587-.223 1.051-.516 1.472-.781.378-.237.703-.443 1.103-.595.445-.168.929-.247 1.525-.247s1.08.079 1.525.248c.399.15.725.356 1.114.602.409.258.873.551 1.46.773.363.138.748.229 1.153.291.049.357.083.717.083 1.086 0 4.411-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "8.5", cy: "13.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.5", cy: "13.5", r: "1.5" } }] })(t);
}
function N6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "m13 16 5-4-5-4zm-6 0 5-4-5-4z" } }] })(t);
}
function $6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m19 12-7-5v10zM5 7v10l7-5z" } }] })(t);
}
function I6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C8.691 2 6 4.691 6 8c0 2.967 2.167 5.432 5 5.91V17H8v2h3v2.988h2V19h3v-2h-3v-3.09c2.833-.479 5-2.943 5-5.91 0-3.309-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" } }] })(t);
}
function D6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "4", r: "2" } }, { tag: "path", attr: { d: "M14.948 7.684A.997.997 0 0 0 14 7h-4a.998.998 0 0 0-.948.684l-2 6 1.775.593L8 18h2v4h4v-4h2l-.827-3.724 1.775-.593-2-5.999z" } }] })(t);
}
function k6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.937 8.68c-.011-.032-.02-.063-.033-.094a.997.997 0 0 0-.196-.293l-6-6a.997.997 0 0 0-.293-.196c-.03-.014-.062-.022-.094-.033a.991.991 0 0 0-.259-.051C13.04 2.011 13.021 2 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-.021-.011-.04-.013-.062a.99.99 0 0 0-.05-.258zM16.586 8H14V5.414L16.586 8zM6 20V4h6v5a1 1 0 0 0 1 1h5l.002 10H6z" } }] })(t);
}
function j6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13.707 2.293A.996.996 0 0 0 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9a.996.996 0 0 0-.293-.707l-6-6zM6 4h6.586L18 9.414l.002 9.174-2.568-2.568c.35-.595.566-1.281.566-2.02 0-2.206-1.794-4-4-4s-4 1.794-4 4 1.794 4 4 4c.739 0 1.425-.216 2.02-.566L16.586 20H6V4zm6 12c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" } }] })(t);
}
function U6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.903 8.586a.997.997 0 0 0-.196-.293l-6-6a.997.997 0 0 0-.293-.196c-.03-.014-.062-.022-.094-.033a.991.991 0 0 0-.259-.051C13.04 2.011 13.021 2 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-.021-.011-.04-.013-.062a.952.952 0 0 0-.051-.259c-.01-.032-.019-.063-.033-.093zM16.586 8H14V5.414L16.586 8zM6 20V4h6v5a1 1 0 0 0 1 1h5l.002 10H6z" } }, { tag: "path", attr: { d: "M8 12h8v2H8zm0 4h8v2H8zm0-8h2v2H8z" } }] })(t);
}
function F6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM9 11V5h6v6H9zm6 2v6H9v-6h6zM5 5h2v2H5V5zm0 4h2v2H5V9zm0 4h2v2H5v-2zm0 4h2v2H5v-2zm14.002 2H17v-2h2.002v2zm-.001-4H17v-2h2.001v2zm0-4H17V9h2.001v2zM17 7V5h2v2h-2z" } }] })(t);
}
function q6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 3H5a1 1 0 0 0-1 1v2.59c0 .523.213 1.037.583 1.407L10 13.414V21a1.001 1.001 0 0 0 1.447.895l4-2c.339-.17.553-.516.553-.895v-5.586l5.417-5.417c.37-.37.583-.884.583-1.407V4a1 1 0 0 0-1-1zm-6.707 9.293A.996.996 0 0 0 14 13v5.382l-2 1V13a.996.996 0 0 0-.293-.707L6 6.59V5h14.001l.002 1.583-5.71 5.71z" } }] })(t);
}
function W6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 11h10v2H7zM4 7h16v2H4zm6 8h4v2h-4z" } }] })(t);
}
function G6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5.962 17.674C7 19.331 7 20.567 7 22h2c0-1.521 0-3.244-1.343-5.389l-1.695 1.063zM16.504 3.387C13.977 1.91 7.55.926 4.281 4.305c-3.368 3.481-2.249 9.072.001 11.392.118.122.244.229.369.333.072.061.146.116.205.184l1.494-1.33a3.918 3.918 0 0 0-.419-.391c-.072-.06-.146-.119-.214-.188-1.66-1.711-2.506-6.017.001-8.608 2.525-2.611 8.068-1.579 9.777-.581 2.691 1.569 4.097 4.308 4.109 4.333l1.789-.895c-.065-.135-1.668-3.289-4.889-5.167z" } }, { tag: "path", attr: { d: "M9.34 12.822c-1.03-1.26-1.787-2.317-1.392-3.506.263-.785.813-1.325 1.637-1.604 1.224-.41 2.92-.16 4.04.601l1.123-1.654c-1.648-1.12-3.982-1.457-5.804-.841-1.408.476-2.435 1.495-2.892 2.866-.776 2.328.799 4.254 1.74 5.405.149.183.29.354.409.512C11 18.323 11 20.109 11 22h2c0-2.036 0-4.345-3.201-8.601a19.71 19.71 0 0 0-.459-.577zm5.791-3.344c1.835 1.764 3.034 4.447 3.889 8.701l1.961-.395c-.939-4.678-2.316-7.685-4.463-9.748l-1.387 1.442z" } }, { tag: "path", attr: { d: "m11.556 9.169-1.115 1.66c.027.019 2.711 1.88 3.801 5.724l1.924-.545c-1.299-4.582-4.476-6.749-4.61-6.839zm3.132 9.29c.21 1.168.312 2.326.312 3.541h2c0-1.335-.112-2.608-.343-3.895l-1.969.354z" } }] })(t);
}
function X6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zM9 4h6v2H9V4zM4 18V8h16l.001 10H4z" } }, { tag: "path", attr: { d: "M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z" } }] })(t);
}
function K6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m16.293 17.707 1.414-1.414L13.414 12l4.293-4.293-1.414-1.414L10.586 12zM7 6h2v12H7z" } }] })(t);
}
function Y6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 4H6V2H4v18H3v2h4v-2H6v-5h13a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zm-1 9H6V6h12v7z" } }] })(t);
}
function Q6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 5h-8.586L9.707 3.293A.996.996 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM4 19V7h16l.002 12H4z" } }, { tag: "path", attr: { d: "M7.874 12h8v2h-8z" } }] })(t);
}
function J6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M2.165 19.551c.186.28.499.449.835.449h15c.4 0 .762-.238.919-.606l3-7A.998.998 0 0 0 21 11h-1V7c0-1.103-.897-2-2-2h-6.1L9.616 3.213A.997.997 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14h.007a1 1 0 0 0 .158.551zM17.341 18H4.517l2.143-5h12.824l-2.143 5zM18 7v4H6c-.4 0-.762.238-.919.606L4 14.129V7h14z" } }] })(t);
}
function Z6(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z" } }, { tag: "path", attr: { d: "M20 5h-8.586L9.707 3.293A.996.996 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM4 19V7h16l.002 12H4z" } }] })(t);
}
function tn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 5h-8.586L9.707 3.293A.997.997 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM4 19V7h16l.002 12H4z" } }] })(t);
}
function en(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 18h14v3H5zm7.5-14h-1c-.401 0-.764.24-.921.609L5.745 16h2.173l1.273-3h5.604l1.268 3h2.171L13.421 4.61A1 1 0 0 0 12.5 4zm-2.46 7 1.959-4.616L13.95 11h-3.91z" } }] })(t);
}
function an(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15 4h7v2h-7zm1 4h6v2h-6zm2 4h4v2h-4zM9.307 4l-6 16h2.137l1.875-5h6.363l1.875 5h2.137l-6-16H9.307zm-1.239 9L10.5 6.515 12.932 13H8.068z" } }] })(t);
}
function rn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m22 6-3-4-3 4h2v4h-2l3 4 3-4h-2V6zM9.307 4l-6 16h2.137l1.875-5h6.363l1.875 5h2.137l-6-16H9.307zm-1.239 9L10.5 6.515 12.932 13H8.068z" } }] })(t);
}
function nn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m11.307 4-6 16h2.137l1.875-5h6.363l1.875 5h2.137l-6-16h-2.387zm-1.239 9L12.5 6.515 14.932 13h-4.864z" } }] })(t);
}
function cn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 2h2v20H3zm7 4h7v2h-7zm0 4h7v2h-7z" } }, { tag: "path", attr: { d: "M19 2H6v20h13c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 18H8V4h11v16z" } }] })(t);
}
function ln(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 16H5V5h14v14z" } }, { tag: "circle", attr: { cx: "12", cy: "12", r: "5" } }] })(t);
}
function on(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.071 4.929a9.936 9.936 0 0 0-7.07-2.938 9.943 9.943 0 0 0-7.072 2.938c-3.899 3.898-3.899 10.243 0 14.142a9.94 9.94 0 0 0 7.073 2.938 9.936 9.936 0 0 0 7.07-2.937c3.899-3.898 3.899-10.243-.001-14.143zM12.181 4h-.359c.061-.001.119-.009.18-.009s.118.008.179.009zm6.062 13H16l-1.258 2.516a7.956 7.956 0 0 1-2.741.493 7.96 7.96 0 0 1-2.746-.494L8 17.01H5.765a7.96 7.96 0 0 1-1.623-3.532L6 11 4.784 8.567a7.936 7.936 0 0 1 1.559-2.224 7.994 7.994 0 0 1 3.22-1.969L12 6l2.438-1.625a8.01 8.01 0 0 1 3.22 1.968 7.94 7.94 0 0 1 1.558 2.221L18 11l1.858 2.478A7.952 7.952 0 0 1 18.243 17z" } }, { tag: "path", attr: { d: "m8.5 11 1.5 4h4l1.5-4L12 8.5z" } }] })(t);
}
function hn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 2 .001 5H10V7H8v2H6V4h12zM6 20v-9h2v3h2v-3h8.001l.001 9H6z" } }] })(t);
}
function sn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z" } }] })(t);
}
function vn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.937 7.53C19.227 4.119 15.803 2 12 2 6.486 2 2 6.486 2 12s4.486 10 10 10c3.803 0 7.227-2.119 8.937-5.53a1 1 0 0 0-.397-1.316L15.017 12l5.522-3.153c.461-.264.636-.842.398-1.317zm-8.433 3.602a.999.999 0 0 0 0 1.736l6.173 3.525A7.949 7.949 0 0 1 12 20c-4.411 0-8-3.589-8-8s3.589-8 8-8a7.95 7.95 0 0 1 6.677 3.606l-6.173 3.526z" } }, { tag: "circle", attr: { cx: "11.5", cy: "7.5", r: "1.5" } }] })(t);
}
function un(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m19.616 6.48.014-.017-4-3.24-1.26 1.554 2.067 1.674a2.99 2.99 0 0 0-1.395 3.058c.149.899.766 1.676 1.565 2.112.897.49 1.685.446 2.384.197L18.976 18a.996.996 0 0 1-1.39.922.995.995 0 0 1-.318-.217.996.996 0 0 1-.291-.705L17 16a2.98 2.98 0 0 0-.877-2.119A3 3 0 0 0 14 13h-1V5c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h7c1.103 0 2-.897 2-2v-4h1c.136 0 .267.027.391.078a1.028 1.028 0 0 1 .531.533A.994.994 0 0 1 15 16l-.024 2c0 .406.079.799.236 1.168.151.359.368.68.641.951a2.97 2.97 0 0 0 2.123.881c.406 0 .798-.078 1.168-.236.358-.15.68-.367.951-.641A2.983 2.983 0 0 0 20.976 18L21 9a2.997 2.997 0 0 0-1.384-2.52zM4 5h7l.001 4H4V5zm0 14v-8h7.001l.001 8H4zm14-9a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" } }] })(t);
}
function dn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2c-4.963 0-9 4.038-9 9v8h.051c.245 1.691 1.69 3 3.449 3 1.174 0 2.074-.417 2.672-1.174a3.99 3.99 0 0 0 5.668-.014c.601.762 1.504 1.188 2.66 1.188 1.93 0 3.5-1.57 3.5-3.5V11c0-4.962-4.037-9-9-9zm7 16.5c0 .827-.673 1.5-1.5 1.5-.449 0-1.5 0-1.5-2v-1h-2v1c0 1.103-.897 2-2 2s-2-.897-2-2v-1H8v1c0 1.845-.774 2-1.5 2-.827 0-1.5-.673-1.5-1.5V11c0-3.86 3.141-7 7-7s7 3.14 7 7v7.5z" } }, { tag: "circle", attr: { cx: "9", cy: "10", r: "2" } }, { tag: "circle", attr: { cx: "15", cy: "10", r: "2" } }] })(t);
}
function gn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 7h-1.209A4.92 4.92 0 0 0 19 5.5C19 3.57 17.43 2 15.5 2c-1.622 0-2.705 1.482-3.404 3.085C11.407 3.57 10.269 2 8.5 2 6.57 2 5 3.57 5 5.5c0 .596.079 1.089.209 1.5H4c-1.103 0-2 .897-2 2v2c0 1.103.897 2 2 2v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zm-4.5-3c.827 0 1.5.673 1.5 1.5C17 7 16.374 7 16 7h-2.478c.511-1.576 1.253-3 1.978-3zM7 5.5C7 4.673 7.673 4 8.5 4c.888 0 1.714 1.525 2.198 3H8c-.374 0-1 0-1-1.5zM4 9h7v2H4V9zm2 11v-7h5v7H6zm12 0h-5v-7h5v7zm-5-9V9.085L13.017 9H20l.001 2H13z" } }] })(t);
}
function fn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.5 4C15.57 4 14 5.57 14 7.5c0 1.554 1.025 2.859 2.43 3.315-.146.932-.547 1.7-1.23 2.323-1.946 1.773-5.527 1.935-7.2 1.907V8.837c1.44-.434 2.5-1.757 2.5-3.337C10.5 3.57 8.93 2 7 2S3.5 3.57 3.5 5.5c0 1.58 1.06 2.903 2.5 3.337v6.326c-1.44.434-2.5 1.757-2.5 3.337C3.5 20.43 5.07 22 7 22s3.5-1.57 3.5-3.5c0-.551-.14-1.065-.367-1.529 2.06-.186 4.657-.757 6.409-2.35 1.097-.997 1.731-2.264 1.904-3.768C19.915 10.438 21 9.1 21 7.5 21 5.57 19.43 4 17.5 4zm-12 1.5C5.5 4.673 6.173 4 7 4s1.5.673 1.5 1.5S7.827 7 7 7s-1.5-.673-1.5-1.5zM7 20c-.827 0-1.5-.673-1.5-1.5a1.5 1.5 0 0 1 1.482-1.498l.13.01A1.495 1.495 0 0 1 7 20zM17.5 9c-.827 0-1.5-.673-1.5-1.5S16.673 6 17.5 6s1.5.673 1.5 1.5S18.327 9 17.5 9z" } }] })(t);
}
function pn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 6c-2.967 0-5.431 2.167-5.909 5H2v2h4.092c.479 2.832 2.942 4.998 5.909 4.998s5.43-2.166 5.909-4.998H22v-2h-4.09c-.478-2.833-2.942-5-5.91-5zm0 9.998c-2.205 0-3.999-1.794-3.999-3.999S9.795 8 12 8c2.206 0 4 1.794 4 3.999s-1.794 3.999-4 3.999z" } }] })(t);
}
function zn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6.01 2c-1.93 0-3.5 1.57-3.5 3.5 0 1.58 1.06 2.903 2.5 3.337v7.16c-.001.179.027 1.781 1.174 2.931C6.892 19.64 7.84 20 9 20v2l4-3-4-3v2c-1.823 0-1.984-1.534-1.99-2V8.837c1.44-.434 2.5-1.757 2.5-3.337 0-1.93-1.571-3.5-3.5-3.5zm0 5c-.827 0-1.5-.673-1.5-1.5S5.183 4 6.01 4s1.5.673 1.5 1.5S6.837 7 6.01 7zm13 8.163V7.997C19.005 6.391 17.933 4 15 4V2l-4 3 4 3V6c1.829 0 2.001 1.539 2.01 2v7.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337zm-1 4.837c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5z" } }] })(t);
}
function mn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M2.5 18.5C2.5 20.43 4.07 22 6 22s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337v-3.488c.244.273.509.527.813.744 1.18.844 2.617 1.098 3.918 1.098.966 0 1.853-.14 2.506-.281a3.5 3.5 0 0 0 3.264 2.265c1.93 0 3.5-1.57 3.5-3.5s-1.57-3.5-3.5-3.5a3.5 3.5 0 0 0-3.404 2.718c-1.297.321-3.664.616-5.119-.426-.666-.477-1.09-1.239-1.306-2.236C8.755 7.96 9.5 6.821 9.5 5.5 9.5 3.57 7.93 2 6 2S2.5 3.57 2.5 5.5c0 1.58 1.06 2.903 2.5 3.337v6.326c-1.44.434-2.5 1.757-2.5 3.337zm15-8c.827 0 1.5.673 1.5 1.5s-.673 1.5-1.5 1.5S16 12.827 16 12s.673-1.5 1.5-1.5zm-10 8c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5S5.173 17 6 17s1.5.673 1.5 1.5zm-3-13C4.5 4.673 5.173 4 6 4s1.5.673 1.5 1.5S6.827 7 6 7s-1.5-.673-1.5-1.5z" } }] })(t);
}
function Mn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.01 15.163V7.997C19.005 6.391 17.933 4 15 4V2l-4 3 4 3V6c1.829 0 2.001 1.539 2.01 2v7.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337zm-1 4.837c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zM9.5 5.5C9.5 3.57 7.93 2 6 2S2.5 3.57 2.5 5.5c0 1.58 1.06 2.903 2.5 3.337v6.326c-1.44.434-2.5 1.757-2.5 3.337C2.5 20.43 4.07 22 6 22s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V8.837C8.44 8.403 9.5 7.08 9.5 5.5zm-5 0C4.5 4.673 5.173 4 6 4s1.5.673 1.5 1.5S6.827 7 6 7s-1.5-.673-1.5-1.5zm3 13c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5S5.173 17 6 17s1.5.673 1.5 1.5z" } }] })(t);
}
function Bn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5.559 8.855c.166 1.183.789 3.207 3.087 4.079C11 13.829 11 14.534 11 15v.163c-1.44.434-2.5 1.757-2.5 3.337 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.58-1.06-2.903-2.5-3.337V15c0-.466 0-1.171 2.354-2.065 2.298-.872 2.921-2.896 3.087-4.079C19.912 8.441 21 7.102 21 5.5 21 3.57 19.43 2 17.5 2S14 3.57 14 5.5c0 1.552 1.022 2.855 2.424 3.313-.146.735-.565 1.791-1.778 2.252-1.192.452-2.053.953-2.646 1.536-.593-.583-1.453-1.084-2.646-1.536-1.213-.461-1.633-1.517-1.778-2.252C8.978 8.355 10 7.052 10 5.5 10 3.57 8.43 2 6.5 2S3 3.57 3 5.5c0 1.602 1.088 2.941 2.559 3.355zM17.5 4c.827 0 1.5.673 1.5 1.5S18.327 7 17.5 7 16 6.327 16 5.5 16.673 4 17.5 4zm-4 14.5c0 .827-.673 1.5-1.5 1.5s-1.5-.673-1.5-1.5.673-1.5 1.5-1.5 1.5.673 1.5 1.5zM6.5 4C7.327 4 8 4.673 8 5.5S7.327 7 6.5 7 5 6.327 5 5.5 5.673 4 6.5 4z" } }] })(t);
}
function Hn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.948 11.684-2-6A.997.997 0 0 0 19 5h-3v2h2.279l1.334 4H15c-1.103 0-2 .897-2 2h-2c0-1.103-.897-2-2-2H4.387l1.334-4H8V5H5a.998.998 0 0 0-.948.684l-2 6 .012.004A.928.928 0 0 0 2 12v4c0 1.654 1.346 3 3 3h3c1.654 0 3-1.346 3-3v-1h2v1c0 1.654 1.346 3 3 3h3c1.654 0 3-1.346 3-3v-4a.964.964 0 0 0-.063-.313l.011-.003zM9 16c0 .551-.448 1-1 1H5c-.552 0-1-.449-1-1v-3h5v3zm11 0c0 .551-.448 1-1 1h-3c-.552 0-1-.449-1-1v-3h5v3z" } }] })(t);
}
function wn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.977 13.783-2-9A1.002 1.002 0 0 0 19 4h-3v2h2.198l.961 4.326A4.467 4.467 0 0 0 17.5 10c-1.953 0-3.603 1.258-4.224 3h-2.553c-.621-1.742-2.271-3-4.224-3-.587 0-1.145.121-1.659.326L5.802 6H8V4H5a1 1 0 0 0-.976.783l-2 9 .047.011A4.552 4.552 0 0 0 2 14.5C2 16.981 4.019 19 6.5 19c2.31 0 4.197-1.756 4.449-4h2.102c.252 2.244 2.139 4 4.449 4 2.481 0 4.5-2.019 4.5-4.5 0-.242-.034-.475-.071-.706l.048-.011zM6.5 17C5.122 17 4 15.878 4 14.5S5.122 12 6.5 12 9 13.122 9 14.5 7.878 17 6.5 17zm11 0c-1.379 0-2.5-1.122-2.5-2.5s1.121-2.5 2.5-2.5 2.5 1.122 2.5 2.5-1.121 2.5-2.5 2.5z" } }] })(t);
}
function xn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 18.791V20H9v2h6v-2h-2v-1.845a9.934 9.934 0 0 0 3.071-2.084c3.898-3.898 3.898-10.243 0-14.143l-1.414 1.414c3.119 3.12 3.119 8.195 0 11.314-3.119 3.118-8.195 3.12-11.314 0L1.929 16.07A9.971 9.971 0 0 0 9 18.994a9.98 9.98 0 0 0 2-.203z" } }, { tag: "path", attr: { d: "M3 9c0 3.309 2.691 6 6 6s6-2.691 6-6-2.691-6-6-6-6 2.691-6 6zm10 0c0 2.206-1.794 4-4 4s-4-1.794-4-4 1.794-4 4-4 4 1.794 4 4z" } }] })(t);
}
function Vn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 0 0-1.792-6.243A8.013 8.013 0 0 1 19.931 11zM12.53 4.027c1.035 1.364 2.427 3.78 2.627 6.973H9.03c.139-2.596.994-5.028 2.451-6.974.172-.01.344-.026.519-.026.179 0 .354.016.53.027zm-3.842.7C7.704 6.618 7.136 8.762 7.03 11H4.069a8.013 8.013 0 0 1 4.619-6.273zM4.069 13h2.974c.136 2.379.665 4.478 1.556 6.23A8.01 8.01 0 0 1 4.069 13zm7.381 6.973C10.049 18.275 9.222 15.896 9.041 13h6.113c-.208 2.773-1.117 5.196-2.603 6.972-.182.012-.364.028-.551.028-.186 0-.367-.016-.55-.027zm4.011-.772c.955-1.794 1.538-3.901 1.691-6.201h2.778a8.005 8.005 0 0 1-4.469 6.201z" } }] })(t);
}
function yn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm5 2h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm1-6h4v4h-4V5zM3 20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6zm2-5h4v4H5v-4zm8 5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6zm2-5h4v4h-4v-4z" } }] })(t);
}
function Cn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 7h4v4h-4zm6 0h4v4h-4zM4 7h4v4H4zm6 6h4v4h-4zm6 0h4v4h-4zM4 13h4v4H4z" } }] })(t);
}
function Ln(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 7h4v4H7zm0 6h4v4H7zm6-6h4v4h-4zm0 6h4v4h-4z" } }] })(t);
}
function _n(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 10h4v4H7zm0-6h4v4H7zm0 12h4v4H7zm6-6h4v4h-4zm0-6h4v4h-4zm0 12h4v4h-4z" } }] })(t);
}
function An(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15 3H4.984c-1.103 0-2 .897-2 2v14.016c0 1.103.897 2 2 2H19c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-4zm4 5h-3V5h3v3zM4.984 10h3v4.016h-3V10zm5 0H14v4.016H9.984V10zM16 10h3v4.016h-3V10zm-2-5v3H9.984V5H14zM7.984 5v3h-3V5h3zm-3 11.016h3v3h-3v-3zm5 3v-3H14v3H9.984zm6.016 0v-3h3.001v3H16z" } }] })(t);
}
function bn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.604 11.048a5.67 5.67 0 0 0 .751-3.44c-.179-1.784-1.175-3.361-2.803-4.44l-1.105 1.666c1.119.742 1.8 1.799 1.918 2.974a3.693 3.693 0 0 1-1.072 2.986l-1.192 1.192 1.618.475C18.951 13.701 19 17.957 19 18h2c0-1.789-.956-5.285-4.396-6.952z" } }, { tag: "path", attr: { d: "M9.5 12c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm1.5 7H8c-3.309 0-6 2.691-6 6v1h2v-1c0-2.206 1.794-4 4-4h3c2.206 0 4 1.794 4 4v1h2v-1c0-3.309-2.691-6-6-6z" } }] })(t);
}
function Pn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "9", cy: "4", r: "2" } }, { tag: "path", attr: { d: "M16.98 14.804A1 1 0 0 0 16 14h-4.133l-.429-3H16V9h-4.847l-.163-1.142A1 1 0 0 0 10 7H9a1.003 1.003 0 0 0-.99 1.142l.877 6.142A2.009 2.009 0 0 0 10.867 16h4.313l.839 4.196c.094.467.504.804.981.804h3v-2h-2.181l-.839-4.196z" } }, { tag: "path", attr: { d: "M12.51 17.5c-.739 1.476-2.25 2.5-4.01 2.5A4.505 4.505 0 0 1 4 15.5a4.503 4.503 0 0 1 2.817-4.167l-.289-2.025C3.905 10.145 2 12.604 2 15.5 2 19.084 4.916 22 8.5 22a6.497 6.497 0 0 0 5.545-3.126l-.274-1.374H12.51z" } }] })(t);
}
function Sn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "8.5", cy: "9.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.493", cy: "9.493", r: "1.493" } }, { tag: "path", attr: { d: "M12 18c5 0 6-5 6-5H6s1 5 6 5z" } }] })(t);
}
function En(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 18c4 0 5-4 5-4H7s1 4 5 4z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "m13 12 2 .012c.012-.462.194-1.012 1-1.012s.988.55 1 1h2c0-1.206-.799-3-3-3s-3 1.794-3 3zm-5-1c.806 0 .988.55 1 1h2c0-1.206-.799-3-3-3s-3 1.794-3 3l2 .012C7.012 11.55 7.194 11 8 11z" } }] })(t);
}
function Rn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 18c4 0 5-4 5-4H7s1 4 5 4z" } }, { tag: "path", attr: { d: "M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z" } }, { tag: "path", attr: { d: "m8.535 12.634 2.05-2.083a1.485 1.485 0 0 0-.018-2.118 1.49 1.49 0 0 0-2.065-.034 1.488 1.488 0 0 0-2.067.068c-.586.6-.579 1.53.019 2.117l2.081 2.05zm7 0 2.05-2.083a1.485 1.485 0 0 0-.018-2.118 1.49 1.49 0 0 0-2.065-.034 1.488 1.488 0 0 0-2.068.067c-.586.6-.579 1.53.019 2.117l2.082 2.051z" } }] })(t);
}
function Tn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "8.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.493", cy: "10.493", r: "1.493" } }, { tag: "path", attr: { d: "M12 18c4 0 5-4 5-4H7s1 4 5 4z" } }] })(t);
}
function On(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.018 3.815 15.232 8h-4.966l.716-3.815-1.964-.37L8.232 8H4v2h3.857l-.751 4H3v2h3.731l-.714 3.805 1.965.369L8.766 16h4.966l-.714 3.805 1.965.369.783-4.174H20v-2h-3.859l.751-4H21V8h-3.733l.716-3.815-1.965-.37zM14.106 14H9.141l.751-4h4.966l-.752 4z" } }] })(t);
}
function Nn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.983 13.821-1.851-10.18A1.998 1.998 0 0 0 18.165 2H5.835a2 2 0 0 0-1.968 1.643l-1.85 10.178.019.003c-.012.06-.036.114-.036.176v5c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-5c0-.063-.024-.116-.035-.176l.018-.003zM5.835 4h12.331l1.637 9H4.198l1.637-9zM4 19v-4h16l.002 4H4z" } }, { tag: "path", attr: { d: "M17 16h2v2h-2zm-3 0h2v2h-2z" } }] })(t);
}
function $n(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 20V4h-3v6H9V4H6v16h3v-7h6v7z" } }] })(t);
}
function In(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 12v-1.707c0-4.442-3.479-8.161-7.755-8.29-2.204-.051-4.251.736-5.816 2.256A7.933 7.933 0 0 0 4 10v2c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h2V10a5.95 5.95 0 0 1 1.821-4.306 5.977 5.977 0 0 1 4.363-1.691C15.392 4.099 18 6.921 18 10.293V20h2c1.103 0 2-.897 2-2v-4c0-1.103-.897-2-2-2z" } }, { tag: "path", attr: { d: "M7 12h2v8H7zm8 0h2v8h-2z" } }] })(t);
}
function Dn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.649 5.286 14 8.548V2.025h-4v6.523L4.351 5.286l-2 3.465 5.648 3.261-5.648 3.261 2 3.465L10 15.477V22h4v-6.523l5.649 3.261 2-3.465-5.648-3.261 5.648-3.261z" } }] })(t);
}
function kn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12.279 8.833 12 9.112l-.279-.279a2.745 2.745 0 0 0-3.906 0 2.745 2.745 0 0 0 0 3.907L12 16.926l4.186-4.186a2.745 2.745 0 0 0 0-3.907 2.746 2.746 0 0 0-3.907 0z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function jn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m11.998 17 4.186-4.186a2.745 2.745 0 0 0 0-3.907 2.746 2.746 0 0 0-3.907 0l-.278.279-.279-.279a2.746 2.746 0 0 0-3.907 0 2.746 2.746 0 0 0 0 3.907L11.998 17z" } }, { tag: "path", attr: { d: "M21 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4zm-2 15H5V5h14v14z" } }] })(t);
}
function Un(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 4.595a5.904 5.904 0 0 0-3.996-1.558 5.942 5.942 0 0 0-4.213 1.758c-2.353 2.363-2.352 6.059.002 8.412l7.332 7.332c.17.299.498.492.875.492a.99.99 0 0 0 .792-.409l7.415-7.415c2.354-2.354 2.354-6.049-.002-8.416a5.938 5.938 0 0 0-4.209-1.754A5.906 5.906 0 0 0 12 4.595zm6.791 1.61c1.563 1.571 1.564 4.025.002 5.588L12 18.586l-6.793-6.793c-1.562-1.563-1.561-4.017-.002-5.584.76-.756 1.754-1.172 2.799-1.172s2.035.416 2.789 1.17l.5.5a.999.999 0 0 0 1.414 0l.5-.5c1.512-1.509 4.074-1.505 5.584-.002z" } }] })(t);
}
function Fn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 6a3.939 3.939 0 0 0-3.934 3.934h2C10.066 8.867 10.934 8 12 8s1.934.867 1.934 1.934c0 .598-.481 1.032-1.216 1.626a9.208 9.208 0 0 0-.691.599c-.998.997-1.027 2.056-1.027 2.174V15h2l-.001-.633c.001-.016.033-.386.441-.793.15-.15.339-.3.535-.458.779-.631 1.958-1.584 1.958-3.182A3.937 3.937 0 0 0 12 6zm-1 10h2v2h-2z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function qn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 19c.946 0 1.81-.103 2.598-.281l-1.757-1.757c-.273.021-.55.038-.841.038-5.351 0-7.424-3.846-7.926-5a8.642 8.642 0 0 1 1.508-2.297L4.184 8.305c-1.538 1.667-2.121 3.346-2.132 3.379a.994.994 0 0 0 0 .633C2.073 12.383 4.367 19 12 19zm0-14c-1.837 0-3.346.396-4.604.981L3.707 2.293 2.293 3.707l18 18 1.414-1.414-3.319-3.319c2.614-1.951 3.547-4.615 3.561-4.657a.994.994 0 0 0 0-.633C21.927 11.617 19.633 5 12 5zm4.972 10.558-2.28-2.28c.19-.39.308-.819.308-1.278 0-1.641-1.359-3-3-3-.459 0-.888.118-1.277.309L8.915 7.501A9.26 9.26 0 0 1 12 7c5.351 0 7.424 3.846 7.926 5-.302.692-1.166 2.342-2.954 3.558z" } }] })(t);
}
function Wn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.707 5.826-3.535-3.533a.999.999 0 0 0-1.408-.006L7.096 10.82a1.01 1.01 0 0 0-.273.488l-1.024 4.437L4 18h2.828l1.142-1.129 3.588-.828c.18-.042.345-.133.477-.262l8.667-8.535a1 1 0 0 0 .005-1.42zm-9.369 7.833-2.121-2.12 7.243-7.131 2.12 2.12-7.242 7.131zM4 20h16v2H4z" } }] })(t);
}
function Gn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 8v5h5v-2h-3V8z" } }, { tag: "path", attr: { d: "M21.292 8.497a8.957 8.957 0 0 0-1.928-2.862 9.004 9.004 0 0 0-4.55-2.452 9.09 9.09 0 0 0-3.626 0 8.965 8.965 0 0 0-4.552 2.453 9.048 9.048 0 0 0-1.928 2.86A8.963 8.963 0 0 0 4 12l.001.025H2L5 16l3-3.975H6.001L6 12a6.957 6.957 0 0 1 1.195-3.913 7.066 7.066 0 0 1 1.891-1.892 7.034 7.034 0 0 1 2.503-1.054 7.003 7.003 0 0 1 8.269 5.445 7.117 7.117 0 0 1 0 2.824 6.936 6.936 0 0 1-1.054 2.503c-.25.371-.537.72-.854 1.036a7.058 7.058 0 0 1-2.225 1.501 6.98 6.98 0 0 1-1.313.408 7.117 7.117 0 0 1-2.823 0 6.957 6.957 0 0 1-2.501-1.053 7.066 7.066 0 0 1-1.037-.855l-1.414 1.414A8.985 8.985 0 0 0 13 21a9.05 9.05 0 0 0 3.503-.707 9.009 9.009 0 0 0 3.959-3.26A8.968 8.968 0 0 0 22 12a8.928 8.928 0 0 0-.708-3.503z" } }] })(t);
}
function Xn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.895 7.553-2-4A1.001 1.001 0 0 0 18 3h-5c-.379 0-.725.214-.895.553L10.382 7H6c-.379 0-.725.214-.895.553l-2 4a1 1 0 0 0 0 .895l2 4c.17.338.516.552.895.552h4.382l1.724 3.447A.998.998 0 0 0 13 21h5c.379 0 .725-.214.895-.553l2-4a1 1 0 0 0 0-.895L19.118 12l1.776-3.553a1 1 0 0 0 .001-.894zM13.618 5h3.764l1.5 3-1.5 3h-3.764l-1.5-3 1.5-3zm-8.5 7 1.5-3h3.764l1.5 3-1.5 3H6.618l-1.5-3zm12.264 7h-3.764l-1.5-3 1.5-3h3.764l1.5 3-1.5 3z" } }] })(t);
}
function Kn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 22h14a2 2 0 0 0 2-2v-9a1 1 0 0 0-.29-.71l-8-8a1 1 0 0 0-1.41 0l-8 8A1 1 0 0 0 3 11v9a2 2 0 0 0 2 2zm5-2v-5h4v5zm-5-8.59 7-7 7 7V20h-3v-5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v5H5z" } }] })(t);
}
function Yn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm9-8.586 6 6V15l.001 5H6v-9.585l6-6.001z" } }, { tag: "path", attr: { d: "M12 17c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z" } }] })(t);
}
function Qn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12.223 11.641-.223.22-.224-.22a2.224 2.224 0 0 0-3.125 0 2.13 2.13 0 0 0 0 3.07L12 18l3.349-3.289a2.13 2.13 0 0 0 0-3.07 2.225 2.225 0 0 0-3.126 0z" } }, { tag: "path", attr: { d: "m21.707 11.293-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707zM18.001 20H6v-9.585l6-6 6 6V15l.001 5z" } }] })(t);
}
function Jn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm9-8.586 6 6V15l.001 5H6v-9.586l6-6z" } }, { tag: "path", attr: { d: "M12 18c3.703 0 4.901-3.539 4.95-3.689l-1.9-.621c-.008.023-.781 2.31-3.05 2.31-2.238 0-3.02-2.221-3.051-2.316l-1.899.627C7.099 14.461 8.297 18 12 18z" } }] })(t);
}
function Zn(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.586 6 6V15l.001 5H16v-5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H6v-9.586l6-6z" } }] })(t);
}
function tc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m5.005 15.995 4-4-4-4v3h-3v2h3zm14-5v-3l-4 4 4 4v-3h3v-2h-2.072zm-8 7h2v3h-2zm0-5h2v3h-2zm0-5h2v3h-2zm0-5h2v3h-2z" } }] })(t);
}
function ec(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "7.5", cy: "11.5", r: "2.5" } }, { tag: "path", attr: { d: "M17.205 7H12a1 1 0 0 0-1 1v7H4V6H2v14h2v-3h16v3h2v-8.205A4.8 4.8 0 0 0 17.205 7zM13 15V9h4.205A2.798 2.798 0 0 1 20 11.795V15h-7z" } }] })(t);
}
function ac(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15.566 11.021A7.016 7.016 0 0 0 19 5V4h1V2H4v2h1v1a7.016 7.016 0 0 0 3.434 6.021c.354.208.566.545.566.9v.158c0 .354-.212.69-.566.9A7.016 7.016 0 0 0 5 19v1H4v2h16v-2h-1v-1a7.014 7.014 0 0 0-3.433-6.02c-.355-.21-.567-.547-.567-.901v-.158c0-.355.212-.692.566-.9zm-1.015 3.681A5.008 5.008 0 0 1 17 19v1H7v-1a5.01 5.01 0 0 1 2.45-4.299c.971-.573 1.55-1.554 1.55-2.622v-.158c0-1.069-.58-2.051-1.551-2.623A5.008 5.008 0 0 1 7 5V4h10v1c0 1.76-.938 3.406-2.449 4.298C13.58 9.87 13 10.852 13 11.921v.158c0 1.068.579 2.049 1.551 2.623z" } }] })(t);
}
function rc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9.715 12c1.151 0 2-.849 2-2s-.849-2-2-2-2 .849-2 2 .848 2 2 2z" } }, { tag: "path", attr: { d: "M20 4H4c-1.103 0-2 .841-2 1.875v12.25C2 19.159 2.897 20 4 20h16c1.103 0 2-.841 2-1.875V5.875C22 4.841 21.103 4 20 4zm0 14-16-.011V6l16 .011V18z" } }, { tag: "path", attr: { d: "M14 9h4v2h-4zm1 4h3v2h-3zm-1.57 2.536c0-1.374-1.676-2.786-3.715-2.786S6 14.162 6 15.536V16h7.43v-.464z" } }] })(t);
}
function nc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 5h13v7h2V5c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h8v-2H4V5z" } }, { tag: "path", attr: { d: "m8 11-3 4h11l-4-6-3 4z" } }, { tag: "path", attr: { d: "M19 14h-2v3h-3v2h3v3h2v-3h3v-2h-3z" } }] })(t);
}
function cc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z" } }, { tag: "path", attr: { d: "m10 14-1-1-3 4h12l-5-7z" } }] })(t);
}
function ic(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "7.499", cy: "9.5", r: "1.5" } }, { tag: "path", attr: { d: "m10.499 14-1.5-2-3 4h12l-4.5-6z" } }, { tag: "path", attr: { d: "M19.999 4h-16c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-16 14V6h16l.002 12H3.999z" } }] })(t);
}
function lc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H8c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM8 16V4h12l.002 12H8z" } }, { tag: "path", attr: { d: "M4 8H2v12c0 1.103.897 2 2 2h12v-2H4V8z" } }, { tag: "path", attr: { d: "m12 12-1-1-2 3h10l-4-6z" } }] })(t);
}
function oc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12 18 4-5h-3V2h-2v11H8z" } }, { tag: "path", attr: { d: "M19 9h-4v2h4v9H5v-9h4V9H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2z" } }] })(t);
}
function hc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17 7c-2.094 0-3.611 1.567-5.001 3.346C10.609 8.567 9.093 7 7 7c-2.757 0-5 2.243-5 5a4.98 4.98 0 0 0 1.459 3.534A4.956 4.956 0 0 0 6.99 17h.012c2.089-.005 3.605-1.572 4.996-3.351C13.389 15.431 14.906 17 17 17c2.757 0 5-2.243 5-5s-2.243-5-5-5zM6.998 15l-.008 1v-1c-.799 0-1.55-.312-2.114-.878A3.004 3.004 0 0 1 7 9c1.33 0 2.56 1.438 3.746 2.998C9.558 13.557 8.328 14.997 6.998 15zM17 15c-1.33 0-2.561-1.44-3.749-3.002C14.438 10.438 15.668 9 17 9c1.654 0 3 1.346 3 3s-1.346 3-3 3z" } }] })(t);
}
function sc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M11 11h2v6h-2zm0-4h2v2h-2z" } }] })(t);
}
function vc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 16H5V5h14v14z" } }, { tag: "path", attr: { d: "M11 7h2v2h-2zm0 4h2v6h-2z" } }] })(t);
}
function uc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 16h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2zm9.001-2L14 10h.001v4zM19 10l.001 9H10v-3h4c1.103 0 2-.897 2-2v-4h3zM5 5h9v3h-4c-1.103 0-2 .897-2 2v4H5V5z" } }] })(t);
}
function dc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 7V4H9v3h2.868L9.012 17H5v3h10v-3h-2.868l2.856-10z" } }] })(t);
}
function gc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "15", cy: "13", r: "1" } }, { tag: "circle", attr: { cx: "17", cy: "11", r: "1" } }, { tag: "path", attr: { d: "M10 9H8v2H6v2h2v2h2v-2h2v-2h-2z" } }, { tag: "path", attr: { d: "M15 5H9a7 7 0 0 0-7 7 7 7 0 0 0 7 7h6a7 7 0 0 0 7-7 7 7 0 0 0-7-7zm0 12H9A5 5 0 1 1 9 7h6a5 5 0 1 1 0 10z" } }] })(t);
}
function fc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 7h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v3H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2h3v3c0 1.103.897 2 2 2h6c1.103 0 2-.897 2-2v-3h3c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zm0 8h-5v4h.001v1H9v-5H4V9h5V4h6v5h5v6z" } }, { tag: "path", attr: { d: "M8 14v-4l-3 2zm8 0 3-2-3-2zm-6-6h4l-2-3zm2 11 2-3h-4z" } }, { tag: "circle", attr: { cx: "12", cy: "12", r: "2" } }] })(t);
}
function pc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M22 8.65A5 5 0 0 0 17 4H7a5 5 0 0 0-5 4.74A2 2 0 0 0 2 9v7.5A3.48 3.48 0 0 0 5.5 20c1.43 0 2.32-1.06 3.19-2.09.32-.37.65-.76 1-1.1a4.81 4.81 0 0 1 1.54-.75 6.61 6.61 0 0 1 1.54 0 4.81 4.81 0 0 1 1.54.75c.35.34.68.73 1 1.1.87 1 1.76 2.09 3.19 2.09a3.48 3.48 0 0 0 3.5-3.5V9a2.09 2.09 0 0 0 0-.26zm-2 7.85a1.5 1.5 0 0 1-1.5 1.5c-.5 0-1-.64-1.66-1.38-.34-.39-.72-.85-1.15-1.26a6.68 6.68 0 0 0-2.46-1.25 6.93 6.93 0 0 0-2.46 0 6.68 6.68 0 0 0-2.46 1.25c-.43.41-.81.87-1.15 1.26C6.54 17.36 6 18 5.5 18A1.5 1.5 0 0 1 4 16.5V9a.77.77 0 0 0 0-.15A3 3 0 0 1 7 6h10a3 3 0 0 1 3 2.72v.12A.86.86 0 0 0 20 9z" } }, { tag: "circle", attr: { cx: "16", cy: "12", r: "1" } }, { tag: "circle", attr: { cx: "18", cy: "10", r: "1" } }, { tag: "circle", attr: { cx: "16", cy: "8", r: "1" } }, { tag: "circle", attr: { cx: "14", cy: "10", r: "1" } }, { tag: "circle", attr: { cx: "8", cy: "10", r: "2" } }] })(t);
}
function zc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 17a5.007 5.007 0 0 0 4.898-4H14v2h2v-2h2v3h2v-3h1v-2h-9.102A5.007 5.007 0 0 0 7 7c-2.757 0-5 2.243-5 5s2.243 5 5 5zm0-8c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3z" } }] })(t);
}
function mc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.813 4.419A.997.997 0 0 0 16 4H3a1 1 0 0 0-.813 1.581L6.771 12l-4.585 6.419A1 1 0 0 0 3 20h13a.997.997 0 0 0 .813-.419l5-7a.997.997 0 0 0 0-1.162l-5-7zM15.485 18H4.943l3.87-5.419a.997.997 0 0 0 0-1.162L4.943 6h10.542l4.286 6-4.286 6z" } }] })(t);
}
function Mc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 20h18a1 1 0 0 0 .864-1.504l-7-12c-.359-.615-1.369-.613-1.729 0L9.866 12.1l-1.02-1.632A.998.998 0 0 0 8 10h-.001a1 1 0 0 0-.847.47l-5 8A1 1 0 0 0 3 20zM14 8.985 19.259 18h-5.704l-2.486-3.987L14 8.985zm-5.999 3.9L11.197 18H4.805l3.196-5.115zM6 8c1.654 0 3-1.346 3-3S7.654 2 6 2 3 3.346 3 5s1.346 3 3 3zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" } }] })(t);
}
function Bc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 17.722c.595-.347 1-.985 1-1.722V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v11c0 .736.405 1.375 1 1.722V18H2v2h20v-2h-2v-.278zM5 16V5h14l.002 11H5z" } }] })(t);
}
function Hc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7.707 17.707 13.414 12 7.707 6.293 6.293 7.707 10.586 12l-4.293 4.293zM15 6h2v12h-2z" } }] })(t);
}
function wc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M12 18c4 0 5-4 5-4H7s1 4 5 4zm5.555-9.168-1.109-1.664-3 2a1.001 1.001 0 0 0 .108 1.727l4 2 .895-1.789-2.459-1.229 1.565-1.045zm-6.557 1.23a1 1 0 0 0-.443-.894l-3-2-1.11 1.664 1.566 1.044-2.459 1.229.895 1.789 4-2a.998.998 0 0 0 .551-.832z" } }] })(t);
}
function xc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m2.513 12.833 9.022 5.04a.995.995 0 0 0 .973.001l8.978-5a1 1 0 0 0-.002-1.749l-9.022-5a1 1 0 0 0-.968-.001l-8.978 4.96a1 1 0 0 0-.003 1.749zm9.464-4.69 6.964 3.859-6.917 3.853-6.964-3.89 6.917-3.822z" } }, { tag: "path", attr: { d: "m3.485 15.126-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.971-1.748L12 19.856l-8.515-4.73zM16 4h6v2h-6z" } }] })(t);
}
function Vc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.484 11.125-9.022-5a1 1 0 0 0-.968-.001l-8.978 4.96a1 1 0 0 0-.003 1.749l9.022 5.04a.995.995 0 0 0 .973.001l8.978-5a1 1 0 0 0-.002-1.749zm-9.461 4.73-6.964-3.89 6.917-3.822 6.964 3.859-6.917 3.853z" } }, { tag: "path", attr: { d: "M12 22a.994.994 0 0 0 .485-.126l9-5-.971-1.748L12 19.856l-8.515-4.73-.971 1.748 9 5A1 1 0 0 0 12 22zm8-20h-2v2h-2v2h2v2h2V6h2V4h-2z" } }] })(t);
}
function yc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M22 7.999a1 1 0 0 0-.516-.874l-9.022-5a1.003 1.003 0 0 0-.968 0l-8.978 4.96a1 1 0 0 0-.003 1.748l9.022 5.04a.995.995 0 0 0 .973.001l8.978-5A1 1 0 0 0 22 7.999zm-9.977 3.855L5.06 7.965l6.917-3.822 6.964 3.859-6.918 3.852z" } }, { tag: "path", attr: { d: "M20.515 11.126 12 15.856l-8.515-4.73-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.97-1.748z" } }, { tag: "path", attr: { d: "M20.515 15.126 12 19.856l-8.515-4.73-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.97-1.748z" } }] })(t);
}
function Cc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm0 2 .001 4H5V5h14zM5 11h8v8H5v-8zm10 8v-8h4.001l.001 8H15z" } }] })(t);
}
function Lc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12.707 17.293 8.414 13H18v-2H8.414l4.293-4.293-1.414-1.414L4.586 12l6.707 6.707z" } }] })(t);
}
function _c(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.999 1.993C6.486 1.994 2 6.48 1.999 11.994c0 5.514 4.486 10 10.001 10 5.514-.001 10-4.487 10-10 0-5.514-4.486-10-10.001-10.001zM12 19.994c-4.412 0-8.001-3.589-8.001-8 .001-4.411 3.59-8 8-8.001C16.411 3.994 20 7.583 20 11.994c0 4.41-3.589 7.999-8 8z" } }, { tag: "path", attr: { d: "m12.012 7.989-4.005 4.005 4.005 4.004v-3.004h3.994v-2h-3.994z" } }] })(t);
}
function Ac(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.464 2.114a.998.998 0 0 0-1.033.063l-13 9a1.003 1.003 0 0 0 0 1.645l13 9A1 1 0 0 0 19 21V3a1 1 0 0 0-.536-.886zM17 19.091 6.757 12 17 4.909v14.182z" } }] })(t);
}
function bc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12.006 2.007A9.93 9.93 0 0 0 4.935 4.93c-3.898 3.898-3.898 10.242 0 14.142 1.885 1.885 4.396 2.923 7.071 2.923s5.187-1.038 7.071-2.923c3.898-3.899 3.898-10.243 0-14.142a9.931 9.931 0 0 0-7.071-2.923zm5.657 15.65c-1.507 1.507-3.516 2.337-5.657 2.337s-4.15-.83-5.657-2.337c-3.118-3.119-3.118-8.194 0-11.313 1.507-1.507 3.517-2.337 5.657-2.337s4.15.83 5.657 2.337c3.118 3.119 3.118 8.194 0 11.313z" } }, { tag: "path", attr: { d: "m14.346 8.247-3.215 3.215-2.125-2.125V15h5.663l-2.124-2.124 3.215-3.215z" } }] })(t);
}
function Pc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 7h10v2H4zm0-4h16v2H4zm0 8h10v2H4zm0 4h10v2H4zm0 4h16v2H4zm16-3V8l-4 4z" } }] })(t);
}
function Sc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.993 2.007a9.928 9.928 0 0 0-7.071 2.922c-3.899 3.899-3.899 10.243 0 14.143a9.931 9.931 0 0 0 7.071 2.923 9.928 9.928 0 0 0 7.071-2.923c3.899-3.899 3.899-10.243 0-14.143a9.927 9.927 0 0 0-7.071-2.922zm5.657 15.65a7.945 7.945 0 0 1-5.657 2.337c-2.141 0-4.15-.83-5.657-2.337-3.119-3.119-3.119-8.195 0-11.314a7.946 7.946 0 0 1 5.657-2.336c2.142 0 4.15.829 5.657 2.336 3.12 3.119 3.12 8.195 0 11.314z" } }, { tag: "path", attr: { d: "M14.657 9H8.993v5.663l2.125-2.124 3.215 3.214 1.414-1.414-3.215-3.214z" } }] })(t);
}
function Ec(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 3h2v18H7zM4 3h2v18H4zm6 0h2v18h-2zm9.062 17.792-6.223-16.89 1.877-.692 6.223 16.89z" } }] })(t);
}
function Rc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 8h-5.612l1.123-3.367c.202-.608.1-1.282-.275-1.802S14.253 2 13.612 2H12c-.297 0-.578.132-.769.36L6.531 8H4c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h13.307a2.01 2.01 0 0 0 1.873-1.298l2.757-7.351A1 1 0 0 0 22 12v-2c0-1.103-.897-2-2-2zM4 10h2v9H4v-9zm16 1.819L17.307 19H8V9.362L12.468 4h1.146l-1.562 4.683A.998.998 0 0 0 13 10h7v1.819z" } }] })(t);
}
function Tc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 3H3v18h18v-2H5z" } }, { tag: "path", attr: { d: "M13 12.586 8.707 8.293 7.293 9.707 13 15.414l3-3 4.293 4.293 1.414-1.414L16 9.586z" } }] })(t);
}
function Oc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 3v17a1 1 0 0 0 1 1h17v-2H5V3H3z" } }, { tag: "path", attr: { d: "M15.293 14.707a.999.999 0 0 0 1.414 0l5-5-1.414-1.414L16 12.586l-2.293-2.293a.999.999 0 0 0-1.414 0l-5 5 1.414 1.414L13 12.414l2.293 2.293z" } }] })(t);
}
function Nc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4.222 19.778a4.983 4.983 0 0 0 3.535 1.462 4.986 4.986 0 0 0 3.536-1.462l2.828-2.829-1.414-1.414-2.828 2.829a3.007 3.007 0 0 1-4.243 0 3.005 3.005 0 0 1 0-4.243l2.829-2.828-1.414-1.414-2.829 2.828a5.006 5.006 0 0 0 0 7.071zm15.556-8.485a5.008 5.008 0 0 0 0-7.071 5.006 5.006 0 0 0-7.071 0L9.879 7.051l1.414 1.414 2.828-2.829a3.007 3.007 0 0 1 4.243 0 3.005 3.005 0 0 1 0 4.243l-2.829 2.828 1.414 1.414 2.829-2.828z" } }, { tag: "path", attr: { d: "m8.464 16.95-1.415-1.414 8.487-8.486 1.414 1.415z" } }] })(t);
}
function $c(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m13 3 3.293 3.293-7 7 1.414 1.414 7-7L21 11V3z" } }, { tag: "path", attr: { d: "M19 19H5V5h7l-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5l-2-2v7z" } }] })(t);
}
function Ic(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.465 11.293c1.133-1.133 3.109-1.133 4.242 0l.707.707 1.414-1.414-.707-.707c-.943-.944-2.199-1.465-3.535-1.465s-2.592.521-3.535 1.465L4.929 12a5.008 5.008 0 0 0 0 7.071 4.983 4.983 0 0 0 3.535 1.462A4.982 4.982 0 0 0 12 19.071l.707-.707-1.414-1.414-.707.707a3.007 3.007 0 0 1-4.243 0 3.005 3.005 0 0 1 0-4.243l2.122-2.121z" } }, { tag: "path", attr: { d: "m12 4.929-.707.707 1.414 1.414.707-.707a3.007 3.007 0 0 1 4.243 0 3.005 3.005 0 0 1 0 4.243l-2.122 2.121c-1.133 1.133-3.109 1.133-4.242 0L10.586 12l-1.414 1.414.707.707c.943.944 2.199 1.465 3.535 1.465s2.592-.521 3.535-1.465L19.071 12a5.008 5.008 0 0 0 0-7.071 5.006 5.006 0 0 0-7.071 0z" } }] })(t);
}
function Dc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 21h2c4.411 0 8-4.038 8-9h-2c0 3.86-2.691 7-6 7v-7.358l6-1.385V8.204l-6 1.385V7.642l6-1.385V4.204l-6 1.385V3H9v3.05l-3 .693v2.053l3-.692v1.947l-3 .692v2.053l3-.692V21z" } }] })(t);
}
function kc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 7h11v2H4zm0 4h11v2H4zm0 4h7v2H4zm15.299-2.708-4.3 4.291-1.292-1.291-1.414 1.415 2.706 2.704 5.712-5.703z" } }] })(t);
}
function jc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.063 15H13v2h9v-2zM4 7h11v2H4zm0 4h11v2H4zm0 4h7v2H4z" } }] })(t);
}
function Uc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5.282 12.064c-.428.328-.72.609-.875.851-.155.24-.249.498-.279.768h2.679v-.748H5.413c.081-.081.152-.151.212-.201.062-.05.182-.142.361-.27.303-.218.511-.42.626-.604.116-.186.173-.375.173-.578a.898.898 0 0 0-.151-.512.892.892 0 0 0-.412-.341c-.174-.076-.419-.111-.733-.111-.3 0-.537.038-.706.114a.889.889 0 0 0-.396.338c-.094.143-.159.346-.194.604l.894.076c.025-.188.074-.317.147-.394a.375.375 0 0 1 .279-.108c.11 0 .2.035.272.108a.344.344 0 0 1 .108.258.55.55 0 0 1-.108.297c-.074.102-.241.254-.503.453zm.055 6.386a.398.398 0 0 1-.282-.105c-.074-.07-.128-.195-.162-.378L4 18.085c.059.204.142.372.251.506.109.133.248.235.417.306.168.069.399.103.692.103.3 0 .541-.047.725-.14a1 1 0 0 0 .424-.403c.098-.175.146-.354.146-.544a.823.823 0 0 0-.088-.393.708.708 0 0 0-.249-.261 1.015 1.015 0 0 0-.286-.11.943.943 0 0 0 .345-.299.673.673 0 0 0 .113-.383.747.747 0 0 0-.281-.596c-.187-.159-.49-.238-.909-.238-.365 0-.648.072-.847.219-.2.143-.334.353-.404.626l.844.151c.023-.162.067-.274.133-.338s.151-.098.257-.098a.33.33 0 0 1 .241.089c.059.06.087.139.087.238 0 .104-.038.193-.117.27s-.177.112-.293.112a.907.907 0 0 1-.116-.011l-.045.649a1.13 1.13 0 0 1 .289-.056c.132 0 .237.041.313.126.077.082.115.199.115.352 0 .146-.04.266-.119.354a.394.394 0 0 1-.301.134zm.948-10.083V5h-.739a1.47 1.47 0 0 1-.394.523c-.168.142-.404.262-.708.365v.754a2.595 2.595 0 0 0 .937-.48v2.206h.904zM9 6h11v2H9zm0 5h11v2H9zm0 5h11v2H9z" } }] })(t);
}
function Fc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 15v-3h-2v3h-3v2h3v3h2v-3h3v-2h-.937zM4 7h11v2H4zm0 4h11v2H4zm0 4h8v2H4z" } }] })(t);
}
function qc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zm16-8V6H8.023v2H18.8zM8 11h12v2H8zm0 5h12v2H8z" } }] })(t);
}
function Wc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z" } }] })(t);
}
function Gc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "20", r: "2" } }, { tag: "circle", attr: { cx: "12", cy: "4", r: "2" } }, { tag: "circle", attr: { cx: "6.343", cy: "17.657", r: "2" } }, { tag: "circle", attr: { cx: "17.657", cy: "6.343", r: "2" } }, { tag: "circle", attr: { cx: "4", cy: "12", r: "2.001" } }, { tag: "circle", attr: { cx: "20", cy: "12", r: "2" } }, { tag: "circle", attr: { cx: "6.343", cy: "6.344", r: "2" } }, { tag: "circle", attr: { cx: "17.657", cy: "17.658", r: "2" } }] })(t);
}
function Xc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M2 11h5v2H2zm15 0h5v2h-5zm-6 6h2v5h-2zm0-15h2v5h-2zM4.222 5.636l1.414-1.414 3.536 3.536-1.414 1.414zm15.556 12.728-1.414 1.414-3.536-3.536 1.414-1.414zm-12.02-3.536 1.414 1.414-3.536 3.536-1.414-1.414zm7.07-7.071 3.536-3.535 1.414 1.415-3.536 3.535z" } }] })(t);
}
function Kc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.42 21.815a1.004 1.004 0 0 0 1.16 0C12.884 21.598 20.029 16.44 20 10c0-4.411-3.589-8-8-8S4 5.589 4 9.996c-.029 6.444 7.116 11.602 7.42 11.819zM12 4c3.309 0 6 2.691 6 6.004.021 4.438-4.388 8.423-6 9.731-1.611-1.308-6.021-5.293-6-9.735 0-3.309 2.691-6 6-6z" } }, { tag: "path", attr: { d: "M11 14h2v-3h3V9h-3V6h-2v3H8v2h3z" } }] })(t);
}
function Yc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm6 10 .002 8H6v-8h12zm-9-2V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z" } }] })(t);
}
function Qc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17 8V7c0-2.757-2.243-5-5-5S7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2H9V7c0-1.654 1.346-3 3-3s3 1.346 3 3v1h2zm1 4 .002 8H6v-8h12z" } }] })(t);
}
function Jc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 4c1.654 0 3 1.346 3 3h2c0-2.757-2.243-5-5-5S7 4.243 7 7v2H6c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2H9V7c0-1.654 1.346-3 3-3zm6.002 16H13v-2.278c.595-.347 1-.985 1-1.722 0-1.103-.897-2-2-2s-2 .897-2 2c0 .736.405 1.375 1 1.722V20H6v-9h12l.002 9z" } }] })(t);
}
function Zc(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C9.243 2 7 4.243 7 7v2H6c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v2H9V7zm9.002 13H13v-2.278c.595-.347 1-.985 1-1.722 0-1.103-.897-2-2-2s-2 .897-2 2c0 .736.405 1.375 1 1.722V20H6v-9h12l.002 9z" } }] })(t);
}
function ti(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m10.998 16 5-4-5-4v3h-9v2h9z" } }, { tag: "path", attr: { d: "M12.999 2.999a8.938 8.938 0 0 0-6.364 2.637L8.049 7.05c1.322-1.322 3.08-2.051 4.95-2.051s3.628.729 4.95 2.051S20 10.13 20 12s-.729 3.628-2.051 4.95-3.08 2.051-4.95 2.051-3.628-.729-4.95-2.051l-1.414 1.414c1.699 1.7 3.959 2.637 6.364 2.637s4.665-.937 6.364-2.637C21.063 16.665 22 14.405 22 12s-.937-4.665-2.637-6.364a8.938 8.938 0 0 0-6.364-2.637z" } }] })(t);
}
function ei(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m13 16 5-4-5-4v3H4v2h9z" } }, { tag: "path", attr: { d: "M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" } }] })(t);
}
function ai(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m2 12 5 4v-3h9v-2H7V8z" } }, { tag: "path", attr: { d: "M13.001 2.999a8.938 8.938 0 0 0-6.364 2.637L8.051 7.05c1.322-1.322 3.08-2.051 4.95-2.051s3.628.729 4.95 2.051 2.051 3.08 2.051 4.95-.729 3.628-2.051 4.95-3.08 2.051-4.95 2.051-3.628-.729-4.95-2.051l-1.414 1.414c1.699 1.7 3.959 2.637 6.364 2.637s4.665-.937 6.364-2.637c1.7-1.699 2.637-3.959 2.637-6.364s-.937-4.665-2.637-6.364a8.938 8.938 0 0 0-6.364-2.637z" } }] })(t);
}
function ri(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 13v-2H7V8l-5 4 5 4v-3z" } }, { tag: "path", attr: { d: "M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" } }] })(t);
}
function ni(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 4.998c-1.836 0-3.356.389-4.617.971L3.707 2.293 2.293 3.707l3.315 3.316c-2.613 1.952-3.543 4.618-3.557 4.66l-.105.316.105.316C2.073 12.382 4.367 19 12 19c1.835 0 3.354-.389 4.615-.971l3.678 3.678 1.414-1.414-3.317-3.317c2.614-1.952 3.545-4.618 3.559-4.66l.105-.316-.105-.316c-.022-.068-2.316-6.686-9.949-6.686zM4.074 12c.103-.236.274-.586.521-.989l5.867 5.867C6.249 16.23 4.523 13.035 4.074 12zm9.247 4.907-7.48-7.481a8.138 8.138 0 0 1 1.188-.982l8.055 8.054a8.835 8.835 0 0 1-1.763.409zm3.648-1.352-1.541-1.541c.354-.596.572-1.28.572-2.015 0-.474-.099-.924-.255-1.349A.983.983 0 0 1 15 11a1 1 0 0 1-1-1c0-.439.288-.802.682-.936A3.97 3.97 0 0 0 12 7.999c-.735 0-1.419.218-2.015.572l-1.07-1.07A9.292 9.292 0 0 1 12 6.998c5.351 0 7.425 3.847 7.926 5a8.573 8.573 0 0 1-2.957 3.557z" } }] })(t);
}
function ci(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3h-3c-1.103 0-2 .897-2 2v8c0 1.103-.897 2-2 2s-2-.897-2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v8c0 4.963 4.037 9 9 9s9-4.037 9-9V5c0-1.103-.897-2-2-2zm-3 2h3v3h-3V5zM5 5h3v3H5V5zm7 15c-3.859 0-7-3.141-7-7v-3h3v3c0 2.206 1.794 4 4 4s4-1.794 4-4v-3h3v3c0 3.859-3.141 7-7 7z" } }] })(t);
}
function ii(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 4H6c-1.103 0-2 .897-2 2v5h2V8l6.4 4.8a1.001 1.001 0 0 0 1.2 0L20 8v9h-8v2h8c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-7 6.75L6.666 6h12.668L13 10.75z" } }, { tag: "path", attr: { d: "M2 12h7v2H2zm2 3h6v2H4zm3 3h4v2H7z" } }] })(t);
}
function li(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 11V4h-7l2.793 2.793-4.322 4.322A5.961 5.961 0 0 0 8 10c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6c0-1.294-.416-2.49-1.115-3.471l4.322-4.322L20 11zM8 20c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" } }] })(t);
}
function oi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "4", r: "2" } }, { tag: "path", attr: { d: "M15 7H9a1 1 0 0 0-1 1v7h2v7h4v-7h2V8a1 1 0 0 0-1-1z" } }] })(t);
}
function hi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.447 6.105-6-3a1 1 0 0 0-.895 0L9 5.882 3.447 3.105A1 1 0 0 0 2 4v13c0 .379.214.725.553.895l6 3a1 1 0 0 0 .895 0L15 18.118l5.553 2.776a.992.992 0 0 0 .972-.043c.295-.183.475-.504.475-.851V7c0-.379-.214-.725-.553-.895zM10 7.618l4-2v10.764l-4 2V7.618zm-6-2 4 2v10.764l-4-2V5.618zm16 12.764-4-2V5.618l4 2v10.764z" } }] })(t);
}
function si(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12 17 1-2V9.858c1.721-.447 3-2 3-3.858 0-2.206-1.794-4-4-4S8 3.794 8 6c0 1.858 1.279 3.411 3 3.858V15l1 2zM10 6c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2-2-.897-2-2z" } }, { tag: "path", attr: { d: "m16.267 10.563-.533 1.928C18.325 13.207 20 14.584 20 16c0 1.892-3.285 4-8 4s-8-2.108-8-4c0-1.416 1.675-2.793 4.267-3.51l-.533-1.928C4.197 11.54 2 13.623 2 16c0 3.364 4.393 6 10 6s10-2.636 10-6c0-2.377-2.197-4.46-5.733-5.437z" } }] })(t);
}
function vi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 14c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z" } }, { tag: "path", attr: { d: "M11.42 21.814a.998.998 0 0 0 1.16 0C12.884 21.599 20.029 16.44 20 10c0-4.411-3.589-8-8-8S4 5.589 4 9.995c-.029 6.445 7.116 11.604 7.42 11.819zM12 4c3.309 0 6 2.691 6 6.005.021 4.438-4.388 8.423-6 9.73-1.611-1.308-6.021-5.294-6-9.735 0-3.309 2.691-6 6-6z" } }] })(t);
}
function ui(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 6H5C3.346 6 2 7.346 2 9v5c0 2.206 1.794 4 4 4h1.637c1.166 0 2.28-.557 2.981-1.491.66-.879 2.104-.88 2.764.001A3.744 3.744 0 0 0 16.363 18H18c2.206 0 4-1.794 4-4V9c0-1.654-1.346-3-3-3zm1 8c0 1.103-.897 2-2 2h-1.637c-.54 0-1.057-.259-1.382-.69-.71-.948-1.797-1.492-2.981-1.492s-2.271.544-2.981 1.491A1.741 1.741 0 0 1 7.637 16H6c-1.103 0-2-.897-2-2V9c0-.551.448-1 1-1h14c.552 0 1 .449 1 1v5z" } }, { tag: "ellipse", attr: { cx: "7.5", cy: "11.5", rx: "2.5", ry: "1.5" } }, { tag: "ellipse", attr: { cx: "16.5", cy: "11.5", rx: "2.5", ry: "1.5" } }] })(t);
}
function di(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 22c3.859 0 7-3.141 7-7s-3.141-7-7-7c-3.86 0-7 3.141-7 7s3.14 7 7 7zm0-12c2.757 0 5 2.243 5 5s-2.243 5-5 5-5-2.243-5-5 2.243-5 5-5zm-1-8H7v5.518a8.957 8.957 0 0 1 4-1.459V2zm6 0h-4v4.059a8.957 8.957 0 0 1 4 1.459V2z" } }, { tag: "path", attr: { d: "m10.019 15.811-.468 2.726L12 17.25l2.449 1.287-.468-2.726 1.982-1.932-2.738-.398L12 11l-1.225 2.481-2.738.398z" } }] })(t);
}
function gi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M14 10h4v2h-4zm-6.026 5H16v2H7.974zM6 10h4v2H6z" } }] })(t);
}
function fi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "8.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.493", cy: "10.493", r: "1.493" } }] })(t);
}
function pi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "8.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.493", cy: "10.493", r: "1.493" } }, { tag: "path", attr: { d: "M7.974 15H16v2H7.974z" } }] })(t);
}
function zi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 4v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V8a.997.997 0 0 0-.293-.707l-5-5A.996.996 0 0 0 14 2H6c-1.103 0-2 .897-2 2zm14 4.414L18.001 20H6V4h7.586L18 8.414z" } }, { tag: "path", attr: { d: "M8 6h2v4H8zm4 0h2v4h-2z" } }] })(t);
}
function mi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 11h12v2H4zm0-5h16v2H4zm0 12h7.235v-2H4z" } }] })(t);
}
function Mi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 6h16v2H4zm4 5h12v2H8zm5 5h7v2h-7z" } }] })(t);
}
function Bi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" } }] })(t);
}
function Hi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14 3H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" } }, { tag: "path", attr: { d: "M21 19v-9a2 2 0 0 0-2-2h-1v8a2 2 0 0 1-2 2H8v1a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2z" } }] })(t);
}
function wi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z" } }, { tag: "path", attr: { d: "M11 14h2v-3h3V9h-3V6h-2v3H8v2h3z" } }] })(t);
}
function xi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 16c0 1.103.897 2 2 2h3.586L12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v12zM5 4h14v12h-4.414L12 18.586 9.414 16H5V4z" } }, { tag: "path", attr: { d: "M11 14h2v-3h3V9h-3V6h-2v3H8v2h3z" } }] })(t);
}
function Vi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 4v12c0 1.103.897 2 2 2h3.586L12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2zm2 0h14v12h-4.414L12 18.586 9.414 16H5V4z" } }, { tag: "path", attr: { d: "m17.207 7.207-1.414-1.414L11 10.586 8.707 8.293 7.293 9.707 11 13.414z" } }] })(t);
}
function yi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 2c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3.586L12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5zm14 14h-4.414L12 18.586 9.414 16H5V4h14v12z" } }, { tag: "path", attr: { d: "M7 7h10v2H7zm0 4h7v2H7z" } }] })(t);
}
function Ci(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 2H5c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3.586L12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-4.414L12 18.586 9.414 16H5V4h14v12z" } }, { tag: "circle", attr: { cx: "15", cy: "10", r: "2" } }, { tag: "circle", attr: { cx: "9", cy: "10", r: "2" } }] })(t);
}
function Li(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.586 18 12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3.586zM5 4h14v12h-4.414L12 18.586 9.414 16H5V4z" } }, { tag: "path", attr: { d: "m12.479 7.219-4.977 4.969v1.799h1.8l4.975-4.969zm2.219-2.22 1.8 1.8-1.37 1.37-1.8-1.799z" } }] })(t);
}
function _i(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 2c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3.586L12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5zm14 14h-4.414L12 18.586 9.414 16H5V4h14v12z" } }, { tag: "path", attr: { d: "M11 6h2v6h-2zm0 7h2v2h-2z" } }] })(t);
}
function Ai(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.586 18 12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3.586zM5 4h14v12h-4.414L12 18.586 9.414 16H5V4z" } }, { tag: "path", attr: { d: "M8 9h8v2H8z" } }] })(t);
}
function bi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8.586 18 12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3.586zM5 4h14v12h-4.414L12 18.586 9.414 16H5V4z" } }, { tag: "path", attr: { d: "M9.707 13.707 12 11.414l2.293 2.293 1.414-1.414L13.414 10l2.293-2.293-1.414-1.414L12 8.586 9.707 6.293 8.293 7.707 10.586 10l-2.293 2.293z" } }] })(t);
}
function Pi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 2H5c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3.586L12 21.414 15.414 18H19c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-4.414L12 18.586 9.414 16H5V4h14v12z" } }] })(t);
}
function Si(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z" } }, { tag: "path", attr: { d: "m17.207 7.207-1.414-1.414L11 10.586 8.707 8.293 7.293 9.707 11 13.414z" } }] })(t);
}
function Ei(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z" } }, { tag: "path", attr: { d: "M7 7h10v2H7zm0 4h7v2H7z" } }] })(t);
}
function Ri(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.766L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.234V16H4V4h16v12z" } }, { tag: "circle", attr: { cx: "15", cy: "10", r: "2" } }, { tag: "circle", attr: { cx: "9", cy: "10", r: "2" } }] })(t);
}
function Ti(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z" } }, { tag: "path", attr: { d: "m13.803 9.189-1.399-1.398-3.869 3.864v1.399h1.399zm.327-3.123 1.398 1.399-1.066 1.066-1.399-1.398z" } }] })(t);
}
function Oi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z" } }, { tag: "path", attr: { d: "M11 6h2v5h-2zm0 6h2v2h-2z" } }] })(t);
}
function Ni(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z" } }, { tag: "path", attr: { d: "M8 9h8v2H8z" } }] })(t);
}
function $i(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.515 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }, { tag: "path", attr: { d: "M13 6h-2v3H8v2h3v3h2v-3h3V9h-3z" } }] })(t);
}
function Ii(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.515 5 6.934V22l5.339-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }, { tag: "path", attr: { d: "M11 11.586 8.707 9.293l-1.414 1.414L11 14.414l6.207-6.207-1.414-1.414z" } }] })(t);
}
function Di(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.515 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }, { tag: "path", attr: { d: "M7 7h10v2H7zm0 4h7v2H7z" } }] })(t);
}
function ki(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "9.5", cy: "9.5", r: "1.5" } }, { tag: "circle", attr: { cx: "14.5", cy: "9.5", r: "1.5" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.897 5.515 5 6.934V22l5.34-4.004C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.671 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }] })(t);
}
function ji(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.515 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }, { tag: "path", attr: { d: "M8.503 11.589v1.398h1.398l3.87-3.864-1.399-1.398zm5.927-3.125-1.398-1.398 1.067-1.067 1.398 1.398z" } }] })(t);
}
function Ui(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.515 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }, { tag: "path", attr: { d: "M11 6h2v5h-2zm0 6h2v2h-2z" } }] })(t);
}
function Fi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.515 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }, { tag: "path", attr: { d: "M8 9h8v2H8z" } }] })(t);
}
function qi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.515 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }, { tag: "path", attr: { d: "M14.293 6.293 12 8.586 9.707 6.293 8.293 7.707 10.586 10l-2.293 2.293 1.414 1.414L12 11.414l2.293 2.293 1.414-1.414L13.414 10l2.293-2.293z" } }] })(t);
}
function Wi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.516 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" } }] })(t);
}
function Gi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v13a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 14c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v8z" } }, { tag: "path", attr: { d: "M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z" } }] })(t);
}
function Xi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v13a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 14c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v8z" } }, { tag: "path", attr: { d: "m11 13.586-2.293-2.293-1.414 1.414L11 16.414l6.207-6.207-1.414-1.414z" } }] })(t);
}
function Ki(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v13a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 14c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v8z" } }, { tag: "path", attr: { d: "M7 9h10v2H7zm0 4h7v2H7z" } }] })(t);
}
function Yi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v12a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 13c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v7z" } }, { tag: "circle", attr: { cx: "9.5", cy: "11.5", r: "1.5" } }, { tag: "circle", attr: { cx: "14.5", cy: "11.5", r: "1.5" } }] })(t);
}
function Qi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v13a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 14c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v8z" } }, { tag: "path", attr: { d: "M7 14.987v1.999h1.999l5.529-5.522-1.998-1.998zm8.47-4.465-1.998-2L14.995 7l2 1.999z" } }] })(t);
}
function Ji(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v13a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 14c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v8z" } }, { tag: "path", attr: { d: "M11 6h2v8h-2zm0 10h2v2h-2z" } }] })(t);
}
function Zi(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v13a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 14c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v8z" } }, { tag: "path", attr: { d: "M8 11h8v2H8z" } }] })(t);
}
function tl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v13a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 14c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v8z" } }, { tag: "path", attr: { d: "M15.292 7.295 12 10.587 8.708 7.295 7.294 8.709l3.292 3.292-3.292 3.292 1.414 1.414L12 13.415l3.292 3.292 1.414-1.414-3.292-3.292 3.292-3.292z" } }] })(t);
}
function el(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8C4.691 2 2 4.691 2 8v12a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 13c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v7z" } }] })(t);
}
function al(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z" } }, { tag: "path", attr: { d: "M9.707 13.707 12 11.414l2.293 2.293 1.414-1.414L13.414 10l2.293-2.293-1.414-1.414L12 8.586 9.707 6.293 8.293 7.707 10.586 10l-2.293 2.293z" } }] })(t);
}
function rl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.767L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.233V16H4V4h16v12z" } }] })(t);
}
function nl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9.5 22c2.003 0 3.887-.78 5.313-2.207l6.904-7.096A1 1 0 0 0 21 11h-3.301l4.175-7.514a1.001 1.001 0 0 0-1.359-1.36l-7.11 3.95.576-2.879a1 1 0 0 0-1.629-.957L4.196 9.197c-2.924 2.924-2.924 7.682 0 10.606A7.452 7.452 0 0 0 9.5 22zM5.552 10.665l5.902-5.031-.248 1.24-.186.93v.001l-.424 2.119 7.83-4.35-3.3 5.94-.001.001L14.301 13h4.331l-5.243 5.389C12.35 19.428 10.969 20 9.5 20s-2.851-.572-3.89-1.611c-2.143-2.144-2.143-5.634-.058-7.724z" } }, { tag: "path", attr: { d: "M9.5 18a3.492 3.492 0 0 0 1.484-6.659c.005.053.016.105.016.159a1.5 1.5 0 1 1-3 0c0-.054.011-.106.016-.159A3.492 3.492 0 0 0 9.5 18z" } }] })(t);
}
function cl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 2H8c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h8c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM8 20V4h8l.001 16H8zM3 7h2V5H3v.5H2v1h1zm18-2h-2v2h2v-.5h1v-1h-1zM3 11h2V9H3v.5H2v1h1zm18-2h-2v2h2v-.5h1v-1h-1zM3 15h2v-2H3v.5H2v1h1zm18-2h-2v2h2v-.5h1v-1h-1zM3 19h2v-2H3v.5H2v1h1zm18-2h-2v2h2v-.5h1v-1h-1z" } }] })(t);
}
function il(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.707 20.293-3.388-3.388A7.942 7.942 0 0 0 20 12.021h-2a5.95 5.95 0 0 1-1.109 3.456l-1.452-1.452c.348-.591.561-1.27.561-2.004v-6C16 3.804 14.215 2 12.021 2c-.07 0-.14.009-.209.025A4.005 4.005 0 0 0 8 6.021v.565L3.707 2.293 2.293 3.707l18 18 1.414-1.414zM10 6.021c0-1.103.897-2 2-2a.918.918 0 0 0 .164-.015C13.188 4.08 14 4.956 14 6.021v6c0 .172-.029.335-.071.494L10 8.586V6.021zm-4 6H4c0 4.072 3.06 7.436 7 7.931v2.069h2v-2.07a7.993 7.993 0 0 0 2.218-.611l-1.558-1.558a5.979 5.979 0 0 1-1.66.239c-3.309 0-6-2.692-6-6z" } }, { tag: "path", attr: { d: "M8.011 12.132a3.993 3.993 0 0 0 3.877 3.877l-3.877-3.877z" } }] })(t);
}
function ll(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 12V6c0-2.217-1.785-4.021-3.979-4.021a.933.933 0 0 0-.209.025A4.006 4.006 0 0 0 8 6v6c0 2.206 1.794 4 4 4s4-1.794 4-4zm-6 0V6c0-1.103.897-2 2-2a.89.89 0 0 0 .163-.015C13.188 4.06 14 4.935 14 6v6c0 1.103-.897 2-2 2s-2-.897-2-2z" } }, { tag: "path", attr: { d: "M6 12H4c0 4.072 3.061 7.436 7 7.931V22h2v-2.069c3.939-.495 7-3.858 7-7.931h-2c0 3.309-2.691 6-6 6s-6-2.691-6-6z" } }] })(t);
}
function ol(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14 3H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2zM5 5h9l-.003 9H5V5z" } }] })(t);
}
function hl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 11h10v2H7z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function sl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 16h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2zm13.997 3H10v-9h9l-.003 9z" } }] })(t);
}
function vl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 11h14v2H5z" } }] })(t);
}
function ul(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.75 2h-10c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm-10 18V4h10l.002 16H6.75z" } }, { tag: "circle", attr: { cx: "11.75", cy: "18", r: "1" } }] })(t);
}
function dl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 5H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM7.001 7H19v10H7.001V7z" } }] })(t);
}
function gl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15.535 2.808c-.756-.756-2.072-.756-2.828 0l-9.899 9.899a2.001 2.001 0 0 0 0 2.828l5.657 5.657c.378.378.88.586 1.414.586s1.036-.208 1.414-.586l9.899-9.899c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-5.657-5.657zm-5.656 16.97v1-1l-5.657-5.657 9.899-9.899 5.657 5.657-9.899 9.899z" } }, { tag: "circle", attr: { cx: "9", cy: "15", r: "1" } }, { tag: "path", attr: { d: "m15.707 21.707-1.414-1.414 6-6 1.414 1.415zM8.293 2.293l1.414 1.414-6 6-1.414-1.415z" } }] })(t);
}
function fl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17 2H7c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM7 16.999V5h10l.002 11.999H7z" } }] })(t);
}
function pl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 4H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zm-1 11a3 3 0 0 0-3 3H7a3 3 0 0 0-3-3V9a3 3 0 0 0 3-3h10a3 3 0 0 0 3 3v6z" } }, { tag: "path", attr: { d: "M12 8c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" } }] })(t);
}
function zl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93 9.93 9.93 0 0 0 7.07-2.929 10.007 10.007 0 0 0 2.583-4.491 1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343 7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483 10.027 10.027 0 0 0 2.89 7.848 9.972 9.972 0 0 0 7.848 2.891 8.036 8.036 0 0 1-1.484 2.059z" } }] })(t);
}
function ml(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 2h-2C7.691 2 5 4.691 5 8v8c0 3.309 2.691 6 6 6h2c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm-2 2v6H7V8c0-2.206 1.794-4 4-4zm6 12c0 2.206-1.794 4-4 4h-2c-2.206 0-4-1.794-4-4v-4h10v4zm-4-6V4c2.206 0 4 1.794 4 4v2h-4z" } }] })(t);
}
function Ml(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.975 22H12c3.859 0 7-3.14 7-7V9c0-3.841-3.127-6.974-6.981-7h-.06C8.119 2.022 5 5.157 5 9v6c0 3.86 3.129 7 6.975 7zM7 9a5.007 5.007 0 0 1 4.985-5C14.75 4.006 17 6.249 17 9v6c0 2.757-2.243 5-5 5h-.025C9.186 20 7 17.804 7 15V9z" } }, { tag: "path", attr: { d: "M11 6h2v6h-2z" } }] })(t);
}
function Bl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17 11H7V7l-5 5 5 5v-4h10v4l5-5-5-5z" } }] })(t);
}
function Hl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m7 17 5 5 5-5h-4V7h4l-5-5-5 5h4v10z" } }] })(t);
}
function wl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 11h-5V6h3l-4-4-4 4h3v5H6V8l-4 4 4 4v-3h5v5H8l4 4 4-4h-3v-5h5v3l4-4-4-4z" } }] })(t);
}
function xl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm.001 6c-.001 0-.001 0 0 0h-.465l-2.667-4H20l.001 4zM9.536 9 6.869 5h2.596l2.667 4H9.536zm5 0-2.667-4h2.596l2.667 4h-2.596zM4 5h.465l2.667 4H4V5zm0 14v-8h16l.002 8H4z" } }, { tag: "path", attr: { d: "m10 18 5.5-3-5.5-3z" } }] })(t);
}
function Vl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm.001 6c-.001 0-.001 0 0 0h-.466l-2.667-4H20l.001 4zM9.535 9 6.868 5h2.597l2.667 4H9.535zm5 0-2.667-4h2.597l2.667 4h-2.597zM4 5h.465l2.667 4H4V5zm0 14v-8h16l.002 8H4z" } }] })(t);
}
function yl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m19.684 5.821-9-3.272A1.998 1.998 0 0 0 8 4.428v6.129A3.953 3.953 0 0 0 6 10c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4V4.428L19 7.7v6.856A3.962 3.962 0 0 0 17 14c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4V7.7c0-.838-.529-1.594-1.316-1.879zM6 16c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zm11 4c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" } }] })(t);
}
function Cl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M2.002 9.63c-.023.411.207.794.581.966l7.504 3.442 3.442 7.503c.164.356.52.583.909.583l.057-.002a1 1 0 0 0 .894-.686l5.595-17.032c.117-.358.023-.753-.243-1.02s-.66-.358-1.02-.243L2.688 8.736a1 1 0 0 0-.686.894zm16.464-3.971-4.182 12.73-2.534-5.522a.998.998 0 0 0-.492-.492L5.734 9.841l12.732-4.182z" } }] })(t);
}
function Ll(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3c-1.654 0-3 1.346-3 3 0 .502.136.968.354 1.385l-1.116 1.302A3.976 3.976 0 0 0 13 8c-.739 0-1.425.216-2.02.566L9.566 7.152A3.449 3.449 0 0 0 10 5.5C10 3.57 8.43 2 6.5 2S3 3.57 3 5.5 4.57 9 6.5 9c.601 0 1.158-.166 1.652-.434L9.566 9.98A3.972 3.972 0 0 0 9 12c0 .997.38 1.899.985 2.601l-1.692 1.692.025.025A2.962 2.962 0 0 0 7 16c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3c0-.476-.121-.919-.318-1.318l.025.025 1.954-1.954c.421.15.867.247 1.339.247 2.206 0 4-1.794 4-4a3.96 3.96 0 0 0-.439-1.785l1.253-1.462c.364.158.764.247 1.186.247 1.654 0 3-1.346 3-3s-1.346-3-3-3zM7 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 5.5C5 4.673 5.673 4 6.5 4S8 4.673 8 5.5 7.327 7 6.5 7 5 6.327 5 5.5zm8 8.5c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zm6-7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" } }] })(t);
}
function _l(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.875 3H4.125C2.953 3 2 3.897 2 5v14c0 1.103.953 2 2.125 2h15.75C21.047 21 22 20.103 22 19V5c0-1.103-.953-2-2.125-2zm0 16H4.125c-.057 0-.096-.016-.113-.016-.007 0-.011.002-.012.008L3.988 5.046c.007-.01.052-.046.137-.046h15.75c.079.001.122.028.125.008l.012 13.946c-.007.01-.052.046-.137.046z" } }, { tag: "path", attr: { d: "M6 7h6v6H6zm7 8H6v2h12v-2h-4zm1-4h4v2h-4zm0-4h4v2h-4z" } }] })(t);
}
function Al(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 10h10v4H7z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function bl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h8a.996.996 0 0 0 .707-.293l7-7a.997.997 0 0 0 .196-.293c.014-.03.022-.061.033-.093a.991.991 0 0 0 .051-.259c.002-.021.013-.041.013-.062V5c0-1.103-.897-2-2-2zM5 5h14v7h-6a1 1 0 0 0-1 1v6H5V5zm9 12.586V14h3.586L14 17.586z" } }] })(t);
}
function Pl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V7h14V6l.002 14H5z" } }, { tag: "path", attr: { d: "M7 9h10v2H7zm0 4h5v2H7z" } }] })(t);
}
function Sl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.71 20.296-1.786-1.786c.045-.163.076-.332.076-.51v-7h-2v5.586L7.414 6H13V4H6c-.178 0-.347.031-.51.076l-1.78-1.78L2.296 3.71l18 18 1.414-1.414zM4 8.121V18c0 1.103.897 2 2 2h9.879l-2-2H6v-7.879l-2-2z" } }, { tag: "circle", attr: { cx: "18", cy: "6", r: "3" } }] })(t);
}
function El(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "18", cy: "6", r: "3" } }, { tag: "path", attr: { d: "M18 19H5V6h8c0-.712.153-1.387.422-2H5c-1.103 0-2 .897-2 2v13c0 1.103.897 2 2 2h13c1.103 0 2-.897 2-2v-8.422A4.962 4.962 0 0 1 18 11v8z" } }] })(t);
}
function Rl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 19v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2zM5 14V5h9v3h-4c-1.103 0-2 .897-2 2v4H5zm9.001 0H10v-4h4.001v4zM10 16h4c1.103 0 2-.897 2-2v-4h3l.001 9H10v-3z" } }] })(t);
}
function Tl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M22 8a.76.76 0 0 0 0-.21v-.08a.77.77 0 0 0-.07-.16.35.35 0 0 0-.05-.08l-.1-.13-.08-.06-.12-.09-9-5a1 1 0 0 0-1 0l-9 5-.09.07-.11.08a.41.41 0 0 0-.07.11.39.39 0 0 0-.08.1.59.59 0 0 0-.06.14.3.3 0 0 0 0 .1A.76.76 0 0 0 2 8v8a1 1 0 0 0 .52.87l9 5a.75.75 0 0 0 .13.06h.1a1.06 1.06 0 0 0 .5 0h.1l.14-.06 9-5A1 1 0 0 0 22 16V8zm-10 3.87L5.06 8l2.76-1.52 6.83 3.9zm0-7.72L18.94 8 16.7 9.25 9.87 5.34zM4 9.7l7 3.92v5.68l-7-3.89zm9 9.6v-5.68l3-1.68V15l2-1v-3.18l2-1.11v5.7z" } }] })(t);
}
function Ol(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 2H7c-1.103 0-2 .897-2 2v3c0 1.103.897 2 2 2h11c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM7 7V4h11l.002 3H7z" } }, { tag: "path", attr: { d: "M13 15v-2c0-1.103-.897-2-2-2H4V5c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h7v2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z" } }] })(t);
}
function Nl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7.061 22c1.523 0 2.84-.543 3.91-1.613 1.123-1.123 1.707-2.854 1.551-4.494l8.564-8.564a3.123 3.123 0 0 0-.002-4.414c-1.178-1.18-3.234-1.18-4.412 0l-8.884 8.884c-1.913.169-3.807 1.521-3.807 3.919 0 .303.021.588.042.86.08 1.031.109 1.418-1.471 2.208a1.001 1.001 0 0 0-.122 1.717C2.52 20.563 4.623 22 7.061 22c-.001 0-.001 0 0 0zM18.086 4.328a1.144 1.144 0 0 1 1.586.002 1.12 1.12 0 0 1 0 1.584L12 13.586 10.414 12l7.672-7.672zM6.018 16.423c-.018-.224-.037-.458-.037-.706 0-1.545 1.445-1.953 2.21-1.953.356 0 .699.073.964.206.945.475 1.26 1.293 1.357 1.896.177 1.09-.217 2.368-.956 3.107C8.865 19.664 8.049 20 7.061 20H7.06c-.75 0-1.479-.196-2.074-.427 1.082-.973 1.121-1.989 1.032-3.15z" } }] })(t);
}
function $l(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13.4 2.096a10.08 10.08 0 0 0-8.937 3.331A10.054 10.054 0 0 0 2.096 13.4c.53 3.894 3.458 7.207 7.285 8.246a9.982 9.982 0 0 0 2.618.354l.142-.001a3.001 3.001 0 0 0 2.516-1.426 2.989 2.989 0 0 0 .153-2.879l-.199-.416a1.919 1.919 0 0 1 .094-1.912 2.004 2.004 0 0 1 2.576-.755l.412.197c.412.198.85.299 1.301.299A3.022 3.022 0 0 0 22 12.14a9.935 9.935 0 0 0-.353-2.76c-1.04-3.826-4.353-6.754-8.247-7.284zm5.158 10.909-.412-.197c-1.828-.878-4.07-.198-5.135 1.494-.738 1.176-.813 2.576-.204 3.842l.199.416a.983.983 0 0 1-.051.961.992.992 0 0 1-.844.479h-.112a8.061 8.061 0 0 1-2.095-.283c-3.063-.831-5.403-3.479-5.826-6.586-.321-2.355.352-4.623 1.893-6.389a8.002 8.002 0 0 1 7.16-2.664c3.107.423 5.755 2.764 6.586 5.826.198.73.293 1.474.282 2.207-.012.807-.845 1.183-1.441.894z" } }, { tag: "circle", attr: { cx: "7.5", cy: "14.5", r: "1.5" } }, { tag: "circle", attr: { cx: "7.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "10.5", cy: "7.5", r: "1.5" } }, { tag: "circle", attr: { cx: "14.5", cy: "7.5", r: "1.5" } }] })(t);
}
function Il(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.563 3.34a1.002 1.002 0 0 0-.989-.079l-17 8a1 1 0 0 0 .026 1.821L8 15.445v6.722l5.836-4.168 4.764 2.084a1 1 0 0 0 1.399-.85l1-15a1.005 1.005 0 0 0-.436-.893zm-2.466 14.34-5.269-2.306L16 9.167l-7.649 4.25-2.932-1.283 13.471-6.34-.793 11.886z" } }] })(t);
}
function Dl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.004 5H9c-1.838 0-3.586.737-4.924 2.076C2.737 8.415 2 10.163 2 12c0 1.838.737 3.586 2.076 4.924C5.414 18.263 7.162 19 9 19h8v-2H9c-1.303 0-2.55-.529-3.51-1.49C4.529 14.55 4 13.303 4 12c0-1.302.529-2.549 1.49-3.51C6.45 7.529 7.697 7 9 7h8V6l.001 1h.003c.79 0 1.539.314 2.109.886.571.571.886 1.322.887 2.116a2.966 2.966 0 0 1-.884 2.11A2.988 2.988 0 0 1 17 13H9a.99.99 0 0 1-.698-.3A.991.991 0 0 1 8 12c0-.252.11-.507.301-.698A.987.987 0 0 1 9 11h8V9H9c-.79 0-1.541.315-2.114.889C6.314 10.461 6 11.211 6 12s.314 1.54.888 2.114A2.974 2.974 0 0 0 9 15h8.001a4.97 4.97 0 0 0 3.528-1.473 4.967 4.967 0 0 0-.001-7.055A4.95 4.95 0 0 0 17.004 5z" } }] })(t);
}
function kl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 16h2v4h2V6h2v14h2V6h3V4H9c-3.309 0-6 2.691-6 6s2.691 6 6 6zM9 6h2v8H9c-2.206 0-4-1.794-4-4s1.794-4 4-4z" } }] })(t);
}
function jl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 11V5c0-1.103-.897-2-2-2h-3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1H4c-1.103 0-2 .897-2 2v13c0 1.103.897 2 2 2h7c0 1.103.897 2 2 2h7c1.103 0 2-.897 2-2v-7c0-1.103-.897-2-2-2zm-9 2v5H4V5h3v2h8V5h3v6h-5c-1.103 0-2 .897-2 2zm2 7v-7h7l.001 7H13z" } }] })(t);
}
function Ul(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M13 9h2v6h-2zM9 9h2v6H9z" } }] })(t);
}
function Fl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 7h3v10H8zm5 0h3v10h-3z" } }] })(t);
}
function ql(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.404 2.998c-.757-.754-2.077-.751-2.828.005l-1.784 1.791L11.586 7H7a.998.998 0 0 0-.939.658l-4 11c-.133.365-.042.774.232 1.049l2 2a.997.997 0 0 0 1.049.232l11-4A.998.998 0 0 0 17 17v-4.586l2.207-2.207v-.001h.001L21 8.409c.378-.378.586-.881.585-1.415 0-.535-.209-1.038-.588-1.415l-2.593-2.581zm-3.111 8.295A.996.996 0 0 0 15 12v4.3l-9.249 3.363 4.671-4.671c.026.001.052.008.078.008A1.5 1.5 0 1 0 9 13.5c0 .026.007.052.008.078l-4.671 4.671L7.7 9H12c.266 0 .52-.105.707-.293L14.5 6.914 17.086 9.5l-1.793 1.793zm3.206-3.208-2.586-2.586 1.079-1.084 2.593 2.581-1.086 1.089z" } }] })(t);
}
function Wl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 21a1 1 0 0 0 .24 0l4-1a1 1 0 0 0 .47-.26L21 7.41a2 2 0 0 0 0-2.82L19.42 3a2 2 0 0 0-2.83 0L4.3 15.29a1.06 1.06 0 0 0-.27.47l-1 4A1 1 0 0 0 3.76 21 1 1 0 0 0 4 21zM18 4.41 19.59 6 18 7.59 16.42 6zM5.91 16.51 15 7.41 16.59 9l-9.1 9.1-2.11.52z" } }] })(t);
}
function Gl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.57 22a2 2 0 0 0 1.43-.59l2.71-2.71a1 1 0 0 0 0-1.41l-4-4a1 1 0 0 0-1.41 0l-1.6 1.59a7.55 7.55 0 0 1-3-1.59 7.62 7.62 0 0 1-1.59-3l1.59-1.6a1 1 0 0 0 0-1.41l-4-4a1 1 0 0 0-1.41 0L2.59 6A2 2 0 0 0 2 7.43 15.28 15.28 0 0 0 6.3 17.7 15.28 15.28 0 0 0 16.57 22zM6 5.41 8.59 8 7.3 9.29a1 1 0 0 0-.3.91 10.12 10.12 0 0 0 2.3 4.5 10.08 10.08 0 0 0 4.5 2.3 1 1 0 0 0 .91-.27L16 15.41 18.59 18l-2 2a13.28 13.28 0 0 1-8.87-3.71A13.28 13.28 0 0 1 4 7.41zM20 11h2a8.81 8.81 0 0 0-9-9v2a6.77 6.77 0 0 1 7 7z" } }, { tag: "path", attr: { d: "M13 8c2.1 0 3 .9 3 3h2c0-3.22-1.78-5-5-5z" } }] })(t);
}
function Xl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.712 13.288a.999.999 0 0 0-1.414 0l-1.597 1.596c-.824-.245-2.166-.771-2.99-1.596-.874-.874-1.374-2.253-1.594-2.992l1.594-1.594a.999.999 0 0 0 0-1.414l-4-4a1.03 1.03 0 0 0-1.414 0l-2.709 2.71c-.382.38-.597.904-.588 1.437.022 1.423.396 6.367 4.297 10.268C10.195 21.6 15.142 21.977 16.566 22h.028c.528 0 1.027-.208 1.405-.586l2.712-2.712a.999.999 0 0 0 0-1.414l-3.999-4zM16.585 20c-1.248-.021-5.518-.356-8.874-3.712C4.343 12.92 4.019 8.636 4 7.414l2.004-2.005L8.59 7.995 7.297 9.288c-.238.238-.34.582-.271.912.024.115.611 2.842 2.271 4.502s4.387 2.247 4.502 2.271a.994.994 0 0 0 .912-.271l1.293-1.293 2.586 2.586L16.585 20z" } }, { tag: "path", attr: { d: "M15.795 6.791 13.005 4v6.995H20l-2.791-2.79 4.503-4.503-1.414-1.414z" } }] })(t);
}
function Kl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10.09 12.5a8.92 8.92 0 0 1-1-2.2l1.59-1.59a1 1 0 0 0 0-1.42l-4-4a1 1 0 0 0-1.41 0L2.59 6A2 2 0 0 0 2 7.44 15.44 15.44 0 0 0 5.62 17L2.3 20.29l1.41 1.42 18-18-1.41-1.42zM7 15.55a13.36 13.36 0 0 1-3-8.13l2-2L8.59 8 7.3 9.29a1 1 0 0 0-.27.92 11 11 0 0 0 1.62 3.73zm9.71-2.26a1 1 0 0 0-1.41 0l-1.6 1.6-.34-.12-1.56 1.55a12.06 12.06 0 0 0 2 .66 1 1 0 0 0 .91-.27l1.3-1.3L18.59 18l-2 2A13.61 13.61 0 0 1 10 18.1l-1.43 1.45a15.63 15.63 0 0 0 8 2.45 2 2 0 0 0 1.43-.58l2.71-2.71a1 1 0 0 0 0-1.42z" } }] })(t);
}
function Yl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.712 13.288a.999.999 0 0 0-1.414 0l-1.594 1.594c-.739-.22-2.118-.72-2.992-1.594s-1.374-2.253-1.594-2.992l1.594-1.594a.999.999 0 0 0 0-1.414l-4-4a.999.999 0 0 0-1.414 0L2.586 6c-.38.38-.594.902-.586 1.435.023 1.424.4 6.37 4.298 10.268S15.142 21.977 16.566 22h.028c.528 0 1.027-.208 1.405-.586l2.712-2.712a.999.999 0 0 0 0-1.414l-3.999-4zM16.585 20c-1.248-.021-5.518-.356-8.873-3.712C4.346 12.922 4.02 8.637 4 7.414l2.005-2.005 2.586 2.586-1.293 1.293a1 1 0 0 0-.272.912c.024.115.611 2.842 2.271 4.502s4.387 2.247 4.502 2.271a.993.993 0 0 0 .912-.271l1.293-1.293 2.586 2.586L16.585 20z" } }, { tag: "path", attr: { d: "m16.795 5.791-4.497 4.497 1.414 1.414 4.497-4.497L21.005 10V2.995H14z" } }] })(t);
}
function Ql(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.707 12.293a.999.999 0 0 0-1.414 0l-1.594 1.594c-.739-.22-2.118-.72-2.992-1.594s-1.374-2.253-1.594-2.992l1.594-1.594a.999.999 0 0 0 0-1.414l-4-4a.999.999 0 0 0-1.414 0L3.581 5.005c-.38.38-.594.902-.586 1.435.023 1.424.4 6.37 4.298 10.268s8.844 4.274 10.269 4.298h.028c.528 0 1.027-.208 1.405-.586l2.712-2.712a.999.999 0 0 0 0-1.414l-4-4.001zm-.127 6.712c-1.248-.021-5.518-.356-8.873-3.712-3.366-3.366-3.692-7.651-3.712-8.874L7 4.414 9.586 7 8.293 8.293a1 1 0 0 0-.272.912c.024.115.611 2.842 2.271 4.502s4.387 2.247 4.502 2.271a.991.991 0 0 0 .912-.271L17 14.414 19.586 17l-2.006 2.005z" } }] })(t);
}
function Jl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.024 11.536 10 10l-2 3h9l-3.5-5z" } }, { tag: "circle", attr: { cx: "9.503", cy: "7.497", r: "1.503" } }, { tag: "path", attr: { d: "M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.806 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" } }] })(t);
}
function Zl(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9H13V4.069A8.008 8.008 0 0 1 19.931 11zM4 12c0-4.072 3.061-7.436 7-7.931V12a.996.996 0 0 0 .111.438c.015.03.022.063.041.093l4.202 6.723A7.949 7.949 0 0 1 12 20c-4.411 0-8-3.589-8-8zm13.052 6.196L13.805 13h6.126a7.992 7.992 0 0 1-2.879 5.196z" } }] })(t);
}
function to(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2a9.936 9.936 0 0 0-7.071 2.929C3.04 6.818 2 9.33 2 12s1.04 5.182 2.929 7.071C6.818 20.96 9.33 22 12 22s5.182-1.04 7.071-2.929C20.96 17.182 22 14.67 22 12s-1.04-5.182-2.929-7.071A9.936 9.936 0 0 0 12 2zm5.657 15.657C16.146 19.168 14.137 20 12 20s-4.146-.832-5.657-2.343C4.832 16.146 4 14.137 4 12s.832-4.146 2.343-5.657A7.927 7.927 0 0 1 11 4.069V12a1 1 0 0 0 1 1h7.931a7.927 7.927 0 0 1-2.274 4.657zM13 11V4.062a7.945 7.945 0 0 1 4.657 2.281A7.934 7.934 0 0 1 19.938 11H13z" } }] })(t);
}
function eo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M12 5.166V12h6.834A6.817 6.817 0 0 0 12 5.166z" } }] })(t);
}
function ao(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m12 22 1-2v-3h5a1 1 0 0 0 1-1v-1.586c0-.526-.214-1.042-.586-1.414L17 11.586V8a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2H8c-1.103 0-2 .897-2 2v3a1 1 0 0 0 1 1v3.586L5.586 13A2.01 2.01 0 0 0 5 14.414V16a1 1 0 0 0 1 1h5v3l1 2zM8 4h8v2H8V4zM7 14.414l1.707-1.707A.996.996 0 0 0 9 12V8h6v4c0 .266.105.52.293.707L17 14.414V15H7v-.586z" } }] })(t);
}
function ro(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M2.76 20.2a2.73 2.73 0 0 0 2.15.85 8.86 8.86 0 0 0 3.37-.86 9 9 0 0 0 12.27-10.9c1.31-2.23 1.75-4.26.67-5.48a2.94 2.94 0 0 0-2.57-1A5 5 0 0 0 16.1 4 9 9 0 0 0 3.58 15.14c-1.06 1.21-2.05 3.68-.82 5.06zm1.5-1.32c-.22-.25 0-1.07.37-1.76a9.26 9.26 0 0 0 1.57 1.74c-1.03.3-1.71.28-1.94.02zm14.51-5.17A7 7 0 0 1 15.58 18 7.12 7.12 0 0 1 12 19a6.44 6.44 0 0 1-1.24-.13 30.73 30.73 0 0 0 4.42-3.29 31.5 31.5 0 0 0 3.8-4 6.88 6.88 0 0 1-.21 2.13zm.09-8.89a.94.94 0 0 1 .87.32c.23.26.16.94-.26 1.93a9.2 9.2 0 0 0-1.61-1.86 2.48 2.48 0 0 1 1-.39zM5.22 10.31A6.94 6.94 0 0 1 8.41 6 7 7 0 0 1 12 5a6.9 6.9 0 0 1 6 3.41 5.19 5.19 0 0 1 .35.66 27.43 27.43 0 0 1-4.49 5A27.35 27.35 0 0 1 8.35 18a7 7 0 0 1-3.13-7.65z" } }] })(t);
}
function no(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "m9 17 8-5-8-5z" } }] })(t);
}
function co(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 6v12l10-6z" } }] })(t);
}
function io(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 8h2v5c0 2.206 1.794 4 4 4h2v5h2v-5h2c2.206 0 4-1.794 4-4V8h2V6H3v2zm4 0h10v5c0 1.103-.897 2-2 2H9c-1.103 0-2-.897-2-2V8zm0-6h2v3H7zm8 0h2v3h-2z" } }] })(t);
}
function lo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }] })(t);
}
function oo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15 2.013H9V9H2v6h7v6.987h6V15h7V9h-7z" } }] })(t);
}
function ho(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" } }] })(t);
}
function so(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12.01", cy: "12", r: "2" } }, { tag: "path", attr: { d: "M11.01 22h2l.5-7h-3l.5 7z" } }, { tag: "path", attr: { d: "M12 2a10 10 0 0 0-2.45 19.68l-.15-2.12a8 8 0 1 1 5.21 0l-.15 2.12A10 10 0 0 0 12 2z" } }, { tag: "path", attr: { d: "M15.32 9.61a3.44 3.44 0 0 1 .37.68 3.83 3.83 0 0 1 .23.75 3.57 3.57 0 0 1 .09.8 3.66 3.66 0 0 1-.09.81 3.83 3.83 0 0 1-.23.75 3.44 3.44 0 0 1-.37.68 4.7 4.7 0 0 1-.35.43l-.19 2.62a5.33 5.33 0 0 0 .58-.31A5.86 5.86 0 0 0 17 15.2a5.57 5.57 0 0 0 .55-1 5.89 5.89 0 0 0 .35-1.13 6.06 6.06 0 0 0 .1-1.23 6.22 6.22 0 0 0-.13-1.21A6.09 6.09 0 0 0 17 8.49a6.29 6.29 0 0 0-.73-.89 5.67 5.67 0 0 0-.89-.73 6.3 6.3 0 0 0-1-.56A6.17 6.17 0 0 0 13.21 6a6.11 6.11 0 0 0-2.41 0 5.51 5.51 0 0 0-1.13.36 5.57 5.57 0 0 0-1 .55 5.67 5.67 0 0 0-.89.73 6.29 6.29 0 0 0-.78.85 6.09 6.09 0 0 0-.9 2.14 6.21 6.21 0 0 0-.1 1.21 6.06 6.06 0 0 0 .12 1.21 5.89 5.89 0 0 0 .35 1.13 5.57 5.57 0 0 0 .55 1 6.24 6.24 0 0 0 1.62 1.62 5.33 5.33 0 0 0 .58.31L9 14.51a4.7 4.7 0 0 1-.35-.43 3.44 3.44 0 0 1-.37-.68 3.83 3.83 0 0 1-.23-.75 3.65 3.65 0 0 1-.05-.81 3.56 3.56 0 0 1 .08-.8 3.83 3.83 0 0 1 .23-.75 3.44 3.44 0 0 1 .37-.68 4 4 0 0 1 .5-.61 3.87 3.87 0 0 1 .59-.48 3.44 3.44 0 0 1 .68-.37 3.86 3.86 0 0 1 .75-.24 4.36 4.36 0 0 1 1.61 0 3.86 3.86 0 0 1 .75.24 3.58 3.58 0 0 1 1.27.85 3.49 3.49 0 0 1 .49.61z" } }] })(t);
}
function vo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.978 13.21a1 1 0 0 0-.396-1.024l-14-10a.999.999 0 0 0-1.575.931l2 17a1 1 0 0 0 1.767.516l3.612-4.416 3.377 5.46 1.701-1.052-3.357-5.428 6.089-1.218a.995.995 0 0 0 .782-.769zm-8.674.31a1 1 0 0 0-.578.347l-3.008 3.677L7.257 5.127l10.283 7.345-5.236 1.048z" } }] })(t);
}
function uo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 11h7v2H7zm0-4h10.97v2H7zm0 8h13v2H7zM4 4h2v16H4z" } }] })(t);
}
function go(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.707 2.293A.996.996 0 0 0 16 2H8a.996.996 0 0 0-.707.293l-5 5A.996.996 0 0 0 2 8v8c0 .266.105.52.293.707l5 5A.996.996 0 0 0 8 22h8c.266 0 .52-.105.707-.293l5-5A.996.996 0 0 0 22 16V8a.996.996 0 0 0-.293-.707l-5-5zM20 15.586 15.586 20H8.414L4 15.586V8.414L8.414 4h7.172L20 8.414v7.172z" } }] })(t);
}
function fo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m5.553 19.105.764 1.843C7.498 20.555 9.422 20 10 20c.838 0 1.462.208 2.184.448.775.259 1.654.552 2.816.552 1.177 0 3.078-.921 3.447-1.105l-.895-1.789c-.721.36-2.031.894-2.552.894-.838 0-1.462-.208-2.184-.448C12.041 18.293 11.162 18 10 18c-.229 0-.526.037-.857.099C9.702 16.95 10 15.561 10 14h3v-2H9.626c-.042-.107-.084-.216-.125-.317C9.243 11.052 9 10.455 9 9c0-1.369.521-3 3-3 2.224 0 3.021 2.227 3.052 2.316l1.896-.633C16.898 7.533 15.679 4 12 4 8.313 4 7 6.583 7 9c0 1.491.234 2.35.478 3H5v2h3c0 2.467-.892 4.328-2.447 5.105z" } }] })(t);
}
function po(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 21c4.411 0 8-3.589 8-8 0-3.35-2.072-6.221-5-7.411v2.223A6 6 0 0 1 18 13c0 3.309-2.691 6-6 6s-6-2.691-6-6a5.999 5.999 0 0 1 3-5.188V5.589C6.072 6.779 4 9.65 4 13c0 4.411 3.589 8 8 8z" } }, { tag: "path", attr: { d: "M11 2h2v10h-2z" } }] })(t);
}
function zo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 7h-1V2H6v5H5c-1.654 0-3 1.346-3 3v7c0 1.103.897 2 2 2h2v3h12v-3h2c1.103 0 2-.897 2-2v-7c0-1.654-1.346-3-3-3zM8 4h8v3H8V4zm8 16H8v-4h8v4zm4-3h-2v-3H6v3H4v-7c0-.551.449-1 1-1h14c.552 0 1 .449 1 1v7z" } }, { tag: "path", attr: { d: "M14 10h4v2h-4z" } }] })(t);
}
function mo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.97 4.757a.999.999 0 0 0-1.918-.073l-3.186 9.554-2.952-6.644a1.002 1.002 0 0 0-1.843.034L5.323 12H2v2h3.323c.823 0 1.552-.494 1.856-1.257l.869-2.172 3.037 6.835c.162.363.521.594.915.594l.048-.001a.998.998 0 0 0 .9-.683l2.914-8.742.979 3.911A1.995 1.995 0 0 0 18.781 14H22v-2h-3.22l-1.81-7.243z" } }] })(t);
}
function Mo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.707 2.293A.997.997 0 0 0 11 2H6a.997.997 0 0 0-.707.293l-3 3A.996.996 0 0 0 2 6v5c0 .266.105.52.293.707l10 10a.997.997 0 0 0 1.414 0l8-8a.999.999 0 0 0 0-1.414l-10-10zM13 19.586l-9-9V6.414L6.414 4h4.172l9 9L13 19.586z" } }, { tag: "circle", attr: { cx: "8.353", cy: "8.353", r: "1.647" } }] })(t);
}
function Bo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13.707 3.293A.996.996 0 0 0 13 3H4a1 1 0 0 0-1 1v9c0 .266.105.52.293.707l8 8a.997.997 0 0 0 1.414 0l9-9a.999.999 0 0 0 0-1.414l-8-8zM12 19.586l-7-7V5h7.586l7 7L12 19.586z" } }, { tag: "circle", attr: { cx: "8.496", cy: "8.495", r: "1.505" } }] })(t);
}
function Ho(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.445 21.832a1 1 0 0 0 1.11 0l9-6A.998.998 0 0 0 21.8 14.4l-9-12c-.377-.504-1.223-.504-1.6 0l-9 12a1 1 0 0 0 .245 1.432l9 6zM13 19.131V6l6.565 8.754L13 19.131zM11 6v13.131l-6.565-4.377L11 6z" } }] })(t);
}
function wo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 4h4.01V2H2v6h2V4zm0 12H2v6h6.01v-2H4v-4zm16 4h-4v2h6v-6h-2v4zM16 4h4v4h2V2h-6v2z" } }, { tag: "path", attr: { d: "M5 11h6V5H5zm2-4h2v2H7zM5 19h6v-6H5zm2-4h2v2H7zM19 5h-6v6h6zm-2 4h-2V7h2zm-3.99 4h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zm0-4h2v2h-2z" } }] })(t);
}
function xo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 11h8V3H3zm2-6h4v4H5zM3 21h8v-8H3zm2-6h4v4H5zm8-12v8h8V3zm6 6h-4V5h4zm-5.99 4h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4 0h2v2h-2zm2 2h2v2h-2zm-4 0h2v2h-2zm2-6h2v2h-2zm2 2h2v2h-2z" } }] })(t);
}
function Vo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 4C9.243 4 7 6.243 7 9h2c0-1.654 1.346-3 3-3s3 1.346 3 3c0 1.069-.454 1.465-1.481 2.255-.382.294-.813.626-1.226 1.038C10.981 13.604 10.995 14.897 11 15v2h2v-2.009c0-.024.023-.601.707-1.284.32-.32.682-.598 1.031-.867C15.798 12.024 17 11.1 17 9c0-2.757-2.243-5-5-5zm-1 14h2v2h-2z" } }] })(t);
}
function yo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.579 2 2 6.58 2 12s4.579 10 10 10 10-4.58 10-10S17.421 2 12 2zm0 18c-4.337 0-8-3.664-8-8 0-3.998 3.115-7.417 7-7.927V6.09C8.167 6.569 6 9.033 6 12c0 3.309 2.691 6 6 6 1.595 0 3.1-.626 4.237-1.763l-1.414-1.415A3.97 3.97 0 0 1 12 16c-2.206 0-4-1.794-4-4 0-1.858 1.279-3.411 3-3.858v2.146c-.59.353-1 .993-1 1.712 0 1.081.919 2 2 2s2-.919 2-2c0-.719-.41-1.359-1-1.712V4.073c3.885.51 7 3.929 7 7.927 0 4.336-3.663 8-8 8z" } }] })(t);
}
function Co(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 5c-3.859 0-7 3.141-7 7s3.141 7 7 7 7-3.141 7-7-3.141-7-7-7zm0 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" } }, { tag: "path", attr: { d: "M12 9c-1.627 0-3 1.373-3 3s1.373 3 3 3 3-1.373 3-3-1.373-3-3-3z" } }] })(t);
}
function Lo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 12c0 3.859 3.14 7 7 7 3.859 0 7-3.141 7-7s-3.141-7-7-7c-3.86 0-7 3.141-7 7zm12 0c0 2.757-2.243 5-5 5s-5-2.243-5-5 2.243-5 5-5 5 2.243 5 5z" } }] })(t);
}
function _o(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.25 5.025-7.898-2.962-.703 1.873L14.484 5H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.018-.767-1.85-1.75-1.975zM4 19v-7h16v-2H4V7h16l.001 12H4z" } }, { tag: "circle", attr: { cx: "16.5", cy: "15.5", r: "2.5" } }, { tag: "path", attr: { d: "M6 15h4.999v2H6z" } }] })(t);
}
function Ao(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 11h-3V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v14c0 1.654 1.346 3 3 3h14c1.654 0 3-1.346 3-3v-6a1 1 0 0 0-1-1zM5 19a1 1 0 0 1-1-1V5h12v13c0 .351.061.688.171 1H5zm15-1a1 1 0 0 1-2 0v-5h2v5z" } }, { tag: "path", attr: { d: "M6 7h8v2H6zm0 4h8v2H6zm5 4h3v2h-3z" } }] })(t);
}
function bo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h16l.001 14H4z" } }] })(t);
}
function Po(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.224 15.543-.813-1.464-1.748.972.812 1.461c.048.085.082.173.104.264a1.024 1.024 0 0 1-.014.5.988.988 0 0 1-.104.235 1 1 0 0 1-.347.352.978.978 0 0 1-.513.137H14v-2l-4 3 4 3v-2h4.601c.278 0 .552-.037.811-.109a2.948 2.948 0 0 0 1.319-.776c.178-.179.332-.38.456-.593a2.992 2.992 0 0 0 .336-2.215 3.163 3.163 0 0 0-.299-.764zM5.862 11.039l-2.31 4.62a3.06 3.06 0 0 0-.261.755 2.997 2.997 0 0 0 .851 2.735c.178.174.376.326.595.453A3.022 3.022 0 0 0 6.236 20H8v-2H6.236a1.016 1.016 0 0 1-.5-.13.974.974 0 0 1-.353-.349 1 1 0 0 1-.149-.468.933.933 0 0 1 .018-.245c.018-.087.048-.173.089-.256l2.256-4.512 1.599.923L8.598 8 4 9.964l1.862 1.075zm12.736 1.925L19.196 8l-1.638.945-2.843-5.117a2.95 2.95 0 0 0-1.913-1.459 3.227 3.227 0 0 0-.772-.083 3.003 3.003 0 0 0-1.498.433A2.967 2.967 0 0 0 9.41 3.944l-.732 1.464 1.789.895.732-1.465c.045-.09.101-.171.166-.242a.933.933 0 0 1 .443-.27 1.053 1.053 0 0 1 .53-.011.963.963 0 0 1 .63.485l2.858 5.146L14 11l4.598 1.964z" } }] })(t);
}
function So(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 18h3v-2H9c-1.654 0-3-1.346-3-3s1.346-3 3-3h6v3l5-4-5-4v3H9c-2.757 0-5 2.243-5 5s2.243 5 5 5z" } }] })(t);
}
function Eo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z" } }] })(t);
}
function Ro(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12.14 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" } }, { tag: "path", attr: { d: "M16.14 10a3 3 0 0 0-3-3h-5v10h2v-4h1.46l2.67 4h2.4l-2.75-4.12A3 3 0 0 0 16.14 10zm-3 1h-3V9h3a1 1 0 0 1 0 2z" } }] })(t);
}
function To(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.005 5.995h-1v2h1v8h-1v2h1c1.103 0 2-.897 2-2v-8c0-1.102-.898-2-2-2zm-14 4H15v4H6.005z" } }, { tag: "path", attr: { d: "M17.005 17.995V4H20V2h-8v2h3.005v1.995h-11c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h11V20H12v2h8v-2h-2.995v-2.005zm-13-2v-8h11v8h-11z" } }] })(t);
}
function Oo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 6h-5v2h4v9H4V8h5v3l5-4-5-4v3H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z" } }] })(t);
}
function No(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 18v-8a1 1 0 0 0-1-1h-6V6l-5 4 5 4v-3h5v7h2z" } }, { tag: "path", attr: { d: "M9 12.4 6 10l3-2.4V6l-5 4 5 4z" } }] })(t);
}
function $o(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 11h6v7h2v-8a1 1 0 0 0-1-1h-7V6l-5 4 5 4v-3z" } }] })(t);
}
function Io(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 7a1 1 0 0 0-1-1h-8v2h7v5h-3l3.969 5L22 13h-3V7zM5 17a1 1 0 0 0 1 1h8v-2H7v-5h3L6 6l-4 5h3v6z" } }] })(t);
}
function Do(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3-3 1.331-3 3 1.329 3 3 3z" } }, { tag: "path", attr: { d: "M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z" } }] })(t);
}
function ko(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 10h-2V3H8v7H6V3H4v8c0 1.654 1.346 3 3 3h1v7h2v-7h1c1.654 0 3-1.346 3-3V3h-2v7zm7-7h-1c-1.159 0-2 1.262-2 3v8h2v7h2V4a1 1 0 0 0-1-1z" } }] })(t);
}
function jo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.89 10.105a8.696 8.696 0 0 0-.789-1.456l-1.658 1.119a6.606 6.606 0 0 1 .987 2.345 6.659 6.659 0 0 1 0 2.648 6.495 6.495 0 0 1-.384 1.231 6.404 6.404 0 0 1-.603 1.112 6.654 6.654 0 0 1-1.776 1.775 6.606 6.606 0 0 1-2.343.987 6.734 6.734 0 0 1-2.646 0 6.55 6.55 0 0 1-3.317-1.788 6.605 6.605 0 0 1-1.408-2.088 6.613 6.613 0 0 1-.382-1.23 6.627 6.627 0 0 1 .382-3.877A6.551 6.551 0 0 1 7.36 8.797 6.628 6.628 0 0 1 9.446 7.39c.395-.167.81-.296 1.23-.382.107-.022.216-.032.324-.049V10l5-4-5-4v2.938a8.805 8.805 0 0 0-.725.111 8.512 8.512 0 0 0-3.063 1.29A8.566 8.566 0 0 0 4.11 16.77a8.535 8.535 0 0 0 1.835 2.724 8.614 8.614 0 0 0 2.721 1.833 8.55 8.55 0 0 0 5.061.499 8.576 8.576 0 0 0 6.162-5.056c.22-.52.389-1.061.5-1.608a8.643 8.643 0 0 0 0-3.45 8.684 8.684 0 0 0-.499-1.607z" } }] })(t);
}
function Uo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M11 16V8l-5 4zm6 0V8l-5 4z" } }] })(t);
}
function Fo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 12V7l-7 5 7 5zm7-5-7 5 7 5z" } }] })(t);
}
function qo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z" } }] })(t);
}
function Wo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.999 1.993c-5.514.001-10 4.487-10 10.001s4.486 10 10.001 10c5.513 0 9.999-4.486 10-10 0-5.514-4.486-10-10.001-10.001zM12 19.994c-4.412 0-8.001-3.589-8.001-8s3.589-8 8-8.001C16.411 3.994 20 7.583 20 11.994c-.001 4.411-3.59 8-8 8z" } }, { tag: "path", attr: { d: "M12 10.994H8v2h4V16l4.005-4.005L12 7.991z" } }] })(t);
}
function Go(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A.998.998 0 0 0 5 3v18a1 1 0 0 0 .536.886zM7 4.909 17.243 12 7 19.091V4.909z" } }] })(t);
}
function Xo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2.007a9.928 9.928 0 0 0-7.071 2.922c-3.899 3.899-3.899 10.243 0 14.143A9.93 9.93 0 0 0 12 21.995a9.93 9.93 0 0 0 7.071-2.923c3.899-3.899 3.899-10.243 0-14.143A9.928 9.928 0 0 0 12 2.007zm5.657 15.65A7.946 7.946 0 0 1 12 19.994c-2.141 0-4.15-.83-5.657-2.337-3.119-3.119-3.119-8.195 0-11.314A7.944 7.944 0 0 1 12 4.007c2.141 0 4.15.829 5.657 2.336 3.119 3.119 3.119 8.195 0 11.314z" } }, { tag: "path", attr: { d: "M9.661 8.247 8.247 9.661l3.214 3.214L9.336 15H15V9.337l-2.125 2.124z" } }] })(t);
}
function Ko(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 15h10v2H10zm-6 4h16v2H4zm6-8h10v2H10zm0-4h10v2H10zM4 3h16v2H4zm0 5v8l4-4z" } }] })(t);
}
function Yo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12.006 2.007a9.927 9.927 0 0 0-7.071 2.922c-3.898 3.899-3.898 10.243 0 14.142 1.885 1.885 4.396 2.923 7.071 2.923s5.187-1.038 7.071-2.923c3.898-3.898 3.898-10.242 0-14.142a9.928 9.928 0 0 0-7.071-2.922zm5.657 15.649c-1.507 1.507-3.517 2.337-5.657 2.337s-4.15-.83-5.657-2.337c-3.118-3.119-3.118-8.194 0-11.313 1.507-1.507 3.516-2.336 5.657-2.336s4.15.829 5.657 2.336c3.118 3.119 3.118 8.194 0 11.313z" } }, { tag: "path", attr: { d: "m11.467 11.125-3.214 3.214 1.414 1.414 3.214-3.214 2.125 2.124V9H9.343z" } }] })(t);
}
function Qo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.92 2.38A15.72 15.72 0 0 0 17.5 2a8.26 8.26 0 0 0-6 2.06Q9.89 5.67 8.31 7.27c-1.21-.13-4.08-.2-6 1.74a1 1 0 0 0 0 1.41l11.3 11.32a1 1 0 0 0 1.41 0c1.95-2 1.89-4.82 1.77-6l3.21-3.2c3.19-3.19 1.74-9.18 1.68-9.43a1 1 0 0 0-.76-.73zm-2.36 8.75L15 14.67a1 1 0 0 0-.27.9 6.81 6.81 0 0 1-.54 3.94L4.52 9.82a6.67 6.67 0 0 1 4-.5A1 1 0 0 0 9.39 9s1.4-1.45 3.51-3.56A6.61 6.61 0 0 1 17.5 4a14.51 14.51 0 0 1 2.33.2c.24 1.43.62 5.04-1.27 6.93z" } }, { tag: "circle", attr: { cx: "15.73", cy: "8.3", r: "2" } }, { tag: "path", attr: { d: "M5 16c-2 1-2 5-2 5a7.81 7.81 0 0 0 5-2z" } }] })(t);
}
function Jo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6.758 8.758 5.344 7.344a8.048 8.048 0 0 0-1.841 2.859l1.873.701a6.048 6.048 0 0 1 1.382-2.146zM19 12.999a7.935 7.935 0 0 0-2.344-5.655A7.917 7.917 0 0 0 12 5.069V2L7 6l5 4V7.089a5.944 5.944 0 0 1 3.242 1.669A5.956 5.956 0 0 1 17 13v.002c0 .33-.033.655-.086.977-.007.043-.011.088-.019.131a6.053 6.053 0 0 1-1.138 2.536c-.16.209-.331.412-.516.597a5.954 5.954 0 0 1-.728.613 5.906 5.906 0 0 1-2.277 1.015c-.142.03-.285.05-.43.069-.062.009-.122.021-.184.027a6.104 6.104 0 0 1-1.898-.103L9.3 20.819a8.087 8.087 0 0 0 2.534.136c.069-.007.138-.021.207-.03.205-.026.409-.056.61-.098l.053-.009-.001-.005a7.877 7.877 0 0 0 2.136-.795l.001.001.028-.019a7.906 7.906 0 0 0 1.01-.67c.27-.209.532-.43.777-.675.248-.247.47-.513.681-.785.021-.028.049-.053.07-.081l-.006-.004a7.899 7.899 0 0 0 1.093-1.997l.008.003c.029-.078.05-.158.076-.237.037-.11.075-.221.107-.333.04-.14.073-.281.105-.423.022-.099.048-.195.066-.295.032-.171.056-.344.076-.516.01-.076.023-.15.03-.227.023-.249.037-.5.037-.753.002-.002.002-.004.002-.008zM6.197 16.597l-1.6 1.201a8.045 8.045 0 0 0 2.569 2.225l.961-1.754a6.018 6.018 0 0 1-1.93-1.672zM5 13c0-.145.005-.287.015-.429l-1.994-.143a7.977 7.977 0 0 0 .483 3.372l1.873-.701A5.975 5.975 0 0 1 5 13z" } }] })(t);
}
function Zo(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.242 17.242a6.04 6.04 0 0 1-1.37 1.027l.961 1.754a8.068 8.068 0 0 0 2.569-2.225l-1.6-1.201a5.938 5.938 0 0 1-.56.645zm1.743-4.671a5.975 5.975 0 0 1-.362 2.528l1.873.701a7.977 7.977 0 0 0 .483-3.371l-1.994.142zm1.512-2.368a8.048 8.048 0 0 0-1.841-2.859l-1.414 1.414a6.071 6.071 0 0 1 1.382 2.146l1.873-.701zm-8.128 8.763c-.047-.005-.094-.015-.141-.021a6.701 6.701 0 0 1-.468-.075 5.923 5.923 0 0 1-2.421-1.122 5.954 5.954 0 0 1-.583-.506 6.138 6.138 0 0 1-.516-.597 5.91 5.91 0 0 1-.891-1.634 6.086 6.086 0 0 1-.247-.902c-.008-.043-.012-.088-.019-.131A6.332 6.332 0 0 1 6 13.002V13c0-1.603.624-3.109 1.758-4.242A5.944 5.944 0 0 1 11 7.089V10l5-4-5-4v3.069a7.917 7.917 0 0 0-4.656 2.275A7.936 7.936 0 0 0 4 12.999v.009c0 .253.014.504.037.753.007.076.021.15.03.227.021.172.044.345.076.516.019.1.044.196.066.295.032.142.065.283.105.423.032.112.07.223.107.333.026.079.047.159.076.237l.008-.003A7.948 7.948 0 0 0 5.6 17.785l-.007.005c.021.028.049.053.07.081.211.272.433.538.681.785a8.236 8.236 0 0 0 .966.816c.265.192.537.372.821.529l.028.019.001-.001a7.877 7.877 0 0 0 2.136.795l-.001.005.053.009c.201.042.405.071.61.098.069.009.138.023.207.03a8.038 8.038 0 0 0 2.532-.137l-.424-1.955a6.11 6.11 0 0 1-1.904.102z" } }] })(t);
}
function th(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 20.001C19 11.729 12.271 5 4 5v2c7.168 0 13 5.832 13 13.001h2z" } }, { tag: "path", attr: { d: "M12 20.001h2C14 14.486 9.514 10 4 10v2c4.411 0 8 3.589 8 8.001z" } }, { tag: "circle", attr: { cx: "6", cy: "18", r: "2" } }] })(t);
}
function eh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 21h2v-3h6v-2h-6v-2h4.5c2.757 0 5-2.243 5-5s-2.243-5-5-5H9a1 1 0 0 0-1 1v7H5v2h3v2H5v2h3v3zm2-15h4.5c1.654 0 3 1.346 3 3s-1.346 3-3 3H10V6z" } }] })(t);
}
function ah(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.875 7H3.125C1.953 7 1 7.897 1 9v6c0 1.103.953 2 2.125 2h17.75C22.047 17 23 16.103 23 15V9c0-1.103-.953-2-2.125-2zm0 8H3.125c-.057 0-.096-.016-.113-.016-.007 0-.011.002-.012.008l-.012-5.946c.007-.01.052-.046.137-.046H5v3h2V9h2v4h2V9h2v3h2V9h2v4h2V9h1.875c.079.001.122.028.125.008l.012 5.946c-.007.01-.052.046-.137.046z" } }] })(t);
}
function rh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "17", cy: "4", r: "2" } }, { tag: "path", attr: { d: "M15.777 10.969a2.007 2.007 0 0 0 2.148.83l3.316-.829-.483-1.94-3.316.829-1.379-2.067a2.01 2.01 0 0 0-1.272-.854l-3.846-.77a1.998 1.998 0 0 0-2.181 1.067l-1.658 3.316 1.789.895 1.658-3.317 1.967.394L7.434 17H3v2h4.434c.698 0 1.355-.372 1.715-.971l1.918-3.196 5.169 1.034 1.816 5.449 1.896-.633-1.815-5.448a2.007 2.007 0 0 0-1.506-1.33l-3.039-.607 1.772-2.954.417.625z" } }] })(t);
}
function nh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17 6V4H6v2h3.5c1.302 0 2.401.838 2.815 2H6v2h6.315A2.994 2.994 0 0 1 9.5 12H6v2.414L11.586 20h2.828l-6-6H9.5a5.007 5.007 0 0 0 4.898-4H17V8h-2.602a4.933 4.933 0 0 0-.924-2H17z" } }] })(t);
}
function ch(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "8.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.493", cy: "10.493", r: "1.493" } }, { tag: "path", attr: { d: "M12 14c-3 0-4 3-4 3h8s-1-3-4-3z" } }] })(t);
}
function ih(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 21h14a2 2 0 0 0 2-2V8a1 1 0 0 0-.29-.71l-4-4A1 1 0 0 0 16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2zm10-2H9v-5h6zM13 7h-2V5h2zM5 5h2v4h8V5h.59L19 8.41V19h-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5H5z" } }] })(t);
}
function lh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 4v5h2V5h4V3H4a1 1 0 0 0-1 1zm18 5V4a1 1 0 0 0-1-1h-5v2h4v4h2zm-2 10h-4v2h5a1 1 0 0 0 1-1v-5h-2v4zM9 21v-2H5v-4H3v5a1 1 0 0 0 1 1h5zM2 11h20v2H2z" } }] })(t);
}
function oh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 14h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 19h3v-2H5v-2H3v3a1 1 0 0 0 1 1zM19 4a1 1 0 0 0-1-1h-3v2h2v2h2V4zM5 5h2V3H4a1 1 0 0 0-1 1v3h2V5zM3 9h2v4H3zm14 0h2v3h-2zM9 3h4v2H9zm0 14h3v2H9z" } }] })(t);
}
function hh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" } }] })(t);
}
function sh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" } }, { tag: "path", attr: { d: "M11.412 8.586c.379.38.588.882.588 1.414h2a3.977 3.977 0 0 0-1.174-2.828c-1.514-1.512-4.139-1.512-5.652 0l1.412 1.416c.76-.758 2.07-.756 2.826-.002z" } }] })(t);
}
function vh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" } }] })(t);
}
function uh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 2H8c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM8 16V4h12l.002 12H8z" } }, { tag: "path", attr: { d: "M4 8H2v12c0 1.103.897 2 2 2h12v-2H4V8zm8.933 3.519-1.726-1.726-1.414 1.414 3.274 3.274 5.702-6.84-1.538-1.282z" } }] })(t);
}
function dh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 9a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1H9V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1v6H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1h6v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1V9h1zm-3-4h2v2h-2V5zM5 5h2v2H5V5zm2 14H5v-2h2v2zm12 0h-2v-2h2v2zm-2-4h-1a1 1 0 0 0-1 1v1H9v-1a1 1 0 0 0-1-1H7V9h1a1 1 0 0 0 1-1V7h6v1a1 1 0 0 0 1 1h1v6z" } }] })(t);
}
function gh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.426 11.095-17-8A.999.999 0 0 0 3.03 4.242L4.969 12 3.03 19.758a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81zM5.481 18.197l.839-3.357L12 12 6.32 9.16l-.839-3.357L18.651 12l-13.17 6.197z" } }] })(t);
}
function fh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM4 9V5h16v4zm16 4H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2zM4 19v-4h16v4z" } }, { tag: "path", attr: { d: "M17 6h2v2h-2zm-3 0h2v2h-2zm3 10h2v2h-2zm-3 0h2v2h-2z" } }] })(t);
}
function ph(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.494 9.05a8.14 8.14 0 0 0-4.544-4.544C14.713 3.088 13.485 2 12 2S9.287 3.088 9.05 4.506A8.136 8.136 0 0 0 4.506 9.05C3.088 9.287 2 10.515 2 12s1.088 2.713 2.506 2.95a8.14 8.14 0 0 0 4.544 4.544C9.287 20.912 10.515 22 12 22s2.713-1.088 2.95-2.506a8.14 8.14 0 0 0 4.544-4.544C20.912 14.713 22 13.485 22 12s-1.088-2.713-2.506-2.95zM12 4a1 1 0 0 1 1 1c0 .06-.023.11-.034.167a1.015 1.015 0 0 1-.083.279c-.014.027-.034.049-.051.075a1.062 1.062 0 0 1-.16.209c-.04.037-.09.062-.136.092-.054.036-.104.078-.165.103-.115.047-.239.075-.371.075s-.256-.028-.371-.075c-.061-.024-.111-.066-.165-.103-.046-.03-.096-.055-.136-.092a1.062 1.062 0 0 1-.16-.209c-.017-.026-.037-.048-.051-.075a1.026 1.026 0 0 1-.083-.279C11.023 5.11 11 5.06 11 5a1 1 0 0 1 1-1zm-7 7c.06 0 .11.023.167.034.099.017.194.041.279.083.027.014.049.034.075.051.075.047.149.097.209.16.037.04.062.09.092.136.036.054.078.104.103.165.047.115.075.239.075.371s-.028.256-.075.371c-.024.061-.066.111-.103.165-.03.046-.055.096-.092.136-.06.063-.134.113-.209.16-.026.017-.048.037-.075.051a1.026 1.026 0 0 1-.279.083C5.11 12.977 5.06 13 5 13a1 1 0 0 1 0-2zm7 9a1 1 0 0 1-1-1c0-.06.023-.11.034-.167.017-.099.041-.194.083-.279.014-.027.034-.049.051-.075.047-.075.097-.149.16-.209.04-.037.09-.062.136-.092.054-.036.104-.078.165-.103.115-.047.239-.075.371-.075s.256.028.371.075c.061.024.111.066.165.103.046.03.096.055.136.092.063.06.113.134.16.209.017.026.037.048.051.075.042.085.066.181.083.279.011.057.034.107.034.167a1 1 0 0 1-1 1zm2.583-2.512c-.006-.011-.017-.019-.022-.029a3.007 3.007 0 0 0-.996-1.007c-.054-.033-.109-.06-.166-.09a2.902 2.902 0 0 0-.486-.205c-.064-.021-.128-.044-.194-.061-.233-.057-.471-.096-.719-.096s-.486.039-.718.097c-.066.017-.13.039-.195.061a2.928 2.928 0 0 0-.485.205c-.056.029-.112.057-.166.09a3.007 3.007 0 0 0-.996 1.007c-.006.011-.017.019-.022.029a6.15 6.15 0 0 1-2.905-2.905c.011-.006.019-.017.029-.022a3.007 3.007 0 0 0 1.007-.996c.033-.054.061-.11.09-.166.083-.154.15-.316.205-.485.021-.065.044-.129.061-.195.056-.234.095-.472.095-.72s-.039-.486-.097-.718a2.568 2.568 0 0 0-.061-.194 2.902 2.902 0 0 0-.205-.486c-.03-.057-.057-.112-.09-.166A3.007 3.007 0 0 0 6.54 9.44c-.01-.006-.018-.017-.028-.023a6.15 6.15 0 0 1 2.905-2.905c.006.01.017.018.022.029.248.411.588.755.996 1.007.054.033.11.061.166.09.155.083.316.15.486.205.064.021.128.044.194.061.233.057.47.096.719.096a2.94 2.94 0 0 0 .912-.158c.17-.055.331-.122.486-.205.056-.029.112-.057.166-.09.408-.252.748-.596.996-1.007.006-.011.017-.019.022-.029a6.15 6.15 0 0 1 2.905 2.905c-.011.006-.019.017-.029.022a3.007 3.007 0 0 0-1.007.996c-.033.054-.061.11-.09.166-.083.155-.15.316-.205.486-.021.064-.044.128-.061.194A3.07 3.07 0 0 0 16 12a2.94 2.94 0 0 0 .158.912c.055.17.122.331.205.486.029.056.057.112.09.166.252.408.596.748 1.007.996.011.006.019.017.029.022a6.145 6.145 0 0 1-2.906 2.906zM19 13c-.06 0-.11-.023-.167-.034a1.015 1.015 0 0 1-.279-.083c-.027-.014-.049-.034-.075-.051a1.062 1.062 0 0 1-.209-.16c-.037-.04-.062-.09-.092-.136-.036-.054-.078-.104-.103-.165-.047-.115-.075-.239-.075-.371s.028-.256.075-.371c.024-.061.066-.111.103-.165.03-.046.055-.096.092-.136.06-.063.134-.113.209-.16.026-.017.048-.037.075-.051.085-.042.181-.066.279-.083.057-.011.107-.034.167-.034a1 1 0 0 1 0 2z" } }] })(t);
}
function zh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 14.185v-2.369A2.997 2.997 0 0 0 22 9c0-1.654-1.346-3-3-3a2.99 2.99 0 0 0-2.116.876L12.969 5.31c.01-.103.031-.204.031-.31 0-1.654-1.346-3-3-3S7 3.346 7 5c0 .762.295 1.451.765 1.981L6.091 9.212A2.977 2.977 0 0 0 5 9c-1.654 0-3 1.346-3 3s1.346 3 3 3c.159 0 .313-.023.465-.047L7.4 17.532c-.248.436-.4.932-.4 1.468 0 1.654 1.346 3 3 3a2.994 2.994 0 0 0 2.863-2.153l3.962-.792A2.987 2.987 0 0 0 19 20c1.654 0 3-1.346 3-3a2.995 2.995 0 0 0-2-2.815zM19 8a1.001 1.001 0 1 1-1 1c0-.551.448-1 1-1zm-9-4a1.001 1.001 0 1 1-1 1c0-.551.448-1 1-1zm-6 8a1.001 1.001 0 1 1 1 1c-.552 0-1-.449-1-1zm6 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2.761-2.172A3.005 3.005 0 0 0 10 16c-.386 0-.752.079-1.091.213l-1.674-2.231C7.705 13.451 8 12.762 8 12c0-.536-.152-1.032-.399-1.467l1.935-2.58c.152.024.305.047.464.047a2.99 2.99 0 0 0 2.116-.876l3.915 1.566c-.01.103-.031.204-.031.31 0 1.302.839 2.401 2 2.815v2.369a2.996 2.996 0 0 0-2 2.815c0 .061.015.117.018.177l-3.257.652zM19 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" } }] })(t);
}
function mh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 6c0-1.654-1.346-3-3-3a2.993 2.993 0 0 0-2.815 2h-6.37A2.993 2.993 0 0 0 6 3C4.346 3 3 4.346 3 6c0 1.302.839 2.401 2 2.815v6.369A2.997 2.997 0 0 0 3 18c0 1.654 1.346 3 3 3a2.993 2.993 0 0 0 2.815-2h6.369a2.994 2.994 0 0 0 2.815 2c1.654 0 3-1.346 3-3a2.997 2.997 0 0 0-2-2.816V8.816A2.996 2.996 0 0 0 21 6zm-3-1a1.001 1.001 0 1 1-1 1c0-.551.448-1 1-1zm-2.815 12h-6.37A2.99 2.99 0 0 0 7 15.184V8.816A2.99 2.99 0 0 0 8.815 7h6.369A2.99 2.99 0 0 0 17 8.815v6.369A2.99 2.99 0 0 0 15.185 17zM6 5a1.001 1.001 0 1 1-1 1c0-.551.448-1 1-1zm0 14a1.001 1.001 0 0 1 0-2 1.001 1.001 0 0 1 0 2zm12 0a1.001 1.001 0 0 1 0-2 1.001 1.001 0 0 1 0 2z" } }] })(t);
}
function Mh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 15c-.183 0-.358.022-.532.054L8.946 6.532C8.978 6.359 9 6.182 9 6c0-1.654-1.346-3-3-3S3 4.346 3 6c0 1.302.839 2.401 2 2.815v6.369A2.997 2.997 0 0 0 3 18c0 1.654 1.346 3 3 3a2.993 2.993 0 0 0 2.815-2h6.369a2.994 2.994 0 0 0 2.815 2c1.654 0 3-1.346 3-3S19.654 15 18 15zm-11 .184V8.816c.329-.118.629-.291.894-.508l7.799 7.799a2.961 2.961 0 0 0-.508.894h-6.37A2.99 2.99 0 0 0 7 15.184zM6 5a1.001 1.001 0 1 1-1 1c0-.551.448-1 1-1zm0 14a1.001 1.001 0 0 1 0-2 1.001 1.001 0 0 1 0 2zm12 0a1.001 1.001 0 0 1 0-2 1.001 1.001 0 0 1 0 2z" } }] })(t);
}
function Bh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5.5 15a3.51 3.51 0 0 0 2.36-.93l6.26 3.58a3.06 3.06 0 0 0-.12.85 3.53 3.53 0 1 0 1.14-2.57l-6.26-3.58a2.74 2.74 0 0 0 .12-.76l6.15-3.52A3.49 3.49 0 1 0 14 5.5a3.35 3.35 0 0 0 .12.85L8.43 9.6A3.5 3.5 0 1 0 5.5 15zm12 2a1.5 1.5 0 1 1-1.5 1.5 1.5 1.5 0 0 1 1.5-1.5zm0-13A1.5 1.5 0 1 1 16 5.5 1.5 1.5 0 0 1 17.5 4zm-12 6A1.5 1.5 0 1 1 4 11.5 1.5 1.5 0 0 1 5.5 10z" } }] })(t);
}
function Hh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 7.05V4a1 1 0 0 0-1-1 1 1 0 0 0-.7.29l-7 7a1 1 0 0 0 0 1.42l7 7A1 1 0 0 0 11 18v-3.1h.85a10.89 10.89 0 0 1 8.36 3.72 1 1 0 0 0 1.11.35A1 1 0 0 0 22 18c0-9.12-8.08-10.68-11-10.95zm.85 5.83a14.74 14.74 0 0 0-2 .13A1 1 0 0 0 9 14v1.59L4.42 11 9 6.41V8a1 1 0 0 0 1 1c.91 0 8.11.2 9.67 6.43a13.07 13.07 0 0 0-7.82-2.55z" } }] })(t);
}
function wh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 8v8h2V8c0-2.206-1.794-4-4-4H5v16h2V6h4c1.103 0 2 .897 2 2z" } }, { tag: "path", attr: { d: "M17 16c0 1.103-.897 2-2 2h-4V8H9v12h6c2.206 0 4-1.794 4-4V4h-2v12z" } }] })(t);
}
function xh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.438 5.089a1.002 1.002 0 0 0-.959.015c-.684.389-1.355.577-2.053.577-2.035 0-3.952-1.629-5.722-3.39-.375-.373-1.063-.373-1.438 0C9.592 3.959 7.598 5.663 5.51 5.663c-.69 0-1.351-.184-2.018-.561-.298-.166-.658-.171-.96-.012s-.501.461-.528.801c-.011.129-.944 12.872 9.683 16.041a.99.99 0 0 0 .286.042H12c.097 0 .192-.014.285-.041 10.657-3.17 9.695-15.916 9.684-16.044a1 1 0 0 0-.531-.8zm-9.452 14.842c-6.979-2.255-7.934-9.412-8.014-12.477.505.14 1.019.209 1.537.209 2.492 0 4.65-1.567 6.476-3.283 1.893 1.788 3.983 3.301 6.442 3.301.53 0 1.057-.074 1.575-.22-.074 3.065-1.021 10.217-8.016 12.47z" } }] })(t);
}
function Vh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.342 8.447 1.105-.553A.998.998 0 0 0 21.8 6.4l-3-4A1 1 0 0 0 18 2H6a1 1 0 0 0-.8.4l-3 4a1 1 0 0 0 .352 1.494l1.105.553-1.131 2.262A5.052 5.052 0 0 0 2 12.944v.591a6.028 6.028 0 0 0 3.894 5.618l3.431 1.286a5.488 5.488 0 0 1 1.969 1.268.997.997 0 0 0 1.413 0 5.486 5.486 0 0 1 1.969-1.267l3.432-1.287A6.03 6.03 0 0 0 22 13.535v-.591c0-.771-.183-1.545-.527-2.236l-1.131-2.261zM20 13.535a4.019 4.019 0 0 1-2.596 3.745l-3.431 1.287a7.5 7.5 0 0 0-1.974 1.101 7.515 7.515 0 0 0-1.974-1.102L6.596 17.28A4.019 4.019 0 0 1 4 13.535v-.591c0-.463.109-.928.316-1.342l1.131-2.261a2.003 2.003 0 0 0-.895-2.684l-.033-.015L6.5 4h11l1.981 2.642-.034.017a2.004 2.004 0 0 0-.895 2.684l1.131 2.26c.208.414.317.878.317 1.341v.591z" } }] })(t);
}
function yh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.995 6.9a.998.998 0 0 0-.548-.795l-8-4a1 1 0 0 0-.895 0l-8 4a1.002 1.002 0 0 0-.547.795c-.011.107-.961 10.767 8.589 15.014a.987.987 0 0 0 .812 0c9.55-4.247 8.6-14.906 8.589-15.014zM12 19.897V12H5.51a15.473 15.473 0 0 1-.544-4.365L12 4.118V12h6.46c-.759 2.74-2.498 5.979-6.46 7.897z" } }] })(t);
}
function Ch(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.48 6.105-8-4a1 1 0 0 0-.895 0l-8 4a1.002 1.002 0 0 0-.547.795c-.011.107-.961 10.767 8.589 15.014a.99.99 0 0 0 .812 0c9.55-4.247 8.6-14.906 8.589-15.014a1.001 1.001 0 0 0-.548-.795zm-8.447 13.792C5.265 16.625 4.944 9.642 4.999 7.635l7.034-3.517 7.029 3.515c.038 1.989-.328 9.018-7.029 12.264z" } }, { tag: "path", attr: { d: "M14.293 8.293 12 10.586 9.707 8.293 8.293 9.707 10.586 12l-2.293 2.293 1.414 1.414L12 13.414l2.293 2.293 1.414-1.414L13.414 12l2.293-2.293z" } }] })(t);
}
function Lh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.995 6.903a.997.997 0 0 0-.547-.797l-7.973-4a.997.997 0 0 0-.895-.002l-8.027 4c-.297.15-.502.437-.544.767-.013.097-1.145 9.741 8.541 15.008a.995.995 0 0 0 .969-.009c9.307-5.259 8.514-14.573 8.476-14.967zm-8.977 12.944c-6.86-4.01-7.14-10.352-7.063-12.205l7.071-3.523 6.998 3.511c.005 1.87-.481 8.243-7.006 12.217z" } }] })(t);
}
function _h(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "circle", attr: { cx: "8.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.493", cy: "10.493", r: "1.493" } }, { tag: "ellipse", attr: { cx: "12", cy: "15.5", rx: "3", ry: "2.5" } }] })(t);
}
function Ah(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 22h14c1.103 0 2-.897 2-2V9a1 1 0 0 0-1-1h-3V7c0-2.757-2.243-5-5-5S7 4.243 7 7v1H4a1 1 0 0 0-1 1v11c0 1.103.897 2 2 2zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9V7zm-4 3h2v2h2v-2h6v2h2v-2h2l.002 10H5V10z" } }] })(t);
}
function bh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14 12c-1.095 0-2-.905-2-2 0-.354.103-.683.268-.973C12.178 9.02 12.092 9 12 9a3.02 3.02 0 0 0-3 3c0 1.642 1.358 3 3 3 1.641 0 3-1.358 3-3 0-.092-.02-.178-.027-.268-.29.165-.619.268-.973.268z" } }, { tag: "path", attr: { d: "M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316-.105-.316C21.927 11.617 19.633 5 12 5zm0 12c-5.351 0-7.424-3.846-7.926-5C4.578 10.842 6.652 7 12 7c5.351 0 7.424 3.846 7.926 5-.504 1.158-2.578 5-7.926 5z" } }] })(t);
}
function Ph(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 9a3.02 3.02 0 0 0-3 3c0 1.642 1.358 3 3 3 1.641 0 3-1.358 3-3 0-1.641-1.359-3-3-3z" } }, { tag: "path", attr: { d: "M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316-.105-.316C21.927 11.617 19.633 5 12 5zm0 12c-5.351 0-7.424-3.846-7.926-5C4.578 10.842 6.652 7 12 7c5.351 0 7.424 3.846 7.926 5-.504 1.158-2.578 5-7.926 5z" } }] })(t);
}
function Sh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17 17h-1.559l-9.7-10.673A1 1 0 0 0 5.001 6H2v2h2.559l4.09 4.5-4.09 4.501H2v2h3.001a1 1 0 0 0 .74-.327L10 13.987l4.259 4.686a1 1 0 0 0 .74.327H17v3l5-4-5-4v3z" } }, { tag: "path", attr: { d: "M15.441 8H17v3l5-3.938L17 3v3h-2.001a1 1 0 0 0-.74.327l-3.368 3.707 1.48 1.346L15.441 8z" } }] })(t);
}
function Eh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V7h6v12H4zm8 0V7h8V5l.002 14H12z" } }, { tag: "path", attr: { d: "M6 10h2v2H6zm0 4h2v2H6z" } }] })(t);
}
function Rh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 13.01h-7V10h1c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h1v3.01H4V18H3v4h4v-4H6v-2.99h5V18h-1v4h4v-4h-1v-2.99h5V18h-1v4h4v-4h-1v-4.99zM10 8V4h4l.002 4H10z" } }] })(t);
}
function Th(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "m8 16 5-4-5-4zm5-4v4h2V8h-2z" } }] })(t);
}
function Oh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 7v10l7-5zm9 10V7h-2v10z" } }] })(t);
}
function Nh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M16 16V8l-5 4zM9 8v8h2V8z" } }] })(t);
}
function $h(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m16 7-7 5 7 5zm-7 5V7H7v10h2z" } }] })(t);
}
function Ih(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "ellipse", attr: { cx: "12", cy: "15.5", rx: "3", ry: "2.5" } }, { tag: "path", attr: { d: "M10 7c-2.905 0-3.983 2.386-4 3.99l2 .021C8.002 10.804 8.076 9 10 9V7zm4 0v2c1.826 0 1.992 1.537 2 2.007L17 11h1c0-1.608-1.065-4-4-4z" } }] })(t);
}
function Dh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7.5 14.5c-1.58 0-2.903 1.06-3.337 2.5H2v2h2.163c.434 1.44 1.757 2.5 3.337 2.5s2.903-1.06 3.337-2.5H22v-2H10.837c-.434-1.44-1.757-2.5-3.337-2.5zm0 5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5S9 17.173 9 18s-.673 1.5-1.5 1.5zm9-11c-1.58 0-2.903 1.06-3.337 2.5H2v2h11.163c.434 1.44 1.757 2.5 3.337 2.5s2.903-1.06 3.337-2.5H22v-2h-2.163c-.434-1.44-1.757-2.5-3.337-2.5zm0 5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5z" } }, { tag: "path", attr: { d: "M12.837 5C12.403 3.56 11.08 2.5 9.5 2.5S6.597 3.56 6.163 5H2v2h4.163C6.597 8.44 7.92 9.5 9.5 9.5s2.903-1.06 3.337-2.5h9.288V5h-9.288zM9.5 7.5C8.673 7.5 8 6.827 8 6s.673-1.5 1.5-1.5S11 5.173 11 6s-.673 1.5-1.5 1.5z" } }] })(t);
}
function kh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 5h9v2h-9zM2 7h7v2h2V3H9v2H2zm7 10h13v2H9zm10-6h3v2h-3zm-2 4V9.012h-2V11H2v2h13v2zM7 21v-6H5v2H2v2h3v2z" } }] })(t);
}
function jh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h7v3H8v2h8v-2h-3v-3h7c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 15V5h16l.001 10H4z" } }, { tag: "path", attr: { d: "m10 13 5-3-5-3z" } }] })(t);
}
function Uh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M14.829 14.828a4.055 4.055 0 0 1-1.272.858 4.002 4.002 0 0 1-4.875-1.45l-1.658 1.119a6.063 6.063 0 0 0 1.621 1.62 5.963 5.963 0 0 0 2.148.903 6.042 6.042 0 0 0 2.415 0 5.972 5.972 0 0 0 2.148-.903c.313-.212.612-.458.886-.731.272-.271.52-.571.734-.889l-1.658-1.119a4.017 4.017 0 0 1-.489.592z" } }, { tag: "circle", attr: { cx: "8.5", cy: "10.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.493", cy: "10.493", r: "1.493" } }] })(t);
}
function Fh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.707 14.707A1 1 0 0 0 19 13h-7v2h4.586l-4.293 4.293A1 1 0 0 0 13 21h7v-2h-4.586l4.293-4.293zM7 3.99H5v12H2l4 4 4-4H7zM17 3h-2c-.417 0-.79.259-.937.649l-2.75 7.333h2.137L14.193 9h3.613l.743 1.981h2.137l-2.75-7.333A1 1 0 0 0 17 3zm-2.057 4 .75-2h.613l.75 2h-2.113z" } }] })(t);
}
function qh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 20h2V8h3L8 4 4 8h3zm13-4h-3V4h-2v12h-3l4 4z" } }] })(t);
}
function Wh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m6 20 4-4H7V4H5v12H2zm5-12h9v2h-9zm0 4h7v2h-7zm0-8h11v2H11zm0 12h5v2h-5z" } }] })(t);
}
function Gh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 9h9v2h-9zm0 4h7v2h-7zm0-8h11v2H11zm0 12h5v2h-5zm-6 3h2V8h3L6 4 2 8h3z" } }] })(t);
}
function Xh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.707 14.707A1 1 0 0 0 19 13h-7v2h4.586l-4.293 4.293A1 1 0 0 0 13 21h7v-2h-4.586l4.293-4.293zM6 3.99l-4 4h3v12h2v-12h3zM17 3h-2c-.417 0-.79.259-.937.649l-2.75 7.333h2.137L14.193 9h3.613l.743 1.981h2.137l-2.75-7.333A1 1 0 0 0 17 3zm-2.057 4 .75-2h.613l.75 2h-2.113z" } }] })(t);
}
function Kh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 16H4l6 6V2H8zm6-11v17h2V8h4l-6-6z" } }] })(t);
}
function Yh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.787 9.023c-.125.027-1.803.418-3.953 1.774-.323-1.567-1.279-4.501-4.108-7.485L12 2.546l-.726.767C8.435 6.308 7.483 9.25 7.163 10.827 5.005 9.448 3.34 9.052 3.218 9.024L2 8.752V10c0 7.29 3.925 12 10 12 5.981 0 10-4.822 10-12V8.758l-1.213.265zM8.999 12.038c.002-.033.152-3.1 3.001-6.532C14.814 8.906 14.999 12 15 12v.125a18.933 18.933 0 0 0-3.01 3.154 19.877 19.877 0 0 0-2.991-3.113v-.128zM12 20c-5.316 0-7.549-4.196-7.937-8.564 1.655.718 4.616 2.426 7.107 6.123l.841 1.249.825-1.26c2.426-3.708 5.425-5.411 7.096-6.122C19.534 15.654 17.304 20 12 20z" } }] })(t);
}
function Qh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17 13H7V9H5v6h14V9h-2z" } }] })(t);
}
function Jh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 18H6V4h12z" } }, { tag: "path", attr: { d: "M12 19a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0-6a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" } }, { tag: "circle", attr: { cx: "12.01", cy: "7", r: "2" } }] })(t);
}
function Zh(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11.002 2h-4a1 1 0 0 0-1 1v3.812a5.998 5.998 0 0 0-3 5.188v.988L3 13l.002.072V21a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9a5.999 5.999 0 0 0-3-5.188V3a1 1 0 0 0-1-1zm-3 4V4h2v2h-2zm5.001 14h-8v-6h8v6zm-8.001-8c0-2.206 1.794-4 4-4s4 1.794 4 4h-8zm8.001-9h2v2h-2zM16 3h2v2h-2zm0 3h2v2h-2zm3-3h2v2h-2zm0 3h2v2h-2zm0 3h2v2h-2z" } }] })(t);
}
function ts(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5zM5 19V5h14l.002 14H5z" } }, { tag: "path", attr: { d: "M7 7h1.998v2H7zm4 0h6v2h-6zm-4 4h1.998v2H7zm4 0h6v2h-6zm-4 4h1.998v2H7zm4 0h6v2h-6z" } }] })(t);
}
function es(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17 2H7C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5zm3 15c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10c1.654 0 3 1.346 3 3v10z" } }] })(t);
}
function as(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 16H5V5h14v14z" } }] })(t);
}
function rs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m6.516 14.323-1.49 6.452a.998.998 0 0 0 1.529 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082a1 1 0 0 0-.59-1.74l-5.701-.454-2.467-5.461a.998.998 0 0 0-1.822 0L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.214 4.107zm2.853-4.326a.998.998 0 0 0 .832-.586L12 5.43l1.799 3.981a.998.998 0 0 0 .832.586l3.972.315-3.271 2.944c-.284.256-.397.65-.293 1.018l1.253 4.385-3.736-2.491a.995.995 0 0 0-1.109 0l-3.904 2.603 1.05-4.546a1 1 0 0 0-.276-.94l-3.038-2.962 4.09-.326z" } }] })(t);
}
function ns(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "12", r: "2" } }, { tag: "path", attr: { d: "m7.758 16.243 1.414-1.415a3.97 3.97 0 0 1-1.173-2.831c0-1.068.417-2.071 1.173-2.825L7.758 7.756a5.957 5.957 0 0 0-1.76 4.24c0 1.604.625 3.112 1.76 4.247zm8.484 0A5.96 5.96 0 0 0 18 12a5.96 5.96 0 0 0-1.758-4.243l-1.414 1.414C15.584 9.927 16 10.932 16 12s-.416 2.073-1.172 2.829l1.414 1.414z" } }, { tag: "path", attr: { d: "M6.344 17.657a7.953 7.953 0 0 1-2.345-5.659c0-2.137.833-4.145 2.345-5.654L4.93 4.929c-1.89 1.886-2.931 4.397-2.931 7.069s1.041 5.183 2.931 7.073l1.414-1.414zM17.657 6.343A7.948 7.948 0 0 1 20 12a7.948 7.948 0 0 1-2.343 5.657l1.414 1.414A9.932 9.932 0 0 0 22 12a9.934 9.934 0 0 0-2.929-7.071l-1.414 1.414z" } }] })(t);
}
function cs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 12a2 2 0 0 0-.703.133l-2.398-1.963c.059-.214.101-.436.101-.67C17 8.114 15.886 7 14.5 7S12 8.114 12 9.5c0 .396.1.765.262 1.097l-2.909 3.438A2.06 2.06 0 0 0 9 14c-.179 0-.348.03-.512.074l-2.563-2.563C5.97 11.348 6 11.179 6 11c0-1.108-.892-2-2-2s-2 .892-2 2 .892 2 2 2c.179 0 .348-.03.512-.074l2.563 2.563A1.906 1.906 0 0 0 7 16c0 1.108.892 2 2 2s2-.892 2-2c0-.237-.048-.46-.123-.671l2.913-3.442c.227.066.462.113.71.113a2.48 2.48 0 0 0 1.133-.281l2.399 1.963A2.077 2.077 0 0 0 18 14c0 1.108.892 2 2 2s2-.892 2-2-.892-2-2-2z" } }] })(t);
}
function is(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.796 9.982C20.849 5.357 16.729 2 12 2 6.486 2 2 6.486 2 12c0 4.729 3.357 8.849 7.982 9.796a.988.988 0 0 0 .908-.272l10.633-10.633c.238-.238.34-.578.273-.909zM11 18a7.93 7.93 0 0 1 1.365-4.471 8.18 8.18 0 0 1 .978-1.186 8.211 8.211 0 0 1 1.184-.977 8.128 8.128 0 0 1 1.36-.738c.481-.203.986-.36 1.501-.466a8.112 8.112 0 0 1 2.17-.134l-8.529 8.529c-.013-.185-.029-.37-.029-.557zm-7-6c0-4.411 3.589-8 8-8 2.909 0 5.528 1.589 6.929 4.005a9.99 9.99 0 0 0-1.943.198c-.643.132-1.274.328-1.879.583a10.15 10.15 0 0 0-1.699.923c-.533.361-1.03.771-1.479 1.22s-.858.945-1.221 1.48c-.359.533-.67 1.104-.922 1.698A10.013 10.013 0 0 0 9 18c0 .491.048.979.119 1.461C6.089 18.288 4 15.336 4 12z" } }] })(t);
}
function ls(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M9 9h6v6H9z" } }] })(t);
}
function os(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M7 7h10v10H7z" } }] })(t);
}
function hs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 5c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" } }, { tag: "path", attr: { d: "M11 9h2v5h-2zM9 2h6v2H9zm10.293 5.707-2-2 1.414-1.414 2 2z" } }] })(t);
}
function ss(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M22 5c0-1.654-1.346-3-3-3H5C3.346 2 2 3.346 2 5v2.831c0 1.053.382 2.01 1 2.746V19c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-8.424c.618-.735 1-1.692 1-2.746V5zm-2 0v2.831c0 1.14-.849 2.112-1.891 2.167L18 10c-1.103 0-2-.897-2-2V4h3c.552 0 1 .449 1 1zM10 4h4v4c0 1.103-.897 2-2 2s-2-.897-2-2V4zM4 5c0-.551.448-1 1-1h3v4c0 1.103-.897 2-2 2l-.109-.003C4.849 9.943 4 8.971 4 7.831V5zm6 14v-3h4v3h-4zm6 0v-3c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H5v-7.131c.254.067.517.111.787.125A3.988 3.988 0 0 0 9 10.643c.733.832 1.807 1.357 3 1.357s2.267-.525 3-1.357a3.988 3.988 0 0 0 3.213 1.351c.271-.014.533-.058.787-.125V19h-3z" } }] })(t);
}
function vs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.148 2.971A2.008 2.008 0 0 0 17.434 2H6.566c-.698 0-1.355.372-1.714.971L2.143 7.485A.995.995 0 0 0 2 8a3.97 3.97 0 0 0 1 2.618V19c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-8.382A3.97 3.97 0 0 0 22 8a.995.995 0 0 0-.143-.515l-2.709-4.514zm.836 5.28A2.003 2.003 0 0 1 18 10c-1.103 0-2-.897-2-2 0-.068-.025-.128-.039-.192l.02-.004L15.22 4h2.214l2.55 4.251zM10.819 4h2.361l.813 4.065C13.958 9.137 13.08 10 12 10s-1.958-.863-1.993-1.935L10.819 4zM6.566 4H8.78l-.76 3.804.02.004C8.025 7.872 8 7.932 8 8c0 1.103-.897 2-2 2a2.003 2.003 0 0 1-1.984-1.749L6.566 4zM10 19v-3h4v3h-4zm6 0v-3c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H5v-7.142c.321.083.652.142 1 .142a3.99 3.99 0 0 0 3-1.357c.733.832 1.807 1.357 3 1.357s2.267-.525 3-1.357A3.99 3.99 0 0 0 18 12c.348 0 .679-.059 1-.142V19h-3z" } }] })(t);
}
function us(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "4", r: "2" } }, { tag: "path", attr: { d: "M12 18h2v-5h2V9c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v4h2v5h2z" } }, { tag: "path", attr: { d: "m18.446 11.386-.893 1.789C19.108 13.95 20 14.98 20 16c0 1.892-3.285 4-8 4s-8-2.108-8-4c0-1.02.892-2.05 2.446-2.825l-.893-1.789C3.295 12.512 2 14.193 2 16c0 3.364 4.393 6 10 6s10-2.636 10-6c0-1.807-1.295-3.488-3.554-4.614z" } }] })(t);
}
function ds(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 11h-8c-4 0-4-1.816-4-2.5C8 7.882 8 6 12 6c2.8 0 2.99 1.678 3 2.014L16 8h1c0-1.384-1.045-4-5-4-5.416 0-6 3.147-6 4.5 0 .728.148 1.667.736 2.5H4v2h16v-2zm-8 7c-3.793 0-3.99-1.815-4-2H6c0 .04.069 4 6 4 5.221 0 6-2.819 6-4.5 0-.146-.009-.317-.028-.5h-2.006c.032.2.034.376.034.5 0 .684 0 2.5-4 2.5z" } }] })(t);
}
function gs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 13h-6v-3l-5 4 5 4v-3h7a1 1 0 0 0 1-1V5h-2v8z" } }] })(t);
}
function fs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14 13H8V5H6v9a1 1 0 0 0 1 1h7v3l5-4-5-4v3z" } }] })(t);
}
function ps(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z" } }] })(t);
}
function zs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12v4.143C2 17.167 2.897 18 4 18h1a1 1 0 0 0 1-1v-5.143a1 1 0 0 0-1-1h-.908C4.648 6.987 7.978 4 12 4s7.352 2.987 7.908 6.857H19a1 1 0 0 0-1 1V18c0 1.103-.897 2-2 2h-2v-1h-4v3h6c2.206 0 4-1.794 4-4 1.103 0 2-.833 2-1.857V12c0-5.514-4.486-10-10-10z" } }] })(t);
}
function ms(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "19.003", cy: "6.002", r: "2.002" } }, { tag: "path", attr: { d: "M18.875 13.219c-.567.453-.978.781-1.878.781-.899 0-1.288-.311-1.876-.781-.68-.543-1.525-1.219-3.127-1.219-1.601 0-2.445.676-3.124 1.219-.588.47-.975.781-1.875.781-.898 0-1.286-.311-1.873-.78C4.443 12.676 3.6 12 2 12v2c.897 0 1.285.311 1.872.78.679.544 1.523 1.22 3.123 1.22s2.446-.676 3.125-1.22c.587-.47.976-.78 1.874-.78.9 0 1.311.328 1.878.781.679.543 1.524 1.219 3.125 1.219 1.602 0 2.447-.676 3.127-1.219.588-.47.977-.781 1.876-.781v-2c-1.601 0-2.446.676-3.125 1.219zM16.997 19c-.899 0-1.288-.311-1.876-.781-.68-.543-1.525-1.219-3.127-1.219-1.601 0-2.445.676-3.124 1.219-.588.47-.975.781-1.875.781-.898 0-1.286-.311-1.873-.78C4.443 17.676 3.6 17 2 17v2c.897 0 1.285.311 1.872.78.679.544 1.523 1.22 3.123 1.22s2.446-.676 3.125-1.22c.587-.47.976-.78 1.874-.78.9 0 1.311.328 1.878.781.679.543 1.524 1.219 3.125 1.219 1.602 0 2.447-.676 3.127-1.219.588-.47.977-.781 1.876-.781v-2c-1.601 0-2.446.676-3.125 1.219-.567.453-.978.781-1.878.781zM11 5.419l2.104 2.104-2.057 2.57c.286-.056.596-.093.947-.093 1.602 0 2.447.676 3.127 1.219.588.47.977.781 1.876.781.9 0 1.311-.328 1.878-.781.132-.105.274-.217.423-.326l-2.096-2.09.005-.005-5.5-5.5a.999.999 0 0 0-1.414 0l-4 4 1.414 1.414L11 5.419z" } }] })(t);
}
function Ms(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m13 7.101.01.001a4.978 4.978 0 0 1 2.526 1.362 5.005 5.005 0 0 1 1.363 2.528 5.061 5.061 0 0 1-.001 2.016 4.976 4.976 0 0 1-1.363 2.527l1.414 1.414a7.014 7.014 0 0 0 1.908-3.54 6.98 6.98 0 0 0 0-2.819 6.957 6.957 0 0 0-1.907-3.539 6.97 6.97 0 0 0-2.223-1.5 6.921 6.921 0 0 0-1.315-.408c-.137-.028-.275-.043-.412-.063V2L9 6l4 4V7.101zm-7.45 7.623c.174.412.392.812.646 1.19.249.37.537.718.854 1.034a7.036 7.036 0 0 0 2.224 1.501c.425.18.868.317 1.315.408.167.034.338.056.508.078v2.944l4-4-4-4v3.03c-.035-.006-.072-.003-.107-.011a4.978 4.978 0 0 1-2.526-1.362 4.994 4.994 0 0 1 .001-7.071L7.051 7.05a7.01 7.01 0 0 0-1.5 2.224A6.974 6.974 0 0 0 5 12a6.997 6.997 0 0 0 .55 2.724z" } }] })(t);
}
function Bs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 2c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H6zm0 15V5h12l.002 12H6z" } }] })(t);
}
function Hs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 21h15.893c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zm0-2v-5h4v5H4zM14 7v5h-4V7h4zM8 7v5H4V7h4zm2 12v-5h4v5h-4zm6 0v-5h3.894v5H16zm3.893-7H16V7h3.893v5z" } }] })(t);
}
function ws(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 4C6.486 4 2 8.486 2 14a9.89 9.89 0 0 0 1.051 4.445c.17.34.516.555.895.555h16.107c.379 0 .726-.215.896-.555A9.89 9.89 0 0 0 22 14c0-5.514-4.486-10-10-10zm7.41 13H4.59A7.875 7.875 0 0 1 4 14c0-4.411 3.589-8 8-8s8 3.589 8 8a7.875 7.875 0 0 1-.59 3z" } }, { tag: "path", attr: { d: "M10.939 12.939a1.53 1.53 0 0 0 0 2.561 1.53 1.53 0 0 0 2.121-.44l3.962-6.038a.034.034 0 0 0 0-.035.033.033 0 0 0-.045-.01l-6.038 3.962z" } }] })(t);
}
function xs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.868 4.504A1 1 0 0 0 17 4H3a1 1 0 0 0-.868 1.496L5.849 12l-3.717 6.504A1 1 0 0 0 3 20h14a1 1 0 0 0 .868-.504l4-7a.998.998 0 0 0 0-.992l-4-7zM16.42 18H4.724l3.145-5.504a.998.998 0 0 0 0-.992L4.724 6H16.42l3.429 6-3.429 6z" } }] })(t);
}
function Vs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 4H8.515a2 2 0 0 0-1.627.838l-4.701 6.581a.997.997 0 0 0 0 1.162l4.701 6.581A2 2 0 0 0 8.515 20H20c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 14H8.515l-4.286-6 4.286-6H20v12z" } }] })(t);
}
function ys(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "12", r: "3" } }, { tag: "path", attr: { d: "M13 4.069V2h-2v2.069A8.008 8.008 0 0 0 4.069 11H2v2h2.069A8.007 8.007 0 0 0 11 19.931V22h2v-2.069A8.007 8.007 0 0 0 19.931 13H22v-2h-2.069A8.008 8.008 0 0 0 13 4.069zM12 18c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" } }] })(t);
}
function Cs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 20c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1H5c-1.103 0-2 .897-2 2v15zM5 5h2v2h10V5h2v15H5V5z" } }, { tag: "path", attr: { d: "M14.292 10.295 12 12.587l-2.292-2.292-1.414 1.414 2.292 2.292-2.292 2.292 1.414 1.414L12 15.415l2.292 2.292 1.414-1.414-2.292-2.292 2.292-2.292z" } }] })(t);
}
function Ls(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 22h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1H5c-1.103 0-2 .897-2 2v15c0 1.103.897 2 2 2zM5 5h2v2h10V5h2v15H5V5z" } }, { tag: "path", attr: { d: "m11 13.586-1.793-1.793-1.414 1.414L11 16.414l5.207-5.207-1.414-1.414z" } }] })(t);
}
function _s(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.772 10.156-1.368-4.105A2.995 2.995 0 0 0 16.559 4H14V2h-4v2H7.441a2.995 2.995 0 0 0-2.845 2.051l-1.368 4.105A2.003 2.003 0 0 0 2 12v5c0 .753.423 1.402 1.039 1.743-.013.066-.039.126-.039.195V21a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2h12v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2.062c0-.069-.026-.13-.039-.195A1.993 1.993 0 0 0 22 17v-5c0-.829-.508-1.541-1.228-1.844zM4 17v-5h16l.002 5H4zM7.441 6h9.117c.431 0 .813.274.949.684L18.613 10H5.387l1.105-3.316A1 1 0 0 1 7.441 6z" } }, { tag: "circle", attr: { cx: "6.5", cy: "14.5", r: "1.5" } }, { tag: "circle", attr: { cx: "17.5", cy: "14.5", r: "1.5" } }] })(t);
}
function As(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4.929 19.081c1.895 1.895 4.405 2.938 7.071 2.938s5.177-1.043 7.071-2.938c3.899-3.899 3.899-10.243 0-14.143C17.177 3.044 14.665 2 12 2S6.823 3.044 4.929 4.938c-3.899 3.899-3.899 10.244 0 14.143zm12.728-1.414a7.969 7.969 0 0 1-3.813 2.129c-.009-1.602.586-3.146 1.691-4.251 1.163-1.163 2.732-1.828 4.277-1.851a7.945 7.945 0 0 1-2.155 3.973zm2.325-5.965c-2.124-.021-4.284.853-5.861 2.429-1.532 1.532-2.327 3.68-2.263 5.881a7.946 7.946 0 0 1-5.516-2.345 7.97 7.97 0 0 1-2.332-5.512c.077.002.154.014.231.014 2.115 0 4.16-.804 5.637-2.28 1.58-1.58 2.457-3.739 2.43-5.873a7.948 7.948 0 0 1 5.349 2.337 7.96 7.96 0 0 1 2.325 5.349zM6.343 6.353a7.968 7.968 0 0 1 3.973-2.169c-.018 1.555-.685 3.124-1.851 4.291-1.104 1.103-2.642 1.696-4.238 1.691a7.929 7.929 0 0 1 2.116-3.813z" } }] })(t);
}
function bs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 14h6v2h-6zM6.293 9.707 8.586 12l-2.293 2.293 1.414 1.414L11.414 12 7.707 8.293z" } }, { tag: "path", attr: { d: "M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V6h16l.002 12H4z" } }] })(t);
}
function Ps(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m13.293 2.707.818.818L3.318 14.318C2.468 15.168 2 16.298 2 17.5s.468 2.332 1.318 3.183C4.169 21.532 5.299 22 6.5 22s2.331-.468 3.182-1.318L20.475 9.889l.818.818 1.414-1.414-8-8-1.414 1.414zm3.182 8.354-2.403-2.404-1.414 1.414 2.403 2.404-1.414 1.415-.99-.99-1.414 1.414.99.99-1.415 1.415-2.403-2.404L7 15.728l2.403 2.404-1.136 1.136c-.945.944-2.59.944-3.535 0C4.26 18.795 4 18.168 4 17.5s.26-1.295.732-1.768L15.525 4.939l3.535 3.535-2.585 2.587z" } }] })(t);
}
function Ss(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 8h2V6h3.252L7.68 18H5v2h8v-2h-2.252L13.32 6H17v2h2V4H5z" } }] })(t);
}
function Es(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z" } }] })(t);
}
function Rs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M13 7h-2v6h6v-2h-4z" } }] })(t);
}
function Ts(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m20.145 8.27 1.563-1.563-1.414-1.414L18.586 7c-1.05-.63-2.274-1-3.586-1-3.859 0-7 3.14-7 7s3.141 7 7 7 7-3.14 7-7a6.966 6.966 0 0 0-1.855-4.73zM15 18c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" } }, { tag: "path", attr: { d: "M14 10h2v4h-2zm-1-7h4v2h-4zM3 8h4v2H3zm0 8h4v2H3zm-1-4h3.99v2H2z" } }] })(t);
}
function Os(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 14c-3 0-4 3-4 3h8s-1-3-4-3z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "m17.555 8.832-1.109-1.664-3 2a1.001 1.001 0 0 0 .108 1.727l4 2 .895-1.789-2.459-1.229 1.565-1.045zm-6.557 1.23a1 1 0 0 0-.443-.894l-3-2-1.11 1.664 1.566 1.044-2.459 1.229.895 1.789 4-2a.998.998 0 0 0 .551-.832z" } }] })(t);
}
function Ns(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 9c-1.628 0-3 1.372-3 3s1.372 3 3 3 3-1.372 3-3-1.372-3-3-3z" } }, { tag: "path", attr: { d: "M16 6H8c-3.3 0-5.989 2.689-6 6v.016A6.01 6.01 0 0 0 8 18h8a6.01 6.01 0 0 0 6-5.994V12c-.009-3.309-2.699-6-6-6zm0 10H8a4.006 4.006 0 0 1-4-3.99C4.004 9.799 5.798 8 8 8h8c2.202 0 3.996 1.799 4 4.006A4.007 4.007 0 0 1 16 16zm4-3.984.443-.004.557.004h-1z" } }] })(t);
}
function $s(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 9c-1.628 0-3 1.372-3 3s1.372 3 3 3 3-1.372 3-3-1.372-3-3-3z" } }, { tag: "path", attr: { d: "M16 6H8c-3.296 0-5.982 2.682-6 5.986v.042A6.01 6.01 0 0 0 8 18h8c3.309 0 6-2.691 6-6s-2.691-6-6-6zm0 10H8a4.006 4.006 0 0 1-4-3.99C4.004 9.799 5.798 8 8 8h8c2.206 0 4 1.794 4 4s-1.794 4-4 4z" } }] })(t);
}
function Is(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1 9H4.069a7.965 7.965 0 0 1 .52-2H11v2zm0 4H4.589a7.965 7.965 0 0 1-.52-2H11v2zm0-10.931V7H5.765A7.996 7.996 0 0 1 11 4.069zM5.765 17H11v2.931A7.996 7.996 0 0 1 5.765 17zM13 19.931V4.069c3.939.495 7 3.858 7 7.931s-3.061 7.436-7 7.931z" } }] })(t);
}
function Ds(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13.943 2.667A1 1 0 0 0 13 2h-2a1 1 0 0 0-.943.667L4.292 19H2v2h20v-2h-2.292L13.943 2.667zM15.47 13H8.53l1.06-3h4.82l1.06 3zm-3.763-9h.586l1.412 4h-3.41l1.412-4zM7.825 15h8.35l1.412 4H6.413l1.412-4z" } }] })(t);
}
function ks(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "8.5", cy: "14.5", r: "1.5" } }, { tag: "circle", attr: { cx: "15.5", cy: "14.5", r: "1.5" } }, { tag: "path", attr: { d: "M18.87 3.34A3.55 3.55 0 0 0 16.38 2H7.62a3.47 3.47 0 0 0-2.5 1.35A4.32 4.32 0 0 0 4 6v12a1 1 0 0 0 1 1h2l-2 3h2.32L8 21h8l.68 1H19l-2-3h2a1 1 0 0 0 1-1V6a4.15 4.15 0 0 0-1.13-2.66zM7.62 4h8.72a1.77 1.77 0 0 1 1 .66 3.25 3.25 0 0 1 .25.34H6.39a2.3 2.3 0 0 1 .25-.35A1.65 1.65 0 0 1 7.62 4zM6 8V7h12v3H6zm12 9H6v-5h12z" } }] })(t);
}
function js(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.924 10.383a1 1 0 0 0-.217-1.09l-5-5-1.414 1.414L16.586 9H4v2h15a1 1 0 0 0 .924-.617zM4.076 13.617a1 1 0 0 0 .217 1.09l5 5 1.414-1.414L7.414 15H20v-2H5a.999.999 0 0 0-.924.617z" } }] })(t);
}
function Us(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m15 12 5-4-5-4v2.999H2v2h13zm7 3H9v-3l-5 4 5 4v-3h13z" } }] })(t);
}
function Fs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15 2H9c-1.103 0-2 .897-2 2v2H3v2h2v12c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V8h2V6h-4V4c0-1.103-.897-2-2-2zM9 4h6v2H9V4zm8 16H7V8h10v12z" } }] })(t);
}
function qs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z" } }, { tag: "path", attr: { d: "M9 10h2v8H9zm4 0h2v8h-2z" } }] })(t);
}
function Ws(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m14 9.586-4 4-6.293-6.293-1.414 1.414L10 16.414l4-4 4.293 4.293L16 19h6v-6l-2.293 2.293z" } }] })(t);
}
function Gs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m10 10.414 4 4 5.707-5.707L22 11V5h-6l2.293 2.293L14 11.586l-4-4-7.707 7.707 1.414 1.414z" } }] })(t);
}
function Xs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 16h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2zm14-6-.003 9H10v-3h4c1.103 0 2-.897 2-2v-4h3zM5 10h5V5h4l-.003 9H5v-4z" } }] })(t);
}
function Ks(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14.844 20H6.5C5.121 20 4 18.879 4 17.5S5.121 15 6.5 15h7c1.93 0 3.5-1.57 3.5-3.5S15.43 8 13.5 8H8.639a9.812 9.812 0 0 1-1.354 2H13.5c.827 0 1.5.673 1.5 1.5s-.673 1.5-1.5 1.5h-7C4.019 13 2 15.019 2 17.5S4.019 22 6.5 22h9.593a10.415 10.415 0 0 1-1.249-2zM5 2C3.346 2 2 3.346 2 5c0 3.188 3 5 3 5s3-1.813 3-5c0-1.654-1.346-3-3-3zm0 4.5a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 5 6.5z" } }, { tag: "path", attr: { d: "M19 14c-1.654 0-3 1.346-3 3 0 3.188 3 5 3 5s3-1.813 3-5c0-1.654-1.346-3-3-3zm0 4.5a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 19 18.5z" } }] })(t);
}
function Ys(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21 4h-3V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v3c0 4.31 1.799 6.91 4.819 7.012A6.001 6.001 0 0 0 11 17.91V20H9v2h6v-2h-2v-2.09a6.01 6.01 0 0 0 4.181-2.898C20.201 14.91 22 12.31 22 8V5a1 1 0 0 0-1-1zM4 8V6h2v6.83C4.216 12.078 4 9.299 4 8zm8 8c-2.206 0-4-1.794-4-4V4h8v8c0 2.206-1.794 4-4 4zm6-3.17V6h2v2c0 1.299-.216 4.078-2 4.83z" } }] })(t);
}
function Qs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 6h-5.586l2.293-2.293-1.414-1.414L12 5.586 8.707 2.293 7.293 3.707 9.586 6H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zM4 19V8h16l.002 11H4z" } }] })(t);
}
function Js(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5 18h14v2H5zM6 4v6c0 3.309 2.691 6 6 6s6-2.691 6-6V4h-2v6c0 2.206-1.794 4-4 4s-4-1.794-4-4V4H6z" } }] })(t);
}
function Zs(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9 10h6c1.654 0 3 1.346 3 3s-1.346 3-3 3h-3v2h3c2.757 0 5-2.243 5-5s-2.243-5-5-5H9V5L4 9l5 4v-3z" } }] })(t);
}
function tv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15 16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6z" } }, { tag: "path", attr: { d: "M5 16h1V8a2 2 0 0 1 2-2h8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2zm3 3a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1v8a2 2 0 0 1-2 2H8v1z" } }] })(t);
}
function ev(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16.949 14.121 19.071 12a5.008 5.008 0 0 0 0-7.071 5.006 5.006 0 0 0-7.071 0l-.707.707 1.414 1.414.707-.707a3.007 3.007 0 0 1 4.243 0 3.005 3.005 0 0 1 0 4.243l-2.122 2.121a2.723 2.723 0 0 1-.844.57L13.414 12l1.414-1.414-.707-.707a4.965 4.965 0 0 0-3.535-1.465c-.235 0-.464.032-.691.066L3.707 2.293 2.293 3.707l18 18 1.414-1.414-5.536-5.536c.277-.184.538-.396.778-.636zm-6.363 3.536a3.007 3.007 0 0 1-4.243 0 3.005 3.005 0 0 1 0-4.243l1.476-1.475-1.414-1.414L4.929 12a5.008 5.008 0 0 0 0 7.071 4.983 4.983 0 0 0 3.535 1.462A4.982 4.982 0 0 0 12 19.071l.707-.707-1.414-1.414-.707.707z" } }] })(t);
}
function av(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 8.414V18h2V8.414l4.293 4.293 1.414-1.414L12 4.586l-6.707 6.707 1.414 1.414z" } }] })(t);
}
function rv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12.001 1.993C6.486 1.994 2 6.48 2 11.994c.001 5.514 4.487 10 10 10 5.515 0 10.001-4.486 10.001-10s-4.486-10-10-10.001zM12 19.994c-4.41 0-7.999-3.589-8-8 0-4.411 3.589-8 8.001-8.001 4.411.001 8 3.59 8 8.001s-3.589 8-8.001 8z" } }, { tag: "path", attr: { d: "m12.001 8.001-4.005 4.005h3.005V16h2v-3.994h3.004z" } }] })(t);
}
function nv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19zm9-12.243L19.092 17H4.908L12 6.757z" } }] })(t);
}
function cv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 15h2V9h3l-4-5-4 5h3z" } }, { tag: "path", attr: { d: "M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z" } }] })(t);
}
function iv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M14.829 9.172c.181.181.346.38.488.592l1.658-1.119a6.063 6.063 0 0 0-1.621-1.62 5.963 5.963 0 0 0-2.148-.903 5.985 5.985 0 0 0-5.448 1.634 5.993 5.993 0 0 0-.733.889l1.657 1.119a4.017 4.017 0 0 1 2.51-1.683 3.989 3.989 0 0 1 3.637 1.091z" } }, { tag: "circle", attr: { cx: "15.5", cy: "13.5", r: "1.5" } }, { tag: "circle", attr: { cx: "8.507", cy: "13.507", r: "1.493" } }] })(t);
}
function lv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10zM15 12h-1v8h-4v-8H6.081L12 4.601 17.919 12H15z" } }] })(t);
}
function ov(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 10h1v2h-4V6h2l-3-4-3 4h2v8H7v-2.277c.596-.347 1-.985 1-1.723a2 2 0 0 0-4 0c0 .738.404 1.376 1 1.723V14c0 1.103.897 2 2 2h4v2.277A1.99 1.99 0 0 0 10 20a2 2 0 0 0 4 0c0-.738-.404-1.376-1-1.723V14h4c1.103 0 2-.897 2-2v-2h1V6h-4v4z" } }] })(t);
}
function hv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20.29 8.29 16 12.58l-1.3-1.29-1.41 1.42 2.7 2.7 5.72-5.7zM4 8a3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4 3.91 3.91 0 0 0-4 4zm6 0a1.91 1.91 0 0 1-2 2 1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2zM4 18a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2v-1a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v1h2z" } }] })(t);
}
function sv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2A10.13 10.13 0 0 0 2 12a10 10 0 0 0 4 7.92V20h.1a9.7 9.7 0 0 0 11.8 0h.1v-.08A10 10 0 0 0 22 12 10.13 10.13 0 0 0 12 2zM8.07 18.93A3 3 0 0 1 11 16.57h2a3 3 0 0 1 2.93 2.36 7.75 7.75 0 0 1-7.86 0zm9.54-1.29A5 5 0 0 0 13 14.57h-2a5 5 0 0 0-4.61 3.07A8 8 0 0 1 4 12a8.1 8.1 0 0 1 8-8 8.1 8.1 0 0 1 8 8 8 8 0 0 1-2.39 5.64z" } }, { tag: "path", attr: { d: "M12 6a3.91 3.91 0 0 0-4 4 3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4zm0 6a1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2 1.91 1.91 0 0 1-2 2z" } }] })(t);
}
function vv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M14 11h8v2h-8zM8 4a3.91 3.91 0 0 0-4 4 3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4zm0 6a1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2 1.91 1.91 0 0 1-2 2zm-4 8a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2v-1a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v1h2z" } }] })(t);
}
function uv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 10c1.151 0 2-.848 2-2s-.849-2-2-2c-1.15 0-2 .848-2 2s.85 2 2 2zm0 1c-2.209 0-4 1.612-4 3.6v.386h8V14.6c0-1.988-1.791-3.6-4-3.6z" } }, { tag: "path", attr: { d: "M19 2H5c-1.103 0-2 .897-2 2v13c0 1.103.897 2 2 2h4l3 3 3-3h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm-5 15-2 2-2-2H5V4h14l.002 13H14z" } }] })(t);
}
function dv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 8a3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4 3.91 3.91 0 0 0-4 4zm6 0a1.91 1.91 0 0 1-2 2 1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2zM4 18a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2v-1a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v1h2z" } }] })(t);
}
function gv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M8 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0-6c1.178 0 2 .822 2 2s-.822 2-2 2-2-.822-2-2 .822-2 2-2zm1 7H7c-2.757 0-5 2.243-5 5v1h2v-1c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5zm9.364-10.364L16.95 4.05C18.271 5.373 19 7.131 19 9s-.729 3.627-2.05 4.95l1.414 1.414C20.064 13.663 21 11.403 21 9s-.936-4.663-2.636-6.364z" } }, { tag: "path", attr: { d: "M15.535 5.464 14.121 6.88C14.688 7.445 15 8.198 15 9s-.312 1.555-.879 2.12l1.414 1.416C16.479 11.592 17 10.337 17 9s-.521-2.592-1.465-3.536z" } }] })(t);
}
function fv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m15.71 15.71 2.29-2.3 2.29 2.3 1.42-1.42-2.3-2.29 2.3-2.29-1.42-1.42-2.29 2.3-2.29-2.3-1.42 1.42L16.58 12l-2.29 2.29zM12 8a3.91 3.91 0 0 0-4-4 3.91 3.91 0 0 0-4 4 3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4zM6 8a1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2 1.91 1.91 0 0 1-2 2 1.91 1.91 0 0 1-2-2zM4 18a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2v-1a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v1h2z" } }] })(t);
}
function pv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z" } }] })(t);
}
function zv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18.277 8c.347.596.985 1 1.723 1a2 2 0 0 0 0-4c-.738 0-1.376.404-1.723 1H16V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H5.723C5.376 5.404 4.738 5 4 5a2 2 0 0 0 0 4c.738 0 1.376-.404 1.723-1H8v.369C5.133 9.84 4.318 12.534 4.091 14H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-.877c.197-.959.718-2.406 2.085-3.418A.984.984 0 0 0 9 11h6a.98.98 0 0 0 .792-.419c1.373 1.013 1.895 2.458 2.089 3.419H17a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1.092c-.227-1.466-1.042-4.161-3.908-5.632V8h2.277zM6 18H4v-2h2v2zm14 0h-2v-2h2v2zm-6-9h-4V5h4v4z" } }] })(t);
}
function mv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 5V2h-2v3H8l4 4 4-4zm0 17v-3h3l-4-4-4 4h3v3zM3 11h3v2H3zm5 0h3v2H8zm5 0h3v2h-3zm5 0h3v2h-3z" } }] })(t);
}
function Mv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m11.95 3.564.708.707-9.193 9.193C2.521 14.408 2 15.664 2 17s.521 2.592 1.465 3.535C4.408 21.479 5.664 22 7 22s2.592-.521 3.535-1.465l9.193-9.193.707.708 1.414-1.414-8.485-8.486-1.414 1.414zM9.121 19.121c-1.133 1.133-3.109 1.133-4.242 0C4.313 18.555 4 17.802 4 17s.313-1.555.879-2.121L5.758 14h8.484l-5.121 5.121zM16.242 12H7.758l6.314-6.314 4.242 4.242L16.242 12z" } }] })(t);
}
function Bv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 7c0-1.103-.897-2-2-2H6.414L3.707 2.293 2.293 3.707l18 18 1.414-1.414L18 16.586v-2.919L22 17V7l-4 3.333V7zm-2 7.586L8.414 7H16v7.586zM4 19h10.879l-2-2H4V8.121L2.145 6.265A1.977 1.977 0 0 0 2 7v10c0 1.103.897 2 2 2z" } }] })(t);
}
function Hv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 8H9v3H6v2h3v3h2v-3h3v-2h-3z" } }, { tag: "path", attr: { d: "M18 7c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-3.333L22 17V7l-4 3.333V7zm-1.999 10H4V7h12v5l.001 5z" } }] })(t);
}
function wv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 9c0-1.103-.897-2-2-2h-1.434l-2.418-4.029A2.008 2.008 0 0 0 10.434 2H5v2h5.434l1.8 3H4c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-3l4 2v-7l-4 2V9zm-1.998 9H4V9h12l.001 4H16v1l.001.001.001 3.999z" } }, { tag: "path", attr: { d: "M6 14h6v2H6z" } }] })(t);
}
function xv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M18 7c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-3.333L22 17V7l-4 3.333V7zm-1.998 10H4V7h12l.001 4.999L16 12l.001.001.001 4.999z" } }] })(t);
}
function Vv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.5 8a4.505 4.505 0 0 0-4.5 4.5c0 .925.281 1.784.762 2.5h-3.523c.48-.716.761-1.575.761-2.5C11 10.019 8.981 8 6.5 8S2 10.019 2 12.5 4.019 17 6.5 17c.171 0 .334-.032.5-.051V17h11v-.051c2.244-.252 4-2.139 4-4.449 0-2.481-2.019-4.5-4.5-4.5zM4 12.5C4 11.121 5.121 10 6.5 10S9 11.121 9 12.5 7.879 15 6.5 15 4 13.879 4 12.5zM17.5 15c-1.379 0-2.5-1.121-2.5-2.5s1.121-2.5 2.5-2.5 2.5 1.121 2.5 2.5-1.121 2.5-2.5 2.5z" } }] })(t);
}
function yv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z" } }, { tag: "path", attr: { d: "M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20V4a1 1 0 0 0-1.554-.832L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h3c.033 0 .061-.016.093-.019a1.027 1.027 0 0 0 .38-.116c.026-.015.057-.017.082-.033L12 5.868v12.264l-4.445-2.964c-.025-.017-.056-.02-.082-.033a.986.986 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9z" } }] })(t);
}
function Cv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20V4a1 1 0 0 0-1.554-.832L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h3c.033 0 .061-.016.093-.019a1.027 1.027 0 0 0 .379-.116c.026-.014.057-.017.082-.033L12 5.868v12.264l-4.445-2.964c-.025-.018-.056-.02-.082-.033a.977.977 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9zm12-2v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5z" } }] })(t);
}
function Lv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m21.707 20.293-2.023-2.023A9.566 9.566 0 0 0 21.999 12c0-4.091-2.472-7.453-5.999-9v2c2.387 1.386 3.999 4.047 3.999 7a8.113 8.113 0 0 1-1.672 4.913l-1.285-1.285C17.644 14.536 18 13.19 18 12c0-1.771-.775-3.9-2-5v7.586l-2-2V4a1 1 0 0 0-1.554-.832L7.727 6.313l-4.02-4.02-1.414 1.414 18 18 1.414-1.414zM12 5.868v4.718L9.169 7.755 12 5.868zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20v-1.879l-2-2v2.011l-4.445-2.964c-.025-.017-.056-.02-.082-.033a.986.986 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9h.879L3.102 7.223A1.995 1.995 0 0 0 2 9v6c0 1.103.897 2 2 2z" } }] })(t);
}
function _v(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20V4a1 1 0 0 0-1.554-.832L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h3c.033 0 .061-.016.093-.019a1.027 1.027 0 0 0 .379-.116c.026-.014.057-.017.082-.033L12 5.868v12.264l-4.445-2.964c-.025-.018-.056-.02-.082-.033a.977.977 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9z" } }] })(t);
}
function Av(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "13", cy: "4", r: "2" } }, { tag: "path", attr: { d: "M13.978 12.27c.245.368.611.647 1.031.787l2.675.892.633-1.896-2.675-.892-1.663-2.495a2.016 2.016 0 0 0-.769-.679l-1.434-.717a1.989 1.989 0 0 0-1.378-.149l-3.193.797a2.002 2.002 0 0 0-1.306 1.046l-1.794 3.589 1.789.895 1.794-3.589 2.223-.556-1.804 8.346-3.674 2.527 1.133 1.648 3.675-2.528c.421-.29.713-.725.82-1.225l.517-2.388 2.517 1.888.925 4.625 1.961-.393-.925-4.627a2 2 0 0 0-.762-1.206l-2.171-1.628.647-3.885 1.208 1.813z" } }] })(t);
}
function bv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H5C3.346 3 2 4.346 2 6v12c0 1.654 1.346 3 3 3h15c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19c-.552 0-1-.449-1-1V6c0-.551.448-1 1-1h15v3h-6c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h6.001v3H5zm15-9v4h-6v-4h6z" } }] })(t);
}
function Pv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 12h2v4h-2z" } }, { tag: "path", attr: { d: "M20 7V5c0-1.103-.897-2-2-2H5C3.346 3 2 4.346 2 6v12c0 2.201 1.794 3 3 3h15c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zM5 5h13v2H5a1.001 1.001 0 0 1 0-2zm15 14H5.012C4.55 18.988 4 18.805 4 18V8.815c.314.113.647.185 1 .185h15v10z" } }] })(t);
}
function Sv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5.996 9c1.413 0 2.16-.747 2.705-1.293.49-.49.731-.707 1.292-.707s.802.217 1.292.707C11.83 8.253 12.577 9 13.991 9c1.415 0 2.163-.747 2.71-1.293.491-.49.732-.707 1.295-.707s.804.217 1.295.707C19.837 8.253 20.585 9 22 9V7c-.563 0-.804-.217-1.295-.707C20.159 5.747 19.411 5 17.996 5s-2.162.747-2.709 1.292c-.491.491-.731.708-1.296.708-.562 0-.802-.217-1.292-.707C12.154 5.747 11.407 5 9.993 5s-2.161.747-2.706 1.293c-.49.49-.73.707-1.291.707s-.801-.217-1.291-.707C4.16 5.747 3.413 5 2 5v2c.561 0 .801.217 1.291.707C3.836 8.253 4.583 9 5.996 9zm0 5c1.413 0 2.16-.747 2.705-1.293.49-.49.731-.707 1.292-.707s.802.217 1.292.707c.545.546 1.292 1.293 2.706 1.293 1.415 0 2.163-.747 2.71-1.293.491-.49.732-.707 1.295-.707s.804.217 1.295.707C19.837 13.253 20.585 14 22 14v-2c-.563 0-.804-.217-1.295-.707-.546-.546-1.294-1.293-2.709-1.293s-2.162.747-2.709 1.292c-.491.491-.731.708-1.296.708-.562 0-.802-.217-1.292-.707C12.154 10.747 11.407 10 9.993 10s-2.161.747-2.706 1.293c-.49.49-.73.707-1.291.707s-.801-.217-1.291-.707C4.16 10.747 3.413 10 2 10v2c.561 0 .801.217 1.291.707C3.836 13.253 4.583 14 5.996 14zm0 5c1.413 0 2.16-.747 2.705-1.293.49-.49.731-.707 1.292-.707s.802.217 1.292.707c.545.546 1.292 1.293 2.706 1.293 1.415 0 2.163-.747 2.71-1.293.491-.49.732-.707 1.295-.707s.804.217 1.295.707C19.837 18.253 20.585 19 22 19v-2c-.563 0-.804-.217-1.295-.707-.546-.546-1.294-1.293-2.709-1.293s-2.162.747-2.709 1.292c-.491.491-.731.708-1.296.708-.562 0-.802-.217-1.292-.707C12.154 15.747 11.407 15 9.993 15s-2.161.747-2.706 1.293c-.49.49-.73.707-1.291.707s-.801-.217-1.291-.707C4.16 15.747 3.413 15 2 15v2c.561 0 .801.217 1.291.707C3.836 18.253 4.583 19 5.996 19z" } }] })(t);
}
function Ev(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2c-4.963 0-9 4.038-9 9 0 3.328 1.82 6.232 4.513 7.79l-2.067 1.378A1 1 0 0 0 6 22h12a1 1 0 0 0 .555-1.832l-2.067-1.378C19.18 17.232 21 14.328 21 11c0-4.962-4.037-9-9-9zm0 16c-3.859 0-7-3.141-7-7 0-3.86 3.141-7 7-7s7 3.14 7 7c0 3.859-3.141 7-7 7z" } }, { tag: "path", attr: { d: "M12 6c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z" } }] })(t);
}
function Rv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "circle", attr: { cx: "12", cy: "18", r: "2" } }] })(t);
}
function Tv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.671 14.307C16.184 12.819 14.17 12 12 12s-4.184.819-5.671 2.307l1.414 1.414c1.11-1.11 2.621-1.722 4.257-1.722 1.636.001 3.147.612 4.257 1.722l1.414-1.414z" } }, { tag: "circle", attr: { cx: "12", cy: "18", r: "2" } }] })(t);
}
function Ov(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.671 14.307C16.184 12.819 14.17 12 12 12s-4.184.819-5.671 2.307l1.414 1.414c1.11-1.11 2.621-1.722 4.257-1.722 1.636.001 3.147.612 4.257 1.722l1.414-1.414z" } }, { tag: "path", attr: { d: "M20.437 11.292c-4.572-4.573-12.301-4.573-16.873 0l1.414 1.414c3.807-3.807 10.238-3.807 14.045 0l1.414-1.414z" } }, { tag: "circle", attr: { cx: "12", cy: "18", r: "2" } }] })(t);
}
function Nv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m1.293 8.395 1.414 1.414c.504-.504 1.052-.95 1.622-1.359L2.9 7.021c-.56.422-1.104.87-1.607 1.374zM6.474 5.06 3.707 2.293 2.293 3.707l18 18 1.414-1.414-5.012-5.012.976-.975a7.86 7.86 0 0 0-4.099-2.148L11.294 9.88c2.789-.191 5.649.748 7.729 2.827l1.414-1.414c-2.898-2.899-7.061-3.936-10.888-3.158L8.024 6.61A13.366 13.366 0 0 1 12 6c3.537 0 6.837 1.353 9.293 3.809l1.414-1.414C19.874 5.561 16.071 4 12 4a15.198 15.198 0 0 0-5.526 1.06zm-2.911 6.233 1.414 1.414a9.563 9.563 0 0 1 2.058-1.551L5.576 9.697c-.717.451-1.395.979-2.013 1.596zm2.766 3.014 1.414 1.414c.692-.692 1.535-1.151 2.429-1.428l-1.557-1.557a7.76 7.76 0 0 0-2.286 1.571zm7.66 3.803-2.1-2.1a1.996 1.996 0 1 0 2.1 2.1z" } }] })(t);
}
function $v(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 6c3.537 0 6.837 1.353 9.293 3.809l1.414-1.414C19.874 5.561 16.071 4 12 4c-4.071.001-7.874 1.561-10.707 4.395l1.414 1.414C5.163 7.353 8.463 6 12 6zm5.671 8.307c-3.074-3.074-8.268-3.074-11.342 0l1.414 1.414c2.307-2.307 6.207-2.307 8.514 0l1.414-1.414z" } }, { tag: "path", attr: { d: "M20.437 11.293c-4.572-4.574-12.301-4.574-16.873 0l1.414 1.414c3.807-3.807 10.238-3.807 14.045 0l1.414-1.414z" } }, { tag: "circle", attr: { cx: "12", cy: "18", r: "2" } }] })(t);
}
function Iv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M13 5.5C13 3.57 11.43 2 9.5 2 7.466 2 6.25 3.525 6.25 5h2c0-.415.388-1 1.25-1 .827 0 1.5.673 1.5 1.5S10.327 7 9.5 7H2v2h7.5C11.43 9 13 7.43 13 5.5zm2.5 9.5H8v2h7.5c.827 0 1.5.673 1.5 1.5s-.673 1.5-1.5 1.5c-.862 0-1.25-.585-1.25-1h-2c0 1.475 1.216 3 3.25 3 1.93 0 3.5-1.57 3.5-3.5S17.43 15 15.5 15z" } }, { tag: "path", attr: { d: "M18 5c-2.206 0-4 1.794-4 4h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2H2v2h16c2.206 0 4-1.794 4-4s-1.794-4-4-4zM2 15h4v2H2z" } }] })(t);
}
function Dv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm0 2 .001 4H4V5h16zM4 19v-8h16.001l.001 8H4z" } }, { tag: "path", attr: { d: "M14 6h2v2h-2zm3 0h2v2h-2z" } }] })(t);
}
function kv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V7h16l.001 12H4z" } }, { tag: "path", attr: { d: "m15.707 10.707-1.414-1.414L12 11.586 9.707 9.293l-1.414 1.414L10.586 13l-2.293 2.293 1.414 1.414L12 14.414l2.293 2.293 1.414-1.414L13.414 13z" } }] })(t);
}
function jv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h5v-2H4V7h16v12h-5v2h5c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" } }, { tag: "path", attr: { d: "M13 21v-5h3l-4-5-4 5h3v5z" } }] })(t);
}
function Uv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M4 21h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zm0-2V7h16l.001 12H4z" } }] })(t);
}
function Fv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M16 7H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zM4 19v-8h12V9l.002 10H4z" } }, { tag: "path", attr: { d: "M22 5c0-1.103-.897-2-2-2H7c-1.103 0-2 .897-2 2h13.001c1.101 0 1.996.895 1.999 1.994L20.002 15H20v2c1.103 0 2-.897 2-2V8.007L22.001 8V6L22 5.99V5z" } }] })(t);
}
function qv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M19.713 12.123c.264-.952.312-2.03.143-3.206l-.866-6.059A1 1 0 0 0 18 2H6a1 1 0 0 0-.99.858l-.865 6.058c-.169 1.177-.121 2.255.142 3.206.864 3.134 3.551 5.392 6.713 5.794V20H9v2h6v-2h-2v-2.084c3.162-.402 5.849-2.66 6.713-5.793zM17.133 4l.57 4H6.296l.571-4h10.266zM6.215 11.59c-.132-.474-.181-1.009-.159-1.59h11.889c.021.581-.028 1.116-.159 1.591A6.021 6.021 0 0 1 12 16a6.019 6.019 0 0 1-5.785-4.41z" } }] })(t);
}
function Wv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" } }, { tag: "path", attr: { d: "M14.828 14.828a3.988 3.988 0 0 1-2.02 1.09 4.108 4.108 0 0 1-1.616 0 4.103 4.103 0 0 1-.749-.232 4.161 4.161 0 0 1-.679-.368 4.115 4.115 0 0 1-1.082-1.082l-1.658 1.117c.215.319.462.619.733.889a5.991 5.991 0 0 0 8.485.002c.272-.271.52-.571.734-.891l-1.658-1.117c-.143.211-.307.41-.49.592z" } }, { tag: "circle", attr: { cx: "8.5", cy: "10.5", r: "1.5" } }, { tag: "path", attr: { d: "M15.5 10c-2 0-2.5 2-2.5 2h5s-.501-2-2.5-2z" } }] })(t);
}
function Gv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M15.5 9c-2 0-2.5 2-2.5 2h5s-.501-2-2.5-2z" } }, { tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-2 16v-3h4v3c0 1.103-.897 2-2 2s-2-.897-2-2zm5.856 1.005c.085-.323.144-.656.144-1.005v-1.499C17.589 15.028 18 13 18 13H6s.412 2.028 2 3.501V18c0 .349.059.682.144 1.005A8.005 8.005 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8a8.005 8.005 0 0 1-4.144 7.005z" } }, { tag: "circle", attr: { cx: "8.5", cy: "9.5", r: "1.5" } }] })(t);
}
function Xv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M21.758 5H19.68l-.844 3h-4.893l-.899-3h-2.088l-.899 3H5.164L4.32 5H2.242l.844 3H2v2h1.648l.563 2H2v2h2.773l1.688 6h2.083l1.8-6h3.313l1.8 6h2.083l1.688-6H22v-2h-2.211l.563-2H22V8h-1.086l.844-3zM5.727 10h3.729l-.6 2H6.289l-.562-2zm1.804 6.417L6.852 14h1.404l-.725 2.417zM10.944 12l.6-2h.912l.6 2h-2.112zm5.525 4.417L15.744 14h1.404l-.679 2.417zM17.711 12h-2.567l-.6-2h3.729l-.562 2z" } }] })(t);
}
function Kv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM4 12c0-.899.156-1.762.431-2.569L6 11l2 2v2l2 2 1 1v1.931C7.061 19.436 4 16.072 4 12zm14.33 4.873C17.677 16.347 16.687 16 16 16v-1a2 2 0 0 0-2-2h-4v-3a2 2 0 0 0 2-2V7h1a2 2 0 0 0 2-2v-.411C17.928 5.778 20 8.65 20 12a7.947 7.947 0 0 1-1.67 4.873z" } }] })(t);
}
function Yv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M5.122 21c.378.378.88.586 1.414.586S7.572 21.378 7.95 21l4.336-4.336a7.495 7.495 0 0 0 2.217.333 7.446 7.446 0 0 0 5.302-2.195 7.484 7.484 0 0 0 1.632-8.158l-.57-1.388-4.244 4.243-2.121-2.122 4.243-4.243-1.389-.571A7.478 7.478 0 0 0 14.499 2c-2.003 0-3.886.78-5.301 2.196a7.479 7.479 0 0 0-1.862 7.518L3 16.05a2.001 2.001 0 0 0 0 2.828L5.122 21zm4.548-8.791-.254-.616a5.486 5.486 0 0 1 1.196-5.983 5.46 5.46 0 0 1 4.413-1.585l-3.353 3.353 4.949 4.95 3.355-3.355a5.49 5.49 0 0 1-1.587 4.416c-1.55 1.55-3.964 2.027-5.984 1.196l-.615-.255-5.254 5.256h.001l-.001 1v-1l-2.122-2.122 5.256-5.255z" } }] })(t);
}
function Qv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M9.172 16.242 12 13.414l2.828 2.828 1.414-1.414L13.414 12l2.828-2.828-1.414-1.414L12 10.586 9.172 7.758 7.758 9.172 10.586 12l-2.828 2.828z" } }, { tag: "path", attr: { d: "M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z" } }] })(t);
}
function Jv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z" } }] })(t);
}
function Zv(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M17.2 3.4 12 10.333 6.8 3.4 5.2 4.6 10 11H7v2h4v2H7v2h4v4h2v-4h4v-2h-4v-2h4v-2h-3l4.8-6.4z" } }] })(t);
}
function tu(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M11 6H9v3H6v2h3v3h2v-3h3V9h-3z" } }, { tag: "path", attr: { d: "M10 2c-4.411 0-8 3.589-8 8s3.589 8 8 8a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8zm0 14c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" } }] })(t);
}
function eu(t) {
  return a({ tag: "svg", attr: { viewBox: "0 0 24 24" }, child: [{ tag: "path", attr: { d: "M6 9h8v2H6z" } }, { tag: "path", attr: { d: "M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" } }] })(t);
}
const au = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BiAbacus: t9,
  BiAccessibility: e9,
  BiAddToQueue: a9,
  BiAdjust: r9,
  BiAlarmAdd: n9,
  BiAlarmExclamation: c9,
  BiAlarmOff: i9,
  BiAlarmSnooze: l9,
  BiAlarm: o9,
  BiAlbum: h9,
  BiAlignJustify: s9,
  BiAlignLeft: v9,
  BiAlignMiddle: u9,
  BiAlignRight: d9,
  BiAnalyse: g9,
  BiAnchor: f9,
  BiAngry: p9,
  BiAperture: z9,
  BiArch: m9,
  BiArchiveIn: M9,
  BiArchiveOut: B9,
  BiArchive: H9,
  BiArea: w9,
  BiArrowBack: x9,
  BiArrowFromBottom: V9,
  BiArrowFromLeft: y9,
  BiArrowFromRight: C9,
  BiArrowFromTop: L9,
  BiArrowToBottom: _9,
  BiArrowToLeft: A9,
  BiArrowToRight: b9,
  BiArrowToTop: P9,
  BiAt: S9,
  BiAtom: E9,
  BiAward: R9,
  BiBadgeCheck: T9,
  BiBadge: O9,
  BiBall: N9,
  BiBandAid: $9,
  BiBarChartAlt2: I9,
  BiBarChartAlt: D9,
  BiBarChartSquare: k9,
  BiBarChart: j9,
  BiBarcodeReader: U9,
  BiBarcode: F9,
  BiBaseball: q9,
  BiBasket: W9,
  BiBasketball: G9,
  BiBath: X9,
  BiBattery: K9,
  BiBed: Y9,
  BiBeenHere: Q9,
  BiBeer: J9,
  BiBellMinus: Z9,
  BiBellOff: tr,
  BiBellPlus: er,
  BiBell: ar,
  BiBible: rr,
  BiBitcoin: nr,
  BiBlanket: cr,
  BiBlock: ir,
  BiBluetooth: lr,
  BiBody: or,
  BiBold: hr,
  BiBoltCircle: sr,
  BiBomb: vr,
  BiBone: ur,
  BiBong: dr,
  BiBookAdd: gr,
  BiBookAlt: fr,
  BiBookBookmark: pr,
  BiBookContent: zr,
  BiBookHeart: mr,
  BiBookOpen: Mr,
  BiBookReader: Br,
  BiBook: Hr,
  BiBookmarkAltMinus: wr,
  BiBookmarkAltPlus: xr,
  BiBookmarkAlt: Vr,
  BiBookmarkHeart: yr,
  BiBookmarkMinus: Cr,
  BiBookmarkPlus: Lr,
  BiBookmark: _r,
  BiBookmarks: Ar,
  BiBorderAll: br,
  BiBorderBottom: Pr,
  BiBorderInner: Sr,
  BiBorderLeft: Er,
  BiBorderNone: Rr,
  BiBorderOuter: Tr,
  BiBorderRadius: Or,
  BiBorderRight: Nr,
  BiBorderTop: $r,
  BiBot: Ir,
  BiBowlingBall: Dr,
  BiBox: kr,
  BiBracket: jr,
  BiBraille: Ur,
  BiBrain: Fr,
  BiBriefcaseAlt2: qr,
  BiBriefcaseAlt: Wr,
  BiBriefcase: Gr,
  BiBrightnessHalf: Xr,
  BiBrightness: Kr,
  BiBroadcast: Yr,
  BiBrushAlt: Qr,
  BiBrush: Jr,
  BiBugAlt: Zr,
  BiBug: t5,
  BiBuildingHouse: e5,
  BiBuilding: a5,
  BiBuildings: r5,
  BiBulb: n5,
  BiBullseye: c5,
  BiBuoy: i5,
  BiBusSchool: l5,
  BiBus: o5,
  BiCabinet: h5,
  BiCake: s5,
  BiCalculator: v5,
  BiCalendarAlt: u5,
  BiCalendarCheck: d5,
  BiCalendarEdit: g5,
  BiCalendarEvent: f5,
  BiCalendarExclamation: p5,
  BiCalendarHeart: z5,
  BiCalendarMinus: m5,
  BiCalendarPlus: M5,
  BiCalendarStar: B5,
  BiCalendarWeek: H5,
  BiCalendarX: w5,
  BiCalendar: x5,
  BiCameraHome: V5,
  BiCameraMovie: y5,
  BiCameraOff: C5,
  BiCamera: L5,
  BiCapsule: _5,
  BiCaptions: A5,
  BiCar: b5,
  BiCard: P5,
  BiCaretDownCircle: S5,
  BiCaretDownSquare: E5,
  BiCaretDown: R5,
  BiCaretLeftCircle: T5,
  BiCaretLeftSquare: O5,
  BiCaretLeft: N5,
  BiCaretRightCircle: $5,
  BiCaretRightSquare: I5,
  BiCaretRight: D5,
  BiCaretUpCircle: k5,
  BiCaretUpSquare: j5,
  BiCaretUp: U5,
  BiCarousel: F5,
  BiCartAlt: q5,
  BiCart: W5,
  BiCast: G5,
  BiCategoryAlt: X5,
  BiCategory: K5,
  BiCctv: Y5,
  BiCertification: Q5,
  BiChair: J5,
  BiChalkboard: Z5,
  BiChart: t8,
  BiChat: e8,
  BiCheckCircle: a8,
  BiCheckDouble: r8,
  BiCheckShield: n8,
  BiCheckSquare: c8,
  BiCheck: i8,
  BiCheckboxChecked: l8,
  BiCheckboxMinus: o8,
  BiCheckboxSquare: h8,
  BiCheckbox: s8,
  BiChevronDownCircle: v8,
  BiChevronDownSquare: u8,
  BiChevronDown: d8,
  BiChevronLeftCircle: g8,
  BiChevronLeftSquare: f8,
  BiChevronLeft: p8,
  BiChevronRightCircle: z8,
  BiChevronRightSquare: m8,
  BiChevronRight: $4,
  BiChevronUpCircle: M8,
  BiChevronUpSquare: B8,
  BiChevronUp: H8,
  BiChevronsDown: w8,
  BiChevronsLeft: x8,
  BiChevronsRight: V8,
  BiChevronsUp: y8,
  BiChip: C8,
  BiChurch: L8,
  BiCircle: _8,
  BiClinic: A8,
  BiClipboard: b8,
  BiCloset: P8,
  BiCloudDownload: S8,
  BiCloudDrizzle: E8,
  BiCloudLightRain: R8,
  BiCloudLightning: T8,
  BiCloudRain: O8,
  BiCloudSnow: N8,
  BiCloudUpload: $8,
  BiCloud: I8,
  BiCodeAlt: D8,
  BiCodeBlock: k8,
  BiCodeCurly: j8,
  BiCode: U8,
  BiCoffeeTogo: F8,
  BiCoffee: q8,
  BiCog: W8,
  BiCoinStack: G8,
  BiCoin: X8,
  BiCollapse: K8,
  BiCollection: Y8,
  BiColorFill: Q8,
  BiColumns: J8,
  BiCommand: Z8,
  BiCommentAdd: t7,
  BiCommentCheck: e7,
  BiCommentDetail: a7,
  BiCommentDots: r7,
  BiCommentEdit: n7,
  BiCommentError: c7,
  BiCommentMinus: i7,
  BiCommentX: l7,
  BiComment: o7,
  BiCompass: h7,
  BiConfused: s7,
  BiConversation: v7,
  BiCookie: u7,
  BiCool: d7,
  BiCopyAlt: g7,
  BiCopy: f7,
  BiCopyright: p7,
  BiCreditCardAlt: z7,
  BiCreditCardFront: m7,
  BiCreditCard: M7,
  BiCrop: B7,
  BiCrosshair: H7,
  BiCrown: w7,
  BiCubeAlt: x7,
  BiCube: V7,
  BiCuboid: y7,
  BiCurrentLocation: C7,
  BiCustomize: L7,
  BiCut: _7,
  BiCycling: A7,
  BiCylinder: b7,
  BiData: P7,
  BiDesktop: S7,
  BiDetail: E7,
  BiDevices: R7,
  BiDialpadAlt: T7,
  BiDialpad: O7,
  BiDiamond: N7,
  BiDice1: $7,
  BiDice2: I7,
  BiDice3: D7,
  BiDice4: k7,
  BiDice5: j7,
  BiDice6: U7,
  BiDirections: F7,
  BiDisc: q7,
  BiDish: W7,
  BiDislike: G7,
  BiDizzy: X7,
  BiDna: K7,
  BiDockBottom: Y7,
  BiDockLeft: Q7,
  BiDockRight: J7,
  BiDockTop: Z7,
  BiDollarCircle: t6,
  BiDollar: e6,
  BiDonateBlood: a6,
  BiDonateHeart: r6,
  BiDoorOpen: n6,
  BiDotsHorizontalRounded: c6,
  BiDotsHorizontal: i6,
  BiDotsVerticalRounded: l6,
  BiDotsVertical: o6,
  BiDoughnutChart: h6,
  BiDownArrowAlt: s6,
  BiDownArrowCircle: v6,
  BiDownArrow: u6,
  BiDownload: d6,
  BiDownvote: g6,
  BiDrink: f6,
  BiDroplet: p6,
  BiDumbbell: z6,
  BiDuplicate: m6,
  BiEditAlt: M6,
  BiEdit: B6,
  BiEnvelopeOpen: H6,
  BiEnvelope: w6,
  BiEqualizer: x6,
  BiEraser: V6,
  BiErrorAlt: y6,
  BiErrorCircle: C6,
  BiError: L6,
  BiEuro: _6,
  BiExclude: A6,
  BiExitFullscreen: b6,
  BiExit: P6,
  BiExpandAlt: S6,
  BiExpand: E6,
  BiExport: R6,
  BiExtension: T6,
  BiFace: O6,
  BiFastForwardCircle: N6,
  BiFastForward: $6,
  BiFemaleSign: I6,
  BiFemale: D6,
  BiFileBlank: k6,
  BiFileFind: j6,
  BiFile: U6,
  BiFilm: F6,
  BiFilterAlt: q6,
  BiFilter: W6,
  BiFingerprint: G6,
  BiFirstAid: X6,
  BiFirstPage: K6,
  BiFlag: Y6,
  BiFolderMinus: Q6,
  BiFolderOpen: J6,
  BiFolderPlus: Z6,
  BiFolder: tn,
  BiFontColor: en,
  BiFontFamily: an,
  BiFontSize: rn,
  BiFont: nn,
  BiFoodMenu: cn,
  BiFoodTag: ln,
  BiFootball: on,
  BiFridge: hn,
  BiFullscreen: sn,
  BiGame: vn,
  BiGasPump: un,
  BiGhost: dn,
  BiGift: gn,
  BiGitBranch: fn,
  BiGitCommit: pn,
  BiGitCompare: zn,
  BiGitMerge: mn,
  BiGitPullRequest: Mn,
  BiGitRepoForked: Bn,
  BiGlassesAlt: Hn,
  BiGlasses: wn,
  BiGlobeAlt: xn,
  BiGlobe: Vn,
  BiGridAlt: yn,
  BiGridHorizontal: Cn,
  BiGridSmall: Ln,
  BiGridVertical: _n,
  BiGrid: An,
  BiGroup: bn,
  BiHandicap: Pn,
  BiHappyAlt: Sn,
  BiHappyBeaming: En,
  BiHappyHeartEyes: Rn,
  BiHappy: Tn,
  BiHash: On,
  BiHdd: Nn,
  BiHeading: $n,
  BiHeadphone: In,
  BiHealth: Dn,
  BiHeartCircle: kn,
  BiHeartSquare: jn,
  BiHeart: Un,
  BiHelpCircle: Fn,
  BiHide: qn,
  BiHighlight: Wn,
  BiHistory: Gn,
  BiHive: Xn,
  BiHomeAlt: Kn,
  BiHomeCircle: Yn,
  BiHomeHeart: Qn,
  BiHomeSmile: Jn,
  BiHome: Zn,
  BiHorizontalCenter: tc,
  BiHotel: ec,
  BiHourglass: ac,
  BiIdCard: rc,
  BiImageAdd: nc,
  BiImageAlt: cc,
  BiImage: ic,
  BiImages: lc,
  BiImport: oc,
  BiInfinite: hc,
  BiInfoCircle: sc,
  BiInfoSquare: vc,
  BiIntersect: uc,
  BiItalic: dc,
  BiJoystickAlt: gc,
  BiJoystickButton: fc,
  BiJoystick: pc,
  BiKey: zc,
  BiLabel: mc,
  BiLandscape: Mc,
  BiLaptop: Bc,
  BiLastPage: Hc,
  BiLaugh: wc,
  BiLayerMinus: xc,
  BiLayerPlus: Vc,
  BiLayer: yc,
  BiLayout: Cc,
  BiLeftArrowAlt: Lc,
  BiLeftArrowCircle: _c,
  BiLeftArrow: Ac,
  BiLeftDownArrowCircle: bc,
  BiLeftIndent: Pc,
  BiLeftTopArrowCircle: Sc,
  BiLibrary: Ec,
  BiLike: Rc,
  BiLineChartDown: Tc,
  BiLineChart: Oc,
  BiLinkAlt: Nc,
  BiLinkExternal: $c,
  BiLink: Ic,
  BiLira: Dc,
  BiListCheck: kc,
  BiListMinus: jc,
  BiListOl: Uc,
  BiListPlus: Fc,
  BiListUl: qc,
  BiLoaderAlt: Wc,
  BiLoaderCircle: Gc,
  BiLoader: Xc,
  BiLocationPlus: Kc,
  BiLockAlt: Yc,
  BiLockOpenAlt: Qc,
  BiLockOpen: Jc,
  BiLock: Zc,
  BiLogInCircle: ti,
  BiLogIn: ei,
  BiLogOutCircle: ai,
  BiLogOut: ri,
  BiLowVision: ni,
  BiMagnet: ci,
  BiMailSend: ii,
  BiMaleSign: li,
  BiMale: oi,
  BiMapAlt: hi,
  BiMapPin: si,
  BiMap: vi,
  BiMask: ui,
  BiMedal: di,
  BiMehAlt: gi,
  BiMehBlank: fi,
  BiMeh: pi,
  BiMemoryCard: zi,
  BiMenuAltLeft: mi,
  BiMenuAltRight: Mi,
  BiMenu: Bi,
  BiMerge: Hi,
  BiMessageAdd: wi,
  BiMessageAltAdd: xi,
  BiMessageAltCheck: Vi,
  BiMessageAltDetail: yi,
  BiMessageAltDots: Ci,
  BiMessageAltEdit: Li,
  BiMessageAltError: _i,
  BiMessageAltMinus: Ai,
  BiMessageAltX: bi,
  BiMessageAlt: Pi,
  BiMessageCheck: Si,
  BiMessageDetail: Ei,
  BiMessageDots: Ri,
  BiMessageEdit: Ti,
  BiMessageError: Oi,
  BiMessageMinus: Ni,
  BiMessageRoundedAdd: $i,
  BiMessageRoundedCheck: Ii,
  BiMessageRoundedDetail: Di,
  BiMessageRoundedDots: ki,
  BiMessageRoundedEdit: ji,
  BiMessageRoundedError: Ui,
  BiMessageRoundedMinus: Fi,
  BiMessageRoundedX: qi,
  BiMessageRounded: Wi,
  BiMessageSquareAdd: Gi,
  BiMessageSquareCheck: Xi,
  BiMessageSquareDetail: Ki,
  BiMessageSquareDots: Yi,
  BiMessageSquareEdit: Qi,
  BiMessageSquareError: Ji,
  BiMessageSquareMinus: Zi,
  BiMessageSquareX: tl,
  BiMessageSquare: el,
  BiMessageX: al,
  BiMessage: rl,
  BiMeteor: nl,
  BiMicrochip: cl,
  BiMicrophoneOff: il,
  BiMicrophone: ll,
  BiMinusBack: ol,
  BiMinusCircle: hl,
  BiMinusFront: sl,
  BiMinus: vl,
  BiMobileAlt: ul,
  BiMobileLandscape: dl,
  BiMobileVibration: gl,
  BiMobile: fl,
  BiMoney: pl,
  BiMoon: zl,
  BiMouseAlt: ml,
  BiMouse: Ml,
  BiMoveHorizontal: Bl,
  BiMoveVertical: Hl,
  BiMove: wl,
  BiMoviePlay: xl,
  BiMovie: Vl,
  BiMusic: yl,
  BiNavigation: Cl,
  BiNetworkChart: Ll,
  BiNews: _l,
  BiNoEntry: Al,
  BiNote: bl,
  BiNotepad: Pl,
  BiNotificationOff: Sl,
  BiNotification: El,
  BiOutline: Rl,
  BiPackage: Tl,
  BiPaintRoll: Ol,
  BiPaint: Nl,
  BiPalette: $l,
  BiPaperPlane: Il,
  BiPaperclip: Dl,
  BiParagraph: kl,
  BiPaste: jl,
  BiPauseCircle: Ul,
  BiPause: Fl,
  BiPen: ql,
  BiPencil: Wl,
  BiPhoneCall: Gl,
  BiPhoneIncoming: Xl,
  BiPhoneOff: Kl,
  BiPhoneOutgoing: Yl,
  BiPhone: Ql,
  BiPhotoAlbum: Jl,
  BiPieChartAlt2: Zl,
  BiPieChartAlt: to,
  BiPieChart: eo,
  BiPin: ao,
  BiPlanet: ro,
  BiPlayCircle: no,
  BiPlay: co,
  BiPlug: io,
  BiPlusCircle: lo,
  BiPlusMedical: oo,
  BiPlus: ho,
  BiPodcast: so,
  BiPointer: vo,
  BiPoll: uo,
  BiPolygon: go,
  BiPound: fo,
  BiPowerOff: po,
  BiPrinter: zo,
  BiPulse: mo,
  BiPurchaseTagAlt: Mo,
  BiPurchaseTag: Bo,
  BiPyramid: Ho,
  BiQrScan: wo,
  BiQr: xo,
  BiQuestionMark: Vo,
  BiRadar: yo,
  BiRadioCircleMarked: Co,
  BiRadioCircle: Lo,
  BiRadio: _o,
  BiReceipt: Ao,
  BiRectangle: bo,
  BiRecycle: Po,
  BiRedo: So,
  BiRefresh: Eo,
  BiRegistered: Ro,
  BiRename: To,
  BiRepeat: Oo,
  BiReplyAll: No,
  BiReply: $o,
  BiRepost: Io,
  BiReset: Do,
  BiRestaurant: ko,
  BiRevision: jo,
  BiRewindCircle: Uo,
  BiRewind: Fo,
  BiRightArrowAlt: qo,
  BiRightArrowCircle: Wo,
  BiRightArrow: Go,
  BiRightDownArrowCircle: Xo,
  BiRightIndent: Ko,
  BiRightTopArrowCircle: Yo,
  BiRocket: Qo,
  BiRotateLeft: Jo,
  BiRotateRight: Zo,
  BiRss: th,
  BiRuble: eh,
  BiRuler: ah,
  BiRun: rh,
  BiRupee: nh,
  BiSad: ch,
  BiSave: ih,
  BiScan: lh,
  BiScreenshot: oh,
  BiSearchAlt2: hh,
  BiSearchAlt: sh,
  BiSearch: vh,
  BiSelectMultiple: uh,
  BiSelection: dh,
  BiSend: gh,
  BiServer: fh,
  BiShapeCircle: ph,
  BiShapePolygon: zh,
  BiShapeSquare: mh,
  BiShapeTriangle: Mh,
  BiShareAlt: Bh,
  BiShare: Hh,
  BiShekel: wh,
  BiShieldAlt2: xh,
  BiShieldAlt: Vh,
  BiShieldQuarter: yh,
  BiShieldX: Ch,
  BiShield: Lh,
  BiShocked: _h,
  BiShoppingBag: Ah,
  BiShowAlt: bh,
  BiShow: Ph,
  BiShuffle: Sh,
  BiSidebar: Eh,
  BiSitemap: Rh,
  BiSkipNextCircle: Th,
  BiSkipNext: Oh,
  BiSkipPreviousCircle: Nh,
  BiSkipPrevious: $h,
  BiSleepy: Ih,
  BiSliderAlt: Dh,
  BiSlider: kh,
  BiSlideshow: jh,
  BiSmile: Uh,
  BiSortAZ: Fh,
  BiSortAlt2: qh,
  BiSortDown: Wh,
  BiSortUp: Gh,
  BiSortZA: Xh,
  BiSort: Kh,
  BiSpa: Yh,
  BiSpaceBar: Qh,
  BiSpeaker: Jh,
  BiSprayCan: Zh,
  BiSpreadsheet: ts,
  BiSquareRounded: es,
  BiSquare: as,
  BiStar: rs,
  BiStation: ns,
  BiStats: cs,
  BiSticker: is,
  BiStopCircle: ls,
  BiStop: os,
  BiStopwatch: hs,
  BiStoreAlt: ss,
  BiStore: vs,
  BiStreetView: us,
  BiStrikethrough: ds,
  BiSubdirectoryLeft: gs,
  BiSubdirectoryRight: fs,
  BiSun: ps,
  BiSupport: zs,
  BiSwim: ms,
  BiSync: Ms,
  BiTab: Bs,
  BiTable: Hs,
  BiTachometer: ws,
  BiTagAlt: xs,
  BiTag: Vs,
  BiTargetLock: ys,
  BiTaskX: Cs,
  BiTask: Ls,
  BiTaxi: _s,
  BiTennisBall: As,
  BiTerminal: bs,
  BiTestTube: Ps,
  BiText: Ss,
  BiTimeFive: Es,
  BiTime: Rs,
  BiTimer: Ts,
  BiTired: Os,
  BiToggleLeft: Ns,
  BiToggleRight: $s,
  BiTone: Is,
  BiTrafficCone: Ds,
  BiTrain: ks,
  BiTransferAlt: js,
  BiTransfer: Us,
  BiTrashAlt: Fs,
  BiTrash: qs,
  BiTrendingDown: Ws,
  BiTrendingUp: Gs,
  BiTrim: Xs,
  BiTrip: Ks,
  BiTrophy: Ys,
  BiTv: Qs,
  BiUnderline: Js,
  BiUndo: Zs,
  BiUnite: tv,
  BiUnlink: ev,
  BiUpArrowAlt: av,
  BiUpArrowCircle: rv,
  BiUpArrow: nv,
  BiUpload: cv,
  BiUpsideDown: iv,
  BiUpvote: lv,
  BiUsb: ov,
  BiUserCheck: hv,
  BiUserCircle: sv,
  BiUserMinus: vv,
  BiUserPin: uv,
  BiUserPlus: dv,
  BiUserVoice: gv,
  BiUserX: fv,
  BiUser: pv,
  BiVector: zv,
  BiVerticalCenter: mv,
  BiVial: Mv,
  BiVideoOff: Bv,
  BiVideoPlus: Hv,
  BiVideoRecording: wv,
  BiVideo: xv,
  BiVoicemail: Vv,
  BiVolumeFull: yv,
  BiVolumeLow: Cv,
  BiVolumeMute: Lv,
  BiVolume: _v,
  BiWalk: Av,
  BiWalletAlt: bv,
  BiWallet: Pv,
  BiWater: Sv,
  BiWebcam: Ev,
  BiWifi0: Rv,
  BiWifi1: Tv,
  BiWifi2: Ov,
  BiWifiOff: Nv,
  BiWifi: $v,
  BiWind: Iv,
  BiWindowAlt: Dv,
  BiWindowClose: kv,
  BiWindowOpen: jv,
  BiWindow: Uv,
  BiWindows: Fv,
  BiWine: qv,
  BiWinkSmile: Wv,
  BiWinkTongue: Gv,
  BiWon: Xv,
  BiWorld: Kv,
  BiWrench: Yv,
  BiXCircle: Qv,
  BiX: Jv,
  BiYen: Zv,
  BiZoomIn: tu,
  BiZoomOut: eu
}, Symbol.toStringTag, { value: "Module" })), ru = (t) => {
  const e = t.split(/(?=[A-Z])/);
  return e.length > 1 ? e.slice(1).join(" ") : t;
}, nu = Wt(({ input: t }) => {
  const [e, r] = T.useState(""), n = T.useMemo(() => Object.keys(U1).filter((l) => l.toLowerCase().includes(e.toLowerCase())), [e]), c = Object.keys(U1).includes(t.value) ? ru(t.value) : "Select Icon", i = U1[t.value] ? U1[t.value] : null;
  return /* @__PURE__ */ T.createElement("div", {
    className: "relative z-[1000]"
  }, /* @__PURE__ */ T.createElement("input", {
    type: "text",
    id: t.name,
    className: "hidden",
    ...t
  }), /* @__PURE__ */ T.createElement(l2, null, ({ open: l }) => /* @__PURE__ */ T.createElement(T.Fragment, null, /* @__PURE__ */ T.createElement(l2.Button, {
    as: "span"
  }, /* @__PURE__ */ T.createElement(k4, {
    className: `text-sm h-11 px-4 ${i ? "h-11" : "h-10"}`,
    size: "custom",
    rounded: "full",
    variant: l ? "secondary" : "white"
  }, i && /* @__PURE__ */ T.createElement(i, {
    className: "w-7 mr-1 h-auto fill-current text-blue-500"
  }), c, !i && /* @__PURE__ */ T.createElement($4, {
    className: "w-5 h-auto fill-current opacity-70 ml-1"
  }))), /* @__PURE__ */ T.createElement("div", {
    className: "absolute w-full min-w-[192px] max-w-2xl -bottom-2 left-0 translate-y-full"
  }, /* @__PURE__ */ T.createElement(Z3, {
    enter: "transition duration-150 ease-out",
    enterFrom: "transform opacity-0 -translate-y-2",
    enterTo: "transform opacity-100 translate-y-0",
    leave: "transition duration-75 ease-in",
    leaveFrom: "transform opacity-100 translate-y-0",
    leaveTo: "transform opacity-0 -translate-y-2"
  }, /* @__PURE__ */ T.createElement(l2.Panel, {
    className: "relative overflow-hidden rounded-lg shadow-lg bg-white border border-gray-150 z-50"
  }, ({ close: s }) => /* @__PURE__ */ T.createElement("div", {
    className: "max-h-[24rem] flex flex-col w-full h-full"
  }, /* @__PURE__ */ T.createElement("div", {
    className: "bg-gray-50 p-2 border-b border-gray-100 z-10 shadow-sm"
  }, /* @__PURE__ */ T.createElement("input", {
    type: "text",
    className: "bg-white text-sm rounded-sm border border-gray-100 shadow-inner py-1.5 px-2.5 w-full block placeholder-gray-200",
    onClick: (o) => {
      o.stopPropagation(), o.preventDefault();
    },
    value: e,
    onChange: (o) => {
      r(o.target.value);
    },
    placeholder: "Filter..."
  })), n.length === 0 && /* @__PURE__ */ T.createElement("span", {
    className: "relative text-center text-xs px-2 py-3 text-gray-300 bg-gray-50 italic"
  }, "No matches found"), n.length > 0 && /* @__PURE__ */ T.createElement("div", {
    className: "w-full grid grid-cols-6 auto-rows-auto p-2 overflow-y-auto"
  }, /* @__PURE__ */ T.createElement("button", {
    className: "relative rounded-lg text-center text-xs py-2 px-3 flex-1 outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50",
    key: "clear-input",
    onClick: () => {
      t.onChange(""), r(""), s();
    }
  }, /* @__PURE__ */ T.createElement(h3, {
    className: "w-6 h-auto text-gray-200"
  })), n.map((o) => /* @__PURE__ */ T.createElement("button", {
    className: "relative flex items-center justify-center rounded-lg text-center text-xs py-2 px-3 flex-1 outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50",
    key: o,
    onClick: () => {
      t.onChange(o), r(""), s();
    }
  }, /* @__PURE__ */ T.createElement(cu, {
    data: {
      name: o,
      size: "custom",
      color: "blue"
    },
    className: "w-7 h-auto"
  })))))))))));
}), U1 = {
  Tina: (t) => /* @__PURE__ */ T.createElement("svg", {
    ...t,
    viewBox: "0 0 66 80",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ T.createElement("title", null, "Tina"), /* @__PURE__ */ T.createElement("path", {
    d: "M39.4615 36.1782C42.763 33.4475 44.2259 17.3098 45.6551 11.5091C47.0843 5.70828 52.995 6.0025 52.995 6.0025C52.995 6.0025 51.4605 8.67299 52.0864 10.6658C52.7123 12.6587 57 14.4401 57 14.4401L56.0752 16.8781C56.0752 16.8781 54.1441 16.631 52.995 18.9297C51.8459 21.2283 53.7336 43.9882 53.7336 43.9882C53.7336 43.9882 46.8271 57.6106 46.8271 63.3621C46.8271 69.1136 49.5495 73.9338 49.5495 73.9338H45.7293C45.7293 73.9338 40.1252 67.2648 38.9759 63.9318C37.8266 60.5988 38.2861 57.2658 38.2861 57.2658C38.2861 57.2658 32.1946 56.921 26.7931 57.2658C21.3915 57.6106 17.7892 62.2539 17.1391 64.8512C16.4889 67.4486 16.2196 73.9338 16.2196 73.9338H13.1991C11.3606 68.2603 9.90043 66.2269 10.6925 63.3621C12.8866 55.4269 12.4557 50.9263 11.9476 48.9217C11.4396 46.9172 8 45.1676 8 45.1676C9.68492 41.7349 11.4048 40.0854 18.8029 39.9133C26.201 39.7413 36.1599 38.9088 39.4615 36.1782Z",
    fill: "currentColor"
  }), /* @__PURE__ */ T.createElement("path", {
    d: "M20.25 63.03C20.25 63.03 21.0305 70.2533 25.1773 73.9342H28.7309C25.1773 69.9085 24.7897 59.415 24.7897 59.415C22.9822 60.0035 20.4799 62.1106 20.25 63.03Z",
    fill: "currentColor"
  })),
  ...au
}, qt = {
  blue: {
    regular: "text-blue-400",
    circle: "bg-blue-400 dark:bg-blue-500 text-blue-50"
  },
  teal: {
    regular: "text-teal-400",
    circle: "bg-teal-400 dark:bg-teal-500 text-teal-50"
  },
  green: {
    regular: "text-green-400",
    circle: "bg-green-400 dark:bg-green-500 text-green-50"
  },
  red: {
    regular: "text-red-400",
    circle: "bg-red-400 dark:bg-red-500 text-red-50"
  },
  pink: {
    regular: "text-pink-400",
    circle: "bg-pink-400 dark:bg-pink-500 text-pink-50"
  },
  purple: {
    regular: "text-purple-400",
    circle: "bg-purple-400 dark:bg-purple-500 text-purple-50"
  },
  orange: {
    regular: "text-orange-400",
    circle: "bg-orange-400 dark:bg-orange-500 text-orange-50"
  },
  yellow: {
    regular: "text-yellow-400",
    circle: "bg-yellow-400 dark:bg-yellow-500 text-yellow-50"
  },
  white: {
    regular: "text-white opacity-80",
    circle: "bg-white-400 dark:bg-white-500 text-white-50"
  }
}, s2 = {
  xs: "w-6 h-6 flex-shrink-0",
  small: "w-8 h-8 flex-shrink-0",
  medium: "w-12 h-12 flex-shrink-0",
  large: "w-14 h-14 flex-shrink-0",
  xl: "w-16 h-16 flex-shrink-0",
  custom: ""
}, cu = ({
  data: t,
  parentColor: e = "",
  className: r = "",
  tinaField: n = ""
}) => {
  if (U1[t.name] === null || U1[t.name] === void 0)
    return null;
  const { name: c, color: i, size: l = "medium", style: s = "regular" } = t, o = vu(), h = U1[c], v = typeof l == "string" ? s2[l] : s2[Object.keys(s2)[l]], d = i ? i === "primary" ? o.color : i : o.color;
  if (s == "circle")
    return /* @__PURE__ */ T.createElement("div", {
      "data-tinafield": n,
      className: `relative z-10 inline-flex items-center justify-center flex-shrink-0 ${v} rounded-full ${qt[d].circle} ${r}`
    }, /* @__PURE__ */ T.createElement(h, {
      className: "w-2/3 h-2/3"
    }));
  {
    const g = qt[e === "primary" && (d === o.color || d === "primary") ? "white" : d].regular;
    return /* @__PURE__ */ T.createElement(h, {
      "data-tinafield": n,
      className: `${v} ${g} ${r}`
    });
  }
}, I4 = {
  type: "object",
  label: "Icon",
  name: "icon",
  fields: [
    {
      type: "string",
      label: "Icon",
      name: "name",
      ui: {
        component: nu
      }
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      ui: {
        component: x4
      }
    },
    {
      name: "style",
      label: "Style",
      type: "string",
      options: [
        {
          label: "Circle",
          value: "circle"
        },
        {
          label: "Float",
          value: "float"
        }
      ]
    }
  ]
}, iu = {
  name: "Tina Starter",
  icon: {
    color: "orange",
    style: "float",
    name: "Tina"
  },
  color: "default",
  nav: [
    {
      href: "",
      label: "Home"
    },
    {
      href: "about",
      label: "About"
    },
    {
      href: "posts",
      label: "Blog"
    }
  ]
}, lu = {
  color: "default",
  social: {
    facebook: "/",
    twitter: "/",
    instagram: "/"
  }
}, ou = {
  color: "blue",
  font: "sans",
  darkMode: "system"
}, hu = {
  header: iu,
  footer: lu,
  theme: ou
}, su = T.createContext(hu.theme), vu = () => T.useContext(su), uu = {
  name: "content",
  label: "Content",
  ui: {
    previewSrc: "/blocks/content.png",
    defaultItem: {
      body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede."
    }
  },
  fields: [
    {
      type: "rich-text",
      label: "Body",
      name: "body"
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Tint", value: "tint" },
        { label: "Primary", value: "primary" }
      ]
    }
  ]
}, A0 = {
  title: "Here's Another Feature",
  text: "This is where you might talk about the feature, if this wasn't just filler text.",
  icon: {
    color: "",
    style: "float",
    name: ""
  }
}, du = {
  name: "features",
  label: "Features",
  ui: {
    previewSrc: "/blocks/features.png",
    defaultItem: {
      items: [A0, A0, A0]
    }
  },
  fields: [
    {
      type: "object",
      label: "Feature Items",
      name: "items",
      list: !0,
      ui: {
        itemProps: (t) => ({
          label: t == null ? void 0 : t.title
        }),
        defaultItem: {
          ...A0
        }
      },
      fields: [
        I4,
        {
          type: "string",
          label: "Title",
          name: "title"
        },
        {
          type: "string",
          label: "Text",
          name: "text",
          ui: {
            component: "textarea"
          }
        }
      ]
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Tint", value: "tint" },
        { label: "Primary", value: "primary" }
      ]
    }
  ]
}, gu = {
  name: "hero",
  label: "Hero",
  ui: {
    previewSrc: "/blocks/hero.png",
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: "This Big Text is Totally Awesome",
      text: "Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo."
    }
  },
  fields: [
    {
      type: "string",
      label: "Tagline",
      name: "tagline"
    },
    {
      type: "string",
      label: "Headline",
      name: "headline"
    },
    {
      label: "Text",
      name: "text",
      type: "rich-text"
    },
    {
      label: "Actions",
      name: "actions",
      type: "object",
      list: !0,
      ui: {
        defaultItem: {
          label: "Action Label",
          type: "button",
          icon: !0,
          link: "/"
        },
        itemProps: (t) => ({ label: t.label })
      },
      fields: [
        {
          label: "Label",
          name: "label",
          type: "string"
        },
        {
          label: "Type",
          name: "type",
          type: "string",
          options: [
            { label: "Button", value: "button" },
            { label: "Link", value: "link" }
          ]
        },
        {
          label: "Icon",
          name: "icon",
          type: "boolean"
        },
        {
          label: "Link",
          name: "link",
          type: "string"
        }
      ]
    },
    {
      type: "object",
      label: "Image",
      name: "image",
      fields: [
        {
          name: "src",
          label: "Image Source",
          type: "image"
        },
        {
          name: "alt",
          label: "Alt Text",
          type: "string"
        }
      ]
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Tint", value: "tint" },
        { label: "Primary", value: "primary" }
      ]
    }
  ]
}, fu = {
  name: "testimonial",
  label: "Testimonial",
  ui: {
    previewSrc: "/blocks/testimonial.png",
    defaultItem: {
      quote: "There are only two hard things in Computer Science: cache invalidation and naming things.",
      author: "Phil Karlton",
      color: "primary"
    }
  },
  fields: [
    {
      type: "string",
      ui: {
        component: "textarea"
      },
      label: "Quote",
      name: "quote"
    },
    {
      type: "string",
      label: "Author",
      name: "author"
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Tint", value: "tint" },
        { label: "Primary", value: "primary" }
      ]
    }
  ]
}, Bu = j4({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || process.env.HEAD,
  token: process.env.TINA_TOKEN,
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads"
    }
  },
  build: {
    publicFolder: "public",
    outputFolder: "admin"
  },
  cmsCallback: (t) => (t.flags.set("branch-switcher", !0), t),
  schema: {
    collections: [
      {
        label: "Blog Posts",
        name: "post",
        path: "content/posts",
        format: "mdx",
        ui: {
          router: ({ document: t }) => `/posts/${t._sys.filename}`
        },
        fields: [
          {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: !0,
            required: !0
          },
          {
            type: "string",
            name: "foobar",
            nameOverride: "foo-bar"
          },
          {
            type: "image",
            name: "heroImg",
            label: "Hero Image"
          },
          {
            type: "rich-text",
            label: "Excerpt",
            name: "excerpt"
          },
          {
            type: "reference",
            label: "Author",
            name: "author",
            collections: ["author"]
          },
          {
            type: "datetime",
            label: "Posted Date",
            name: "date",
            ui: {
              dateFormat: "MMMM DD YYYY",
              timeFormat: "hh:mm A"
            }
          },
          {
            type: "rich-text",
            label: "Body",
            name: "_body",
            templates: [
              {
                name: "DateTime",
                label: "Date & Time",
                inline: !0,
                fields: [
                  {
                    name: "format",
                    label: "Format",
                    type: "string",
                    options: ["utc", "iso", "local"]
                  }
                ]
              },
              {
                name: "BlockQuote",
                label: "Block Quote",
                fields: [
                  {
                    name: "children",
                    label: "Quote",
                    type: "rich-text"
                  },
                  {
                    name: "authorName",
                    label: "Author",
                    type: "string"
                  }
                ]
              },
              {
                name: "NewsletterSignup",
                label: "Newsletter Sign Up",
                fields: [
                  {
                    name: "children",
                    label: "CTA",
                    type: "rich-text"
                  },
                  {
                    name: "placeholder",
                    label: "Placeholder",
                    type: "string"
                  },
                  {
                    name: "buttonText",
                    label: "Button Text",
                    type: "string"
                  },
                  {
                    name: "disclaimer",
                    label: "Disclaimer",
                    type: "rich-text"
                  }
                ],
                ui: {
                  defaultItem: {
                    placeholder: "Enter your email",
                    buttonText: "Notify Me"
                  }
                }
              }
            ],
            isBody: !0
          }
        ]
      },
      {
        label: "Global",
        name: "global",
        path: "content/global",
        format: "json",
        ui: {
          global: !0
        },
        fields: [
          {
            type: "object",
            label: "Header",
            name: "header",
            fields: [
              I4,
              {
                type: "string",
                label: "Name",
                name: "name"
              },
              {
                type: "string",
                label: "Color",
                name: "color",
                options: [
                  { label: "Default", value: "default" },
                  { label: "Primary", value: "primary" }
                ]
              },
              {
                type: "object",
                label: "Nav Links",
                name: "nav",
                list: !0,
                ui: {
                  itemProps: (t) => ({ label: t == null ? void 0 : t.label }),
                  defaultItem: {
                    href: "home",
                    label: "Home"
                  }
                },
                fields: [
                  {
                    type: "string",
                    label: "Link",
                    name: "href"
                  },
                  {
                    type: "string",
                    label: "Label",
                    name: "label"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            label: "Footer",
            name: "footer",
            fields: [
              {
                type: "string",
                label: "Color",
                name: "color",
                options: [
                  { label: "Default", value: "default" },
                  { label: "Primary", value: "primary" }
                ]
              },
              {
                type: "object",
                label: "Social Links",
                name: "social",
                fields: [
                  {
                    type: "string",
                    label: "Facebook",
                    name: "facebook"
                  },
                  {
                    type: "string",
                    label: "Twitter",
                    name: "twitter"
                  },
                  {
                    type: "string",
                    label: "Instagram",
                    name: "instagram"
                  },
                  {
                    type: "string",
                    label: "Github",
                    name: "github"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            label: "Theme",
            name: "theme",
            fields: [
              {
                type: "string",
                label: "Primary Color",
                name: "color",
                ui: {
                  component: x4
                }
              },
              {
                type: "string",
                name: "font",
                label: "Font Family",
                options: [
                  {
                    label: "System Sans",
                    value: "sans"
                  },
                  {
                    label: "Nunito",
                    value: "nunito"
                  },
                  {
                    label: "Lato",
                    value: "lato"
                  }
                ]
              },
              {
                type: "string",
                name: "darkMode",
                label: "Dark Mode",
                options: [
                  {
                    label: "System",
                    value: "system"
                  },
                  {
                    label: "Light",
                    value: "light"
                  },
                  {
                    label: "Dark",
                    value: "dark"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: "Authors",
        name: "author",
        path: "content/authors",
        format: "md",
        fields: [
          {
            type: "string",
            label: "Name",
            name: "name",
            isTitle: !0,
            required: !0
          },
          {
            type: "string",
            label: "Avatar",
            name: "avatar"
          }
        ]
      },
      {
        label: "Pages",
        name: "page",
        path: "content/pages",
        ui: {
          router: ({ document: t }) => {
            if (t._sys.filename === "home")
              return "/";
            if (t._sys.filename === "about")
              return "/about";
          }
        },
        fields: [
          {
            type: "string",
            label: "Title",
            name: "title",
            description: "The title of the page. This is used to display the title in the CMS",
            isTitle: !0,
            required: !0
          },
          {
            type: "object",
            list: !0,
            name: "blocks",
            label: "Sections",
            templateKey: "toot",
            ui: {
              visualSelector: !0
            },
            templates: [
              gu,
              du,
              uu,
              fu
            ]
          }
        ]
      }
    ]
  }
});
export {
  Bu as default
};
