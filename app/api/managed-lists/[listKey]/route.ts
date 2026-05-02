import { NextResponse } from "next/server";
import { canEditManagedLists, getListTable, isManagedListKey, resolveRequestRole } from "@/lib/domain/managed-lists";
import { createSupabaseServerClient } from "@/lib/supabase";

type Payload = {
  code?: string;
  label_he?: string;
  label_en?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

function normalizeCode(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "_");
}

function validateBody(body: Payload): string | null {
  if (!body.code || !body.label_he) return "code and label_he are required";
  return null;
}

export async function GET(_request: Request, context: { params: Promise<{ listKey: string }> }) {
  const { listKey } = await context.params;
  if (!isManagedListKey(listKey)) return NextResponse.json({ error: "Unknown list key" }, { status: 404 });

  const supabase = createSupabaseServerClient();
  const cfg = getListTable(listKey);
  const columns = cfg.hasFullName
    ? "id, code, label_he, label_en, sort_order, is_active, full_name"
    : "id, code, label_he, label_en, sort_order, is_active";
  const { data, error } = await supabase.from(cfg.table).select(columns).order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request, context: { params: Promise<{ listKey: string }> }) {
  const { listKey } = await context.params;
  if (!isManagedListKey(listKey)) return NextResponse.json({ error: "Unknown list key" }, { status: 404 });
  const role = await resolveRequestRole(request);
  if (!canEditManagedLists(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as Payload;
  const validationError = validateBody(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const cfg = getListTable(listKey);
  const payload: Record<string, unknown> = {
    code: normalizeCode(body.code!),
    label_he: body.label_he!.trim(),
    label_en: body.label_en?.trim() || null,
    sort_order: Number.isFinite(body.sort_order) ? Math.max(0, Math.round(body.sort_order!)) : 1000,
    is_active: body.is_active ?? true,
    updated_at: new Date().toISOString()
  };
  if (cfg.hasFullName) payload.full_name = payload.label_he;

  const { data, error } = await supabase.from(cfg.table).insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data }, { status: 201 });
}

export async function PATCH(request: Request, context: { params: Promise<{ listKey: string }> }) {
  const { listKey } = await context.params;
  if (!isManagedListKey(listKey)) return NextResponse.json({ error: "Unknown list key" }, { status: 404 });
  const role = await resolveRequestRole(request);
  if (!canEditManagedLists(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as Payload & { id?: string };
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.code !== undefined) updates.code = normalizeCode(body.code);
  if (body.label_he !== undefined) updates.label_he = body.label_he.trim();
  if (body.label_en !== undefined) updates.label_en = body.label_en?.trim() || null;
  if (body.sort_order !== undefined) updates.sort_order = Math.max(0, Math.round(body.sort_order));
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  const supabase = createSupabaseServerClient();
  const cfg = getListTable(listKey);
  if (cfg.hasFullName && typeof updates.label_he === "string") updates.full_name = updates.label_he;

  const { data, error } = await supabase.from(cfg.table).update(updates).eq("id", body.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(request: Request, context: { params: Promise<{ listKey: string }> }) {
  const { listKey } = await context.params;
  if (!isManagedListKey(listKey)) return NextResponse.json({ error: "Unknown list key" }, { status: 404 });
  const role = await resolveRequestRole(request);
  if (!canEditManagedLists(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const cfg = getListTable(listKey);
  const { data, error } = await supabase
    .from(cfg.table)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
