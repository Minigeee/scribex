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
Regular exercise offers numerous health benefits.
```

### Supporting Details

Supporting details develop the main idea through:
- Examples
- Facts and statistics
- Explanations
- Quotations

```example
Studies show that just 30 minutes of daily physical activity can reduce the risk of heart disease by up to 30%. Walking, swimming, and cycling are all excellent options that require minimal equipment. According to Dr. Smith, a cardiologist at City Hospital, "Even moderate exercise, when done consistently, can significantly improve cardiovascular health."
```

### Concluding Sentence

A concluding sentence wraps up the paragraph or transitions to the next one.

```example
With so many easy ways to incorporate movement into daily routines, everyone can enjoy these health advantages.
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

-- Add a rewrite exercise for Logical Transitions lesson
INSERT INTO exercises (id, lesson_id, title, description, exercise_type, content, solution, order_index, points)
VALUES
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000004', 'Improve Paragraph Transitions', 'Practice improving the flow between sentences using appropriate transitions', 'rewrite',
   'Rewrite the following paragraph to improve the transitions between sentences. The ideas are not well connected, making the paragraph choppy and difficult to follow:

"I went to the store. I needed to buy groceries. The store was crowded. I had to wait in line for a long time. I forgot my shopping list at home. I tried to remember what I needed. I bought milk and bread. I also got some fruit. The cashier was friendly. It started raining when I left. I got wet walking to my car."',
   '{
     "criteria": [
       "Use appropriate transition words to show sequence (first, then, after that, finally, etc.)",
       "Combine some short, choppy sentences into longer, more complex ones",
       "Create logical connections between related ideas",
       "Maintain all the key information from the original paragraph",
       "Ensure the paragraph flows smoothly from beginning to end"
     ],
     "example_solution": "I went to the store because I needed to buy groceries, but unfortunately, I had forgotten my shopping list at home. When I arrived, the store was extremely crowded, so I had to wait in line for a long time. Despite not having my list, I tried to remember what I needed and managed to buy essential items like milk and bread, as well as some fresh fruit. Fortunately, the cashier was friendly, which made the checkout process more pleasant. However, as soon as I left the store, it started raining heavily, and I got completely wet walking to my car."
   }',
   1, 15),
   
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000004', 'Identify Transition Types', 'Practice identifying different types of transitions and their functions', 'multiple_choice',
   'For each sentence pair, identify the type of relationship that the transition word establishes:

1. "The cost of the project exceeded our budget. Therefore, we had to scale back our plans."
2. "She practiced for months before the recital. As a result, her performance was flawless."
3. "I enjoy hiking in the mountains. Similarly, my brother loves outdoor activities."
4. "The restaurant has excellent food. However, the service is quite slow."',
   '{
     "questions": [
       {
         "id": 1,
         "options": [
           "Addition",
           "Cause and effect",
           "Comparison",
           "Contrast"
         ],
         "correctIndex": 1,
         "explanation": "\"Therefore\" indicates a cause-and-effect relationship: the high cost (cause) led to scaling back plans (effect)."
       },
       {
         "id": 2,
         "options": [
           "Addition",
           "Cause and effect",
           "Sequence",
           "Example"
         ],
         "correctIndex": 1,
         "explanation": "\"As a result\" shows that the practice (cause) led to the flawless performance (effect)."
       },
       {
         "id": 3,
         "options": [
           "Addition",
           "Cause and effect",
           "Comparison",
           "Contrast"
         ],
         "correctIndex": 2,
         "explanation": "\"Similarly\" indicates a comparison between the speaker''s enjoyment of hiking and the brother''s love of outdoor activities."
       },
       {
         "id": 4,
         "options": [
           "Addition",
           "Cause and effect",
           "Comparison",
           "Contrast"
         ],
         "correctIndex": 3,
         "explanation": "\"However\" signals a contrast between the excellent food and the slow service."
       }
     ]
   }',
   2, 10);

-- Add exercises for Understanding Audience lesson
INSERT INTO exercises (id, lesson_id, title, description, exercise_type, content, solution, order_index, points)
VALUES
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000005', 'Audience Analysis', 'Practice identifying appropriate content for different audiences', 'multiple_choice',
   'For each scenario, select the most appropriate approach based on the audience:

