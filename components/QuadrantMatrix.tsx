
import React from 'react';
import { ScoredTask, Quadrant } from '../types';

interface QuadrantMatrixProps {
  tasks: ScoredTask[];
}

const QuadrantMatrix: React.FC<QuadrantMatrixProps> = ({ tasks }) => {
  const getQuadrantTasks = (q: Quadrant) => tasks.filter(t => t.quadrant === q && !t.completed);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <MatrixBox 
        title="DO FIRST" 
        subtitle="Urgent & Important" 
        tasks={getQuadrantTasks(Quadrant.Q1)} 
        color="border-rose-200 bg-rose-50/40"
        headerColor="text-rose-800"
      />
      <MatrixBox 
        title="SCHEDULE" 
        subtitle="Not Urgent & Important" 
        tasks={getQuadrantTasks(Quadrant.Q2)} 
        color="border-emerald-200 bg-emerald-50/40"
        headerColor="text-emerald-800"
      />
      <MatrixBox 
        title="DELEGATE" 
        subtitle="Urgent & Not Important" 
        tasks={getQuadrantTasks(Quadrant.Q3)} 
        color="border-amber-200 bg-amber-50/40"
        headerColor="text-amber-800"
      />
      <MatrixBox 
        title="ELIMINATE" 
        subtitle="Not Urgent & Not Important" 
        tasks={getQuadrantTasks(Quadrant.Q4)} 
        color="border-slate-200 bg-slate-50/40"
        headerColor="text-slate-800"
      />
    </div>
  );
};

const MatrixBox = ({ title, subtitle, tasks, color, headerColor }: any) => (
  <div className={`p-4 rounded-2xl border-2 ${color} min-h-[250px] flex flex-col`}>
    <div className="mb-3">
      <h4 className={`text-xs font-black tracking-widest uppercase ${headerColor}`}>{title}</h4>
      <p className="text-[10px] text-[#4e342e]/60 font-bold uppercase">{subtitle}</p>
    </div>
    <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
      {tasks.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-[#4e342e]/30 text-sm italic font-medium">Clear for now</p>
        </div>
      ) : (
        tasks.slice(0, 8).map(task => (
          <div key={task.id} className="bg-white/80 p-2.5 rounded-lg shadow-sm border border-black/5 flex items-center gap-3 transition-transform hover:translate-x-1">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[#f4f7f7] text-[10px] text-[#4e342e] font-bold rounded-md">#{task.rank}</span>
            <span className="text-xs font-bold text-[#4e342e] truncate">{task.title}</span>
          </div>
        ))
      )}
    </div>
  </div>
);

export default QuadrantMatrix;
