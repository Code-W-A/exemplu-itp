import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

export const AUTH_KEY = "white-label-mobile-auth-v1";
export const ALEX_PASSWORD = "WhiteLabel2026!";

export type LocalAccount = {
  customerId: string;
  salt: string;
  passwordHash: string;
};

export type AuthState = {
  sessionId: string | null;
  accounts: LocalAccount[];
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function passwordHash(password: string, salt: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
}

export function newSalt() {
  return Array.from(Crypto.getRandomBytes(16), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function initialAuth(): Promise<AuthState> {
  const salt = newSalt();
  return {
    sessionId: "c1",
    accounts: [
      {
        customerId: "c1",
        salt,
        passwordHash: await passwordHash(ALEX_PASSWORD, salt),
      },
    ],
  };
}

export async function loadAuth(): Promise<AuthState> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) {
    const auth = await initialAuth();
    await saveAuth(auth);
    return auth;
  }
  const auth = JSON.parse(raw) as AuthState;
  if (!Array.isArray(auth.accounts) || !("sessionId" in auth)) {
    throw Error("Datele contului nu au un format compatibil.");
  }
  return auth;
}

export async function saveAuth(auth: AuthState) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export async function resetAuth() {
  const auth = await initialAuth();
  await saveAuth(auth);
  return auth;
}
