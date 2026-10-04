import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Plus, ArrowUpRight, ShieldCheck } from "lucide-react-native";
import { expiry, date, number } from "@white-label/core";
import { Screen, Card, CarArt, Pill, Button, s, C } from "../../src/ui";
import { useApp } from "../../src/store";
import { AddVehicle } from "../../src/vehicle-form";
export default function Vehicles() {
  const { data, customerId } = useApp();
  const [add, setAdd] = useState(false);
  const vs = data.vehicles.filter((v) => v.customerId === customerId);
  return (
    <Screen
      title="Vehiculele mele"
      subtitle={`${vs.length} vehicule. Aceeași grijă pentru fiecare.`}
    >
      {vs.map((v) => {
        const itp = data.itps.find((i) => i.vehicleId === v.id)!;
        const e = expiry(itp.expires, data.referenceDate);
        return (
          <Card
            key={v.id}
            onPress={() =>
              router.push({ pathname: "/vehicul", params: { id: v.id } })
            }
          >
            <View style={s.between}>
              <View>
                <Text
                  style={{
                    fontSize: 19,
                    fontWeight: "700",
                    color: C.navy,
                    letterSpacing: 0.5,
                  }}
                >
                  {v.plate}
                </Text>
                <Text style={[s.small, { marginTop: 7 }]}>
                  {v.make} {v.model}
                </Text>
                <Text style={[s.small, { marginTop: 5, fontSize: 10 }]}>
                  {number(v.mileage)} km · {v.year}
                </Text>
              </View>
              <CarArt width={130} />
            </View>
            <View style={s.divider} />
            <View style={s.between}>
              <View style={s.row}>
                <ShieldCheck
                  size={16}
                  color={e.tone === "green" ? C.green : C.orange}
                />
                <Text style={[s.small, { fontSize: 11 }]}>
                  ITP · {date(itp.expires)}
                </Text>
              </View>
              <Pill label={e.label} tone={e.tone} />
            </View>
          </Card>
        );
      })}
      <Button
        onPress={() => setAdd(true)}
        secondary
        icon={<Plus size={18} color={C.navy} />}
      >
        Adaugă un vehicul
      </Button>
      {add && <AddVehicle onClose={() => setAdd(false)} />}
    </Screen>
  );
}
