
import { useContext } from 'react';
import { TicketContext } from '../context/TicketContext';

export const useTicketSystem = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicketSystem must be used within a TicketProvider');
  }
  return context;
};
