import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Agendamento } from './useAgendamentos';

export const useAgendamentosRealtime = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carregamento inicial dos dados
    const fetchAgendamentos = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('agendamentos_robustos')
          .select('*')
          .order('DATA', { ascending: false })
          .order('HORA', { ascending: true });

        if (error) {
          throw error;
        }

        setAgendamentos(data as Agendamento[]);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching agendamentos:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgendamentos();

    // Configuração do Realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos_robustos'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setAgendamentos(prev => {
                const newAgendamento = payload.new as Agendamento;
                return [newAgendamento, ...prev].sort((a, b) => {
                  // Ordena por data (desc) e depois por hora (asc)
                  if (a.DATA !== b.DATA) {
                    return new Date(b.DATA).getTime() - new Date(a.DATA).getTime();
                  }
                  return a.HORA.localeCompare(b.HORA);
                });
              });
              break;
              
            case 'UPDATE':
              setAgendamentos(prev => 
                prev.map(agendamento => 
                  agendamento.id === payload.new.id 
                    ? payload.new as Agendamento 
                    : agendamento
                )
              );
              break;
              
            case 'DELETE':
              setAgendamentos(prev => 
                prev.filter(agendamento => agendamento.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    // Limpeza da assinatura
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { agendamentos, isLoading, error };
};