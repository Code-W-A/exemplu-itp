"use client";
import { useState, type FormEvent } from "react";
import { Plus, Check, ArrowRight, CalendarDays } from "lucide-react";
import {
  addVehicle,
  authorize,
  updateMileage,
  saveRule,
  saveStaff,
  saveLocation,
  saveTachograph,
  bookAppointment,
  availableSlots,
  services,
  moduleLabels,
  uid,
  date,
  type Vehicle,
  type StaffMember,
  type Location,
  type MaintenanceRule,
  type Tachograph,
  type Service,
  type Module,
  type Appointment,
} from "@white-label/core";
import { useApp } from "@/lib/store";
import { Modal, Field, Button, Badge } from "./common";
export type EditRequest =
  | { type: "vehicle"; customerId?: string }
  | { type: "mileage"; vehicle: Vehicle }
  | { type: "rule"; rule?: MaintenanceRule; vehicleId?: string }
  | { type: "staff"; staff?: StaffMember }
  | { type: "location"; location?: Location }
  | { type: "tachograph"; tachograph: Tachograph }
  | { type: "customer" };
export function Editor({
  request,
  onClose,
}: {
  request: EditRequest;
  onClose: () => void;
}) {
  const { data, actor, commit, locations, location } = useApp();
  const r = request;
  const titles = {
    vehicle: "Adaugă vehicul",
    mileage: "Actualizează kilometrajul",
    rule: "Regulă de întreținere",
    staff: "Membru al echipei",
    location: "Configurare locație",
    tachograph: "Verificare tahograf",
    customer: "Client nou",
  };
  const [error, setError] = useState("");
  const initial = r.type === "staff" ? r.staff : undefined;
  const [perms, setPerms] = useState<Module[]>(
    initial?.permissions ?? ["programari", "clienti", "vehicule"],
  );
  const [assigned, setAssigned] = useState<string[]>(
    initial?.locationIds ?? [locations[0]?.id ?? "central"],
  );
  const l = r.type === "location" ? r.location : undefined;
  const [locServices, setLocServices] = useState<Service[]>(
    l?.services ?? ["ITP"],
  );
  const [weekdays, setWeekdays] = useState<number[]>(
    l?.weekdays ?? [1, 2, 3, 4, 5],
  );
  const rule = r.type === "rule" ? r.rule : undefined;
  const t = r.type === "tachograph" ? r.tachograph : undefined;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    const n = (k: string) => Number(s(k));
    setError("");
    try {
      let change: (d: typeof data) => void = () => {};
      if (r.type === "vehicle")
        change = (d) =>
          addVehicle(
            d,
            actor,
            {
              customerId: s("customerId"),
              locationId: s("locationId"),
              plate: s("plate"),
              make: s("make"),
              model: s("model"),
              year: n("year"),
              mileage: n("mileage"),
              category: s("category") as Vehicle["category"],
              tires: "Anvelope all season",
              tireDate: "2027-04-01",
            },
            s("itp"),
          );
      if (r.type === "mileage")
        change = (d) => updateMileage(d, actor, r.vehicle.id, n("mileage"));
      if (r.type === "rule")
        change = (d) =>
          saveRule(d, actor, {
            id: rule?.id ?? uid("rule"),
            vehicleId: s("vehicleId"),
            operation: s("operation"),
            intervalKm: n("intervalKm"),
            intervalMonths: n("intervalMonths"),
            lastKm: n("lastKm"),
            lastDate: s("lastDate"),
          });
      if (r.type === "staff")
        change = (d) =>
          saveStaff(d, actor, {
            id: initial?.id ?? uid("staff"),
            name: s("name"),
            email: s("email"),
            role: s("role"),
            superAdmin: s("level") === "admin",
            active: s("active") === "on",
            locationIds: assigned,
            permissions: perms,
          });
      if (r.type === "location")
        change = (d) =>
          saveLocation(d, actor, {
            id: l?.id ?? uid("loc"),
            name: s("name"),
            address: s("address"),
            phone: s("phone"),
            services: locServices,
            opens: s("opens"),
            closes: s("closes"),
            capacity: n("capacity"),
            weekdays,
            breakStart: s("breakStart"),
            breakEnd: s("breakEnd"),
          });
      if (r.type === "tachograph")
        change = (d) =>
          saveTachograph(d, actor, {
            ...r.tachograph,
            type: s("type"),
            serial: s("serial"),
            lastDate: s("lastDate"),
            nextDate: s("nextDate"),
          });
      if (r.type === "customer")
        change = (d) => {
          authorize(d, actor, "clienti", s("locationId"));
          if (!s("name") || !/^\S+@\S+\.\S+$/.test(s("email")))
            throw Error("Completează numele și o adresă de e-mail validă.");
          d.customers.push({
            id: uid("c"),
            name: s("name"),
            email: s("email"),
            phone: s("phone"),
            kind: s("kind") as "Companie" | "Persoană fizică",
            locationId: s("locationId"),
            preferences: {
              "Expirare ITP": true,
              Întreținere: true,
              Programări: true,
              "Noutăți și oferte": false,
            },
          });
        };
      if (
        r.type === "staff" &&
        initial?.active &&
        s("active") !== "on" &&
        !window.confirm("Dezactivezi acest membru al echipei?")
      )
        return;
      const copy = structuredClone(data);
      change(copy);
      if (commit(change)) onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  }
  const input = (
    name: string,
    label: string,
    value: string | number = "",
    type = "text",
    extra: Record<string, unknown> = {},
  ) => (
    <Field label={label}>
      <input name={name} defaultValue={value} type={type} required {...extra} />
    </Field>
  );
  return (
    <Modal
      title={r.type === "vehicle" ? "Adaugă un vehicul" : titles[r.type]}
      open
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="form-grid"
        onInvalid={(event) => {
          const input = event.target as HTMLInputElement;
          input.setCustomValidity("Completează corect acest câmp.");
        }}
        onInput={(event) => {
          const input = event.target as HTMLInputElement;
          input.setCustomValidity?.("");
        }}
      >
        {r.type === "vehicle" && (
          <>
            <Field label="Client">
              <select
                name="customerId"
                defaultValue={r.customerId ?? data.customers[0].id}
              >
                {data.customers
                  .filter(
                    (c) =>
                      locations.some((l) => l.id === c.locationId) ||
                      data.vehicles.some(
                        (v) =>
                          v.customerId === c.id &&
                          locations.some((l) => l.id === v.locationId),
                      ),
                  )
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Locație">
              <select
                name="locationId"
                defaultValue={location === "all" ? locations[0]?.id : location}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            {input("plate", "Număr de înmatriculare", "", "text", {
              placeholder: "B 123 ABC",
            })}
            {input("make", "Marcă")}
            {input("model", "Model")}
            {input("year", "An fabricație", 2022, "number", {
              min: 1950,
              max: 2030,
            })}
            {input("mileage", "Kilometraj", 0, "number", { min: 0 })}
            {input("itp", "Expirare ITP", "", "date")}
            <Field label="Categorie">
              <select name="category">
                <option>Autoturism</option>
                <option>Autoutilitară</option>
                <option>Camion</option>
              </select>
            </Field>
          </>
        )}
        {r.type === "mileage" && (
          <>
            <div className="form-full form-note">
              <strong>
                {r.vehicle.plate} · {r.vehicle.make} {r.vehicle.model}
              </strong>
              <p>Pragurile de întreținere se recalculează automat.</p>
            </div>
            {input(
              "mileage",
              "Kilometraj actual (km)",
              r.vehicle.mileage,
              "number",
              { min: r.vehicle.mileage },
            )}
          </>
        )}
        {r.type === "rule" && (
          <>
            <Field label="Vehicul">
              <select
                name="vehicleId"
                defaultValue={rule?.vehicleId ?? r.vehicleId}
              >
                {data.vehicles
                  .filter((v) => locations.some((l) => l.id === v.locationId))
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} · {v.make}
                    </option>
                  ))}
              </select>
            </Field>
            {input(
              "operation",
              "Operațiune",
              rule?.operation ?? "Ulei și filtre",
            )}
            {input(
              "intervalKm",
              "Interval kilometri",
              rule?.intervalKm ?? 10000,
              "number",
              { min: 0 },
            )}
            {input(
              "intervalMonths",
              "Interval luni",
              rule?.intervalMonths ?? 12,
              "number",
              { min: 0 },
            )}
            {input(
              "lastKm",
              "Kilometraj ultima intervenție",
              rule?.lastKm ?? 0,
              "number",
              { min: 0 },
            )}
            {input(
              "lastDate",
              "Data ultimei intervenții",
              rule?.lastDate ?? data.referenceDate,
              "date",
              { max: data.referenceDate },
            )}
            <p className="form-full muted">
              Se aplică primul prag atins. Folosește 0 pentru un interval pe
              care nu dorești să îl aplici.
            </p>
          </>
        )}
        {r.type === "staff" && (
          <>
            {input("name", "Nume complet", initial?.name)}
            {input("email", "E-mail", initial?.email, "email")}
            {input("role", "Funcție", initial?.role ?? "Recepție")}
            <Field label="Nivel de acces">
              <select
                name="level"
                defaultValue={initial?.superAdmin ? "admin" : "staff"}
              >
                <option value="staff">Personal</option>
                <option value="admin">Administrator principal</option>
              </select>
            </Field>
            <div className="form-full">
              <h3>Locații alocate</h3>
              <div className="checkbox-grid">
                {data.locations.map((l) => (
                  <label key={l.id}>
                    <input
                      type="checkbox"
                      checked={assigned.includes(l.id)}
                      onChange={() =>
                        setAssigned((a) =>
                          a.includes(l.id)
                            ? a.filter((x) => x !== l.id)
                            : [...a, l.id],
                        )
                      }
                    />
                    {l.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-full">
              <h3>Permisiuni pe module</h3>
              <div className="checkbox-grid">
                {(Object.keys(moduleLabels) as Module[]).map((p) => (
                  <label key={p}>
                    <input
                      type="checkbox"
                      checked={perms.includes(p)}
                      onChange={() =>
                        setPerms((a) =>
                          a.includes(p) ? a.filter((x) => x !== p) : [...a, p],
                        )
                      }
                    />
                    {moduleLabels[p]}
                  </label>
                ))}
              </div>
            </div>
            <label className="check-label form-full">
              <input
                name="active"
                type="checkbox"
                defaultChecked={initial?.active ?? true}
              />
              Cont activ
            </label>
          </>
        )}
        {r.type === "location" && (
          <>
            {input("name", "Nume locație", l?.name ?? "Locația ")}
            {input("phone", "Telefon", l?.phone)}
            <div className="form-full">
              {input("address", "Adresă", l?.address)}
            </div>
            {input("opens", "Deschidere", l?.opens ?? "08:00", "time", {
              step: 1800,
            })}
            {input("closes", "Închidere", l?.closes ?? "18:00", "time", {
              step: 1800,
            })}
            {input(
              "capacity",
              "Capacitate simultană",
              l?.capacity ?? 2,
              "number",
              { min: 1, max: 20 },
            )}
            <div />
            <Field label="Pauză de la">
              <input
                name="breakStart"
                type="time"
                step="1800"
                defaultValue={l?.breakStart ?? ""}
              />
            </Field>
            <Field label="Pauză până la">
              <input
                name="breakEnd"
                type="time"
                step="1800"
                defaultValue={l?.breakEnd ?? ""}
              />
            </Field>
            <div className="form-full">
              <h3>Servicii disponibile</h3>
              <div className="checkbox-grid">
                {services.map((s) => (
                  <label key={s}>
                    <input
                      type="checkbox"
                      checked={locServices.includes(s)}
                      onChange={() =>
                        setLocServices((a) =>
                          a.includes(s) ? a.filter((x) => x !== s) : [...a, s],
                        )
                      }
                    />
                    {s}
                  </label>
                ))}
              </div>
              <h3>Zile de lucru</h3>
              <div className="checkbox-grid">
                {[
                  "Duminică",
                  "Luni",
                  "Marți",
                  "Miercuri",
                  "Joi",
                  "Vineri",
                  "Sâmbătă",
                ].map((s, i) => (
                  <label key={s}>
                    <input
                      type="checkbox"
                      checked={weekdays.includes(i)}
                      onChange={() =>
                        setWeekdays((a) =>
                          a.includes(i) ? a.filter((x) => x !== i) : [...a, i],
                        )
                      }
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
        {r.type === "tachograph" && (
          <>
            {input("type", "Tip tahograf", t?.type)}
            {input("serial", "Număr de serie", t?.serial)}
            {input("lastDate", "Ultima verificare", t?.lastDate, "date", {
              max: data.referenceDate,
            })}
            {input("nextDate", "Următoarea verificare", t?.nextDate, "date")}
          </>
        )}
        {r.type === "customer" && (
          <>
            {input("name", "Nume / denumire")}
            {input("email", "E-mail", "", "email")}
            {input("phone", "Telefon", "", "tel")}
            <Field label="Tip client">
              <select name="kind">
                <option>Persoană fizică</option>
                <option>Companie</option>
              </select>
            </Field>
            <Field label="Locație">
              <select
                name="locationId"
                defaultValue={location === "all" ? locations[0]?.id : location}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        {error && (
          <p className="form-error form-full" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions form-full">
          <Button type="button" variant="outline" onClick={onClose}>
            Renunță
          </Button>
          <Button type="submit">
            <Check size={16} />
            Salvează
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function Booking({
  onClose,
  vehicleId,
  edit,
  service: initialService,
}: {
  onClose: () => void;
  vehicleId?: string;
  edit?: Appointment;
  service?: Service;
}) {
  const { data, actor, commit, locations, location } = useApp();
  const [vid, setVid] = useState(
    edit?.vehicleId ??
      vehicleId ??
      data.vehicles.find(
        (v) =>
          locations.some((l) => l.id === v.locationId) &&
          (location === "all" || v.locationId === location),
      )?.id ??
      data.vehicles.find((v) => locations.some((l) => l.id === v.locationId))
        ?.id ??
      "",
  );
  const [service, setService] = useState<Service>(
    edit?.service ?? initialService ?? "ITP",
  );
  const [lid, setLid] = useState(
    edit?.locationId ??
      locations.find((l) => l.id === location && l.services.includes(service))
        ?.id ??
      locations.find((l) => l.services.includes(service))?.id ??
      "",
  );
  const [day, setDay] = useState(edit?.date ?? data.referenceDate);
  const [time, setTime] = useState(edit?.time ?? "");
  const [staff, setStaff] = useState(edit?.staffId ?? "");
  const [notes, setNotes] = useState(edit?.notes ?? "");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const slots = availableSlots(data, lid, service, day, edit?.id, staff);
  const vehicle = data.vehicles.find((v) => v.id === vid);
  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (!vehicle)
        throw Error("Adaugă un vehicul înainte de a crea programarea.");
      const input = {
        vehicleId: vid,
        customerId: vehicle.customerId,
        locationId: lid,
        service,
        date: day,
        time,
        staffId: staff,
        notes,
      };
      bookAppointment(structuredClone(data), actor, input, edit?.id);
      if (
        commit((d) => {
          const id = bookAppointment(d, actor, input, edit?.id);
          setDone(id);
        }, "Programarea a fost salvată.")
      ) {
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal
      title={
        done
          ? "Programare confirmată"
          : edit
            ? "Reprogramează vizita"
            : "Programare nouă"
      }
      description={
        done
          ? "Toate detaliile vizitei au fost salvate."
          : "Alege vehiculul, serviciul și un interval disponibil."
      }
      open
      onClose={onClose}
    >
      {done ? (
        <div className="success-state">
          <span>
            <Check size={36} />
          </span>
          <h2>Totul este pregătit.</h2>
          <p>
            {vehicle?.plate} · {service}
          </p>
          <div className="confirmation-box">
            <strong>
              {date(day, true)} · {time}
            </strong>
            <p>{data.locations.find((l) => l.id === lid)?.name}</p>
          </div>
          <Button onClick={onClose}>Vezi programările</Button>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="form-grid"
          onInvalid={(event) => {
            const input = event.target as HTMLInputElement;
            input.setCustomValidity("Completează corect acest câmp.");
          }}
          onInput={(event) => {
            const input = event.target as HTMLInputElement;
            input.setCustomValidity?.("");
          }}
        >
          <Field label="Vehicul și client">
            <select
              value={vid}
              onChange={(e) => {
                setVid(e.target.value);
                setTime("");
              }}
            >
              {data.vehicles
                .filter((v) => locations.some((l) => l.id === v.locationId))
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} ·{" "}
                    {data.customers.find((c) => c.id === v.customerId)?.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Serviciu">
            <select
              value={service}
              onChange={(e) => {
                const s = e.target.value as Service;
                setService(s);
                setLid(locations.find((l) => l.services.includes(s))?.id ?? "");
                setTime("");
                setStaff("");
              }}
            >
              {services
                .filter(
                  (s) =>
                    s !== "Verificare tahograf" ||
                    data.tachographs.some((t) => t.vehicleId === vid),
                )
                .map((s) => (
                  <option key={s}>{s}</option>
                ))}
            </select>
          </Field>
          <Field label="Locație">
            <select
              value={lid}
              onChange={(e) => {
                setLid(e.target.value);
                setTime("");
                setStaff("");
              }}
            >
              {locations
                .filter((l) => l.services.includes(service))
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Data vizitei">
            <input
              type="date"
              min={data.referenceDate}
              value={day}
              required
              onChange={(e) => {
                setDay(e.target.value);
                setTime("");
              }}
            />
          </Field>
          <Field label="Angajat">
            <select
              value={staff}
              onChange={(e) => {
                setStaff(e.target.value);
                setTime("");
              }}
            >
              <option value="">Fără alocare</option>
              {data.staff
                .filter(
                  (s) =>
                    s.active &&
                    s.locationIds.includes(lid) &&
                    s.permissions.includes("programari"),
                )
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Observații">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalii utile pentru echipă"
            />
          </Field>
          <div className="form-full">
            <h3>Intervale disponibile</h3>
            <div className="slot-grid">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  className={time === s ? "selected" : ""}
                  onClick={() => setTime(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {!slots.length && (
              <p className="muted">
                Nu sunt intervale disponibile. Alege o altă dată sau locație.
              </p>
            )}
          </div>
          {error && (
            <p className="form-full form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions form-full">
            <Button type="button" variant="outline" onClick={onClose}>
              Renunță
            </Button>
            <Button
              disabled={!vehicle || !time || !slots.includes(time)}
              type="submit"
            >
              Confirmă programarea
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
