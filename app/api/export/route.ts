import { NextResponse } from "next/server";
import { listSubmissions } from "@/lib/db";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "json" ? "json" : "csv";

  const submissions = await listSubmissions();

  if (format === "json") {
    return NextResponse.json(submissions);
  }

  const header = [
    "fecha",
    "concesionaria",
    "proceso",
    "proceso_descripcion",
    "responsable_nombre",
    "responsable_rol",
    "responsable_mail",
    "responsable_telefono",
  ];

  const rows: string[][] = [];
  for (const s of submissions) {
    for (const proc of s.payload.procesos) {
      for (const responsable of proc.responsables) {
        rows.push([
          s.created_at,
          s.payload.concesionaria,
          proc.nombre,
          proc.descripcion,
          responsable.nombre,
          responsable.rol,
          responsable.mail,
          responsable.telefono,
        ]);
      }
    }
  }

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(cell ?? "")).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="procesos_responsables.csv"`,
    },
  });
}
