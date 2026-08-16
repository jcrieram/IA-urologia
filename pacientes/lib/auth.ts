import { crearClienteSesion, crearClienteAdmin } from "@/lib/supabase/server";

export interface UsuarioSesion {
  id: string;
  email: string;
}

/**
 * Verifica que exista una sesion Supabase valida Y que el correo este en
 * usuarios_permitidos. Se llama en cada route handler / server component
 * protegido, ademas del middleware, porque el middleware por si solo no
 * protege llamadas directas a la API.
 * Lanza un Response 401/403 (para usar en route handlers) si no pasa.
 */
export async function requireUser(): Promise<UsuarioSesion> {
  const supabase = await crearClienteSesion();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new AuthError("No autenticado", 401);
  }

  const admin = crearClienteAdmin();
  const { data: permitido } = await admin
    .from("usuarios_permitidos")
    .select("email")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!permitido) {
    throw new AuthError("Correo no autorizado", 403);
  }

  return { id: user.id, email: user.email };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
