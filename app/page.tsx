"use client";

import { useEffect, useRef, useState } from "react";
import "./theme.css";
import "./relevamiento.css";
import TabNav from "./components/TabNav";

type Responsable = {
  id: string;
  nombre: string;
  mail: string;
  telefono: string;
  rol: string;
};

type Proceso = {
  id: string;
  nombre: string;
  descripcion: string;
  responsables: Responsable[];
};

type Area = {
  id: string;
  nombre: string;
  descripcion: string;
  procesos: Proceso[];
};

const DEALERSHIP_NAME = process.env.NEXT_PUBLIC_DEALERSHIP_NAME || "Long";

function newResponsable(): Responsable {
  return { id: crypto.randomUUID(), nombre: "", mail: "", telefono: "", rol: "" };
}

function newProceso(): Proceso {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    descripcion: "",
    responsables: [newResponsable()],
  };
}

function newArea(): Area {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    descripcion: "",
    procesos: [newProceso()],
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </svg>
  );
}

export default function Home() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [sending, setSending] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const areaNameInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const procesoNameInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const responsableInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const addAreaWrapRef = useRef<HTMLDivElement>(null);
  const pendingAreaFocus = useRef<string | null>(null);
  const pendingProcesoFocus = useRef<string | null>(null);
  const pendingResponsableFocus = useRef<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }

  useEffect(() => {
    if (pendingAreaFocus.current) {
      const el = areaNameInputRefs.current.get(pendingAreaFocus.current);
      pendingAreaFocus.current = null;
      el?.focus();
      addAreaWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (pendingProcesoFocus.current) {
      const el = procesoNameInputRefs.current.get(pendingProcesoFocus.current);
      pendingProcesoFocus.current = null;
      el?.focus();
    }
    if (pendingResponsableFocus.current) {
      const el = responsableInputRefs.current.get(pendingResponsableFocus.current);
      pendingResponsableFocus.current = null;
      el?.focus();
    }
  });

  function addArea() {
    const a = newArea();
    setAreas((prev) => [...prev, a]);
    pendingAreaFocus.current = a.id;
  }

  function deleteArea(id: string) {
    setAreas((prev) => prev.filter((a) => a.id !== id));
  }

  function updateArea(id: string, field: "nombre" | "descripcion", value: string) {
    setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  function addProceso(areaId: string) {
    const p = newProceso();
    setAreas((prev) =>
      prev.map((a) => (a.id === areaId ? { ...a, procesos: [...a.procesos, p] } : a))
    );
    pendingProcesoFocus.current = `${areaId}:${p.id}`;
  }

  function deleteProceso(areaId: string, procesoId: string) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId ? a : { ...a, procesos: a.procesos.filter((p) => p.id !== procesoId) }
      )
    );
  }

  function updateProceso(
    areaId: string,
    procesoId: string,
    field: "nombre" | "descripcion",
    value: string
  ) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId
          ? a
          : {
              ...a,
              procesos: a.procesos.map((p) =>
                p.id === procesoId ? { ...p, [field]: value } : p
              ),
            }
      )
    );
  }

  function addResponsable(areaId: string, procesoId: string) {
    const r = newResponsable();
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId
          ? a
          : {
              ...a,
              procesos: a.procesos.map((p) =>
                p.id === procesoId ? { ...p, responsables: [...p.responsables, r] } : p
              ),
            }
      )
    );
    pendingResponsableFocus.current = `${areaId}:${procesoId}:${r.id}`;
  }

  function deleteResponsable(areaId: string, procesoId: string, responsableId: string) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId
          ? a
          : {
              ...a,
              procesos: a.procesos.map((p) =>
                p.id !== procesoId
                  ? p
                  : { ...p, responsables: p.responsables.filter((r) => r.id !== responsableId) }
              ),
            }
      )
    );
  }

  function updateResponsable(
    areaId: string,
    procesoId: string,
    responsableId: string,
    field: keyof Omit<Responsable, "id">,
    value: string
  ) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id !== areaId
          ? a
          : {
              ...a,
              procesos: a.procesos.map((p) =>
                p.id !== procesoId
                  ? p
                  : {
                      ...p,
                      responsables: p.responsables.map((r) =>
                        r.id === responsableId ? { ...r, [field]: value } : r
                      ),
                    }
              ),
            }
      )
    );
  }

  function buildData() {
    return {
      formulario: "Relevamiento de procesos para Dashboard",
      generado_por: "Loopers",
      fecha: new Date().toISOString(),
      concesionaria: DEALERSHIP_NAME,
      areas: areas.map((a) => ({
        nombre: a.nombre.trim(),
        descripcion: a.descripcion.trim(),
        procesos: a.procesos.map((p) => ({
          nombre: p.nombre.trim(),
          descripcion: p.descripcion.trim(),
          responsables: p.responsables.map((r) => ({
            nombre: r.nombre.trim(),
            mail: r.mail.trim(),
            telefono: r.telefono.trim(),
            rol: r.rol.trim(),
          })),
        })),
      })),
    };
  }

  async function handleSubmit() {
    const data = buildData();
    const validAreas = data.areas
      .map((a) => ({
        ...a,
        procesos: a.procesos.filter((p) => p.nombre && p.responsables.some((r) => r.nombre)),
      }))
      .filter((a) => a.nombre && a.procesos.length > 0);

    if (validAreas.length === 0) {
      showToast("Agregá al menos un área con un proceso y un responsable con nombre.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, areas: validAreas }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar el formulario.");
      }
      showToast("¡Gracias! Tus respuestas fueron guardadas.");
      setAreas([]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo enviar el formulario.");
    } finally {
      setSending(false);
    }
  }

  const totalProcesos = areas.reduce((acc, a) => acc + a.procesos.length, 0);

  return (
    <div className="relevamiento-page">
      <div className="topbar">
        <div className="wrap">
          <div className="logo">
            <svg viewBox="0 0 72 44" aria-label="Loopers">
              <circle cx="22" cy="22" r="15" fill="none" stroke="#2F6FE0" strokeWidth="6.5" />
              <circle cx="44" cy="22" r="15" fill="none" stroke="#62A0DC" strokeWidth="6.5" />
            </svg>
            <span className="word">loopers</span>
          </div>
          <TabNav active="form" />
        </div>
      </div>

      <div className="wrap">
        <div className="page-title">
          <div className="eyebrow">Concesionaria {DEALERSHIP_NAME}</div>
          <h1>Diseño de Dashboard en vivo</h1>
        </div>

        <div className="flow">
          <div className="flow-inner">
            <div className="dash">
              <div className="ghost-badge">Vista ilustrativa</div>
              <div className="dash-head">
                <span className="dot" />
                <span className="t">Dashboard de la concesionaria</span>
                <span className="live">actualizado en vivo</span>
              </div>
              <div className="kpis">
                <div className="kpi"><div className="bar" /><div className="num" /><div className="sub" /></div>
                <div className="kpi"><div className="bar" /><div className="num alt" /><div className="sub" /></div>
                <div className="kpi"><div className="bar" /><div className="num" /><div className="sub" /></div>
                <div className="kpi"><div className="bar" /><div className="num alt" /><div className="sub" /></div>
              </div>
              <div className="chartbox">
                <svg viewBox="0 0 300 70" preserveAspectRatio="none">
                  <polyline points="0,55 40,48 80,52 120,34 160,40 200,22 240,28 300,12" fill="none" stroke="#62A0DC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="0,62 40,58 80,60 120,50 160,54 200,44 240,48 300,38" fill="none" stroke="#D9E2EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="counter-pill">
                <IconArrowUp />
                <span>
                  <b>{areas.length}</b> {areas.length === 1 ? "área" : "áreas"} ·{" "}
                  <b>{totalProcesos}</b> {totalProcesos === 1 ? "proceso" : "procesos"} conectados
                </span>
              </div>
            </div>

            <div id="area-list">
              {areas.map((a, i) => (
                <div key={a.id}>
                  <div className="conn" aria-hidden="true">
                    <div className="arrow"><IconArrowUp /></div>
                  </div>
                  <div className="proc">
                    <div className="proc-top">
                      <div className="proc-index">{i + 1}</div>
                      <div className="proc-fields">
                        <input
                          ref={(el) => {
                            if (el) areaNameInputRefs.current.set(a.id, el);
                            else areaNameInputRefs.current.delete(a.id);
                          }}
                          className="name-input"
                          type="text"
                          placeholder="Nombre del área (ej: Ventas, Postventa, Administración, Gestoría...)"
                          value={a.nombre}
                          onChange={(e) => updateArea(a.id, "nombre", e.target.value)}
                        />
                        <textarea
                          placeholder="¿Qué incluye esta área? (opcional)"
                          value={a.descripcion}
                          onChange={(e) => updateArea(a.id, "descripcion", e.target.value)}
                        />
                      </div>
                      <button className="del-proc" title="Eliminar área" onClick={() => deleteArea(a.id)}>
                        <IconTrash />
                      </button>
                    </div>

                    <div className="procesos-block">
                      <div className="procesos-head">
                        Procesos de esta área <span className="count">· {a.procesos.length}</span>
                      </div>

                      {a.procesos.length === 0 ? (
                        <div className="resp-empty">Todavía no agregaste procesos.</div>
                      ) : (
                        a.procesos.map((p, j) => (
                          <div className="proceso-card" key={p.id}>
                            <div className="proceso-top">
                              <div className="proceso-index">{j + 1}</div>
                              <div className="proceso-fields">
                                <input
                                  ref={(el) => {
                                    const key = `${a.id}:${p.id}`;
                                    if (el) procesoNameInputRefs.current.set(key, el);
                                    else procesoNameInputRefs.current.delete(key);
                                  }}
                                  className="proceso-name-input"
                                  type="text"
                                  placeholder="Nombre del proceso (ej: Ventas 0km)"
                                  value={p.nombre}
                                  onChange={(e) => updateProceso(a.id, p.id, "nombre", e.target.value)}
                                />
                                <textarea
                                  placeholder="¿Qué pasa en este proceso o qué te gustaría ver en el dashboard? (opcional)"
                                  value={p.descripcion}
                                  onChange={(e) => updateProceso(a.id, p.id, "descripcion", e.target.value)}
                                />
                              </div>
                              <button
                                className="del-proc"
                                title="Eliminar proceso"
                                onClick={() => deleteProceso(a.id, p.id)}
                              >
                                <IconTrash />
                              </button>
                            </div>

                            <div className="resp-block">
                              <div className="resp-head">
                                Responsables <span className="count">· {p.responsables.length}</span>
                              </div>
                              {p.responsables.length === 0 ? (
                                <div className="resp-empty">Todavía no agregaste responsables.</div>
                              ) : (
                                p.responsables.map((r) => {
                                  const mailInvalid = r.mail !== "" && !EMAIL_RE.test(r.mail);
                                  return (
                                    <div className="resp-row" key={r.id}>
                                      <input
                                        ref={(el) => {
                                          const key = `${a.id}:${p.id}:${r.id}`;
                                          if (el) responsableInputRefs.current.set(key, el);
                                          else responsableInputRefs.current.delete(key);
                                        }}
                                        type="text"
                                        placeholder="Nombre y apellido"
                                        value={r.nombre}
                                        onChange={(e) =>
                                          updateResponsable(a.id, p.id, r.id, "nombre", e.target.value)
                                        }
                                      />
                                      <input
                                        type="email"
                                        placeholder="Mail"
                                        className={mailInvalid ? "warn" : ""}
                                        value={r.mail}
                                        onChange={(e) =>
                                          updateResponsable(a.id, p.id, r.id, "mail", e.target.value)
                                        }
                                      />
                                      <input
                                        type="text"
                                        placeholder="Teléfono"
                                        value={r.telefono}
                                        onChange={(e) =>
                                          updateResponsable(a.id, p.id, r.id, "telefono", e.target.value)
                                        }
                                      />
                                      <input
                                        type="text"
                                        placeholder="Rol / puesto"
                                        value={r.rol}
                                        onChange={(e) =>
                                          updateResponsable(a.id, p.id, r.id, "rol", e.target.value)
                                        }
                                      />
                                      <button
                                        className="del-resp"
                                        title="Quitar responsable"
                                        onClick={() => deleteResponsable(a.id, p.id, r.id)}
                                      >
                                        <IconX />
                                      </button>
                                    </div>
                                  );
                                })
                              )}
                              <button className="add-resp" onClick={() => addResponsable(a.id, p.id)}>
                                <IconPlus />
                                Agregar responsable
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      <button className="add-resp" onClick={() => addProceso(a.id)}>
                        <IconPlus />
                        Agregar proceso
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {areas.length === 0 && (
                <div className="conn" style={{ height: "auto" }}>
                  <div className="empty" style={{ margin: "20px 0 4px" }}>
                    <b>Acá van a aparecer tus áreas.</b>
                    <br />
                    Tocá &ldquo;Agregar área&rdquo; para empezar.
                  </div>
                </div>
              )}
            </div>

            <div className="conn" aria-hidden="true">
              <div className="arrow"><IconArrowUp /></div>
            </div>

            <div className="add-proc-wrap" ref={addAreaWrapRef}>
              <button className="add-proc" onClick={addArea}>
                <IconPlus />
                Agregar área
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="wrap">
          <div className="actions">
            <div className="summary-note">
              Cuando termines, <b>enviá tus respuestas</b>.
            </div>
            <button className="btn primary" onClick={handleSubmit} disabled={sending}>
              <IconSend />
              {sending ? "Enviando..." : "Enviar respuestas"}
            </button>
          </div>
        </div>
      </div>

      <div className={`toast${toastVisible ? " show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
