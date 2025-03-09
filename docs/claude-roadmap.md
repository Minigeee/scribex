# ScribexX High-Level Development Roadmap (MVP Focus)

## Personal To Do List

- [x] Look into map / canvas solutions
- [x] Add basic trees to REDI 1 + 3
- [x] Add quest stat prereqs
  - Difficulty determined by distance from starting town
  - Stats (types) required determined by genre (maps to a set of one or two types + chance for random additional stat)
  - Stat points required determined by difficulty
- [x] Add leaderboard points `points` to reward generation
  - [x] REDI
  - [x] OWL
- [x] Test quest completion by adding a "[TEST] Complete Quest" button
- [ ] Implement leaderboard

Do if have time:

- [ ] Add AI grading
  - [ ] REDI
  - [ ] OWL

## Ideas

- What can stat points be used for? It can be used to gate harder/more specialized quests
- How will leaderboard + factions work? What incentive is there to do well?
  - In terms of personal incentives, a cool looking avatar can be a good incentive for some
  - For leaderboard, a small reward incentive can be given to top `x` writers (currency, exclusive items consumables trophies cosmetics)
  - For faction leaderboard (exclusive trophy, some proxy to "power" [faction trophies, badges], bragging rights, irl reward?)
- What will currency be used for? There can be a shop for common items, consumables, cosmetics
- What can items + consumables be used for? They can be used for stat bonuses, reward bonuses, etc.

## Phase 1: Foundation (3-4 weeks)

- [x] Define technical stack and architecture
- [x] Establish core data models
- [x] Set up development environment
- [x] Create authentication system
- [x] Design basic navigation flow

## Phase 2: Core Writing Experience (4-5 weeks)

- [x] Add seed data for lessons
- [x] Plan REDI lesson framework
- [ ] Design exercise templates
- [x] Implement progress tracking
- [x] Create scoring system (90% threshold)
- [x] Basic project text editor
- [x] Implement "Writer's Block" suggestion feature
- [ ] Build basic AI evaluation for structured exercises

## Phase 3: RPG Framework (4-5 weeks)

- [x] Design skill tree visualization
  - [x] Seed item templates (find an icon pack online)
  - [x] Add rewards section
- [x] Design simple world map system
  - [ ] Clean up world map creation screen
  - [ ] Hide locked locations
- [ ] Implement character profile system
  - [ ] Implement level updating system (rn only xp is added but new levels are not calculated)
- [x] Create basic inventory system
- [x] Build quest tracking system
- [x] Implement reward distribution mechanics
- [ ] Create daily quest system

## Phase 4: Social & Engagement Features (3-4 weeks)

- [ ] Build basic faction system
- [ ] Implement peer review functionality
- [ ] Create streak and consistency tracking
- [ ] Design simple leaderboards
- [ ] Implement basic notification system
- [ ] Build achievement tracking

## Phase 5: Content & Progression (3-4 weeks)

- [ ] Create initial REDI lesson content
- [ ] Design starter OWL quests
- [ ] Implement daily writing prompts
- [ ] Build progression tracking
- [ ] Create basic collectible system
- [ ] Design simple personal space customization

## Phase 6: AI & Feedback Systems (4-5 weeks)

- [ ] Implement basic NLP for writing assessment
- [ ] Create feedback generation system
- [ ] Build peer review distribution algorithm
- [ ] Design writing analytics dashboard
- [ ] Implement moderation tools for peer reviews

## Phase 7: Polish & Integration (3-4 weeks)

- [ ] Refine UI/UX with basic themed elements
- [ ] Optimize performance for target devices
- [ ] Implement data synchronization
- [ ] Create onboarding experience
- [ ] Build basic teacher/parent dashboard
- [ ] Fix critical bugs and issues

## Phase 8: Testing & Launch Preparation (2-3 weeks)

- [ ] Conduct user testing with target audience
- [ ] Implement feedback from testing
- [ ] Prepare launch materials
- [ ] Finalize MVP feature set
- [ ] Create post-launch roadmap

## MVP Core Features Focus

### Writing Experience

- Basic REDI skill tree with fundamental lessons
- Simple OWL world map with starter quests
- Daily writing prompts system
- Basic AI feedback on writing
- Peer review functionality

### RPG Elements

- Character profiles with basic customization
- Simple progression system
- Basic inventory and collectibles
- Faction system with minimal features
- Achievement tracking

### Engagement Mechanics

- Streak tracking and daily quests
- Basic leaderboards
- Simple notification system
- Core social features

### Technical Foundation

- Cross-platform functionality
- Secure user data management
- Basic offline capabilities
- Performance optimization for target devices
