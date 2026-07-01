import { NextResponse } from "next/server";
import { deleteSubmission } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const deleted = await deleteSubmission(numericId);
    if (!deleted) {
      return NextResponse.json({ error: "No se encontró la respuesta" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error borrando submission", error);
    return NextResponse.json(
      { error: "No se pudo borrar la respuesta." },
      { status: 500 }
    );
  }
}
