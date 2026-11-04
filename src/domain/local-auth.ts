export type LocalAccount = {
  customerId: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  recoverySalt: string;
  recoveryHash: string;
};
export type AuthData = {
  version: 1;
  accounts: LocalAccount[];
  sessionCustomerId: string | null;
};
export type PublicAccount = Pick<LocalAccount, "customerId" | "email">;
export type SignUpInput = { name: string; email: string; password: string };
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export function validateEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Enter a valid email address.");
}
export function validatePassword(password: string): void {
  if (password.length < 8)
    throw new Error("Use a password with at least 8 characters.");
  if (password.length > 128)
    throw new Error("Use a password with no more than 128 characters.");
}
export function emptyAuthData(): AuthData {
  return { version: 1, accounts: [], sessionCustomerId: null };
}
export function parseAuthData(raw: string): AuthData {
  const value: unknown = JSON.parse(raw);
  const record = (item: unknown): item is Record<string, unknown> =>
    !!item && typeof item === "object";
  const validHash = (item: unknown) =>
    typeof item === "string" && /^[a-f0-9]{64}$/i.test(item);
  if (
    !record(value) ||
    value.version !== 1 ||
    !Array.isArray(value.accounts) ||
    !value.accounts.every(
      (account) =>
        record(account) &&
        typeof account.customerId === "string" &&
        account.customerId.length > 0 &&
        typeof account.email === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email) &&
        account.email === normalizeEmail(account.email) &&
        typeof account.passwordSalt === "string" &&
        account.passwordSalt.length > 0 &&
        typeof account.recoverySalt === "string" &&
        account.recoverySalt.length > 0 &&
        validHash(account.passwordHash) &&
        validHash(account.recoveryHash),
    ) ||
    (value.sessionCustomerId !== null &&
      typeof value.sessionCustomerId !== "string")
  ) {
    throw new Error(
      "Saved local accounts could not be read. Your data has been preserved.",
    );
  }
  const accounts = value.accounts as LocalAccount[];
  if (
    new Set(accounts.map((account) => account.customerId)).size !==
      accounts.length ||
    new Set(accounts.map((account) => account.email)).size !==
      accounts.length ||
    (value.sessionCustomerId !== null &&
      !accounts.some(
        (account) => account.customerId === value.sessionCustomerId,
      ))
  ) {
    throw new Error(
      "Saved local accounts could not be read. Your data has been preserved.",
    );
  }
  return value as AuthData;
}
