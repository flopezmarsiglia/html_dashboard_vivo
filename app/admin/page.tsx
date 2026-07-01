import { listSubmissions } from "@/lib/db";
import DeleteSubmissionButton from "./DeleteSubmissionButton";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminPage() {
  const submissions = await listSubmissions();

  const totalProcesses = submissions.reduce(
    (acc, s) => acc + s.payload.procesos.length,
    0
  );
  const totalPeople = submissions.reduce(
    (acc, s) =>
      acc + s.payload.procesos.reduce((a, p) => a + p.responsables.length, 0),
    0
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Respuestas del formulario de relevamiento de procesos.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
              {submissions.length} respuesta(s)
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
              {totalProcesses} proceso(s) cargados
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
              {totalPeople} responsable(s)
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            <a
              href="/api/export?format=csv"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
            >
              Descargar CSV
            </a>
            <a
              href="/api/export?format=json"
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Descargar JSON
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {submissions.length === 0 && (
          <p className="text-sm text-zinc-500">
            Todavía no hay respuestas cargadas.
          </p>
        )}

        <div className="flex flex-col gap-6">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-zinc-900">
                  {s.payload.concesionaria || "(sin nombre)"}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">
                    {formatDate(s.created_at)}
                  </span>
                  <DeleteSubmissionButton id={s.id} />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                {s.payload.procesos.map((proc, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-200 p-4"
                  >
                    <h3 className="text-sm font-semibold text-zinc-800">
                      {proc.nombre}
                    </h3>
                    {proc.descripcion && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {proc.descripcion}
                      </p>
                    )}
                    <ul className="mt-3 flex flex-col gap-2">
                      {proc.responsables.map((r, j) => (
                        <li
                          key={j}
                          className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-700"
                        >
                          <span className="font-medium">{r.nombre}</span>
                          {r.rol && ` — ${r.rol}`}
                          <br />
                          {[r.mail, r.telefono].filter(Boolean).join(" · ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
