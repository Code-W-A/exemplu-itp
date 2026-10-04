"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CarFront,
  ShieldCheck,
  Wrench,
  Gauge,
  MapPin,
  ContactRound,
  Bell,
  ChartNoAxesCombined,
  Settings2,
  Search,
  ChevronDown,
  Menu,
  ArrowUpRight,
  PanelLeftClose,
} from "lucide-react";
import { moduleLabels, date, type Module } from "@white-label/core";
import { useApp } from "@/lib/store";
import { Avatar } from "./common";
import { Dashboard } from "./dashboard";
import { EntityScreens } from "./screens";
const icons = {
  programari: CalendarDays,
  clienti: Users,
  vehicule: CarFront,
  itp: ShieldCheck,
  intretinere: Wrench,
  tahografe: Gauge,
  locatii: MapPin,
  personal: ContactRound,
  notificari: Bell,
  rapoarte: ChartNoAxesCombined,
  setari: Settings2,
};
export function Workspace() {
  const {
    data,
    ready,
    actor,
    setActor,
    location,
    setLocation,
    locations,
    search,
    setSearch,
    allowed,
    scope,
  } = useApp();
  const path = usePathname();
  const section = (path.split("/")[1] || "acasa") as Module | "acasa";
  const [mobileNav, setMobileNav] = useState(false);
  const current = data.staff.find((s) => s.id === actor.id)!;
  const count = data.notifications.filter(
    (n) =>
      !n.read &&
      n.status === "Trimisă" &&
      data.vehicles.some((v) => v.id === n.vehicleId && scope(v.locationId)),
  ).length;
  return (
    <div className="workspace">
      <aside className={"sidebar " + (mobileNav ? "is-open" : "")}>
        <Link href="/" className="brand" onClick={() => setMobileNav(false)}>
          WHITE LABEL<span>ADMINISTRARE AUTO</span>
        </Link>
        <div className="workspace-label">
          <span className="online-dot" />
          Spațiul de lucru<span className="pro-label">PRO</span>
        </div>
        <div className="nav-caption">PRINCIPAL</div>
        <nav>
          <Link
            href="/"
            className={section === "acasa" ? "active" : ""}
            onClick={() => {
              setMobileNav(false);
              setSearch("");
            }}
          >
            <LayoutDashboard size={19} />
            Privire de ansamblu
          </Link>
          {(Object.keys(moduleLabels) as Module[])
            .filter((m) => allowed(m))
            .map((m, i) => {
              const Icon = icons[m];
              return (
                <div key={m}>
                  {m === "locatii" && (
                    <div className="nav-caption second">ORGANIZARE</div>
                  )}
                  <Link
                    href={"/" + m}
                    className={section === m ? "active" : ""}
                    onClick={() => {
                      setMobileNav(false);
                      setSearch("");
                    }}
                  >
                    <Icon size={19} />
                    {moduleLabels[m]}
                    {m === "programari" && (
                      <span className="nav-count">
                        {
                          data.appointments.filter(
                            (a) =>
                              a.date === data.referenceDate &&
                              a.status !== "Anulată" &&
                              scope(a.locationId),
                          ).length
                        }
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <ShieldCheck size={22} />
            <strong>Totul, sub control.</strong>
            <p>O experiență mai bună pentru echipa și clienții tăi.</p>
            <Link href="/rapoarte">
              Vezi activitatea <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="signed-in">
            <Avatar name={current.name} small />
            <div>
              <strong>{current.name}</strong>
              <span>{current.role}</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="nav-overlay"
          aria-label="Închide meniul"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Deschide meniul"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Menu size={22} />
            </button>
            <span>Administrare</span>
            <span className="slash">/</span>
            <strong>
              {section === "acasa"
                ? "Privire de ansamblu"
                : moduleLabels[section]}
            </strong>
          </div>
          <div className="top-actions">
            {!["setari", "rapoarte"].includes(section) && (
              <label className="global-search">
                <Search size={17} />
                <input
                  aria-label="Caută în secțiune"
                  placeholder="Caută în secțiune..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <kbd>⌕</kbd>
              </label>
            )}
            <Link
              href="/notificari"
              className="icon-button bell"
              aria-label="Deschide notificările"
            >
              <Bell size={20} />
              {count > 0 && <i />}
            </Link>
            <div className="top-divider" />
            <select
              className="profile-select"
              aria-label="Profil activ"
              value={actor.id}
              onChange={(e) => setActor(e.target.value)}
            >
              {data.staff
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.role}
                  </option>
                ))}
            </select>
            <Avatar name={current.name} small />
          </div>
        </header>
        <main>
          <div className="context-bar">
            <div className="context-date">
              <CalendarDays size={15} />
              {date(data.referenceDate, true)}
              <span className="context-dot">•</span>
              <span>O zi bună pentru lucruri bine făcute.</span>
            </div>
            <label className="location-switch">
              <MapPin size={16} />
              <select
                aria-label="Locație activă"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="all">Toate locațiile</option>
                {locations.map((l) => (
                  <option value={l.id} key={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!ready ? (
            <div className="loading">Se încarcă spațiul de lucru…</div>
          ) : section === "acasa" ? (
            <Dashboard />
          ) : allowed(section) ? (
            <EntityScreens section={section} />
          ) : (
            <div className="empty">
              <ShieldCheck size={38} />
              <h1>Acces restricționat</h1>
              <p>Profilul selectat nu are acces la această secțiune.</p>
              <Link href="/">Înapoi la privirea de ansamblu</Link>
            </div>
          )}
          <footer>
            WHITE LABEL<span>Grijă pentru fiecare kilometru.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
