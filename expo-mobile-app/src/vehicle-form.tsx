import { useState } from "react";
import { Text, View } from "react-native";
import { addVehicle, type Vehicle } from "@white-label/core";
import { useApp } from "./store";
import { Sheet, Field, Button, Choice, s } from "./ui";
export function AddVehicle({ onClose }: { onClose: () => void }) {
  const { data, actor, customerId, commit } = useApp();
  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2022");
  const [km, setKm] = useState("");
  const [itp, setItp] = useState("");
  const [category, setCategory] = useState<Vehicle["category"]>("Autoturism");
  const [lid, setLid] = useState("central");
  const [error, setError] = useState("");
  function save() {
    try {
      const input = {
        customerId,
        locationId: lid,
        plate,
        make,
        model,
        year: Number(year),
        mileage: Number(km),
        category,
        tires: "Anvelope all season",
        tireDate: "2027-04-01",
      };
      addVehicle(JSON.parse(JSON.stringify(data)), actor, input, itp);
      if (
        commit(
          (d) => addVehicle(d, actor, input, itp),
          "Vehiculul a fost adăugat.",
        )
      )
        onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Sheet title="Adaugă un vehicul" open onClose={onClose}>
      <Field
        label="Număr de înmatriculare"
        value={plate}
        onChangeText={setPlate}
        placeholder="B 123 ABC"
        autoCapitalize="characters"
      />
      <Field
        label="Marcă"
        value={make}
        onChangeText={setMake}
        placeholder="Volkswagen"
      />
      <Field
        label="Model"
        value={model}
        onChangeText={setModel}
        placeholder="Passat"
      />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field
            label="An fabricație"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Kilometraj (km)"
            value={km}
            onChangeText={setKm}
            keyboardType="number-pad"
          />
        </View>
      </View>
      <Field
        label="Expirare ITP (AAAA-LL-ZZ)"
        value={itp}
        onChangeText={setItp}
        placeholder="2027-11-18"
      />
      {(["Autoturism", "Autoutilitară", "Camion"] as const).map((c) => (
        <Choice
          key={c}
          title={c}
          selected={category === c}
          onPress={() => setCategory(c)}
        />
      ))}
      <Text style={[s.h2, { marginVertical: 17 }]}>Locația preferată</Text>
      {data.locations.map((l) => (
        <Choice
          key={l.id}
          title={l.name}
          selected={lid === l.id}
          onPress={() => setLid(l.id)}
        />
      ))}
      {!!error && <Text style={s.error}>{error}</Text>}
      <Button onPress={save}>Salvează vehiculul</Button>
    </Sheet>
  );
}
