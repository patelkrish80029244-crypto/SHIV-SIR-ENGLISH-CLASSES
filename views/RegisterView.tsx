
import React, { useState } from 'react';
import { Batch, AppState } from '../types';
import { ICONS } from '../constants';

interface RegisterViewProps {
  onSuccess: () => void;
  batches: Batch[];
  onNavigate: (view: 'LANDING' | 'LOGIN') => void;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onSuccess, batches, onNavigate, updateState }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    fatherName: '',
    batchId: batches[0]?.id || '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      updateState(prev => {
        if (prev.users.some(u => u.rollNumber === formData.rollNumber)) {
          setError('Roll Number already registered.');
          setIsSubmitting(false);
          return prev;
        }

        return {
          ...prev,
          users: [
            ...prev.users,
            {
              id: Math.random().toString(36).substr(2, 9),
              fullName: formData.fullName,
              rollNumber: formData.rollNumber,
              fatherName: formData.fatherName,
              batchId: formData.batchId,
              password: formData.password,
              role: 'STUDENT',
              status: 'PENDING',
              monthlyFee: 0,
              createdAt: Date.now()
            }
          ]
        };
      });
      
      if (!error) {
        setIsSubmitting(false);
        alert('Registration successful! Please wait for Admin approval before logging in.');
        onSuccess();
      }
    }, 800);
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

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-indigo-700 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Registration</h2>
            <p className="text-indigo-200 text-sm mt-1">Admission Form - Shiv Sir Classes</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="SSC-101"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Father's Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Mr. Smith"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Batch</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                  value={formData.batchId}
                  onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm border-l-4 border-red-500 rounded">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-700 text-white font-bold py-3 rounded-lg hover:bg-indigo-800 transition disabled:opacity-50 shadow-lg shadow-indigo-100 uppercase tracking-widest text-xs"
              >
                {isSubmitting ? 'Submitting...' : 'Register as Student'}
              </button>
            </form>

            <p className="mt-6 text-center text-slate-600 text-sm">
              Already a student?{' '}
              <button 
                onClick={() => onNavigate('LOGIN')}
                className="text-indigo-600 font-bold hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;
