
export interface Task {
  id: string;
  title: string;
  description: string;
  importance: number; // 1-10
  urgency: number;    // 1-10
  dueDate: string;    // ISO string
  createdAt: number;  // timestamp for tie-breaking
  completed: boolean;
  duration: number;   // in minutes
  energyLevel: 'low' | 'high'; 
}

export enum Quadrant {
  Q1 = 'Do First (Urgent & Important)',
  Q2 = 'Schedule (Not Urgent & Important)',
  Q3 = 'Delegate (Urgent & Not Important)',
  Q4 = 'Eliminate (Not Urgent & Not Important)'
}

export interface ScoredTask extends Task {
  score: number;
  quadrant: Quadrant;
  rank: number;
  color: string;
}
