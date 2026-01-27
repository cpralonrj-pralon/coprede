import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Monitor } from './pages/Monitor';
import { UserManagement } from './pages/UserManagement';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Indicators } from './pages/Indicators';
import { Recurrence } from './pages/Recurrence';

const MainLayout: React.FC = () => {
  const { isAuthenticated, login, loading } = useAuth();
  const { currentView, setView } = useApp();

  if (loading) {
    return (
      <div className="h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background-dark overflow-hidden">
      {/* Sidebar / Bottom Nav Wrapper */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'incident' && <Monitor onBack={() => setView('dashboard')} />}
        {currentView === 'indicators' && <Indicators />}
        {currentView === 'recurrence' && <Recurrence />}
        {currentView === 'users' && <UserManagement />}
        {currentView === 'alerts' && <Alerts />}
        {currentView === 'reports' && <Reports />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
