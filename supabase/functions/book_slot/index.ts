// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const { loja_id, date, time, name, contact, professional } = body ?? {};

    if (!loja_id || !date || !time || !name || !contact) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Não permite agendar em feriado
    const { data: feriado, error: feriadoErr } = await supabase
      .from("feriados")
      .select("data")
      .eq("data", date)
      .maybeSingle();
    if (feriadoErr) throw feriadoErr;
    if (feriado) {
      return new Response(JSON.stringify({ error: "Não é possível agendar em feriados." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Tenta inserir; UNIQUE index bloqueará double booking (exceto cancelados via reutilização de slot)
    const payload: any = {
      loja_id,
      NOME: name,
      CONTATO: contact,
      DATA: date,
      HORA: time,
    };
    if (professional) payload.PROFISSIONAL = professional;

    const { data, error } = await supabase
      .from("agendamentos_robustos")
      .insert(payload)
      .select("id, loja_id, DATA, HORA, NOME, CONTATO, PROFISSIONAL, STATUS, created_at")
      .maybeSingle();

    if (error) {
      // Unique violation code is 23505 typically
      const msg = (error as any).message || String(error);
      const status = msg.includes("duplicate") || msg.includes("already exists") ? 409 : 400;
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ booking: data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("book_slot error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
