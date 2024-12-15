// typeguard utilities

// typeguard type for given type T ( = unknown by default)
export type Is<T = unknown> = (x: unknown) => x is T;

// type for typeguard; IsFor<Is<T>> = T; unknown is returned for non-typeguard functions
export type IsFor<G> = G extends Is<infer T> ? T : unknown;

// object typeguard (object/tuple of typeguards for value types; e.g. ObjectGuard<T> = {a : Is<number>} when T = {a: number}
export type ObjectGuard<T extends object> = {[K in keyof T]: Is<T[K]>}

// type T for ObjectGuard<T>; ObjectGuardFor<ObjectGuard<T>> = T
export type ObjectGuardFor<G extends object> = {[K in keyof G]: IsFor<G[K]>}

// logical combinations (multi-argument)

export type IsForOf<ITT extends readonly Is[]> =
  ITT extends [infer IT, ...infer IRR extends Is[]]
    ? [IsFor<IT>, ...IsForOf<IRR>]
    : []
 
export type OrOf<TT> = TT extends [infer T, ...infer R] ? R extends [] ? T : (T | OrOf<R>) : never;
export type AndOf<TT> = TT extends [infer T, ...infer R] ? R extends [] ? T : (T & AndOf<R>) : never;

export const isOr = <TT extends readonly Is[]>(...args: TT) => (x: unknown): x is OrOf<IsForOf<TT>> => args.reduce((b, g) => b || g(x), false);
export const isAnd = <TT extends readonly Is[]>(...args: TT) => (x: unknown): x is AndOf<IsForOf<TT>> => args.reduce((b, g) => b && g(x), true);

// primitives
export const isNumber = (x: unknown): x is number => typeof(x) === "number";
export const isBigint = (x: unknown): x is bigint => typeof(x) === "bigint";
export const isString = (x: unknown): x is string => typeof(x) === "string";
export const isBoolean = (x: unknown): x is boolean => x === true || x === false;
export const isSymbol = (x: unknown): x is symbol => typeof(x) === "symbol";
export const isFunction = (x: unknown): x is Function => typeof(x) === "function";
export const isEqual = <T>(v: T) => (x: unknown): x is T => x === v;
export const isUndefined = isEqual(undefined);
export const isNull = isEqual(null);
export const isNil = isOr(isUndefined, isNull);

// isntanceof typeguard
export const isInstance = <C extends abstract new(...args: never) => unknown>(c: C) => (x: unknown): x is InstanceType<C> => (x instanceof c);

// nominal primitive types with and/or support
export type Nominal<T, B extends string> = T & Record<B, B>;

export type Zero = 0;
export const isZero = isEqual<Zero>(0);

export type Integer = Nominal<number, "integer"> | 0;
export const isInteger = (x: unknown): x is Integer => Number.isInteger(x);

export type Finite = Nominal<number, "finite"> | Integer;
export const isFinite = (x: unknown): x is Finite => Number.isFinite(x);

export type Positive = Nominal<number, "positive">;
export const isPositive = (x: unknown): x is Positive => isNumber(x) && x > 0;

export type Negative = Nominal<number, "negative">;
export const isNegative = (x: unknown): x is Negative => isNumber(x) && x < 0;

// string matching regexp
export const isMatch = <B extends string>(b: B, r: RegExp) => (x: unknown): x is Nominal<string, B> => isString(x) && r.test(x);

// returns a function that converts to T or throws error
export const to = <T>(guard: Is<T>, error = (x: unknown) => new TypeError(`type mismatch: ${x}`)): (x: unknown) => T => {
  return (x: unknown) => {  
    if (guard(x)) {
      return x;
    }
    throw error(x);
  };
}

// any of const array elements
export const isAnyOf = <T extends readonly unknown[]>(v: T) => (x: unknown): x is T[number] => {
  return v.includes(x);
}

// homogeneous array
export const isArray = <T>(g: Is<T>) => (x: unknown): x is T[] => Array.isArray(x) && x.every(g);

// "plain" object/tuple (with Object or Array constructor)
export const isObject = <T extends object>(g: ObjectGuard<T>, exact = true) => (x: unknown): x is T => {
  if (x && typeof(x) === "object" && (x.constructor === Object || x.constructor === Array)) {
    if (Array.isArray(g)) {
      if (!Array.isArray(x)) {
        return false;
      }
    } else {
      if (Array.isArray(x)) {
        return false;
      }
    }

    for (let k in g) {
      if (!g[k]((x as any)[k])) {
        return false;
      }
    }

    if (exact) {
      for (let k in x) {
        if (!(k in g)) {
          return false;
        }
      }
    }

    return true;
  }

  return false;
}
