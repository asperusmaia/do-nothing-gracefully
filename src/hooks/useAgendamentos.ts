
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Agendamento {
  id: number;
  NOME: string;
  CONTATO: string;
  DATA: string;
  HORA: string;
  STATUS: string;
  PROFISSIONAL: string;
  created_at: string;
}

export const useAgendamentos = (dataFilter?: string) => {
  return useQuery({
    queryKey: ['agendamentos', dataFilter],
    queryFn: async () => {
      let query = supabase
        .from('agendamentos_robustos')
        .select('*')
        .order('DATA', { ascending: false })
        .order('HORA', { ascending: true });

      if (dataFilter) {
        query = query.eq('DATA', dataFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching agendamentos:', error);
        throw error;
      }

      return data as Agendamento[];
    },
  });
};

export const useAgendamentosHoje = () => {
  // Garantir que pegamos a data local, não UTC
  const hoje = new Date();
  const year = hoje.getFullYear();
  const month = String(hoje.getMonth() + 1).padStart(2, '0');
  const day = String(hoje.getDate()).padStart(2, '0');
  const dataHoje = `${year}-${month}-${day}`;
  return useAgendamentos(dataHoje);
};

export const useAgendamentosStats = () => {
  return useQuery({
    queryKey: ['agendamentos-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos_robustos')
        .select('*');

      if (error) {
        console.error('Error fetching agendamentos stats:', error);
        throw error;
      }

      // Garantir que pegamos a data local, não UTC
      const hoje = new Date();
      const year = hoje.getFullYear();
      const month = String(hoje.getMonth() + 1).padStart(2, '0');
      const day = String(hoje.getDate()).padStart(2, '0');
      const dataHoje = `${year}-${month}-${day}`;
      const agendamentosHoje = data?.filter(a => a.DATA === dataHoje) || [];
      
      const profissionaisAtivos = new Set(data?.map(a => a.PROFISSIONAL)).size;
      
      // Calcular taxa de ocupação (assumindo 13 horários por dia)
      const horariosDisponiveis = 13;
      const taxaOcupacao = agendamentosHoje.length > 0 ? 
        Math.round((agendamentosHoje.length / horariosDisponiveis) * 100) : 0;

      return {
        totalAgendamentos: data?.length || 0,
        agendamentosHoje: agendamentosHoje.length,
        profissionaisAtivos,
        taxaOcupacao: `${taxaOcupacao}%`
      };
    },
  });
};