1. You are writing an article about climate change for a scientific journal read by environmental researchers.
2. You are creating content about healthy eating habits for a website aimed at elementary school children.
3. You are preparing a presentation about a new software feature for non-technical company executives.
4. You are writing instructions for assembling furniture for the general public.',
   '{
     "questions": [
       {
         "id": 1,
         "options": [
           "Include colorful illustrations and simple analogies comparing climate systems to everyday objects",
           "Use technical terminology, cite recent peer-reviewed studies, and include detailed statistical analyses",
           "Focus on the business implications and potential profit opportunities related to climate change",
           "Emphasize personal stories about how climate change has affected individual families"
         ],
         "correctIndex": 1,
         "explanation": "For a scientific journal read by experts, technical terminology, recent studies, and statistical analyses are appropriate and expected."
       },
       {
         "id": 2,
         "options": [
           "Use bright colors, simple language, fun characters, and interactive elements",
           "Include detailed nutritional information with precise calorie counts and vitamin percentages",
           "Focus on the long-term health implications of poor dietary choices",
           "Cite scientific studies about metabolism and digestive processes"
         ],
         "correctIndex": 0,
         "explanation": "For elementary school children, engaging visuals, simple language, and fun elements will be most effective."
       },
       {
         "id": 3,
         "options": [
           "Provide a detailed technical breakdown of how the feature was coded",
           "Focus exclusively on the technical specifications without explaining business benefits",
           "Emphasize business benefits, ROI, and competitive advantages with minimal technical jargon",
           "Use highly specialized industry terminology without explaining it"
         ],
         "correctIndex": 2,
         "explanation": "For non-technical executives, focusing on business benefits and ROI while minimizing technical jargon is most appropriate."
       },
       {
         "id": 4,
         "options": [
           "Use industry-specific terminology familiar only to professional furniture makers",
           "Include clear step-by-step instructions with helpful visuals and minimal jargon",
           "Write a lengthy theoretical explanation of furniture design principles",
           "Focus primarily on the history and cultural significance of the furniture style"
         ],
         "correctIndex": 1,
         "explanation": "For the general public, clear step-by-step instructions with helpful visuals and minimal jargon will be most effective."
       }
     ]
   }',
   1, 10),
   
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000005', 'Adapting Content for Different Audiences', 'Practice rewriting content for different audiences', 'rewrite',
   'The following paragraph is from a scientific article about sleep hygiene. Rewrite it for a blog aimed at busy parents of young children. Make it more accessible, practical, and relevant to this specific audience:

"Recent studies in the field of chronobiology suggest that exposure to blue light wavelengths (460-480 nm) from electronic devices inhibits melatonin production, potentially disrupting circadian rhythms. Research subjects exposed to blue light for four hours before their typical sleep onset time demonstrated a 50% reduction in melatonin secretion compared to control groups. Consequently, sleep latency increased by approximately 22 minutes, and REM sleep percentage decreased significantly."',
   '{
     "criteria": [
       "Use language that is accessible to non-scientists",
       "Replace technical terms with everyday language when possible",
       "Include practical advice relevant to parents",
       "Maintain the key information about blue light and sleep",
       "Use a more conversational, engaging tone",
       "Consider the specific challenges and concerns of parents"
     ],
     "example_solution": "Having trouble getting your kids (or yourself) to sleep after evening screen time? You''re not alone! Recent research shows that the blue light coming from phones, tablets, and computers can make it harder to fall asleep. When we''re exposed to this light in the evening, our bodies produce less melatonin—the natural hormone that helps us feel sleepy. In fact, studies found that people who used devices with blue light for a few hours before bedtime took about 20 minutes longer to fall asleep and had lower quality sleep overall. For busy parents, this means both you and your children might benefit from a ''screen curfew'' at least an hour before bedtime. Try replacing that pre-bed tablet time with reading a physical book to your little ones instead—your whole family might sleep better as a result!"
   }',
   2, 15),
   
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000005', 'Identifying Audience Needs', 'Practice identifying what different audiences need from your writing', 'fill_blank',
   'Complete each sentence with the most appropriate consideration for the given audience:

1. When writing for technical experts in your field, you should focus on _____.
2. When writing for children ages 8-12, you should consider _____.
3. When writing for busy professionals, you should prioritize _____.
4. When writing for an international audience with varying levels of English proficiency, you should _____.
5. When writing for senior citizens, you might need to _____.
',
   '{
     "blanks": [
       {
         "id": 1,
         "original": "When writing for technical experts in your field, you should focus on _____.",
         "corrected": "When writing for technical experts in your field, you should focus on providing detailed, accurate information with appropriate technical terminology and references to current research.",
         "explanation": "Technical experts value precision, depth, and currency of information in their field."
       },
       {
         "id": 2,
         "original": "When writing for children ages 8-12, you should consider _____.",
         "corrected": "When writing for children ages 8-12, you should consider using simpler vocabulary, shorter sentences, engaging examples, and visual elements to maintain interest.",
         "explanation": "Children in this age range have developing reading skills and benefit from clear, engaging content with visual support."
       },
       {
         "id": 3,
         "original": "When writing for busy professionals, you should prioritize _____.",
         "corrected": "When writing for busy professionals, you should prioritize concise, scannable content with clear headings, bullet points, and actionable information.",
         "explanation": "Busy professionals need to extract key information quickly and efficiently."
       },
       {
         "id": 4,
         "original": "When writing for an international audience with varying levels of English proficiency, you should _____.",
         "corrected": "When writing for an international audience with varying levels of English proficiency, you should avoid idioms, slang, and cultural references that might not translate well.",
         "explanation": "International audiences may struggle with language elements that are culturally specific or idiomatic."
       },
       {
         "id": 5,
         "original": "When writing for senior citizens, you might need to _____.",
         "corrected": "When writing for senior citizens, you might need to use larger font sizes, high contrast colors, clear language, and avoid assuming familiarity with recent technology.",
         "explanation": "Senior citizens may have different visual needs and varying levels of comfort with newer technologies."
       }
     ]
   }',
   3, 10);

