import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAuthorized(request: NextRequest): boolean {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  if (!user || !password) return false;

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) return false;

  const decoded = atob(header.slice("Basic ".length));
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const providedUser = decoded.slice(0, separatorIndex);
  const providedPassword = decoded.slice(separatorIndex + 1);
  return providedUser === user && providedPassword === password;
}

export function proxy(request: NextRequest) {
  if (isAuthorized(request)) {
    return NextResponse.next();
  }
  return new NextResponse("Autenticación requerida", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Panel de administración"',
    },
  });
}

export const config = {
  // Nota: /api/submissions (sin id) queda afuera a propósito, es el POST público del formulario.
  matcher: ["/admin/:path*", "/api/export/:path*", "/api/submissions/:id"],
};
