import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { crearClienteAdmin } from "@/lib/supabase/server";

const PagoSchema = z.object({
  monto: z.number().positive(),
  fecha_pago: z.string(),
  observaciones: z.string().nullable().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { id: casoId } = await params;
  const body = await request.json();
  const parsed = PagoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", detalles: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = crearClienteAdmin();
  const { data: pago, error } = await admin
    .from("pagos")
    .upsert(
      { caso_id: casoId, ...parsed.data },
      { onConflict: "caso_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pago }, { status: 201 });
}
