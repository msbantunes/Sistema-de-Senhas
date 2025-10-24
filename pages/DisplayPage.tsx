
import React, { useEffect, useRef } from 'react';
import { useTicketSystem } from '../hooks/useTicketSystem';
import { CalledTicket } from '../types';

const DisplayPage: React.FC = () => {
  const { calledTickets } = useTicketSystem();
  const lastCalledTicket = calledTickets.length > 0 ? calledTickets[0] : null;
  const previousTickets = calledTickets.slice(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play a sound when a new ticket is called
    if (calledTickets.length > 0) {
      if (!audioRef.current) {
         audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      }
      audioRef.current.play().catch(error => console.log("Audio playback failed:", error));
    }
  }, [calledTickets]);


  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden">
        <header className="bg-black bg-opacity-20 p-4 shadow-lg">
            <h1 className="text-5xl font-bold text-center text-brand-300">Painel de Atendimento</h1>
        </header>
        
        <div className="flex-grow grid grid-cols-3 grid-rows-4 gap-4 p-4">
            <div className="col-span-3 row-span-2 md:col-span-2 md:row-span-4 rounded-lg bg-gray-800 flex items-center justify-center p-4">
                {lastCalledTicket ? (
                    <LastCalledTicketView key={lastCalledTicket.ticket.id} ticket={lastCalledTicket} />
                ) : (
                    <div className="text-center">
                        <p className="text-4xl text-gray-500">Aguardando chamadas...</p>
                    </div>
                )}
            </div>
            
            <div className="col-span-3 row-span-2 md:col-span-1 md:row-span-4 rounded-lg bg-gray-800 flex flex-col p-4">
                <h2 className="text-3xl font-semibold border-b-2 border-brand-500 pb-2 mb-4 text-center">Últimas Chamadas</h2>
                <div className="flex-grow flex flex-col space-y-4 overflow-y-auto">
                    {previousTickets.length > 0 ? previousTickets.map(t => (
                        <PreviousTicketView key={t.ticket.id} ticket={t} />
                    )) : (
                        <div className="flex-grow flex items-center justify-center">
                             <p className="text-xl text-gray-500">Nenhuma chamada anterior.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <footer className="bg-black bg-opacity-20 p-2 text-center text-lg">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {new Date().toLocaleTimeString('pt-BR')}
        </footer>
    </div>
  );
};

const LastCalledTicketView: React.FC<{ ticket: CalledTicket }> = ({ ticket }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-brand-600 rounded-lg p-8 animate-slide-in-fwd-center animate-ping-slow">
            <span className="text-5xl font-semibold text-white mb-6">SENHA</span>
            <span className="text-9xl lg:text-[12rem] font-black text-white leading-none">{ticket.ticket.fullTicketNumber}</span>
            <div className="w-full border-t-4 border-dashed border-white my-8"></div>
            <span className="text-5xl font-semibold text-white mb-6">GUICHÊ</span>
            <span className="text-9xl lg:text-[10rem] font-black text-white leading-none">{String(ticket.desk).padStart(2, '0')}</span>
        </div>
    )
}

const PreviousTicketView: React.FC<{ ticket: CalledTicket }> = ({ ticket }) => {
    return (
        <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
            <span className="text-4xl font-bold text-brand-300">{ticket.ticket.fullTicketNumber}</span>
            <div className="flex items-center text-2xl">
                 <i className="fa-solid fa-desktop mr-3 text-gray-400"></i>
                <span className="font-semibold">{String(ticket.desk).padStart(2, '0')}</span>
            </div>
        </div>
    )
}

export default DisplayPage;
