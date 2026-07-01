import { NextResponse } from "next/server";
import { insertSubmission, type SubmissionPayload } from "@/lib/db";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePayload(body: unknown): body is SubmissionPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;

  if (!Array.isArray(b.areas) || b.areas.length === 0) return false;

  for (const area of b.areas) {
    if (!area || typeof area !== "object") return false;
    const a = area as Record<string, unknown>;
    if (!isNonEmptyString(a.nombre)) return false;
    if (!Array.isArray(a.procesos) || a.procesos.length === 0) return false;

    for (const proc of a.procesos) {
      if (!proc || typeof proc !== "object") return false;
      const p = proc as Record<string, unknown>;
      if (!isNonEmptyString(p.nombre)) return false;
      if (!Array.isArray(p.responsables) || p.responsables.length === 0) return false;
      for (const responsable of p.responsables) {
        if (!responsable || typeof responsable !== "object") return false;
        const r = responsable as Record<string, unknown>;
        if (!isNonEmptyString(r.nombre)) return false;
      }
    }
  }

  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!validatePayload(body)) {
    return NextResponse.json(
      {
        error:
          "Datos incompletos. Cada área necesita un nombre, al menos un proceso con nombre y al menos un responsable con nombre.",
      },
      { status: 400 }
    );
  }

  try {
    const id = await insertSubmission(body);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error("Error guardando submission", error);
    return NextResponse.json(
      { error: "No se pudo guardar la respuesta. Intentá de nuevo en unos minutos." },
      { status: 500 }
    );
  }
}
