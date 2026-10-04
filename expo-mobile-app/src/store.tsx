import React, { createContext, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStore } from "@white-label/core/src/store";
import { uid, type Data, type Actor } from "@white-label/core";
import {
  loadAuth,
  newSalt,
  normalizeEmail,
  passwordHash,
  resetAuth,
  saveAuth,
  type AuthState,
} from "./auth";
const store = createStore(AsyncStorage);
let setResetAuth: ((auth: AuthState) => void) | null = null;
const Context = createContext<{
  data: Data;
  ready: boolean;
  actor: Actor;
  customerId: string;
  sessionId: string | null;
  selected: string;
  setSelected: (id: string) => void;
  commit: (fn: (d: Data) => void, message?: string) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmation: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  error: string;
} | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data, ready: dataReady, error } = store.use();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selected, setSelected] = useState("v1");
  const [message, setMessage] = useState("");
  useEffect(() => {
    setResetAuth = setAuth;
    async function start() {
      try {
        await store.load();
        const loaded = await loadAuth();
        const validSession = store
          .getSnapshot()
          .data.customers.some((c) => c.id === loaded.sessionId);
        setAuth(
          validSession || !loaded.sessionId
            ? loaded
            : { ...loaded, sessionId: null },
        );
      } catch (e) {
        setMessage("Nu am putut încărca sesiunea. " + (e as Error).message);
        setAuth({ sessionId: null, accounts: [] });
      } finally {
        setAuthReady(true);
      }
    }
    void start();
    if (__DEV__)
      (
        globalThis as unknown as { resetWhiteLabel: () => Promise<void> }
      ).resetWhiteLabel = resetLocalData;
    return () => {
      setResetAuth = null;
    };
  }, []);
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);
  const commit = (
    fn: (d: Data) => void,
    text = "Modificările au fost salvate.",
  ) => {
    try {
      store.commit(fn);
      setMessage(text);
      return true;
    } catch (e) {
      setMessage((e as Error).message);
      return false;
    }
  };
  async function signIn(email: string, password: string) {
    if (!auth) throw Error("Sesiunea nu este pregătită.");
    const customer = data.customers.find(
      (c) => normalizeEmail(c.email) === normalizeEmail(email),
    );
    const account = auth.accounts.find((a) => a.customerId === customer?.id);
    if (
      !customer ||
      !account ||
      (await passwordHash(password, account.salt)) !== account.passwordHash
    )
      throw Error("E-mailul sau parola nu este corectă.");
    const next = { ...auth, sessionId: customer.id };
    await saveAuth(next);
    setSelected(
      data.vehicles.find((v) => v.customerId === customer.id)?.id ?? "",
    );
    setAuth(next);
  }
  async function signUp(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmation: string;
  }) {
    if (!auth) throw Error("Sesiunea nu este pregătită.");
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    const phone = input.phone.trim();
    if (
      !name ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !/^\+?[\d\s]{9,15}$/.test(phone)
    )
      throw Error("Verifică numele, adresa de e-mail și numărul de telefon.");
    if (input.password.length < 8)
      throw Error("Parola trebuie să aibă cel puțin 8 caractere.");
    if (input.password !== input.confirmation)
      throw Error("Parolele nu coincid.");
    if (data.customers.some((c) => normalizeEmail(c.email) === email))
      throw Error("Există deja un cont cu această adresă de e-mail.");
    const customerId = uid("c");
    const salt = newSalt();
    const account = {
      customerId,
      salt,
      passwordHash: await passwordHash(input.password, salt),
    };
    await store.commit((d) => {
      d.customers.push({
        id: customerId,
        name,
        email,
        phone,
        kind: "Persoană fizică",
        locationId: "central",
        preferences: { ...d.customers[0].preferences },
      });
    });
    if (store.getSnapshot().error)
      throw Error("Contul nu a putut fi salvat pe dispozitiv.");
    const next = {
      accounts: [...auth.accounts, account],
      sessionId: customerId,
    };
    await saveAuth(next);
    setSelected("");
    setAuth(next);
  }
  async function signOut() {
    if (!auth) return;
    const next = { ...auth, sessionId: null };
    await saveAuth(next);
    setSelected("");
    setAuth(next);
  }
  const customerId = auth?.sessionId ?? "";
  const ready = dataReady && authReady;
  return (
    <Context.Provider
      value={{
        data,
        ready,
        actor: { kind: "customer", id: customerId },
        customerId,
        sessionId: auth?.sessionId ?? null,
        selected,
        setSelected,
        commit,
        signIn,
        signUp,
        signOut,
        error,
      }}
    >
      {ready ? (
        children
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F5F7FB",
          }}
        >
          <ActivityIndicator color="#2862E6" accessibilityLabel="Se încarcă" />
        </View>
      )}
      {!!(message || error) && (
        <View style={styles.toast} accessibilityLiveRegion="polite">
          <Text style={styles.text}>{error || message}</Text>
        </View>
      )}
    </Context.Provider>
  );
}
const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 104,
    left: 22,
    right: 22,
    backgroundColor: "#193251",
    padding: 15,
    borderRadius: 12,
    zIndex: 100,
    elevation: 20,
  },
  text: { color: "#fff", fontSize: 13, lineHeight: 20, textAlign: "center" },
});
export function useApp() {
  const context = useContext(Context);
  if (!context) throw Error("Provider lipsește.");
  return context;
}

export async function resetLocalData() {
  if (__DEV__) {
    const auth = await resetAuth();
    setResetAuth?.(auth);
    await store.reset();
  }
}
