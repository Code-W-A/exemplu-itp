"use client";
import { useState } from "react";
import {
  CarFront,
  Plus,
  ArrowUpRight,
  Gauge,
  ShieldCheck,
  Wrench,
  CalendarDays,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import {
  date,
  number,
  expiry,
  maintenance,
  type Vehicle,
  type Customer,
} from "@white-label/core";
import { useApp } from "@/lib/store";
import {
  Modal,
  Panel,
  Badge,
  Button,
  Table,
  Empty,
  statusTone,
} from "./common";
import { Booking, Editor, type EditRequest } from "./forms";
export function VehicleDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data, allowed } = useApp();
  const v = data.vehicles.find((v) => v.id === id)!;
  const owner = data.customers.find((c) => c.id === v.customerId)!;
  const itp = data.itps.find((i) => i.vehicleId === id);
  const tach = data.tachographs.find((t) => t.vehicleId === id);
  const [edit, setEdit] = useState<EditRequest | null>(null);
  const [booking, setBooking] = useState(false);
  const rules = data.rules.filter((r) => r.vehicleId === id);
  return (
    <>
      <Modal
        title={v.make + " " + v.model}
        description={v.plate + " · " + owner.name}
        open
        onClose={onClose}
      >
        <div className="vehicle-hero">
          <div>
            <span className="eyebrow light">FIȘĂ VEHICUL</span>
            <h2>{v.plate}</h2>
            <p>
              {v.year} · {v.category}
            </p>
            <strong>
              {number(v.mileage)} <small>km</small>
            </strong>
          </div>
          <CarFront size={94} strokeWidth={1} />
        </div>
        <div className="detail-actions">
          {allowed("vehicule") && (
            <Button
              variant="outline"
              onClick={() => setEdit({ type: "mileage", vehicle: v })}
            >
              <Gauge size={16} />
              Actualizează kilometrajul
            </Button>
          )}
          {allowed("programari") && (
            <Button onClick={() => setBooking(true)}>
              <Plus size={16} />
              Programează
            </Button>
          )}
        </div>
        <div className="detail-grid">
          <div className="detail-block">
            <ShieldCheck size={20} />
            <span>Expirare ITP</span>
            <strong>{itp ? date(itp.expires) : "Nespecificată"}</strong>
            {itp && (
              <Badge tone={expiry(itp.expires, data.referenceDate).tone}>
                {expiry(itp.expires, data.referenceDate).label}
              </Badge>
            )}
          </div>
          <div className="detail-block">
            <CarFront size={20} />
            <span>Anvelope</span>
            <strong>{v.tires}</strong>
            <small>Următoarea verificare: {date(v.tireDate)}</small>
          </div>
        </div>
        <div className="section-title">
          <h3>Plan de întreținere</h3>
          {allowed("intretinere") && (
            <button
              className="inline-link"
              onClick={() => setEdit({ type: "rule", vehicleId: id })}
            >
              Adaugă regulă
              <Plus size={14} />
            </button>
          )}
        </div>
        {rules.length ? (
          rules.map((r) => {
            const m = maintenance(r, v, data.referenceDate);
            return (
              <div className="detail-row" key={r.id}>
                <span className="tile-icon">
                  <Wrench size={18} />
                </span>
                <div className="grow">
                  <strong>{r.operation}</strong>
                  <p>
                    {m.nextKm ? number(m.nextKm) + " km" : ""}
                    {m.nextKm && m.nextDate ? " sau " : ""}
                    {m.nextDate ? date(m.nextDate) : ""}
                  </p>
                  <small>
                    {m.remaining !== null
                      ? m.remaining > 0
                        ? `Mai ai ${number(m.remaining)} km`
                        : `Prag depășit cu ${number(-m.remaining)} km`
                      : "Interval calendaristic"}
                  </small>
                </div>
                <Badge tone={m.tone}>{m.label}</Badge>
              </div>
            );
          })
        ) : (
          <p className="muted">Adaugă o regulă pentru a urmări întreținerea.</p>
        )}
        {tach && (
          <>
            <h3 className="section-title">Tahograf</h3>
            <div className="tach-detail">
              <div>
                <strong>{tach.type}</strong>
                <p>Serie {tach.serial}</p>
                <p>Ultima verificare: {date(tach.lastDate)}</p>
                <p>
                  Următoarea verificare: <b>{date(tach.nextDate)}</b>
                </p>
                <Badge tone={expiry(tach.nextDate, data.referenceDate).tone}>
                  {expiry(tach.nextDate, data.referenceDate).label}
                </Badge>
              </div>
              {allowed("tahografe") && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setEdit({ type: "tachograph", tachograph: tach })
                  }
                >
                  Actualizează verificarea
                </Button>
              )}
            </div>
            {tach.history.map((h, i) => (
              <p className="history-line" key={i}>
                {date(h.date)} · {h.note}
              </p>
            ))}
          </>
        )}
        <h3 className="section-title">Istoric service</h3>
        {data.records
          .filter((r) => r.vehicleId === id)
          .map((r) => (
            <div className="detail-row" key={r.id}>
              <span className="timeline-dot" />
              <div className="grow">
                <strong>{r.operation}</strong>
                <p>
                  {date(r.date)} · {number(r.mileage)} km
                </p>
              </div>
              <Badge tone="green">Efectuat</Badge>
            </div>
          ))}
        <h3 className="section-title">Programări</h3>
        {data.appointments
          .filter((a) => a.vehicleId === id)
          .map((a) => (
            <div className="detail-row" key={a.id}>
              <CalendarDays size={19} />
              <div className="grow">
                <strong>{a.service}</strong>
                <p>
                  {date(a.date)} · {a.time}
                </p>
              </div>
              <Badge tone={statusTone(a.status)}>{a.status}</Badge>
            </div>
          ))}
      </Modal>
      {edit && <Editor request={edit} onClose={() => setEdit(null)} />}{" "}
      {booking && <Booking vehicleId={id} onClose={() => setBooking(false)} />}
    </>
  );
}
export function CustomerDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data, scope, allowed } = useApp();
  const c = data.customers.find((c) => c.id === id)!;
  const vehicles = data.vehicles.filter(
    (v) => v.customerId === id && scope(v.locationId),
  );
  const [selected, setSelected] = useState("");
  const [edit, setEdit] = useState<EditRequest | null>(null);
  return (
    <>
      <Modal
        title={c.name}
        description={
          c.kind === "Companie"
            ? "Cont flotă · Toate vehiculele, într-un singur loc."
            : "Profil client · Relația cu service-ul, la zi."
        }
        open
        onClose={onClose}
      >
        <div className="customer-contact">
          <span>
            <Mail size={16} />
            {c.email}
          </span>
          <span>
            <Phone size={16} />
            {c.phone}
          </span>
          <Badge tone="blue">{c.kind}</Badge>
        </div>
        <div className="section-title">
          <h3>
            {c.kind === "Companie" ? "Flota de vehicule" : "Vehicule"}{" "}
            <span className="count-pill">{vehicles.length}</span>
          </h3>
          {allowed("vehicule") && (
            <Button
              size="sm"
              onClick={() => setEdit({ type: "vehicle", customerId: id })}
            >
              <Plus size={15} />
              Adaugă vehicul
            </Button>
          )}
        </div>
        {vehicles.map((v) => {
          const itp = data.itps.find((i) => i.vehicleId === v.id)!;
          const r = data.rules.find((r) => r.vehicleId === v.id);
          const t = data.tachographs.find((t) => t.vehicleId === v.id);
          return (
            <button
              className="customer-vehicle"
              key={v.id}
              onClick={() => setSelected(v.id)}
            >
              <CarFront size={26} />
              <div>
                <strong>{v.plate}</strong>
                <p>
                  {v.make} {v.model} · {number(v.mileage)} km
                </p>
                <div className="vehicle-mini-info">
                  <span>ITP: {date(itp.expires)}</span>
                  {r && (
                    <span>
                      Service: {maintenance(r, v, data.referenceDate).label}
                    </span>
                  )}
                  {t && <span>Tahograf: {date(t.nextDate)}</span>}
                </div>
              </div>
              <ArrowUpRight size={18} />
            </button>
          );
        })}
        {!vehicles.length && (
          <Empty text="Acest client nu are încă vehicule în locațiile selectate." />
        )}
        <h3 className="section-title">Programări și vizite</h3>
        {data.appointments
          .filter((a) => a.customerId === id && scope(a.locationId))
          .map((a) => (
            <div className="detail-row" key={a.id}>
              <CalendarDays size={18} />
              <div className="grow">
                <strong>
                  {a.service} ·{" "}
                  {data.vehicles.find((v) => v.id === a.vehicleId)?.plate}
                </strong>
                <p>
                  {date(a.date)} · {a.time}
                </p>
              </div>
              <Badge tone={statusTone(a.status)}>{a.status}</Badge>
            </div>
          ))}
      </Modal>
      {selected && (
        <VehicleDetail id={selected} onClose={() => setSelected("")} />
      )}{" "}
      {edit && <Editor request={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
