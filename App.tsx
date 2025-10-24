import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TicketProvider } from './context/TicketContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './hooks/useTheme';
import { ThemeName } from './themes';
import TotemPage from './pages/TotemPage';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TicketProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<TotemPage />} />
                <Route path="/display" element={<DisplayPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </TicketProvider>
    </ThemeProvider>
  );
};

const AppHeader: React.FC = () => {
  const location = useLocation();
  const hideHeaderOn = ['/display'];

  if (hideHeaderOn.includes(location.pathname)) {
    return null;
  }

  const getLinkClass = (path: string) => 
    location.pathname === path 
      ? 'text-white bg-brand-700 px-3 py-2 rounded-md text-sm font-medium' 
      : 'text-gray-300 hover:bg-brand-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium';

  return (
    <header className="bg-brand-900 shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white font-bold text-xl"><i className="fa-solid fa-ticket mr-2"></i>AtendeFácil</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className={getLinkClass('/')}>
              <i className="fa-solid fa-desktop mr-1"></i> Totem
            </Link>
            <Link to="/display" className={getLinkClass('/display')}>
              <i className="fa-solid fa-tv mr-1"></i> Painel
            </Link>
            <Link to="/admin" className={getLinkClass('/admin')}>
              <i className="fa-solid fa-user-tie mr-1"></i> Admin
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
};

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:bg-brand-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
        aria-label="Alterar tema"
      >
        <i className="fa-solid fa-palette"></i>
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {Object.entries(availableThemes).map(([key, value]) => (
               <button
                key={key}
                onClick={() => {
                  setTheme(key as ThemeName);
                  setIsOpen(false);
                }}
                className={`${
                  theme === key ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'
                } flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700`}
                role="menuitem"
              >
                <span className="inline-block w-4 h-4 rounded-full mr-3 border border-gray-400" style={{ backgroundColor: value.colors['500'] }}></span>
                {value.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default App;