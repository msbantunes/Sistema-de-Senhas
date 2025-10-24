import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Ticket, CalledTicket, ServiceId, SubService, ReportData } from '../types';
import { api } from '../services/api';

interface TicketContextType {
  tickets: Ticket[];
  calledTickets: CalledTicket[];
  generateTicket: (serviceId: ServiceId, subService?: SubService) => Promise<Ticket>;
  callNextTicket: (deskNumber: number) => Promise<CalledTicket>;
  getReportData: () => Promise<ReportData>;
  resetSystem: () => Promise<void>;
  isLoading: boolean;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [calledTickets, setCalledTickets] = useState<CalledTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para recarregar todos os dados da "API"
  const refreshData = useCallback(async () => {
    // Não seta isLoading(true) aqui para evitar piscar a tela em cada atualização
    try {
        const [waiting, called] = await Promise.all([
            api.fetchTickets(),
            api.fetchCalledTickets()
        ]);
        setTickets(waiting);
        setCalledTickets(called);
    } catch (error) {
        console.error("Falha ao buscar os dados:", error);
    } finally {
        setIsLoading(false); // Apenas no final do carregamento inicial
    }
  }, []);

  // Carregamento inicial dos dados
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // Este efeito escuta por mudanças no localStorage feitas por outras abas,
  // tornando a aplicação reativa como se estivesse conectada a um backend em tempo real.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        // Verifica se a mudança foi em uma das chaves que usamos
        if (event.key === 'tickets' || event.key === 'calledTickets' || event.key === 'ticketCounters') {
            refreshData();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshData]);


  const generateTicket = useCallback(async (serviceId: ServiceId, subService?: SubService): Promise<Ticket> => {
    const newTicket = await api.createTicket(serviceId, subService);
    // Atualiza o estado local após a "API" confirmar a criação
    setTickets(prevTickets => [...prevTickets, newTicket]);
    return newTicket;
  }, []);

  const callNextTicket = useCallback(async (deskNumber: number): Promise<CalledTicket> => {
    try {
      const calledTicketData = await api.callNextTicket(deskNumber);
      
      // Atualiza o estado local com base na resposta da "API"
      setTickets(prevTickets => prevTickets.filter(t => t.id !== calledTicketData.ticket.id));
      setCalledTickets(prev => [calledTicketData, ...prev]);
      
      return calledTicketData;
    } catch (error) {
      console.error("Falha ao chamar a próxima senha:", error);
      throw error; // Re-lança o erro para ser tratado pelo componente que chamou
    }
  }, []);
  
  const getReportData = useCallback((): Promise<ReportData> => {
      // Esta função agora chama diretamente a api, que busca os dados mais recentes
      return api.fetchReportData();
  }, []);

  const resetSystem = useCallback(async () => {
    await api.resetSystem();
    setTickets([]);
    setCalledTickets([]);
  }, []);

  const value = {
    tickets,
    calledTickets,
    generateTicket,
    callNextTicket,
    getReportData,
    resetSystem,
    isLoading,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};