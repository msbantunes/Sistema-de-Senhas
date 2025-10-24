export enum ServiceId {
  General = 'general',
  Priority = 'priority',
  Exams = 'exams',
}

export interface SubService {
  id: string;
  name: string;
  icon: string;
  prefix: string;
}

export interface Service {
  id: ServiceId;
  name: string;
  prefix: string;
  color: string;
  icon: string;
  subServices?: SubService[];
}

export interface Ticket {
  id: string;
  number: number;
  fullTicketNumber: string;
  service: Service;
  subService?: SubService;
  createdAt: Date;
}

export interface CalledTicket {
  ticket: Ticket;
  desk: number;
  calledAt: Date;
}

export interface ReportData {
    ticketsByHour: { hour: string; count: number }[];
    ticketsByType: { name: string; value: number }[];
    averageWaitTime: { name: string; time: number }[];
}