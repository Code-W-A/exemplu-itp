import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import {
  Bell,
  ChevronDown,
  ArrowUpRight,
  CalendarDays,
  ShieldCheck,
  Wrench,
  Gauge,
  MapPin,
  CarFront,
  ArrowRight,
} from "lucide-react-native";
import { date, number, expiry, maintenance } from "@white-label/core";
import { useApp } from "../../src/store";
import {
  Screen,
  Card,
  Button,
  Pill,
  SectionTitle,
  Sheet,
  Choice,
  CarArt,
  Label,
  Empty,
  s,
  C,
} from "../../src/ui";
import { AddVehicle } from "../../src/vehicle-form";
export default function Home() {
  const { data, customerId, selected, setSelected, ready } = useApp();
  const [picker, setPicker] = useState(false);
  const [add, setAdd] = useState(false);
  const vs = data.vehicles.filter((v) => v.customerId === customerId);
  const v = vs.find((v) => v.id === selected) ?? vs[0];
  const firstName =
    data.customers.find((c) => c.id === customerId)?.name.split(" ")[0] ?? "";
  if (!v)
    return (
      <Screen>
        <View style={st.header}>
          <Text style={st.brand}>WHITE LABEL</Text>
        </View>
        <View style={st.greeting}>
          <Text style={s.small}>Bună ziua, {firstName}</Text>
          <Text style={st.title}>Bine ai venit.</Text>
        </View>
        <Empty
          title="Adaugă primul vehicul"
          text="După adăugare, vei vedea aici termenele și programările tale."
        />
        <Button onPress={() => setAdd(true)}>Adaugă un vehicul</Button>
        {add && <AddVehicle onClose={() => setAdd(false)} />}
      </Screen>
    );
  const itp = data.itps.find((i) => i.vehicleId === v.id)!;
  const e = expiry(itp.expires, data.referenceDate);
  const rule = data.rules.find((r) => r.vehicleId === v.id);
  const m = rule ? maintenance(rule, v, data.referenceDate) : null;
  const next = data.appointments
    .filter(
      (a) =>
        a.customerId === customerId &&
        a.date >= data.referenceDate &&
        !["Finalizată", "Anulată"].includes(a.status),
    )
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    )[0];
  const open = () =>
    router.push({ pathname: "/vehicul", params: { id: v.id } });
  return (
    <Screen>
      <View style={st.header}>
        <View>
          <Text style={st.brand}>WHITE LABEL</Text>
          <Text style={st.brandSub}>GRIJĂ PENTRU FIECARE KILOMETRU</Text>
        </View>
        <Pressable
          accessibilityLabel="Vezi notificările"
          onPress={() => router.push("/notificari")}
          style={st.bell}
        >
          <Bell size={21} color={C.navy} />
          <View style={st.bellDot} />
        </Pressable>
      </View>
      <View style={st.greeting}>
        <Text style={s.small}>Bună ziua, {firstName}</Text>
        <Text style={st.title}>
          Drumuri bune.<Text style={{ color: "#8097B8" }}> Fără griji.</Text>
        </Text>
      </View>
      <View style={st.carCard}>
        <View style={s.between}>
          <Text style={st.lightLabel}>VEHICULUL TĂU</Text>
          <Pressable
            accessibilityLabel="Schimbă vehiculul"
            onPress={() => setPicker(true)}
            style={st.change}
          >
            <Text style={st.changeText}>Schimbă</Text>
            <ChevronDown size={13} color="#B6C9E4" />
          </Pressable>
        </View>
        <Pressable
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={"Detalii " + v.plate}
        >
          <Text style={st.carName}>
            {v.make} {v.model}
          </Text>
          <View style={st.carMiddle}>
            <View>
              <Text style={st.plate}>{v.plate}</Text>
              <Text style={st.carYear}>
                {v.year} · {v.category}
              </Text>
            </View>
            <View style={{ marginRight: -8 }}>
              <CarArt width={170} />
            </View>
          </View>
        </Pressable>
        <View style={st.carFooter}>
          <View style={s.row}>
            <Gauge size={15} color="#A8BFDC" />
            <Text style={st.km}>{number(v.mileage)} km</Text>
          </View>
          <Pressable
            onPress={open}
            accessibilityLabel="Vezi detaliile vehiculului"
          >
            <ArrowUpRight size={18} color="#B6CBE6" />
          </Pressable>
        </View>
      </View>
      <View style={st.statusGrid}>
        <Card style={{ flex: 1, marginBottom: 0, padding: 15 }} onPress={open}>
          <View
            style={[
              s.tile,
              { width: 33, height: 33, backgroundColor: "#FFF4E5" },
            ]}
          >
            <ShieldCheck size={18} color={C.orange} />
          </View>
          <Text style={st.statusLabel}>Expirare ITP</Text>
          <Text style={st.statusValue}>{date(itp.expires)}</Text>
          <Pill label={e.label} tone={e.tone} />
        </Card>
        <Card style={{ flex: 1, marginBottom: 0, padding: 15 }} onPress={open}>
          <View style={[s.tile, { width: 33, height: 33 }]}>
            <Wrench size={18} color={C.blue} />
          </View>
          <Text style={st.statusLabel}>{rule?.operation ?? "Întreținere"}</Text>
          <Text style={st.statusValue}>
            {m?.remaining !== null && m?.remaining !== undefined
              ? `${number(Math.max(0, m.remaining))} km rămași`
              : "Planul tău de service"}
          </Text>
          <Pill label={m?.label ?? "Vezi detaliile"} tone={m?.tone ?? "blue"} />
        </Card>
      </View>
      <View style={{ marginTop: 17 }}>
        <Button
          onPress={() =>
            router.push({
              pathname: "/programare",
              params: { vehicleId: v.id },
            })
          }
          icon={<CalendarDays size={18} color="white" />}
        >
          Programează o vizită
        </Button>
      </View>
      <SectionTitle
        title="Următoarea vizită"
        action="Vezi toate"
        onPress={() => router.push("/programari")}
      />
      {next ? (
        <Card
          onPress={() =>
            router.push({
              pathname: "/detalii-programare",
              params: { id: next.id },
            })
          }
        >
          <View style={s.between}>
            <View style={s.row}>
              <View style={st.dateTile}>
                <Text style={st.dateMonth}>
                  {new Date(next.date + "T12:00:00Z").toLocaleDateString(
                    "ro-RO",
                    { month: "short" },
                  )}
                </Text>
                <Text style={st.dateDay}>{next.date.slice(-2)}</Text>
              </View>
              <View>
                <Text style={st.visitTitle}>{next.service}</Text>
                <Text style={[s.small, { marginTop: 5 }]}>
                  {next.time} ·{" "}
                  {data.vehicles.find((v) => v.id === next.vehicleId)?.plate}
                </Text>
              </View>
            </View>
            <Pill label={next.status} tone="green" />
          </View>
          <View style={s.divider} />
          <View style={s.between}>
            <View style={s.row}>
              <MapPin size={15} color="#8CA1BC" />
              <Text style={s.small}>
                {data.locations.find((l) => l.id === next.locationId)?.name}
              </Text>
            </View>
            <ArrowUpRight size={16} color="#849CBC" />
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={s.small}>
            Nu ai programări viitoare. Alege un interval potrivit pentru tine.
          </Text>
        </Card>
      )}
      <View style={st.tip}>
        <CarFront size={23} color="#7896BF" />
        <View style={{ flex: 1 }}>
          <Text style={st.tipTitle}>Pregătit pentru sezonul rece?</Text>
          <Text style={st.tipText}>
            {v.tires} · Verificare recomandată: {date(v.tireDate)}
          </Text>
        </View>
      </View>
      <Sheet
        title="Alege vehiculul"
        open={picker}
        onClose={() => setPicker(false)}
      >
        {vs.map((x) => (
          <Choice
            key={x.id}
            title={x.plate}
            subtitle={x.make + " " + x.model}
            selected={x.id === v.id}
            onPress={() => {
              setSelected(x.id);
              setPicker(false);
            }}
            icon={<CarFront size={23} color={C.blue} />}
          />
        ))}
      </Sheet>
    </Screen>
  );
}
const st = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 29,
  },
  brand: { fontSize: 18, fontWeight: "800", letterSpacing: 2, color: C.navy },
  brandSub: {
    fontSize: 6.5,
    letterSpacing: 1.35,
    color: "#99A9BE",
    marginTop: 5,
  },
  bell: {
    height: 39,
    width: 39,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E3EBF6",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    right: 10,
    top: 8,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E1A557",
    borderWidth: 1,
    borderColor: "white",
  },
  greeting: { marginBottom: 22 },
  title: {
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: C.navy,
    marginTop: 8,
  },
  carCard: {
    backgroundColor: "#1B3353",
    borderRadius: 18,
    padding: 21,
    paddingBottom: 16,
  },
  lightLabel: {
    fontSize: 8,
    letterSpacing: 1.9,
    color: "#9DB5D5",
    fontWeight: "600",
  },
  change: { flexDirection: "row", alignItems: "center", gap: 4 },
  changeText: { fontSize: 10, color: "#B6C9E4" },
  carName: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: "#fff",
    marginTop: 22,
  },
  carMiddle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  plate: {
    fontSize: 14,
    color: "#D5E2F3",
    letterSpacing: 1,
    fontWeight: "500",
  },
  carYear: { fontSize: 9, color: "#8BA6CA", marginTop: 8 },
  carFooter: {
    borderTopWidth: 1,
    borderTopColor: "#354D6B",
    paddingTop: 14,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  km: { fontSize: 12, color: "#C3D4EB" },
  statusGrid: { flexDirection: "row", gap: 12, marginTop: 16 },
  statusLabel: {
    fontSize: 10,
    color: "#8D9CB1",
    marginTop: 13,
    marginBottom: 7,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "600",
    color: C.navy,
    marginBottom: 10,
  },
  dateTile: {
    backgroundColor: "#EFF4FD",
    width: 45,
    height: 52,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  dateMonth: {
    fontSize: 9,
    color: "#6483B1",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  dateDay: { fontSize: 21, fontWeight: "600", color: "#356AD0", marginTop: 3 },
  visitTitle: { fontSize: 14, fontWeight: "600", color: C.navy },
  tip: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#ECF1F8",
    borderRadius: 13,
    padding: 17,
    marginTop: 5,
  },
  tipTitle: { fontSize: 11, fontWeight: "600", color: "#607D9F" },
  tipText: { fontSize: 10, lineHeight: 17, color: "#8EA1BA", marginTop: 5 },
});
