import { execFileSync } from "node:child_process";
const target = process.argv[2];
if (target === "ios") {
  const origin = process.argv[3] || "exp://localhost:8082";
  execFileSync("xcrun", ["simctl", "openurl", "booted", origin + "/--/reset"], {
    stdio: "inherit",
  });
  console.log("Resetare solicitată în aplicația iOS de dezvoltare.");
} else {
  console.log(
    "Web: în consola browserului aplicației rulează await window.resetWhiteLabel().",
  );
  console.log(
    "Expo web: în consola aplicației rulează await globalThis.resetWhiteLabel().",
  );
  console.log("iOS Simulator: npm run reset -- ios exp://localhost:8082");
  console.log(
    "Se resetează exclusiv datele locale WHITE LABEL ale aplicației respective.",
  );
}
