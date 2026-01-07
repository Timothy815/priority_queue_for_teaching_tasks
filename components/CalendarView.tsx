
import React, { useState } from 'react';
import { ScoredTask } from '../types';
import { getCalendarDays } from '../utils/priorityEngine';

interface CalendarViewProps {
  tasks: ScoredTask[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = getCalendarDays(currentDate);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getTasksForDay = (day: Date | null) => {
    if (!day) return [];
    const dateStr = day.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr).sort((a, b) => a.rank - b.rank);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-[#81D8D0]/30 overflow-hidden">
      <div className="p-6 border-b-2 border-[#f0f4f4] flex justify-between items-center bg-white">
        <h2 className="text-2xl font-black text-[#4e342e]">
          {monthName} <span className="text-[#81D8D0] font-medium">{year}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-[#f0fafa] rounded-full transition-colors text-[#81D8D0]">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button onClick={() => changeMonth(1)} className="p-3 hover:bg-[#f0fafa] rounded-full transition-colors text-[#81D8D0]">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center py-4 bg-[#fbfdfd]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-[10px] font-black uppercase tracking-widest text-[#6abcb4]">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-[#f0f4f4]">
        {days.map((day, idx) => {
          const dayTasks = getTasksForDay(day);
          const isToday = day && day.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={idx} 
              className={`min-h-[140px] p-2 border-r border-b border-[#f0f4f4] transition-colors group ${!day ? 'bg-[#fbfdfd]' : 'hover:bg-[#f0fafa]'}`}
            >
              {day && (
                <>
                  <div className={`text-sm font-black mb-2 flex items-center justify-center w-8 h-8 rounded-lg ${isToday ? 'bg-[#81D8D0] text-[#4e342e] shadow-sm' : 'text-[#6abcb4]'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`text-[9px] px-2 py-1.5 rounded-md border-2 leading-tight font-bold shadow-sm truncate transition-transform hover:scale-105 ${task.color}`}
                        title={`${task.title} - Priority Rank: ${task.rank}`}
                      >
                        #{task.rank} {task.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
