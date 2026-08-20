import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_ADMIN = {
  id: 'usr-1',
  name: 'Allen',
  email: 'admin@admiresoftech.com',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  title: 'Founder & Chief Executive Officer',
  lastLogin: '2026-08-20T12:00:00Z',
};

export const DEMO_ACCOUNTS = [
  {
    role: 'Super Admin',
    name: 'Allen',
    email: 'admin@admiresoftech.com',
    password: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    title: 'Founder & CEO',
  },
  {
    role: 'HR & Talent Lead',
    name: 'Priya Sharma',
    email: 'hr@admiresoftech.com',
    password: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    title: 'Head of People & Recruitment',
  },
  {
    role: 'Sales & Growth Director',
    name: 'David Miller',
    email: 'sales@admiresoftech.com',
    password: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    title: 'VP of Business Development',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('admire_admin_user');
      return savedUser ? JSON.parse(savedUser) : DEFAULT_ADMIN;
    } catch {
      return DEFAULT_ADMIN;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admire_admin_auth') !== 'false';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('admire_admin_user', JSON.stringify(user));
      localStorage.setItem('admire_admin_auth', 'true');
    } else {
      localStorage.removeItem('admire_admin_user');
      localStorage.setItem('admire_admin_auth', 'false');
    }
  }, [user]);

  const login = (email, password) => {
    const matchedAccount = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase()
    );

    if (matchedAccount) {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: matchedAccount.name,
        email: matchedAccount.email,
        role: matchedAccount.role,
        avatar: matchedAccount.avatar,
        title: matchedAccount.title,
        lastLogin: new Date().toISOString(),
      };
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true, user: newUser };
    }

    // Default fallback allow login
    const customUser = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: 'Administrator',
      lastLogin: new Date().toISOString(),
    };
    setUser(customUser);
    setIsAuthenticated(true);
    return { success: true, user: customUser };
  };

  const switchAccount = (demoAccount) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: demoAccount.name,
      email: demoAccount.email,
      role: demoAccount.role,
      avatar: demoAccount.avatar,
      title: demoAccount.title,
      lastLogin: new Date().toISOString(),
    };
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        switchAccount,
        demoAccounts: DEMO_ACCOUNTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
