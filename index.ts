// typeguard utilities

// typeguard type for given type T
export type is<T> = (x: unknown) => x is T;

// type for typeguard; isFor<is<T>> = T
export type isFor<G> = G extends (x: any) => x is infer T ? T : never;

// object typeguard (object/tuple of typeguards for value types; e.g. ObjectGuard<T> = {a : is<number>} when T = {a: number}
export type ObjectGuard<T extends object> = {[K in keyof T]: is<T[K]>}

// type T for ObjectGuard<T>; ObjectGuardFor<ObjectGuard<T>> = T
export type ObjectGuardFor<G extends object> = {[K in keyof G]: isFor<G[K]>}

// logical combinations
export const isOr = <T, U>(g1: is<T>, g2: is<U>) => (x: unknown): x is T | U => g1(x) || g2(x);
export const isAnd = <T, U>(g1: is<T>, g2: is<U>) => (x: unknown): x is T & U => g1(x) && g2(x);

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

// nominal primitive types
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
export const to = <T>(guard: is<T>, error = (x: unknown) => new TypeError(`type mismatch: ${x}`)): (x: unknown) => T => {
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
export const isArray = <T>(g: is<T>) => (x: unknown): x is T[] => Array.isArray(x) && x.every(g);

// object/tuple
export const isObject = <T extends object>(g: ObjectGuard<T>, exact = true) => (x: unknown): x is T => {
  if (x && typeof(x) === "object") {
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
