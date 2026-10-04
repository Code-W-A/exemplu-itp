export type ID = string;
export type Module =
  | "programari"
  | "clienti"
  | "vehicule"
  | "itp"
  | "intretinere"
  | "tahografe"
  | "locatii"
  | "personal"
  | "notificari"
  | "rapoarte"
  | "setari";
export const moduleLabels: Record<Module, string> = {
  programari: "Programări",
  clienti: "Clienți",
  vehicule: "Vehicule",
  itp: "Scadențe ITP",
  intretinere: "Întreținere",
  tahografe: "Tahografe",
  locatii: "Locații",
  personal: "Personal",
  notificari: "Notificări",
  rapoarte: "Rapoarte",
  setari: "Setări",
};
export const services = [
  "ITP",
  "Mecanică",
  "Ulei și filtre",
  "Anvelope",
  "Verificare tahograf",
  "Alte servicii",
] as const;
export type Service = (typeof services)[number];
export const appointmentStatuses = [
  "Înregistrată",
  "Confirmată",
  "În lucru",
  "Finalizată",
  "Anulată",
] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];
export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  kind: "Persoană fizică" | "Companie";
  locationId: ID;
  preferences: Record<string, boolean>;
}
export interface Vehicle {
  id: ID;
  customerId: ID;
  locationId: ID;
  plate: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  category: "Autoturism" | "Autoutilitară" | "Camion";
  tires: string;
  tireDate: string;
}
export interface Location {
  id: ID;
  name: string;
  address: string;
  phone: string;
  services: Service[];
  opens: string;
  closes: string;
  capacity: number;
  weekdays: number[];
  breakStart: string;
  breakEnd: string;
}
export interface Appointment {
  id: ID;
  customerId: ID;
  vehicleId: ID;
  locationId: ID;
  service: Service;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  staffId: ID;
  notes: string;
}
export interface StaffMember {
  id: ID;
  name: string;
  email: string;
  role: string;
  superAdmin: boolean;
  active: boolean;
  locationIds: ID[];
  permissions: Module[];
}
export interface MaintenanceRule {
  id: ID;
  vehicleId: ID;
  operation: string;
  intervalKm: number;
  intervalMonths: number;
  lastKm: number;
  lastDate: string;
}
export interface MaintenanceRecord {
  id: ID;
  vehicleId: ID;
  operation: string;
  date: string;
  mileage: number;
  locationId: ID;
}
export interface ITPRecord {
  id: ID;
  vehicleId: ID;
  expires: string;
  status: "De contactat" | "Notificat" | "Programat" | "Finalizat";
}
export interface Tachograph {
  id: ID;
  vehicleId: ID;
  type: string;
  serial: string;
  lastDate: string;
  nextDate: string;
  locationId: ID;
  history: { date: string; note: string }[];
}
export interface Notification {
  id: ID;
  customerId: ID;
  vehicleId: ID;
  appointmentId?: ID;
  category: "ITP" | "Întreținere" | "Programări" | "Tahografe" | "Campanii";
  title: string;
  body: string;
  date: string;
  status: "Programată" | "Trimisă";
  read: boolean;
}
export interface Activity {
  id: ID;
  title: string;
  detail: string;
  locationId: ID;
}
export interface Data {
  schemaVersion: number;
  referenceDate: string;
  customers: Customer[];
  vehicles: Vehicle[];
  locations: Location[];
  appointments: Appointment[];
  staff: StaffMember[];
  rules: MaintenanceRule[];
  records: MaintenanceRecord[];
  itps: ITPRecord[];
  tachographs: Tachograph[];
  notifications: Notification[];
  activities: Activity[];
  reminderDays: number[];
}
export const tokens = {
  blue: "#2563EB",
  navy: "#14263D",
  muted: "#728096",
  background: "#F5F7FB",
  border: "#E5EAF1",
  green: "#16866C",
  orange: "#BD7919",
  red: "#C34853",
};
export const number = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
export const date = (d: string, long = false) =>
  new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(new Date(`${d}T12:00:00Z`));
