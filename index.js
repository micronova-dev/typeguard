"use strict";
// typeguard utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = exports.isArray = exports.isAnyOf = exports.to = exports.isMatch = exports.isNegative = exports.isPositive = exports.isFinite = exports.isInteger = exports.isZero = exports.isInstance = exports.isNil = exports.isNull = exports.isUndefined = exports.isEqual = exports.isFunction = exports.isSymbol = exports.isBoolean = exports.isString = exports.isBigint = exports.isNumber = exports.isAnd = exports.isOr = void 0;
var isOr = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (x) { return args.reduce(function (b, g) { return b || g(x); }, false); };
};
exports.isOr = isOr;
var isAnd = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (x) { return args.reduce(function (b, g) { return b && g(x); }, true); };
};
exports.isAnd = isAnd;
// primitives
var isNumber = function (x) { return typeof (x) === "number"; };
exports.isNumber = isNumber;
var isBigint = function (x) { return typeof (x) === "bigint"; };
exports.isBigint = isBigint;
var isString = function (x) { return typeof (x) === "string"; };
exports.isString = isString;
var isBoolean = function (x) { return x === true || x === false; };
exports.isBoolean = isBoolean;
var isSymbol = function (x) { return typeof (x) === "symbol"; };
exports.isSymbol = isSymbol;
var isFunction = function (x) { return typeof (x) === "function"; };
exports.isFunction = isFunction;
var isEqual = function (v) { return function (x) { return x === v; }; };
exports.isEqual = isEqual;
exports.isUndefined = (0, exports.isEqual)(undefined);
exports.isNull = (0, exports.isEqual)(null);
exports.isNil = (0, exports.isOr)(exports.isUndefined, exports.isNull);
// isntanceof typeguard
var isInstance = function (c) { return function (x) { return (x instanceof c); }; };
exports.isInstance = isInstance;
exports.isZero = (0, exports.isEqual)(0);
var isInteger = function (x) { return Number.isInteger(x); };
exports.isInteger = isInteger;
var isFinite = function (x) { return Number.isFinite(x); };
exports.isFinite = isFinite;
var isPositive = function (x) { return (0, exports.isNumber)(x) && x > 0; };
exports.isPositive = isPositive;
var isNegative = function (x) { return (0, exports.isNumber)(x) && x < 0; };
exports.isNegative = isNegative;
// string matching regexp
var isMatch = function (b, r) { return function (x) { return (0, exports.isString)(x) && r.test(x); }; };
exports.isMatch = isMatch;
// returns a function that converts to T or throws error
var to = function (guard, error) {
    if (error === void 0) { error = function (x) { return new TypeError("type mismatch: ".concat(x)); }; }
    return function (x) {
        if (guard(x)) {
            return x;
        }
        throw error(x);
    };
};
exports.to = to;
// any of const array elements
var isAnyOf = function (v) { return function (x) {
    return v.includes(x);
}; };
exports.isAnyOf = isAnyOf;
// homogeneous array
var isArray = function (g) { return function (x) { return Array.isArray(x) && x.every(g); }; };
exports.isArray = isArray;
// "plain" object/tuple (with Object or Array constructor)
var isObject = function (g, exact) {
    if (exact === void 0) { exact = true; }
    return function (x) {
        if (x && typeof (x) === "object" && (x.constructor === Object || x.constructor === Array)) {
            if (Array.isArray(g)) {
                if (!Array.isArray(x)) {
                    return false;
                }
            }
            else {
                if (Array.isArray(x)) {
                    return false;
                }
            }
            for (var k in g) {
                if (!g[k](x[k])) {
                    return false;
                }
            }
            if (exact) {
                for (var k in x) {
                    if (!(k in g)) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    };
};
exports.isObject = isObject;
