import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Agendamento } from "./useAgendamentos";

export const useAgendamentosSegmentados = () => {
  return useQuery({
    queryKey: ['agendamentos-segmentados'],
    queryFn: async () => {
      // Garantir que pegamos a data local, não UTC
      const hoje = new Date();
      const year = hoje.getFullYear();
      const month = String(hoje.getMonth() + 1).padStart(2, '0');
      const day = String(hoje.getDate()).padStart(2, '0');
      const dataHoje = `${year}-${month}-${day}`;

      const { data, error } = await supabase
        .from('agendamentos_robustos')
        .select('*')
        .eq('DATA', dataHoje)
        .order('HORA', { ascending: true });

      if (error) {
        console.error('Error fetching agendamentos segmentados:', error);
        throw error;
      }

      const agendamentos = data as Agendamento[];
      
      // Obter hora atual em formato HH:MM
      const agora = new Date();
      const horaAtual = agora.getHours().toString().padStart(2, '0') + ':' + 
                       agora.getMinutes().toString().padStart(2, '0');

      // Separar agendamentos por categoria
      const tempoReal = agendamentos.filter(ag => 
        (ag.STATUS === 'AGENDADO' || ag.STATUS === 'REAGENDADO') && 
        ag.HORA > horaAtual
      );
      
      const historico = agendamentos.filter(ag => 
        (ag.STATUS === 'AGENDADO' || ag.STATUS === 'REAGENDADO') && 
        ag.HORA <= horaAtual
      );
      
      const cancelamentos = agendamentos.filter(ag => 
        ag.STATUS === 'CANCELADO'
      );

      return {
        tempoReal,
        historico,
        cancelamentos
      };
    },
  });
};