import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useApp } from "../src/store";
import { Button, Card, Field, Screen, s, C } from "../src/ui";

export default function CreareCont() {
  const { signUp } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await signUp({ name, email, phone, password, confirmation });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      back
      title="Creează cont"
      subtitle="Datele tale, într-un singur loc."
    >
      <Card style={{ padding: 22 }}>
        <Field
          label="Nume complet"
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label="Telefon"
          value={phone}
          onChangeText={setPhone}
          autoComplete="tel"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />
        <Field
          label="Parolă"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="off"
          textContentType="none"
        />
        <Field
          label="Confirmă parola"
          value={confirmation}
          onChangeText={setConfirmation}
          secureTextEntry
          autoComplete="off"
          textContentType="none"
        />
        <Text style={[s.small, { marginBottom: 16 }]}>
          Parola trebuie să aibă cel puțin 8 caractere.
        </Text>
        {!!error && (
          <Text style={[s.error, { marginBottom: 14 }]}>{error}</Text>
        )}
        <Button onPress={submit} disabled={busy}>
          {busy ? "Se creează contul..." : "Creează contul"}
        </Button>
      </Card>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 26,
          gap: 6,
        }}
      >
        <Text style={s.small}>Ai deja cont?</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.replace("/autentificare")}
        >
          <Text style={{ color: C.blue, fontSize: 13, fontWeight: "700" }}>
            Autentifică-te
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
