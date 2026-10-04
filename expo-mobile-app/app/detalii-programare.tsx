import { useState } from "react";
import { View, Text, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  CalendarDays,
  CarFront,
  MapPin,
  Clock,
  Check,
} from "lucide-react-native";
import { date, setAppointmentStatus } from "@white-label/core";
import { useApp } from "../src/store";
import { Screen, Card, Pill, Button, Sheet, Empty, s, C } from "../src/ui";
export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, actor, customerId, commit } = useApp();
  const [cancel, setCancel] = useState(false);
  const a = data.appointments.find(
    (a) => a.id === id && a.customerId === customerId,
  );
  if (!a)
    return (
      <Screen back title="Programare indisponibilă">
        <Empty />
      </Screen>
    );
  const v = data.vehicles.find((v) => v.id === a.vehicleId)!;
  const l = data.locations.find((l) => l.id === a.locationId)!;
  return (
    <Screen
      back
      title="Detaliile vizitei"
      subtitle="Ne ocupăm de restul. Tu bucură-te de drum."
    >
      <Card style={{ alignItems: "center", padding: 28 }}>
        <View
          style={[
            s.tile,
            {
              height: 55,
              width: 55,
              backgroundColor: "#EAF7F0",
              borderRadius: 30,
              marginBottom: 17,
            },
          ]}
        >
          <Check size={29} color={C.green} />
        </View>
        <Pill
          label={a.status}
          tone={a.status === "Anulată" ? "gray" : "green"}
        />
        <Text style={[s.h1, { marginTop: 20, fontSize: 34 }]}>{a.time}</Text>
        <Text style={[s.small, { marginTop: 8 }]}>{date(a.date, true)}</Text>
        <View style={[s.divider, { alignSelf: "stretch" }]} />
        <Text style={s.h2}>{a.service}</Text>
        <Text style={[s.small, { marginTop: 7 }]}>
          {v.plate} · {v.make} {v.model}
        </Text>
      </Card>
      <Card>
        <View style={s.row}>
          <MapPin color={C.blue} size={22} />
          <View style={{ flex: 1 }}>
            <Text style={s.h2}>{l.name}</Text>
            <Text style={[s.small, { marginTop: 7 }]}>{l.address}</Text>
          </View>
        </View>
        <View style={{ marginTop: 18 }}>
          <Button
            secondary
            onPress={() =>
              Linking.openURL(
                "https://www.google.com/maps/search/?api=1&query=" +
                  encodeURIComponent(l.address),
              )
            }
          >
            Navighează către locație
          </Button>
        </View>
      </Card>
      <Card style={{ backgroundColor: "#EDF3FC" }}>
        <Text style={[s.text, { fontWeight: "600", fontSize: 12 }]}>
          Înainte de vizită
        </Text>
        <Text style={[s.small, { marginTop: 7 }]}>
          Vino cu câteva minute înainte de ora programată și adu documentele
          vehiculului. Pentru întrebări, echipa locației îți stă la dispoziție.
        </Text>
      </Card>
      {!["Anulată", "Finalizată", "În lucru"].includes(a.status) && (
        <View style={{ gap: 12, marginTop: 10 }}>
          <Button
            onPress={() =>
              router.push({ pathname: "/programare", params: { editId: a.id } })
            }
          >
            Reprogramează vizita
          </Button>
          <Button danger onPress={() => setCancel(true)}>
            Anulează programarea
          </Button>
        </View>
      )}
      <Sheet
        title="Anulezi programarea?"
        open={cancel}
        onClose={() => setCancel(false)}
      >
        <Text style={[s.small, { marginBottom: 22 }]}>
          Vizita din {date(a.date)}, ora {a.time}, va fi anulată. Poți face o
          nouă programare oricând.
        </Text>
        <View style={{ gap: 12 }}>
          <Button
            danger
            onPress={() => {
              if (
                commit(
                  (d) => setAppointmentStatus(d, actor, a.id, "Anulată"),
                  "Programarea a fost anulată.",
                )
              )
                setCancel(false);
            }}
          >
            Confirmă anularea
          </Button>
          <Button secondary onPress={() => setCancel(false)}>
            Păstrează programarea
          </Button>
        </View>
      </Sheet>
    </Screen>
  );
}
