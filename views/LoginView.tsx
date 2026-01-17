
import React, { useState } from 'react';
import { User } from '../types';
import { ADMIN_CREDENTIALS, ICONS } from '../constants';

interface LoginViewProps {
  onSuccess: (user: User) => void;
  users: User[];
  onNavigate: (view: 'LANDING' | 'REGISTER') => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onSuccess, users, onNavigate }) => {
  const [role, setRole] = useState<'ADMIN' | 'STUDENT'>('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Strict Trimming
    const inputId = identifier.trim();
    const inputPass = password.trim();

    if (role === 'ADMIN') {
      // Direct comparison with strict constants
      const isIdCorrect = inputId.toUpperCase() === ADMIN_CREDENTIALS.id.toUpperCase();
      const isPassCorrect = inputPass === ADMIN_CREDENTIALS.password;

      if (isIdCorrect && isPassCorrect) {
        onSuccess({
          id: 'ADMIN',
          fullName: 'Shiv Sir (Admin)',
          role: 'ADMIN',
          status: 'APPROVED',
          monthlyFee: 0,
          createdAt: Date.now()
        });
      } else {
        setError(`Access Denied! ID/Pass Incorrect. Hint: ID is '${ADMIN_CREDENTIALS.id}'`);
      }
    } else {
      const student = users.find(u => 
        (u.fullName.toLowerCase() === inputId.toLowerCase() || u.rollNumber?.toUpperCase() === inputId.toUpperCase()) && 
        u.password === inputPass
      );
      
      if (student) {
        if (student.status === 'APPROVED') {
          onSuccess(student);
        } else if (student.status === 'PENDING') {
          setError('Account pending approval. Please contact Shiv Sir.');
        } else {
          setError('Application rejected.');
        }
      } else {
        setError('Incorrect details or account doesn\'t exist.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <button 
          onClick={() => onNavigate('LANDING')}
          className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 transition font-medium"
        >
          <ICONS.ArrowRight className="w-5 h-5 rotate-180 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 p-8 text-white text-center">
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">GURUKUL LOGIN</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Authorized Access Only</p>
          </div>

          <div className="p-10">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
              <button 
                type="button"
                className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${role === 'STUDENT' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
                onClick={() => { setRole('STUDENT'); setError(''); }}
              >
                Student
              </button>
              <button 
                type="button"
                className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${role === 'ADMIN' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
                onClick={() => { setRole('ADMIN'); setError(''); }}
              >
                Teacher
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  {role === 'ADMIN' ? 'Teacher ID' : 'Roll No. / Name'}
                </label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-slate-800"
                  placeholder={role === 'ADMIN' ? 'THE GURUKUL' : 'e.g. SSC-101'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-slate-800"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-xl">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-indigo-600 transition shadow-2xl active:scale-95"
              >
                ACCESS PORTAL
              </button>
            </form>

            {role === 'STUDENT' && (
              <p className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                New student?{' '}
                <button 
                  onClick={() => onNavigate('REGISTER')}
                  className="text-indigo-600 hover:underline"
                >
                  Apply Here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
