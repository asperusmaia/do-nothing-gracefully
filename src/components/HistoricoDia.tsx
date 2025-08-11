
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { Agendamento } from "@/hooks/useAgendamentos";

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

interface HistoricoDiaProps {
  agendamentos: Agendamento[];
  isLoading: boolean;
}

export const HistoricoDia = ({ agendamentos, isLoading }: HistoricoDiaProps) => {
  const formatDate = (dateString: string) => {
    // Parse the date string correctly to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-2xl font-semibold text-card-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            HISTÓRICO DO DIA
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Total: {agendamentos.length} agendamentos realizados
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-muted/50 px-3 py-2 rounded border border-border text-muted-foreground">
            ■ HOJE - Agendamentos Realizados
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
              {agendamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-lg">
                    Nenhum agendamento realizado ainda hoje
                  </TableCell>
                </TableRow>
              ) : (
                agendamentos.map((agendamento) => (
                  <TableRow key={agendamento.id} className="border-border hover:bg-muted/30">
                     <TableCell className="font-medium text-card-foreground text-lg">{agendamento.NOME}</TableCell>
                     <TableCell className="text-muted-foreground text-base">{formatDate(agendamento.DATA)}</TableCell>
                     <TableCell className="text-muted-foreground text-base font-bold">{formatTime(agendamento.HORA)}</TableCell>
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
  );
};
