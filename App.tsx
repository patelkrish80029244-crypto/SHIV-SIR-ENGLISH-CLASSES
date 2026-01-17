
import React, { useState, useEffect } from 'react';
import { User, Batch, Homework, Announcement, AppState } from './types';
import { INITIAL_BATCHES, ADMIN_CREDENTIALS } from './constants';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import StudentDashboard from './views/StudentDashboard';
import AdminDashboard from './views/AdminDashboard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('shiv_sir_app_state_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, currentUser: null }; 
    }
    return {
      users: [],
      batches: INITIAL_BATCHES,
      homework: [],
      homeworkCompletions: [],
      announcements: [],
      attendance: [],
      bills: [],
      paymentSettings: {
        qrCode: '',
        upiId: 'thegurukul@upi',
        phone: '9876543210'
      },
      currentUser: null,
    };
  });

  const [view, setView] = useState<'LANDING' | 'LOGIN' | 'REGISTER' | 'DASHBOARD'>('LANDING');

  useEffect(() => {
    localStorage.setItem('shiv_sir_app_state_v4', JSON.stringify(state));
  }, [state]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    setView('LANDING');
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(updater);
  };

  const renderView = () => {
    switch (view) {
      case 'LANDING':
        return <LandingView onNavigate={setView} />;
      case 'LOGIN':
        return (
          <LoginView 
            onSuccess={handleLogin} 
            users={state.users} 
            onNavigate={setView} 
          />
        );
      case 'REGISTER':
        return (
          <RegisterView 
            onSuccess={() => setView('LOGIN')} 
            batches={state.batches} 
            onNavigate={setView}
            updateState={updateState}
          />
        );
      case 'DASHBOARD':
        if (!state.currentUser) {
          setView('LOGIN');
          return null;
        }
        return state.currentUser.role === 'ADMIN' || state.currentUser.role === 'TEACHER' ? (
          <AdminDashboard 
            state={state} 
            updateState={updateState} 
            onLogout={handleLogout} 
          />
        ) : (
          <StudentDashboard 
            state={state} 
            updateState={updateState}
            onLogout={handleLogout} 
          />
        );
      default:
        return <LandingView onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      {renderView()}
    </div>
  );
};

export default App;
