import { useEffect } from "react";
import { router } from "expo-router";
import { resetLocalData } from "../src/store";
export default function Reset() {
  useEffect(() => {
    resetLocalData().then(() => router.replace("/"));
  }, []);
  return null;
}
