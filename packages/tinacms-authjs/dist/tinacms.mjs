import require$$0 from "react";
import { AbstractAuthProvider } from "tinacms";
var react = {};
var interopRequireDefault = { exports: {} };
(function(module) {
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
      "default": e
    };
  }
  module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(interopRequireDefault);
var interopRequireDefaultExports = interopRequireDefault.exports;
var _typeof = { exports: {} };
(function(module) {
  function _typeof2(o) {
    "@babel/helpers - typeof";
    return module.exports = _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof2(o);
  }
  module.exports = _typeof2, module.exports.__esModule = true, module.exports["default"] = module.exports;
})(_typeof);
var _typeofExports = _typeof.exports;
var regeneratorRuntime$1 = { exports: {} };
var hasRequiredRegeneratorRuntime;
function requireRegeneratorRuntime() {
  if (hasRequiredRegeneratorRuntime)
    return regeneratorRuntime$1.exports;
  hasRequiredRegeneratorRuntime = 1;
  (function(module) {
    var _typeof2 = _typeofExports["default"];
    function _regeneratorRuntime() {
      module.exports = _regeneratorRuntime = function _regeneratorRuntime2() {
        return e;
      }, module.exports.__esModule = true, module.exports["default"] = module.exports;
      var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function(t2, e2, r2) {
        t2[e2] = r2.value;
      }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag";
      function define(t2, e2, r2) {
        return Object.defineProperty(t2, e2, {
          value: r2,
          enumerable: true,
          configurable: true,
          writable: true
        }), t2[e2];
      }
      try {
        define({}, "");
      } catch (t2) {
        define = function define2(t3, e2, r2) {
          return t3[e2] = r2;
        };
      }
      function wrap(t2, e2, r2, n2) {
        var i2 = e2 && e2.prototype instanceof Generator ? e2 : Generator, a2 = Object.create(i2.prototype), c2 = new Context(n2 || []);
        return o(a2, "_invoke", {
          value: makeInvokeMethod(t2, r2, c2)
        }), a2;
      }
      function tryCatch(t2, e2, r2) {
        try {
          return {
            type: "normal",
            arg: t2.call(e2, r2)
          };
        } catch (t3) {
          return {
            type: "throw",
            arg: t3
          };
        }
      }
      e.wrap = wrap;
      var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {};
      function Generator() {
      }
      function GeneratorFunction() {
      }
      function GeneratorFunctionPrototype() {
      }
      var p = {};
      define(p, a, function() {
        return this;
      });
      var d = Object.getPrototypeOf, v = d && d(d(values([])));
      v && v !== r && n.call(v, a) && (p = v);
      var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
      function defineIteratorMethods(t2) {
        ["next", "throw", "return"].forEach(function(e2) {
          define(t2, e2, function(t3) {
            return this._invoke(e2, t3);
          });
        });
      }
      function AsyncIterator(t2, e2) {
        function invoke(r3, o2, i2, a2) {
          var c2 = tryCatch(t2[r3], t2, o2);
          if ("throw" !== c2.type) {
            var u2 = c2.arg, h2 = u2.value;
            return h2 && "object" == _typeof2(h2) && n.call(h2, "__await") ? e2.resolve(h2.__await).then(function(t3) {
              invoke("next", t3, i2, a2);
            }, function(t3) {
              invoke("throw", t3, i2, a2);
            }) : e2.resolve(h2).then(function(t3) {
              u2.value = t3, i2(u2);
            }, function(t3) {
              return invoke("throw", t3, i2, a2);
            });
          }
          a2(c2.arg);
        }
        var r2;
        o(this, "_invoke", {
          value: function value(t3, n2) {
            function callInvokeWithMethodAndArg() {
              return new e2(function(e3, r3) {
                invoke(t3, n2, e3, r3);
              });
            }
            return r2 = r2 ? r2.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
          }
        });
      }
      function makeInvokeMethod(e2, r2, n2) {
        var o2 = h;
        return function(i2, a2) {
          if (o2 === f)
            throw Error("Generator is already running");
          if (o2 === s) {
            if ("throw" === i2)
              throw a2;
            return {
              value: t,
              done: true
            };
          }
          for (n2.method = i2, n2.arg = a2; ; ) {
            var c2 = n2.delegate;
            if (c2) {
              var u2 = maybeInvokeDelegate(c2, n2);
              if (u2) {
                if (u2 === y)
                  continue;
                return u2;
              }
            }
            if ("next" === n2.method)
              n2.sent = n2._sent = n2.arg;
            else if ("throw" === n2.method) {
              if (o2 === h)
                throw o2 = s, n2.arg;
              n2.dispatchException(n2.arg);
            } else
              "return" === n2.method && n2.abrupt("return", n2.arg);
            o2 = f;
            var p2 = tryCatch(e2, r2, n2);
            if ("normal" === p2.type) {
              if (o2 = n2.done ? s : l, p2.arg === y)
                continue;
              return {
                value: p2.arg,
                done: n2.done
              };
            }
            "throw" === p2.type && (o2 = s, n2.method = "throw", n2.arg = p2.arg);
          }
        };
      }
      function maybeInvokeDelegate(e2, r2) {
        var n2 = r2.method, o2 = e2.iterator[n2];
        if (o2 === t)
          return r2.delegate = null, "throw" === n2 && e2.iterator["return"] && (r2.method = "return", r2.arg = t, maybeInvokeDelegate(e2, r2), "throw" === r2.method) || "return" !== n2 && (r2.method = "throw", r2.arg = new TypeError("The iterator does not provide a '" + n2 + "' method")), y;
        var i2 = tryCatch(o2, e2.iterator, r2.arg);
        if ("throw" === i2.type)
          return r2.method = "throw", r2.arg = i2.arg, r2.delegate = null, y;
        var a2 = i2.arg;
        return a2 ? a2.done ? (r2[e2.resultName] = a2.value, r2.next = e2.nextLoc, "return" !== r2.method && (r2.method = "next", r2.arg = t), r2.delegate = null, y) : a2 : (r2.method = "throw", r2.arg = new TypeError("iterator result is not an object"), r2.delegate = null, y);
      }
      function pushTryEntry(t2) {
        var e2 = {
          tryLoc: t2[0]
        };
        1 in t2 && (e2.catchLoc = t2[1]), 2 in t2 && (e2.finallyLoc = t2[2], e2.afterLoc = t2[3]), this.tryEntries.push(e2);
      }
      function resetTryEntry(t2) {
        var e2 = t2.completion || {};
        e2.type = "normal", delete e2.arg, t2.completion = e2;
      }
      function Context(t2) {
        this.tryEntries = [{
          tryLoc: "root"
        }], t2.forEach(pushTryEntry, this), this.reset(true);
      }
      function values(e2) {
        if (e2 || "" === e2) {
          var r2 = e2[a];
          if (r2)
            return r2.call(e2);
          if ("function" == typeof e2.next)
            return e2;
          if (!isNaN(e2.length)) {
            var o2 = -1, i2 = function next() {
              for (; ++o2 < e2.length; )
                if (n.call(e2, o2))
                  return next.value = e2[o2], next.done = false, next;
              return next.value = t, next.done = true, next;
            };
            return i2.next = i2;
          }
        }
        throw new TypeError(_typeof2(e2) + " is not iterable");
      }
      return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
        value: GeneratorFunctionPrototype,
        configurable: true
      }), o(GeneratorFunctionPrototype, "constructor", {
        value: GeneratorFunction,
        configurable: true
      }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function(t2) {
        var e2 = "function" == typeof t2 && t2.constructor;
        return !!e2 && (e2 === GeneratorFunction || "GeneratorFunction" === (e2.displayName || e2.name));
      }, e.mark = function(t2) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(t2, GeneratorFunctionPrototype) : (t2.__proto__ = GeneratorFunctionPrototype, define(t2, u, "GeneratorFunction")), t2.prototype = Object.create(g), t2;
      }, e.awrap = function(t2) {
        return {
          __await: t2
        };
      }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function() {
        return this;
      }), e.AsyncIterator = AsyncIterator, e.async = function(t2, r2, n2, o2, i2) {
        void 0 === i2 && (i2 = Promise);
        var a2 = new AsyncIterator(wrap(t2, r2, n2, o2), i2);
        return e.isGeneratorFunction(r2) ? a2 : a2.next().then(function(t3) {
          return t3.done ? t3.value : a2.next();
        });
      }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function() {
        return this;
      }), define(g, "toString", function() {
        return "[object Generator]";
      }), e.keys = function(t2) {
        var e2 = Object(t2), r2 = [];
        for (var n2 in e2)
          r2.push(n2);
        return r2.reverse(), function next() {
          for (; r2.length; ) {
            var t3 = r2.pop();
            if (t3 in e2)
              return next.value = t3, next.done = false, next;
          }
          return next.done = true, next;
        };
      }, e.values = values, Context.prototype = {
        constructor: Context,
        reset: function reset(e2) {
          if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = false, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e2)
            for (var r2 in this)
              "t" === r2.charAt(0) && n.call(this, r2) && !isNaN(+r2.slice(1)) && (this[r2] = t);
        },
        stop: function stop() {
          this.done = true;
          var t2 = this.tryEntries[0].completion;
          if ("throw" === t2.type)
            throw t2.arg;
          return this.rval;
        },
        dispatchException: function dispatchException(e2) {
          if (this.done)
            throw e2;
          var r2 = this;
          function handle(n2, o3) {
            return a2.type = "throw", a2.arg = e2, r2.next = n2, o3 && (r2.method = "next", r2.arg = t), !!o3;
          }
          for (var o2 = this.tryEntries.length - 1; o2 >= 0; --o2) {
            var i2 = this.tryEntries[o2], a2 = i2.completion;
            if ("root" === i2.tryLoc)
              return handle("end");
            if (i2.tryLoc <= this.prev) {
              var c2 = n.call(i2, "catchLoc"), u2 = n.call(i2, "finallyLoc");
              if (c2 && u2) {
                if (this.prev < i2.catchLoc)
                  return handle(i2.catchLoc, true);
                if (this.prev < i2.finallyLoc)
                  return handle(i2.finallyLoc);
              } else if (c2) {
                if (this.prev < i2.catchLoc)
                  return handle(i2.catchLoc, true);
              } else {
                if (!u2)
                  throw Error("try statement without catch or finally");
                if (this.prev < i2.finallyLoc)
                  return handle(i2.finallyLoc);
              }
            }
          }
        },
        abrupt: function abrupt(t2, e2) {
          for (var r2 = this.tryEntries.length - 1; r2 >= 0; --r2) {
            var o2 = this.tryEntries[r2];
            if (o2.tryLoc <= this.prev && n.call(o2, "finallyLoc") && this.prev < o2.finallyLoc) {
              var i2 = o2;
              break;
            }
          }
          i2 && ("break" === t2 || "continue" === t2) && i2.tryLoc <= e2 && e2 <= i2.finallyLoc && (i2 = null);
          var a2 = i2 ? i2.completion : {};
          return a2.type = t2, a2.arg = e2, i2 ? (this.method = "next", this.next = i2.finallyLoc, y) : this.complete(a2);
        },
        complete: function complete(t2, e2) {
          if ("throw" === t2.type)
            throw t2.arg;
          return "break" === t2.type || "continue" === t2.type ? this.next = t2.arg : "return" === t2.type ? (this.rval = this.arg = t2.arg, this.method = "return", this.next = "end") : "normal" === t2.type && e2 && (this.next = e2), y;
        },
        finish: function finish(t2) {
          for (var e2 = this.tryEntries.length - 1; e2 >= 0; --e2) {
            var r2 = this.tryEntries[e2];
            if (r2.finallyLoc === t2)
              return this.complete(r2.completion, r2.afterLoc), resetTryEntry(r2), y;
          }
        },
        "catch": function _catch(t2) {
          for (var e2 = this.tryEntries.length - 1; e2 >= 0; --e2) {
            var r2 = this.tryEntries[e2];
            if (r2.tryLoc === t2) {
              var n2 = r2.completion;
              if ("throw" === n2.type) {
                var o2 = n2.arg;
                resetTryEntry(r2);
              }
              return o2;
            }
          }
          throw Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(e2, r2, n2) {
          return this.delegate = {
            iterator: values(e2),
            resultName: r2,
            nextLoc: n2
          }, "next" === this.method && (this.arg = t), y;
        }
      }, e;
    }
    module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(regeneratorRuntime$1);
  return regeneratorRuntime$1.exports;
}
var regenerator;
var hasRequiredRegenerator;
function requireRegenerator() {
  if (hasRequiredRegenerator)
    return regenerator;
  hasRequiredRegenerator = 1;
  var runtime = requireRegeneratorRuntime()();
  regenerator = runtime;
  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    if (typeof globalThis === "object") {
      globalThis.regeneratorRuntime = runtime;
    } else {
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  }
  return regenerator;
}
var defineProperty = { exports: {} };
var toPropertyKey = { exports: {} };
var toPrimitive = { exports: {} };
var hasRequiredToPrimitive;
function requireToPrimitive() {
  if (hasRequiredToPrimitive)
    return toPrimitive.exports;
  hasRequiredToPrimitive = 1;
  (function(module) {
    var _typeof2 = _typeofExports["default"];
    function toPrimitive2(t, r) {
      if ("object" != _typeof2(t) || !t)
        return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof2(i))
          return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    module.exports = toPrimitive2, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(toPrimitive);
  return toPrimitive.exports;
}
var hasRequiredToPropertyKey;
function requireToPropertyKey() {
  if (hasRequiredToPropertyKey)
    return toPropertyKey.exports;
  hasRequiredToPropertyKey = 1;
  (function(module) {
    var _typeof2 = _typeofExports["default"];
    var toPrimitive2 = requireToPrimitive();
    function toPropertyKey2(t) {
      var i = toPrimitive2(t, "string");
      return "symbol" == _typeof2(i) ? i : i + "";
    }
    module.exports = toPropertyKey2, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(toPropertyKey);
  return toPropertyKey.exports;
}
var hasRequiredDefineProperty;
function requireDefineProperty() {
  if (hasRequiredDefineProperty)
    return defineProperty.exports;
  hasRequiredDefineProperty = 1;
  (function(module) {
    var toPropertyKey2 = requireToPropertyKey();
    function _defineProperty(e, r, t) {
      return (r = toPropertyKey2(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: true,
        configurable: true,
        writable: true
      }) : e[r] = t, e;
    }
    module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(defineProperty);
  return defineProperty.exports;
}
var asyncToGenerator = { exports: {} };
var hasRequiredAsyncToGenerator;
function requireAsyncToGenerator() {
  if (hasRequiredAsyncToGenerator)
    return asyncToGenerator.exports;
  hasRequiredAsyncToGenerator = 1;
  (function(module) {
    function asyncGeneratorStep(n, t, e, r, o, a, c) {
      try {
        var i = n[a](c), u = i.value;
      } catch (n2) {
        return void e(n2);
      }
      i.done ? t(u) : Promise.resolve(u).then(r, o);
    }
    function _asyncToGenerator(n) {
      return function() {
        var t = this, e = arguments;
        return new Promise(function(r, o) {
          var a = n.apply(t, e);
          function _next(n2) {
            asyncGeneratorStep(a, r, o, _next, _throw, "next", n2);
          }
          function _throw(n2) {
            asyncGeneratorStep(a, r, o, _next, _throw, "throw", n2);
          }
          _next(void 0);
        });
      };
    }
    module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(asyncToGenerator);
  return asyncToGenerator.exports;
}
var slicedToArray = { exports: {} };
var arrayWithHoles = { exports: {} };
var hasRequiredArrayWithHoles;
function requireArrayWithHoles() {
  if (hasRequiredArrayWithHoles)
    return arrayWithHoles.exports;
  hasRequiredArrayWithHoles = 1;
  (function(module) {
    function _arrayWithHoles(r) {
      if (Array.isArray(r))
        return r;
    }
    module.exports = _arrayWithHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(arrayWithHoles);
  return arrayWithHoles.exports;
}
var iterableToArrayLimit = { exports: {} };
var hasRequiredIterableToArrayLimit;
function requireIterableToArrayLimit() {
  if (hasRequiredIterableToArrayLimit)
    return iterableToArrayLimit.exports;
  hasRequiredIterableToArrayLimit = 1;
  (function(module) {
    function _iterableToArrayLimit(r, l) {
      var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (null != t) {
        var e, n, i, u, a = [], f = true, o = false;
        try {
          if (i = (t = t.call(r)).next, 0 === l) {
            if (Object(t) !== t)
              return;
            f = false;
          } else
            for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true)
              ;
        } catch (r2) {
          o = true, n = r2;
        } finally {
          try {
            if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u))
              return;
          } finally {
            if (o)
              throw n;
          }
        }
        return a;
      }
    }
    module.exports = _iterableToArrayLimit, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(iterableToArrayLimit);
  return iterableToArrayLimit.exports;
}
var unsupportedIterableToArray = { exports: {} };
var arrayLikeToArray = { exports: {} };
var hasRequiredArrayLikeToArray;
function requireArrayLikeToArray() {
  if (hasRequiredArrayLikeToArray)
    return arrayLikeToArray.exports;
  hasRequiredArrayLikeToArray = 1;
  (function(module) {
    function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++)
        n[e] = r[e];
      return n;
    }
    module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(arrayLikeToArray);
  return arrayLikeToArray.exports;
}
var hasRequiredUnsupportedIterableToArray;
function requireUnsupportedIterableToArray() {
  if (hasRequiredUnsupportedIterableToArray)
    return unsupportedIterableToArray.exports;
  hasRequiredUnsupportedIterableToArray = 1;
  (function(module) {
    var arrayLikeToArray2 = requireArrayLikeToArray();
    function _unsupportedIterableToArray(r, a) {
      if (r) {
        if ("string" == typeof r)
          return arrayLikeToArray2(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? arrayLikeToArray2(r, a) : void 0;
      }
    }
    module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(unsupportedIterableToArray);
  return unsupportedIterableToArray.exports;
}
var nonIterableRest = { exports: {} };
var hasRequiredNonIterableRest;
function requireNonIterableRest() {
  if (hasRequiredNonIterableRest)
    return nonIterableRest.exports;
  hasRequiredNonIterableRest = 1;
  (function(module) {
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    module.exports = _nonIterableRest, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(nonIterableRest);
  return nonIterableRest.exports;
}
var hasRequiredSlicedToArray;
function requireSlicedToArray() {
  if (hasRequiredSlicedToArray)
    return slicedToArray.exports;
  hasRequiredSlicedToArray = 1;
  (function(module) {
    var arrayWithHoles2 = requireArrayWithHoles();
    var iterableToArrayLimit2 = requireIterableToArrayLimit();
    var unsupportedIterableToArray2 = requireUnsupportedIterableToArray();
    var nonIterableRest2 = requireNonIterableRest();
    function _slicedToArray(r, e) {
      return arrayWithHoles2(r) || iterableToArrayLimit2(r, e) || unsupportedIterableToArray2(r, e) || nonIterableRest2();
    }
    module.exports = _slicedToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(slicedToArray);
  return slicedToArray.exports;
}
var logger = {};
var errors = {};
var assertThisInitialized = { exports: {} };
var hasRequiredAssertThisInitialized;
function requireAssertThisInitialized() {
  if (hasRequiredAssertThisInitialized)
    return assertThisInitialized.exports;
  hasRequiredAssertThisInitialized = 1;
  (function(module) {
    function _assertThisInitialized(e) {
      if (void 0 === e)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return e;
    }
    module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(assertThisInitialized);
  return assertThisInitialized.exports;
}
var classCallCheck = { exports: {} };
var hasRequiredClassCallCheck;
function requireClassCallCheck() {
  if (hasRequiredClassCallCheck)
    return classCallCheck.exports;
  hasRequiredClassCallCheck = 1;
  (function(module) {
    function _classCallCheck(a, n) {
      if (!(a instanceof n))
        throw new TypeError("Cannot call a class as a function");
    }
    module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(classCallCheck);
  return classCallCheck.exports;
}
var createClass = { exports: {} };
var hasRequiredCreateClass;
function requireCreateClass() {
  if (hasRequiredCreateClass)
    return createClass.exports;
  hasRequiredCreateClass = 1;
  (function(module) {
    var toPropertyKey2 = requireToPropertyKey();
    function _defineProperties(e, r) {
      for (var t = 0; t < r.length; t++) {
        var o = r[t];
        o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey2(o.key), o);
      }
    }
    function _createClass(e, r, t) {
      return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
        writable: false
      }), e;
    }
    module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(createClass);
  return createClass.exports;
}
var inherits = { exports: {} };
var setPrototypeOf = { exports: {} };
var hasRequiredSetPrototypeOf;
function requireSetPrototypeOf() {
  if (hasRequiredSetPrototypeOf)
    return setPrototypeOf.exports;
  hasRequiredSetPrototypeOf = 1;
  (function(module) {
    function _setPrototypeOf(t, e) {
      return module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
        return t2.__proto__ = e2, t2;
      }, module.exports.__esModule = true, module.exports["default"] = module.exports, _setPrototypeOf(t, e);
    }
    module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(setPrototypeOf);
  return setPrototypeOf.exports;
}
var hasRequiredInherits;
function requireInherits() {
  if (hasRequiredInherits)
    return inherits.exports;
  hasRequiredInherits = 1;
  (function(module) {
    var setPrototypeOf2 = requireSetPrototypeOf();
    function _inherits(t, e) {
      if ("function" != typeof e && null !== e)
        throw new TypeError("Super expression must either be null or a function");
      t.prototype = Object.create(e && e.prototype, {
        constructor: {
          value: t,
          writable: true,
          configurable: true
        }
      }), Object.defineProperty(t, "prototype", {
        writable: false
      }), e && setPrototypeOf2(t, e);
    }
    module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(inherits);
  return inherits.exports;
}
var possibleConstructorReturn = { exports: {} };
var hasRequiredPossibleConstructorReturn;
function requirePossibleConstructorReturn() {
  if (hasRequiredPossibleConstructorReturn)
    return possibleConstructorReturn.exports;
  hasRequiredPossibleConstructorReturn = 1;
  (function(module) {
    var _typeof2 = _typeofExports["default"];
    var assertThisInitialized2 = requireAssertThisInitialized();
    function _possibleConstructorReturn(t, e) {
      if (e && ("object" == _typeof2(e) || "function" == typeof e))
        return e;
      if (void 0 !== e)
        throw new TypeError("Derived constructors may only return object or undefined");
      return assertThisInitialized2(t);
    }
    module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(possibleConstructorReturn);
  return possibleConstructorReturn.exports;
}
var getPrototypeOf = { exports: {} };
var hasRequiredGetPrototypeOf;
function requireGetPrototypeOf() {
  if (hasRequiredGetPrototypeOf)
    return getPrototypeOf.exports;
  hasRequiredGetPrototypeOf = 1;
  (function(module) {
    function _getPrototypeOf(t) {
      return module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
        return t2.__proto__ || Object.getPrototypeOf(t2);
      }, module.exports.__esModule = true, module.exports["default"] = module.exports, _getPrototypeOf(t);
    }
    module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(getPrototypeOf);
  return getPrototypeOf.exports;
}
var wrapNativeSuper = { exports: {} };
var isNativeFunction = { exports: {} };
var hasRequiredIsNativeFunction;
function requireIsNativeFunction() {
  if (hasRequiredIsNativeFunction)
    return isNativeFunction.exports;
  hasRequiredIsNativeFunction = 1;
  (function(module) {
    function _isNativeFunction(t) {
      try {
        return -1 !== Function.toString.call(t).indexOf("[native code]");
      } catch (n) {
        return "function" == typeof t;
      }
    }
    module.exports = _isNativeFunction, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(isNativeFunction);
  return isNativeFunction.exports;
}
var construct = { exports: {} };
var isNativeReflectConstruct = { exports: {} };
var hasRequiredIsNativeReflectConstruct;
function requireIsNativeReflectConstruct() {
  if (hasRequiredIsNativeReflectConstruct)
    return isNativeReflectConstruct.exports;
  hasRequiredIsNativeReflectConstruct = 1;
  (function(module) {
    function _isNativeReflectConstruct() {
      try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
        }));
      } catch (t2) {
      }
      return (module.exports = _isNativeReflectConstruct = function _isNativeReflectConstruct2() {
        return !!t;
      }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
    }
    module.exports = _isNativeReflectConstruct, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(isNativeReflectConstruct);
  return isNativeReflectConstruct.exports;
}
var hasRequiredConstruct;
function requireConstruct() {
  if (hasRequiredConstruct)
    return construct.exports;
  hasRequiredConstruct = 1;
  (function(module) {
    var isNativeReflectConstruct2 = requireIsNativeReflectConstruct();
    var setPrototypeOf2 = requireSetPrototypeOf();
    function _construct(t, e, r) {
      if (isNativeReflectConstruct2())
        return Reflect.construct.apply(null, arguments);
      var o = [null];
      o.push.apply(o, e);
      var p = new (t.bind.apply(t, o))();
      return r && setPrototypeOf2(p, r.prototype), p;
    }
    module.exports = _construct, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(construct);
  return construct.exports;
}
var hasRequiredWrapNativeSuper;
function requireWrapNativeSuper() {
  if (hasRequiredWrapNativeSuper)
    return wrapNativeSuper.exports;
  hasRequiredWrapNativeSuper = 1;
  (function(module) {
    var getPrototypeOf2 = requireGetPrototypeOf();
    var setPrototypeOf2 = requireSetPrototypeOf();
    var isNativeFunction2 = requireIsNativeFunction();
    var construct2 = requireConstruct();
    function _wrapNativeSuper(t) {
      var r = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
      return module.exports = _wrapNativeSuper = function _wrapNativeSuper2(t2) {
        if (null === t2 || !isNativeFunction2(t2))
          return t2;
        if ("function" != typeof t2)
          throw new TypeError("Super expression must either be null or a function");
        if (void 0 !== r) {
          if (r.has(t2))
            return r.get(t2);
          r.set(t2, Wrapper);
        }
        function Wrapper() {
          return construct2(t2, arguments, getPrototypeOf2(this).constructor);
        }
        return Wrapper.prototype = Object.create(t2.prototype, {
          constructor: {
            value: Wrapper,
            enumerable: false,
            writable: true,
            configurable: true
          }
        }), setPrototypeOf2(Wrapper, t2);
      }, module.exports.__esModule = true, module.exports["default"] = module.exports, _wrapNativeSuper(t);
    }
    module.exports = _wrapNativeSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;
  })(wrapNativeSuper);
  return wrapNativeSuper.exports;
}
var hasRequiredErrors;
function requireErrors() {
  if (hasRequiredErrors)
    return errors;
  hasRequiredErrors = 1;
  var _interopRequireDefault = interopRequireDefaultExports;
  Object.defineProperty(errors, "__esModule", {
    value: true
  });
  errors.UnsupportedStrategy = errors.UnknownError = errors.OAuthCallbackError = errors.MissingSecret = errors.MissingAuthorize = errors.MissingAdapterMethods = errors.MissingAdapter = errors.MissingAPIRoute = errors.InvalidCallbackUrl = errors.AccountNotLinkedError = void 0;
  errors.adapterErrorHandler = adapterErrorHandler;
  errors.capitalize = capitalize;
  errors.eventsErrorHandler = eventsErrorHandler;
  errors.upperSnake = upperSnake;
  var _regenerator = _interopRequireDefault(requireRegenerator());
  var _asyncToGenerator2 = _interopRequireDefault(requireAsyncToGenerator());
  var _assertThisInitialized2 = _interopRequireDefault(requireAssertThisInitialized());
  var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
  var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());
  var _createClass2 = _interopRequireDefault(requireCreateClass());
  var _inherits2 = _interopRequireDefault(requireInherits());
  var _possibleConstructorReturn2 = _interopRequireDefault(requirePossibleConstructorReturn());
  var _getPrototypeOf2 = _interopRequireDefault(requireGetPrototypeOf());
  var _wrapNativeSuper2 = _interopRequireDefault(requireWrapNativeSuper());
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = (0, _getPrototypeOf2.default)(Derived), result;
      if (hasNativeReflectConstruct) {
        var NewTarget = (0, _getPrototypeOf2.default)(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return (0, _possibleConstructorReturn2.default)(this, result);
    };
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct)
      return false;
    if (Reflect.construct.sham)
      return false;
    if (typeof Proxy === "function")
      return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
      return true;
    } catch (e) {
      return false;
    }
  }
  var UnknownError = function(_Error) {
    (0, _inherits2.default)(UnknownError2, _Error);
    var _super = _createSuper(UnknownError2);
    function UnknownError2(error) {
      var _message;
      var _this;
      (0, _classCallCheck2.default)(this, UnknownError2);
      _this = _super.call(this, (_message = error === null || error === void 0 ? void 0 : error.message) !== null && _message !== void 0 ? _message : error);
      _this.name = "UnknownError";
      _this.code = error.code;
      if (error instanceof Error) {
        _this.stack = error.stack;
      }
      return _this;
    }
    (0, _createClass2.default)(UnknownError2, [{
      key: "toJSON",
      value: function toJSON() {
        return {
          name: this.name,
          message: this.message,
          stack: this.stack
        };
      }
    }]);
    return UnknownError2;
  }((0, _wrapNativeSuper2.default)(Error));
  errors.UnknownError = UnknownError;
  var OAuthCallbackError = function(_UnknownError) {
    (0, _inherits2.default)(OAuthCallbackError2, _UnknownError);
    var _super2 = _createSuper(OAuthCallbackError2);
    function OAuthCallbackError2() {
      var _this2;
      (0, _classCallCheck2.default)(this, OAuthCallbackError2);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this2 = _super2.call.apply(_super2, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "name", "OAuthCallbackError");
      return _this2;
    }
    return (0, _createClass2.default)(OAuthCallbackError2);
  }(UnknownError);
  errors.OAuthCallbackError = OAuthCallbackError;
  var AccountNotLinkedError = function(_UnknownError2) {
    (0, _inherits2.default)(AccountNotLinkedError2, _UnknownError2);
    var _super3 = _createSuper(AccountNotLinkedError2);
    function AccountNotLinkedError2() {
      var _this3;
      (0, _classCallCheck2.default)(this, AccountNotLinkedError2);
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      _this3 = _super3.call.apply(_super3, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this3), "name", "AccountNotLinkedError");
      return _this3;
    }
    return (0, _createClass2.default)(AccountNotLinkedError2);
  }(UnknownError);
  errors.AccountNotLinkedError = AccountNotLinkedError;
  var MissingAPIRoute = function(_UnknownError3) {
    (0, _inherits2.default)(MissingAPIRoute2, _UnknownError3);
    var _super4 = _createSuper(MissingAPIRoute2);
    function MissingAPIRoute2() {
      var _this4;
      (0, _classCallCheck2.default)(this, MissingAPIRoute2);
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      _this4 = _super4.call.apply(_super4, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this4), "name", "MissingAPIRouteError");
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this4), "code", "MISSING_NEXTAUTH_API_ROUTE_ERROR");
      return _this4;
    }
    return (0, _createClass2.default)(MissingAPIRoute2);
  }(UnknownError);
  errors.MissingAPIRoute = MissingAPIRoute;
  var MissingSecret = function(_UnknownError4) {
    (0, _inherits2.default)(MissingSecret2, _UnknownError4);
    var _super5 = _createSuper(MissingSecret2);
    function MissingSecret2() {
      var _this5;
      (0, _classCallCheck2.default)(this, MissingSecret2);
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      _this5 = _super5.call.apply(_super5, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this5), "name", "MissingSecretError");
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this5), "code", "NO_SECRET");
      return _this5;
    }
    return (0, _createClass2.default)(MissingSecret2);
  }(UnknownError);
  errors.MissingSecret = MissingSecret;
  var MissingAuthorize = function(_UnknownError5) {
    (0, _inherits2.default)(MissingAuthorize2, _UnknownError5);
    var _super6 = _createSuper(MissingAuthorize2);
    function MissingAuthorize2() {
      var _this6;
      (0, _classCallCheck2.default)(this, MissingAuthorize2);
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      _this6 = _super6.call.apply(_super6, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this6), "name", "MissingAuthorizeError");
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this6), "code", "CALLBACK_CREDENTIALS_HANDLER_ERROR");
      return _this6;
    }
    return (0, _createClass2.default)(MissingAuthorize2);
  }(UnknownError);
  errors.MissingAuthorize = MissingAuthorize;
  var MissingAdapter = function(_UnknownError6) {
    (0, _inherits2.default)(MissingAdapter2, _UnknownError6);
    var _super7 = _createSuper(MissingAdapter2);
    function MissingAdapter2() {
      var _this7;
      (0, _classCallCheck2.default)(this, MissingAdapter2);
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      _this7 = _super7.call.apply(_super7, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this7), "name", "MissingAdapterError");
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this7), "code", "EMAIL_REQUIRES_ADAPTER_ERROR");
      return _this7;
    }
    return (0, _createClass2.default)(MissingAdapter2);
  }(UnknownError);
  errors.MissingAdapter = MissingAdapter;
  var MissingAdapterMethods = function(_UnknownError7) {
    (0, _inherits2.default)(MissingAdapterMethods2, _UnknownError7);
    var _super8 = _createSuper(MissingAdapterMethods2);
    function MissingAdapterMethods2() {
      var _this8;
      (0, _classCallCheck2.default)(this, MissingAdapterMethods2);
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      _this8 = _super8.call.apply(_super8, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this8), "name", "MissingAdapterMethodsError");
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this8), "code", "MISSING_ADAPTER_METHODS_ERROR");
      return _this8;
    }
    return (0, _createClass2.default)(MissingAdapterMethods2);
  }(UnknownError);
  errors.MissingAdapterMethods = MissingAdapterMethods;
  var UnsupportedStrategy = function(_UnknownError8) {
    (0, _inherits2.default)(UnsupportedStrategy2, _UnknownError8);
    var _super9 = _createSuper(UnsupportedStrategy2);
    function UnsupportedStrategy2() {
      var _this9;
      (0, _classCallCheck2.default)(this, UnsupportedStrategy2);
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }
      _this9 = _super9.call.apply(_super9, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this9), "name", "UnsupportedStrategyError");
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this9), "code", "CALLBACK_CREDENTIALS_JWT_ERROR");
      return _this9;
    }
    return (0, _createClass2.default)(UnsupportedStrategy2);
  }(UnknownError);
  errors.UnsupportedStrategy = UnsupportedStrategy;
  var InvalidCallbackUrl = function(_UnknownError9) {
    (0, _inherits2.default)(InvalidCallbackUrl2, _UnknownError9);
    var _super10 = _createSuper(InvalidCallbackUrl2);
    function InvalidCallbackUrl2() {
      var _this10;
      (0, _classCallCheck2.default)(this, InvalidCallbackUrl2);
      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }
      _this10 = _super10.call.apply(_super10, [this].concat(args));
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this10), "name", "InvalidCallbackUrl");
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this10), "code", "INVALID_CALLBACK_URL_ERROR");
      return _this10;
    }
    return (0, _createClass2.default)(InvalidCallbackUrl2);
  }(UnknownError);
  errors.InvalidCallbackUrl = InvalidCallbackUrl;
  function upperSnake(s) {
    return s.replace(/([A-Z])/g, "_$1").toUpperCase();
  }
  function capitalize(s) {
    return "".concat(s[0].toUpperCase()).concat(s.slice(1));
  }
  function eventsErrorHandler(methods, logger2) {
    return Object.keys(methods).reduce(function(acc, name) {
      acc[name] = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
        var method, _args = arguments;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                method = methods[name];
                _context.next = 4;
                return method.apply(void 0, _args);
              case 4:
                return _context.abrupt("return", _context.sent);
              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](0);
                logger2.error("".concat(upperSnake(name), "_EVENT_ERROR"), _context.t0);
              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 7]]);
      }));
      return acc;
    }, {});
  }
  function adapterErrorHandler(adapter, logger2) {
    if (!adapter)
      return;
    return Object.keys(adapter).reduce(function(acc, name) {
      acc[name] = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
        var _len10, args, _key10, method, e, _args2 = arguments;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                for (_len10 = _args2.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                  args[_key10] = _args2[_key10];
                }
                logger2.debug("adapter_".concat(name), {
                  args
                });
                method = adapter[name];
                _context2.next = 6;
                return method.apply(void 0, args);
              case 6:
                return _context2.abrupt("return", _context2.sent);
              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](0);
                logger2.error("adapter_error_".concat(name), _context2.t0);
                e = new UnknownError(_context2.t0);
                e.name = "".concat(capitalize(name), "Error");
                throw e;
              case 15:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 9]]);
      }));
      return acc;
    }, {});
  }
  return errors;
}
var hasRequiredLogger;
function requireLogger() {
  if (hasRequiredLogger)
    return logger;
  hasRequiredLogger = 1;
  var _interopRequireDefault = interopRequireDefaultExports;
  Object.defineProperty(logger, "__esModule", {
    value: true
  });
  logger.default = void 0;
  logger.proxyLogger = proxyLogger;
  logger.setLogger = setLogger;
  var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
  var _errors = requireErrors();
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        (0, _defineProperty2.default)(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function formatError(o) {
    if (o instanceof Error && !(o instanceof _errors.UnknownError)) {
      return {
        message: o.message,
        stack: o.stack,
        name: o.name
      };
    }
    if (hasErrorProperty(o)) {
      var _o$message;
      o.error = formatError(o.error);
      o.message = (_o$message = o.message) !== null && _o$message !== void 0 ? _o$message : o.error.message;
    }
    return o;
  }
  function hasErrorProperty(x) {
    return !!(x !== null && x !== void 0 && x.error);
  }
  var _logger = {
    error: function error(code, metadata) {
      metadata = formatError(metadata);
      console.error("[next-auth][error][".concat(code, "]"), "\nhttps://next-auth.js.org/errors#".concat(code.toLowerCase()), metadata.message, metadata);
    },
    warn: function warn(code) {
      console.warn("[next-auth][warn][".concat(code, "]"), "\nhttps://next-auth.js.org/warnings#".concat(code.toLowerCase()));
    },
    debug: function debug(code, metadata) {
      console.log("[next-auth][debug][".concat(code, "]"), metadata);
    }
  };
  function setLogger() {
    var newLogger = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var debug = arguments.length > 1 ? arguments[1] : void 0;
    if (!debug)
      _logger.debug = function() {
      };
    if (newLogger.error)
      _logger.error = newLogger.error;
    if (newLogger.warn)
      _logger.warn = newLogger.warn;
    if (newLogger.debug)
      _logger.debug = newLogger.debug;
  }
  var _default = _logger;
  logger.default = _default;
  function proxyLogger() {
    var logger2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : _logger;
    var basePath = arguments.length > 1 ? arguments[1] : void 0;
    try {
      if (typeof window === "undefined") {
        return logger2;
      }
      var clientLogger = {};
      var _loop = function _loop2(level2) {
        clientLogger[level2] = function(code, metadata) {
          _logger[level2](code, metadata);
          if (level2 === "error") {
            metadata = formatError(metadata);
          }
          ;
          metadata.client = true;
          var url = "".concat(basePath, "/_log");
          var body = new URLSearchParams(_objectSpread({
            level: level2,
            code
          }, metadata));
          if (navigator.sendBeacon) {
            return navigator.sendBeacon(url, body);
          }
          return fetch(url, {
            method: "POST",
            body,
            keepalive: true
          });
        };
      };
      for (var level in logger2) {
        _loop(level);
      }
      return clientLogger;
    } catch (_unused) {
      return _logger;
    }
  }
  return logger;
}
var parseUrl = {};
var hasRequiredParseUrl;
function requireParseUrl() {
  if (hasRequiredParseUrl)
    return parseUrl;
  hasRequiredParseUrl = 1;
  Object.defineProperty(parseUrl, "__esModule", {
    value: true
  });
  parseUrl.default = parseUrl$1;
  function parseUrl$1(url) {
    var _url2;
    const defaultUrl = new URL("http://localhost:3000/api/auth");
    if (url && !url.startsWith("http")) {
      url = `https://${url}`;
    }
    const _url = new URL((_url2 = url) !== null && _url2 !== void 0 ? _url2 : defaultUrl);
    const path = (_url.pathname === "/" ? defaultUrl.pathname : _url.pathname).replace(/\/$/, "");
    const base = `${_url.origin}${path}`;
    return {
      origin: _url.origin,
      host: _url.host,
      path,
      base,
      toString: () => base
    };
  }
  return parseUrl;
}
var _utils = {};
var hasRequired_utils;
function require_utils() {
  if (hasRequired_utils)
    return _utils;
  hasRequired_utils = 1;
  var _interopRequireDefault = interopRequireDefaultExports;
  Object.defineProperty(_utils, "__esModule", {
    value: true
  });
  _utils.BroadcastChannel = BroadcastChannel;
  _utils.apiBaseUrl = apiBaseUrl;
  _utils.fetchData = fetchData;
  _utils.now = now;
  var _regenerator = _interopRequireDefault(requireRegenerator());
  var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
  var _asyncToGenerator2 = _interopRequireDefault(requireAsyncToGenerator());
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        (0, _defineProperty2.default)(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function fetchData(_x, _x2, _x3) {
    return _fetchData.apply(this, arguments);
  }
  function _fetchData() {
    _fetchData = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(path, __NEXTAUTH, logger2) {
      var _ref, ctx, _ref$req, req, url, _req$headers, options, res, data, _args = arguments;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _ref = _args.length > 3 && _args[3] !== void 0 ? _args[3] : {}, ctx = _ref.ctx, _ref$req = _ref.req, req = _ref$req === void 0 ? ctx === null || ctx === void 0 ? void 0 : ctx.req : _ref$req;
              url = "".concat(apiBaseUrl(__NEXTAUTH), "/").concat(path);
              _context.prev = 2;
              options = {
                headers: _objectSpread({
                  "Content-Type": "application/json"
                }, req !== null && req !== void 0 && (_req$headers = req.headers) !== null && _req$headers !== void 0 && _req$headers.cookie ? {
                  cookie: req.headers.cookie
                } : {})
              };
              if (req !== null && req !== void 0 && req.body) {
                options.body = JSON.stringify(req.body);
                options.method = "POST";
              }
              _context.next = 7;
              return fetch(url, options);
            case 7:
              res = _context.sent;
              _context.next = 10;
              return res.json();
            case 10:
              data = _context.sent;
              if (res.ok) {
                _context.next = 13;
                break;
              }
              throw data;
            case 13:
              return _context.abrupt("return", Object.keys(data).length > 0 ? data : null);
            case 16:
              _context.prev = 16;
              _context.t0 = _context["catch"](2);
              logger2.error("CLIENT_FETCH_ERROR", {
                error: _context.t0,
                url
              });
              return _context.abrupt("return", null);
            case 20:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 16]]);
    }));
    return _fetchData.apply(this, arguments);
  }
  function apiBaseUrl(__NEXTAUTH) {
    if (typeof window === "undefined") {
      return "".concat(__NEXTAUTH.baseUrlServer).concat(__NEXTAUTH.basePathServer);
    }
    return __NEXTAUTH.basePath;
  }
  function now() {
    return Math.floor(Date.now() / 1e3);
  }
  function BroadcastChannel() {
    var name = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "nextauth.message";
    return {
      receive: function receive(onReceive) {
        var handler = function handler2(event) {
          var _event$newValue;
          if (event.key !== name)
            return;
          var message = JSON.parse((_event$newValue = event.newValue) !== null && _event$newValue !== void 0 ? _event$newValue : "{}");
          if ((message === null || message === void 0 ? void 0 : message.event) !== "session" || !(message !== null && message !== void 0 && message.data))
            return;
          onReceive(message);
        };
        window.addEventListener("storage", handler);
        return function() {
          return window.removeEventListener("storage", handler);
        };
      },
      post: function post(message) {
        if (typeof window === "undefined")
          return;
        try {
          localStorage.setItem(name, JSON.stringify(_objectSpread(_objectSpread({}, message), {}, {
            timestamp: now()
          })));
        } catch (_unused) {
        }
      }
    };
  }
  return _utils;
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production_min;
function requireReactJsxRuntime_production_min() {
  if (hasRequiredReactJsxRuntime_production_min)
    return reactJsxRuntime_production_min;
  hasRequiredReactJsxRuntime_production_min = 1;
  var f = require$$0, k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
  function q(c, a, g) {
    var b, d = {}, e = null, h = null;
    void 0 !== g && (e = "" + g);
    void 0 !== a.key && (e = "" + a.key);
    void 0 !== a.ref && (h = a.ref);
    for (b in a)
      m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
    if (c && c.defaultProps)
      for (b in a = c.defaultProps, a)
        void 0 === d[b] && (d[b] = a[b]);
    return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
  }
  reactJsxRuntime_production_min.Fragment = l;
  reactJsxRuntime_production_min.jsx = q;
  reactJsxRuntime_production_min.jsxs = q;
  return reactJsxRuntime_production_min;
}
var reactJsxRuntime_development = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_development;
function requireReactJsxRuntime_development() {
  if (hasRequiredReactJsxRuntime_development)
    return reactJsxRuntime_development;
  hasRequiredReactJsxRuntime_development = 1;
  if (process.env.NODE_ENV !== "production") {
    (function() {
      var React = require$$0;
      var REACT_ELEMENT_TYPE = Symbol.for("react.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
      var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = "@@iterator";
      function getIteratorFn(maybeIterable) {
        if (maybeIterable === null || typeof maybeIterable !== "object") {
          return null;
        }
        var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
        if (typeof maybeIterator === "function") {
          return maybeIterator;
        }
        return null;
      }
      var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      function error(format) {
        {
          {
            for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }
            printWarning("error", format, args);
          }
        }
      }
      function printWarning(level, format, args) {
        {
          var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
          var stack = ReactDebugCurrentFrame2.getStackAddendum();
          if (stack !== "") {
            format += "%s";
            args = args.concat([stack]);
          }
          var argsWithFormat = args.map(function(item) {
            return String(item);
          });
          argsWithFormat.unshift("Warning: " + format);
          Function.prototype.apply.call(console[level], console, argsWithFormat);
        }
      }
      var enableScopeAPI = false;
      var enableCacheElement = false;
      var enableTransitionTracing = false;
      var enableLegacyHidden = false;
      var enableDebugTracing = false;
      var REACT_MODULE_REFERENCE;
      {
        REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
      }
      function isValidElementType(type) {
        if (typeof type === "string" || typeof type === "function") {
          return true;
        }
        if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
          return true;
        }
        if (typeof type === "object" && type !== null) {
          if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
          // types supported by any Flight configuration anywhere since
          // we don't know which Flight build this will end up being used
          // with.
          type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
            return true;
          }
        }
        return false;
      }
      function getWrappedName(outerType, innerType, wrapperName) {
        var displayName = outerType.displayName;
        if (displayName) {
          return displayName;
        }
        var functionName = innerType.displayName || innerType.name || "";
        return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
      }
      function getContextName(type) {
        return type.displayName || "Context";
      }
      function getComponentNameFromType(type) {
        if (type == null) {
          return null;
        }
        {
          if (typeof type.tag === "number") {
            error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
          }
        }
        if (typeof type === "function") {
          return type.displayName || type.name || null;
        }
        if (typeof type === "string") {
          return type;
        }
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PORTAL_TYPE:
            return "Portal";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
        }
        if (typeof type === "object") {
          switch (type.$$typeof) {
            case REACT_CONTEXT_TYPE:
              var context = type;
              return getContextName(context) + ".Consumer";
            case REACT_PROVIDER_TYPE:
              var provider = type;
              return getContextName(provider._context) + ".Provider";
            case REACT_FORWARD_REF_TYPE:
              return getWrappedName(type, type.render, "ForwardRef");
            case REACT_MEMO_TYPE:
              var outerName = type.displayName || null;
              if (outerName !== null) {
                return outerName;
              }
              return getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE: {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;
              try {
                return getComponentNameFromType(init(payload));
              } catch (x) {
                return null;
              }
            }
          }
        }
        return null;
      }
      var assign = Object.assign;
      var disabledDepth = 0;
      var prevLog;
      var prevInfo;
      var prevWarn;
      var prevError;
      var prevGroup;
      var prevGroupCollapsed;
      var prevGroupEnd;
      function disabledLog() {
      }
      disabledLog.__reactDisabledLog = true;
      function disableLogs() {
        {
          if (disabledDepth === 0) {
            prevLog = console.log;
            prevInfo = console.info;
            prevWarn = console.warn;
            prevError = console.error;
            prevGroup = console.group;
            prevGroupCollapsed = console.groupCollapsed;
            prevGroupEnd = console.groupEnd;
            var props = {
              configurable: true,
              enumerable: true,
              value: disabledLog,
              writable: true
            };
            Object.defineProperties(console, {
              info: props,
              log: props,
              warn: props,
              error: props,
              group: props,
              groupCollapsed: props,
              groupEnd: props
            });
          }
          disabledDepth++;
        }
      }
      function reenableLogs() {
        {
          disabledDepth--;
          if (disabledDepth === 0) {
            var props = {
              configurable: true,
              enumerable: true,
              writable: true
            };
            Object.defineProperties(console, {
              log: assign({}, props, {
                value: prevLog
              }),
              info: assign({}, props, {
                value: prevInfo
              }),
              warn: assign({}, props, {
                value: prevWarn
              }),
              error: assign({}, props, {
                value: prevError
              }),
              group: assign({}, props, {
                value: prevGroup
              }),
              groupCollapsed: assign({}, props, {
                value: prevGroupCollapsed
              }),
              groupEnd: assign({}, props, {
                value: prevGroupEnd
              })
            });
          }
          if (disabledDepth < 0) {
            error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
          }
        }
      }
      var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
      var prefix;
      function describeBuiltInComponentFrame(name, source, ownerFn) {
        {
          if (prefix === void 0) {
            try {
              throw Error();
            } catch (x) {
              var match = x.stack.trim().match(/\n( *(at )?)/);
              prefix = match && match[1] || "";
            }
          }
          return "\n" + prefix + name;
        }
      }
      var reentry = false;
      var componentFrameCache;
      {
        var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
        componentFrameCache = new PossiblyWeakMap();
      }
      function describeNativeComponentFrame(fn, construct2) {
        if (!fn || reentry) {
          return "";
        }
        {
          var frame = componentFrameCache.get(fn);
          if (frame !== void 0) {
            return frame;
          }
        }
        var control;
        reentry = true;
        var previousPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var previousDispatcher;
        {
          previousDispatcher = ReactCurrentDispatcher.current;
          ReactCurrentDispatcher.current = null;
          disableLogs();
        }
        try {
          if (construct2) {
            var Fake = function() {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, "props", {
              set: function() {
                throw Error();
              }
            });
            if (typeof Reflect === "object" && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x) {
                control = x;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x) {
              control = x;
            }
            fn();
          }
        } catch (sample) {
          if (sample && control && typeof sample.stack === "string") {
            var sampleLines = sample.stack.split("\n");
            var controlLines = control.stack.split("\n");
            var s = sampleLines.length - 1;
            var c = controlLines.length - 1;
            while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
              c--;
            }
            for (; s >= 1 && c >= 0; s--, c--) {
              if (sampleLines[s] !== controlLines[c]) {
                if (s !== 1 || c !== 1) {
                  do {
                    s--;
                    c--;
                    if (c < 0 || sampleLines[s] !== controlLines[c]) {
                      var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                      if (fn.displayName && _frame.includes("<anonymous>")) {
                        _frame = _frame.replace("<anonymous>", fn.displayName);
                      }
                      {
                        if (typeof fn === "function") {
                          componentFrameCache.set(fn, _frame);
                        }
                      }
                      return _frame;
                    }
                  } while (s >= 1 && c >= 0);
                }
                break;
              }
            }
          }
        } finally {
          reentry = false;
          {
            ReactCurrentDispatcher.current = previousDispatcher;
            reenableLogs();
          }
          Error.prepareStackTrace = previousPrepareStackTrace;
        }
        var name = fn ? fn.displayName || fn.name : "";
        var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
        {
          if (typeof fn === "function") {
            componentFrameCache.set(fn, syntheticFrame);
          }
        }
        return syntheticFrame;
      }
      function describeFunctionComponentFrame(fn, source, ownerFn) {
        {
          return describeNativeComponentFrame(fn, false);
        }
      }
      function shouldConstruct(Component) {
        var prototype = Component.prototype;
        return !!(prototype && prototype.isReactComponent);
      }
      function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
        if (type == null) {
          return "";
        }
        if (typeof type === "function") {
          {
            return describeNativeComponentFrame(type, shouldConstruct(type));
          }
        }
        if (typeof type === "string") {
          return describeBuiltInComponentFrame(type);
        }
        switch (type) {
          case REACT_SUSPENSE_TYPE:
            return describeBuiltInComponentFrame("Suspense");
          case REACT_SUSPENSE_LIST_TYPE:
            return describeBuiltInComponentFrame("SuspenseList");
        }
        if (typeof type === "object") {
          switch (type.$$typeof) {
            case REACT_FORWARD_REF_TYPE:
              return describeFunctionComponentFrame(type.render);
            case REACT_MEMO_TYPE:
              return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
            case REACT_LAZY_TYPE: {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;
              try {
                return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
              } catch (x) {
              }
            }
          }
        }
        return "";
      }
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var loggedTypeFailures = {};
      var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
      function setCurrentlyValidatingElement(element) {
        {
          if (element) {
            var owner = element._owner;
            var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
            ReactDebugCurrentFrame.setExtraStackFrame(stack);
          } else {
            ReactDebugCurrentFrame.setExtraStackFrame(null);
          }
        }
      }
      function checkPropTypes(typeSpecs, values, location, componentName, element) {
        {
          var has = Function.call.bind(hasOwnProperty);
          for (var typeSpecName in typeSpecs) {
            if (has(typeSpecs, typeSpecName)) {
              var error$1 = void 0;
              try {
                if (typeof typeSpecs[typeSpecName] !== "function") {
                  var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  err.name = "Invariant Violation";
                  throw err;
                }
                error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (ex) {
                error$1 = ex;
              }
              if (error$1 && !(error$1 instanceof Error)) {
                setCurrentlyValidatingElement(element);
                error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                setCurrentlyValidatingElement(null);
              }
              if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                loggedTypeFailures[error$1.message] = true;
                setCurrentlyValidatingElement(element);
                error("Failed %s type: %s", location, error$1.message);
                setCurrentlyValidatingElement(null);
              }
            }
          }
        }
      }
      var isArrayImpl = Array.isArray;
      function isArray(a) {
        return isArrayImpl(a);
      }
      function typeName(value) {
        {
          var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
          var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          return type;
        }
      }
      function willCoercionThrow(value) {
        {
          try {
            testStringCoercion(value);
            return false;
          } catch (e) {
            return true;
          }
        }
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        {
          if (willCoercionThrow(value)) {
            error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
            return testStringCoercion(value);
          }
        }
      }
      var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
      var RESERVED_PROPS = {
        key: true,
        ref: true,
        __self: true,
        __source: true
      };
      var specialPropKeyWarningShown;
      var specialPropRefWarningShown;
      var didWarnAboutStringRefs;
      {
        didWarnAboutStringRefs = {};
      }
      function hasValidRef(config) {
        {
          if (hasOwnProperty.call(config, "ref")) {
            var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
            if (getter && getter.isReactWarning) {
              return false;
            }
          }
        }
        return config.ref !== void 0;
      }
      function hasValidKey(config) {
        {
          if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) {
              return false;
            }
          }
        }
        return config.key !== void 0;
      }
      function warnIfStringRefCannotBeAutoConverted(config, self) {
        {
          if (typeof config.ref === "string" && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
            var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (!didWarnAboutStringRefs[componentName]) {
              error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);
              didWarnAboutStringRefs[componentName] = true;
            }
          }
        }
      }
      function defineKeyPropWarningGetter(props, displayName) {
        {
          var warnAboutAccessingKey = function() {
            if (!specialPropKeyWarningShown) {
              specialPropKeyWarningShown = true;
              error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
      }
      function defineRefPropWarningGetter(props, displayName) {
        {
          var warnAboutAccessingRef = function() {
            if (!specialPropRefWarningShown) {
              specialPropRefWarningShown = true;
              error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
      }
      var ReactElement = function(type, key, ref, self, source, owner, props) {
        var element = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: REACT_ELEMENT_TYPE,
          // Built-in properties that belong on the element
          type,
          key,
          ref,
          props,
          // Record the component responsible for creating this element.
          _owner: owner
        };
        {
          element._store = {};
          Object.defineProperty(element._store, "validated", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: false
          });
          Object.defineProperty(element, "_self", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: self
          });
          Object.defineProperty(element, "_source", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: source
          });
          if (Object.freeze) {
            Object.freeze(element.props);
            Object.freeze(element);
          }
        }
        return element;
      };
      function jsxDEV(type, config, maybeKey, source, self) {
        {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          if (maybeKey !== void 0) {
            {
              checkKeyStringCoercion(maybeKey);
            }
            key = "" + maybeKey;
          }
          if (hasValidKey(config)) {
            {
              checkKeyStringCoercion(config.key);
            }
            key = "" + config.key;
          }
          if (hasValidRef(config)) {
            ref = config.ref;
            warnIfStringRefCannotBeAutoConverted(config, self);
          }
          for (propName in config) {
            if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
              props[propName] = config[propName];
            }
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          if (key || ref) {
            var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
            if (key) {
              defineKeyPropWarningGetter(props, displayName);
            }
            if (ref) {
              defineRefPropWarningGetter(props, displayName);
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
      }
      var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
      var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
      function setCurrentlyValidatingElement$1(element) {
        {
          if (element) {
            var owner = element._owner;
            var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
            ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
          } else {
            ReactDebugCurrentFrame$1.setExtraStackFrame(null);
          }
        }
      }
      var propTypesMisspellWarningShown;
      {
        propTypesMisspellWarningShown = false;
      }
      function isValidElement(object) {
        {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
      }
      function getDeclarationErrorAddendum() {
        {
          if (ReactCurrentOwner$1.current) {
            var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
      }
      function getSourceInfoErrorAddendum(source) {
        {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
      }
      var ownerHasKeyUseWarning = {};
      function getCurrentComponentErrorInfo(parentType) {
        {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
      }
      function validateExplicitKey(element, parentType) {
        {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          setCurrentlyValidatingElement$1(element);
          error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
          setCurrentlyValidatingElement$1(null);
        }
      }
      function validateChildKeys(node, parentType) {
        {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
      }
      function validatePropTypes(element) {
        {
          var type = element.type;
          if (type === null || type === void 0 || typeof type === "string") {
            return;
          }
          var propTypes;
          if (typeof type === "function") {
            propTypes = type.propTypes;
          } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          type.$$typeof === REACT_MEMO_TYPE)) {
            propTypes = type.propTypes;
          } else {
            return;
          }
          if (propTypes) {
            var name = getComponentNameFromType(type);
            checkPropTypes(propTypes, element.props, "prop", name, element);
          } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
            propTypesMisspellWarningShown = true;
            var _name = getComponentNameFromType(type);
            error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
          }
          if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
            error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
          }
        }
      }
      function validateFragmentProps(fragment) {
        {
          var keys = Object.keys(fragment.props);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key !== "children" && key !== "key") {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
              setCurrentlyValidatingElement$1(null);
              break;
            }
          }
          if (fragment.ref !== null) {
            setCurrentlyValidatingElement$1(fragment);
            error("Invalid attribute `ref` supplied to `React.Fragment`.");
            setCurrentlyValidatingElement$1(null);
          }
        }
      }
      var didWarnAboutKeySpread = {};
      function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
        {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendum(source);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
          }
          var element = jsxDEV(type, props, key, source, self);
          if (element == null) {
            return element;
          }
          if (validType) {
            var children = props.children;
            if (children !== void 0) {
              if (isStaticChildren) {
                if (isArray(children)) {
                  for (var i = 0; i < children.length; i++) {
                    validateChildKeys(children[i], type);
                  }
                  if (Object.freeze) {
                    Object.freeze(children);
                  }
                } else {
                  error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
                }
              } else {
                validateChildKeys(children, type);
              }
            }
          }
          {
            if (hasOwnProperty.call(props, "key")) {
              var componentName = getComponentNameFromType(type);
              var keys = Object.keys(props).filter(function(k) {
                return k !== "key";
              });
              var beforeExample = keys.length > 0 ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
              if (!didWarnAboutKeySpread[componentName + beforeExample]) {
                var afterExample = keys.length > 0 ? "{" + keys.join(": ..., ") + ": ...}" : "{}";
                error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
                didWarnAboutKeySpread[componentName + beforeExample] = true;
              }
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
      }
      function jsxWithValidationStatic(type, props, key) {
        {
          return jsxWithValidation(type, props, key, true);
        }
      }
      function jsxWithValidationDynamic(type, props, key) {
        {
          return jsxWithValidation(type, props, key, false);
        }
      }
      var jsx = jsxWithValidationDynamic;
      var jsxs = jsxWithValidationStatic;
      reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
      reactJsxRuntime_development.jsx = jsx;
      reactJsxRuntime_development.jsxs = jsxs;
    })();
  }
  return reactJsxRuntime_development;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime)
    return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  if (process.env.NODE_ENV === "production") {
    jsxRuntime.exports = requireReactJsxRuntime_production_min();
  } else {
    jsxRuntime.exports = requireReactJsxRuntime_development();
  }
  return jsxRuntime.exports;
}
var types = {};
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes)
    return types;
  hasRequiredTypes = 1;
  Object.defineProperty(types, "__esModule", {
    value: true
  });
  return types;
}
(function(exports) {
  var _interopRequireDefault = interopRequireDefaultExports;
  var _typeof2 = _typeofExports;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _exportNames = {
    SessionContext: true,
    useSession: true,
    getSession: true,
    getCsrfToken: true,
    getProviders: true,
    signIn: true,
    signOut: true,
    SessionProvider: true
  };
  exports.SessionContext = void 0;
  exports.SessionProvider = SessionProvider;
  exports.getCsrfToken = getCsrfToken;
  exports.getProviders = getProviders;
  exports.getSession = getSession;
  exports.signIn = signIn;
  exports.signOut = signOut;
  exports.useSession = useSession;
  var _regenerator = _interopRequireDefault(requireRegenerator());
  var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
  var _asyncToGenerator2 = _interopRequireDefault(requireAsyncToGenerator());
  var _slicedToArray2 = _interopRequireDefault(requireSlicedToArray());
  var React = _interopRequireWildcard(require$$0);
  var _logger2 = _interopRequireWildcard(requireLogger());
  var _parseUrl = _interopRequireDefault(requireParseUrl());
  var _utils2 = require_utils();
  var _jsxRuntime = requireJsxRuntime();
  var _types = requireTypes();
  Object.keys(_types).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key))
      return;
    if (key in exports && exports[key] === _types[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function get() {
        return _types[key];
      }
    });
  });
  var _process$env$NEXTAUTH, _ref, _process$env$NEXTAUTH2, _process$env$NEXTAUTH3, _React$createContext;
  function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function")
      return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache = function _getRequireWildcardCache2(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || _typeof2(obj) !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        (0, _defineProperty2.default)(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  var __NEXTAUTH = {
    baseUrl: (0, _parseUrl.default)((_process$env$NEXTAUTH = process.env.NEXTAUTH_URL) !== null && _process$env$NEXTAUTH !== void 0 ? _process$env$NEXTAUTH : process.env.VERCEL_URL).origin,
    basePath: (0, _parseUrl.default)(process.env.NEXTAUTH_URL).path,
    baseUrlServer: (0, _parseUrl.default)((_ref = (_process$env$NEXTAUTH2 = process.env.NEXTAUTH_URL_INTERNAL) !== null && _process$env$NEXTAUTH2 !== void 0 ? _process$env$NEXTAUTH2 : process.env.NEXTAUTH_URL) !== null && _ref !== void 0 ? _ref : process.env.VERCEL_URL).origin,
    basePathServer: (0, _parseUrl.default)((_process$env$NEXTAUTH3 = process.env.NEXTAUTH_URL_INTERNAL) !== null && _process$env$NEXTAUTH3 !== void 0 ? _process$env$NEXTAUTH3 : process.env.NEXTAUTH_URL).path,
    _lastSync: 0,
    _session: void 0,
    _getSession: function _getSession() {
    }
  };
  var broadcast = (0, _utils2.BroadcastChannel)();
  var logger2 = (0, _logger2.proxyLogger)(_logger2.default, __NEXTAUTH.basePath);
  function useOnline() {
    var _React$useState = React.useState(typeof navigator !== "undefined" ? navigator.onLine : false), _React$useState2 = (0, _slicedToArray2.default)(_React$useState, 2), isOnline = _React$useState2[0], setIsOnline = _React$useState2[1];
    var setOnline = function setOnline2() {
      return setIsOnline(true);
    };
    var setOffline = function setOffline2() {
      return setIsOnline(false);
    };
    React.useEffect(function() {
      window.addEventListener("online", setOnline);
      window.addEventListener("offline", setOffline);
      return function() {
        window.removeEventListener("online", setOnline);
        window.removeEventListener("offline", setOffline);
      };
    }, []);
    return isOnline;
  }
  var SessionContext = (_React$createContext = React.createContext) === null || _React$createContext === void 0 ? void 0 : _React$createContext.call(React, void 0);
  exports.SessionContext = SessionContext;
  function useSession(options) {
    if (!SessionContext) {
      throw new Error("React Context is unavailable in Server Components");
    }
    var value = React.useContext(SessionContext);
    if (!value && process.env.NODE_ENV !== "production") {
      throw new Error("[next-auth]: `useSession` must be wrapped in a <SessionProvider />");
    }
    var _ref2 = options !== null && options !== void 0 ? options : {}, required = _ref2.required, onUnauthenticated = _ref2.onUnauthenticated;
    var requiredAndNotLoading = required && value.status === "unauthenticated";
    React.useEffect(function() {
      if (requiredAndNotLoading) {
        var url = "/api/auth/signin?".concat(new URLSearchParams({
          error: "SessionRequired",
          callbackUrl: window.location.href
        }));
        if (onUnauthenticated)
          onUnauthenticated();
        else
          window.location.href = url;
      }
    }, [requiredAndNotLoading, onUnauthenticated]);
    if (requiredAndNotLoading) {
      return {
        data: value.data,
        update: value.update,
        status: "loading"
      };
    }
    return value;
  }
  function getSession(_x) {
    return _getSession2.apply(this, arguments);
  }
  function _getSession2() {
    _getSession2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(params) {
      var _params$broadcast;
      var session;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0, _utils2.fetchData)("session", __NEXTAUTH, logger2, params);
            case 2:
              session = _context3.sent;
              if ((_params$broadcast = params === null || params === void 0 ? void 0 : params.broadcast) !== null && _params$broadcast !== void 0 ? _params$broadcast : true) {
                broadcast.post({
                  event: "session",
                  data: {
                    trigger: "getSession"
                  }
                });
              }
              return _context3.abrupt("return", session);
            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _getSession2.apply(this, arguments);
  }
  function getCsrfToken(_x2) {
    return _getCsrfToken.apply(this, arguments);
  }
  function _getCsrfToken() {
    _getCsrfToken = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(params) {
      var response;
      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return (0, _utils2.fetchData)("csrf", __NEXTAUTH, logger2, params);
            case 2:
              response = _context4.sent;
              return _context4.abrupt("return", response === null || response === void 0 ? void 0 : response.csrfToken);
            case 4:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _getCsrfToken.apply(this, arguments);
  }
  function getProviders() {
    return _getProviders.apply(this, arguments);
  }
  function _getProviders() {
    _getProviders = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee5() {
      return _regenerator.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return (0, _utils2.fetchData)("providers", __NEXTAUTH, logger2);
            case 2:
              return _context5.abrupt("return", _context5.sent);
            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));
    return _getProviders.apply(this, arguments);
  }
  function signIn(_x3, _x4, _x5) {
    return _signIn.apply(this, arguments);
  }
  function _signIn() {
    _signIn = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee6(provider, options, authorizationParams) {
      var _ref5, _ref5$callbackUrl, callbackUrl, _ref5$redirect, redirect, baseUrl, providers, isCredentials, isEmail, isSupportingReturn, signInUrl, _signInUrl, res, data, _data$url, url, error;
      return _regenerator.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _ref5 = options !== null && options !== void 0 ? options : {}, _ref5$callbackUrl = _ref5.callbackUrl, callbackUrl = _ref5$callbackUrl === void 0 ? window.location.href : _ref5$callbackUrl, _ref5$redirect = _ref5.redirect, redirect = _ref5$redirect === void 0 ? true : _ref5$redirect;
              baseUrl = (0, _utils2.apiBaseUrl)(__NEXTAUTH);
              _context6.next = 4;
              return getProviders();
            case 4:
              providers = _context6.sent;
              if (providers) {
                _context6.next = 8;
                break;
              }
              window.location.href = "".concat(baseUrl, "/error");
              return _context6.abrupt("return");
            case 8:
              if (!(!provider || !(provider in providers))) {
                _context6.next = 11;
                break;
              }
              window.location.href = "".concat(baseUrl, "/signin?").concat(new URLSearchParams({
                callbackUrl
              }));
              return _context6.abrupt("return");
            case 11:
              isCredentials = providers[provider].type === "credentials";
              isEmail = providers[provider].type === "email";
              isSupportingReturn = isCredentials || isEmail;
              signInUrl = "".concat(baseUrl, "/").concat(isCredentials ? "callback" : "signin", "/").concat(provider);
              _signInUrl = "".concat(signInUrl).concat(authorizationParams ? "?".concat(new URLSearchParams(authorizationParams)) : "");
              _context6.t0 = fetch;
              _context6.t1 = _signInUrl;
              _context6.t2 = {
                "Content-Type": "application/x-www-form-urlencoded"
              };
              _context6.t3 = URLSearchParams;
              _context6.t4 = _objectSpread;
              _context6.t5 = _objectSpread({}, options);
              _context6.t6 = {};
              _context6.next = 25;
              return getCsrfToken();
            case 25:
              _context6.t7 = _context6.sent;
              _context6.t8 = callbackUrl;
              _context6.t9 = {
                csrfToken: _context6.t7,
                callbackUrl: _context6.t8,
                json: true
              };
              _context6.t10 = (0, _context6.t4)(_context6.t5, _context6.t6, _context6.t9);
              _context6.t11 = new _context6.t3(_context6.t10);
              _context6.t12 = {
                method: "post",
                headers: _context6.t2,
                body: _context6.t11
              };
              _context6.next = 33;
              return (0, _context6.t0)(_context6.t1, _context6.t12);
            case 33:
              res = _context6.sent;
              _context6.next = 36;
              return res.json();
            case 36:
              data = _context6.sent;
              if (!(redirect || !isSupportingReturn)) {
                _context6.next = 42;
                break;
              }
              url = (_data$url = data.url) !== null && _data$url !== void 0 ? _data$url : callbackUrl;
              window.location.href = url;
              if (url.includes("#"))
                window.location.reload();
              return _context6.abrupt("return");
            case 42:
              error = new URL(data.url).searchParams.get("error");
              if (!res.ok) {
                _context6.next = 46;
                break;
              }
              _context6.next = 46;
              return __NEXTAUTH._getSession({
                event: "storage"
              });
            case 46:
              return _context6.abrupt("return", {
                error,
                status: res.status,
                ok: res.ok,
                url: error ? null : data.url
              });
            case 47:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));
    return _signIn.apply(this, arguments);
  }
  function signOut(_x6) {
    return _signOut.apply(this, arguments);
  }
  function _signOut() {
    _signOut = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee7(options) {
      var _options$redirect;
      var _ref6, _ref6$callbackUrl, callbackUrl, baseUrl, fetchOptions, res, data, _data$url2, url;
      return _regenerator.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _ref6 = options !== null && options !== void 0 ? options : {}, _ref6$callbackUrl = _ref6.callbackUrl, callbackUrl = _ref6$callbackUrl === void 0 ? window.location.href : _ref6$callbackUrl;
              baseUrl = (0, _utils2.apiBaseUrl)(__NEXTAUTH);
              _context7.t0 = {
                "Content-Type": "application/x-www-form-urlencoded"
              };
              _context7.t1 = URLSearchParams;
              _context7.next = 6;
              return getCsrfToken();
            case 6:
              _context7.t2 = _context7.sent;
              _context7.t3 = callbackUrl;
              _context7.t4 = {
                csrfToken: _context7.t2,
                callbackUrl: _context7.t3,
                json: true
              };
              _context7.t5 = new _context7.t1(_context7.t4);
              fetchOptions = {
                method: "post",
                headers: _context7.t0,
                body: _context7.t5
              };
              _context7.next = 13;
              return fetch("".concat(baseUrl, "/signout"), fetchOptions);
            case 13:
              res = _context7.sent;
              _context7.next = 16;
              return res.json();
            case 16:
              data = _context7.sent;
              broadcast.post({
                event: "session",
                data: {
                  trigger: "signout"
                }
              });
              if (!((_options$redirect = options === null || options === void 0 ? void 0 : options.redirect) !== null && _options$redirect !== void 0 ? _options$redirect : true)) {
                _context7.next = 23;
                break;
              }
              url = (_data$url2 = data.url) !== null && _data$url2 !== void 0 ? _data$url2 : callbackUrl;
              window.location.href = url;
              if (url.includes("#"))
                window.location.reload();
              return _context7.abrupt("return");
            case 23:
              _context7.next = 25;
              return __NEXTAUTH._getSession({
                event: "storage"
              });
            case 25:
              return _context7.abrupt("return", data);
            case 26:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));
    return _signOut.apply(this, arguments);
  }
  function SessionProvider(props) {
    if (!SessionContext) {
      throw new Error("React Context is unavailable in Server Components");
    }
    var children = props.children, basePath = props.basePath, refetchInterval = props.refetchInterval, refetchWhenOffline = props.refetchWhenOffline;
    if (basePath)
      __NEXTAUTH.basePath = basePath;
    var hasInitialSession = props.session !== void 0;
    __NEXTAUTH._lastSync = hasInitialSession ? (0, _utils2.now)() : 0;
    var _React$useState3 = React.useState(function() {
      if (hasInitialSession)
        __NEXTAUTH._session = props.session;
      return props.session;
    }), _React$useState4 = (0, _slicedToArray2.default)(_React$useState3, 2), session = _React$useState4[0], setSession = _React$useState4[1];
    var _React$useState5 = React.useState(!hasInitialSession), _React$useState6 = (0, _slicedToArray2.default)(_React$useState5, 2), loading = _React$useState6[0], setLoading = _React$useState6[1];
    React.useEffect(function() {
      __NEXTAUTH._getSession = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
        var _ref4, event, storageEvent, _args = arguments;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ref4 = _args.length > 0 && _args[0] !== void 0 ? _args[0] : {}, event = _ref4.event;
                _context.prev = 1;
                storageEvent = event === "storage";
                if (!(storageEvent || __NEXTAUTH._session === void 0)) {
                  _context.next = 10;
                  break;
                }
                __NEXTAUTH._lastSync = (0, _utils2.now)();
                _context.next = 7;
                return getSession({
                  broadcast: !storageEvent
                });
              case 7:
                __NEXTAUTH._session = _context.sent;
                setSession(__NEXTAUTH._session);
                return _context.abrupt("return");
              case 10:
                if (!(!event || __NEXTAUTH._session === null || (0, _utils2.now)() < __NEXTAUTH._lastSync)) {
                  _context.next = 12;
                  break;
                }
                return _context.abrupt("return");
              case 12:
                __NEXTAUTH._lastSync = (0, _utils2.now)();
                _context.next = 15;
                return getSession();
              case 15:
                __NEXTAUTH._session = _context.sent;
                setSession(__NEXTAUTH._session);
                _context.next = 22;
                break;
              case 19:
                _context.prev = 19;
                _context.t0 = _context["catch"](1);
                logger2.error("CLIENT_SESSION_ERROR", _context.t0);
              case 22:
                _context.prev = 22;
                setLoading(false);
                return _context.finish(22);
              case 25:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 19, 22, 25]]);
      }));
      __NEXTAUTH._getSession();
      return function() {
        __NEXTAUTH._lastSync = 0;
        __NEXTAUTH._session = void 0;
        __NEXTAUTH._getSession = function() {
        };
      };
    }, []);
    React.useEffect(function() {
      var unsubscribe = broadcast.receive(function() {
        return __NEXTAUTH._getSession({
          event: "storage"
        });
      });
      return function() {
        return unsubscribe();
      };
    }, []);
    React.useEffect(function() {
      var _props$refetchOnWindo = props.refetchOnWindowFocus, refetchOnWindowFocus = _props$refetchOnWindo === void 0 ? true : _props$refetchOnWindo;
      var visibilityHandler = function visibilityHandler2() {
        if (refetchOnWindowFocus && document.visibilityState === "visible")
          __NEXTAUTH._getSession({
            event: "visibilitychange"
          });
      };
      document.addEventListener("visibilitychange", visibilityHandler, false);
      return function() {
        return document.removeEventListener("visibilitychange", visibilityHandler, false);
      };
    }, [props.refetchOnWindowFocus]);
    var isOnline = useOnline();
    var shouldRefetch = refetchWhenOffline !== false || isOnline;
    React.useEffect(function() {
      if (refetchInterval && shouldRefetch) {
        var refetchIntervalTimer = setInterval(function() {
          if (__NEXTAUTH._session) {
            __NEXTAUTH._getSession({
              event: "poll"
            });
          }
        }, refetchInterval * 1e3);
        return function() {
          return clearInterval(refetchIntervalTimer);
        };
      }
    }, [refetchInterval, shouldRefetch]);
    var value = React.useMemo(function() {
      return {
        data: session,
        status: loading ? "loading" : session ? "authenticated" : "unauthenticated",
        update: function update(data) {
          return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
            var newSession;
            return _regenerator.default.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!(loading || !session)) {
                      _context2.next = 2;
                      break;
                    }
                    return _context2.abrupt("return");
                  case 2:
                    setLoading(true);
                    _context2.t0 = _utils2.fetchData;
                    _context2.t1 = __NEXTAUTH;
                    _context2.t2 = logger2;
                    _context2.next = 8;
                    return getCsrfToken();
                  case 8:
                    _context2.t3 = _context2.sent;
                    _context2.t4 = data;
                    _context2.t5 = {
                      csrfToken: _context2.t3,
                      data: _context2.t4
                    };
                    _context2.t6 = {
                      body: _context2.t5
                    };
                    _context2.t7 = {
                      req: _context2.t6
                    };
                    _context2.next = 15;
                    return (0, _context2.t0)("session", _context2.t1, _context2.t2, _context2.t7);
                  case 15:
                    newSession = _context2.sent;
                    setLoading(false);
                    if (newSession) {
                      setSession(newSession);
                      broadcast.post({
                        event: "session",
                        data: {
                          trigger: "getSession"
                        }
                      });
                    }
                    return _context2.abrupt("return", newSession);
                  case 19:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }))();
        }
      };
    }, [session, loading]);
    return (0, _jsxRuntime.jsx)(SessionContext.Provider, {
      value,
      children
    });
  }
})(react);
const TINA_CREDENTIALS_PROVIDER_NAME = "TinaCredentials";
class DefaultAuthJSProvider extends AbstractAuthProvider {
  constructor(props) {
    super();
    this.name = (props == null ? void 0 : props.name) || TINA_CREDENTIALS_PROVIDER_NAME;
    this.callbackUrl = (props == null ? void 0 : props.callbackUrl) || "/admin/index.html";
    this.redirect = (props == null ? void 0 : props.redirect) ?? false;
  }
  async authenticate(_props) {
    return react.signIn(this.name, { callbackUrl: this.callbackUrl });
  }
  getToken() {
    return Promise.resolve({ id_token: "" });
  }
  async getUser() {
    const session = await react.getSession();
    return (session == null ? void 0 : session.user) || false;
  }
  async logout() {
    await react.signOut({ redirect: this.redirect, callbackUrl: this.callbackUrl });
  }
  async authorize(context) {
    var _a;
    const user = ((_a = await react.getSession(context)) == null ? void 0 : _a.user) || {};
    return user.role === "user";
  }
  getSessionProvider() {
    return react.SessionProvider;
  }
}
const errorRegex = /\?error=([^&]*)/;
const errorMap = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  default: "Unable to sign in."
};
class UsernamePasswordAuthJSProvider extends DefaultAuthJSProvider {
  async authenticate(props) {
    const username = props == null ? void 0 : props.username;
    const password = props == null ? void 0 : props.password;
    if (!username || !password) {
      throw new Error("Username and password are required");
    }
    const csrfToken = await react.getCsrfToken();
    return fetch("/api/tina/auth/callback/credentials", {
      redirect: "error",
      //redirect should throw an error
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        csrfToken,
        redirect: "false",
        json: "true",
        username,
        password
      }).toString()
    }).then(async (res) => {
      var _a;
      const { url } = await res.json();
      if (!url) {
        throw new Error("Unexpected error on login");
      }
      const error = (_a = url.match(errorRegex)) == null ? void 0 : _a[1];
      if (error) {
        if (error in errorMap) {
          throw errorMap[error];
        } else {
          throw errorMap["default"];
        }
      }
    }).catch((err) => {
      throw err;
    });
  }
  getLoginStrategy() {
    return "UsernamePassword";
  }
}
const TinaUserCollection = {
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false
    }
  },
  isAuthCollection: true,
  isDetached: true,
  label: "Users",
  name: "user",
  path: "content/users",
  format: "json",
  fields: [
    {
      type: "object",
      name: "users",
      list: true,
      ui: {
        defaultItem: {
          username: "new-user",
          name: "New User",
          password: void 0
        },
        itemProps: (item) => ({ label: item == null ? void 0 : item.username })
      },
      fields: [
        {
          type: "string",
          label: "Username",
          name: "username",
          uid: true,
          required: true
        },
        {
          type: "string",
          label: "Name",
          name: "name"
        },
        {
          type: "string",
          label: "Email",
          name: "email"
        },
        {
          type: "password",
          label: "Password",
          name: "password",
          required: true
        }
      ]
    }
  ]
};
export {
  DefaultAuthJSProvider,
  TINA_CREDENTIALS_PROVIDER_NAME,
  TinaUserCollection,
  UsernamePasswordAuthJSProvider
};
