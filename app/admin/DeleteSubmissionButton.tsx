"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteSubmissionButton({ id }: { id: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Borrar esta respuesta? No se puede deshacer.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo borrar la respuesta.");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo borrar la respuesta.");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? "Borrando..." : "Borrar"}
    </button>
  );
}
