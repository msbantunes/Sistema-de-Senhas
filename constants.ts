import { Service, ServiceId } from './types';

export const SERVICES: Service[] = [
  { 
    id: ServiceId.General, 
    name: 'Atendimento Geral', 
    prefix: 'G', 
    color: 'bg-blue-500', 
    icon: 'fa-solid fa-user',
    subServices: [
      { id: 'info', name: 'Informações', icon: 'fa-solid fa-circle-info', prefix: 'GI' },
      { id: 'schedule', name: 'Agendamentos', icon: 'fa-solid fa-calendar-days', prefix: 'GA' },
      { id: 'payment', name: 'Pagamentos', icon: 'fa-solid fa-cash-register', prefix: 'GP' },
      { id: 'other', name: 'Outros Assuntos', icon: 'fa-solid fa-ellipsis', prefix: 'GO' },
    ]
  },
  { id: ServiceId.Priority, name: 'Atendimento Prioritário', prefix: 'P', color: 'bg-red-500', icon: 'fa-solid fa-wheelchair' },
  { id: ServiceId.Exams, name: 'Resultados de Exames', prefix: 'E', color: 'bg-green-500', icon: 'fa-solid fa-vial' },
];