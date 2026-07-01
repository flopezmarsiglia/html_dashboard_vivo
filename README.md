# Relevamiento de procesos — Dashboard en vivo (BAIC)

Formulario interactivo para que la dueña de la concesionaria indique:

- Qué **procesos** quiere monitorear en el dashboard (ventas, postventa, stock, etc.)
- Quiénes son las **personas responsables** de cada proceso (nombre, cargo, email, teléfono)

Puede agregar tantos procesos y personas como necesite. Las respuestas se guardan
en una base de datos Postgres y quedan disponibles en un panel de administración
protegido por usuario/contraseña.

## Estructura

- `app/page.tsx` — formulario público (`/`).
- `app/api/submissions/route.ts` — guarda cada respuesta en la base de datos.
- `app/admin` — panel para ver todas las respuestas (`/admin`, protegido).
- `app/api/export` — descarga todas las respuestas en CSV o JSON (protegido).
- `proxy.ts` — exige usuario/contraseña (Basic Auth) para `/admin` y `/api/export`.
- `lib/db.ts` — conexión a Postgres y creación automática de la tabla `submissions`.

## 1. Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL, ADMIN_USER, ADMIN_PASSWORD
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) para el formulario y
[http://localhost:3000/admin](http://localhost:3000/admin) para el panel (pide
usuario/contraseña).

## 2. Base de datos gratuita (Supabase)

El proyecto se conecta a **cualquier Postgres** a través de una única variable
(`DATABASE_URL`), así que Supabase funciona sin tocar código — Supabase es
Postgres por debajo.

1. Andá a [supabase.com](https://supabase.com), creá una cuenta gratis y un
   proyecto nuevo (elegí una contraseña de base de datos y guardala).
2. Entrá a **Project Settings → Database → Connection string**.
3. Copiá la opción **"Transaction pooler"** (puerto `6543`) — es la indicada
   para apps serverless como esta que corre en Vercel, porque evita agotar
   conexiones. Reemplazá `[YOUR-PASSWORD]` en la URL por la contraseña que
   elegiste.
4. Usá esa URL como `DATABASE_URL`, tanto en `.env.local` (desarrollo) como en
   Vercel (producción, ver paso 3).

No hace falta correr ningún script de migración: la tabla `submissions` se crea
sola la primera vez que alguien completa el formulario.


## 3. Deploy en Vercel (gratis)

1. Subí este proyecto a un repositorio de GitHub.
2. En [vercel.com/new](https://vercel.com/new), importá ese repositorio.
3. Antes de deployar (o después, en Settings → Environment Variables), configurá:
   - `DATABASE_URL` (ver paso 2)
   - `ADMIN_USER` → usuario para entrar a `/admin`
   - `ADMIN_PASSWORD` → contraseña para entrar a `/admin`
   - `NEXT_PUBLIC_DEALERSHIP_NAME` → nombre de la concesionaria (aparece en el
     texto del formulario), opcional.
4. Deploy. Vercel te da una URL tipo `https://tu-proyecto.vercel.app`.

## 4. Compartir con la dueña

Enviale el link raíz del deploy (`https://tu-proyecto.vercel.app`). Ella completa
el formulario agregando procesos y responsables, y le da "Enviar respuestas".
Puede volver a entrar y enviar otra respuesta si se olvidó de algo — todas las
respuestas quedan guardadas por separado.

## 5. Ver / exportar las respuestas

Entrá a `https://tu-proyecto.vercel.app/admin` con el usuario y contraseña que
configuraste (`ADMIN_USER` / `ADMIN_PASSWORD`). Desde ahí podés:

- Ver todas las respuestas, con sus procesos y responsables.
- Descargar todo en **CSV** (para abrir en Excel/Sheets) o **JSON**.

## Notas

- El formulario no tiene límite de procesos ni de personas por proceso.
- Los datos quedan en tu propia base de datos (no se comparten con terceros).
- Si querés resetear todo, podés borrar las filas de la tabla `submissions`
  desde el panel de tu proveedor de Postgres (Neon, Supabase, etc.).
