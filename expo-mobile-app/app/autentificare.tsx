import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff, LockKeyhole } from "lucide-react-native";
import { useApp } from "../src/store";
import { Button, Card, Field, Screen, s, C } from "../src/ui";

export default function Autentificare() {
  const { signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: 32, marginBottom: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={[s.tile, { width: 48, height: 48, borderRadius: 15 }]}>
            <LockKeyhole size={23} color={C.blue} />
          </View>
          <Text
            style={{
              color: C.navy,
              fontSize: 14,
              fontWeight: "800",
              letterSpacing: 2,
            }}
          >
            WHITE LABEL
          </Text>
        </View>
        <Text style={[s.h1, { marginTop: 36, fontSize: 30 }]}>
          Bine ai revenit.
        </Text>
        <Text style={[s.subtitle, { marginTop: 10 }]}>
          Intră în contul tău pentru a continua.
        </Text>
      </View>
      <Card style={{ padding: 22 }}>
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="off"
          keyboardType="email-address"
          textContentType="none"
        />
        <Field
          label="Parolă"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!visible}
          autoComplete="off"
          textContentType="none"
          onSubmitEditing={submit}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ascunde parola" : "Arată parola"}
          onPress={() => setVisible((value) => !value)}
          style={{
            alignSelf: "flex-end",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 18,
          }}
        >
          {visible ? (
            <EyeOff size={16} color={C.blue} />
          ) : (
            <Eye size={16} color={C.blue} />
          )}
          <Text style={{ color: C.blue, fontSize: 12, fontWeight: "600" }}>
            {visible ? "Ascunde parola" : "Arată parola"}
          </Text>
        </Pressable>
        {!!error && (
          <Text style={[s.error, { marginBottom: 14 }]}>{error}</Text>
        )}
        <Button onPress={submit} disabled={busy || !email.trim() || !password}>
          {busy ? "Se autentifică..." : "Autentifică-te"}
        </Button>
      </Card>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 30,
          gap: 6,
        }}
      >
        <Text style={s.small}>Nu ai cont?</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/creare-cont")}
        >
          <Text style={{ color: C.blue, fontSize: 13, fontWeight: "700" }}>
            Creează cont
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
