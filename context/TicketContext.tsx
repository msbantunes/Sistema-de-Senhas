import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Ticket, CalledTicket, ServiceId, SubService, ReportData, Service } from '../types';
import { SERVICES } from '../constants';
import { api } from '../services/api';

interface TicketContextType {
  tickets: Ticket[];
  calledTickets: CalledTicket[];
  generateTicket: (serviceId: ServiceId, subService?: SubService) => Ticket;
  callNextTicket: (deskNumber: number) => Ticket | undefined;
  getReportData: () => Promise<ReportData>;
  resetSystem: () => void;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);

// A custom hook to sync state with localStorage
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        // Prevent SSR issues
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
                const parsed = JSON.parse(storedValue);
                // Manually revive dates for this specific application's data structures
                if (key === 'tickets' && Array.isArray(parsed)) {
                    return parsed.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })) as T;
                }
                if (key === 'calledTickets' && Array.isArray(parsed)) {
                    return parsed.map((ct: any) => ({ 
                        ...ct, 
                        calledAt: new Date(ct.calledAt), 
                        ticket: ct.ticket ? { ...ct.ticket, createdAt: new Date(ct.ticket.createdAt) } : undefined
                    })) as T;
                }
                return parsed;
            }
        } catch (error) {
            console.error(`Error reading from localStorage for key "${key}":`, error);
        }
        return initialValue;
    });

    useEffect(() => {
        try {
            // Prevent SSR issues
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(state));
            }
        } catch (error) {
            console.error(`Error writing to localStorage for key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
}


export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = usePersistentState<Ticket[]>('tickets', []);
  const [calledTickets, setCalledTickets] = usePersistentState<CalledTicket[]>('calledTickets', []);
  const [ticketCounters, setTicketCounters] = usePersistentState<Record<string, number>>('ticketCounters', {});

  const getServiceById = (serviceId: ServiceId): Service | undefined => {
      return SERVICES.find(s => s.id === serviceId);
  }

  const generateTicket = useCallback((serviceId: ServiceId, subService?: SubService): Ticket => {
    const service = getServiceById(serviceId);
    if (!service) {
      throw new Error(`Service with id ${serviceId} not found.`);
    }

    const prefix = subService ? subService.prefix : service.prefix;
    
    const newCounters = { ...ticketCounters };
    const currentNumber = (newCounters[prefix] || 0) + 1;
    newCounters[prefix] = currentNumber;
    setTicketCounters(newCounters);
    
    const newTicket: Ticket = {
      id: `${prefix}-${currentNumber}-${Date.now()}`,
      number: currentNumber,
      fullTicketNumber: `${prefix}${currentNumber.toString().padStart(3, '0')}`,
      service: service,
      subService: subService,
      createdAt: new Date(),
    };

    setTickets(prevTickets => [...prevTickets, newTicket]);
    return newTicket;
  }, [ticketCounters, setTicketCounters, setTickets]);

  const callNextTicket = useCallback((deskNumber: number): Ticket | undefined => {
    if (tickets.length === 0) {
      return undefined;
    }

    let nextTicket: Ticket | undefined;
    const ticketsCopy = [...tickets];

    // Prioritize priority tickets
    const priorityIndex = ticketsCopy.findIndex(t => t.service.id === ServiceId.Priority);

    if (priorityIndex !== -1) {
      nextTicket = ticketsCopy.splice(priorityIndex, 1)[0];
    } else {
      // Otherwise, get the oldest ticket
      nextTicket = ticketsCopy.shift();
    }

    if (nextTicket) {
      setTickets(ticketsCopy);
      const newCalledTicket: CalledTicket = {
        ticket: nextTicket,
        desk: deskNumber,
        calledAt: new Date(),
      };
      setCalledTickets(prev => [newCalledTicket, ...prev]);
      return nextTicket;
    }
    
    return undefined;
  }, [tickets, setTickets, setCalledTickets]);
  
  const getReportData = useCallback((): Promise<ReportData> => {
      return api.fetchReportData(tickets, calledTickets);
  }, [tickets, calledTickets]);

  const resetSystem = useCallback(() => {
    setTickets([]);
    setCalledTickets([]);
    setTicketCounters({});
  }, [setTickets, setCalledTickets, setTicketCounters]);

  const value = {
    tickets,
    calledTickets,
    generateTicket,
    callNextTicket,
    getReportData,
    resetSystem,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};
