import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas publicas: la encuesta post-alta se accede solo por token, sin login.
const RUTAS_PUBLICAS = ["/login", "/auth/callback", "/encuesta"];

function esRutaPublica(pathname: string): boolean {
  return RUTAS_PUBLICAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (esRutaPublica(request.nextUrl.pathname)) {
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // La verificacion de usuarios_permitidos (allowlist) se hace con la
  // service role key en requireUser(), no aqui: este proxy solo confirma
  // que hay sesion. Cada server component y route handler protegido debe
  // llamar requireUser() igualmente (el proxy no cubre llamadas directas
  // a la API si el matcher cambiara).

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
