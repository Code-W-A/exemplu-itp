import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createSeed,
  maintenance,
  updateMileage,
  bookAppointment,
  availableSlots,
  setAppointmentStatus,
  addVehicle,
  saveStaff,
  can,
  visibleLocations,
  saveRule,
  saveTachograph,
  createRepository,
  expiry,
  addMonths,
  type Actor,
} from "../packages/core/src/index";
const admin: Actor = { kind: "staff", id: "s0" },
  customer: Actor = { kind: "customer", id: "c1" };
test("setul comun păstrează relațiile și flota de zece vehicule", () => {
  const d = createSeed();
  assert.equal(d.vehicles.filter((v) => v.customerId === "c2").length, 10);
  assert.equal(d.vehicles.find((v) => v.id === "v1")?.plate, "B 123 ABC");
  for (const a of d.appointments) {
    assert(
      d.vehicles.some(
        (v) => v.id === a.vehicleId && v.customerId === a.customerId,
      ),
    );
    assert(
      d.locations.some(
        (l) => l.id === a.locationId && l.services.includes(a.service),
      ),
    );
  }
  assert.deepEqual(createSeed(), d);
});
test("kilometrajul recalculează întreținerea și respinge regresia", () => {
  const d = createSeed(),
    v = d.vehicles[0],
    r = d.rules[0];
  assert.equal(maintenance(r, v, d.referenceDate).remaining, 1550);
  updateMileage(d, customer, v.id, 109900);
  assert.equal(maintenance(r, v, d.referenceDate).remaining, 100);
  updateMileage(d, customer, v.id, 110000);
  assert(maintenance(r, v, d.referenceDate).due);
  assert.throws(() => updateMileage(d, customer, v.id, 109000));
  assert.throws(() => updateMileage(d, customer, "f1", 200000));
});
test("regula calendaristică devine scadentă independent de kilometri", () => {
  const d = createSeed(),
    r = { ...d.rules[0], lastDate: "2025-10-19" };
  assert(maintenance(r, d.vehicles[0], d.referenceDate).due);
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2025-01-31", 1), "2025-02-28");
  assert.equal(expiry("2026-10-18", d.referenceDate).tone, "red");
});
test("disponibilitatea respectă servicii, zile, pauze și durata", () => {
  const d = createSeed();
  assert.deepEqual(
    availableSlots(d, "nord", "Verificare tahograf", "2026-10-19"),
    [],
  );
  assert.deepEqual(availableSlots(d, "nord", "ITP", "2026-10-25"), []);
  assert.deepEqual(availableSlots(d, "central", "ITP", "2026-10-18"), []);
  assert(
    !availableSlots(d, "central", "Mecanică", "2026-10-19").includes("11:30"),
  );
  assert(
    !availableSlots(d, "central", "Mecanică", "2026-10-19").includes("17:30"),
  );
  assert(
    !availableSlots(
      d,
      "central",
      "ITP",
      "2026-10-19",
      undefined,
      "s1",
    ).includes("10:30"),
  );
});
test("capacitate, dublă rezervare, reprogramare și anulare", () => {
  const d = createSeed();
  d.locations[0].capacity = 1;
  const input = {
    customerId: "c1",
    vehicleId: "v1",
    locationId: "central",
    service: "ITP" as const,
    date: "2026-10-21",
    time: "09:00",
    staffId: "s1",
    notes: "",
  };
  const id = bookAppointment(d, customer, input);
  assert.equal(d.appointments.find((a) => a.id === id)?.status, "Confirmată");
  assert(!availableSlots(d, "central", "ITP", input.date).includes("09:00"));
  assert.throws(() => bookAppointment(d, customer, input));
  assert(availableSlots(d, "central", "ITP", input.date, id).includes("09:00"));
  assert.equal(
    bookAppointment(d, customer, { ...input, time: "09:30" }, id),
    id,
  );
  assert(availableSlots(d, "central", "ITP", input.date).includes("09:00"));
  setAppointmentStatus(d, customer, id, "Anulată");
  assert(availableSlots(d, "central", "ITP", input.date).includes("09:30"));
  assert.throws(() => bookAppointment(d, customer, input, id));
});
test("ajustarea capacității nu supraestimează suprapuneri succesive", () => {
  const d = createSeed();
  d.locations[0].capacity = 2;
  d.appointments = [
    {
      id: "a",
      customerId: "c3",
      vehicleId: "p0",
      locationId: "central",
      service: "ITP",
      date: "2026-10-21",
      time: "09:00",
      duration: 30,
      status: "Confirmată",
      staffId: "",
      notes: "",
    },
    {
      id: "b",
      customerId: "c5",
      vehicleId: "p2",
      locationId: "central",
      service: "ITP",
      date: "2026-10-21",
      time: "09:30",
      duration: 30,
      status: "Confirmată",
      staffId: "",
      notes: "",
    },
  ];
  assert(
    availableSlots(d, "central", "Mecanică", "2026-10-21").includes("09:00"),
  );
});
test("adăugarea vehiculului la client și unicitatea numărului", () => {
  const d = createSeed();
  const input = { ...d.vehicles[0], plate: "B 555 NOU", mileage: 45000 };
  const id = addVehicle(d, admin, input, "2027-12-01");
  assert.equal(d.vehicles.find((v) => v.id === id)?.customerId, "c1");
  assert(d.itps.some((i) => i.vehicleId === id));
  assert.throws(() =>
    addVehicle(d, admin, { ...input, plate: "B555NOU" }, "2027-12-01"),
  );
  assert.throws(() =>
    addVehicle(d, admin, { ...input, plate: "B 556 NOU" }, "2027-02-31"),
  );
});
test("rolurile limitează locațiile și mutațiile", () => {
  const d = createSeed();
  const staff: Actor = { kind: "staff", id: "s1" };
  assert.equal(can(d, staff, "personal"), false);
  assert.equal(can(d, staff, "vehicule", "nord"), false);
  assert.deepEqual(
    visibleLocations(d, staff).map((l) => l.id),
    ["central"],
  );
  assert.throws(() => updateMileage(d, staff, "v2", 50000));
  saveStaff(d, admin, {
    ...d.staff[1],
    locationIds: ["central", "nord"],
    permissions: ["vehicule"],
  });
  assert(can(d, staff, "vehicule", "nord"));
  assert(!can(d, staff, "programari"));
  saveStaff(d, admin, { ...d.staff[1], active: false });
  assert(!can(d, staff, "vehicule"));
  assert.throws(() => saveStaff(d, admin, { ...d.staff[0], active: false }));
});
test("regulile și tahografele validează datele", () => {
  const d = createSeed();
  assert.throws(() =>
    saveRule(d, admin, { ...d.rules[0], intervalKm: 0, intervalMonths: 0 }),
  );
  assert.throws(() => saveRule(d, admin, { ...d.rules[0], lastKm: 900000 }));
  const t = d.tachographs[0];
  saveTachograph(d, admin, {
    ...t,
    lastDate: "2026-10-19",
    nextDate: "2028-10-19",
  });
  assert.equal(d.tachographs[0].history.length, 2);
  assert.throws(() =>
    saveTachograph(d, admin, {
      ...t,
      lastDate: "2026-10-19",
      nextDate: "2026-10-18",
    }),
  );
});
test("persistență, resetare și separarea depozitelor locale", async () => {
  const a = new Map<string, string>(),
    b = new Map<string, string>();
  const repo = (m: Map<string, string>) =>
    createRepository({
      getItem: async (k) => m.get(k) ?? null,
      setItem: async (k, v) => {
        m.set(k, v);
      },
      removeItem: async (k) => {
        m.delete(k);
      },
    });
  const mobile = repo(a),
    web = repo(b);
  const d = await mobile.load();
  updateMileage(d, customer, "v1", 109900);
  await mobile.save(d);
  assert.equal((await mobile.load()).vehicles[0].mileage, 109900);
  assert.equal((await web.load()).vehicles[0].mileage, 108450);
  assert.equal((await mobile.reset()).vehicles[0].mileage, 108450);
});
test("data scenariului mută toate scadențele păstrând distanța de 30 zile", () => {
  const d = createSeed("2027-03-01");
  assert.equal(d.referenceDate, "2027-03-01");
  assert.equal(expiry(d.itps[0].expires, d.referenceDate).days, 30);
  assert.equal(d.appointments[0].date, d.referenceDate);
  assert.throws(() => createSeed("2026-02-31"));
});

test("coada locală respectă preferințele și nu dublează notificările", async () => {
  const { rebuildScheduledNotifications } =
    await import("../packages/core/src/index");
  const d = createSeed();
  rebuildScheduledNotifications(d);
  const first = d.notifications.filter((n) => n.status === "Programată").length;
  assert(first > 0);
  rebuildScheduledNotifications(d);
  assert.equal(
    d.notifications.filter((n) => n.status === "Programată").length,
    first,
  );
  d.customers[0].preferences["Expirare ITP"] = false;
  rebuildScheduledNotifications(d);
  assert(
    !d.notifications.some(
      (n) =>
        n.customerId === "c1" &&
        n.category === "ITP" &&
        n.status === "Programată",
    ),
  );
  assert(
    d.notifications.some(
      (n) =>
        n.customerId === "c1" && n.category === "ITP" && n.status === "Trimisă",
    ),
  );
});
