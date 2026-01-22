import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    user_metadata: {
        full_name?: string;
    };
}

interface AuthContextType {
    session: any;
    user: User | null;
    isAuthenticated: boolean;
    login: (user: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Recovery of persisted session (Mock logic for now, Supabase later)
        const storedSession = localStorage.getItem('mockSession');
        if (storedSession) {
            try {
                setSession(JSON.parse(storedSession));
            } catch (e) {
                console.error('Failed to parse session', e);
                localStorage.removeItem('mockSession');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: any) => {
        const mockSession = {
            user: {
                id: 'mock-user-id',
                email: userData.email,
                user_metadata: {
                    full_name: userData.full_name
                }
            }
        };
        setSession(mockSession);
        localStorage.setItem('mockSession', JSON.stringify(mockSession));
    };

    const logout = () => {
        setSession(null);
        localStorage.removeItem('mockSession');
    };

    const value = {
        session,
        user: session?.user || null,
        isAuthenticated: !!session,
        login,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
