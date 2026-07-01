import Link from "next/link";

export default function TabNav({ active }: { active: "form" | "preview" }) {
  return (
    <nav className="tabnav">
      <Link href="/" className={active === "form" ? "active" : ""}>
        Formulario
      </Link>
      <Link href="/vista-previa" className={active === "preview" ? "active" : ""}>
        Vista previa del dashboard
      </Link>
    </nav>
  );
}
