-- ScribexX Seed Data

-- Ensure content layers exist (if not already created in migrations)
INSERT INTO content_layers (id, name, description, order_index)
VALUES 
  (1, 'Mechanics & Grammar', 'Fundamentals of language mechanics, grammar, and punctuation', 1),
  (2, 'Sequencing & Logic', 'Organization, structure, and logical flow of writing', 2),
  (3, 'Voice & Rhetoric', 'Style, tone, audience awareness, and persuasive techniques', 3)
ON CONFLICT (id) DO NOTHING;

-- Seed lessons for Mechanics & Grammar layer
INSERT INTO lessons (id, slug, title, description, difficulty, content_layer_id, article, has_rich_content, published, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'punctuation-basics', 'Punctuation Basics', 'Learn the fundamentals of punctuation and how it affects meaning', 1, 1, 
   '# Punctuation Basics

Punctuation marks are essential tools that help readers understand written text. They indicate pauses, stops, questions, and more.

## The Period (.)

The period marks the end of a sentence. It signals a full stop.

```example
The cat sat on the mat.
```

## The Comma (,)

The comma indicates a brief pause within a sentence. It has several uses:

1. To separate items in a list: I bought apples, oranges, bananas, and grapes.
2. To separate independent clauses joined by a conjunction: I wanted to go to the park, but it started raining.
3. To set off introductory elements: After the storm, we assessed the damage.

## The Question Mark (?)

The question mark indicates a direct question.

```example
Where did you put my keys?
```

## The Exclamation Point (!)

The exclamation point shows strong emotion or emphasis.

```example
Watch out for that car!
```

## Practice

In the exercises that follow, you''ll practice identifying and using these punctuation marks correctly.', 
   true, true, 1),
  
  ('00000000-0000-0000-0000-000000000002', 'subject-verb-agreement', 'Subject-Verb Agreement', 'Master the rules of making subjects and verbs agree in your writing', 2, 1, 
   '# Subject-Verb Agreement

Subject-verb agreement means that the subject of a sentence and its verb must match in number (singular or plural).

## Basic Rules

1. **Singular subjects** take singular verbs:
   - The dog barks at strangers.
   - She writes poetry in her spare time.

2. **Plural subjects** take plural verbs:
   - The dogs bark at strangers.
   - They write poetry in their spare time.

## Tricky Situations

### Collective Nouns

Collective nouns (team, committee, family, etc.) usually take singular verbs:
- The team is playing well this season.
- My family is coming to visit.

### Compound Subjects

- When subjects are joined by "and," use a plural verb:
  - Tom and Jerry are always fighting.

- When subjects are joined by "or" or "nor," the verb agrees with the subject closest to it:
  - Either the students or the teacher is responsible.
  - Neither the teacher nor the students are prepared.

### Indefinite Pronouns

- Some indefinite pronouns are always singular: anyone, everyone, someone, nobody, each, either, neither
  - Everyone is welcome to attend.
  - Each of the students has a different opinion.

- Some indefinite pronouns are always plural: both, few, many, several
  - Both of the options are acceptable.
  - Many of the students were absent.

## Practice

The exercises that follow will help you master subject-verb agreement in various contexts.',
   true, true, 2),

