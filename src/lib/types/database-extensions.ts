import { Tables } from '@/lib/database.types';

// Extend the Quest type to include prerequisite_stats which is in the database schema
// but might be missing in the generated TypeScript types
export type Quest = Tables<'quests'> & {
  prerequisite_stats?: Record<string, number>;
};

// Define stat prerequisite interface for use in UI components
export interface StatPrerequisite {
  stat: string;
  value: number;
} 

// Extend the Quest type to include genres which is in the database schema
export type QuestWithGenre = Quest & {
  genres: Tables<'genres'> | null;
};