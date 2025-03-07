# ScribexX - Writing App Specification Sheet

## Overview

ScribexX is an RPG-style writing app designed for junior high students and surrounding grades. It balances
direct instruction for excellence with creative freedom, empowering students to express
their ideas and improve their writing skills. The app leverages gamification through RPG mechanics,
interactive learning, engaging aesthetics, intuitive UI, and AI-assisted feedback to create an immersive educational experience.

## Core Features

### 1. Two-Pronged Approach to Writing Instruction

#### A. Reflective Exercise on Direct Instruction (REDI) - Skill Tree System

- Functions as an RPG skill tree where each node represents a writing lesson or skill.
- Focuses on the analytical side of writing.
- Presents structured lessons and exercises organized in branching skill trees.
- Lessons are categorized under three layers of writing instruction (Mechanics,
  Sequencing, and Voice).
- Students complete exercises and must reach 90% accuracy to proceed.
- Unlocking nodes rewards students with:
  - Stat points to enhance their character abilities
  - In-game currency for customization and special items
  - Special abilities that can be used in the OWL world
- Failure conditions exist to encourage retrying with minimal frustration.
- AI-generated levels ensure a vast pool of content.

#### B. Open World Learning (OWL) - Explorable World Map

- Presented as an actual open world map with a traversable graph of nodes.
- Each node represents a writing quest with specific rewards and challenges.
- Students unlock nodes sequentially, representing exploration of the writing world.
- Inspired by sandbox-style games and Codecademy's self-driven learning.
- Encourages real-world writing applications (e.g., journalism, persuasive essays,
  screenplays, product descriptions, etc.).
- AI reviews writing in real-time, giving structured feedback.
- Students choose topics of interest while maintaining assigned genre variety.
- A "Writer's Block" button suggests new ideas when students are stuck.
- Completing quests rewards character progression, items, and unlocks new areas.
- Writing prompts are contextually tied to locations in the world:
  - Town areas feature denser node clusters with location-specific writing tasks
  - Procedurally generated quests reflect the theme of each area (e.g., newspaper articles about local events, business copy for local shops)
  - Writing literally shapes and impacts the virtual world, reinforcing the concept that language creates reality
- Daily Quest System:
  - Short, low-effort writing prompts that refresh daily
  - Higher reward-to-effort ratio to encourage consistent practice
  - Streak bonuses for consecutive days of completion
  - Variety of prompt types to maintain engagement
  - Accessible even with limited time availability

### 2. Three-Layer Writing Instruction Model

1. Mechanics & Grammar: Covers spelling, sentence structure, and syntax to build
   automaticity.
2. Sequencing & Logic: Focuses on argument structure, logical flow, and content
   generation.
3. Voice & Rhetoric: Covers audience awareness, word choice, rhythm, and persuasive
   techniques.

### 3. UI/UX and RPG Gamification

#### A. Home Screen & Navigation

- The home screen functions as a dashboard displaying:
  - Recent notifications and achievements
  - Daily/weekly streaks and goals
  - Quick access to current quests and skill tree progress
  - Character status summary
  - Daily quest availability and rewards
- Bottom navigation bar includes:
  - Home Button (Dashboard with streaks, notifications)
  - REDI Button (Skill tree progression)
  - OWL Button (Open world map and quests)
  - Social Button (Factions, leaderboards, and social features)
  - Profile Button (Character profile, inventory, settings)
- Navigation is enabled via swipe gestures and button selection.

#### B. RPG Learning Experience

- Character Development:
  - Students create and customize their own avatar
  - Multiple character classes with different writing specialties (e.g., Poet, Journalist, Novelist)
  - Stat progression tied to writing skills
  - Inventory system for collecting writing tools, accessories, and rewards
  - Rank progression system (C to S ranks) that visually displays writing mastery level
- Inclusive Incentive System:
  - Diverse customization options appealing to all genders
  - Multiple progression paths catering to different interests
  - Collaborative and competitive elements balanced for broad appeal
  - Achievement system with varied rewards (aesthetic, functional, social)
  - Narrative-driven quests with emotional depth and character development
  - Creative expression through world-building and character design
- Faction System:
  - Students join or create factions within their classroom/community
  - Collaborative writing projects and challenges between factions
  - Faction-based leaderboards and achievements
  - Shared rewards for faction progress
  - Faction headquarters that can be collectively decorated and upgraded

#### C. Collection and Base Building Systems

