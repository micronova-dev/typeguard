# Typeguard
Simple typescript [__typeguard__](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) runtime type-checking utilities including  object/tuple support and nominal types such as Zero, Integer, Finite, Positive, Negative, and Match (regexp).

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
| Is\<T = unknown\> | typeguard function type "(x: unknown) => x is T" for given type T (unknown by default) |
| IsFor\<U\> | T when U = Is\<T\>, otherwise unknown |
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
| isNumber | Is\<number\> | typeguard for number primitive, including NaN, +Infinity, -Infinity |
| isZero | Is\<Zero\> | typeguard for literal 0 |
| isInteger | Is\<Integer\> | typeguard for Integer |
| isFinite | Is\<Finite\> | typeguard for Finite |
| isPositive | Is\<Postive\> | typeguard for Positive |
| isNegative | Is\<Negative\> | typeguard for Negative |
| isBigint | Is\<bigint\> | typeguard for bigint primitive |
| isString | Is\<string\> | typeguard for string primitive |
| isBoolean | Is\<boolean\> | typeguard for boolean primitive |
| isSymbol | Is\<symbol\> | typeguard for symbol primitive |
| isFunction | Is\<Function\> | typeguard for function |
| isEqual | (v: T) => Is\<T\> | typeguard for type T when given value === v |
| isUndefined | Is\<undefined\> | typeguard for undefined |
| isNull | Is\<null\> | typeguard for null |
| isNil | Is\<null \| undefined\> | typeguard for "nil" (null or undefined) |
| isOr | (f: Is\<T\>, g: Is\<U\>, ...) => Is\<T \| U\ \| ...> | typeguard for type T \| U \| ... given Is\<T\>, Is\<U\>, ...; Note that isOr() with no arguments always returns false |
| isAnd | (f: Is\<T\>, g: Is\<U\>, ...) => Is\<T & U\ & ...> | typeguard for type T & U & ... given Is\<T\>, Is\<U\>, ...; Note that isAnd() with no arguments always returns true |
| isAnyOf | \<T extends readonly unknown[]\>(v: T) => (x: unknown): x is T[number] | typeguard for any value in given const array |
| isArray | (f: Is\<T\>) => Is\<T[]\> | typeguard for homogeneous array T[]; isArray(f)([]) is true |
| isObject | \<T extends object\>(g: ObjectGuard\<T\>, exact = true) => (x: unknown): x is T | typeguard for "plain" object/tuple type T (with Object or Array constructor) given ObjectGuard\<T\>; isObject({})({}) is true; when exact is false, then properties not specified by ObjectGuard\<T\> are allowed; |
| isMatch | \<B extends string\>(b: B, r: RegExp) => Is\<Nominal\<string, B\>\> | typeguard for strings matching regexp; B must be unique |
| isInstance<C> |  Is\<C\> | typeguard for instances of class (function) C |
| to | \<T\>(guard: Is\<T\>, error = (x: unknown) => new TypeError(\`type mismatch: ${x}\`))): (x: unknown) => T | returns a function (x: unknown) => T that returns x if x is of type T, otherwise throws error(x) |

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
  type X = G.IsFor<typeof isX>;

```
