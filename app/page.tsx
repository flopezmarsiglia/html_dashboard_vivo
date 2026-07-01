"use client";

import { useEffect, useRef, useState } from "react";
import "./relevamiento.css";

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
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [sending, setSending] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const responsableInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const addProcWrapRef = useRef<HTMLDivElement>(null);
  const pendingProcesoFocus = useRef<string | null>(null);
  const pendingResponsableFocus = useRef<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }

  useEffect(() => {
    if (pendingProcesoFocus.current) {
      const el = nameInputRefs.current.get(pendingProcesoFocus.current);
      pendingProcesoFocus.current = null;
      el?.focus();
      addProcWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (pendingResponsableFocus.current) {
      const el = responsableInputRefs.current.get(pendingResponsableFocus.current);
      pendingResponsableFocus.current = null;
      el?.focus();
    }
  });

  function addProceso() {
    const p = newProceso();
    setProcesos((prev) => [...prev, p]);
    pendingProcesoFocus.current = p.id;
  }

  function deleteProceso(id: string) {
    setProcesos((prev) => prev.filter((p) => p.id !== id));
  }

  function addResponsable(procesoId: string) {
    const r = newResponsable();
    setProcesos((prev) =>
      prev.map((p) => (p.id === procesoId ? { ...p, responsables: [...p.responsables, r] } : p))
    );
    pendingResponsableFocus.current = `${procesoId}:${r.id}`;
  }

  function deleteResponsable(procesoId: string, responsableId: string) {
    setProcesos((prev) =>
      prev.map((p) =>
        p.id !== procesoId
          ? p
          : { ...p, responsables: p.responsables.filter((r) => r.id !== responsableId) }
      )
    );
  }

  function updateProceso(id: string, field: "nombre" | "descripcion", value: string) {
    setProcesos((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function updateResponsable(
    procesoId: string,
    responsableId: string,
    field: keyof Omit<Responsable, "id">,
    value: string
  ) {
    setProcesos((prev) =>
      prev.map((p) =>
        p.id !== procesoId
          ? p
          : {
              ...p,
              responsables: p.responsables.map((r) =>
                r.id === responsableId ? { ...r, [field]: value } : r
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
      procesos: procesos.map((p) => ({
        nombre: p.nombre.trim(),
        descripcion: p.descripcion.trim(),
        responsables: p.responsables.map((r) => ({
          nombre: r.nombre.trim(),
          mail: r.mail.trim(),
          telefono: r.telefono.trim(),
          rol: r.rol.trim(),
        })),
      })),
    };
  }

  async function handleSubmit() {
    const data = buildData();
    const validProcesos = data.procesos.filter((p) => p.nombre && p.responsables.some((r) => r.nombre));

    if (validProcesos.length === 0) {
      showToast("Agregá al menos un proceso con nombre y un responsable.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, procesos: validProcesos }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar el formulario.");
      }
      showToast("¡Gracias! Tus respuestas fueron guardadas.");
      setProcesos([]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo enviar el formulario.");
    } finally {
      setSending(false);
    }
  }

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
          <div className="tag">Relevamiento de procesos</div>
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
                <span><b>{procesos.length}</b> procesos conectados</span>
              </div>
            </div>

            <div id="proc-list">
              {procesos.map((p, i) => (
                <div key={p.id}>
                  <div className="conn" aria-hidden="true">
                    <div className="arrow"><IconArrowUp /></div>
                  </div>
                  <div className="proc">
                    <div className="proc-top">
                      <div className="proc-index">{i + 1}</div>
                      <div className="proc-fields">
                        <input
                          ref={(el) => {
                            if (el) nameInputRefs.current.set(p.id, el);
                            else nameInputRefs.current.delete(p.id);
                          }}
                          className="name-input"
                          type="text"
                          placeholder="Nombre del proceso (ej: cómo lo llamás internamente)"
                          value={p.nombre}
                          onChange={(e) => updateProceso(p.id, "nombre", e.target.value)}
                        />
                        <textarea
                          placeholder="¿Qué pasa en este proceso o qué te gustaría ver en el dashboard? (opcional)"
                          value={p.descripcion}
                          onChange={(e) => updateProceso(p.id, "descripcion", e.target.value)}
                        />
                      </div>
                      <button className="del-proc" title="Eliminar proceso" onClick={() => deleteProceso(p.id)}>
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
                                  const key = `${p.id}:${r.id}`;
                                  if (el) responsableInputRefs.current.set(key, el);
                                  else responsableInputRefs.current.delete(key);
                                }}
                                type="text"
                                placeholder="Nombre y apellido"
                                value={r.nombre}
                                onChange={(e) => updateResponsable(p.id, r.id, "nombre", e.target.value)}
                              />
                              <input
                                type="email"
                                placeholder="Mail"
                                className={mailInvalid ? "warn" : ""}
                                value={r.mail}
                                onChange={(e) => updateResponsable(p.id, r.id, "mail", e.target.value)}
                              />
                              <input
                                type="text"
                                placeholder="Teléfono"
                                value={r.telefono}
                                onChange={(e) => updateResponsable(p.id, r.id, "telefono", e.target.value)}
                              />
                              <input
                                type="text"
                                placeholder="Rol / puesto"
                                value={r.rol}
                                onChange={(e) => updateResponsable(p.id, r.id, "rol", e.target.value)}
                              />
                              <button className="del-resp" title="Quitar responsable" onClick={() => deleteResponsable(p.id, r.id)}>
                                <IconX />
                              </button>
                            </div>
                          );
                        })
                      )}
                      <button className="add-resp" onClick={() => addResponsable(p.id)}>
                        <IconPlus />
                        Agregar responsable
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {procesos.length === 0 && (
                <div className="conn" style={{ height: "auto" }}>
                  <div className="empty" style={{ margin: "20px 0 4px" }}>
                    <b>Acá van a aparecer tus procesos.</b>
                    <br />
                    Tocá &ldquo;Agregar proceso&rdquo; para empezar.
                  </div>
                </div>
              )}
            </div>

            <div className="conn" aria-hidden="true">
              <div className="arrow"><IconArrowUp /></div>
            </div>

            <div className="add-proc-wrap" ref={addProcWrapRef}>
              <button className="add-proc" onClick={addProceso}>
                <IconPlus />
                Agregar proceso
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