-- Add exercise for Developing Voice lesson
INSERT INTO exercises (id, lesson_id, title, description, exercise_type, content, solution, order_index, points)
VALUES
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000006', 'Analyzing and Developing Voice', 'Practice identifying and developing your own writing voice', 'free_response',
   'This exercise has two parts:

Part 1: Analyze the voice in the following paragraph:

"Listen, I''ve been around the block a few times when it comes to cooking disasters. Trust me. That time I set off the smoke alarm making toast? Just the beginning. There was the Great Spaghetti Explosion of 2018, the Infamous Blender Incident (we don''t talk about that one), and let''s not forget when I somehow managed to burn water. WATER! How is that even possible? But here''s the thing—I keep trying. Because sometimes, just sometimes, I create something edible. And those rare victories? Absolutely worth all the chaos."

Identify at least three specific elements that contribute to this writer''s distinctive voice.

Part 2: Write a short paragraph (5-7 sentences) about a hobby or interest of yours, deliberately using a voice that feels authentic to you. Think about your word choice, sentence structure, and tone as you write.',
   '{
     "evaluation_criteria": [
       {
         "criterion": "Voice Analysis",
         "weight": 40,
         "description": "Accurately identifies specific elements of voice in the example paragraph (such as casual language, humor, use of questions, varied sentence length, personal anecdotes, etc.)"
       },
       {
         "criterion": "Voice Development",
         "weight": 40,
         "description": "Creates a paragraph with a consistent, distinctive voice that reflects personal style"
       },
       {
         "criterion": "Self-Awareness",
         "weight": 20,
         "description": "Demonstrates awareness of how specific writing choices contribute to voice"
       }
     ],
     "example_solution": "Part 1: The writer''s voice in this paragraph is distinctive in several ways. First, they use casual, conversational language with phrases like \"Listen\" and \"Trust me\" that directly address the reader. Second, they employ humor and self-deprecation throughout, especially when describing cooking failures. Third, they use varied sentence structures, including questions (\"How is that even possible?\") and exclamations (\"WATER!\") for emphasis. The voice also incorporates personal anecdotes with creative naming conventions (\"The Great Spaghetti Explosion of 2018\") that add personality and memorability.\n\nPart 2: I''ve always been drawn to photography, not the technical, equipment-obsessed variety, but the quiet, observational kind. My camera isn''t particularly fancy—it''s the seeing that matters to me, not the gear. I find myself pausing at moments others rush past: the way late afternoon light transforms ordinary objects into something almost sacred, how shadows create geometries that weren''t there before, the fleeting expressions that cross a face when someone thinks they''re unobserved. Sometimes I go weeks without taking a single photo, then capture fifty in a single hour when the world suddenly reveals itself in a new way. For me, photography isn''t about documenting reality; it''s about discovering it."
   }',
   1, 20);

-- Seed exercises for other lessons (abbreviated for brevity)
-- You would continue with similar patterns for the remaining lessons


-- Skill Tree

-- Seed file for Sequencing & Logic skill tree
-- This adds lessons and skill tree nodes for the Sequencing & Logic layer

-- First, ensure we have the Sequencing & Logic content layer
INSERT INTO content_layers (id, name, description, order_index)
VALUES 
  (2, 'Sequencing & Logic', 'Organization, structure, and logical flow of writing', 2)
ON CONFLICT (id) DO NOTHING;

-- Basic Paragraph Structure branch
INSERT INTO lessons (id, slug, title, description, difficulty, content_layer_id, article, has_rich_content, published, order_index)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'basic-paragraph-structure', 'Basic Paragraph Structure', 'Learn the fundamental components of a well-structured paragraph', 1, 2, 
   '# Basic Paragraph Structure

A paragraph is a group of related sentences that develop a single main idea. Understanding the basic structure of a paragraph is essential for effective writing.

## Components of a Paragraph

### Topic Sentence
The topic sentence introduces the main idea of the paragraph. It tells the reader what the paragraph will be about.

```example
The beach is my favorite place to relax and recharge.
```

### Supporting Details
Supporting details develop the main idea through examples, facts, explanations, or descriptions.

```example
The sound of waves crashing against the shore helps me clear my mind. The warm sand between my toes connects me to nature. The vast horizon reminds me that my problems are small in the grand scheme of things.
```

### Concluding Sentence
The concluding sentence wraps up the paragraph by restating the main idea or providing a final thought.

```example
These sensory experiences make the beach the perfect escape from my busy life.
```

## Paragraph Unity
Every sentence in a paragraph should relate to the main idea. If you find yourself drifting to a different topic, you probably need to start a new paragraph.

