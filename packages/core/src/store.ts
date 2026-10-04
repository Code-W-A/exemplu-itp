import { useSyncExternalStore } from "react";
import {
  createRepository,
  rebuildScheduledNotifications,
  createSeed,
  type Data,
  type StorageAdapter,
} from "./index";
export function createStore(adapter: StorageAdapter) {
  const repository = createRepository(adapter);
  let snapshot = { data: createSeed(), ready: false, error: "" };
  const initial = snapshot;
  const listeners = new Set<() => void>();
  let queue = Promise.resolve();
  const emit = () => listeners.forEach((f) => f());
  return {
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    async load() {
      try {
        snapshot = { data: await repository.load(), ready: true, error: "" };
      } catch (e) {
        snapshot = {
          ...snapshot,
          ready: true,
          error: "Nu am putut încărca datele locale. " + (e as Error).message,
        };
      }
      emit();
    },
    commit(fn: (d: Data) => void) {
      const next: Data = JSON.parse(JSON.stringify(snapshot.data));
      fn(next);
      rebuildScheduledNotifications(next);
      snapshot = { data: next, ready: true, error: "" };
      emit();
      queue = queue
        .then(() => repository.save(next))
        .catch(() => {
          snapshot = {
            ...snapshot,
            error: "Modificările nu au putut fi salvate pe dispozitiv.",
          };
          emit();
        });
      return queue;
    },
    async reset() {
      await queue;
      snapshot = { data: await repository.reset(), ready: true, error: "" };
      emit();
    },
    use() {
      return useSyncExternalStore(
        this.subscribe,
        this.getSnapshot,
        this.getServerSnapshot,
      );
    },
  };
}
