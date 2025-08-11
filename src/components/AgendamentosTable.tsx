
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent, CalendarIcon, Filter } from "lucide-react";
import { useAgendamentosHoje } from "@/hooks/useAgendamentos";
import { useState } from "react";
import { DateInput } from "@/components/ui/date-input";
import { cn } from "@/lib/utils";

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'AGENDADO':
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/50">● AGENDADO</span>;
    case 'CANCELADO':
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/50">● CANCELADO</span>;
    case 'REAGENDADO':
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-500/20 text-orange-400 border border-orange-500/50">● REAGENDADO</span>;
    default:
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400 border border-gray-500/50">● {status}</span>;
  }
};

export const AgendamentosTable = () => {
  const { data: agendamentos, isLoading } = useAgendamentosHoje();
  const [profissionalFilter, setProfissionalFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dataInicial, setDataInicial] = useState<Date>();
  const [dataFinal, setDataFinal] = useState<Date>();

  const agendamentosFiltrados = agendamentos?.filter(agendamento => {
    const profissionalMatch = profissionalFilter === "todos" || agendamento.PROFISSIONAL === profissionalFilter;
    const statusMatch = statusFilter === "todos" || agendamento.STATUS === statusFilter;
    return profissionalMatch && statusMatch;
  }) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
          <CardTitle className="text-2xl font-semibold text-card-foreground flex items-center gap-2">
              <CalendarComponent className="w-6 h-6 text-primary" />
              Agendamentos - Tempo Real
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              ● Total: {agendamentosFiltrados.length} agendamentos de hoje
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-muted/50 px-3 py-2 rounded border border-border text-muted-foreground">
              ■ HOJE - Agendamentos do Dia Atual
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium text-base">Cliente</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-base">Data</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-base">Hora</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-base">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-base">Profissional</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendamentosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-lg">
                      Nenhum agendamento encontrado para hoje
                    </TableCell>
                  </TableRow>
                ) : (
                  agendamentosFiltrados.map((agendamento) => (
                    <TableRow key={agendamento.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-medium text-card-foreground text-base">{agendamento.NOME}</TableCell>
                      <TableCell className="text-muted-foreground text-base">{formatDate(agendamento.DATA)}</TableCell>
                      <TableCell className="text-muted-foreground text-base">{formatTime(agendamento.HORA)}</TableCell>
                      <TableCell>{getStatusBadge(agendamento.STATUS)}</TableCell>
                      <TableCell className="text-muted-foreground text-base">{agendamento.PROFISSIONAL}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