## Practice
In the exercises that follow, you''ll practice identifying and creating well-structured paragraphs with clear organization.',
   true, true, 1),

  ('10000000-0000-0000-0000-000000000002', 'topic-sentences', 'Topic Sentences', 'Craft effective opening sentences that establish the main idea of a paragraph', 1, 2, 
   '# Topic Sentences

A topic sentence is the most important sentence in a paragraph. It states the main idea and sets the direction for the entire paragraph.

## Characteristics of Effective Topic Sentences

### Clear and Focused
A good topic sentence clearly states what the paragraph will discuss.

```example
Poor: There are many things to consider about exercise.
Better: Regular exercise offers numerous health benefits.
```

### Neither Too Broad nor Too Narrow
The topic sentence should be specific enough to be covered in one paragraph, but not so narrow that there''s nothing to develop.

```example
Too Broad: Technology has changed the world.
Too Narrow: My new smartphone has 128GB of storage.
Just Right: Modern smartphones have revolutionized how we communicate.
```

### Engaging
When possible, make your topic sentence interesting to capture the reader''s attention.

```example
Bland: Dogs make good pets.
Engaging: The loyalty and affection of dogs make them incomparable companions.
```

## Placement
While topic sentences typically appear at the beginning of a paragraph, they can sometimes be placed in the middle or end for variety or emphasis.

## Practice
The exercises that follow will help you identify and create effective topic sentences for various types of paragraphs.',
   true, true, 2),

  ('10000000-0000-0000-0000-000000000003', 'supporting-details', 'Supporting Details', 'Select and organize relevant details that support the main idea', 1, 2, 
   '# Supporting Details

Supporting details develop the main idea stated in the topic sentence. They provide evidence, examples, facts, and explanations that help readers understand and accept your point.

## Types of Supporting Details

### Examples
Specific instances that illustrate your point.

```example
Topic: Coffee shops are ideal for studying.
Supporting Example: Last week, I completed an entire research paper at JavaHouse while enjoying the ambient background noise and unlimited refills.
```

### Facts and Statistics
Verifiable information that adds credibility.

```example
Topic: Exercise improves mental health.
Supporting Fact: According to a 2018 study in The Lancet, people who exercise regularly report 43% fewer days of poor mental health.
```

### Explanations
Clarifications that help readers understand complex ideas.

```example
Topic: Photosynthesis is essential for life on Earth.
Supporting Explanation: During photosynthesis, plants convert carbon dioxide into oxygen, which animals need to breathe, creating a vital cycle that sustains all life.
```

### Descriptions
Sensory details that help readers visualize or experience what you''re discussing.

```example
Topic: The Grand Canyon is an awe-inspiring natural wonder.
Supporting Description: Standing at the rim, visitors can see layers of red and orange rock stretching for miles, with the Colorado River appearing as a thin blue ribbon a mile below.
```

## Relevance and Organization
All supporting details should clearly relate to the main idea. Organize them logically—chronologically, by importance, or by category—depending on your purpose.

## Practice
The exercises that follow will help you identify, select, and organize effective supporting details for various types of paragraphs.',
   true, true, 3),

  ('10000000-0000-0000-0000-000000000004', 'concluding-sentences', 'Concluding Sentences', 'Create effective paragraph closures that reinforce the main idea', 1, 2, 
   '# Concluding Sentences

A concluding sentence brings closure to a paragraph by summarizing the main idea, offering a final thought, or transitioning to the next paragraph.

## Functions of Concluding Sentences

### Summarize the Main Idea
Restate the main point of the paragraph in different words.

```example
Topic Sentence: Regular exercise offers numerous health benefits.
Concluding Sentence: With so many positive effects on physical and mental wellbeing, maintaining an active lifestyle is clearly worthwhile.
```

### Provide a Final Thought
Offer an insight, implication, or call to action related to your main idea.

```example
Topic Sentence: Plastic pollution threatens marine ecosystems worldwide.
Concluding Sentence: Unless we dramatically reduce our plastic consumption, future generations may inherit oceans with more plastic than fish.
```

### Transition to the Next Paragraph
Signal a shift to a related topic in the next paragraph.

```example
Topic Sentence: Social media has transformed how teenagers communicate.
Concluding Sentence: While these communication changes are significant, the impact of social media on teenagers'' mental health is even more profound.
```

## What to Avoid
- Introducing completely new ideas
- Simply repeating the topic sentence word for word
- Ending abruptly without any sense of closure

## Practice
The exercises that follow will help you create effective concluding sentences for various types of paragraphs.',
   true, true, 4),

