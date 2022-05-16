# Typeguard
Simple typescript [__typeguard__](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) utilities including  object/tuple support and nominal types such as Zero, Integer, Finite, Positive, Negative, and Match (regexp).

## Installation

To install:

```
yarn add micronova-dev/typeguard
```

or
```
npm install micronova-dev/typeguard
```

## Usage

__typeguard__ module exports the following types:

| export | description |
| - | - |
| is\<T\> | typeguard function type "(x: unknown) => x is T" for given type T |
| isFor\<U\> | T when U = is\<T\> |
| ObjectGuard\<T\> | object/tuple type obtained by replacing each property type V of T with type guard is\<V\>; e.g. { a: is\<number\> } when T = { a: number }, or [is\<number\>, is\<boolean\>] when T = [number, boolean] tuple |
| ObjectGuardFor\<U\> | T when when U = ObjectGuard\<T\> |
| Nominal<T, B extends string> | nominal primitive type defined as T & Record<B, B>; B must be unique |
| Zero | literal 0 |
| Integer | integer, excluding NaN, +Infinity, -Infinity; defined as Nominal\<number, "integer"\> |
| Finite | finite numbers, excluding NaN, Infinity, -Infinity; defined as Nominal\<number, "finite"\> | 
| Positive | positive numbers, excluding 0, NaN, -Infinity, but including +Infinity; defined as Nominal\<number, "positive"\> |
| Negative | negative numbers, excluding 0, NaN, +Infinity, but including -Infinity; defined as Nominal\<number, "negative"\> |

and the following utility functions:

| export | type | description |
| - | - | - |
| isNumber | is\<number\> | typeguard for number primitive, including NaN, +Infinity, -Infinity |
| isZero | is\<Zero\> | typeguard for literal 0 |
| isInteger | is\<Integer\> | typeguard for Integer |
| isFinite | is\<Finite\> | typeguard for Finite |
| isPositive | is\<Postive\> | typeguard for Positive |
| isNegative | is\<Negative\> | typeguard for Negative |
| isBigint | is\<bigint\> | typeguard for bigint primitive |
| isString | is\<string\> | typeguard for string primitive |
| isBoolean | is\<boolean\> | typeguard for boolean primitive |
| isSymbol | is\<symbol\> | typeguard for symbol primitive |
| isFunction | is\<Function\> | typeguard for function |
| isEqual | (v: T) => is\<T\> | typeguard for type T when given value === v |
| isUndefined | is\<undefined\> | typeguard for undefined |
| isNull | is\<null\> | typeguard for null |
| isNil | is\<null \| undefined\> | typeguard for "nil" (null or undefined) |
| isOr | (f: is\<T\>, g: is\<U\>) => is\<T \| U\> | typeguard for type T \| U given is\<T\> and is\<U\> |
| isAnd | (f: is\<T\>, g: is\<U\>) => is\<T & U\> | typeguard for type T & U given is\<T\> and is\<U\> |
| isAnyOf | \<T extends readonly unknown[]\>(v: T) => (x: unknown): x is T[number] | typeguard for any value in given const array |
| isArray | (f: is\<T\>) => is\<T[]\> | typeguard for homogeneous array T[]; isArray(f)([]) is true |
| isObject | \<T extends object\>(g: ObjectGuard\<T\>, exact = true) => (x: unknown): x is T | typeguard for object/tuple type T given ObjectGuard\<T\>; isObject({})({}) is true; when exact is false, then properties not specified by ObjectGuard\<T\> are allowed; |
| isMatch | \<B extends string\>(b: B, r: RegExp) => is\<Nominal\<string, B\>\> | typeguard for strings matching regexp; B must be unique |
| to | \<T\>(guard: is\<T\>, error = (x: unknown) => new TypeError(\`type mismatch: ${x}\`))): (x: unknown) => T | returns a function (x: unknown) => T that returns x if x is of type T, otherwise throws error(x) |

## Examples

In order to use __typeguard__:

```
import * as G from "typeguard";
```

To perform runtime type check,

```
  // to check if x is of the following type:
  // type X = {
  //   a: number;
  //   b: boolean | undefined;
  //   c: {
  //     d: string;
  //     e: readonly [string, boolean]; // tuple
  //   } | null
  // }

  // define typeguard for type X as follows:
  const isX = G.isObject({
    a: G.isNumber,
    b: G.isOr(G.isBoolean, G.isUndefined),
    c: G.isOr(G.isNull, G.isObject({
      d: G.isString,
      e: G.isObject([G.isString, G.isBoolean] as const) // tuple
    }))
  });

  if (isX(x)) { 
    // x is of type X here
  }

  // note that type X can be derived from isX as follows:
  type X = G.isFor<typeof isX>;

```
