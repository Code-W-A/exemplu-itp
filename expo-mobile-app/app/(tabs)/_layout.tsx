import { Tabs } from "expo-router";
import {
  House,
  CarFront,
  CalendarDays,
  Bell,
  UserRound,
} from "lucide-react-native";
import { useApp } from "../../src/store";
export default function TabLayout() {
  const { data, customerId } = useApp();
  const count = data.notifications.filter(
    (n) => n.customerId === customerId && !n.read && n.status === "Trimisă",
  ).length;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2862E6",
        tabBarInactiveTintColor: "#9AA8BC",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#E5EBF4",
          height: 83,
          paddingTop: 10,
          paddingBottom: 22,
        },
        tabBarLabelStyle: { fontSize: 9, marginTop: 4 },
        sceneStyle: { backgroundColor: "#F5F7FB" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Acasă",
          tabBarIcon: ({ color }) => <House size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicule"
        options={{
          title: "Vehicule",
          tabBarIcon: ({ color }) => <CarFront size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="programari"
        options={{
          title: "Programări",
          tabBarIcon: ({ color }) => <CalendarDays size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notificari"
        options={{
          title: "Notificări",
          tabBarBadge: count || undefined,
          tabBarBadgeStyle: { backgroundColor: "#2862E6", fontSize: 9 },
          tabBarIcon: ({ color }) => <Bell size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cont"
        options={{
          title: "Cont",
          tabBarIcon: ({ color }) => <UserRound size={21} color={color} />,
        }}
      />
    </Tabs>
  );
}