-- Mid-level skills
  ('10000000-0000-0000-0000-000000000005', 'thesis-statements', 'Thesis Statements', 'Develop clear, focused thesis statements that guide entire essays', 2, 2, 
   '# Thesis Statements

A thesis statement is the central claim or argument of an essay. It tells readers what your paper is about and what position you''ll take on the topic.

## Characteristics of Effective Thesis Statements

### Clear and Specific
A good thesis makes a clear, specific claim that can be supported with evidence.

```example
Vague: Social media is bad for society.
Specific: The dopamine-driven feedback loops in social media platforms contribute to increased anxiety and decreased attention spans among teenagers.
```

### Debatable
Your thesis should present a claim that someone could reasonably disagree with.

```example
Not Debatable: World War II ended in 1945.
Debatable: The dropping of atomic bombs on Japan was not militarily necessary to end World War II.
```

### Focused
Your thesis should be narrow enough to cover thoroughly in your essay.

```example
Too Broad: Technology has changed education.
Focused: One-to-one laptop programs in high schools improve student engagement and academic performance in STEM subjects.
```

## Types of Thesis Statements

### Analytical
Breaks down an issue or idea into components and evaluates it.

```example
In "The Great Gatsby," Fitzgerald uses the character of Jay Gatsby to critique the hollowness of the American Dream in the 1920s.
```

### Argumentative
Takes a position on a debatable issue and explains why readers should accept your position.

```example
Because of its environmental impact, economic inefficiency, and ethical concerns, factory farming should be phased out in favor of more sustainable agricultural practices.
```

### Expository
Explains a topic or process to the reader.

```example
The process of photosynthesis involves three main stages: light absorption, ATP production, and carbon fixation.
```

## Placement
In most academic writing, the thesis appears at the end of the introduction, but it can sometimes be effective to place it elsewhere for rhetorical effect.

## Practice
The exercises that follow will help you develop effective thesis statements for various types of essays.',
   true, true, 5),

  ('10000000-0000-0000-0000-000000000006', 'argumentative-structure', 'Argumentative Structure', 'Organize claims, evidence, and reasoning in logical sequences', 3, 2, 
   '# Argumentative Structure

Effective argumentation requires a logical structure that guides readers through your claims, evidence, and reasoning.

## The Toulmin Model of Argument

### Claim
The main point or position you''re arguing for.

```example
Claim: Public transportation should be free in major cities.
```

### Evidence
Facts, statistics, examples, or expert opinions that support your claim.

```example
Evidence: Studies show that cities with free public transit have seen a 30% reduction in traffic congestion and a 25% decrease in carbon emissions.
```

### Warrant
The logical connection between your evidence and claim—often implicit.

```example
Warrant: Reducing traffic congestion and carbon emissions are desirable outcomes that justify making public transportation free.
```

### Backing
Additional support for your warrant.

```example
Backing: Traffic congestion costs the average commuter 54 hours and $1,080 annually in wasted time and fuel.
```

### Qualifiers
Limitations on your claim.

```example
Qualifier: While free public transportation may not be feasible in all cities, those with populations over 500,000 should implement it.
```

### Counterarguments and Rebuttals
Acknowledging opposing viewpoints and responding to them.

```example
Counterargument: Free public transportation would be too expensive for cities to maintain.
Rebuttal: The costs would be offset by reduced road maintenance, decreased healthcare expenses from improved air quality, and economic benefits from increased mobility.
```

## Common Argument Structures

### Classical (Aristotelian)
Introduction → Background → Claims → Counterargument → Refutation → Conclusion

### Rogerian
Introduction → Summary of Opposing Views → Statement of Understanding → Your Position → Benefits to Opponents → Conclusion

### Problem-Solution
Introduction → Problem Description → Solution Proposal → Solution Benefits → Addressing Potential Objections → Conclusion

## Practice
The exercises that follow will help you structure effective arguments using these models.',
   true, true, 6),

  ('10000000-0000-0000-0000-000000000007', 'logical-fallacies', 'Logical Fallacies', 'Identify and avoid common reasoning errors in argumentation', 3, 2, 
   '# Logical Fallacies

Logical fallacies are errors in reasoning that weaken arguments. Recognizing and avoiding these fallacies strengthens your writing and critical thinking.

## Common Logical Fallacies

### Ad Hominem
Attacking the person instead of addressing their argument.

```example
"You can''t trust Dr. Smith''s research on climate change because she drives an SUV."
```

### Straw Man
Misrepresenting someone''s argument to make it easier to attack.

```example
Person A: "We should invest more in public education."
Person B: "So you think throwing money at schools will solve all problems? That''s naive."
```

### False Dichotomy
Presenting only two options when more exist.

```example
"Either we cut environmental regulations, or we lose jobs. There''s no other way."
```

### Slippery Slope
Arguing that one small step will inevitably lead to extreme consequences.

```example
"If we ban assault weapons, soon all guns will be illegal, and then the government will take away all our rights."
```

### Appeal to Authority
Using an authority figure''s opinion as evidence, especially in areas outside their expertise.

```example
"This celebrity doctor says this supplement cures cancer, so it must work."
```

### Post Hoc Ergo Propter Hoc
Assuming that because one event followed another, the first caused the second.

```example
"I wore my lucky socks and we won the game, so my socks caused our victory."
```

### Hasty Generalization
Drawing a broad conclusion from insufficient evidence.

```example
"My neighbor''s electric car had battery problems, so all electric cars are unreliable."
```

## Avoiding Fallacies in Your Writing

1. Research thoroughly to ensure you have sufficient evidence
2. Consider alternative explanations and perspectives
3. Question your own assumptions and biases
4. Focus on the argument, not the person making it
5. Avoid oversimplifying complex issues

## Practice
The exercises that follow will help you identify and avoid logical fallacies in various contexts.',
   true, true, 7),

  ('10000000-0000-0000-0000-000000000008', 'research-synthesis', 'Research Synthesis', 'Integrate diverse sources into a cohesive, original analysis', 4, 2, 
   '# Research Synthesis

Research synthesis is the process of combining information from multiple sources into a coherent whole that offers new insights or perspectives.

## The Synthesis Process

### Identify Patterns and Relationships
Look for connections, contradictions, and trends across your sources.

```example
Source A emphasizes economic factors in climate change solutions.
Source B focuses on technological innovations.
Source C discusses policy approaches.
Synthesis: Effective climate change solutions require coordinated efforts across economic incentives, technological development, and policy frameworks.
```

### Move Beyond Summary
Don''t just report what each source says—analyze how they relate to each other and contribute to your argument.

```example
Weak (Summary): Smith argues X. Jones argues Y. Brown argues Z.
Strong (Synthesis): While Smith and Jones both emphasize individual factors, Brown''s societal perspective complements their work by showing how individual choices operate within larger systems.
```

### Create a Dialogue Among Sources
Show how sources respond to, build upon, or challenge each other.

```example
"Garcia''s findings on urban education challenges extend Williams'' earlier research, while offering a counterpoint to Lopez''s more optimistic assessment."
```

## Synthesis Techniques

### Thematic Organization
Group sources by themes or subtopics rather than discussing each source separately.

### Comparative Framework
Analyze how different sources approach the same question or problem.

### Chronological Development
Show how understanding of a topic has evolved over time through different research contributions.

### Methodological Analysis
Compare the different research methods used across sources and how they affect conclusions.

## Common Synthesis Challenges

### Source Overload
Solution: Create a synthesis matrix to organize key points from each source by themes.

### Losing Your Voice
Solution: Clearly distinguish between source ideas and your own analysis and insights.

### Forced Connections
Solution: Be honest about genuine disagreements between sources rather than trying to reconcile incompatible viewpoints.

## Practice
The exercises that follow will help you synthesize information from multiple sources effectively.',
   true, true, 8);

