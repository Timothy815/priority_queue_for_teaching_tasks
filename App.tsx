
import React, { useState, useMemo, useEffect, useRef } from 'react';
import TaskForm from './components/TaskForm';
import QuadrantMatrix from './components/QuadrantMatrix';
import CalendarView from './components/CalendarView';
import { Task, ScoredTask } from './types';
import { scoreAndRankTasks } from './utils/priorityEngine';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'calendar' | 'report' | 'print'>('matrix');
  const [appName, setAppName] = useState('Teacher\'s Retreat');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showLogicModal, setShowLogicModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('quadrant_tasks');
    const savedName = localStorage.getItem('quadrant_app_name');
    if (savedTasks) try { setTasks(JSON.parse(savedTasks)); } catch (e) {}
    if (savedName) setAppName(savedName);
  }, []);

  useEffect(() => { localStorage.setItem('quadrant_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('quadrant_app_name', appName); }, [appName]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    setTasks(prev => [...prev, { ...taskData, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now(), completed: false }]);
  };

  const updateTask = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditingTask(null);
  };

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  
  const rankedTasks = useMemo(() => scoreAndRankTasks(tasks), [tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed);
    const total = tasks.length;
    const completionRate = total ? Math.round((completed.length / total) * 100) : 0;
    
    const totalImportance = tasks.reduce((acc, t) => acc + t.importance, 0);
    const clearedImportance = completed.reduce((acc, t) => acc + t.importance, 0);
    const efficiency = totalImportance ? Math.round((clearedImportance / totalImportance) * 100) : 0;

    return { completionRate, efficiency, completedCount: completed.length, openCount: total - completed.length };
  }, [tasks]);

  const totalMinutes = useMemo(() => rankedTasks.filter(t => !t.completed).reduce((acc, t) => acc + t.duration, 0), [rankedTasks]);
  const workloadPercentage = Math.min(100, (totalMinutes / 480) * 100);

  const handleExport = () => {
    const data = JSON.stringify({ tasks, appName }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `retreat-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.tasks) { setTasks(content.tasks); if (content.appName) setAppName(content.appName); }
      } catch (err) { alert('Invalid File'); }
    };
    reader.readAsText(file);
  };

  const printChecklist = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f4f7f7] flex flex-col teacher-font text-[#4e342e]">
      {/* Non-Printable Header */}
      <header className="bg-white border-b-4 border-[#81D8D0] sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between shadow-sm gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="bg-[#81D8D0] w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md">
            <i className="fas fa-leaf text-xl text-[#4e342e]"></i>
          </div>
          <div onClick={() => setIsEditingName(true)} className="cursor-pointer">
            {isEditingName ? (
              <input autoFocus value={appName} onChange={e => setAppName(e.target.value)} onBlur={() => setIsEditingName(false)} className="text-2xl font-black bg-white border-2 border-[#81D8D0] rounded p-1 outline-none text-[#4e342e]" />
            ) : (
              <h1 className="text-2xl font-black">{appName}</h1>
            )}
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#6abcb4]">Focus & Calm</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex bg-[#f0f4f4] p-1 rounded-xl">
            <button onClick={() => setActiveTab('matrix')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'matrix' ? 'bg-[#81D8D0] shadow-sm' : 'text-[#6abcb4]'}`}>GRID</button>
            <button onClick={() => setActiveTab('calendar')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'calendar' ? 'bg-[#81D8D0] shadow-sm' : 'text-[#6abcb4]'}`}>DATE</button>
            <button onClick={() => setActiveTab('report')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'report' ? 'bg-[#81D8D0] shadow-sm' : 'text-[#6abcb4]'}`}>STATS</button>
            <button onClick={() => setActiveTab('print')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'print' ? 'bg-[#81D8D0] shadow-sm' : 'text-[#6abcb4]'}`} title="Printable Checklist">
              <i className="fas fa-print mr-1"></i> PRINT
            </button>
          </nav>
          <button onClick={() => setShowLogicModal(true)} title="How it works" className="p-2.5 text-[#6abcb4] hover:text-[#4e342e] transition-colors"><i className="fas fa-question-circle text-lg"></i></button>
          <button onClick={handleExport} className="p-2.5 bg-white border-2 border-[#81D8D0] rounded-xl text-xs"><i className="fas fa-save text-[#4e342e]"></i></button>
          <label className="p-2.5 bg-[#4e342e] text-white rounded-xl text-xs cursor-pointer"><i className="fas fa-folder-open"></i><input type="file" className="hidden" onChange={handleImport} /></label>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:max-w-none print:p-0">
        
        {/* Left Sidebar - Hidden in Print View */}
        <aside className="lg:col-span-4 space-y-6 print:hidden">
          <TaskForm 
            onAdd={addTask} 
            editingTask={editingTask} 
            onUpdate={updateTask} 
            onCancelEdit={() => setEditingTask(null)}
          />
          
          <div className="bg-white rounded-2xl shadow-sm border-2 border-[#81D8D0]/30 p-5">
             <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black uppercase text-[#6abcb4]">Daily Workload (8hr day)</label>
                <span className="text-[10px] font-bold text-[#4e342e]">{totalMinutes}m</span>
             </div>
             <div className="w-full bg-[#f0f4f4] h-3 rounded-full overflow-hidden">
                <div className="h-full bg-[#81D8D0] transition-all duration-500" style={{ width: `${workloadPercentage}%` }}></div>
             </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border-2 border-[#81D8D0]/30 overflow-hidden">
            <div className="px-5 py-3 border-b-2 border-[#f0f4f4] font-black text-xs uppercase flex justify-between">
              <span>Next Steps</span>
              <span className="text-[#81D8D0]">{rankedTasks.filter(t => !t.completed).length} items</span>
            </div>
            <div className="divide-y divide-[#f4f7f7] max-h-[400px] overflow-y-auto">
              {rankedTasks.map(task => (
                <div key={task.id} className={`p-4 flex items-center gap-3 group ${task.completed ? 'opacity-30' : ''}`}>
                  <button onClick={() => toggleTask(task.id)} className={`text-lg transition-transform active:scale-125 ${task.completed ? 'text-emerald-500' : 'text-[#d7ccc8]'}`}>
                    <i className={`fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}`}></i>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${task.id === editingTask?.id ? 'text-[#81D8D0]' : 'text-[#4e342e]'}`}>{task.title}</h4>
                    <div className="flex gap-2 mt-1">
                      {task.duration <= 15 && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded font-black">QUICK WIN</span>}
                      {task.energyLevel === 'high' ? <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded font-black">⚡ FULL BATTERY</span> : <span className="text-[8px] bg-sky-100 text-sky-700 px-1 rounded font-black">☕ LOW BATTERY</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingTask(task)} className="text-[#6abcb4] hover:text-[#4e342e] text-xs"><i className="fas fa-pen"></i></button>
                    <button onClick={() => deleteTask(task.id)} className="text-[#d7ccc8] hover:text-red-400 text-xs"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Dynamic Views Area */}
        <div className={`lg:col-span-8 ${activeTab === 'print' ? 'print:block' : 'print:hidden'}`}>
          {activeTab === 'matrix' && <QuadrantMatrix tasks={rankedTasks} />}
          {activeTab === 'calendar' && <CalendarView tasks={rankedTasks} />}
          {activeTab === 'report' && (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-[#81D8D0]/30 p-8 space-y-10">
              <div className="border-b-2 border-[#f0f4f4] pb-4">
                <h2 className="text-2xl font-black text-[#4e342e]">Efficiency Report</h2>
                <p className="text-[#6abcb4] text-sm font-bold uppercase tracking-widest">Your productivity at a glance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-[#f0fafa] rounded-xl border-2 border-[#81D8D0]/20">
                  <div className="text-4xl font-black text-[#4e342e] mb-1">{stats.completionRate}%</div>
                  <div className="text-[10px] font-black uppercase text-[#6abcb4]">Completion Rate</div>
                  <p className="text-xs text-slate-500 mt-2">Percentage of all tasks finished.</p>
                </div>
                <div className="p-6 bg-[#fbfdfd] rounded-xl border-2 border-[#4e342e]/10">
                  <div className="text-4xl font-black text-[#4e342e] mb-1">{stats.efficiency}%</div>
                  <div className="text-[10px] font-black uppercase text-[#6abcb4]">Focus Efficiency</div>
                  <p className="text-xs text-slate-500 mt-2">Weight of High Importance items cleared.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-black text-sm uppercase text-[#4e342e]">Performance Insight</h3>
                <div className="p-5 bg-[#f4f7f7] rounded-xl text-sm leading-relaxed border-l-4 border-[#81D8D0]">
                  {stats.efficiency > 70 
                    ? "Excellent! You are focusing on high-impact work. This is the key to avoiding burnout." 
                    : "You're getting things done, but try focusing on those High Importance tasks first when your battery is full."}
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="py-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">✓ {stats.completedCount} Cleared</div>
                  <div className="py-3 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">☕ {stats.openCount} Remaining</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'print' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center print:hidden mb-4 bg-white p-6 rounded-2xl shadow-sm border-2 border-[#81D8D0]">
                <div>
                  <h2 className="text-xl font-black text-[#4e342e]">Printable Checklist</h2>
                  <p className="text-sm text-[#6abcb4]">A clear, paper-friendly view of today's ranked tasks.</p>
                </div>
                <button 
                  onClick={printChecklist}
                  className="bg-[#4e342e] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#6d4c41] transition-all"
                >
                  <i className="fas fa-print"></i> Print Now
                </button>
              </div>

              {/* Actual Printable Document */}
              <div className="bg-white p-10 rounded-2xl shadow-sm border-2 border-slate-200 print:border-none print:p-0 print:shadow-none">
                <div className="border-b-4 border-[#4e342e] pb-4 mb-6 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-black text-[#4e342e]">{appName}</h1>
                    <p className="text-sm font-bold text-[#6abcb4] uppercase tracking-widest">Daily Priority List • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase text-slate-400">Total Est. Time: {totalMinutes} mins</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-tighter text-[#4e342e] border-b border-slate-200 mb-3 pb-1">Primary Focus (Top 3)</h3>
                    {rankedTasks.filter(t => !t.completed).slice(0, 3).map((task, i) => (
                      <div key={task.id} className="flex items-center gap-4 py-3 border-b border-dashed border-slate-200">
                        <div className="w-8 h-8 border-2 border-[#4e342e] flex-shrink-0"></div>
                        <div className="flex-1">
                          <span className="text-sm font-black text-[#4e342e] mr-2">#{task.rank}</span>
                          <span className="text-lg font-bold text-[#4e342e]">{task.title}</span>
                          <span className="ml-2 text-xs text-slate-400">({task.duration}m)</span>
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-300">Important</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-tighter text-[#4e342e] border-b border-slate-200 mb-3 pb-1">Remaining Tasks</h3>
                    {rankedTasks.filter(t => !t.completed).slice(3).map((task) => (
                      <div key={task.id} className="flex items-center gap-4 py-2 border-b border-slate-100">
                        <div className="w-5 h-5 border border-slate-300 flex-shrink-0"></div>
                        <div className="flex-1">
                          <span className="text-xs font-black text-[#6abcb4] mr-2">#{task.rank}</span>
                          <span className="text-sm font-medium text-[#4e342e]">{task.title}</span>
                          <span className="ml-2 text-[10px] text-slate-300">({task.duration}m)</span>
                        </div>
                      </div>
                    ))}
                    {rankedTasks.filter(t => !t.completed).length === 0 && (
                      <p className="text-center py-10 text-slate-400 italic">No open tasks for today. Enjoy the calm!</p>
                    )}
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t-2 border-slate-100 grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Notes & Classroom To-Dos</h4>
                    <div className="h-24 border border-slate-200 w-full rounded"></div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">After School Reminders</h4>
                    <div className="h-24 border border-slate-200 w-full rounded"></div>
                  </div>
                </div>

                <div className="mt-10 text-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.3em] print:block hidden">
                  Powered by {appName} • Quality of Life First
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Logic Modal */}
      {showLogicModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
            <button onClick={() => setShowLogicModal(false)} className="absolute top-4 right-4 text-[#6abcb4] hover:text-[#4e342e]"><i className="fas fa-times"></i></button>
            <h3 className="text-xl font-black text-[#4e342e] mb-4">The Priority Logic</h3>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p><strong className="text-[#4e342e]">1. The Matrix:</strong> Tasks are grouped by Importance vs Urgency. Q1 (High/High) is always top priority.</p>
              <p><strong className="text-[#4e342e]">2. The Formula:</strong> <code>(Importance × 1.5) + Urgency</code>. We value long-term goals (Importance) slightly more than firefighting (Urgency).</p>
              <p><strong className="text-[#4e342e]">3. Momentum (Quick Wins):</strong> Tasks taking 15m or less get a small boost. Clearing "easy wins" early reduces mental clutter.</p>
              <p><strong className="text-[#4e342e]">4. Energy Matching:</strong> If you select "Full Battery," we promote the highest-score (hardest) tasks. If "Low Battery," we emphasize simpler, lower-stakes tasks.</p>
            </div>
            <button onClick={() => setShowLogicModal(false)} className="mt-8 w-full bg-[#81D8D0] text-[#4e342e] font-black py-3 rounded-xl shadow-md">Understood</button>
          </div>
        </div>
      )}

      {/* Non-Printable Footer */}
      <footer className="p-8 text-center text-[#6abcb4] text-[10px] font-bold uppercase tracking-widest bg-white border-t-2 border-[#81D8D0]/20 print:hidden">
        <p>A gift for teachers • Coffee & Clarity • Stay Grounded</p>
      </footer>
    </div>
  );
};

export default App;
