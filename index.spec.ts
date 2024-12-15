import * as G from ".";

const Value = {
  "undefined": undefined,
  "null": null,
  "": "",
  "0": 0,
  "1": 1,
  "-1": -1,
  "2.7": 2.7,
  "-2.7": -2.7,
  "{}": {},
  "[]": [],
  "true": true,
  "false": false,
  "NaN": NaN,
  "+Infinity": +Infinity,
  "-Infinity": -Infinity,
  "12n": BigInt(12),
  ":a": Symbol.for("a"),
  "f": () => {},
  "tuple": ["a", 3],
  "object": {
    a: "abc",
    b: 8
  },
  "array": [1, 2],
  "email": "abc@de.com",
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "date": new Date(),
  "regexp": /abc/g
} as const;

// asserts that only given named values are guarded
const guardsValues = <T>(guard: G.Is<T>, names: (keyof typeof Value)[]) => {
  const table = new Map<unknown, boolean>(Object.values(Value).map((v) => [v, false]));
  names.forEach((v) => table.set(Value[v], true));
  table.forEach((v, k) => expect(guard(k)).toBe(v));
}

describe("typeguard", () => {
  test("number", () => guardsValues<number>(
    G.isNumber,
    ["0", "1", "-1", "2.7", "-2.7", "NaN", "+Infinity", "-Infinity"]
  ));

  test("bigint", () => guardsValues<bigint>(
    G.isBigint,
    ["12n"]
  ));

  test("string", () => guardsValues<string>(
    G.isString,
    ["", "email", "uuid"]
  ));

  test("boolean", () => guardsValues<boolean>(
    G.isBoolean,
    ["true", "false"]
  ));

  test("undefined", () => guardsValues<undefined>(
    G.isUndefined,
    ["undefined"]
  ));

  test("null", () => guardsValues<null>(
    G.isNull,
    ["null"]
  ));

  test("nil", () => guardsValues<undefined | null>(
    G.isNil,
    ["undefined", "null"]
  ));

  test("integer", () => guardsValues<G.Integer>(
    G.isInteger,
    ["0", "1", "-1"]
  ));

  test("finite", () => guardsValues<G.Finite>(
    G.isFinite,
    ["0", "1", "-1", "2.7", "-2.7"]
  ));

  test("zero", () => guardsValues<G.Zero>(
    G.isZero,
    ["0"]
  ));

  test("positive", () => guardsValues<G.Positive>(
    G.isPositive,
    ["1", "2.7", "+Infinity"]
  ));

  test("negative", () => guardsValues<G.Negative>(
    G.isNegative,
    ["-1", "-2.7", "-Infinity"]
  ));

  test("symbol", () => guardsValues<symbol>(
    G.isSymbol,
    [":a"]
  ));

  test("function", () => guardsValues<Function>(
    G.isFunction,
    ["f"]
  ));

  test("isAnd", () => {
    guardsValues<number & G.Finite & G.Negative>(
      G.isAnd(G.isNumber, G.isFinite, G.isNegative),
      ["-1", "-2.7"]
    );

    guardsValues<G.Integer & G.Positive>(
      G.isAnd(G.isInteger, G.isPositive),
      ["1"]
    );

    guardsValues<G.Zero>(
      G.isAnd(G.isZero),
      ["0"]
    );

    guardsValues<unknown>(
      G.isAnd(),
      Object.keys(Value) as (keyof typeof Value)[]
    );
  });

  test("isOr", () => {
    guardsValues<G.Zero | G.Positive | G.Negative>(
      G.isOr(G.isZero, G.isPositive, G.isNegative),
      ["0", "1", "2.7", "+Infinity", "-1", "-2.7", "-Infinity"]
    );

    guardsValues<G.Zero | G.Positive>(
      G.isOr(G.isZero, G.isPositive),
      ["0", "1", "2.7", "+Infinity"]
    );

    guardsValues<unknown>(
      G.isOr(G.isZero),
      ["0"]
    );

    guardsValues<unknown>(
      G.isOr(),
      []
    );
  })

  test("match", () => {
    const isEmail = G.isMatch("email", /([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])/);

    guardsValues(
      isEmail,
      ["email"]
    );

    const isUUID = G.isMatch("uuid", /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

    guardsValues(
      isUUID,
      ["uuid"]
    );

    const isEmailOrEmpty = G.isOr(isEmail, G.isEqual("" as const));

    guardsValues(
      isEmailOrEmpty,
      ["email", ""]
    );
  })

  test("object", () => {
    guardsValues<{}>(
      G.isObject({}),
      ["{}"]
    );

    guardsValues<{ a: string, b: number }>(
      G.isObject({
        a: G.isString,
        b: G.isNumber 
      }),
      ["object"]
    );

    guardsValues<{ a: String, b: string }>(
      G.isObject({
        a: G.isString,
        b: G.isString
      }),
      []
    );

    guardsValues<{ a: string }>(
      G.isObject({
        a: G.isString
      }, false),
      ["object"]
    );

    guardsValues<{ a: number }>(
      G.isObject({
        a: G.isNumber
      }, false),
      []
    );
 });

  test("tuple", () => {
    guardsValues<[]>(
      G.isObject([]),
      ["[]"]
    );

    guardsValues<readonly [string, number]>(
      G.isObject([G.isString, G.isNumber] as const),
      ["tuple"]
    );

    guardsValues<readonly [String, number, boolean]>(
      G.isObject([G.isString, G.isNumber, G.isBoolean] as const),
      []
    );

    guardsValues<readonly [string]>(
      G.isObject([G.isString] as const),
      []
    );

    guardsValues<readonly [string]>(
      G.isObject([G.isString] as const, false),
      ["tuple"]
    );
  });

  test("array", () => {
    guardsValues<number[]>(
      G.isArray(G.isNumber),
      ["array", "[]"]
    );

    guardsValues<string[]>(
      G.isArray(G.isString),
      ["[]"]
    );
  });

  test("isAnyOf", () => {
    guardsValues<undefined | null | 1>(
      G.isAnyOf([undefined, null, 1] as const),
      ["undefined", "null", "1"]
    )
  });

  test("isInstance", () => {
    guardsValues<Date>(
      G.isInstance(Date),
      ["date"]
    );

    guardsValues<RegExp>(
      G.isInstance(RegExp),
      ["regexp"]
    )

    guardsValues<Object>(
      G.isInstance(Object),
      ["{}", "[]", "f", "tuple", "object", "array", "date", "regexp"]
    );
  })
});
