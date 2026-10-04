import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  CarFront,
  ShieldCheck,
  Wrench,
  Gauge,
  MapPin,
  CalendarDays,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import {
  services,
  availableSlots,
  bookAppointment,
  date,
  addDays,
  type Service,
} from "@white-label/core";
import { useApp } from "../src/store";
import { Screen, Card, Button, Choice, Pill, Empty, s, C } from "../src/ui";
import { AddVehicle } from "../src/vehicle-form";
const titles = [
  "Alege vehiculul",
  "De ce are nevoie mașina?",
  "Alege locația",
  "Alege data",
  "Alege ora",
  "Verifică detaliile",
];
export default function Booking() {
  const params = useLocalSearchParams<{
    vehicleId?: string;
    service?: string;
    editId?: string;
  }>();
  const { data, actor, customerId, commit, selected } = useApp();
  const old = data.appointments.find(
    (a) => a.id === params.editId && a.customerId === customerId,
  );
  const vs = data.vehicles.filter((v) => v.customerId === customerId);
  const [step, setStep] = useState(0);
  const [vid, setVid] = useState(
    old?.vehicleId ?? params.vehicleId ?? selected,
  );
  const [service, setService] = useState<Service>(
    old?.service ??
      (services.includes(params.service as Service)
        ? (params.service as Service)
        : "ITP"),
  );
  const [lid, setLid] = useState(old?.locationId ?? "");
  const [day, setDay] = useState(old?.date ?? "");
  const [time, setTime] = useState(old?.time ?? "");
  const [month, setMonth] = useState(
    (old?.date ?? data.referenceDate).slice(0, 7) + "-01",
  );
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [add, setAdd] = useState(false);
  const busy = useRef(false);
  const v = vs.find((v) => v.id === vid) ?? vs[0];
  const l = data.locations.find((l) => l.id === lid);
  const slots = day ? availableSlots(data, lid, service, day, old?.id) : [];
  const enabled = [!!v, !!service, !!l, !!day, !!time, true][step];
  function confirm() {
    if (busy.current) return;
    busy.current = true;
    setError("");
    try {
      if (!v) throw Error("Adaugă un vehicul înainte de programare.");
      const input = {
        vehicleId: v.id,
        customerId,
        locationId: lid,
        service,
        date: day,
        time,
        staffId: "",
        notes: old?.notes ?? "",
      };
      bookAppointment(JSON.parse(JSON.stringify(data)), actor, input, old?.id);
      let id = "";
      if (
        commit((d) => {
          id = bookAppointment(d, actor, input, old?.id);
        }, "Programarea a fost confirmată.")
      )
        setDone(id);
      else busy.current = false;
    } catch (e) {
      busy.current = false;
      setError((e as Error).message);
    }
  }
  const offset = (new Date(month + "T12:00:00Z").getUTCDay() + 6) % 7;
  const monthDays = new Date(
    Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0),
  ).getUTCDate();
  function moveMonth(n: number) {
    const d = new Date(month + "T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() + n);
    setMonth(d.toISOString().slice(0, 10));
  }
  if (!v)
    return (
      <Screen back title="Programare nouă">
        <Empty
          title="Mai întâi, adaugă un vehicul"
          text="După ce salvezi vehiculul, poți alege serviciul și intervalul."
        />
        <Button onPress={() => setAdd(true)}>Adaugă un vehicul</Button>
        {add && <AddVehicle onClose={() => setAdd(false)} />}
      </Screen>
    );
  if (done)
    return (
      <Screen>
        <View style={st.success}>
          <Text style={st.brand}>WHITE LABEL</Text>
          <View style={st.successIcon}>
            <Check size={43} color={C.green} />
          </View>
          <Text style={[s.h1, { textAlign: "center" }]}>
            Programare confirmată
          </Text>
          <Text style={[s.small, { textAlign: "center", marginTop: 12 }]}>
            Ne vedem la {l?.name.replace("Locația ", "locația ")}.
          </Text>
        </View>
        <Card style={{ padding: 24 }}>
          <Text style={[s.label, { marginBottom: 14 }]}>
            {date(day, true).toUpperCase()}
          </Text>
          <Text style={{ fontSize: 37, fontWeight: "700", color: C.navy }}>
            {time}
          </Text>
          <Text style={[s.text, { marginTop: 14, fontWeight: "600" }]}>
            {v.plate} · {v.make} {v.model}
          </Text>
          <Text style={[s.small, { marginTop: 7 }]}>
            {service} · {l?.name}
          </Text>
          <View style={s.divider} />
          <Pill label="Confirmată" tone="green" />
        </Card>
        <View style={{ gap: 13, marginTop: 20 }}>
          <Button
            onPress={() =>
              router.dismissTo({
                pathname: "/detalii-programare",
                params: { id: done },
              })
            }
          >
            Vezi programarea
          </Button>
          <Button secondary onPress={() => router.replace("/")}>
            Înapoi acasă
          </Button>
        </View>
      </Screen>
    );
  return (
    <Screen>
      <View style={st.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={step ? "Pasul anterior" : "Înapoi"}
          onPress={() => {
            if (step) {
              setStep(step - 1);
              setError("");
            } else router.back();
          }}
          style={{ padding: 8, marginLeft: -8 }}
        >
          <ChevronLeft size={25} color={C.navy} />
        </Pressable>
        <Text style={s.label}>PROGRAMARE {old ? "· MODIFICARE" : ""}</Text>
        <Text style={s.small}>{step + 1} / 6</Text>
      </View>
      <View style={st.progress}>
        {titles.map((_, i) => (
          <View
            key={i}
            style={[
              st.progressSegment,
              i <= step && { backgroundColor: C.blue },
            ]}
          />
        ))}
      </View>
      <Text style={[s.h1, { fontSize: 26, marginTop: 27 }]}>
        {titles[step]}
      </Text>
      <Text style={[s.subtitle, { marginBottom: 25 }]}>
        {
          [
            "Selectează vehiculul pentru următoarea vizită.",
            "Serviciul potrivit, la momentul potrivit.",
            "O echipă aproape de tine.",
            "Găsește o zi care se potrivește programului tău.",
            "Alege unul dintre intervalele disponibile.",
            "Totul este pregătit. Mai ai un singur pas.",
          ][step]
        }
      </Text>
      {step === 0 &&
        vs.map((x) => (
          <Choice
            key={x.id}
            title={x.plate}
            subtitle={x.make + " " + x.model}
            selected={vid === x.id}
            onPress={() => {
              setVid(x.id);
              setTime("");
              if (
                service === "Verificare tahograf" &&
                !data.tachographs.some((t) => t.vehicleId === x.id)
              ) {
                setService("ITP");
                setLid("");
                setDay("");
              }
            }}
            icon={<CarFront size={24} color={C.blue} />}
          />
        ))}
      {step === 1 &&
        services
          .filter(
            (s) =>
              s !== "Verificare tahograf" ||
              data.tachographs.some((t) => t.vehicleId === vid),
          )
          .map((x, i) => (
            <Choice
              key={x}
              title={x}
              subtitle={
                [
                  "Inspecție tehnică periodică",
                  "Diagnosticare și reparații",
                  "Întreținere pentru un motor sănătos",
                  "Pregătire pentru fiecare sezon",
                  "Verificare periodică și calibrare",
                  "Spune-ne de ce ai nevoie",
                ][services.indexOf(x)]
              }
              selected={service === x}
              onPress={() => {
                setService(x);
                setLid("");
                setDay("");
                setTime("");
              }}
              icon={
                x === "ITP" ? (
                  <ShieldCheck size={23} color={C.blue} />
                ) : x === "Verificare tahograf" ? (
                  <Gauge size={23} color={C.blue} />
                ) : (
                  <Wrench size={23} color={C.blue} />
                )
              }
            />
          ))}
      {step === 2 &&
        data.locations
          .filter((l) => l.services.includes(service))
          .map((x) => (
            <Choice
              key={x.id}
              title={x.name}
              subtitle={x.address + "\n" + x.opens + " – " + x.closes}
              selected={lid === x.id}
              onPress={() => {
                setLid(x.id);
                setDay("");
                setTime("");
              }}
              icon={<MapPin size={24} color={C.blue} />}
            />
          ))}
      {step === 3 && (
        <Card>
          <View style={s.between}>
            <Pressable
              accessibilityLabel="Luna precedentă"
              onPress={() => moveMonth(-1)}
              disabled={month.slice(0, 7) <= data.referenceDate.slice(0, 7)}
              style={{
                padding: 8,
                opacity:
                  month.slice(0, 7) <= data.referenceDate.slice(0, 7) ? 0.3 : 1,
              }}
            >
              <ChevronLeft size={21} color={C.blue} />
            </Pressable>
            <Text style={[s.h2, { fontSize: 15, textTransform: "capitalize" }]}>
              {new Date(month + "T12:00:00Z").toLocaleDateString("ro-RO", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Pressable
              accessibilityLabel="Luna următoare"
              onPress={() => moveMonth(1)}
              disabled={
                month.slice(0, 7) >=
                addDays(data.referenceDate, 180).slice(0, 7)
              }
              style={{ padding: 8 }}
            >
              <ChevronRight size={21} color={C.blue} />
            </Pressable>
          </View>
          <View style={st.calendar}>
            {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((x) => (
              <View style={st.day} key={x}>
                <Text style={{ fontSize: 10, color: "#9AAAC0" }}>{x}</Text>
              </View>
            ))}
            {Array.from({ length: offset + monthDays }, (_, i) => {
              if (i < offset) return <View style={st.day} key={i} />;
              const d =
                month.slice(0, 8) + String(i - offset + 1).padStart(2, "0");
              const available =
                availableSlots(data, lid, service, d, old?.id).length > 0;
              return (
                <Pressable
                  key={d}
                  accessibilityLabel={date(d, true)}
                  accessibilityState={{
                    selected: day === d,
                    disabled: !available,
                  }}
                  disabled={!available}
                  onPress={() => {
                    setDay(d);
                    setTime("");
                  }}
                  style={st.day}
                >
                  <View
                    style={[
                      st.dayInner,
                      day === d && { backgroundColor: C.blue },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: day === d ? "700" : "500",
                        color:
                          day === d ? "white" : available ? C.navy : "#CDD5E1",
                      }}
                    >
                      {i - offset + 1}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={s.divider} />
          <Text style={[s.small, { fontSize: 10, textAlign: "center" }]}>
            Sunt afișate doar zilele cu intervale disponibile.
          </Text>
        </Card>
      )}
      {step === 4 && (
        <>
          <Card>
            <View style={s.row}>
              <CalendarDays size={22} color={C.blue} />
              <View>
                <Text style={[s.text, { fontWeight: "600" }]}>
                  {date(day, true)}
                </Text>
                <Text style={s.small}>
                  {l?.name} · {service}
                </Text>
              </View>
            </View>
          </Card>
          <View style={st.slots}>
            {slots.map((x) => (
              <Pressable
                key={x}
                accessibilityRole="radio"
                accessibilityState={{ selected: time === x }}
                onPress={() => setTime(x)}
                style={[
                  st.slot,
                  time === x && {
                    backgroundColor: C.blue,
                    borderColor: C.blue,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: time === x ? "white" : C.navy,
                  }}
                >
                  {x}
                </Text>
              </Pressable>
            ))}
          </View>
          {!slots.length && (
            <Text style={s.small}>
              Nu mai sunt intervale disponibile. Alege o altă zi.
            </Text>
          )}
        </>
      )}
      {step === 5 && (
        <>
          <Card>
            {[
              {
                icon: <CarFront size={22} color={C.blue} />,
                label: "Vehicul",
                value: v.plate,
                detail: v.make + " " + v.model,
              },
              {
                icon: <Wrench size={22} color={C.blue} />,
                label: "Serviciu",
                value: service,
                detail: "Plată la locație",
              },
              {
                icon: <MapPin size={22} color={C.blue} />,
                label: "Locație",
                value: l?.name ?? "",
                detail: l?.address ?? "",
              },
              {
                icon: <CalendarDays size={22} color={C.blue} />,
                label: "Data și ora",
                value: date(day, true),
                detail: "Ora " + time,
              },
            ].map((r, i) => (
              <View
                key={r.label}
                style={[
                  s.row,
                  {
                    alignItems: "flex-start",
                    paddingVertical: 13,
                    borderBottomWidth: i === 3 ? 0 : 1,
                    borderBottomColor: "#ECF1F7",
                    gap: 16,
                  },
                ]}
              >
                <View style={{ marginTop: 8 }}>{r.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.small, { fontSize: 10 }]}>{r.label}</Text>
                  <Text style={[s.text, { fontWeight: "600", marginTop: 4 }]}>
                    {r.value}
                  </Text>
                  <Text style={[s.small, { fontSize: 11, marginTop: 3 }]}>
                    {r.detail}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
          <Card style={{ backgroundColor: "#EDF3FF" }}>
            <Text style={[s.small, { fontSize: 11, color: "#7390B7" }]}>
              Poți reprograma sau anula vizita din secțiunea Programări, înainte
              de începerea lucrării.
            </Text>
          </Card>
        </>
      )}
      {!!error && <Text style={s.error}>{error}</Text>}
      <View style={{ marginTop: 27 }}>
        <Button
          disabled={!enabled || (step === 4 && !slots.includes(time))}
          onPress={() => (step === 5 ? confirm() : setStep(step + 1))}
        >
          {step === 5 ? "Confirmă programarea" : "Continuă"}
        </Button>
      </View>
    </Screen>
  );
}
const st = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progress: { flexDirection: "row", gap: 5, marginTop: 12 },
  progressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: "#E0E8F4",
    borderRadius: 2,
  },
  calendar: { flexDirection: "row", flexWrap: "wrap", marginTop: 16 },
  day: {
    width: "14.2857%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInner: {
    height: 33,
    width: 33,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: 11, marginTop: 10 },
  slot: {
    width: "30.8%",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#DFE7F3",
    backgroundColor: "white",
    borderRadius: 9,
    alignItems: "center",
  },
  success: { alignItems: "center", paddingTop: 25, paddingBottom: 30 },
  brand: {
    fontSize: 17,
    letterSpacing: 2,
    fontWeight: "800",
    color: C.navy,
    marginBottom: 45,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 50,
    backgroundColor: "#E4F4ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
});