-- Now create the skill tree nodes that connect these lessons
INSERT INTO skill_tree_nodes (id, title, description, node_type, content_layer_id, lesson_id, prerequisite_nodes, rewards, icon_url)
VALUES
  -- Foundation level
  ('20000000-0000-0000-0000-000000000001', 'Basic Paragraph Structure', 'Learn the fundamental components of a well-structured paragraph', 'lesson', 2, '10000000-0000-0000-0000-000000000001', '{}', 
   '[
     {"type": "experience", "value": 50},
     {"type": "currency", "value": 25},
     {"type": "stat", "value": 1},
     {"type": "points", "value": 10}
   ]', 
   '/icons/skills/paragraph.svg'),
   
  ('20000000-0000-0000-0000-000000000002', 'Topic Sentences', 'Craft effective opening sentences that establish the main idea of a paragraph', 'lesson', 2, '10000000-0000-0000-0000-000000000002', 
   '{"20000000-0000-0000-0000-000000000001"}', 
   '[
     {"type": "experience", "value": 75},
     {"type": "currency", "value": 30},
     {"type": "stat", "value": 1},
     {"type": "points", "value": 15}
   ]', 
   '/icons/skills/topic.svg'),
   
  ('20000000-0000-0000-0000-000000000003', 'Supporting Details', 'Select and organize relevant details that support the main idea', 'lesson', 2, '10000000-0000-0000-0000-000000000003', 
   '{"20000000-0000-0000-0000-000000000001"}', 
   '[
     {"type": "experience", "value": 75},
     {"type": "currency", "value": 30},
     {"type": "stat", "value": 1},
     {"type": "points", "value": 15}
   ]', 
   '/icons/skills/details.svg'),
   
  ('20000000-0000-0000-0000-000000000004', 'Concluding Sentences', 'Create effective paragraph closures that reinforce the main idea', 'lesson', 2, '10000000-0000-0000-0000-000000000004', 
   '{"20000000-0000-0000-0000-000000000001"}', 
   '[
     {"type": "experience", "value": 75},
     {"type": "currency", "value": 30},
     {"type": "stat", "value": 1},
     {"type": "points", "value": 15}
   ]', 
   '/icons/skills/conclusion.svg'),
   
  -- Intermediate level
  ('20000000-0000-0000-0000-000000000005', 'Thesis Statements', 'Develop clear, focused thesis statements that guide entire essays', 'lesson', 2, '10000000-0000-0000-0000-000000000005', 
   '{"20000000-0000-0000-0000-000000000002"}', 
   '[
     {"type": "experience", "value": 100},
     {"type": "currency", "value": 50},
     {"type": "stat", "value": 2},
     {"type": "points", "value": 25},
     {"type": "item", "key": "tied_scroll", "value": 1}
   ]', 
   '/icons/skills/thesis.svg'),
   
  -- Advanced level
  ('20000000-0000-0000-0000-000000000006', 'Argumentative Structure', 'Organize claims, evidence, and reasoning in logical sequences', 'lesson', 2, '10000000-0000-0000-0000-000000000006', 
   '{"20000000-0000-0000-0000-000000000005", "20000000-0000-0000-0000-000000000003"}', 
   '[
     {"type": "experience", "value": 150},
     {"type": "currency", "value": 75},
     {"type": "stat", "value": 3},
     {"type": "points", "value": 35}
   ]', 
   '/icons/skills/argument.svg'),
   
  ('20000000-0000-0000-0000-000000000007', 'Logical Fallacies', 'Identify and avoid common reasoning errors in argumentation', 'lesson', 2, '10000000-0000-0000-0000-000000000007', 
   '{"20000000-0000-0000-0000-000000000006"}', 
   '[
     {"type": "experience", "value": 200},
     {"type": "currency", "value": 100},
     {"type": "stat", "value": 2},
     {"type": "points", "value": 50},
     {"type": "item", "key": "tied_scroll", "value": 1}
   ]', 
   '/icons/skills/fallacies.svg'),
   
  ('20000000-0000-0000-0000-000000000008', 'Research Synthesis', 'Integrate diverse sources into a cohesive, original analysis', 'lesson', 2, '10000000-0000-0000-0000-000000000008', 
   '{"20000000-0000-0000-0000-000000000007"}', 
   '[
     {"type": "experience", "value": 300},
     {"type": "currency", "value": 150},
     {"type": "stat", "value": 5},
     {"type": "points", "value": 75},
     {"type": "item", "key": "orb_1", "value": 1}
   ]', 
   '/icons/skills/synthesis.svg');

