import { Calendar, Clock, User, Phone, UserCheck } from "lucide-react";

// Mock type for development - will be replaced when Supabase is connected
interface MockAgendamento {
  id: number;
  NOME: string | null;
  DATA: string;
  HORA: string;
  STATUS: string | null;
  PROFISSIONAL: string | null;
  CONTATO: string | null;
}

interface AgendamentoCardProps {
  agendamento: MockAgendamento;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'AGENDADO':
      return {
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        icon: '✓'
      };
    case 'REAGENDADO':
      return {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-800',
        badge: 'bg-amber-100 text-amber-700 border-amber-300',
        icon: '↻'
      };
    case 'CANCELADO':
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        badge: 'bg-red-100 text-red-700 border-red-300',
        icon: '✕'
      };
    default:
      return {
        bg: 'bg-gray-50 border-gray-200',
        text: 'text-gray-800',
        badge: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: '•'
      };
  }
};

const formatDate = (dateString: string): string => {
  try {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch (error) {
    return dateString;
  }
};

const formatTime = (timeString: string): string => {
  try {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  } catch (error) {
    return timeString;
  }
};

export const AgendamentoCard = ({ agendamento }: AgendamentoCardProps) => {
  const statusConfig = getStatusConfig(agendamento.STATUS || 'AGENDADO');

  return (
    <div className={`${statusConfig.bg} rounded-xl border-2 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{agendamento.NOME}</h3>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 flex items-center space-x-1 ${statusConfig.badge}`}>
          <span>{statusConfig.icon}</span>
          <span>{agendamento.STATUS}</span>
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 bg-white/60 p-3 rounded-lg">
          <Calendar className="w-4 h-4 text-primary" />
          <div>
            <span className="text-sm text-gray-600 font-medium">Data:</span>
            <span className="ml-2 font-semibold text-gray-800">{formatDate(agendamento.DATA)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white/60 p-3 rounded-lg">
          <Clock className="w-4 h-4 text-primary" />
          <div>
            <span className="text-sm text-gray-600 font-medium">Hora:</span>
            <span className="ml-2 font-semibold text-gray-800">{formatTime(agendamento.HORA)}</span>
          </div>
        </div>

        {agendamento.PROFISSIONAL && (
          <div className="flex items-center space-x-3 bg-white/60 p-3 rounded-lg">
            <UserCheck className="w-4 h-4 text-primary" />
            <div>
              <span className="text-sm text-gray-600 font-medium">Profissional:</span>
              <span className="ml-2 font-semibold text-gray-800">{agendamento.PROFISSIONAL}</span>
            </div>
          </div>
        )}

        {agendamento.CONTATO && (
          <div className="flex items-center space-x-3 bg-white/60 p-3 rounded-lg">
            <Phone className="w-4 h-4 text-primary" />
            <div>
              <span className="text-sm text-gray-600 font-medium">Contato:</span>
              <span className="ml-2 font-semibold text-gray-800">{agendamento.CONTATO}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};