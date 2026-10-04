import { useState } from "react";
import { Text, View, Pressable, Switch, Linking } from "react-native";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Pencil,
  Clock,
  LogOut,
} from "lucide-react-native";
import { normalizeEmail } from "../../src/auth";
import { useApp } from "../../src/store";
import {
  Screen,
  Card,
  SectionTitle,
  Sheet,
  Field,
  Button,
  s,
  C,
} from "../../src/ui";
export default function Account() {
  const { data, customerId, commit, signOut } = useApp();
  const c = data.customers.find((c) => c.id === customerId)!;
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(c.name);
  const [email, setEmail] = useState(c.email);
  const [phone, setPhone] = useState(c.phone);
  const [error, setError] = useState("");
  const [signOutError, setSignOutError] = useState("");
  function save() {
    if (
      !name.trim() ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !/^\+?[\d\s]{9,15}$/.test(phone)
    ) {
      setError("Verifică numele, adresa de e-mail și numărul de telefon.");
      return;
    }
    if (
      data.customers.some(
        (other) =>
          other.id !== customerId &&
          normalizeEmail(other.email) === normalizeEmail(email),
      )
    ) {
      setError("Există deja un cont cu această adresă de e-mail.");
      return;
    }
    if (
      commit((d) => {
        Object.assign(
          d.customers.find((x) => x.id === customerId)!,
          {
            name: name.trim(),
            email: normalizeEmail(email),
            phone: phone.trim(),
          },
        );
      })
    )
      setEdit(false);
  }
  return (
    <Screen title="Contul meu" subtitle="Preferințele tale. Experiența ta.">
      <Card>
        <View style={s.between}>
          <View style={s.row}>
            <View
              style={[
                s.tile,
                {
                  height: 52,
                  width: 52,
                  borderRadius: 28,
                  backgroundColor: "#EAF1FE",
                },
              ]}
            >
              <Text style={{ fontSize: 18, color: C.blue, fontWeight: "600" }}>
                {c.name
                  .split(" ")
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join("")}
              </Text>
            </View>
            <View>
              <Text style={s.h2}>{c.name}</Text>
              <Text style={[s.small, { marginTop: 6 }]}>
                Client WHITE LABEL
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Editează profilul"
            onPress={() => setEdit(true)}
          >
            <Pencil size={18} color={C.blue} />
          </Pressable>
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <Mail size={16} color="#90A3BF" />
          <Text style={s.small}>{c.email}</Text>
        </View>
        <View style={[s.row, { marginTop: 11 }]}>
          <Phone size={16} color="#90A3BF" />
          <Text style={s.small}>{c.phone}</Text>
        </View>
      </Card>
      <View style={{ marginTop: 2 }}>
        {!!signOutError && (
          <Text style={[s.error, { marginBottom: 10 }]}>{signOutError}</Text>
        )}
        <Button
          secondary
          icon={<LogOut size={18} color={C.navy} />}
          onPress={() => {
            signOut().catch((e) => setSignOutError((e as Error).message));
          }}
        >
          Deconectare
        </Button>
      </View>
      <SectionTitle title="Preferințe notificări" />
      <Card>
        {Object.entries(c.preferences).map(([label, value], i) => (
          <View
            key={label}
            style={[
              s.between,
              {
                paddingVertical: 13,
                borderBottomWidth: i < 3 ? 1 : 0,
                borderBottomColor: "#ECF1F8",
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[s.text, { fontSize: 13, fontWeight: "500" }]}>
                {label}
              </Text>
              <Text style={[s.small, { fontSize: 10, marginTop: 5 }]}>
                {label === "Noutăți și oferte"
                  ? "Mesaje opționale, separate de vizite"
                  : "Reamintiri și actualizări utile"}
              </Text>
            </View>
            <Switch
              accessibilityLabel={label}
              value={value}
              trackColor={{ false: "#DDE5F1", true: C.blue }}
              thumbColor="white"
              onValueChange={(v) => {
                commit((d) => {
                  d.customers.find((x) => x.id === customerId)!.preferences[
                    label
                  ] = v;
                }, "Preferințele au fost salvate.");
              }}
            />
          </View>
        ))}
      </Card>
      <SectionTitle title="Locațiile noastre" />
      {data.locations.map((l) => (
        <Card key={l.id}>
          <View style={s.row}>
            <View style={s.tile}>
              <MapPin size={21} color={C.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.h2, { fontSize: 15 }]}>{l.name}</Text>
              <Text style={[s.small, { fontSize: 10, marginTop: 5 }]}>
                {l.address}
              </Text>
            </View>
          </View>
          <View style={[s.row, { marginTop: 16 }]}>
            <Clock size={15} color="#8A9FBC" />
            <Text style={s.small}>
              {l.opens} – {l.closes}
            </Text>
          </View>
          <Text style={[s.small, { fontSize: 10, marginTop: 9 }]}>
            {l.services.join(" · ")}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
            <View style={{ flex: 1 }}>
              <Button
                secondary
                onPress={() =>
                  Linking.openURL(
                    "https://www.google.com/maps/search/?api=1&query=" +
                      encodeURIComponent(l.address),
                  )
                }
              >
                Navighează
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                secondary
                onPress={() =>
                  Linking.openURL("tel:" + l.phone.replace(/\s/g, ""))
                }
              >
                Contact
              </Button>
            </View>
          </View>
        </Card>
      ))}
      <Text
        style={{
          fontSize: 9,
          color: "#A4B0C3",
          letterSpacing: 2,
          textAlign: "center",
          marginTop: 17,
        }}
      >
        WHITE LABEL · 1.0
      </Text>
      <Sheet title="Date personale" open={edit} onClose={() => setEdit(false)}>
        <Field label="Nume complet" value={name} onChangeText={setName} />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field
          label="Telefon"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        {!!error && <Text style={s.error}>{error}</Text>}
        <Button onPress={save}>Salvează datele</Button>
      </Sheet>
    </Screen>
  );
}
