
import React from 'react';
import { ICONS } from '../constants';

interface LandingViewProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 flex flex-col justify-center items-center p-6 text-white text-center">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full">
        <div className="mb-8 flex justify-center">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <ICONS.GraduationCap className="w-16 h-16 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          SHIV SIR <br /> <span className="text-blue-400">ENGLISH CLASSES</span>
        </h1>
        <p className="text-slate-300 text-lg mb-10 max-w-md mx-auto">
          Simplifying coaching management. Secure registration, real-time updates, and batch management all in one place.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-slate-100 transition shadow-lg flex items-center justify-center gap-2 group"
          >
            Login Access
            <ICONS.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onNavigate('REGISTER')}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 border border-indigo-400 transition shadow-lg flex items-center justify-center gap-2"
          >
            Student Registration
          </button>
        </div>
        
        <div className="mt-12 text-slate-400 text-sm flex items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <span className="font-bold text-white text-xl">100%</span>
            <span>Online</span>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-white text-xl">Realtime</span>
            <span>Updates</span>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-white text-xl">Secure</span>
            <span>Access</span>
          </div>
        </div>
      </div>
      
      <footer className="mt-10 text-slate-500 text-sm font-bold tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Shiv Sir English Classes. DESIGNED BY KRISHNA
      </footer>
    </div>
  );
};

export default LandingView;
