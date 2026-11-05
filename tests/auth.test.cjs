const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  emptyAuthData,
  normalizeEmail,
  parseAuthData,
  validateEmail,
  validatePassword,
} = require("../src/domain/local-auth.ts");

function savedAccount(overrides = {}) {
  return {
    customerId: "local-account",
    email: "user@example.com",
    passwordSalt: "a-unique-password-salt",
    passwordHash: "a".repeat(64),
    recoverySalt: "a-unique-recovery-salt",
    recoveryHash: "b".repeat(64),
    ...overrides,
  };
}

function signedInData(overrides = {}) {
  return {
    version: 1,
    accounts: [savedAccount()],
    sessionCustomerId: "local-account",
    ...overrides,
  };
}

test("a fresh local install starts signed out and survives storage roundtrip", () => {
  assert.deepEqual(emptyAuthData(), {
    version: 1,
    accounts: [],
    sessionCustomerId: null,
  });
  assert.deepEqual(
    parseAuthData(JSON.stringify(emptyAuthData())),
    emptyAuthData(),
  );
});

test("login email normalization makes surrounding whitespace and case consistent", () => {
  assert.equal(normalizeEmail("  User@Example.COM  "), "user@example.com");
  assert.doesNotThrow(() =>
    validateEmail(normalizeEmail("  User@Example.COM  ")),
  );
});

test("invalid addresses are rejected before a local account is registered", () => {
  for (const email of [
    "",
    "missing-at",
    "user@",
    "@example.com",
    "user@example",
    "user name@example.com",
  ]) {
    assert.throws(() => validateEmail(email), /valid email/);
  }
});

test("password validation accepts the stated length boundaries", () => {
  assert.doesNotThrow(() => validatePassword("a".repeat(8)));
  assert.doesNotThrow(() => validatePassword("a".repeat(128)));
  assert.throws(() => validatePassword("a".repeat(7)), /at least 8/);
  assert.throws(() => validatePassword("a".repeat(129)), /no more than 128/);
});

test("hashed credentials and their active account survive a storage roundtrip", () => {
  const data = signedInData();
  assert.deepEqual(parseAuthData(JSON.stringify(data)), data);
});

test("an account can remain saved while the session is signed out", () => {
  const data = signedInData({ sessionCustomerId: null });
  assert.deepEqual(parseAuthData(JSON.stringify(data)), data);
});

test("malformed stored auth data is rejected instead of silently discarding accounts", () => {
  for (const value of [
    null,
    [],
    {},
    { version: 2, accounts: [], sessionCustomerId: null },
    { version: 1, accounts: [], sessionCustomerId: "missing" },
  ]) {
    assert.throws(() => parseAuthData(JSON.stringify(value)), /preserved/);
  }
  assert.throws(() => parseAuthData("not valid json"));
});

test("a persisted session must point to a saved account", () => {
  assert.throws(
    () =>
      parseAuthData(
        JSON.stringify(signedInData({ sessionCustomerId: "other-account" })),
      ),
    /preserved/,
  );
});

test("duplicate login emails and profile IDs are rejected in stored accounts", () => {
  assert.throws(
    () =>
      parseAuthData(
        JSON.stringify(
          signedInData({
            accounts: [
              savedAccount(),
              savedAccount({ customerId: "other-id" }),
            ],
          }),
        ),
      ),
    /preserved/,
  );
  assert.throws(
    () =>
      parseAuthData(
        JSON.stringify(
          signedInData({
            accounts: [
              savedAccount(),
              savedAccount({ email: "other@example.com" }),
            ],
          }),
        ),
      ),
    /preserved/,
  );
});

test("stored account identifiers, salts and hashes must be usable", () => {
  for (const overrides of [
    { customerId: "" },
    { email: "User@Example.com" },
    { passwordSalt: "" },
    { recoverySalt: "" },
    { passwordHash: "plaintext-password" },
    { recoveryHash: "plaintext-recovery-code" },
  ]) {
    assert.throws(
      () =>
        parseAuthData(
          JSON.stringify(signedInData({ accounts: [savedAccount(overrides)] })),
        ),
      /preserved/,
    );
  }
});
