import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "../src/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
function Routes() {
  const { sessionId } = useApp();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F5F7FB" },
      }}
    >
      <Stack.Protected guard={!!sessionId}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="vehicul" />
        <Stack.Screen name="programare" />
        <Stack.Screen name="detalii-programare" />
      </Stack.Protected>
      <Stack.Protected guard={!sessionId}>
        <Stack.Screen name="autentificare" />
        <Stack.Screen name="creare-cont" />
      </Stack.Protected>
      <Stack.Screen name="reset" />
    </Stack>
  );
}
export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Routes />
      </AppProvider>
    </SafeAreaProvider>
  );
}
