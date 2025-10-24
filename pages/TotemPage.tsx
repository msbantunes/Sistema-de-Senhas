import React, { useState } from 'react';
import { useTicketSystem } from '../hooks/useTicketSystem';
import { SERVICES } from '../constants';
import { Ticket, Service, SubService } from '../types';

const TotemPage: React.FC = () => {
  const { generateTicket } = useTicketSystem();
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleServiceClick = async (service: Service) => {
    if (service.subServices && service.subServices.length > 0) {
      setSelectedService(service);
    } else {
      setIsGenerating(true);
      const newTicket = await generateTicket(service.id);
      setGeneratedTicket(newTicket);
      setIsGenerating(false);
    }
  };
  
  const handleSubServiceClick = async (parentService: Service, subService: SubService) => {
    setIsGenerating(true);
    const newTicket = await generateTicket(parentService.id, subService);
    setGeneratedTicket(newTicket);
    setIsGenerating(false);
  };

  const handleReset = () => {
    setGeneratedTicket(null);
    setSelectedService(null);
  };

  const handleBack = () => {
    setSelectedService(null);
  };

  if (isGenerating) {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="flex items-center space-x-4 text-2xl text-gray-600 dark:text-gray-300">
                <i className="fa-solid fa-spinner fa-spin text-4xl"></i>
                <span>Gerando sua senha...</span>
            </div>
        </div>
    );
  }

  if (generatedTicket) {
    return <GeneratedTicketView ticket={generatedTicket} onReset={handleReset} />;
  }
  
  if (selectedService) {
    return <SubServiceSelectionView service={selectedService} onSelect={handleSubServiceClick} onBack={handleBack} />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-brand-800 dark:text-brand-300 mb-4">Bem-vindo!</h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12">Para iniciar seu atendimento, selecione o serviço desejado.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <ServiceButton key={service.id} service={service} onClick={() => handleServiceClick(service)} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ServiceButtonProps {
    service: Service;
    onClick: () => void;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({ service, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center justify-center p-8 md:p-12 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white ${service.color} focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:${service.color.replace('bg-', 'ring-')}`}
  >
    <i className={`${service.icon} text-5xl md:text-7xl mb-4 transition-transform duration-300 group-hover:scale-110`}></i>
    <span className="text-xl md:text-3xl font-semibold text-center">{service.name}</span>
  </button>
);


interface SubServiceSelectionViewProps {
  service: Service;
  onSelect: (parentService: Service, subService: SubService) => void;
  onBack: () => void;
}

const SubServiceSelectionView: React.FC<SubServiceSelectionViewProps> = ({ service, onSelect, onBack }) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 animate-slide-in-fwd-center">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-800 dark:text-brand-300 mb-4">{service.name}</h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12">Selecione o assunto específico.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {service.subServices?.map((sub) => (
            <SubServiceButton key={sub.id} subService={sub} serviceColor={service.color} onClick={() => onSelect(service, sub)} />
          ))}
        </div>
        <button onClick={onBack} className="mt-12 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-lg">
            <i className="fa-solid fa-arrow-left mr-2"></i> Voltar
        </button>
      </div>
    </div>
  );
};

interface SubServiceButtonProps {
    subService: SubService;
    serviceColor: string;
    onClick: () => void;
}

const SubServiceButton: React.FC<SubServiceButtonProps> = ({ subService, serviceColor, onClick }) => (
    <button
    onClick={onClick}
    className={`group flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white ${serviceColor} focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:${serviceColor.replace('bg-', 'ring-')}`}
    >
        <i className={`${subService.icon} text-4xl md:text-5xl mb-3 transition-transform duration-300 group-hover:scale-110`}></i>
        <span className="text-lg md:text-xl font-semibold text-center">{subService.name}</span>
    </button>
);


interface GeneratedTicketViewProps {
    ticket: Ticket;
    onReset: () => void;
}

const GeneratedTicketView: React.FC<GeneratedTicketViewProps> = ({ ticket, onReset }) => {
    
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onReset();
        }, 8000);
        return () => clearTimeout(timer);
    }, [onReset]);
    
    const displayName = ticket.subService?.name ?? ticket.service.name;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 animate-slide-in-fwd-center">
            <div className="bg-white dark:bg-gray-800 p-10 md:p-16 rounded-3xl shadow-2xl border-4 border-dashed border-brand-500 text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-700 dark:text-gray-300 mb-2">Sua senha é:</h2>
                <p className={`text-8xl md:text-9xl font-black text-brand-500 mb-4`}>{ticket.fullTicketNumber}</p>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium mb-8">{displayName}</p>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-500">Por favor, aguarde ser chamado no painel.</p>
                <button onClick={onReset} className="mt-8 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                    <i className="fa-solid fa-check mr-2"></i> OK
                </button>
            </div>
        </div>
    );
}

export default TotemPage;