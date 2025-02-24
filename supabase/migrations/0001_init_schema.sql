-- ScribexX Initial Database Schema
-- Migration timestamp: 2024-04-30 00:00:00

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'teacher', 'parent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Classrooms
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    join_code TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Classroom Members (junction table)
CREATE TABLE classroom_members (
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'assistant')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (classroom_id, user_id)
);

-- Content Layers (the three-layer writing instruction model)
CREATE TABLE content_layers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert the three content layers
INSERT INTO content_layers (name, description, order_index) VALUES
('Mechanics & Grammar', 'Spelling, sentence structure, and syntax to build automaticity', 1),
('Sequencing & Logic', 'Argument structure, logical flow, and content generation', 2),
('Voice & Rhetoric', 'Audience awareness, word choice, rhythm, and persuasive techniques', 3);

-- REDI Lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content_layer_id INTEGER REFERENCES content_layers(id) ON DELETE CASCADE,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
    order_index INTEGER,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- REDI Exercises
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('multiple_choice', 'fill_blank', 'rewrite', 'free_response')),
    solution JSON,
    points INTEGER DEFAULT 10,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Writing Genres
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert initial genres
INSERT INTO genres (name, description) VALUES
('Narrative', 'Storytelling and personal narratives'),
('Persuasive', 'Argumentative and persuasive writing'),
('Informative', 'Expository and informational writing'),
('Poetry', 'Creative expression through verse'),
('Journalism', 'Reporting and news-style writing');

-- OWL Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    genre_id INTEGER REFERENCES genres(id) ON DELETE SET NULL,
    content TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Project Revisions
CREATE TABLE project_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User Progress
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    completed BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, exercise_id)
);

-- User Achievements
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User-Achievement relationship
CREATE TABLE user_achievements (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, achievement_id)
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_timestamp trigger to relevant tables
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_classrooms_timestamp BEFORE UPDATE ON classrooms
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_lessons_timestamp BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_exercises_timestamp BEFORE UPDATE ON exercises
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_timestamp(); 