-- Add some exercises for the first lesson
INSERT INTO exercises (id, lesson_id, title, description, exercise_type, content, solution, order_index, points)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Identify Paragraph Components', 'Practice identifying the parts of a well-structured paragraph', 'multiple_choice',
   'Read the following paragraph and identify its components:

"The local farmers'' market offers numerous benefits to the community. Every Saturday, residents can purchase fresh, locally grown produce that is often harvested just hours before the market opens. The market also provides a venue for small business owners to sell handmade goods like soaps, candles, and crafts. Additionally, it creates a social gathering space where neighbors can connect and build relationships. With its combination of fresh food, unique products, and community building, the farmers'' market has become an essential part of our town."

1. Which sentence is the topic sentence?
2. Which of the following is NOT a supporting detail in this paragraph?
3. Which sentence is the concluding sentence?',
   '{
     "questions": [
       {
         "id": 1,
         "options": [
           "The local farmers'' market offers numerous benefits to the community.",
           "Every Saturday, residents can purchase fresh, locally grown produce that is often harvested just hours before the market opens.",
           "The market also provides a venue for small business owners to sell handmade goods like soaps, candles, and crafts.",
           "With its combination of fresh food, unique products, and community building, the farmers'' market has become an essential part of our town."
         ],
         "correctIndex": 0,
         "explanation": "The topic sentence states the main idea of the paragraph, which is that the farmers'' market benefits the community."
       },
       {
         "id": 2,
         "options": [
           "Residents can purchase fresh, locally grown produce.",
           "The market provides a venue for small business owners.",
           "The market creates a social gathering space.",
           "The market is only open during summer months."
         ],
         "correctIndex": 3,
         "explanation": "The paragraph does not mention anything about the market only being open during summer months."
       },
       {
         "id": 3,
         "options": [
           "The local farmers'' market offers numerous benefits to the community.",
           "Additionally, it creates a social gathering space where neighbors can connect and build relationships.",
           "With its combination of fresh food, unique products, and community building, the farmers'' market has become an essential part of our town.",
           "None of the above"
         ],
         "correctIndex": 2,
         "explanation": "The concluding sentence summarizes the main points and reinforces the importance of the farmers'' market to the town."
       }
     ]
   }',
   1, 10),
   
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Create a Structured Paragraph', 'Practice writing a well-organized paragraph', 'free_response',
   'Write a well-structured paragraph about a place you enjoy visiting. Include:
   
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
     "example_solution": "The local library is my favorite place to spend quiet afternoons. The tall bookshelves filled with countless stories create a sense of possibility and adventure. Comfortable reading nooks with plush chairs invite visitors to sit and lose themselves in a good book for hours. The library also offers free Wi-Fi and computer access, making it a practical resource for research and work. The helpful librarians are always ready to recommend new titles or help locate hard-to-find information. With its perfect combination of resources, comfort, and assistance, the library provides an ideal environment for both learning and relaxation."
   }',
   2, 15);

-- Skill Tree Nodes for Mechanics & Grammar Layer
INSERT INTO skill_tree_nodes (id, title, description, node_type, content_layer_id, lesson_id, prerequisite_nodes, rewards, icon_url)
VALUES
  -- Foundation level
  ('40000000-0000-0000-0000-000000000001', 'Punctuation Basics', 'Learn the fundamentals of punctuation and how it affects meaning', 'lesson', 1, '00000000-0000-0000-0000-000000000001', '{}', 
   '[
     {"type": "experience", "value": 50},
     {"type": "currency", "value": 25},
     {"type": "stat", "value": 1},
     {"type": "points", "value": 10}
   ]', 
   '/icons/skills/punctuation.svg'),
   
  ('40000000-0000-0000-0000-000000000002', 'Subject-Verb Agreement', 'Master the rules of making subjects and verbs agree in your writing', 'lesson', 1, '00000000-0000-0000-0000-000000000002', 
   '{"40000000-0000-0000-0000-000000000001"}', 
   '[
     {"type": "experience", "value": 75},
     {"type": "currency", "value": 30},
     {"type": "stat", "value": 2},
     {"type": "points", "value": 15}
   ]', 
   '/icons/skills/grammar.svg'),
   
  -- Additional nodes for future Mechanics & Grammar lessons (placeholders)
  ('40000000-0000-0000-0000-000000000003', 'Sentence Structure', 'Learn to construct clear, effective sentences with proper structure', 'lesson', 1, null, 
   '{"40000000-0000-0000-0000-000000000002"}', 
   '[
     {"type": "experience", "value": 100},
     {"type": "currency", "value": 40},
     {"type": "stat", "value": 2},
     {"type": "points", "value": 25}
   ]', 
   '/icons/skills/sentence.svg'),
   
  ('40000000-0000-0000-0000-000000000004', 'Parts of Speech', 'Master the different word types and their functions in sentences', 'lesson', 1, null, 
   '{"40000000-0000-0000-0000-000000000001"}', 
   '[
     {"type": "experience", "value": 75},
     {"type": "currency", "value": 30},
     {"type": "stat", "value": 1},
     {"type": "points", "value": 15}
   ]', 
   '/icons/skills/parts-speech.svg'),
   
  ('40000000-0000-0000-0000-000000000005', 'Advanced Grammar', 'Master complex grammatical structures for sophisticated writing', 'lesson', 1, null, 
   '{"40000000-0000-0000-0000-000000000002", "40000000-0000-0000-0000-000000000003", "40000000-0000-0000-0000-000000000004"}', 
   '[
     {"type": "experience", "value": 150},
     {"type": "currency", "value": 75},
     {"type": "stat", "value": 3},
     {"type": "points", "value": 35},
     {"type": "item", "key": "grammar_tome", "value": 1}
   ]', 
   '/icons/skills/advanced-grammar.svg');

