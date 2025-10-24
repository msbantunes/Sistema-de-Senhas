import React, { useState, useEffect } from 'react';
import { useTicketSystem } from '../hooks/useTicketSystem';
import { Ticket, ServiceId, ReportData } from '../types';
import { SERVICES } from '../constants';

const AdminPage: React.FC = () => {
    const { tickets, calledTickets, callNextTicket, getReportData, resetSystem, isLoading } = useTicketSystem();
    const [deskNumber, setDeskNumber] = useState(1);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(true);
    const [isCalling, setIsCalling] = useState(false);

    const handleCallNext = async () => {
        if (!deskNumber || deskNumber < 1) {
            alert('Por favor, insira um número de guichê válido.');
            return;
        }
        setIsCalling(true);
        try {
            await callNextTicket(deskNumber);
        } catch (error) {
            alert('Não há senhas para chamar.');
        } finally {
            setIsCalling(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm('Tem certeza que deseja reiniciar o sistema? Todas as senhas e contadores serão perdidos.')) {
            await resetSystem();
        }
    }
    
    useEffect(() => {
        setIsLoadingReport(true);
        getReportData().then(data => {
            setReportData(data);
            setIsLoadingReport(false);
        }).catch(err => {
            console.error("Failed to load report data:", err);
            setIsLoadingReport(false);
        });
    }, [tickets, calledTickets, getReportData]);

    const waitingTicketsByService = (serviceId: ServiceId) => {
        return tickets.filter(t => t.service.id === serviceId);
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                 <div className="flex items-center space-x-4 text-2xl text-gray-600 dark:text-gray-300">
                    <i className="fa-solid fa-spinner fa-spin text-4xl"></i>
                    <span>Carregando dados do sistema...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Painel Administrativo</h1>

                {/* Call Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Chamar Próxima Senha</h2>
                    <div className="flex items-center space-x-4">
                        <label htmlFor="desk" className="text-lg font-medium text-gray-600 dark:text-gray-300">Guichê:</label>
                        <input
                            type="number"
                            id="desk"
                            value={deskNumber}
                            onChange={(e) => setDeskNumber(parseInt(e.target.value, 10))}
                            min="1"
                            className="w-24 p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button 
                            onClick={handleCallNext} 
                            disabled={isCalling}
                            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 text-lg disabled:bg-brand-400 disabled:cursor-not-allowed"
                        >
                            {isCalling ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-bullhorn mr-2"></i>}
                             {isCalling ? 'Chamando...' : 'Chamar'}
                        </button>
                    </div>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        O sistema chamará a senha prioritária primeiro. Se não houver, chamará a mais antiga.
                    </p>
                </div>

                {/* Ticket Queues */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                   {SERVICES.map(service => (
                       <TicketQueue key={service.id} title={service.name} tickets={waitingTicketsByService(service.id)} color={service.color} />
                   ))}
                </div>
                
                {/* Reports */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Relatórios</h2>
                    {isLoadingReport ? <p className="text-gray-500 dark:text-gray-400">Carregando relatórios...</p> : reportData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ReportCard title="Senhas por Tipo">
                                <ul>
                                    {reportData.ticketsByType.map(item => (
                                        <li key={item.name} className="flex justify-between py-1">
                                            <span>{item.name}:</span>
                                            <span className="font-bold">{item.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </ReportCard>
                            <ReportCard title="Tempo Médio de Espera (min)">
                                <ul>
                                     {reportData.averageWaitTime.map(item => (
                                        <li key={item.name} className="flex justify-between py-1">
                                            <span>{item.name}:</span>
                                            <span className="font-bold">{item.time}</span>
                                        </li>
                                    ))}
                                </ul>
                            </ReportCard>
                             <ReportCard title="Senhas por Hora (8h-19h)">
                                <div className="text-sm">
                                    {reportData.ticketsByHour.map(item => (
                                        <div key={item.hour} className="flex justify-between items-center mb-1">
                                            <span className="w-12">{item.hour}</span>
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, item.count * 10)}%` }}></div>
                                            </div>
                                            <span className="font-bold w-6 text-right">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </ReportCard>
                        </div>
                    )}
                </div>

                {/* System Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Ações do Sistema</h2>
                     <button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                        <i className="fa-solid fa-power-off mr-2"></i> Reiniciar Sistema
                    </button>
                </div>
            </div>
        </div>
    );
};


interface TicketQueueProps {
    title: string;
    tickets: Ticket[];
    color: string;
}

const TicketQueue: React.FC<TicketQueueProps> = ({ title, tickets, color }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
            <h3 className={`text-xl font-semibold p-4 text-white ${color}`}>{title}</h3>
            <div className="p-4 h-64 overflow-y-auto flex-grow">
                {tickets.length > 0 ? (
                    <ul className="space-y-2">
                        {tickets.map(ticket => (
                            <li key={ticket.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{ticket.fullTicketNumber}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{ticket.createdAt.toLocaleTimeString('pt-BR')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400 text-center">Nenhuma senha aguardando.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReportCard: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">{title}</h4>
            <div className="text-gray-600 dark:text-gray-300">
                {children}
            </div>
        </div>
    )
}

export default AdminPage;