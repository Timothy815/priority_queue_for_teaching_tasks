
import { Task, ScoredTask, Quadrant } from '../types';

export const scoreAndRankTasks = (tasks: Task[]): ScoredTask[] => {
  const scored = tasks.map(task => {
    // Basic Score
    let score = (task.importance * 1.5) + task.urgency;
    
    // "Quick Win" Bonus: If a task takes < 15 mins, it gets a tiny nudge 
    // to help clear the deck of small chores.
    if (task.duration <= 15) {
      score += 0.5;
    }

    let quadrant: Quadrant;
    let color: string;

    if (task.importance >= 6 && task.urgency >= 6) {
      quadrant = Quadrant.Q1;
      color = 'bg-[#fbe9e7] border-[#ffab91] text-[#bf360c]';
    } else if (task.importance >= 6 && task.urgency < 6) {
      quadrant = Quadrant.Q2;
      color = 'bg-[#e8f5e9] border-[#a5d6a7] text-[#1b5e20]';
    } else if (task.importance < 6 && task.urgency >= 6) {
      quadrant = Quadrant.Q3;
      color = 'bg-[#fff3e0] border-[#ffcc80] text-[#e65100]';
    } else {
      quadrant = Quadrant.Q4;
      color = 'bg-[#efebe9] border-[#bcaaa4] text-[#4e342e]';
    }

    return { ...task, score, quadrant, color, rank: 0 };
  });

  return scored.sort((a, b) => {
    // 1. Primary: Score
    if (b.score !== a.score) return b.score - a.score;
    // 2. Secondary: Due Date
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    // 3. Tertiary: High Energy tasks first (Eat the Frog)
    if (a.energyLevel !== b.energyLevel) {
       return a.energyLevel === 'high' ? -1 : 1;
    }
    return a.createdAt - b.createdAt;
  }).map((task, index) => ({ ...task, rank: index + 1 }));
};

export const getCalendarDays = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];
  for (let i = 0; i < start.getDay(); i++) days.push(null);
  for (let i = 1; i <= end.getDate(); i++) days.push(new Date(date.getFullYear(), date.getMonth(), i));
  return days;
};