-- Skill Tree Nodes for Voice & Rhetoric Layer
INSERT INTO skill_tree_nodes (id, title, description, node_type, content_layer_id, lesson_id, prerequisite_nodes, rewards, icon_url)
VALUES
  -- Foundation level
  ('50000000-0000-0000-0000-000000000001', 'Understanding Audience', 'Learn how to adapt your writing for different readers', 'lesson', 3, '00000000-0000-0000-0000-000000000005', '{}', 
   '[
     {"type": "experience", "value": 50},
     {"type": "currency", "value": 25},
     {"type": "stat", "value": 1},
     {"type": "points", "value": 10}
   ]', 
   '/icons/skills/audience.svg'),
   
  ('50000000-0000-0000-0000-000000000002', 'Developing Voice', 'Discover techniques to create a distinctive writing style', 'lesson', 3, '00000000-0000-0000-0000-000000000006', 
   '{"50000000-0000-0000-0000-000000000001"}', 
   '[
     {"type": "experience", "value": 75},
     {"type": "currency", "value": 30},
     {"type": "stat", "value": 2},
     {"type": "points", "value": 15}
   ]', 
   '/icons/skills/voice.svg'),
   
  -- Additional nodes for future Voice & Rhetoric lessons (placeholders)
  ('50000000-0000-0000-0000-000000000003', 'Persuasive Techniques', 'Master the art of convincing others through effective rhetoric', 'lesson', 3, null, 
   '{"50000000-0000-0000-0000-000000000002"}', 
   '[
     {"type": "experience", "value": 100},
     {"type": "currency", "value": 40},
     {"type": "stat", "value": 2},
     {"type": "points", "value": 25}
   ]', 
   '/icons/skills/persuasion.svg'),
   
  ('50000000-0000-0000-0000-000000000004', 'Rhetorical Devices', 'Learn powerful literary techniques to enhance your writing', 'lesson', 3, null, 
   '{"50000000-0000-0000-0000-000000000002"}', 
   '[
     {"type": "experience", "value": 100},
     {"type": "currency", "value": 40},
     {"type": "stat", "value": 2},
     {"type": "points", "value": 25}
   ]', 
   '/icons/skills/rhetoric.svg'),
   
  ('50000000-0000-0000-0000-000000000005', 'Advanced Stylistics', 'Master sophisticated stylistic techniques for impactful writing', 'lesson', 3, null, 
   '{"50000000-0000-0000-0000-000000000003", "50000000-0000-0000-0000-000000000004"}', 
   '[
     {"type": "experience", "value": 150},
     {"type": "currency", "value": 75},
     {"type": "stat", "value": 3},
     {"type": "points", "value": 35},
     {"type": "item", "key": "rhetoric_orb", "value": 1}
   ]', 
   '/icons/skills/style.svg');

-- Create a default classroom for demo purposes
INSERT INTO classrooms (id, name, description, join_code, owner_id)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Creative Writing Workshop',
  'A collaborative space for students to develop their writing skills through creative exercises and peer feedback.',
  'DEMO123',
  (SELECT id FROM profiles WHERE username = 'admin' LIMIT 1)
);

-- Add some default members to the classroom (assuming these profiles exist)
INSERT INTO classroom_members (classroom_id, user_id, role)
SELECT 
  '10000000-0000-0000-0000-000000000001',
  id,
  CASE 
    WHEN username = 'admin' THEN 'teacher'
    ELSE 'student'
  END
FROM profiles
WHERE username IN ('admin', 'student1', 'student2')
ON CONFLICT (classroom_id, user_id) DO NOTHING;

-- Create a default world for the classroom
INSERT INTO worlds (id, classroom_id, name, description)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Wordsmith Realm',
  'A magical world where words have power and stories shape reality. Students embark on quests to develop their writing abilities and unlock new areas of the realm.'
);
