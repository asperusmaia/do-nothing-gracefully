// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(mins: number) {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let loja_id: string | null = null;
  let date: string | null = null;
  let professional: string | null = null;

  if (req.method === "POST") {
    try {
      const body = await req.json();
      loja_id = body?.loja_id ?? null;
      date = body?.date ?? null;
      professional = body?.professional ?? null;
    } catch (_) {
      // ignore, fallback to query params
    }
  }

  if (!loja_id || !date) {
    const url = new URL(req.url);
    loja_id = loja_id ?? url.searchParams.get("loja_id");
    date = date ?? url.searchParams.get("date");
    professional = professional ?? url.searchParams.get("professional");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    if (!loja_id || !date) {
      return new Response(JSON.stringify({ error: "Missing loja_id or date" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Feriados
    const { data: feriado, error: feriadoErr } = await supabase
      .from("feriados")
      .select("data, descricao")
      .eq("data", date)
      .maybeSingle();
    if (feriadoErr) throw feriadoErr;
    if (feriado) {
      return new Response(
        JSON.stringify({ slots: [], isHoliday: true, holiday: feriado }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Loja
    const { data: loja, error: lojaErr } = await supabase
      .from("info_loja")
      .select("id, opening_time, closing_time, slot_interval_minutes, name, address, phone, maps_url")
      .eq("id", loja_id)
      .maybeSingle();
    if (lojaErr) throw lojaErr;
    if (!loja) {
      return new Response(JSON.stringify({ error: "Store not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Intervalo padrão 60min se não definido
    const opening = typeof loja.opening_time === "string" ? loja.opening_time : String(loja.opening_time);
    const closing = typeof loja.closing_time === "string" ? loja.closing_time : String(loja.closing_time);
    const interval = loja.slot_interval_minutes ?? 60;

    const startM = toMinutes(opening);
    const endM = toMinutes(closing);
    const slots: string[] = [];
    for (let t = startM; t + interval <= endM; t += interval) {
      slots.push(toHHMM(t));
    }

    // Agendamentos existentes (ignorar cancelados)
    let query = supabase
      .from("agendamentos_robustos")
      .select("HORA, PROFISSIONAL, STATUS")
      .eq("loja_id", loja_id)
      .eq("DATA", date)
      .neq("STATUS", "CANCELADO");

    if (professional) {
      query = query.eq("PROFISSIONAL", professional);
    }

    const { data: ags, error: agsErr } = await query;
    if (agsErr) throw agsErr;

    const bookedTimes = new Set((ags ?? []).map((a: any) => (typeof a.HORA === "string" ? a.HORA.slice(0,5) : String(a.HORA).slice(0,5))));

    // Se profissional informado: bloqueia horário se o mesmo pro já tem agendamento.
    // Caso contrário (sem profissional): considera bloqueado se qualquer agendamento existe nesse horário
    const available = slots.filter((s) => !bookedTimes.has(s));

    return new Response(
      JSON.stringify({ slots: available, store: loja }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("get_available_slots error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
