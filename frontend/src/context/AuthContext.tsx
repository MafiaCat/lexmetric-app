import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    originalAdminUser: User | null; // Keeps track of the admin if they are impersonating
    login: (user: User) => void;
    logout: () => void;
    impersonate: (targetUser: User) => void;
    stopImpersonating: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(null);

    useEffect(() => {
        // Load user from localStorage on mount
        const storedUser = localStorage.getItem('lexmetric_auth_user');
        const storedAdmin = localStorage.getItem('lexmetric_admin_user');

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
            }
        }

        if (storedAdmin) {
            try {
                setOriginalAdminUser(JSON.parse(storedAdmin));
            } catch (e) {
                console.error("Failed to parse admin from local storage", e);
            }
        }
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('lexmetric_auth_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        setOriginalAdminUser(null);
        localStorage.removeItem('lexmetric_auth_user');
        localStorage.removeItem('lexmetric_admin_user');
    };

    const impersonate = (targetUser: User) => {
        // Only an admin can impersonate
        if (user && user.role === 'admin') {
            setOriginalAdminUser(user);
            localStorage.setItem('lexmetric_admin_user', JSON.stringify(user));

            setUser(targetUser);
            localStorage.setItem('lexmetric_auth_user', JSON.stringify(targetUser));
        }
    };

    const stopImpersonating = () => {
        if (originalAdminUser) {
            setUser(originalAdminUser);
            localStorage.setItem('lexmetric_auth_user', JSON.stringify(originalAdminUser));

            setOriginalAdminUser(null);
            localStorage.removeItem('lexmetric_admin_user');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            originalAdminUser,
            login,
            logout,
            impersonate,
            stopImpersonating,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
