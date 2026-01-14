import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Monitor } from './pages/Monitor';
import { UserManagement } from './pages/UserManagement';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Navigation } from './components/Navigation';

type View = 'login' | 'dashboard' | 'incident' | 'users' | 'alerts' | 'reports';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for "persisted" mock session
    const storedSession = localStorage.getItem('mockSession');
    if (storedSession) {
      setSession(JSON.parse(storedSession));
      setCurrentView('dashboard');
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: any) => {
    const mockSession = {
      user: {
        id: 'mock-user-id',
        email: user.email,
        user_metadata: {
          full_name: user.full_name
        }
      }
    };
    setSession(mockSession);
    localStorage.setItem('mockSession', JSON.stringify(mockSession));
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    setSession(null);
    localStorage.removeItem('mockSession');
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div className="h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background-dark overflow-hidden">
      {/* Sidebar / Bottom Nav Wrapper */}
      <Navigation currentView={currentView} setView={setCurrentView} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0">
        {currentView === 'dashboard' && <Dashboard onOpenIncident={() => setCurrentView('incident')} session={session} />}
        {currentView === 'incident' && <Monitor onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'users' && <UserManagement />}
        {currentView === 'alerts' && <Alerts />}
        {currentView === 'reports' && <Reports />}
      </main>
    </div>
  );
};

export default App;
