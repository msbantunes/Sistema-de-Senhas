import { Ticket, CalledTicket, ReportData, ServiceId } from '../types';
import { SERVICES } from '../constants';

// This is a mock API service. In a real application, these functions
// would make network requests to a backend.

export const api = {
  fetchReportData: (tickets: Ticket[], calledTickets: CalledTicket[]): Promise<ReportData> => {
    return new Promise((resolve) => {
      // Simulate async operation
      setTimeout(() => {
        const allTickets = [...tickets, ...calledTickets.map(ct => ct.ticket)];

        // Tickets by hour (from 8am to 7pm)
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

        // Tickets by type
        const ticketsByType = SERVICES.map(service => ({
          name: service.name,
          value: allTickets.filter(t => t.service.id === service.id).length
        }));

        // Average wait time
        const waitTimes: { [key in ServiceId]?: number[] } = {};
        calledTickets.forEach(ct => {
          const waitTime = (ct.calledAt.getTime() - ct.ticket.createdAt.getTime()) / 1000 / 60; // in minutes
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
