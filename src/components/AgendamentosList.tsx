import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent, CalendarIcon, Filter } from "lucide-react";
import { useState } from "react";
import { DateInput } from "@/components/ui/date-input";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgendamentosSegmentados } from "@/hooks/useAgendamentosSegmentados";
import { AgendamentosTempoReal } from "./AgendamentosTempoReal";
import { HistoricoDia } from "./HistoricoDia";
import { CancelamentosDia } from "./CancelamentosDia";

export const AgendamentosList = () => {
  const { data: agendamentosSegmentados, isLoading } = useAgendamentosSegmentados();
  const [profissionalFilter, setProfissionalFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dataInicial, setDataInicial] = useState<Date>();
  const [dataFinal, setDataFinal] = useState<Date>();

  const filtrarAgendamentos = (agendamentos: any[]) => {
    return agendamentos?.filter(agendamento => {
      const profissionalMatch = profissionalFilter === "todos" || agendamento.PROFISSIONAL === profissionalFilter;
      const statusMatch = statusFilter === "todos" || agendamento.STATUS === statusFilter;
      return profissionalMatch && statusMatch;
    }) || [];
  };

  const agendamentosTempoRealFiltrados = filtrarAgendamentos(agendamentosSegmentados?.tempoReal || []);
  const agendamentosHistoricoFiltrados = filtrarAgendamentos(agendamentosSegmentados?.historico || []);
  const cancelamentosFiltrados = filtrarAgendamentos(agendamentosSegmentados?.cancelamentos || []);

  return (
    <div className="space-y-6">
      {/* Agendamentos - Tempo Real */}
      <AgendamentosTempoReal 
        agendamentos={agendamentosTempoRealFiltrados} 
        isLoading={isLoading} 
      />

      {/* Histórico do Dia */}
      <HistoricoDia 
        agendamentos={agendamentosHistoricoFiltrados} 
        isLoading={isLoading} 
      />

      {/* Cancelamentos */}
      <CancelamentosDia 
        agendamentos={cancelamentosFiltrados} 
        isLoading={isLoading} 
      />

      {/* Filtros */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-base font-medium text-card-foreground mb-2 block">Profissional</label>
              <Select value={profissionalFilter} onValueChange={setProfissionalFilter}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="todos">Todos</SelectItem>
                   <SelectItem value="Allan Marques🪒">Allan Marques🪒</SelectItem>
                   <SelectItem value="Gil Pedrosa✂️">Gil Pedrosa✂️</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-base font-medium text-card-foreground mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="AGENDADO">AGENDADO</SelectItem>
                  <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                  <SelectItem value="REAGENDADO">REAGENDADO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-base font-medium text-card-foreground mb-2 block">Data Inicial</label>
              <DateInput
                value={dataInicial}
                onChange={setDataInicial}
                placeholder="Selecionar data inicial"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="text-base font-medium text-card-foreground mb-2 block">Data Final</label>
              <DateInput
                value={dataFinal}
                onChange={setDataFinal}
                placeholder="Selecionar data final"
                className="bg-background border-border"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setProfissionalFilter("todos");
                setStatusFilter("todos");
                setDataInicial(undefined);
                setDataFinal(undefined);
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};