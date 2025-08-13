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
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
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
  nome_profissionais?: string;
  escolha_serviços?: string;
  instructions?: string;
}
export default function Booking() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaId, setLojaId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [professional, setProfessional] = useState<string>("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [pros, setPros] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [service, setService] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  useEffect(() => {
    document.title = "Agendar atendimento | ÁSPERUS";
  }, []);

  // Carregar lojas
  useEffect(() => {
    (async () => {
      const {
        data,
        error
      } = await supabase.from("info_loja").select("*");
      if (error) {
        console.error(error);
        toast.error("Não foi possível carregar as lojas.");
        return;
      }
      setLojas(data || []);
      if (data && data.length && !lojaId) setLojaId(data[0].id);
    })();
  }, []);

  // Carregar profissionais e serviços a partir da info_loja selecionada
  useEffect(() => {
    if (!lojaId || !lojas.length) return;
    const lojaSel = lojas.find(l => l.id === lojaId);
    if (!lojaSel) return;
    const prosList = (lojaSel.nome_profissionais || "").split(/[;,\n]/).map(s => s.trim()).filter(Boolean);
    setPros(prosList);
    const servList = (lojaSel.escolha_serviços || "").split(/[;,\n]/).map(s => s.trim()).filter(Boolean);
    setServices(servList);
  }, [lojaId, lojas]);
  const dateStr = useMemo(() => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [date]);
  const baseDate = useMemo(() => date || new Date(), [date]);
  const nextSixDates = useMemo(() => {
    const arr: string[] = [];
    const d = new Date(baseDate);
    for (let i = 0; i < 6; i++) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      arr.push(`${y}-${m}-${dd}`);
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }, [baseDate]);
  async function fetchSlotsFor(dStr: string) {
    const {
      data,
      error
    } = await supabase.functions.invoke("get_available_slots", {
      body: {
        loja_id: lojaId,
        date: dStr,
        professional: professional || undefined
      }
    });
    if (error) throw error;
    return data?.slots as string[] || [];
  }
  async function fetchAllSlots() {
    if (!lojaId) return;
    setLoadingSlots(true);
    try {
      const results: [string, string[]][] = await Promise.all(nextSixDates.map(async (d): Promise<[string, string[]]> => {
        try {
          const s = await fetchSlotsFor(d);
          return [d, s];
        } catch {
          return [d, [] as string[]];
        }
      }));
      const map: Record<string, string[]> = {};
      results.forEach(([d, s]) => {
        map[d] = s;
      });
      setSlotsByDate(map);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao buscar horários disponíveis.");
    } finally {
      setLoadingSlots(false);
    }
  }

  // Atualização automática ao mudar loja/data/profissional
  useEffect(() => {
    if (!lojaId) return;
    fetchAllSlots();
  }, [lojaId, professional, nextSixDates]);

  // Realtime para atualizar slots quando houver mudanças
  useEffect(() => {
    if (!lojaId) return;
    const channel = supabase.channel("booking-slots").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "agendamentos_robustos"
    }, () => fetchAllSlots()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lojaId, professional, nextSixDates]);
  async function handleBook() {
    if (!name || !contact) {
      toast.warning("Preencha nome e contato.");
      return;
    }
    if (!professional) {
      toast.warning("Selecione um profissional.");
      return;
    }
    if (!service) {
      toast.warning("Selecione um serviço.");
      return;
    }
    if (!selectedSlot || !selectedDateStr) {
      toast.warning("Escolha um horário disponível.");
      return;
    }
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("book_slot", {
        body: {
          loja_id: lojaId,
          date: selectedDateStr,
          time: selectedSlot,
          name,
          contact,
          professional,
          service
        }
      });
      if (error) throw error;
      setBooking(data?.booking);
      toast.success("Agendamento confirmado!");
      setSelectedSlot(null);
      setSelectedDateStr(null);
      fetchAllSlots();
    } catch (e: any) {
      const msg = e?.message || "Erro ao confirmar agendamento.";
      toast.error(msg.includes("duplicate") ? "Horário indisponível." : msg);
    }
  }
  const loja = lojas.find(l => l.id === lojaId);
  return <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Agendar atendimento</h1>
          <p className="text-muted-foreground">Escolha a data e confirme seu horário</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Data */}
          <Card>
            <CardHeader>
              <CardTitle>Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon />
                    {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className={cn("p-3 pointer-events-auto [&_.rdp-head]:hidden")} />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Profissional (opcional) */}
          <Card>
            <CardHeader>
              <CardTitle>Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={professional || undefined} onValueChange={setProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {pros.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Serviço (obrigatório) */}
          <Card>
            <CardHeader>
              <CardTitle>Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={service || undefined} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
            {!lojaId ? <p className="text-sm text-muted-foreground">Carregando informações da loja...</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {nextSixDates.map(d => <div key={d} className="space-y-2">
                    <div className="text-sm font-medium">
                      {format(new Date(d), "PPP", {
                  locale: ptBR
                })}
                    </div>
                    {loadingSlots ? <div className="grid grid-cols-3 gap-2">
                        {Array.from({
                  length: 6
                }).map((_, i) => <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />)}
                      </div> : slotsByDate[d]?.length ? <div className="flex flex-wrap gap-2">
                        {slotsByDate[d].map(s => {
                  const isSelected = selectedSlot === s && selectedDateStr === d;
                  return <Button key={s} variant={isSelected ? "default" : "secondary"} onClick={() => {
                    setSelectedSlot(s);
                    setSelectedDateStr(d);
                  }} size="sm">
                              {s}
                            </Button>;
                })}
                      </div> : <p className="text-sm text-muted-foreground">Nenhum horário disponível.</p>}
                  </div>)}
              </div>}
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
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contato</Label>
              <Input id="contact" value={contact} onChange={e => setContact(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleBook} disabled={!selectedSlot || !selectedDateStr || !name || !contact || !professional || !service} className="w-full font-semibold text-slate-50">AGENDAR</Button>
              {!selectedSlot && <p className="mt-2 text-sm text-muted-foreground">
                  Selecione um horário acima para habilitar o agendamento.
                </p>}
            </div>
          </CardContent>
        </Card>

        {/* Confirmação */}
        {booking && <Card className="mt-6 border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 /> Agendamento confirmado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                {format(new Date(booking.DATA), "PPP")} às {String(booking.HORA).slice(0, 5)}
                {booking.PROFISSIONAL ? ` com ${booking.PROFISSIONAL}` : ""}
              </p>
              {loja?.name && <p>Loja: {loja.name}</p>}
              {loja?.address && <p>Endereço: {loja.address}</p>}
              {loja?.maps_url && <a className="text-primary underline" href={loja.maps_url} target="_blank" rel="noreferrer">
                  Abrir no Maps
                </a>}
            </CardContent>
          </Card>}
      </main>
    </div>;
}