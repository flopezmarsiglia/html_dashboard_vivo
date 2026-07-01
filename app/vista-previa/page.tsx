import Link from "next/link";
import "../theme.css";
import "../vista-previa.css";
import TabNav from "../components/TabNav";

const DEALERSHIP_NAME = process.env.NEXT_PUBLIC_DEALERSHIP_NAME || "Long";

const AREAS = [
  { nombre: "Ventas", procesos: ["Ventas 0km", "Ventas de usados", "Leads y CRM"] },
  { nombre: "Postventa / Taller", procesos: ["Turnos de service", "Repuestos"] },
  { nombre: "Administración", procesos: ["Facturación", "Cobranzas"] },
  { nombre: "Gestoría", procesos: ["Patentamientos", "Transferencias"] },
  { nombre: "Marketing", procesos: ["Campañas y pauta", "Redes sociales"] },
];

function IconArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

export default function VistaPreviaPage() {
  return (
    <div className="preview-page">
      <div className="topbar">
        <div className="wrap">
          <div className="logo">
            <svg viewBox="0 0 72 44" aria-label="Loopers">
              <circle cx="22" cy="22" r="15" fill="none" stroke="#2F6FE0" strokeWidth="6.5" />
              <circle cx="44" cy="22" r="15" fill="none" stroke="#62A0DC" strokeWidth="6.5" />
            </svg>
            <span className="word">loopers</span>
          </div>
          <TabNav active="preview" />
        </div>
      </div>

      <div className="pv-wrap">
        <div className="pv-intro">
          <div className="eyebrow">Vista previa · Concesionaria {DEALERSHIP_NAME}</div>
          <h1>Así se va a alimentar tu Dashboard en vivo</h1>
          <p className="pv-lead">
            El dashboard se arma a partir de una base de datos que junta la
            información de las distintas áreas de la concesionaria, y cada área
            se alimenta de los procesos puntuales que nos vayas contando.
          </p>
          <div className="pv-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L14.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
            Las áreas y procesos de este esquema son un ejemplo. Los reales van a salir de lo que completes en el formulario.
          </div>

          <div className="arch-legend">
            <div className="arch-legend-item"><span className="arch-legend-swatch dash" /> Dashboard</div>
            <div className="arch-legend-item"><span className="arch-legend-swatch db" /> Base de datos</div>
            <div className="arch-legend-item"><span className="arch-legend-swatch area" /> Área</div>
            <div className="arch-legend-item"><span className="arch-legend-swatch process" /> Proceso</div>
          </div>
        </div>

        <div className="arch-diagram-scroll">
          <div className="arch-diagram-inner">
            <div className="arch-dash-mock">
              <div className="arch-dash-head">
                <span className="dot" />
                <span className="t">Tu Dashboard en vivo</span>
              </div>
              <div className="arch-ghost-row">
                <div className="arch-ghost-kpi"><div className="b1" /><div className="b2" /></div>
                <div className="arch-ghost-kpi"><div className="b1" /><div className="b2" /></div>
                <div className="arch-ghost-kpi"><div className="b1" /><div className="b2" /></div>
              </div>
            </div>

            <div className="arch-connector">
              <div className="circle"><IconArrowUp /></div>
            </div>

            <div className="arch-db-row">
              <div className="arch-node db">
                <IconDatabase />
                Base de datos
              </div>
            </div>

            <div className="arch-tree">
              <ul>
                {AREAS.map((area) => (
                  <li key={area.nombre}>
                    <div className="arch-node area">{area.nombre}</div>
                    <ul>
                      {area.procesos.map((proc) => (
                        <li key={proc}>
                          <div className="arch-node process">{proc}</div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="arch-scroll-hint">Deslizá hacia los costados para ver el árbol completo →</p>

        <div className="pv-back">
          <Link href="/">← Volver al formulario de procesos</Link>
        </div>
      </div>
    </div>
  );
}
