import { Pool } from "pg";

declare global {
  var _pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL. Configurala en .env.local (desarrollo) o en Vercel (producción)."
    );
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
  });
}

// El pool se crea recién en el primer query (no al importar el módulo), para no
// romper el build cuando DATABASE_URL todavía no está configurada.
// También se reutiliza entre hot-reloads en desarrollo para no agotar conexiones.
function getPool(): Pool {
  if (!global._pgPool) {
    global._pgPool = createPool();
  }
  return global._pgPool;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        concesionaria TEXT,
        payload JSONB NOT NULL
      );
    `).then(() => undefined);
  }
  return schemaReady;
}

export type Responsable = {
  nombre: string;
  mail: string;
  telefono: string;
  rol: string;
};

export type Proceso = {
  nombre: string;
  descripcion: string;
  responsables: Responsable[];
};

export type Area = {
  nombre: string;
  descripcion: string;
  procesos: Proceso[];
};

export type SubmissionPayload = {
  concesionaria: string;
  areas: Area[];
};

export type SubmissionRow = {
  id: number;
  created_at: string;
  concesionaria: string | null;
  payload: SubmissionPayload;
};

export async function insertSubmission(payload: SubmissionPayload) {
  await ensureSchema();
  const { rows } = await getPool().query<{ id: number }>(
    `INSERT INTO submissions (concesionaria, payload)
     VALUES ($1, $2)
     RETURNING id`,
    [payload.concesionaria || null, JSON.stringify(payload)]
  );
  return rows[0].id;
}

export async function listSubmissions(): Promise<SubmissionRow[]> {
  await ensureSchema();
  const { rows } = await getPool().query<SubmissionRow>(
    `SELECT id, created_at, concesionaria, payload
     FROM submissions
     ORDER BY created_at DESC`
  );
  return rows;
}

export async function deleteSubmission(id: number): Promise<boolean> {
  await ensureSchema();
  const { rowCount } = await getPool().query(`DELETE FROM submissions WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}