-- Seed lessons for Sequencing & Logic layer
  ('00000000-0000-0000-0000-000000000003', 'paragraph-structure', 'Paragraph Structure', 'Learn how to build effective paragraphs with clear organization', 1, 2, 
   '# Paragraph Structure

A well-structured paragraph presents and develops a single main idea. It helps readers follow your thinking and strengthens your overall writing.

## Essential Elements

### Topic Sentence

The topic sentence states the main idea of the paragraph. It usually appears at the beginning and tells readers what to expect.

```example
*Regular exercise offers numerous health benefits.*
```

### Supporting Details

Supporting details develop the main idea through:
- Examples
- Facts and statistics
- Explanations
- Quotations

```example
*Studies show that just 30 minutes of daily physical activity can reduce the risk of heart disease by up to 30%. Walking, swimming, and cycling are all excellent options that require minimal equipment. According to Dr. Smith, a cardiologist at City Hospital, "Even moderate exercise, when done consistently, can significantly improve cardiovascular health."*
```

### Concluding Sentence

A concluding sentence wraps up the paragraph or transitions to the next one.

```example
*With so many easy ways to incorporate movement into daily routines, everyone can enjoy these health advantages.*
```

## Paragraph Unity

Every sentence in a paragraph should relate to the main idea. If you find yourself drifting to a different topic, you probably need a new paragraph.

## Paragraph Coherence

Sentences should flow logically from one to the next. Use transition words to show relationships between ideas:
- To add information: additionally, furthermore, moreover
- To show sequence: first, next, finally
- To show cause and effect: therefore, consequently, as a result
- To contrast: however, nevertheless, on the other hand

## Practice

The exercises that follow will help you identify and create well-structured paragraphs with clear organization.',
   true, true, 1),
  
  ('00000000-0000-0000-0000-000000000004', 'logical-transitions', 'Logical Transitions', 'Master the art of connecting ideas smoothly in your writing', 2, 2, 
   '# Logical Transitions

Transitions are words, phrases, or sentences that connect ideas and show their relationships. They help readers follow your thinking and make your writing flow smoothly.

## Types of Transitions

### To Add Information
- Additionally
- Furthermore
- Moreover
- In addition
- Also

```example
*The new policy will reduce costs. Additionally, it will improve efficiency.*
```

### To Show Sequence
- First, second, third
- Next, then, finally
- Meanwhile
- Subsequently
- Later

```example
*First, preheat the oven. Next, mix the ingredients. Finally, bake for 30 minutes.*
```

### To Show Cause and Effect
- Therefore
- Consequently
- As a result
- Thus
- Hence

```example
*He didn''t study for the test. Consequently, he failed.*
```

### To Compare
- Similarly
- Likewise
- In the same way
- Just as

```example
*The novel explores themes of identity. Similarly, the author''s earlier works examine self-discovery.*
```

### To Contrast
- However
- Nevertheless
- On the other hand
- In contrast
- Yet
- Although

```example
*The price was high. However, the quality justified the cost.*
```

### To Provide Examples
- For example
- For instance
- To illustrate
- Specifically
- Such as

```example
*Many fruits are rich in vitamin C. For example, oranges and strawberries are excellent sources.*
```

## Using Transitions Effectively

- Don''t overuse transitions—they should clarify relationships, not clutter your writing
- Choose transitions that accurately reflect the relationship between ideas
- Vary your transitions to keep your writing interesting

## Practice

The exercises that follow will help you use transitions effectively to connect ideas in your writing.',
   true, true, 2),

-- Seed lessons for Voice & Rhetoric layer
  ('00000000-0000-0000-0000-000000000005', 'understanding-audience', 'Understanding Audience', 'Learn how to adapt your writing for different readers', 1, 3, 
   '# Understanding Audience

Effective writing considers who will read it. When you understand your audience, you can make better choices about content, tone, vocabulary, and structure.

## Why Audience Matters

The same information might be presented differently depending on who will read it:
- A scientific discovery might be explained with technical terminology in a journal article for experts
- The same discovery might be explained with simpler language and analogies in a magazine for the general public
- For children, it might be presented with colorful illustrations and very simple explanations

## Key Audience Factors to Consider

### Knowledge Level
- What does your audience already know about the topic?
- What terms will they understand without explanation?
- What background information do they need?

### Interests and Concerns
- Why is your audience reading your writing?
- What questions do they want answered?
- What problems do they want solved?

### Demographics
- Age range
- Educational background
- Cultural context
- Professional field

## Adapting Your Writing

### Vocabulary and Terminology
- Technical for experts
- Defined terms for novices
- Simpler words for general audiences

### Tone and Style
- Formal for academic or professional contexts
- Conversational for blogs or personal essays
- Enthusiastic for persuasive pieces

### Content Focus
- Emphasize what matters most to your specific audience
- Include details relevant to their needs and interests
- Omit information that isn''t useful to them

## Practice

The exercises that follow will help you analyze audiences and adapt your writing appropriately.',
   true, true, 1),
  
  ('00000000-0000-0000-0000-000000000006', 'developing-voice', 'Developing Voice', 'Discover techniques to create a distinctive writing style', 2, 3, 
   '# Developing Voice

Voice in writing is the distinctive style that makes your writing uniquely yours. It reflects your personality, perspective, and approach to communication.

## Elements of Voice

### Word Choice
The words you choose contribute significantly to your voice:
- Formal vs. casual vocabulary
- Simple vs. complex words
- Field-specific terminology vs. general language
- Concrete vs. abstract terms

### Sentence Structure
- Short, punchy sentences create energy and emphasis
- Longer, more complex sentences can convey nuance and sophistication
- Varying sentence length creates rhythm
- Sentence fragments can add emphasis (when used intentionally)

### Tone
Tone reflects your attitude toward your subject and audience:
- Serious or playful
- Formal or casual
- Enthusiastic or reserved
- Optimistic or skeptical

## Finding Your Voice

1. **Read widely** to expose yourself to different writing styles
2. **Analyze writers you admire** to understand what makes their voice distinctive
3. **Write regularly** to develop and refine your natural style
4. **Experiment** with different approaches to find what feels authentic
5. **Get feedback** from readers about how your writing comes across

## Adapting Voice for Purpose

While maintaining your authentic style, you may need to adjust your voice for different:
- Genres (academic papers vs. personal essays)
- Audiences (experts vs. general readers)
- Purposes (informing vs. persuading)

## Practice

The exercises that follow will help you analyze voice in others'' writing and develop your own distinctive style.',
   true, true, 2);

