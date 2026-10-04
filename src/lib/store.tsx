"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createStore } from "@white-label/core/src/store";
import {
  can,
  visibleLocations,
  type Actor,
  type Data,
  type Module,
} from "@white-label/core";
const store = createStore({
  getItem: async (k) => localStorage.getItem(k),
  setItem: async (k, v) => localStorage.setItem(k, v),
  removeItem: async (k) => localStorage.removeItem(k),
});
type AppContext = {
  data: Data;
  ready: boolean;
  actor: Actor;
  setActor: (id: string) => void;
  location: string;
  setLocation: (id: string) => void;
  search: string;
  setSearch: (s: string) => void;
  commit: (fn: (d: Data) => void, message?: string) => boolean;
  allowed: (m: Module) => boolean;
  locations: Data["locations"];
  scope: (id: string) => boolean;
  toast: string;
};
const Context = createContext<AppContext | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const { data, ready, error } = store.use();
  const [actorId, setActorId] = useState("s0");
  const [location, setLocation] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const actor: Actor = { kind: "staff", id: actorId };
  const locations = visibleLocations(data, actor);
  useEffect(() => {
    store.load();
    if (process.env.NODE_ENV === "development")
      (
        window as unknown as { resetWhiteLabel: () => Promise<void> }
      ).resetWhiteLabel = () => store.reset();
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  function commit(
    fn: (d: Data) => void,
    message = "Modificările au fost salvate.",
  ) {
    try {
      store.commit(fn);
      setToast(message);
      return true;
    } catch (e) {
      setToast((e as Error).message);
      return false;
    }
  }
  const scope = (id: string) =>
    locations.some((l) => l.id === id) &&
    (location === "all" || location === id);
  return (
    <Context.Provider
      value={{
        data,
        ready,
        actor,
        setActor: (id) => {
          setActorId(id);
          setLocation("all");
        },
        location,
        setLocation,
        search,
        setSearch,
        commit,
        allowed: (m) => can(data, actor, m),
        locations,
        scope,
        toast,
      }}
    >
      {children}
      {(toast || error) && (
        <div className={"toast " + (error ? "error" : "")} role="status">
          {error || toast}
        </div>
      )}
    </Context.Provider>
  );
}
export function useApp() {
  const c = useContext(Context);
  if (!c) throw Error("Provider lipsește");
  return c;
}
