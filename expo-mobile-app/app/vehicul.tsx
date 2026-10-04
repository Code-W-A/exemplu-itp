import { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Gauge,
  ShieldCheck,
  Wrench,
  CalendarDays,
  Pencil,
  CarFront,
  Check,
  Clock,
} from "lucide-react-native";
import {
  date,
  number,
  expiry,
  maintenance,
  updateMileage,
} from "@white-label/core";
import { useApp } from "../src/store";
import {
  Screen,
  Card,
  CarArt,
  Pill,
  Button,
  SectionTitle,
  Sheet,
  Field,
  Empty,
  s,
  C,
} from "../src/ui";
export default function Vehicle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, actor, customerId, commit } = useApp();
  const v = data.vehicles.find(
    (v) => v.id === id && v.customerId === customerId,
  );
  const [editing, setEditing] = useState(false);
  const [km, setKm] = useState("");
  const [error, setError] = useState("");
  if (!v)
    return (
      <Screen back title="Vehicul indisponibil">
        <Empty />
      </Screen>
    );
  const itp = data.itps.find((i) => i.vehicleId === v.id)!;
  const e = expiry(itp.expires, data.referenceDate);
  const tach = data.tachographs.find((t) => t.vehicleId === v.id);
  function save() {
    try {
      updateMileage(JSON.parse(JSON.stringify(data)), actor, id, Number(km));
      if (commit((d) => updateMileage(d, actor, id, Number(km))))
        setEditing(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Screen
      title="Detalii vehicul"
      subtitle="Tot ce contează, la îndemână."
      back
    >
      <Card
        style={{
          backgroundColor: "#1B3353",
          borderColor: "#1B3353",
          padding: 23,
        }}
      >
        <View style={s.between}>
          <View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "white",
                letterSpacing: 0.7,
              }}
            >
              {v.plate}
            </Text>
            <Text style={{ fontSize: 12, color: "#A9BFD9", marginTop: 8 }}>
              {v.make} {v.model}
            </Text>
            <Text style={{ fontSize: 10, color: "#8CA8CA", marginTop: 6 }}>
              {v.year} · {v.category}
            </Text>
          </View>
          <CarArt width={140} />
        </View>
      </Card>
      <Card>
        <View style={s.between}>
          <View style={s.row}>
            <Gauge size={20} color={C.blue} />
            <View>
              <Text style={s.small}>Kilometraj actual</Text>
              <Text style={[s.h2, { marginTop: 5 }]}>
                {number(v.mileage)} km
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Actualizează kilometrajul"
            onPress={() => {
              setKm(String(v.mileage));
              setError("");
              setEditing(true);
            }}
            style={[s.tile, { height: 35, width: 35 }]}
          >
            <Pencil size={17} color={C.blue} />
          </Pressable>
        </View>
      </Card>
      <Card>
        <View style={s.between}>
          <View style={s.row}>
            <ShieldCheck size={22} color={C.orange} />
            <Text style={s.h2}>Inspecție tehnică</Text>
          </View>
          <Pill label={e.label} tone={e.tone} />
        </View>
        <Text style={[s.small, { marginTop: 13 }]}>ITP valabil până la</Text>
        <Text style={[s.h2, { marginTop: 6 }]}>{date(itp.expires, true)}</Text>
      </Card>
      <SectionTitle title="Plan de întreținere" />
      {data.rules
        .filter((r) => r.vehicleId === id)
        .map((r) => {
          const m = maintenance(r, v, data.referenceDate);
          return (
            <Card key={r.id}>
              <View style={s.between}>
                <View style={s.row}>
                  <Wrench size={19} color={C.blue} />
                  <Text style={[s.h2, { fontSize: 14 }]}>{r.operation}</Text>
                </View>
                <Pill label={m.label} tone={m.tone} />
              </View>
              <Text style={[s.text, { fontWeight: "600", marginTop: 16 }]}>
                {m.nextKm ? number(m.nextKm) + " km" : ""}
                {m.nextKm && m.nextDate ? " sau " : ""}
                {m.nextDate ? date(m.nextDate) : ""}
              </Text>
              <Text style={[s.small, { fontSize: 10, marginTop: 6 }]}>
                Oricare prag este atins primul
              </Text>
              {m.remaining !== null && (
                <Text
                  style={{
                    fontSize: 12,
                    color: m.due ? C.red : C.orange,
                    marginTop: 13,
                    fontWeight: "600",
                  }}
                >
                  {m.remaining > 0
                    ? `Mai ai ${number(m.remaining)} km`
                    : `Prag atins · ${number(-m.remaining)} km depășire`}
                </Text>
              )}
              <View
                style={{
                  height: 5,
                  backgroundColor: "#EDF1F7",
                  borderRadius: 4,
                  marginTop: 15,
                }}
              >
                <View
                  style={{
                    width: `${Math.min(100, Math.max(3, ((v.mileage - r.lastKm) / (r.intervalKm || 1)) * 100))}%`,
                    backgroundColor: m.due ? C.red : C.blue,
                    height: 5,
                    borderRadius: 4,
                  }}
                />
              </View>
            </Card>
          );
        })}
      <Card>
        <View style={s.row}>
          <CarFront size={20} color={C.blue} />
          <Text style={s.h2}>Anvelope</Text>
        </View>
        <Text style={[s.text, { marginTop: 12 }]}>{v.tires}</Text>
        <Text style={s.small}>Verificare recomandată: {date(v.tireDate)}</Text>
      </Card>
      {tach && (
        <>
          <SectionTitle title="Tahograf" />
          <Card>
            <View style={s.between}>
              <Text style={s.h2}>{tach.type}</Text>
              <Pill
                label={expiry(tach.nextDate, data.referenceDate).label}
                tone={expiry(tach.nextDate, data.referenceDate).tone}
              />
            </View>
            <Text style={[s.small, { marginTop: 8 }]}>
              Serie: {tach.serial}
            </Text>
            <View style={s.divider} />
            <Text style={s.small}>
              Ultima verificare: {date(tach.lastDate)}
            </Text>
            <Text style={[s.text, { fontWeight: "600", marginTop: 7 }]}>
              Următoarea: {date(tach.nextDate)}
            </Text>
            <Text style={[s.small, { marginTop: 5 }]}>
              {data.locations.find((l) => l.id === tach.locationId)?.name}
            </Text>
            {tach.history.map((h, i) => (
              <Text key={i} style={[s.small, { fontSize: 10, marginTop: 10 }]}>
                {date(h.date)} · {h.note}
              </Text>
            ))}
            <View style={{ marginTop: 18 }}>
              <Button
                secondary
                onPress={() =>
                  router.push({
                    pathname: "/programare",
                    params: { vehicleId: id, service: "Verificare tahograf" },
                  })
                }
              >
                Programează verificarea
              </Button>
            </View>
          </Card>
        </>
      )}
      <SectionTitle title="Istoric service" />
      {data.records
        .filter((r) => r.vehicleId === id)
        .map((r) => (
          <Card key={r.id}>
            <View style={s.row}>
              <View style={[s.tile, { backgroundColor: "#EAF7F0" }]}>
                <Check size={19} color={C.green} />
              </View>
              <View>
                <Text style={[s.text, { fontWeight: "600" }]}>
                  {r.operation}
                </Text>
                <Text style={s.small}>
                  {date(r.date)} · {number(r.mileage)} km
                </Text>
              </View>
            </View>
          </Card>
        ))}
      <SectionTitle title="Programările vehiculului" />
      {data.appointments
        .filter((a) => a.vehicleId === id)
        .map((a) => (
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
              <View>
                <Text style={[s.text, { fontWeight: "600" }]}>{a.service}</Text>
                <Text style={s.small}>
                  {date(a.date)} · {a.time}
                </Text>
              </View>
              <Pill
                label={a.status}
                tone={a.status === "Anulată" ? "gray" : "green"}
              />
            </View>
          </Card>
        ))}
      <View style={{ marginTop: 12 }}>
        <Button
          onPress={() =>
            router.push({ pathname: "/programare", params: { vehicleId: id } })
          }
        >
          Programează acest vehicul
        </Button>
      </View>
      <Sheet
        title="Actualizează kilometrajul"
        open={editing}
        onClose={() => setEditing(false)}
      >
        <Text style={[s.small, { marginBottom: 20 }]}>
          Ultima valoare: {number(v.mileage)} km. Pragurile de întreținere se
          actualizează automat.
        </Text>
        <Field
          label="Kilometraj actual (km)"
          value={km}
          onChangeText={setKm}
          keyboardType="number-pad"
        />
        {!!error && <Text style={s.error}>{error}</Text>}
        <Button onPress={save}>Salvează kilometrajul</Button>
      </Sheet>
    </Screen>
  );
}
