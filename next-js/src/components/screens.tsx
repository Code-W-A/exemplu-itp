"use client";
import { useState } from "react";
import {
  Plus,
  ArrowUpRight,
  CarFront,
  Users,
  CalendarDays,
  List,
  Download,
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Wrench,
  Gauge,
  Send,
  Check,
  SlidersHorizontal,
  Pencil,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  moduleLabels,
  appointmentStatuses,
  services,
  number,
  date,
  expiry,
  maintenance,
  setAppointmentStatus,
  sendReminder,
  saveStaff,
  authorize,
  addDays,
  type Module,
  type Service,
  type Appointment,
  type Notification,
} from "@white-label/core";
import { useApp } from "@/lib/store";
import {
  Heading,
  Panel,
  Table,
  Badge,
  Avatar,
  Button,
  Empty,
  Modal,
  Field,
  statusTone,
  Metric,
} from "./common";
import { Booking, Editor, type EditRequest } from "./forms";
import { CustomerDetail, VehicleDetail } from "./details";
const descriptions: Record<Module, string> = {
  programari: "Fiecare vizită, la locul și la timpul potrivit.",
  clienti: "O relație bună începe cu atenția la detalii.",
  vehicule: "Toate informațiile de care ai nevoie, pentru fiecare vehicul.",
  itp: "Anticipează scadențele. Păstrează legătura cu clienții.",
  intretinere: "Grijă constantă, la fiecare kilometru.",
  tahografe:
    "Verificări periodice și termene clare pentru vehiculele comerciale.",
  locatii: "Aceeași experiență. În fiecare punct de lucru.",
  personal: "O echipă organizată, cu accesul potrivit.",
  notificari: "Mesajele potrivite, la momentul potrivit.",
  rapoarte: "Înțelege activitatea și ia decizii informate.",
  setari: "Configurează platforma în jurul modului în care lucrezi.",
};
export function EntityScreens({ section }: { section: Module }) {
  return <Section key={section} section={section} />;
}
function Section({ section }: { section: Module }) {
  const { data, actor, scope, locations, location, search, commit, allowed } =
    useApp();
  const [editor, setEditor] = useState<EditRequest | null>(null);
  const [booking, setBooking] = useState<{
    vehicleId?: string;
    edit?: Appointment;
    service?: Service;
  } | null>(null);
  const [customer, setCustomer] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [appointment, setAppointment] = useState("");
  const [filter, setFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [view, setView] = useState("list");
  const [day, setDay] = useState(data.referenceDate);
  const [confirm, setConfirm] = useState<{
    title: string;
    run: () => void;
  } | null>(null);
  const [from, setFrom] = useState("2026-10-01");
  const [to, setTo] = useState("2026-10-31");
  const [days, setDays] = useState(data.reminderDays.join(", "));
  const [notice, setNotice] = useState<Notification | null>(null);
  const match = (...parts: (string | undefined)[]) =>
    parts.join(" ").toLowerCase().includes(search.toLowerCase());
  const vs = data.vehicles.filter((v) => scope(v.locationId));
  const customerName = (id: string) =>
    data.customers.find((c) => c.id === id)?.name ?? "";
  const vehicleName = (id: string) =>
    data.vehicles.find((v) => v.id === id)?.plate ?? "";
  const locationName = (id: string) =>
    data.locations.find((l) => l.id === id)?.name ?? "";
  const visibleCustomers = data.customers.filter(
    (c) => scope(c.locationId) || vs.some((v) => v.customerId === c.id),
  );
  const appointments = data.appointments
    .filter(
      (a) =>
        scope(a.locationId) &&
        (!day || a.date === day) &&
        (filter === "all" || a.status === filter) &&
        (serviceFilter === "all" || a.service === serviceFilter) &&
        (employee === "all" || a.staffId === employee) &&
        match(vehicleName(a.vehicleId), customerName(a.customerId), a.service),
    )
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    );
  const selected = data.appointments.find((a) => a.id === appointment);
  const action =
    section === "programari" ? (
      <Button onClick={() => setBooking({})}>
        <Plus size={16} />
        Programare nouă
      </Button>
    ) : section === "vehicule" ? (
      <Button onClick={() => setEditor({ type: "vehicle" })}>
        <Plus size={16} />
        Adaugă vehicul
      </Button>
    ) : section === "clienti" ? (
      <Button onClick={() => setEditor({ type: "customer" })}>
        <Plus size={16} />
        Adaugă client
      </Button>
    ) : section === "intretinere" ? (
      <Button onClick={() => setEditor({ type: "rule" })}>
        <Plus size={16} />
        Regulă nouă
      </Button>
    ) : section === "personal" &&
      data.staff.find((s) => s.id === actor.id)?.superAdmin ? (
      <Button onClick={() => setEditor({ type: "staff" })}>
        <Plus size={16} />
        Adaugă membru
      </Button>
    ) : section === "locatii" ? (
      <Button onClick={() => setEditor({ type: "location" })}>
        <Plus size={16} />
        Adaugă locație
      </Button>
    ) : null;
  function exportCsv() {
    const rows = [
      ["Data", "Ora", "Client", "Vehicul", "Serviciu", "Locație", "Stare"],
      ...reportAppointments.map((a) => [
        date(a.date),
        a.time,
        customerName(a.customerId),
        vehicleName(a.vehicleId),
        a.service,
        locationName(a.locationId),
        a.status,
      ]),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((row) =>
          row
            .map(
              (v) =>
                '"' +
                v.replace(/"/g, '""').replace(/^[=+@-]/, "'" + v[0]) +
                '"',
            )
            .join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "raport-programari.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  const reportAppointments = data.appointments.filter(
    (a) => scope(a.locationId) && a.date >= from && a.date <= to,
  );
  return (
    <>
      <Heading
        eyebrow="ADMINISTRARE"
        title={moduleLabels[section]}
        description={descriptions[section]}
        action={action}
      />
      {section === "programari" && (
        <Panel>
          <div className="filters">
            <label className="filter-date">
              <CalendarDays size={16} />
              <input
                aria-label="Data programărilor"
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </label>
            <select
              aria-label="Filtrează după serviciu"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">Toate serviciile</option>
              {services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="Filtrează după stare"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Toate stările</option>
              {appointmentStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="Filtrează după angajat"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
            >
              <option value="all">Toți angajații</option>
              {data.staff
                .filter((s) => s.locationIds.some(scope))
                .map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            <div className="view-switch">
              <button
                aria-label="Vizualizare listă"
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
              >
                <List size={17} />
              </button>
              <button
                aria-label="Vizualizare calendar"
                className={view === "calendar" ? "active" : ""}
                onClick={() => setView("calendar")}
              >
                <CalendarDays size={17} />
              </button>
            </div>
          </div>
          {view === "list" ? (
            <Table
              headers={[
                "Data / Ora",
                "Client",
                "Vehicul",
                "Serviciu",
                "Locație",
                "Stare",
                "",
              ]}
            >
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.time}</strong>
                    <small>{date(a.date)}</small>
                  </td>
                  <td>
                    <button
                      className="person-cell"
                      onClick={() => setCustomer(a.customerId)}
                    >
                      <Avatar name={customerName(a.customerId)} small />
                      <strong>{customerName(a.customerId)}</strong>
                    </button>
                  </td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => setVehicle(a.vehicleId)}
                    >
                      {vehicleName(a.vehicleId)}
                    </button>
                  </td>
                  <td>{a.service}</td>
                  <td>{locationName(a.locationId)}</td>
                  <td>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={
                        "Deschide programarea " +
                        a.time +
                        " " +
                        vehicleName(a.vehicleId)
                      }
                      onClick={() => setAppointment(a.id)}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <div className="calendar-board">
              {locations
                .filter((l) => scope(l.id))
                .map((l) => (
                  <div className="calendar-column" key={l.id}>
                    <h3>
                      <MapPin size={16} />
                      {l.name}
                    </h3>
                    {appointments
                      .filter((a) => a.locationId === l.id)
                      .map((a) => (
                        <button
                          className={"calendar-event " + statusTone(a.status)}
                          key={a.id}
                          onClick={() => setAppointment(a.id)}
                        >
                          <strong>
                            {a.time} · {a.service}
                          </strong>
                          <span>{customerName(a.customerId)}</span>
                          <small>
                            {vehicleName(a.vehicleId)} · {a.status}
                          </small>
                        </button>
                      ))}
                    {!appointments.some((a) => a.locationId === l.id) && (
                      <p className="muted">Nicio programare.</p>
                    )}
                  </div>
                ))}
            </div>
          )}
          {!appointments.length && <Empty />}
          <div className="table-footer">
            {appointments.length} programări afișate
            <button
              className="text-button"
              onClick={() => {
                setDay("");
                setFilter("all");
                setServiceFilter("all");
                setEmployee("all");
              }}
            >
              Vezi întreg istoricul
            </button>
          </div>
        </Panel>
      )}
      {section === "clienti" && (
        <>
          <div className="tabs-line">
            {[
              ["all", "Toți clienții"],
              ["Persoană fizică", "Persoane fizice"],
              ["Companie", "Flote și companii"],
            ].map(([v, l]) => (
              <button
                key={v}
                className={filter === v ? "active" : ""}
                onClick={() => setFilter(v)}
              >
                {l}
              </button>
            ))}
          </div>
          <Panel>
            <Table
              headers={[
                "Client",
                "Contact",
                "Vehicule",
                "Locație",
                "Tip cont",
                "",
              ]}
            >
              {visibleCustomers
                .filter(
                  (c) =>
                    (filter === "all" || c.kind === filter) &&
                    match(c.name, c.email, c.phone),
                )
                .map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button
                        className="person-cell"
                        onClick={() => setCustomer(c.id)}
                      >
                        <Avatar name={c.name} />
                        <span>
                          <strong>{c.name}</strong>
                          <small>Client din 2025</small>
                        </span>
                      </button>
                    </td>
                    <td>
                      {c.email}
                      <small>{c.phone}</small>
                    </td>
                    <td>
                      <span className="vehicle-count">
                        <CarFront size={16} />
                        {vs.filter((v) => v.customerId === c.id).length}{" "}
                        vehicule
                      </span>
                    </td>
                    <td>{locationName(c.locationId)}</td>
                    <td>
                      <Badge tone={c.kind === "Companie" ? "blue" : "gray"}>
                        {c.kind === "Companie" ? "Flotă" : "Persoană fizică"}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={"Deschide clientul " + c.name}
                        onClick={() => setCustomer(c.id)}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
            </Table>
            {!visibleCustomers.some(
              (c) =>
                (filter === "all" || c.kind === filter) &&
                match(c.name, c.email, c.phone),
            ) && <Empty />}
          </Panel>
        </>
      )}
      {section === "vehicule" && (
        <Panel>
          <Table
            headers={[
              "Vehicul",
              "Proprietar",
              "Kilometraj",
              "Expirare ITP",
              "Categorie",
              "",
            ]}
          >
            {vs
              .filter((v) =>
                match(v.plate, v.make, v.model, customerName(v.customerId)),
              )
              .map((v) => {
                const itp = data.itps.find((i) => i.vehicleId === v.id)!;
                return (
                  <tr key={v.id}>
                    <td>
                      <button
                        className="person-cell"
                        onClick={() => setVehicle(v.id)}
                      >
                        <span className="tile-icon">
                          <CarFront size={22} />
                        </span>
                        <span>
                          <strong>{v.plate}</strong>
                          <small>
                            {v.make} {v.model} · {v.year}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setCustomer(v.customerId)}
                      >
                        {customerName(v.customerId)}
                      </button>
                    </td>
                    <td>
                      <button
                        className="mileage-button"
                        onClick={() =>
                          setEditor({ type: "mileage", vehicle: v })
                        }
                      >
                        {number(v.mileage)} km
                        <Pencil size={13} />
                      </button>
                    </td>
                    <td>
                      {date(itp.expires)}
                      <small>
                        <Badge
                          tone={expiry(itp.expires, data.referenceDate).tone}
                        >
                          {expiry(itp.expires, data.referenceDate).label}
                        </Badge>
                      </small>
                    </td>
                    <td>{v.category}</td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={"Detalii " + v.plate}
                        onClick={() => setVehicle(v.id)}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </Table>
          {!vs.some((v) =>
            match(v.plate, v.make, v.model, customerName(v.customerId)),
          ) && <Empty />}
        </Panel>
      )}
      {section === "itp" && (
        <>
          <div className="tabs-line">
            {[
              ["all", "Toate scadențele"],
              ["30", "În 30 de zile"],
              ["14", "În 14 zile"],
              ["7", "În 7 zile"],
              ["expired", "Expirate"],
            ].map(([v, l]) => (
              <button
                key={v}
                className={filter === v ? "active" : ""}
                onClick={() => setFilter(v)}
              >
                {l}
              </button>
            ))}
          </div>
          <Panel>
            <Table
              headers={[
                "Vehicul",
                "Client",
                "Expirare ITP",
                "Termen",
                "Contactare",
                "Acțiuni",
              ]}
            >
              {data.itps
                .filter((i) => {
                  const v = vs.find((v) => v.id === i.vehicleId);
                  const days = expiry(i.expires, data.referenceDate).days;
                  return (
                    v &&
                    match(v.plate, customerName(v.customerId)) &&
                    (filter === "all" ||
                      (filter === "expired" && days < 0) ||
                      (days >= 0 && days <= Number(filter)))
                  );
                })
                .map((i) => {
                  const v = vs.find((v) => v.id === i.vehicleId)!;
                  const e = expiry(i.expires, data.referenceDate);
                  return (
                    <tr key={i.id}>
                      <td>
                        <button
                          className="text-button"
                          onClick={() => setVehicle(v.id)}
                        >
                          {v.plate}
                        </button>
                        <small>
                          {v.make} {v.model}
                        </small>
                      </td>
                      <td>{customerName(v.customerId)}</td>
                      <td>{date(i.expires)}</td>
                      <td>
                        <Badge tone={e.tone}>{e.label}</Badge>
                      </td>
                      <td>
                        <select
                          aria-label={"Contactare " + v.plate}
                          value={i.status}
                          onChange={(e) =>
                            commit((d) => {
                              authorize(d, actor, "itp", v.locationId);
                              d.itps.find((x) => x.id === i.id)!.status = e
                                .target.value as typeof i.status;
                            })
                          }
                        >
                          {[
                            "De contactat",
                            "Notificat",
                            "Programat",
                            "Finalizat",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="text-button"
                            onClick={() =>
                              commit(
                                (d) => sendReminder(d, actor, v, "ITP"),
                                "Reamintirea a fost înregistrată.",
                              )
                            }
                          >
                            <Send size={14} />
                            Reamintește
                          </button>
                          {allowed("programari") && (
                            <button
                              className="text-button"
                              onClick={() =>
                                setBooking({ vehicleId: v.id, service: "ITP" })
                              }
                            >
                              Programează
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </Table>
          </Panel>
        </>
      )}
      {section === "intretinere" && (
        <Panel>
          <Table
            headers={[
              "Vehicul / Client",
              "Operațiune",
              "Următorul prag",
              "Rămas",
              "Stare",
              "",
            ]}
          >
            {data.rules
              .filter(
                (r) =>
                  vs.some((v) => v.id === r.vehicleId) &&
                  match(r.operation, vehicleName(r.vehicleId)),
              )
              .map((r) => {
                const v = vs.find((v) => v.id === r.vehicleId)!;
                const m = maintenance(r, v, data.referenceDate);
                return (
                  <tr key={r.id}>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setVehicle(v.id)}
                      >
                        {v.plate}
                      </button>
                      <small>{customerName(v.customerId)}</small>
                    </td>
                    <td>
                      <strong>{r.operation}</strong>
                      <small>
                        {r.intervalKm ? number(r.intervalKm) + " km" : ""}
                        {r.intervalKm && r.intervalMonths ? " / " : ""}
                        {r.intervalMonths ? r.intervalMonths + " luni" : ""}
                      </small>
                    </td>
                    <td>
                      {m.nextKm ? number(m.nextKm) + " km" : ""}
                      <small>
                        {m.nextDate ? "sau " + date(m.nextDate) : ""}
                      </small>
                    </td>
                    <td>
                      {m.remaining === null ? "—" : number(m.remaining) + " km"}
                    </td>
                    <td>
                      <Badge tone={m.tone}>{m.label}</Badge>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={
                          "Editează regula " + v.plate + " " + r.operation
                        }
                        onClick={() => setEditor({ type: "rule", rule: r })}
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </Table>
        </Panel>
      )}
      {section === "tahografe" && (
        <Panel>
          <Table
            headers={[
              "Vehicul / Client",
              "Tahograf",
              "Ultima verificare",
              "Următoarea verificare",
              "Locație",
              "Acțiuni",
            ]}
          >
            {data.tachographs
              .filter(
                (t) =>
                  vs.some((v) => v.id === t.vehicleId) &&
                  match(
                    t.serial,
                    vehicleName(t.vehicleId),
                    customerName(
                      vs.find((v) => v.id === t.vehicleId)!.customerId,
                    ),
                  ),
              )
              .map((t) => {
                const v = vs.find((v) => v.id === t.vehicleId)!;
                const e = expiry(t.nextDate, data.referenceDate);
                return (
                  <tr key={t.id}>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setVehicle(v.id)}
                      >
                        {v.plate}
                      </button>
                      <small>{customerName(v.customerId)}</small>
                    </td>
                    <td>
                      {t.type}
                      <small>{t.serial}</small>
                    </td>
                    <td>{date(t.lastDate)}</td>
                    <td>
                      {date(t.nextDate)}
                      <small>
                        <Badge tone={e.tone}>{e.label}</Badge>
                      </small>
                    </td>
                    <td>{locationName(t.locationId)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          aria-label={"Actualizează tahograful " + v.plate}
                          className="icon-button"
                          onClick={() =>
                            setEditor({ type: "tachograph", tachograph: t })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          aria-label={"Reamintește verificarea " + v.plate}
                          className="icon-button"
                          onClick={() =>
                            commit(
                              (d) => sendReminder(d, actor, v, "Tahografe"),
                              "Reamintirea a fost înregistrată.",
                            )
                          }
                        >
                          <Send size={16} />
                        </button>
                        {allowed("programari") && (
                          <button
                            className="text-button"
                            onClick={() =>
                              setBooking({
                                vehicleId: v.id,
                                service: "Verificare tahograf",
                              })
                            }
                          >
                            Programează
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </Table>
        </Panel>
      )}
      {section === "locatii" && (
        <div className="location-cards">
          {locations
            .filter((l) => scope(l.id) && match(l.name, l.address))
            .map((l, i) => (
              <Panel key={l.id}>
                <div className={"location-visual location-" + i}>
                  <span className="map-road r1" />
                  <span className="map-road r2" />
                  <span className="map-road r3" />
                  <div className="map-pin">
                    <MapPin size={26} />
                  </div>
                  <Badge tone="green">Locație activă</Badge>
                </div>
                <div className="location-content">
                  <div className="section-title">
                    <h2>{l.name}</h2>
                    <button
                      className="icon-button"
                      aria-label={"Editează " + l.name}
                      onClick={() =>
                        setEditor({ type: "location", location: l })
                      }
                    >
                      <Pencil size={17} />
                    </button>
                  </div>
                  <p>
                    <MapPin size={15} />
                    {l.address}
                  </p>
                  <p>
                    <Clock size={15} />
                    {l.opens} – {l.closes} · {l.weekdays.length} zile /
                    săptămână
                  </p>
                  <p>
                    <Phone size={15} />
                    {l.phone}
                  </p>
                  <div className="service-tags">
                    {l.services.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                  <div className="location-stats">
                    <div>
                      <strong>
                        {
                          data.staff.filter(
                            (s) => s.active && s.locationIds.includes(l.id),
                          ).length
                        }
                      </strong>
                      <span>Membri echipă</span>
                    </div>
                    <div>
                      <strong>{l.capacity}</strong>
                      <span>Locuri simultane</span>
                    </div>
                    <div>
                      <strong>
                        {
                          data.appointments.filter(
                            (a) =>
                              a.locationId === l.id &&
                              a.date === data.referenceDate &&
                              a.status !== "Anulată",
                          ).length
                        }
                      </strong>
                      <span>Programări azi</span>
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
        </div>
      )}
      {section === "personal" && (
        <div className="staff-grid">
          {data.staff
            .filter((s) => s.locationIds.some(scope) && match(s.name, s.role))
            .map((s) => (
              <Panel key={s.id}>
                <div className="staff-card">
                  <div className="staff-top">
                    <Avatar name={s.name} />
                    <Badge tone={s.active ? "green" : "gray"}>
                      {s.active ? "Activ" : "Inactiv"}
                    </Badge>
                  </div>
                  <h2>{s.name}</h2>
                  <p>{s.role}</p>
                  <small>{s.email}</small>
                  <div className="staff-locations">
                    {s.locationIds.map((id) => (
                      <span key={id}>
                        <MapPin size={13} />
                        {locationName(id).replace("Locația ", "")}
                      </span>
                    ))}
                  </div>
                  <div className="permission-tags">
                    {s.superAdmin ? (
                      <Badge tone="blue">Acces complet</Badge>
                    ) : (
                      s.permissions.map((p) => (
                        <span key={p}>{moduleLabels[p]}</span>
                      ))
                    )}
                  </div>
                  {data.staff.find((x) => x.id === actor.id)?.superAdmin && (
                    <div className="staff-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditor({ type: "staff", staff: s })}
                      >
                        Gestionează accesul
                      </Button>
                      {s.id !== actor.id && (
                        <button
                          className="text-button muted"
                          onClick={() =>
                            setConfirm({
                              title: s.active
                                ? "Dezactivezi acest membru?"
                                : "Reactivezi acest membru?",
                              run: () =>
                                commit((d) =>
                                  saveStaff(d, actor, {
                                    ...s,
                                    active: !s.active,
                                  }),
                                ),
                            })
                          }
                        >
                          {s.active ? "Dezactivează" : "Reactivează"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            ))}
        </div>
      )}
      {section === "notificari" && (
        <>
          <div className="tabs-line">
            {[
              "all",
              "ITP",
              "Întreținere",
              "Programări",
              "Tahografe",
              "Campanii",
            ].map((s) => (
              <button
                key={s}
                className={filter === s ? "active" : ""}
                onClick={() => setFilter(s)}
              >
                {s === "all" ? "Toate mesajele" : s}
              </button>
            ))}
          </div>
          <Panel>
            <Table
              headers={[
                "Mesaj",
                "Destinatar",
                "Categorie",
                "Data",
                "Stare",
                "Acțiune",
              ]}
            >
              {data.notifications
                .filter(
                  (n) =>
                    vs.some((v) => v.id === n.vehicleId) &&
                    (filter === "all" || n.category === filter) &&
                    match(n.title, customerName(n.customerId)),
                )
                .map((n) => (
                  <tr key={n.id}>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setNotice(n)}
                      >
                        {n.title}
                      </button>
                      <small>{vehicleName(n.vehicleId)}</small>
                    </td>
                    <td>{customerName(n.customerId)}</td>
                    <td>{n.category}</td>
                    <td>{date(n.date)}</td>
                    <td>
                      <Badge tone={statusTone(n.status)}>{n.status}</Badge>
                    </td>
                    <td>
                      {n.status === "Programată" ? (
                        <button
                          className="text-button"
                          onClick={() =>
                            commit((d) => {
                              const item = d.notifications.find(
                                (x) => x.id === n.id,
                              )!;
                              item.status = "Trimisă";
                              item.date = d.referenceDate;
                            }, "Mesajul a fost înregistrat în istoricul trimiterilor.")
                          }
                        >
                          <Send size={14} />
                          Trimite acum
                        </button>
                      ) : (
                        <button
                          className="text-button"
                          onClick={() => setNotice(n)}
                        >
                          Vezi mesajul
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </Table>
          </Panel>
        </>
      )}
      {section === "rapoarte" && (
        <>
          <div className="report-filters">
            <Field label="De la">
              <input
                aria-label="Raport de la"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Field>
            <Field label="Până la">
              <input
                aria-label="Raport până la"
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
              />
            </Field>
            <Button variant="outline" onClick={exportCsv} disabled={from > to}>
              <Download size={16} />
              Exportă CSV
            </Button>
          </div>
          <div className="report-metrics">
            <Metric
              label="Total programări"
              value={reportAppointments.length}
              detail="În perioada selectată"
              icon={<CalendarDays size={20} />}
            />
            <Metric
              label="Vizite finalizate"
              value={
                reportAppointments.filter((a) => a.status === "Finalizată")
                  .length
              }
              detail="Servicii efectuate"
              icon={<Check size={20} />}
            />
            <Metric
              label="Clienți deserviți"
              value={
                new Set(
                  reportAppointments
                    .filter((a) => a.status === "Finalizată")
                    .map((a) => a.customerId),
                ).size
              }
              detail="Clienți unici"
              icon={<Users size={20} />}
            />
          </div>
          <Panel
            title="Distribuția serviciilor"
            subtitle="Volumul programărilor în perioada selectată"
          >
            <div className="report-chart">
              {services.map((s, i) => {
                const count = reportAppointments.filter(
                  (a) => a.service === s,
                ).length;
                return (
                  <div key={s}>
                    <span>{s}</span>
                    <div className="chart-track">
                      <span
                        style={{
                          width: `${(count / Math.max(reportAppointments.length, 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      )}
      {section === "setari" && (
        <div className="settings-grid">
          <Panel
            title="Identitatea platformei"
            subtitle="O experiență unitară pentru clienți și echipă"
          >
            <div className="settings-body">
              <span className="brand-preview">WHITE LABEL</span>
              <div className="detail-row">
                <span>Limba interfeței</span>
                <strong>Română</strong>
              </div>
              <div className="detail-row">
                <span>Fus orar</span>
                <strong>Europe/Bucharest</strong>
              </div>
              <div className="detail-row">
                <span>Format oră</span>
                <strong>24 de ore</strong>
              </div>
            </div>
          </Panel>
          <Panel
            title="Reamintiri înainte de scadență"
            subtitle="Intervalele utilizate pentru notificările de expirare"
          >
            <form
              className="settings-body"
              onSubmit={(e) => {
                e.preventDefault();
                commit((d) => {
                  authorize(d, actor, "setari");
                  const ns = days.split(",").map((x) => Number(x.trim()));
                  if (
                    !ns.length ||
                    ns.some((n) => !Number.isInteger(n) || n < 1 || n > 365) ||
                    new Set(ns).size !== ns.length
                  )
                    throw Error(
                      "Introdu zile distincte între 1 și 365, separate prin virgulă.",
                    );
                  d.reminderDays = ns.sort((a, b) => b - a);
                });
              }}
            >
              <Field label="Zile înainte de expirare">
                <input value={days} onChange={(e) => setDays(e.target.value)} />
              </Field>
              <p className="muted">Exemplu: 30, 14, 7, 1</p>
              <Button type="submit">Salvează preferințele</Button>
            </form>
          </Panel>
          <Panel
            title="Program, servicii și capacitate"
            subtitle="Setări specifice fiecărei locații"
          >
            <div className="settings-body">
              {locations.map((l) => (
                <div className="detail-row" key={l.id}>
                  <div className="grow">
                    <strong>{l.name}</strong>
                    <p>
                      {l.opens} – {l.closes} · {l.capacity} locuri simultane
                    </p>
                  </div>
                  {allowed("locatii") && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditor({ type: "location", location: l })
                      }
                    >
                      Configurează
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
      {selected && (
        <Modal
          title="Detaliile programării"
          description={
            vehicleName(selected.vehicleId) + " · " + selected.service
          }
          open
          onClose={() => setAppointment("")}
        >
          <div className="confirmation-box">
            <CalendarDays size={25} />
            <h2>
              {date(selected.date, true)} · {selected.time}
            </h2>
            <p>{locationName(selected.locationId)}</p>
            <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
          </div>
          <div className="detail-row">
            <span>Client</span>
            <button
              className="text-button"
              onClick={() => setCustomer(selected.customerId)}
            >
              {customerName(selected.customerId)}
              <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="detail-row">
            <span>Vehicul</span>
            <button
              className="text-button"
              onClick={() => setVehicle(selected.vehicleId)}
            >
              {vehicleName(selected.vehicleId)}
            </button>
          </div>
          <div className="detail-row">
            <span>Angajat</span>
            <strong>
              {data.staff.find((s) => s.id === selected.staffId)?.name ??
                "Fără alocare"}
            </strong>
          </div>
          {selected.notes && <p>{selected.notes}</p>}
          {!["Anulată", "Finalizată"].includes(selected.status) && (
            <>
              <Field label="Actualizează starea">
                <select
                  value={selected.status}
                  onChange={(e) => {
                    const status = e.target.value as Appointment["status"];
                    if (status === "Anulată")
                      setConfirm({
                        title: "Anulezi această programare?",
                        run: () =>
                          commit((d) =>
                            setAppointmentStatus(d, actor, selected.id, status),
                          ),
                      });
                    else
                      commit((d) =>
                        setAppointmentStatus(d, actor, selected.id, status),
                      );
                  }}
                >
                  {appointmentStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <div className="form-actions">
                {selected.status !== "În lucru" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBooking({ edit: selected });
                      setAppointment("");
                    }}
                  >
                    Reprogramează
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() =>
                    setConfirm({
                      title: "Anulezi această programare?",
                      run: () => {
                        commit((d) =>
                          setAppointmentStatus(
                            d,
                            actor,
                            selected.id,
                            "Anulată",
                          ),
                        );
                        setAppointment("");
                      },
                    })
                  }
                >
                  Anulează programarea
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
      {notice && (
        <Modal
          title={notice.title}
          description={notice.category + " · " + date(notice.date)}
          open
          onClose={() => setNotice(null)}
        >
          <p>{notice.body}</p>
          <div className="form-actions">
            <Button
              onClick={() => {
                setVehicle(notice.vehicleId);
                setNotice(null);
              }}
            >
              Vezi vehiculul
            </Button>
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal
          title={confirm.title}
          description="Confirmă pentru a aplica această modificare."
          open
          onClose={() => setConfirm(null)}
        >
          <div className="form-actions">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Renunță
            </Button>
            <Button
              onClick={() => {
                confirm.run();
                setConfirm(null);
              }}
            >
              Confirmă
            </Button>
          </div>
        </Modal>
      )}
      {editor && <Editor request={editor} onClose={() => setEditor(null)} />}{" "}
      {booking && <Booking {...booking} onClose={() => setBooking(null)} />}{" "}
      {customer && (
        <CustomerDetail id={customer} onClose={() => setCustomer("")} />
      )}{" "}
      {vehicle && <VehicleDetail id={vehicle} onClose={() => setVehicle("")} />}
    </>
  );
}