-- Seed exercises for Punctuation Basics lesson
INSERT INTO exercises (id, lesson_id, title, description, exercise_type, content, solution, order_index, points)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'End Punctuation', 'Identify the correct end punctuation for each sentence', 'multiple_choice',
   'Choose the correct end punctuation for each sentence:

1. The movie starts at 8:00 PM
2. Did you remember to lock the door
3. Watch out for that car
4. Please send me the report by Friday',
   '{
     "questions": [
       {
         "id": 1,
         "options": [".", "?", "!"],
         "correctIndex": 0,
         "explanation": "This is a statement, so it needs a period."
       },
       {
         "id": 2,
         "options": [".", "?", "!"],
         "correctIndex": 1,
         "explanation": "This is a question, so it needs a question mark."
       },
       {
         "id": 3,
         "options": [".", "?", "!"],
         "correctIndex": 2,
         "explanation": "This is an exclamation or warning, so it needs an exclamation point."
       },
       {
         "id": 4,
         "options": [".", "?", "!"],
         "correctIndex": 0,
         "explanation": "This is a request or command, which still uses a period."
       }
     ]
   }',
   1, 10),
   
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Comma Usage', 'Practice using commas correctly in various contexts', 'fill_blank',
   'Add commas where needed in the following sentences:

1. After the storm passed we went outside to assess the damage.
2. I need to buy milk eggs bread and cheese at the store.
3. The restaurant which opened last month is already very popular.
4. No I don''t think that''s a good idea.',
   '{
     "blanks": [
       {
         "id": 1,
         "original": "After the storm passed we went outside to assess the damage.",
         "corrected": "After the storm passed, we went outside to assess the damage.",
         "explanation": "Use a comma after an introductory phrase."
       },
       {
         "id": 2,
         "original": "I need to buy milk eggs bread and cheese at the store.",
         "corrected": "I need to buy milk, eggs, bread, and cheese at the store.",
         "explanation": "Use commas to separate items in a list."
       },
       {
         "id": 3,
         "original": "The restaurant which opened last month is already very popular.",
         "corrected": "The restaurant, which opened last month, is already very popular.",
         "explanation": "Use commas to set off a non-restrictive clause."
       },
       {
         "id": 4,
         "original": "No I don''t think that''s a good idea.",
         "corrected": "No, I don''t think that''s a good idea.",
         "explanation": "Use a comma after introductory words like yes, no, well, etc."
       }
     ]
   }',
   2, 10);

-- Seed exercises for Subject-Verb Agreement lesson
INSERT INTO exercises (id, lesson_id, title, description, exercise_type, content, solution, order_index, points)
VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', 'Basic Agreement', 'Practice making subjects and verbs agree in number', 'multiple_choice',
   'Choose the correct verb form for each sentence:

1. The dog _____ at the mailman every day.
   a) bark
   b) barks

2. The students _____ working on their projects.
   a) is
   b) are

3. My family _____ going on vacation next week.
   a) is
   b) are

4. Neither the teacher nor the students _____ prepared for the test.
   a) was
   b) were',
   '{
     "questions": [
       {
         "id": 1,
         "options": ["bark", "barks"],
         "correctIndex": 1,
         "explanation": "\"Dog\" is singular, so it takes the singular verb \"barks.\""
       },
       {
         "id": 2,
         "options": ["is", "are"],
         "correctIndex": 1,
         "explanation": "\"Students\" is plural, so it takes the plural verb \"are.\""
       },
       {
         "id": 3,
         "options": ["is", "are"],
         "correctIndex": 0,
         "explanation": "\"Family\" is a collective noun that typically takes a singular verb in American English."
       },
       {
         "id": 4,
         "options": ["was", "were"],
         "correctIndex": 1,
         "explanation": "When subjects are joined by \"or\" or \"nor,\" the verb agrees with the subject closest to it. Here, \"students\" is plural, so use \"were.\""
       }
     ]
   }',
   1, 10),
   
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', 'Complex Agreement', 'Practice subject-verb agreement in more complex sentences', 'fill_blank',
   'Fill in the blanks with the correct form of the verb in parentheses:

