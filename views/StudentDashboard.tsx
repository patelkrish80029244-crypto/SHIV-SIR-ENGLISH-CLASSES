
import React, { useState } from 'react';
import { AppState, DemandBill } from '../types';
import { ICONS } from '../constants';

interface StudentDashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ state, updateState, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'HOMEWORK' | 'FEES' | 'ATTENDANCE'>('HOMEWORK');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  const user = state.currentUser!;
  const currentBatch = state.batches.find(b => b.id === user.batchId);
  const myBills = state.bills.filter(b => b.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  const myAttendance = state.attendance.filter(r => r.userId === user.id).sort((a, b) => b.date.localeCompare(a.date));
  const myHomework = state.homework.filter(h => h.batchId === user.batchId).sort((a, b) => b.createdAt - a.createdAt);

  const handleConfirmHomework = (hwId: string) => {
    const alreadyCompleted = state.homeworkCompletions.some(
      c => c.homeworkId === hwId && c.userId === user.id
    );
    
    if (alreadyCompleted) return;

    if (window.confirm("Confirm that you have completed this homework assignment?")) {
      updateState(prev => {
        const exists = prev.homeworkCompletions.some(
          c => c.homeworkId === hwId && c.userId === user.id
        );
        if (exists) return prev;

        return {
          ...prev,
          homeworkCompletions: [
            ...prev.homeworkCompletions,
            { homeworkId: hwId, userId: user.id, completedAt: Date.now() }
          ]
        };
      });
      alert("Status updated: Homework Marked as Completed!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullScreenImage(null)}
        >
          <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full">
            <ICONS.X className="w-6 h-6" />
          </button>
          <img src={fullScreenImage} className="max-w-full max-h-full object-contain rounded-xl" alt="Fullscreen" />
        </div>
      )}

      <header className="bg-slate-900 text-white h-20 md:h-24 flex items-center justify-between px-5 md:px-8 sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl"><ICONS.GraduationCap className="w-5 h-5 md:w-7 md:h-7"/></div>
          <h2 className="font-black text-xl md:text-2xl tracking-tighter uppercase">Gurukul</h2>
        </div>
        <button onClick={onLogout} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5"><ICONS.LogOut className="w-5 h-5"/></button>
      </header>

      <main className="max-w-7xl w-full mx-auto p-4 md:p-10 flex flex-col lg:flex-row gap-6 md:gap-10 pb-20">
        <aside className="w-full lg:w-80 shrink-0">
           <div className="bg-white rounded-[30px] border border-slate-200 shadow-xl overflow-hidden">
             <div className="h-20 md:h-32 bg-indigo-600"></div>
             <div className="px-6 pb-8 -mt-10 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl border-4 border-slate-50 mx-auto flex items-center justify-center text-3xl font-black text-indigo-600 shadow-xl mb-4">
                  {user.fullName.charAt(0)}
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{user.fullName}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{currentBatch?.name}</p>
                <div className="mt-6 space-y-4 pt-6 border-t border-slate-100">
                  <InfoRow label="ID" value={user.rollNumber || '-'} />
                  <InfoRow label="Guardian" value={user.fatherName || '-'} />
                  <InfoRow label="Time" value={currentBatch?.timing || '-'} />
                </div>
             </div>
           </div>
        </aside>

        <div className="flex-1 space-y-8">
           <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm gap-1 overflow-x-auto">
             <TabBtn active={activeTab === 'HOMEWORK'} onClick={() => setActiveTab('HOMEWORK')} icon={<ICONS.BookOpen className="w-4 h-4"/>} label="HW" count={myHomework.length} />
             <TabBtn active={activeTab === 'ATTENDANCE'} onClick={() => setActiveTab('ATTENDANCE')} icon={<ICONS.Calendar className="w-4 h-4"/>} label="Logs" />
             <TabBtn active={activeTab === 'FEES'} onClick={() => setActiveTab('FEES')} icon={<ICONS.CreditCard className="w-4 h-4"/>} label="Fees" count={myBills.filter(b => b.status === 'UNPAID').length} />
           </div>

           {activeTab === 'HOMEWORK' && (
             <div className="space-y-4">
                {myHomework.map(h => {
                  const isDone = state.homeworkCompletions.some(c => c.homeworkId === h.id && c.userId === user.id);
                  return (
                    <div key={h.id} className="bg-white rounded-[30px] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                      {h.imageUrl && (
                        <div className="w-full h-44 cursor-pointer" onClick={() => setFullScreenImage(h.imageUrl || null)}>
                          <img src={h.imageUrl} className="w-full h-full object-cover" alt="homework task" />
                        </div>
                      )}
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight">{h.title}</h4>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{h.date}</span>
                        </div>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">{h.content}</p>
                        {isDone ? (
                          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-center justify-center gap-2">
                            <ICONS.Check className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Completed</span>
                          </div>
                        ) : (
                          <button onClick={() => handleConfirmHomework(h.id)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black uppercase text-[10px]">Tap to Confirm Completion</button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {myHomework.length === 0 && <EmptyState msg="No homework" />}
             </div>
           )}

           {activeTab === 'ATTENDANCE' && (
             <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                   <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Timeline</h4>
                   <div className="flex gap-2 text-[9px] font-black uppercase text-slate-400">
                      <span className="text-green-500">P</span>
                      <span className="text-red-500">A</span>
                      <span className="text-amber-500">H</span>
                   </div>
                </div>
                <div className="divide-y divide-slate-100">
                   {myAttendance.map(record => (
                     <div key={record.id} className="p-5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs ${record.status === 'PRESENT' ? 'bg-green-500' : record.status === 'ABSENT' ? 'bg-red-500' : 'bg-amber-500'}`}>{record.status.charAt(0)}</div>
                         <div>
                           <p className="font-black text-slate-800 text-xs uppercase">{new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                         </div>
                       </div>
                       <span className="text-[8px] font-black text-slate-400 uppercase border px-2 py-1 rounded-full">VERIFIED</span>
                     </div>
                   ))}
                </div>
                {myAttendance.length === 0 && <EmptyState msg="No logs" />}
             </div>
           )}

           {activeTab === 'FEES' && (
             <div className="space-y-6">
                {myBills.map(bill => (
                  <div key={bill.id} className={`p-6 rounded-[30px] border shadow-sm ${bill.status === 'UNPAID' ? 'bg-indigo-50 border-indigo-100' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{bill.month} {bill.year}</p>
                        <h5 className="text-2xl font-black text-slate-900 tracking-tighter">₹{bill.amount}</h5>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${bill.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{bill.status}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200/50 flex justify-between items-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Due: {bill.dueDate}</p>
                      {bill.status === 'UNPAID' && <span className="text-[8px] font-black text-indigo-400 uppercase italic">Verification Pending</span>}
                    </div>
                  </div>
                ))}

                <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl">
                   <h4 className="text-xl font-black mb-1 uppercase tracking-tighter">Pay Fees</h4>
                   <p className="text-[9px] text-slate-400 mb-6 uppercase tracking-widest">Scan QR to pay</p>
                   <div className="bg-white p-6 rounded-[24px] aspect-square flex items-center justify-center mb-6 shadow-xl overflow-hidden">
                      {state.paymentSettings.qrCode ? <img src={state.paymentSettings.qrCode} className="w-full h-full object-contain" alt="QR" /> : <ICONS.CreditCard className="w-12 h-12 opacity-10 text-slate-900"/>}
                   </div>
                   <div className="space-y-3 bg-white/5 p-4 rounded-2xl text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-500 uppercase font-black">UPI ID</span><span className="font-black text-indigo-400">{state.paymentSettings.upiId}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 uppercase font-black">PHONE</span><span className="font-black text-indigo-400">{state.paymentSettings.phone}</span></div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-[10px]">
    <span className="font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="font-black text-slate-700 uppercase">{value}</span>
  </div>
);

const TabBtn = ({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 rounded-xl transition font-black text-[10px] uppercase tracking-widest ${active ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>
    {icon}
    <span>{label}</span>
    {count !== undefined && count > 0 && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">{count}</span>}
  </button>
);

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="bg-white p-10 rounded-[30px] border border-slate-200 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">{msg}</div>
);

export default StudentDashboard;
