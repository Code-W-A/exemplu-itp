import { spawn } from "node:child_process";
const port = process.env.PORT || "8082";
const child = spawn(
  "npm",
  [
    "run",
    "start",
    "-w",
    "expo-mobile-app",
    "--",
    "--localhost",
    "--port",
    port,
    "--ios",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      EXPO_PACKAGER_PROXY_URL: `http://localhost:${port}`,
    },
  },
);
child.on("exit", (code) => process.exit(code ?? 0));