1. Each of the students _____ (have) a different opinion on the topic.
2. A number of issues _____ (need) to be addressed before we proceed.
3. The committee _____ (disagree) about how to proceed with the project.
4. Not only the teacher but also the students _____ (enjoy) the field trip.',
   '{
     "blanks": [
       {
         "id": 1,
         "correctAnswers": ["has"],
         "explanation": "\"Each\" is singular and takes a singular verb, regardless of the prepositional phrase that follows."
       },
       {
         "id": 2,
         "correctAnswers": ["need"],
         "explanation": "\"A number of\" is followed by a plural noun and takes a plural verb."
       },
       {
         "id": 3,
         "correctAnswers": ["disagrees", "is disagreeing"],
         "explanation": "\"Committee\" is a collective noun that typically takes a singular verb."
       },
       {
         "id": 4,
         "correctAnswers": ["enjoyed", "enjoy"],
         "explanation": "With \"not only X but also Y,\" the verb agrees with Y (\"students\"), which is plural."
       }
     ]
   }',
   2, 10);

-- Seed exercises for Paragraph Structure lesson
INSERT INTO exercises (id, lesson_id, title, description, exercise_type, content, solution, order_index, points)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000003', 'Identify Paragraph Elements', 'Practice identifying the parts of a well-structured paragraph', 'multiple_choice',
   'Read the following paragraph and answer the questions:

"Regular exercise provides numerous benefits for physical health. Studies show that just 30 minutes of daily activity can reduce the risk of heart disease by up to 30%. Additionally, exercise helps maintain healthy weight and improves muscle strength and endurance. It can also boost your immune system, making you less susceptible to common illnesses. With so many advantages, incorporating regular physical activity into your routine is clearly worthwhile."

1. Which sentence is the topic sentence?
2. Which of the following is NOT a supporting detail in this paragraph?
3. Which sentence is the concluding sentence?',
   '{
     "questions": [
       {
         "id": 1,
         "options": [
           "Regular exercise provides numerous benefits for physical health.",
           "Studies show that just 30 minutes of daily activity can reduce the risk of heart disease by up to 30%.",
           "Additionally, exercise helps maintain healthy weight and improves muscle strength and endurance.",
           "With so many advantages, incorporating regular physical activity into your routine is clearly worthwhile."
         ],
         "correctIndex": 0,
         "explanation": "The topic sentence states the main idea of the paragraph, which is that exercise has many health benefits."
       },
       {
         "id": 2,
         "options": [
           "Exercise reduces the risk of heart disease.",
           "Exercise helps maintain healthy weight.",
           "Exercise improves muscle strength and endurance.",
           "Exercise can be difficult to fit into a busy schedule."
         ],
         "correctIndex": 3,
         "explanation": "The paragraph does not mention anything about fitting exercise into a busy schedule."
       },
       {
         "id": 3,
         "options": [
           "Regular exercise provides numerous benefits for physical health.",
           "It can also boost your immune system, making you less susceptible to common illnesses.",
           "With so many advantages, incorporating regular physical activity into your routine is clearly worthwhile.",
           "None of the above"
         ],
         "correctIndex": 2,
         "explanation": "The concluding sentence summarizes the main point and suggests a course of action based on the information presented."
       }
     ]
   }',
   1, 10),
   
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000003', 'Create a Structured Paragraph', 'Practice writing a well-organized paragraph', 'free_response',
   'Write a well-structured paragraph about a hobby or activity you enjoy. Include:
   
1. A clear topic sentence that states your main idea
2. At least three supporting details (examples, facts, or explanations)
3. A concluding sentence that wraps up your thoughts

Your paragraph should be 5-7 sentences long.',
   '{
     "evaluation_criteria": [
       {
         "criterion": "Topic Sentence",
         "weight": 25,
         "description": "Includes a clear topic sentence that states the main idea"
       },
       {
         "criterion": "Supporting Details",
         "weight": 40,
         "description": "Provides at least three relevant supporting details that develop the main idea"
       },
       {
         "criterion": "Concluding Sentence",
         "weight": 25,
         "description": "Includes an effective concluding sentence that summarizes or reinforces the main idea"
       },
       {
         "criterion": "Unity and Coherence",
         "weight": 10,
         "description": "All sentences relate to the main idea and flow logically from one to the next"
       }
     ],
     "example_solution": "Reading science fiction novels is my favorite way to relax and expand my imagination. The genre allows me to explore futuristic worlds and technologies that might someday become reality. Authors like Isaac Asimov and Ursula K. Le Guin create complex societies that comment on our own world in thought-provoking ways. Additionally, science fiction often addresses philosophical questions about consciousness, humanity, and our place in the universe. These mental journeys through time and space provide both entertainment and intellectual stimulation that few other hobbies can match."
   }',
   2, 15);

-- Seed exercises for other lessons (abbreviated for brevity)
-- You would continue with similar patterns for the remaining lessons
