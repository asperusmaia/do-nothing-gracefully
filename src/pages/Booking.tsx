import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Loja {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  maps_url?: string;
  opening_time?: string;
  closing_time?: string;
  slot_interval_minutes?: number;
}

export default function Booking() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaId, setLojaId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [professional, setProfessional] = useState<string>("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [pros, setPros] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Agendar atendimento | ÁSPERUS";
  }, []);

  // Carregar lojas
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("info_loja").select("*");
      if (error) {
        console.error(error);
        toast.error("Não foi possível carregar as lojas.");
        return;
      }
      setLojas(data || []);
      if (data && data.length && !lojaId) setLojaId(data[0].id);
    })();
  }, []);

  // Carregar profissionais (fonte: distintos da tabela atual)
  useEffect(() => {
    if (!lojaId) return;
    (async () => {
      const { data, error } = await supabase
        .from("agendamentos_robustos")
        .select("PROFISSIONAL")
        .eq("loja_id", lojaId);
      if (error) return;
      const uniq = Array.from(new Set((data || []).map((r: any) => r.PROFISSIONAL).filter(Boolean)));
      setPros(uniq);
    })();
  }, [lojaId]);

  const dateStr = useMemo(() => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [date]);

  async function fetchSlots() {
    if (!lojaId || !dateStr) return;
    setLoadingSlots(true);
    try {
      const { data, error } = await supabase.functions.invoke("get_available_slots", {
        body: { loja_id: lojaId, date: dateStr, professional: professional || undefined },
      });
      if (error) throw error;
      setSlots((data?.slots as string[]) || []);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao buscar horários disponíveis.");
    } finally {
      setLoadingSlots(false);
    }
  }

  // Atualização automática ao mudar loja/data/profissional
  useEffect(() => {
    if (!lojaId || !dateStr) return;
    fetchSlots();
  }, [lojaId, dateStr, professional]);

  // Realtime para atualizar slots quando houver mudanças
  useEffect(() => {
    if (!lojaId || !dateStr) return;
    const channel = supabase
      .channel("booking-slots")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agendamentos_robustos" },
        () => fetchSlots()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lojaId, dateStr, professional]);

  async function handleBook(time: string) {
    if (!name || !contact) {
      toast.warning("Preencha nome e contato.");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("book_slot", {
        body: {
          loja_id: lojaId,
          date: dateStr,
          time,
          name,
          contact,
          professional: professional || undefined,
        },
      });
      if (error) throw error;
      setBooking(data?.booking);
      toast.success("Agendamento confirmado!");
      fetchSlots();
    } catch (e: any) {
      const msg = e?.message || "Erro ao confirmar agendamento.";
      toast.error(msg.includes("duplicate") ? "Horário indisponível." : msg);
    }
  }

  const loja = lojas.find((l) => l.id === lojaId);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Agendar atendimento</h1>
          <p className="text-muted-foreground">Escolha a loja, data e confirme seu horário</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Loja */}
          <Card>
            <CardHeader>
              <CardTitle>Loja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={lojaId} onValueChange={setLojaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  {lojas.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loja?.address && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{loja.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data */}
          <Card>
            <CardHeader>
              <CardTitle>Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Profissional (opcional) */}
          <Card>
            <CardHeader>
              <CardTitle>Profissional (opcional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={professional} onValueChange={setProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualquer</SelectItem>
                  {pros.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Horários */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Horários disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {(!lojaId || !dateStr) && (
              <p className="text-sm text-muted-foreground">Selecione loja e data para ver os horários.</p>
            )}
            {lojaId && dateStr && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {loadingSlots ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
                  ))
                ) : slots.length ? (
                  slots.map((s) => (
                    <Button key={s} variant="secondary" onClick={() => handleBook(s)}>
                      {s}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum horário disponível.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do cliente */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Seus dados</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contato</Label>
              <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Confirmação */}
        {booking && (
          <Card className="mt-6 border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 /> Agendamento confirmado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                {format(new Date(booking.DATA), "PPP")} às {String(booking.HORA).slice(0,5)}
                {booking.PROFISSIONAL ? ` com ${booking.PROFISSIONAL}` : ""}
              </p>
              {loja?.name && <p>Loja: {loja.name}</p>}
              {loja?.address && <p>Endereço: {loja.address}</p>}
              {loja?.maps_url && (
                <a className="text-primary underline" href={loja.maps_url} target="_blank" rel="noreferrer">
                  Abrir no Maps
                </a>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
