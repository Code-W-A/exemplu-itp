"use client";
import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  CarFront,
  ShieldCheck,
  Wrench,
  Gauge,
  Plus,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Check,
  Clock,
  ChevronRight,
} from "lucide-react";
import { expiry, maintenance, number, date } from "@white-label/core";
import { useApp } from "@/lib/store";
import {
  Heading,
  Panel,
  Metric,
  Badge,
  Button,
  Table,
  Avatar,
  statusTone,
  Empty,
} from "./common";
import { Booking } from "./forms";
import { CustomerDetail, VehicleDetail } from "./details";
export function Dashboard() {
  const { data, scope, locations, search, allowed } = useApp();
  const [booking, setBooking] = useState(false);
  const [customer, setCustomer] = useState("");
  const [vehicle, setVehicle] = useState("");
  const vehicles = data.vehicles.filter((v) => scope(v.locationId));
  const a = data.appointments.filter(
    (a) =>
      scope(a.locationId) &&
      a.date === data.referenceDate &&
      a.status !== "Anulată",
  );
  const itps = data.itps.filter(
    (i) =>
      vehicles.some((v) => v.id === i.vehicleId) &&
      expiry(i.expires, data.referenceDate).days <= 30,
  );
  const rules = data.rules.filter(
    (r) =>
      vehicles.some((v) => v.id === r.vehicleId) &&
      maintenance(
        r,
        vehicles.find((v) => v.id === r.vehicleId)!,
        data.referenceDate,
      ).soon,
  );
  const tach = data.tachographs.filter(
    (t) =>
      vehicles.some((v) => v.id === t.vehicleId) &&
      expiry(t.nextDate, data.referenceDate).days <= 30,
  );
  const metrics = [
    {
      label: "Programări astăzi",
      value: a.length,
      detail: `${a.filter((x) => x.status === "Confirmată").length} confirmate`,
      icon: <CalendarDays size={19} />,
      tone: "blue",
    },
    {
      label: "Clienți",
      value: data.customers.filter(
        (c) =>
          scope(c.locationId) || vehicles.some((v) => v.customerId === c.id),
      ).length,
      detail: "Relații construite în timp",
      icon: <Users size={19} />,
      tone: "purple",
    },
    {
      label: "Vehicule",
      value: vehicles.length,
      detail: "În grija echipei tale",
      icon: <CarFront size={19} />,
      tone: "blue",
    },
    {
      label: "ITP-uri apropiate",
      value: itps.length,
      detail: "În următoarele 30 de zile",
      icon: <ShieldCheck size={19} />,
      tone: "orange",
    },
    {
      label: "Întreținere",
      value: rules.length,
      detail: "Operațiuni de urmărit",
      icon: <Wrench size={19} />,
      tone: "orange",
    },
    {
      label: "Tahografe",
      value: tach.length,
      detail: "Verificări apropiate",
      icon: <Gauge size={19} />,
      tone: "green",
    },
  ];
  const shown = a
    .filter((x) => {
      const v = data.vehicles.find((v) => v.id === x.vehicleId)!;
      return `${v.plate} ${x.service} ${data.customers.find((c) => c.id === x.customerId)?.name}`
        .toLowerCase()
        .includes(search.toLowerCase());
    })
    .sort((a, b) => a.time.localeCompare(b.time));
  return (
    <>
      <Heading
        eyebrow="SPAȚIUL TĂU DE LUCRU"
        title="O imagine clară. O zi organizată."
        description="Programările, echipa și vehiculele tale — toate în același loc."
        action={
          allowed("programari") && (
            <Button onClick={() => setBooking(true)}>
              <Plus size={17} />
              Programare nouă
            </Button>
          )
        }
      />
      <div className="metrics-grid">
        {metrics.map((m) => (
          <Metric key={m.label} {...m} />
        ))}
      </div>
      <div className="dashboard-middle">
        <Panel
          title="Activitatea locațiilor"
          subtitle="Programările de astăzi, pe fiecare punct de lucru"
          action={<span className="subtle-label">ASTĂZI</span>}
        >
          <div className="location-chart">
            {locations
              .filter((l) => scope(l.id))
              .map((l, i) => {
                const n = a.filter((x) => x.locationId === l.id).length;
                const completed = a.filter(
                  (x) => x.locationId === l.id && x.status === "Finalizată",
                ).length;
                return (
                  <div className="chart-row" key={l.id}>
                    <div className="chart-label">
                      <span>
                        <MapPin size={15} />
                        {l.name.replace("Locația ", "")}
                      </span>
                      <strong>
                        {n}
                        <small> programări</small>
                      </strong>
                    </div>
                    <div className="chart-track">
                      <span
                        style={{
                          width: `${Math.max(4, (n / Math.max(...locations.map((l) => a.filter((x) => x.locationId === l.id).length), 1)) * 90)}%`,
                          background: ["#316BEA", "#6990F2", "#A5BAF2"][i % 3],
                        }}
                      />
                    </div>
                    <div className="chart-meta">
                      <span>
                        {
                          data.staff.filter(
                            (s) => s.active && s.locationIds.includes(l.id),
                          ).length
                        }{" "}
                        membri în echipă
                      </span>
                      <span>
                        {l.opens} – {l.closes}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="chart-footer">
            <span>
              <i className="legend-dot" />
              Programări înregistrate
            </span>
            <Link href="/locatii">
              Gestionează locațiile
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </Panel>
        <section className="insight-card">
          <p className="insight-message">
            <span className="insight-count">{itps.length}</span> vehicule au
            ITP-ul aproape de expirare. Ajută-ți clienții să rămână la zi.
          </p>
          <Link href="/itp">
            Vezi scadențele ITP
            <ArrowRight size={17} />
          </Link>
          <div className="insight-decoration">
            <span />
            <span />
            <span />
          </div>
        </section>
      </div>
      <div className="dashboard-bottom">
        <Panel
          title="Agenda de astăzi"
          subtitle={`${a.length} programări · Tot ce urmează, la îndemână`}
          action={
            <Link className="inline-link" href="/programari">
              Toate programările
              <ChevronRight size={15} />
            </Link>
          }
        >
          <Table
            headers={[
              "Ora",
              "Client / Vehicul",
              "Serviciu",
              "Locație",
              "Stare",
              "",
            ]}
          >
            {shown.slice(0, 6).map((x) => {
              const v = data.vehicles.find((v) => v.id === x.vehicleId)!;
              const c = data.customers.find((c) => c.id === x.customerId)!;
              return (
                <tr key={x.id}>
                  <td>
                    <span className="time-cell">{x.time}</span>
                  </td>
                  <td>
                    <button
                      className="person-cell"
                      onClick={() => setCustomer(c.id)}
                    >
                      <Avatar name={c.name} small />
                      <span>
                        <strong>{c.name}</strong>
                        <small>
                          {v.plate} · {v.make}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>{x.service}</td>
                  <td>
                    <span className="location-cell">
                      <i />
                      {data.locations
                        .find((l) => l.id === x.locationId)
                        ?.name.replace("Locația ", "")}
                    </span>
                  </td>
                  <td>
                    <Badge tone={statusTone(x.status)}>{x.status}</Badge>
                  </td>
                  <td>
                    <button
                      aria-label={"Vezi " + v.plate}
                      className="icon-button"
                      onClick={() => setVehicle(v.id)}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
          {!shown.length && <Empty />}
        </Panel>
        <Panel
          title="Activitate recentă"
          subtitle="Ultimele noutăți din locații"
        >
          <div className="activity-list">
            {data.activities
              .filter((x) => scope(x.locationId))
              .slice(0, 5)
              .map((a, i) => (
                <div className="activity-item" key={a.id}>
                  <span
                    className={"activity-icon " + (i % 2 ? "green" : "blue")}
                  >
                    {i % 2 ? <Check size={15} /> : <CalendarDays size={15} />}
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.detail}</p>
                    <small>
                      {data.locations.find((l) => l.id === a.locationId)?.name}
                    </small>
                  </div>
                </div>
              ))}
          </div>
        </Panel>
      </div>
      {booking && <Booking onClose={() => setBooking(false)} />}{" "}
      {customer && (
        <CustomerDetail id={customer} onClose={() => setCustomer("")} />
      )}{" "}
      {vehicle && <VehicleDetail id={vehicle} onClose={() => setVehicle("")} />}
    </>
  );
}