export const daysBetween = (a: string, b: string) =>
  Math.round(
    (Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000,
  );
export const addDays = (d: string, n: number) =>
  new Date(Date.parse(d + "T12:00:00Z") + n * 86400000)
    .toISOString()
    .slice(0, 10);
export function addMonths(d: string, n: number) {
  const x = new Date(d + "T12:00:00Z"),
    day = x.getUTCDate();
  x.setUTCDate(1);
  x.setUTCMonth(x.getUTCMonth() + n);
  const end = new Date(
    Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0),
  ).getUTCDate();
  x.setUTCDate(Math.min(day, end));
  return x.toISOString().slice(0, 10);
}
export const uid = (p: string) =>
  `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export const expiry = (expires: string, today: string) => {
  const days = daysBetween(today, expires);
  return {
    days,
    label:
      days < 0
        ? "Expirat"
        : days === 0
          ? "Scadent astăzi"
          : days <= 30
            ? `În ${days} zile`
            : "Valabil",
    tone: days < 0 ? "red" : days <= 30 ? "orange" : "green",
  };
};
export function maintenance(rule: MaintenanceRule, v: Vehicle, today: string) {
  const nextKm = rule.intervalKm ? rule.lastKm + rule.intervalKm : null;
  const nextDate = rule.intervalMonths
    ? addMonths(rule.lastDate, rule.intervalMonths)
    : null;
  const remaining = nextKm === null ? null : nextKm - v.mileage;
  const days = nextDate ? daysBetween(today, nextDate) : null;
  const due =
    (remaining !== null && remaining <= 0) || (days !== null && days <= 0);
  const soon =
    (remaining !== null && remaining <= 2000) || (days !== null && days <= 30);
  return {
    nextKm,
    nextDate,
    remaining,
    days,
    due,
    soon,
    tone: due ? "red" : soon ? "orange" : "green",
    label: due ? "Scadentă" : soon ? "În curând" : "La zi",
  };
}
export const durationFor = (service: Service) =>
  service === "Mecanică" || service === "Verificare tahograf" ? 60 : 30;
const minutes = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
const timeString = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export function availableSlots(
  data: Data,
  locationId: ID,
  service: Service,
  day: string,
  excludeId?: ID,
  staffId?: ID,
) {
  const l = data.locations.find((x) => x.id === locationId);
  if (
    !l ||
    !l.services.includes(service) ||
    day < data.referenceDate ||
    !l.weekdays.includes(new Date(day + "T12:00:00Z").getUTCDay())
  )
    return [];
  const duration = durationFor(service),
    out: string[] = [];
  for (let t = minutes(l.opens); t + duration <= minutes(l.closes); t += 30) {
    if (
      l.breakStart &&
      l.breakEnd &&
      t < minutes(l.breakEnd) &&
      t + duration > minutes(l.breakStart)
    )
      continue;
    const overlap = data.appointments.filter(
      (a) =>
        a.id !== excludeId &&
        a.locationId === locationId &&
        a.date === day &&
        a.status !== "Anulată" &&
        t < minutes(a.time) + a.duration &&
        t + duration > minutes(a.time),
    );
    const atCapacity = Array.from(
      { length: duration / 30 },
      (_, i) => t + i * 30,
    ).some(
      (p) =>
        overlap.filter(
          (a) => minutes(a.time) <= p && minutes(a.time) + a.duration > p,
        ).length >= l.capacity,
    );
    if (
      !atCapacity &&
      (!staffId || !overlap.some((a) => a.staffId === staffId))
    )
      out.push(timeString(t));
  }
  return out;
}
export type Actor = { kind: "staff"; id: ID } | { kind: "customer"; id: ID };
export function can(data: Data, actor: Actor, module: Module, locationId?: ID) {
  if (actor.kind === "customer")
    return ["programari", "vehicule", "notificari", "clienti"].includes(module);
  const s = data.staff.find((x) => x.id === actor.id);
  return (
    !!s?.active &&
    (s.superAdmin ||
      (s.permissions.includes(module) &&
        (!locationId || s.locationIds.includes(locationId))))
  );
}
export function authorize(
  data: Data,
  actor: Actor,
  module: Module,
  locationId?: ID,
  customerId?: ID,
) {
  if (
    !can(data, actor, module, locationId) ||
    (actor.kind === "customer" && customerId && customerId !== actor.id)
  )
    throw new Error("Nu ai permisiunea necesară pentru această acțiune.");
}
export function visibleLocations(data: Data, actor: Actor) {
  const s =
    actor.kind === "staff"
      ? data.staff.find((x) => x.id === actor.id)
      : undefined;
  return data.locations.filter(
    (l) =>
      actor.kind === "customer" ||
      s?.superAdmin ||
      s?.locationIds.includes(l.id),
  );
}
export function activity(
  d: Data,
  title: string,
  detail: string,
  locationId: ID,
) {
  d.activities.unshift({ id: uid("act"), title, detail, locationId });
  d.activities = d.activities.slice(0, 40);
}
export function updateMileage(
  d: Data,
  actor: Actor,
  vehicleId: ID,
  value: number,
) {
  const v = d.vehicles.find((x) => x.id === vehicleId);
  if (!v) throw Error("Vehiculul nu a fost găsit.");
  authorize(d, actor, "vehicule", v.locationId, v.customerId);
  if (!Number.isInteger(value) || value < v.mileage || value > 3000000)
    throw Error("Introdu un kilometraj întreg, cel puțin egal cu cel actual.");
  v.mileage = value;
  activity(
    d,
    "Kilometraj actualizat",
    `${v.plate} · ${number(value)} km`,
    v.locationId,
  );
}
export function addVehicle(
  d: Data,
  actor: Actor,
  input: Omit<Vehicle, "id">,
  itpDate: string,
) {
  authorize(d, actor, "vehicule", input.locationId, input.customerId);
  if (!d.customers.some((c) => c.id === input.customerId))
    throw Error("Alege un client existent.");
  const plate = input.plate.trim().toUpperCase().replace(/\s+/g, " ");
  if (!/^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}$/.test(plate))
    throw Error(
      "Introdu un număr de înmatriculare valid, de exemplu B 123 ABC.",
    );
  if (
    d.vehicles.some(
      (v) => v.plate.replace(/\s/g, "") === plate.replace(/\s/g, ""),
    )
  )
    throw Error("Numărul de înmatriculare este deja înregistrat.");
  if (
    !input.make.trim() ||
    !input.model.trim() ||
    !Number.isInteger(input.year) ||
    input.year < 1950 ||
    input.year > 2030 ||
    !Number.isInteger(input.mileage) ||
    input.mileage < 0 ||
    input.mileage > 3000000 ||
    !validDate(itpDate)
  )
    throw Error(
      "Completează corect marca, modelul, anul, kilometrajul și data ITP.",
    );
  const v = { ...input, id: uid("v"), plate };
  d.vehicles.push(v);
  d.itps.push({
    id: uid("itp"),
    vehicleId: v.id,
    expires: itpDate,
    status: "De contactat",
  });
  activity(
    d,
    "Vehicul adăugat",
    `${plate} · ${v.make} ${v.model}`,
    v.locationId,
  );
  return v.id;
}
export function bookAppointment(
  d: Data,
  actor: Actor,
  input: Omit<Appointment, "id" | "duration" | "status">,
  editId?: ID,
) {
  const v = d.vehicles.find((x) => x.id === input.vehicleId);
  if (!v || v.customerId !== input.customerId)
    throw Error("Alege un vehicul al clientului.");
  authorize(d, actor, "programari", input.locationId, input.customerId);
  if (
    input.service === "Verificare tahograf" &&
    !d.tachographs.some((t) => t.vehicleId === v.id)
  )
    throw Error("Vehiculul nu are un tahograf înregistrat.");
  const old = editId ? d.appointments.find((a) => a.id === editId) : undefined;
  if (editId && !old) throw Error("Programarea nu a fost găsită.");
  if (old) {
    authorize(d, actor, "programari", old.locationId, old.customerId);
    if (["Finalizată", "Anulată", "În lucru"].includes(old.status))
      throw Error("Această programare nu mai poate fi modificată.");
  }
  if (
    input.staffId &&
    !d.staff.some(
      (s) =>
        s.id === input.staffId &&
        s.active &&
        s.locationIds.includes(input.locationId) &&
        s.permissions.includes("programari"),
    )
  )
    throw Error("Angajatul nu este disponibil pentru locația selectată.");
  if (
    !availableSlots(
      d,
      input.locationId,
      input.service,
      input.date,
      editId,
      input.staffId,
    ).includes(input.time)
  )
    throw Error("Intervalul nu mai este disponibil. Alege o altă oră.");
  if (
    d.appointments.some(
      (a) =>
        a.id !== editId &&
        a.vehicleId === v.id &&
        a.date === input.date &&
        a.status !== "Anulată" &&
        minutes(input.time) < minutes(a.time) + a.duration &&
        minutes(input.time) + durationFor(input.service) > minutes(a.time),
    )
  )
    throw Error("Vehiculul are deja o programare în acest interval.");
  const a: Appointment = {
    ...input,
    id: old?.id ?? uid("p"),
    duration: durationFor(input.service),
    status: "Confirmată",
  };
  if (old) d.appointments[d.appointments.indexOf(old)] = a;
  else d.appointments.push(a);
  if (a.service === "ITP") {
    const itp = d.itps.find((x) => x.vehicleId === v.id);
    if (itp) itp.status = "Programat";
  }
  d.notifications.unshift({
    id: uid("n"),
    customerId: v.customerId,
    vehicleId: v.id,
    appointmentId: a.id,
    category: "Programări",
    title: old ? "Programare modificată" : "Programare confirmată",
    body: `${a.service} · ${date(a.date)} · ${a.time}`,
    date: d.referenceDate,
    status: "Trimisă",
    read: false,
  });
  activity(
    d,
    old ? "Programare modificată" : "Programare nouă",
    `${v.plate} · ${a.service} · ${a.time}`,
    a.locationId,
  );
  return a.id;
}
export function setAppointmentStatus(
  d: Data,
  actor: Actor,
  id: ID,
  status: AppointmentStatus,
) {
  const a = d.appointments.find((x) => x.id === id);
  if (!a) throw Error("Programarea nu a fost găsită.");
  authorize(d, actor, "programari", a.locationId, a.customerId);
  if (actor.kind === "customer" && status !== "Anulată")
    throw Error("Acțiune indisponibilă.");
  if (["Finalizată", "Anulată"].includes(a.status))
    throw Error("Programarea este închisă.");
  if (actor.kind === "customer" && a.status === "În lucru")
    throw Error("Programarea este deja în lucru.");
  a.status = status;
  if (
    status === "Anulată" &&
    a.service === "ITP" &&
    !d.appointments.some(
      (x) =>
        x.id !== id &&
        x.vehicleId === a.vehicleId &&
        x.service === "ITP" &&
        !["Anulată", "Finalizată"].includes(x.status),
    )
  ) {
    const itp = d.itps.find((x) => x.vehicleId === a.vehicleId);
    if (itp) itp.status = "De contactat";
  }
  if (status === "Finalizată")
    d.records.unshift({
      id: uid("rec"),
      vehicleId: a.vehicleId,
      operation: a.service,
      date: a.date,
      mileage: d.vehicles.find((v) => v.id === a.vehicleId)!.mileage,
      locationId: a.locationId,
    });
  activity(
    d,
    `Programare ${status.toLowerCase()}`,
    `${a.service} · ${a.time}`,
    a.locationId,
  );
  d.notifications.unshift({
    id: uid("n"),
    customerId: a.customerId,
    vehicleId: a.vehicleId,
    appointmentId: a.id,
    category: "Programări",
    title: `Programare ${status.toLowerCase()}`,
    body: `${date(a.date)} · ${a.time}`,
    date: d.referenceDate,
    status: "Trimisă",
    read: false,
  });
}
export function validDate(d: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(d) &&
    !isNaN(Date.parse(d + "T12:00:00Z")) &&
    new Date(d + "T12:00:00Z").toISOString().slice(0, 10) === d
  );
}
export function saveRule(d: Data, actor: Actor, r: MaintenanceRule) {
  const v = d.vehicles.find((x) => x.id === r.vehicleId);
  if (!v) throw Error("Vehicul inexistent.");
  authorize(d, actor, "intretinere", v.locationId);
  if (
    !r.operation.trim() ||
    !validDate(r.lastDate) ||
    r.lastDate > d.referenceDate ||
    r.lastKm > v.mileage ||
    r.lastKm < 0 ||
    !Number.isInteger(r.lastKm) ||
    !Number.isInteger(r.intervalKm) ||
    !Number.isInteger(r.intervalMonths) ||
    r.intervalKm < 0 ||
    r.intervalMonths < 0 ||
    (!r.intervalKm && !r.intervalMonths)
  )
    throw Error(
      "Completează operațiunea, ultima intervenție și cel puțin un interval valid.",
    );
  const i = d.rules.findIndex((x) => x.id === r.id);
  if (i < 0) d.rules.push(r);
  else d.rules[i] = r;
}
export function saveStaff(d: Data, actor: Actor, s: StaffMember) {
  if (
    actor.kind !== "staff" ||
    !d.staff.find((x) => x.id === actor.id)?.superAdmin
  )
    throw Error("Doar administratorul principal poate gestiona personalul.");
  if (s.id === actor.id && (!s.active || !s.superAdmin))
    throw Error("Nu poți dezactiva propriul cont de administrator.");
  if (
    !s.name.trim() ||
    !/^\S+@\S+\.\S+$/.test(s.email) ||
    !s.locationIds.length
  )
    throw Error("Completează numele, e-mailul și cel puțin o locație.");
  if (
    d.staff.some(
      (x) => x.id !== s.id && x.email.toLowerCase() === s.email.toLowerCase(),
    )
  )
    throw Error("Adresa de e-mail este deja folosită.");
  const i = d.staff.findIndex((x) => x.id === s.id);
  if (i < 0) d.staff.push(s);
  else d.staff[i] = s;
}
export function saveLocation(d: Data, actor: Actor, l: Location) {
  authorize(d, actor, "locatii", l.id);
  if (
    !l.name.trim() ||
    !l.address.trim() ||
    !l.services.length ||
    !l.weekdays.length ||
    !Number.isInteger(l.capacity) ||
    l.capacity < 1 ||
    l.capacity > 20 ||
    minutes(l.opens) >= minutes(l.closes) ||
    !/^\d{2}:(00|30)$/.test(l.opens) ||
    !/^\d{2}:(00|30)$/.test(l.closes) ||
    !!l.breakStart !== !!l.breakEnd ||
    (l.breakStart &&
      (minutes(l.breakStart) < minutes(l.opens) ||
        minutes(l.breakEnd) > minutes(l.closes) ||
        minutes(l.breakStart) >= minutes(l.breakEnd)))
  )
    throw Error(
      "Verifică serviciile, zilele, capacitatea și programul locației (intervale de 30 minute).",
    );
  const i = d.locations.findIndex((x) => x.id === l.id);
  if (i < 0) d.locations.push(l);
  else d.locations[i] = l;
}
export function saveTachograph(d: Data, actor: Actor, t: Tachograph) {
  const v = d.vehicles.find((x) => x.id === t.vehicleId);
  if (!v) throw Error("Vehicul inexistent.");
  authorize(d, actor, "tahografe", v.locationId);
  if (
    !validDate(t.lastDate) ||
    !validDate(t.nextDate) ||
    t.nextDate <= t.lastDate ||
    t.lastDate > d.referenceDate ||
    !t.serial.trim()
  )
    throw Error("Verifică seria și datele verificării.");
  const old = d.tachographs.find((x) => x.id === t.id);
  const updated = {
    ...t,
    history: [
      ...(old?.history ?? []),
      { date: d.referenceDate, note: `Termen actualizat: ${date(t.nextDate)}` },
    ],
  };
  if (old) d.tachographs[d.tachographs.indexOf(old)] = updated;
  else d.tachographs.push(updated);
}
export function sendReminder(
  d: Data,
  actor: Actor,
  v: Vehicle,
  category: Notification["category"],
) {
  authorize(
    d,
    actor,
    category === "Tahografe"
      ? "tahografe"
      : category === "ITP"
        ? "itp"
        : "notificari",
    v.locationId,
  );
  d.notifications.unshift({
    id: uid("n"),
    customerId: v.customerId,
    vehicleId: v.id,
    category,
    title:
      category === "ITP"
        ? "ITP-ul se apropie"
        : category === "Tahografe"
          ? "Verificarea tahografului se apropie"
          : "Întreținerea se apropie",
    body: `${v.plate} · Alege un interval potrivit pentru următoarea vizită.`,
    date: d.referenceDate,
    status: "Trimisă",
    read: false,
  });
  if (category === "ITP") {
    const r = d.itps.find((x) => x.vehicleId === v.id);
    if (r) r.status = "Notificat";
  }
  activity(d, "Reamintire trimisă", `${v.plate} · ${category}`, v.locationId);
}
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
export interface Repository {
  load(): Promise<Data>;
  save(data: Data): Promise<void>;
  reset(): Promise<Data>;
}
export const STORAGE_KEY = "white-label-auto-v1";
export function createRepository(storage: StorageAdapter): Repository {
  return {
    async load() {
      const raw = await storage.getItem(STORAGE_KEY);
      if (!raw) return createSeed();
      const value = JSON.parse(raw);
      if (
        value.schemaVersion !== 1 ||
        !Array.isArray(value.vehicles) ||
        !Array.isArray(value.appointments)
      )
        throw Error("Datele salvate nu au un format compatibil.");
      return value;
    },
    async save(d) {
      await storage.setItem(STORAGE_KEY, JSON.stringify(d));
    },
    async reset() {
      await storage.removeItem(STORAGE_KEY);
      return createSeed();
    },
  };
}
export { createSeed } from "./seed";
import { createSeed } from "./seed";

/** Builds the local queue only; no messages leave this application. */
export function rebuildScheduledNotifications(d: Data) {
  const scheduled: Notification[] = [];
  const add = (
    v: Vehicle,
    category: Notification["category"],
    due: string,
    title: string,
    offsets = d.reminderDays,
    appointmentId?: string,
  ) => {
    const customer = d.customers.find((c) => c.id === v.customerId);
    const preference =
      category === "ITP"
        ? "Expirare ITP"
        : category === "Tahografe"
          ? "Întreținere"
          : category;
    if (customer?.preferences[preference] === false) return;
    for (const offset of offsets) {
      const when = addDays(due, -offset);
      const id = `scheduled-${category}-${appointmentId ?? v.id}-${due}-${offset}`;
      if (
        when <= d.referenceDate ||
        d.notifications.some((n) => n.id === id && n.status === "Trimisă")
      )
        continue;
      scheduled.push({
        id,
        customerId: v.customerId,
        vehicleId: v.id,
        appointmentId,
        category,
        title,
        body: `${v.plate} · Termen: ${date(due)}.`,
        date: when,
        status: "Programată",
        read: false,
      });
    }
  };
  for (const v of d.vehicles) {
    const itp = d.itps.find((i) => i.vehicleId === v.id);
    if (itp) add(v, "ITP", itp.expires, "Reamintire expirare ITP");
    const tach = d.tachographs.find((t) => t.vehicleId === v.id);
    if (tach)
      add(v, "Tahografe", tach.nextDate, "Reamintire verificare tahograf");
    for (const a of d.appointments.filter(
      (a) =>
        a.vehicleId === v.id && !["Anulată", "Finalizată"].includes(a.status),
    ))
      add(v, "Programări", a.date, `Vizita de mâine · ${a.time}`, [1], a.id);
  }
  d.notifications = [
    ...d.notifications.filter((n) => n.status === "Trimisă"),
    ...scheduled.sort((a, b) => a.date.localeCompare(b.date)),
  ];
}
