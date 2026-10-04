import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { CalendarDays, MapPin, Plus, ArrowUpRight } from "lucide-react-native";
import { date } from "@white-label/core";
import { useApp } from "../../src/store";
import { Screen, Card, Button, Pill, Empty, s, C } from "../../src/ui";
export default function Appointments() {
  const { data, customerId } = useApp();
  const [history, setHistory] = useState(false);
  const list = data.appointments
    .filter(
      (a) =>
        a.customerId === customerId &&
        (history
          ? ["Anulată", "Finalizată"].includes(a.status) ||
            a.date < data.referenceDate
          : !["Anulată", "Finalizată"].includes(a.status) &&
            a.date >= data.referenceDate),
    )
    .sort((a, b) =>
      history
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    );
  return (
    <Screen
      title="Programările mele"
      subtitle="Fiecare vizită, bine organizată."
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#EAF0F8",
          padding: 4,
          borderRadius: 10,
          marginBottom: 22,
        }}
      >
        {[false, true].map((h) => (
          <Pressable
            key={String(h)}
            onPress={() => setHistory(h)}
            style={{
              flex: 1,
              padding: 11,
              backgroundColor: history === h ? "white" : "transparent",
              borderRadius: 7,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: history === h ? C.navy : C.muted,
                fontWeight: history === h ? "600" : "400",
              }}
            >
              {h ? "Istoric" : "Urmează"}
            </Text>
          </Pressable>
        ))}
      </View>
      {list.map((a) => (
        <Card
          key={a.id}
          onPress={() =>
            router.push({
              pathname: "/detalii-programare",
              params: { id: a.id },
            })
          }
        >
          <View style={s.between}>
            <View style={s.row}>
              <View style={s.tile}>
                <CalendarDays color={C.blue} size={22} />
              </View>
              <View>
                <Text style={[s.text, { fontWeight: "600" }]}>{a.service}</Text>
                <Text style={s.small}>
                  {data.vehicles.find((v) => v.id === a.vehicleId)?.plate}
                </Text>
              </View>
            </View>
            <Pill
              label={a.status}
              tone={a.status === "Anulată" ? "gray" : "green"}
            />
          </View>
          <View style={s.divider} />
          <View style={s.between}>
            <Text style={[s.text, { fontSize: 13, fontWeight: "600" }]}>
              {date(a.date)} · {a.time}
            </Text>
            <ArrowUpRight size={16} color={C.blue} />
          </View>
          <View style={[s.row, { marginTop: 9 }]}>
            <MapPin size={14} color={C.muted} />
            <Text style={s.small}>
              {data.locations.find((l) => l.id === a.locationId)?.name}
            </Text>
          </View>
        </Card>
      ))}
      {!list.length && (
        <Empty
          title={
            history ? "Nicio vizită în istoric" : "Nu ai vizite programate"
          }
          text="Alege serviciul și intervalul care ți se potrivesc."
        />
      )}
      <View style={{ marginTop: 12 }}>
        <Button
          onPress={() => router.push("/programare")}
          icon={<Plus size={19} color="white" />}
        >
          Programare nouă
        </Button>
      </View>
    </Screen>
  );
}
