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
  "uuid": "123e4567-e89b-12d3-a456-426614174000"
};

// asserts that only given named values are guarded
const guardsValues = <T>(guard: G.is<T>, names: (keyof typeof Value)[]) => {
  const table = new Map<unknown, boolean>(Object.values(Value).map((v) => [v, false]));
  names.forEach((v) => table.set(Value[v], true));
  table.forEach((v, k) => expect(guard(k)).toBe(v));
}

describe("typeguard", () => {
  it("number", () => guardsValues(
    G.isNumber,
    ["0", "1", "-1", "2.7", "-2.7", "NaN", "+Infinity", "-Infinity"]
  ));

  it("bigint", () => guardsValues(
    G.isBigint,
    ["12n"]
  ));

  it("string", () => guardsValues(
    G.isString,
    ["", "email", "uuid"]
  ));

  it("boolean", () => guardsValues(
    G.isBoolean,
    ["true", "false"]
  ));

  it("undefined", () => guardsValues(
    G.isUndefined,
    ["undefined"]
  ));

  it("null", () => guardsValues(
    G.isNull,
    ["null"]
  ));

  it("nil", () => guardsValues(
    G.isNil,
    ["undefined", "null"]
  ));

  it("integer", () => guardsValues(
    G.isInteger,
    ["0", "1", "-1"]
  ));

  it("finite", () => guardsValues(
    G.isFinite,
    ["0", "1", "-1", "2.7", "-2.7"]
  ));

  it("zero", () => guardsValues(
    G.isZero,
    ["0"]
  ));

  it("positive", () => guardsValues(
    G.isPositive,
    ["1", "2.7", "+Infinity"]
  ));

  it("negative", () => guardsValues(
    G.isNegative,
    ["-1", "-2.7", "-Infinity"]
  ));

  it("symbol", () => guardsValues(
    G.isSymbol,
    [":a"]
  ));

  it("function", () => guardsValues(
    G.isFunction,
    ["f"]
  ));

  it("isAnd", () => {
    G.isAnd(G.isInteger, G.isPositive),
    ["1"]
  })

  it("isOr", () => {
    G.isOr(G.isZero, G.isPositive),
    ["0", "1", "2.7"]
  })

  it("match", () => {
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

  it("object", () => {
    guardsValues(
      G.isObject({}),
      ["{}"]
    );

    guardsValues(
      G.isObject({
        a: G.isString,
        b: G.isNumber 
      }),
      ["object"]
    );

    guardsValues(
      G.isObject({
        a: G.isString,
        b: G.isString
      }),
      []
    );

    guardsValues(
      G.isObject({
        a: G.isString
      }, false),
      ["object"]
    );

    guardsValues(
      G.isObject({
        a: G.isNumber
      }, false),
      []
    );
 });

  it("tuple", () => {
    guardsValues(
      G.isObject([]),
      ["[]"]
    );

    guardsValues(
      G.isObject([G.isString, G.isNumber] as const),
      ["tuple"]
    );

    guardsValues(
      G.isObject([G.isString, G.isNumber, G.isBoolean] as const),
      []
    );

    guardsValues(
      G.isObject([G.isString] as const),
      []
    );

    guardsValues(
      G.isObject([G.isString] as const, false),
      ["tuple"]
    );
  });

  it("array", () => {
    guardsValues(
      G.isArray(G.isNumber),
      ["array", "[]"]
    );

    guardsValues(
      G.isArray(G.isString),
      ["[]"]
    );
  });

  it("isAnyOf", () => {
    guardsValues(
      G.isAnyOf([undefined, null, 1] as const),
      ["undefined", "null", "1"]
    )
  });
});
