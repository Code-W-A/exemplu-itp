import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import {
  Bell,
  ShieldCheck,
  Wrench,
  CalendarDays,
  Gauge,
  CheckCheck,
  ChevronRight,
} from "lucide-react-native";
import { date } from "@white-label/core";
import { useApp } from "../../src/store";
import { Screen, Card, Pill, Empty, s, C } from "../../src/ui";
export default function Notifications() {
  const { data, customerId, commit } = useApp();
  const list = data.notifications.filter(
    (n) => n.customerId === customerId && n.status === "Trimisă",
  );
  return (
    <Screen
      title="Notificări"
      subtitle="La zi cu tot ce contează pentru mașina ta."
      right={
        <Pressable
          accessibilityLabel="Marchează toate ca citite"
          onPress={() =>
            commit((d) => {
              d.notifications.forEach((n) => {
                if (n.customerId === customerId) n.read = true;
              });
            }, "Toate notificările au fost marcate ca citite.")
          }
          style={s.tile}
        >
          <CheckCheck size={21} color={C.blue} />
        </Pressable>
      }
    >
      {list.map((n) => {
        const Icon =
          n.category === "ITP"
            ? ShieldCheck
            : n.category === "Întreținere"
              ? Wrench
              : n.category === "Programări"
                ? CalendarDays
                : n.category === "Tahografe"
                  ? Gauge
                  : Bell;
        return (
          <Card
            key={n.id}
            style={{ borderColor: n.read ? "#E6ECF4" : "#D1E0FC" }}
            onPress={() => {
              commit((d) => {
                d.notifications.find((x) => x.id === n.id)!.read = true;
              }, "");
              if (n.appointmentId)
                router.push({
                  pathname: "/detalii-programare",
                  params: { id: n.appointmentId },
                });
              else
                router.push({
                  pathname: "/vehicul",
                  params: { id: n.vehicleId },
                });
            }}
          >
            <View style={s.between}>
              <View style={s.row}>
                <View style={[s.tile, { height: 34, width: 34 }]}>
                  <Icon size={18} color={C.blue} />
                </View>
                <Text style={[s.small, { fontSize: 10 }]}>{n.category}</Text>
              </View>
              <Text style={[s.small, { fontSize: 9 }]}>{date(n.date)}</Text>
            </View>
            <Text
              style={[
                s.text,
                {
                  fontWeight: "600",
                  marginTop: 16,
                  fontSize: 15,
                  lineHeight: 23,
                },
              ]}
            >
              {n.title}
            </Text>
            <Text style={[s.small, { marginTop: 9 }]}>{n.body}</Text>
            <View style={[s.between, { marginTop: 16 }]}>
              <Text style={s.link}>
                {n.appointmentId ? "Vezi programarea" : "Vezi vehiculul"}
              </Text>
              {!n.read ? (
                <Pill label="Nouă" tone="blue" />
              ) : (
                <ChevronRight size={16} color={C.blue} />
              )}
            </View>
          </Card>
        );
      })}
      {!list.length && (
        <Empty title="Ești la zi" text="Noile mesaje vor apărea aici." />
      )}
    </Screen>
  );
}
