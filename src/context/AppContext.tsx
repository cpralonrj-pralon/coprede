import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewType = 'login' | 'dashboard' | 'incident' | 'users' | 'alerts' | 'reports';

interface AppContextType {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    toggleTheme: () => void;
    isDarkMode: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(true); // Default dark

    const setView = (view: ViewType) => {
        setCurrentView(view);
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
        // Implement actual DOM class toggling if needed
    };

    return (
        <AppContext.Provider value={{ currentView, setView, toggleTheme, isDarkMode }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
