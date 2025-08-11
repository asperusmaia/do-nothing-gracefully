import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgendamentosRealtime } from "@/hooks/useAgendamentosRealtime";
import { Calendar, Clock, User, Briefcase } from "lucide-react";
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'AGENDADO':
      return <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Agendado</Badge>;
    case 'REAGENDADO':
      return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">Reagendado</Badge>;
    case 'CANCELADO':
      return <Badge className="bg-red-500/20 text-red-300 border-red-400/30">Cancelado</Badge>;
    default:
      return <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30">{status}</Badge>;
  }
};
const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
const formatTime = (timeString: string) => {
  return timeString.slice(0, 5); // Remove segundos se existirem
};
export const PainelAgendamentos = () => {
  const {
    agendamentos,
    isLoading,
    error
  } = useAgendamentosRealtime();
  if (error) {
    return <div className="p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Acompanhamento de Agendamentos</h1>
        <div className="text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg p-4">
          Erro ao carregar agendamentos: {error}
        </div>
      </div>;
  }
  return;
};