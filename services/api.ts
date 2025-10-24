import { Ticket, CalledTicket, ReportData, ServiceId, SubService } from '../types';
import { SERVICES } from '../constants';

// --- LocalStorage Mock Implementation ---
// Em uma aplicação real, estas funções fariam chamadas de rede (ex: usando fetch)
// para um servidor backend (ex: PHP/MySQL). Este mock simula esse comportamento usando localStorage.

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            const parsed = JSON.parse(item);
            // "Revive" as datas que foram convertidas para string no JSON
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
    return defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage for key "${key}":`, error);
    }
};


// --- Funções da API Mockada ---

const SIMULATED_DELAY = 200; // ms, para simular a latência da rede

export const api = {
    // GET /tickets
    fetchTickets: (): Promise<Ticket[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(getFromStorage<Ticket[]>('tickets', []));
            }, SIMULATED_DELAY);
        });
    },
    
    // GET /called-tickets
    fetchCalledTickets: (): Promise<CalledTicket[]> => {
         return new Promise(resolve => {
            setTimeout(() => {
                resolve(getFromStorage<CalledTicket[]>('calledTickets', []));
            }, SIMULATED_DELAY);
        });
    },

    // POST /tickets
    createTicket: (serviceId: ServiceId, subService?: SubService): Promise<Ticket> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const service = SERVICES.find(s => s.id === serviceId);
                if (!service) {
                    return reject(new Error(`Serviço com id ${serviceId} não encontrado.`));
                }

                const tickets = getFromStorage<Ticket[]>('tickets', []);
                const ticketCounters = getFromStorage<Record<string, number>>('ticketCounters', {});
                
                const prefix = subService ? subService.prefix : service.prefix;
                const currentNumber = (ticketCounters[prefix] || 0) + 1;
                
                const newTicket: Ticket = {
                    id: `${prefix}-${currentNumber}-${Date.now()}`,
                    number: currentNumber,
                    fullTicketNumber: `${prefix}${currentNumber.toString().padStart(3, '0')}`,
                    service: service,
                    subService: subService,
                    createdAt: new Date(),
                };

                saveToStorage('tickets', [...tickets, newTicket]);
                saveToStorage('ticketCounters', { ...ticketCounters, [prefix]: currentNumber });
                
                resolve(newTicket);
            }, SIMULATED_DELAY);
        });
    },

    // POST /call-next-ticket
    callNextTicket: (deskNumber: number): Promise<CalledTicket> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const tickets = getFromStorage<Ticket[]>('tickets', []);
                const calledTickets = getFromStorage<CalledTicket[]>('calledTickets', []);

                if (tickets.length === 0) {
                    return reject(new Error('Nenhuma senha para chamar.'));
                }
                
                let nextTicket: Ticket | undefined;
                const ticketsCopy = [...tickets];

                const priorityIndex = ticketsCopy.findIndex(t => t.service.id === ServiceId.Priority);

                if (priorityIndex !== -1) {
                    nextTicket = ticketsCopy.splice(priorityIndex, 1)[0];
                } else {
                    nextTicket = ticketsCopy.shift();
                }

                if (nextTicket) {
                    const newCalledTicket: CalledTicket = {
                        ticket: nextTicket,
                        desk: deskNumber,
                        calledAt: new Date(),
                    };
                    saveToStorage('tickets', ticketsCopy);
                    saveToStorage('calledTickets', [newCalledTicket, ...calledTickets]);
                    resolve(newCalledTicket);
                } else {
                    // Este caso não deve ser alcançado se tickets.length > 0
                    reject(new Error('Falha ao determinar a próxima senha.'));
                }
            }, SIMULATED_DELAY);
        });
    },

    // DELETE /
    resetSystem: (): Promise<void> => {
         return new Promise(resolve => {
            setTimeout(() => {
                saveToStorage('tickets', []);
                saveToStorage('calledTickets', []);
                saveToStorage('ticketCounters', {});
                resolve();
            }, SIMULATED_DELAY);
        });
    },
    
    // GET /report
    fetchReportData: (): Promise<ReportData> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const tickets = getFromStorage<Ticket[]>('tickets', []);
                const calledTickets = getFromStorage<CalledTicket[]>('calledTickets', []);
                const allTickets = [...tickets, ...calledTickets.map(ct => ct.ticket)];

                const ticketsByHour: { hour: string; count: number }[] = Array.from({ length: 12 }, (_, i) => {
                    const hour = (i + 8).toString().padStart(2, '0');
                    return { hour: `${hour}:00`, count: 0 };
                });

                allTickets.forEach(ticket => {
                    const hour = ticket.createdAt.getHours();
                    const index = hour - 8;
                    if (index >= 0 && index < 12) {
                        ticketsByHour[index].count++;
                    }
                });

                const ticketsByType = SERVICES.map(service => ({
                    name: service.name,
                    value: allTickets.filter(t => t.service.id === service.id).length
                }));
                
                const waitTimes: { [key in ServiceId]?: number[] } = {};
                calledTickets.forEach(ct => {
                    const waitTime = (ct.calledAt.getTime() - ct.ticket.createdAt.getTime()) / 1000 / 60; // em minutos
                    if (!waitTimes[ct.ticket.service.id]) {
                        waitTimes[ct.ticket.service.id] = [];
                    }
                    waitTimes[ct.ticket.service.id]?.push(waitTime);
                });

                const averageWaitTime = SERVICES.map(service => {
                    const times = waitTimes[service.id] || [];
                    const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
                    return { name: service.name, time: Math.round(avg) };
                });

                resolve({
                    ticketsByHour,
                    ticketsByType,
                    averageWaitTime
                });
            }, 300);
        });
    }
};