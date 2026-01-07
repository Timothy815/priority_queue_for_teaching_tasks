
import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface TaskFormProps {
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  editingTask: Task | null;
  onUpdate: (task: Task) => void;
  onCancelEdit: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, editingTask, onUpdate, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [importance, setImportance] = useState(5);
  const [urgency, setUrgency] = useState(5);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(30);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'high'>('low');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setImportance(editingTask.importance);
      setUrgency(editingTask.urgency);
      setDueDate(editingTask.dueDate);
      setDuration(editingTask.duration);
      setEnergyLevel(editingTask.energyLevel);
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingTask) {
      onUpdate({
        ...editingTask,
        title,
        importance,
        urgency,
        dueDate,
        duration,
        energyLevel
      });
    } else {
      onAdd({ title, description: '', importance, urgency, dueDate, duration, energyLevel });
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setImportance(5);
    setUrgency(5);
    setDuration(30);
    setEnergyLevel('low');
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-[#81D8D0] space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <i className={`fas ${editingTask ? 'fa-edit' : 'fa-feather-alt'} text-[#4e342e]`}></i>
          <h3 className="text-lg font-bold text-[#4e342e] teacher-font">
            {editingTask ? 'Edit Task' : 'Quick Add'}
          </h3>
        </div>
        {editingTask && (
          <button type="button" onClick={resetForm} className="text-[10px] font-black text-rose-500 uppercase">Cancel</button>
        )}
      </div>
      
      <input 
        type="text" 
        value={title} 
        onChange={e => setTitle(e.target.value)}
        className="block w-full rounded-xl border-2 border-[#f0f4f4] bg-white text-[#4e342e] shadow-sm focus:border-[#81D8D0] focus:ring-0 text-sm p-3 placeholder:text-slate-400"
        placeholder="What needs to be done?"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-black uppercase text-[#6abcb4]">Importance ({importance})</label>
          <input type="range" min="1" max="10" value={importance} onChange={e => setImportance(parseInt(e.target.value))} className="w-full accent-[#81D8D0]" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-[#6abcb4]">Urgency ({urgency})</label>
          <input type="range" min="1" max="10" value={urgency} onChange={e => setUrgency(parseInt(e.target.value))} className="w-full accent-[#4e342e]" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-[#6abcb4]">How is your battery right now?</label>
        <div className="flex bg-[#f0f4f4] p-1 rounded-xl w-full">
          <button 
            type="button"
            onClick={() => setEnergyLevel('low')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${energyLevel === 'low' ? 'bg-white text-[#4e342e] shadow-sm' : 'text-[#6abcb4]'}`}
            title="Choose if you are tired. We will suggest simpler tasks."
          >
            ☕ Low Battery
          </button>
          <button 
            type="button"
            onClick={() => setEnergyLevel('high')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${energyLevel === 'high' ? 'bg-[#4e342e] text-white shadow-sm' : 'text-[#6abcb4]'}`}
            title="Choose if you feel fresh. Best for hard tasks."
          >
            ⚡ Full Battery
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="rounded-lg border-2 border-[#f0f4f4] bg-white p-2 text-xs text-[#4e342e]" />
        <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="rounded-lg border-2 border-[#f0f4f4] bg-white p-2 text-xs text-[#4e342e]" placeholder="Mins" />
      </div>

      <button type="submit" className={`w-full ${editingTask ? 'bg-[#4e342e] text-white' : 'bg-[#81D8D0] text-[#4e342e]'} hover:opacity-90 font-black py-2.5 rounded-xl transition-all border-b-4 border-black/10 text-xs`}>
        <i className={`fas ${editingTask ? 'fa-save' : 'fa-magic'} mr-2`}></i> 
        {editingTask ? 'UPDATE TASK' : 'ADD TO MY DAY'}
      </button>
    </form>
  );
};

export default TaskForm;
