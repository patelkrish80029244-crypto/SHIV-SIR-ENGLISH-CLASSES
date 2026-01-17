
import React, { useState, useMemo } from 'react';
import { AppState, Batch, User, DemandBill, Homework, AttendanceStatus, AttendanceRecord } from '../types';
import { ICONS, ADMIN_CREDENTIALS } from '../constants';

interface AdminDashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, updateState, onLogout }) => {
  const isAdmin = state.currentUser?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'STUDENTS' | 'BATCHES' | 'BILLING' | 'SETTINGS' | 'ATTENDANCE' | 'HOMEWORK'>('REQUESTS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(state.batches[0]?.id || '');
  
  const [hwSubTab, setHwSubTab] = useState<'POST' | 'VIEW'>('POST');
  const [hwBatch, setHwBatch] = useState(state.batches[0]?.id || '');
  const [hwTitle, setHwTitle] = useState('');
  const [hwContent, setHwContent] = useState('');
  const [hwImage, setHwImage] = useState('');

  const [attSubTab, setAttSubTab] = useState<'MARK' | 'REVIEW'>('MARK');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attBatch, setAttBatch] = useState(state.batches[0]?.id || '');
  const [attSearchQuery, setAttSearchQuery] = useState('');
  const [attFilterMonth, setAttFilterMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [attFilterYear, setAttFilterYear] = useState(new Date().getFullYear().toString());

  const [billMonth, setBillMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [billYear, setBillYear] = useState(new Date().getFullYear().toString());
  const [billFilter, setBillFilter] = useState({ batchId: '', feeAmount: '' });
  const [selectedStudentsForBill, setSelectedStudentsForBill] = useState<string[]>([]);

  const [newAdminId, setNewAdminId] = useState(ADMIN_CREDENTIALS.id);
  const [newAdminPass, setNewAdminPass] = useState(ADMIN_CREDENTIALS.password);

  const pendingUsers = state.users.filter(u => u.status === 'PENDING');
  const activeUsers = state.users.filter(u => u.status === 'APPROVED' && u.role === 'STUDENT');
  const filteredStudents = activeUsers.filter(u => !selectedBatchId || u.batchId === selectedBatchId);
  const attStudents = activeUsers.filter(u => u.batchId === attBatch);
  const teachers = state.users.filter(u => u.role === 'TEACHER');

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["2024", "2025", "2026"];

  const postHomework = (e: React.FormEvent) => {
    e.preventDefault();
    const newHw: Homework = {
      id: 'hw-' + Date.now(),
      batchId: hwBatch,
      title: hwTitle,
      content: hwContent,
      imageUrl: hwImage,
      date: new Date().toLocaleDateString(),
      createdAt: Date.now()
    };
    updateState(prev => ({ ...prev, homework: [newHw, ...prev.homework] }));
    setHwTitle(''); setHwContent(''); setHwImage('');
    setHwSubTab('VIEW');
    alert("Homework posted successfully!");
  };

  const markAttendance = (userId: string, status: AttendanceStatus, dateToMark: string) => {
    updateState(prev => {
      const otherRecords = prev.attendance.filter(r => !(r.userId === userId && r.date === dateToMark));
      return {
        ...prev,
        attendance: [...otherRecords, { 
          id: 'att-' + userId + dateToMark, 
          userId, 
          batchId: prev.users.find(u => u.id === userId)?.batchId || '', 
          date: dateToMark, 
          status,
          updatedAt: Date.now()
        }]
      };
    });
  };

  const reviewData = useMemo(() => {
    if (attSubTab !== 'REVIEW') return null;
    const matchingStudents = activeUsers.filter(u => 
      u.fullName.toLowerCase().includes(attSearchQuery.toLowerCase()) || 
      u.rollNumber?.toLowerCase().includes(attSearchQuery.toLowerCase())
    );

    return matchingStudents.map(student => {
      const studentRecords = state.attendance.filter(r => {
        const d = new Date(r.date);
        return r.userId === student.id && 
               d.toLocaleString('default', { month: 'long' }) === attFilterMonth && 
               d.getFullYear().toString() === attFilterYear;
      }).sort((a, b) => b.date.localeCompare(a.date));

      const stats = {
        PRESENT: studentRecords.filter(r => r.status === 'PRESENT').length,
        ABSENT: studentRecords.filter(r => r.status === 'ABSENT').length,
        HOLIDAY: studentRecords.filter(r => r.status === 'HOLIDAY').length
      };

      return { student, records: studentRecords, stats };
    });
  }, [activeUsers, attSearchQuery, attFilterMonth, attFilterYear, state.attendance, attSubTab]);

  const generateBills = () => {
    if (!isAdmin) return;
    const newBills: DemandBill[] = selectedStudentsForBill.map(sid => {
      const student = state.users.find(u => u.id === sid);
      return {
        id: 'bill-' + Math.random().toString(36).substr(2, 9),
        userId: sid,
        month: billMonth,
        year: billYear,
        amount: student?.monthlyFee || 0,
        dueDate: `10 ${billMonth} ${billYear}`,
        status: 'UNPAID',
        createdAt: Date.now()
      };
    });

    updateState(prev => ({ ...prev, bills: [...prev.bills, ...newBills] }));
    setSelectedStudentsForBill([]);
    alert(`Bills generated for ${billMonth} ${billYear}!`);
  };

  const toggleBillStatus = (billId: string) => {
    updateState(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === billId ? { ...b, status: b.status === 'PAID' ? 'UNPAID' : 'PAID' } : b)
    }));
  };

  const handleApprove = (userId: string) => {
    updateState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, status: 'APPROVED', monthlyFee: 350 } : u)
    }));
  };

  const navigateTo = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 relative">
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-xl transition">
            <ICONS.Menu className="w-6 h-6" />
          </button>
          <h2 className="font-black text-lg tracking-tighter uppercase">Gurukul</h2>
        </div>
        <div className="p-2 bg-indigo-600 rounded-lg">
          <ICONS.GraduationCap className="w-5 h-5 text-white" />
        </div>
      </header>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-slate-900 text-white z-[60] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:z-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-600 rounded-lg"><ICONS.GraduationCap className="w-6 h-6"/></div>
            <h2 className="font-black text-xl tracking-tighter uppercase">Gurukul</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-xl">
            <ICONS.X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarBtn active={activeTab === 'REQUESTS'} onClick={() => navigateTo('REQUESTS')} icon={<ICONS.Check/>} label="Pending" count={pendingUsers.length} />
          <SidebarBtn active={activeTab === 'STUDENTS'} onClick={() => navigateTo('STUDENTS')} icon={<ICONS.Users/>} label="Students" />
          <SidebarBtn active={activeTab === 'BATCHES'} onClick={() => navigateTo('BATCHES')} icon={<ICONS.BookOpen/>} label="Batches" />
          <SidebarBtn active={activeTab === 'HOMEWORK'} onClick={() => navigateTo('HOMEWORK')} icon={<ICONS.Edit/>} label="Post Homework" />
          <SidebarBtn active={activeTab === 'ATTENDANCE'} onClick={() => navigateTo('ATTENDANCE')} icon={<ICONS.Calendar/>} label="Attendance" />
          {isAdmin && (
            <>
              <SidebarBtn active={activeTab === 'BILLING'} onClick={() => navigateTo('BILLING')} icon={<ICONS.CreditCard/>} label="Billing" />
              <SidebarBtn active={activeTab === 'SETTINGS'} onClick={() => navigateTo('SETTINGS')} icon={<ICONS.Settings/>} label="Settings" />
            </>
          )}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition font-bold uppercase text-[10px] tracking-widest">
            <ICONS.LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto pb-20">
          
          {activeTab === 'HOMEWORK' && (
            <div className="space-y-6">
              <div className="bg-white p-2 rounded-2xl flex gap-1 border border-slate-200">
                <button onClick={() => setHwSubTab('POST')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${hwSubTab === 'POST' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Post New</button>
                <button onClick={() => setHwSubTab('VIEW')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${hwSubTab === 'VIEW' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Submissions</button>
              </div>

              {hwSubTab === 'POST' ? (
                <div className="bg-white p-6 md:p-10 rounded-[30px] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight"><ICONS.Edit className="text-indigo-600"/> Create Homework</h3>
                  <form onSubmit={postHomework} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Batch</label>
                        <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" value={hwBatch} onChange={e => setHwBatch(e.target.value)}>
                          {state.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Title</label>
                        <input className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" placeholder="E.g. Tense Exercise" value={hwTitle} onChange={e => setHwTitle(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Instructions</label>
                      <textarea className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold h-32 text-sm" placeholder="Write full instructions..." value={hwContent} onChange={e => setHwContent(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Photo</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 p-8 bg-slate-50 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-slate-100 transition flex flex-col items-center justify-center text-slate-400">
                          {hwImage ? <img src={hwImage} className="h-20 rounded-xl mb-2" /> : <ICONS.Camera className="w-10 h-10 mb-2" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{hwImage ? 'Image Ready' : 'Upload'}</span>
                          <input type="file" className="hidden" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setHwImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl">Post Assignment</button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  {state.homework.length > 0 ? state.homework.map(h => {
                    const batch = state.batches.find(b => b.id === h.batchId);
                    const completions = state.homeworkCompletions.filter(c => c.homeworkId === h.id);
                    return (
                      <div key={h.id} className="bg-white rounded-[30px] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                          <div>
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{h.title}</h4>
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{batch?.name}</p>
                          </div>
                          <button onClick={() => updateState(prev => ({ ...prev, homework: prev.homework.filter(item => item.id !== h.id) }))} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><ICONS.Trash className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Completed By ({completions.length})</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {completions.map(c => {
                              const student = state.users.find(u => u.id === c.userId);
                              return (
                                <div key={c.userId} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0">{student?.fullName.charAt(0)}</div>
                                  <div className="overflow-hidden"><p className="text-xs font-bold text-slate-700 truncate">{student?.fullName}</p></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }) : <div className="bg-white p-10 rounded-[30px] border border-slate-200 text-center text-slate-300 uppercase font-black text-[10px] tracking-widest">No assignments</div>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-6">
              <div className="bg-white p-2 rounded-2xl flex gap-1 border border-slate-200">
                <button onClick={() => setAttSubTab('MARK')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${attSubTab === 'MARK' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Daily Mark</button>
                <button onClick={() => setAttSubTab('REVIEW')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${attSubTab === 'REVIEW' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>History</button>
              </div>

              {attSubTab === 'MARK' ? (
                <>
                  <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-lg font-black tracking-tight uppercase">Daily Entry</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="date" className="p-4 bg-slate-50 border rounded-2xl font-bold text-xs outline-none" value={attDate} onChange={e => setAttDate(e.target.value)} />
                      <select className="p-4 bg-slate-50 border rounded-2xl font-bold text-xs outline-none" value={attBatch} onChange={e => setAttBatch(e.target.value)}>
                        {state.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {attStudents.map(u => {
                      const record = state.attendance.find(r => r.userId === u.id && r.date === attDate);
                      return (
                        <div key={u.id} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{u.fullName}</p>
                              <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">{u.rollNumber}</p>
                            </div>
                            {record?.updatedAt && (
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Marked: {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <AttBtn label="P" active={record?.status === 'PRESENT'} color="bg-green-500" onClick={() => markAttendance(u.id, 'PRESENT', attDate)} />
                            <AttBtn label="A" active={record?.status === 'ABSENT'} color="bg-red-500" onClick={() => markAttendance(u.id, 'ABSENT', attDate)} />
                            <AttBtn label="H" active={record?.status === 'HOLIDAY'} color="bg-amber-500" onClick={() => markAttendance(u.id, 'HOLIDAY', attDate)} />
                          </div>
                        </div>
                      );
                    })}
                    {attStudents.length === 0 && <div className="text-center p-10 text-slate-400 font-black text-[10px] uppercase">No students in this batch</div>}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm space-y-4">
                    <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none text-xs" placeholder="Search Name/Roll..." value={attSearchQuery} onChange={e => setAttSearchQuery(e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                      <select className="p-4 bg-slate-50 border rounded-2xl font-bold text-xs outline-none" value={attFilterMonth} onChange={e => setAttFilterMonth(e.target.value)}>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select className="p-4 bg-slate-50 border rounded-2xl font-bold text-xs outline-none" value={attFilterYear} onChange={e => setAttFilterYear(e.target.value)}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviewData?.map(({ student, records, stats }) => (
                      <div key={student.id} className="bg-white rounded-[30px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                        <div className="p-6 border-b bg-slate-50 space-y-4">
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{student.fullName}</h4>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            <StatCard color="text-green-600 bg-green-50" label="P" value={stats.PRESENT} />
                            <StatCard color="text-red-600 bg-red-50" label="A" value={stats.ABSENT} />
                            <StatCard color="text-amber-600 bg-amber-50" label="H" value={stats.HOLIDAY} />
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {records.map(r => (
                            <div key={r.id} className="p-4 border-b flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-slate-700">{new Date(r.date).toLocaleDateString('en-GB')}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                              </div>
                              <select className={`text-[9px] font-black px-3 py-1.5 rounded-full border outline-none ${r.status === 'PRESENT' ? 'bg-green-50 text-green-600' : r.status === 'ABSENT' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`} value={r.status} onChange={(e) => markAttendance(student.id, e.target.value as AttendanceStatus, r.date)}>
                                <option value="PRESENT">P</option>
                                <option value="ABSENT">A</option>
                                <option value="HOLIDAY">H</option>
                              </select>
                            </div>
                          ))}
                          {records.length === 0 && <p className="p-10 text-center text-slate-300 font-black uppercase text-[9px]">No logs</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'BILLING' && (
            <div className="space-y-8">
              {isAdmin && (
                <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-widest">Bill Generator</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none" value={billMonth} onChange={e => setBillMonth(e.target.value)}>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none" value={billYear} onChange={e => setBillYear(e.target.value)}>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button onClick={generateBills} disabled={selectedStudentsForBill.length === 0} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl disabled:opacity-30 uppercase tracking-widest text-[10px] h-[56px]">Send to {selectedStudentsForBill.length} Students</button>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <p className="font-bold text-slate-700 text-xs uppercase tracking-widest">Select Recipients</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {activeUsers.filter(u => (!billFilter.batchId || u.batchId === billFilter.batchId) && (!billFilter.feeAmount || u.monthlyFee.toString() === billFilter.feeAmount)).map(u => (
                        <div key={u.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border">
                          <input type="checkbox" checked={selectedStudentsForBill.includes(u.id)} onChange={() => setSelectedStudentsForBill(prev => prev.includes(u.id) ? prev.filter(i => i !== u.id) : [...prev, u.id])} />
                          <div className="flex-1 text-xs"><p className="font-bold">{u.fullName}</p><p className="font-black text-indigo-600">₹{u.monthlyFee}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tighter px-2">Manage Bills</h3>
                {state.bills.sort((a, b) => b.createdAt - a.createdAt).map(bill => {
                  const student = state.users.find(u => u.id === bill.userId);
                  return (
                    <div key={bill.id} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{student?.fullName || 'Deleted'}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase">{bill.month} {bill.year}</p>
                        </div>
                        <button onClick={() => updateState(prev => ({ ...prev, bills: prev.bills.filter(b => b.id !== bill.id) }))} className="text-red-400"><ICONS.Trash className="w-4 h-4" /></button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-black text-indigo-600 text-sm">₹{bill.amount}</p>
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={bill.status === 'PAID'} onChange={() => toggleBillStatus(bill.id)} />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </label>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${bill.status === 'PAID' ? 'text-emerald-600' : 'text-slate-400'}`}>{bill.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'REQUESTS' && (
            <div className="space-y-4">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm px-2">Admission Queue</h3>
              {pendingUsers.map(u => (
                <div key={u.id} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{u.fullName}</p>
                      <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">{u.rollNumber}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[8px] font-black uppercase">Batch: {state.batches.find(b => b.id === u.batchId)?.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(u.id)} className="flex-1 py-3 bg-green-500 text-white rounded-xl flex items-center justify-center font-black uppercase text-[10px]"><ICONS.Check className="w-4 h-4 mr-2"/> Approve</button>
                    <button onClick={() => updateState(prev => ({ ...prev, users: prev.users.filter(usr => usr.id !== u.id) }))} className="flex-1 py-3 bg-red-500 text-white rounded-xl flex items-center justify-center font-black uppercase text-[10px]"><ICONS.X className="w-4 h-4 mr-2"/> Reject</button>
                  </div>
                </div>
              ))}
              {pendingUsers.length === 0 && <p className="text-center p-10 text-slate-300 uppercase font-black text-xs">Queue Empty</p>}
            </div>
          )}

          {activeTab === 'STUDENTS' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Student Roster</h3>
                <select className="px-4 py-3 border rounded-xl outline-none font-bold text-xs bg-slate-50 w-full" value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
                  <option value="">All Batches</option>
                  {state.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                {filteredStudents.map(u => (
                  <div key={u.id} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{u.fullName}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{u.rollNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-slate-400 uppercase font-black">Fee Amount</p>
                        <p className="font-black text-indigo-600">₹{u.monthlyFee}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400">Change Batch</label>
                        <select className="w-full text-[10px] px-3 py-2 bg-slate-50 border rounded-xl outline-none font-black text-indigo-600 uppercase" value={u.batchId} onChange={(e) => updateState(prev => ({ ...prev, users: prev.users.map(st => st.id === u.id ? { ...st, batchId: e.target.value } : st) }))}>
                          {state.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400">Update Fee</label>
                        <input type="number" className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-black text-slate-700 outline-none text-xs" defaultValue={u.monthlyFee} onBlur={(e) => updateState(prev => ({ ...prev, users: prev.users.map(st => st.id === u.id ? { ...st, monthlyFee: parseInt(e.target.value) || 0 } : st) }))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'BATCHES' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[30px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  {editingBatch ? <ICONS.Edit className="text-indigo-600"/> : <ICONS.Plus className="text-indigo-600"/>}
                  {editingBatch ? 'Modify Batch' : 'Add Batch'}
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const data = new FormData(form);
                  const name = data.get('name') as string;
                  const cls = data.get('class') as string;
                  const time = data.get('timing') as string;
                  if (editingBatch) {
                    updateState(prev => ({ ...prev, batches: prev.batches.map(b => b.id === editingBatch.id ? { ...b, name, class: cls, timing: time } : b) }));
                    setEditingBatch(null);
                  } else {
                    updateState(prev => ({ ...prev, batches: [...prev.batches, { id: 'b'+Date.now(), name, class: cls, timing: time, createdAt: Date.now() }] }));
                  }
                  form.reset();
                }} className="space-y-4">
                  <input name="name" required defaultValue={editingBatch?.name || ''} placeholder="Batch Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" />
                  <input name="class" required defaultValue={editingBatch?.class || ''} placeholder="Class" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" />
                  <input name="timing" required defaultValue={editingBatch?.timing || ''} placeholder="Timing" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold text-sm" />
                  <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]">{editingBatch ? 'Save' : 'Create'}</button>
                </form>
              </div>
              <div className="space-y-4">
                {state.batches.map(b => (
                  <div key={b.id} className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0">{b.class || '?'}</div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{b.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.timing}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingBatch(b)} className="p-2 text-indigo-600"><ICONS.Edit className="w-4 h-4"/></button>
                      <button onClick={() => updateState(prev => ({ ...prev, batches: prev.batches.filter(bt => bt.id !== b.id) }))} className="p-2 text-red-600"><ICONS.Trash className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && isAdmin && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3"><ICONS.Settings className="text-indigo-600"/> Security</h3>
                <div className="space-y-4">
                  <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none text-sm" value={newAdminId} onChange={e => setNewAdminId(e.target.value)} placeholder="Admin ID" />
                  <input className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none text-sm" type="password" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} placeholder="Password" />
                  <button onClick={() => alert("Updated")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Save Security</button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3"><ICONS.CreditCard className="text-indigo-600"/> Payment</h3>
                <div className="space-y-4">
                  <div className="h-44 bg-slate-50 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400 overflow-hidden relative cursor-pointer">
                    {state.paymentSettings.qrCode ? <img src={state.paymentSettings.qrCode} className="w-full h-full object-contain p-2" alt="QR" /> : <ICONS.Camera className="w-10 h-10 opacity-20" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => updateState(prev => ({ ...prev, paymentSettings: { ...prev.paymentSettings, qrCode: reader.result as string } }));
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </div>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs outline-none" value={state.paymentSettings.upiId} onChange={e => updateState(prev => ({...prev, paymentSettings: {...prev.paymentSettings, upiId: e.target.value}}))} placeholder="UPI ID" />
                  <input className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs outline-none" value={state.paymentSettings.phone} onChange={e => updateState(prev => ({...prev, paymentSettings: {...prev.paymentSettings, phone: e.target.value}}))} placeholder="Phone" />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

const SidebarBtn = ({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl transition font-black text-[10px] uppercase tracking-widest ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-4">{icon}<span>{label}</span></div>
    {count !== undefined && count > 0 && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full">{count}</span>}
  </button>
);

const AttBtn = ({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) => (
  <button onClick={onClick} className={`flex-1 py-4 rounded-xl font-black transition-all text-sm ${active ? `${color} text-white shadow-lg` : 'bg-slate-100 text-slate-400'}`}>{label}</button>
);

const StatCard = ({ color, label, value }: { color: string; label: string; value: number }) => (
  <div className={`${color} px-4 py-2 rounded-xl text-center min-w-[70px]`}>
    <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
    <p className="text-base font-black leading-none">{value}</p>
  </div>
);

export default AdminDashboard;