- Personal Writer's Haven:
  - Each student has a customizable personal space/home
  - Completing writing tasks earns decorative items and furniture
  - Special rare items are awarded for exceptional writing achievements
  - The space evolves visually to reflect writing progress and specializations
  - Students can invite friends to visit their space and showcase achievements
- Faction Headquarters:
  - Collaborative space that all faction members contribute to building
  - Reflects the collective achievements and specialties of the faction
  - Special rooms unlock based on faction-wide writing accomplishments
  - Displays trophies and artifacts from world events and competitions
- Collectible System:
  - Decorative items that tell stories about the world
  - Achievement badges and trophies displayed in personal and faction spaces
  - Collection albums for tracking discoveries throughout the writing world
  - Special limited-time collectibles from world events

#### D. World Events and Competitions

- Periodic global writing challenges that appear on the map as special events
- All participants receive the same writing prompt related to the event theme
- Individual and faction contributions are scored based on writing quality
- Tiered rewards based on participation and excellence
- Special "World Boss" events requiring collaborative writing from multiple factions
- Seasonal tournaments with progressive difficulty levels
- Results visibly impact the game world, reinforcing that writing shapes reality

#### E. Crowd-Sourced Peer Review System

- Students can evaluate 3-5 writing pieces daily from peers outside their classroom
- Participation rewards students with special currency or items
- Multiple reviewers evaluate each submission for balanced feedback
- Structured evaluation criteria to guide meaningful feedback
- System builds critical analysis skills while providing human feedback
- Teachers can monitor and moderate the peer review process
- Quality of reviews is tracked to ensure constructive feedback

### 4. AI Integration

- AI provides immediate and objective feedback for both REDI (skill tree) and OWL (quest-based writing).
- AI assists with real-time feedback on structure, grammar, and clarity.
- No AI-generated content for writing; only feedback-based AI to ensure students
  genuinely develop their skills.
- A "Writer's Block" button suggests prompts for students who need inspiration.
- AI-powered NPCs that guide students through the world and provide contextual assistance.
- AI evaluates writing submissions for world events and competitions.
- AI works alongside the crowd-sourced peer review system to provide comprehensive feedback.

## Design & Aesthetic Guidelines

### 1. Theme & Mood

- Synthwave + Cyberpunk + Botanical Futurism
- Bright neon colors combined with metallic grays and sleek whites.
- A balance between visually engaging design and a distraction-free writing space.
- The digital void aesthetic conveys the idea of infinite possibility and creative power.
- UI should feel minimalist, smooth, and glassy with organic elements to ground it.
- Personal and faction spaces can be customized with different aesthetic themes.

### 2. Inspiration & Conceptual Approach

- Language is as powerful as coding, and the app should convey this visually.
- Writing is about creating the future, not just following rules.
- The interface should communicate a sense of limitless potential and mastery.
- RPG elements should enhance rather than distract from the core writing experience.
- Visual feedback should reinforce how writing literally shapes and transforms the virtual world.

## Technical Requirements

### 1. Platform & Compatibility

- Mobile-first design (iOS & Android compatibility required).
- Cloud-based storage for user progress, character data, and writing projects.
- Offline mode for writing practice with auto-sync upon reconnection.

### 2. AI & Backend

- Natural Language Processing (NLP) for AI feedback on writing quality.
- Progress tracking: Adaptive learning based on student performance.
- Secure student data storage, compliant with COPPA and FERPA regulations.
- Backend support for faction system and social features.
- Procedural generation system for location-specific writing prompts.
- Event scheduling and scoring algorithms for world events.
- Daily quest generation and tracking system.
- Peer review distribution and evaluation algorithms.

### 3. User Profiles & Permissions

- Student accounts with character profiles and progress tracking.
- Teacher/parent accounts with classroom management features.
- Customizable controls for difficulty, AI interaction, and content selection.
- Faction management and moderation tools.
- Collection and achievement tracking systems.
- Peer review participation and quality metrics.

## Next Steps

1. Wireframe UI/UX design for core app screens including RPG elements.
2. Develop character progression system and faction mechanics.
3. Design skill tree structure and open world map.
4. Prototype gender-inclusive incentive systems including collectibles and base building.
5. Design world event system and competition mechanics.
6. Develop daily quest system and peer review functionality.
7. User testing & iterative feedback before full-scale development.

This spec sheet provides an actionable roadmap for developers to create ScribexX, ensuring it
is both engaging and educational while appealing to students of all genders.
