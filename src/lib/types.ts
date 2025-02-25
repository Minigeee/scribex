import type { Tables, Json } from './database.types';

// Simplified content layer type for API responses
export type ContentLayerBasic = {
  id: number;
  name: string;
  description: string | null;
};

// Lesson with related content
export type LessonWithContent = Omit<Tables<'lessons'>, 'content_layer_id'> & {
  exercises: Tables<'exercises'>[];
  content_layer: ContentLayerBasic | null;
};

// Exercise with user progress
export type ExerciseWithProgress = Tables<'exercises'> & {
  user_progress?: Tables<'user_progress'> | null;
};

// Article section types for rich content rendering
export type ArticleSection = {
  type: 'paragraph' | 'heading' | 'example' | 'code' | 'image';
  content: string;
  level?: 1 | 2 | 3; // For headings
  caption?: string; // For images or examples
  language?: string; // For code blocks
};

// Parsed article with sections
export type ParsedArticle = {
  sections: ArticleSection[];
}; 