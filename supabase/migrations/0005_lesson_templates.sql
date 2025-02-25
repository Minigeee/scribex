-- ScribexX Lesson Templates Migration

-- Create a table for exercise templates
CREATE TABLE exercise_templates (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL CHECK (template_type IN ('multiple_choice', 'fill_blank', 'rewrite', 'free_response')),
    content TEXT NOT NULL,
    solution_structure JSON,
    content_layer_id INTEGER REFERENCES content_layers(id) ON DELETE SET NULL,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on the template table
ALTER TABLE exercise_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercise_templates
-- Templates are readable by administrators and teachers
CREATE POLICY "Templates are readable by administrators and teachers."
ON exercise_templates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type IN ('teacher')
  )
);

-- Only administrators can modify templates
CREATE POLICY "Only administrators can insert templates."
ON exercise_templates FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only administrators can update templates."
ON exercise_templates FOR UPDATE
USING (is_admin());

CREATE POLICY "Only administrators can delete templates."
ON exercise_templates FOR DELETE
USING (is_admin());

-- Table for example articles (lesson content samples)
CREATE TABLE article_examples (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    content_layer_id INTEGER REFERENCES content_layers(id) ON DELETE SET NULL,
    has_rich_content BOOLEAN DEFAULT false,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on the article examples table
ALTER TABLE article_examples ENABLE ROW LEVEL SECURITY;

-- RLS policies for article_examples
-- Article examples are readable by administrators and teachers
CREATE POLICY "Article examples are readable by administrators and teachers."
ON article_examples FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type IN ('teacher')
  )
);

-- Only administrators can modify article examples
CREATE POLICY "Only administrators can insert article examples."
ON article_examples FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only administrators can update article examples."
ON article_examples FOR UPDATE
USING (is_admin());

CREATE POLICY "Only administrators can delete article examples."
ON article_examples FOR DELETE
USING (is_admin());

-- Function to create a new lesson with exercises from templates
CREATE OR REPLACE FUNCTION create_lesson_from_templates(
  lesson_title TEXT,
  lesson_description TEXT,
  content_layer_id INTEGER,
  difficulty INTEGER,
  article_content TEXT,
  has_rich_content BOOLEAN,
  template_ids INTEGER[],
  creator_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_lesson_id UUID;
  template_record RECORD;
  exercise_order INTEGER := 1;
BEGIN
  -- Check if the user is an admin or teacher
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = creator_id AND user_type IN ('teacher')
  ) THEN
    RAISE EXCEPTION 'Only teachers can create lessons';
  END IF;
  
  -- Create the new lesson
  INSERT INTO lessons (
    title,
    description,
    content_layer_id,
    difficulty,
    article,
    has_rich_content,
    published
  ) VALUES (
    lesson_title,
    lesson_description,
    content_layer_id,
    difficulty,
    article_content,
    has_rich_content,
    false -- Default to unpublished
  ) RETURNING id INTO new_lesson_id;
  
  -- Add exercises from templates
  FOR template_record IN 
    SELECT * FROM exercise_templates
    WHERE id = ANY(template_ids)
    ORDER BY id
  LOOP
    INSERT INTO exercises (
      lesson_id,
      title,
      description,
      content,
      exercise_type,
      solution,
      points,
      order_index
    ) VALUES (
      new_lesson_id,
      template_record.title,
      template_record.description,
      template_record.content,
      template_record.template_type,
      template_record.solution_structure,
      10, -- Default points
      exercise_order
    );
    
    exercise_order := exercise_order + 1;
  END LOOP;
  
  -- Return the new lesson ID
  RETURN new_lesson_id;
END;
$$;

-- Insert initial multiple-choice template for Mechanics & Grammar
INSERT INTO exercise_templates (
  title, 
  description, 
  template_type, 
  content, 
  solution_structure, 
  content_layer_id, 
  difficulty
) VALUES (
  'Identify Correct Punctuation',
  'Students must select the correctly punctuated sentence.',
  'multiple_choice',
  'Choose the sentence with correct punctuation:',
  '{
    "options": [
      "The dog ran quickly down the street and jumped over the fence",
      "The dog ran quickly down the street, and jumped over the fence",
      "The dog ran quickly down the street and jumped over the fence.",
      "The dog ran quickly down the street, and jumped, over the fence."
    ],
    "correctIndex": 2,
    "explanation": "The third option is correct because it uses a period at the end of the sentence and does not require a comma before \"and\" since it joins two actions of the same subject."
  }',
  1, -- Mechanics & Grammar
  2  -- Difficulty
);

-- Insert initial fill-blank template for Mechanics & Grammar
INSERT INTO exercise_templates (
  title, 
  description, 
  template_type, 
  content, 
  solution_structure, 
  content_layer_id, 
  difficulty
) VALUES (
  'Subject-Verb Agreement',
  'Students must fill in the blanks with the correct verb form.',
  'fill_blank',
  'Fill in the blanks with the correct verb form:\n\n1. The team of players [BLANK] going to the championship.\n2. Neither the teacher nor the students [BLANK] prepared for the surprise drill.\n3. Each of the flowers in the garden [BLANK] beautiful.',
  '{
    "blanks": [
      {
        "id": 1,
        "correctAnswers": ["is"],
        "explanation": "\"Team\" is a collective noun that takes a singular verb."
      },
      {
        "id": 2,
        "correctAnswers": ["were"],
        "explanation": "The verb agrees with the noun closest to it, which is \"students\" (plural)."
      },
      {
        "id": 3,
        "correctAnswers": ["is"],
        "explanation": "\"Each\" is singular and takes a singular verb regardless of what follows."
      }
    ]
  }',
  1, -- Mechanics & Grammar
  3  -- Difficulty
);

-- Insert initial rewrite template for Sequencing & Logic
INSERT INTO exercise_templates (
  title, 
  description, 
  template_type, 
  content, 
  solution_structure, 
  content_layer_id, 
  difficulty
) VALUES (
  'Improve Paragraph Organization',
  'Students must reorganize sentences to improve paragraph flow and logical structure.',
  'rewrite',
  'Rewrite the following paragraph to improve its organization and logical flow:\n\nThe school decided to organize a field trip. It was a sunny day. The science museum was educational. The students were excited to go on the field trip. They learned about dinosaurs and space exploration. The bus arrived at 8 AM to pick up the students. There were interactive exhibits that everyone enjoyed.',
  '{
    "criteria": [
      "Starts with an introduction to the field trip",
      "Groups related information about the trip logistics together",
      "Presents information in chronological order",
      "Groups related information about the museum experience together",
      "Includes a conclusion or summative statement"
    ],
    "example_solution": "The students were excited to go on a field trip to the science museum that their school had organized. It was a sunny day, and the bus arrived at 8 AM to pick up the students. At the museum, they learned about dinosaurs and space exploration through interactive exhibits. The science museum was educational, and everyone enjoyed the experience."
  }',
  2, -- Sequencing & Logic
  4  -- Difficulty
);

-- Insert initial free-response template for Voice & Rhetoric
INSERT INTO exercise_templates (
  title, 
  description, 
  template_type, 
  content, 
  solution_structure, 
  content_layer_id, 
  difficulty
) VALUES (
  'Adapt Writing for Different Audiences',
  'Students must rewrite a passage for two different audiences, demonstrating awareness of tone and word choice.',
  'free_response',
  'The following announcement is written for a school website:\n\n"The school administration has decided to modify the lunch schedule to accommodate the growing student population. Starting next week, lunch periods will be staggered by grade level."\n\nRewrite this announcement twice:\n1. As a casual text message to a friend\n2. As a formal email to parents',
  '{
    "evaluation_criteria": [
      {
        "criterion": "Appropriate tone for each audience",
        "weight": 30,
        "description": "Uses casual language and possibly abbreviations for the text message; uses formal language and complete sentences for the parent email"
      },
      {
        "criterion": "Word choice adaptation",
        "weight": 25,
        "description": "Selects words that match the formality level of each communication"
      },
      {
        "criterion": "Clarity of information",
        "weight": 25,
        "description": "Both versions communicate the essential information clearly"
      },
      {
        "criterion": "Format appropriateness",
        "weight": 20,
        "description": "Text message is brief and direct; email includes greeting, body, and closing"
      }
    ],
    "example_solutions": {
      "text_message": "Hey! FYI lunch times r changing next wk. Different grades get different lunch times now cuz there r 2 many of us lol",
      "parent_email": "Dear Parents,\n\nWe would like to inform you of an upcoming change to our lunch schedule. Due to our increasing enrollment, we will be implementing a staggered lunch schedule organized by grade level, effective next week. This adjustment will help us better serve all students and reduce congestion in the cafeteria.\n\nPlease discuss this change with your child to ensure they understand their new lunch time. A detailed schedule will be provided in your child''s homeroom.\n\nThank you for your understanding and cooperation.\n\nSincerely,\nSchool Administration"
    }
  }',
  3, -- Voice & Rhetoric
  5  -- Difficulty
);

-- Insert example article content for Mechanics & Grammar
INSERT INTO article_examples (
  title,
  description,
  content,
  content_layer_id,
  has_rich_content,
  difficulty
) VALUES (
  'The Power of Punctuation',
  'An introduction to how punctuation changes meaning and clarifies writing',
  '# The Power of Punctuation

Punctuation marks are the traffic signals of language. They tell readers when to pause, stop, or change direction. Using punctuation correctly helps your reader understand your writing clearly.

## Why Punctuation Matters

Look at these two sentences:
- "Let''s eat, Grandma!"
- "Let''s eat Grandma!"

The comma in the first sentence makes it a friendly dinner invitation. Without the comma, the second sentence suggests something entirely different!

## Common Punctuation Marks and Their Uses

### The Period (.)
Used to end a complete sentence. It tells the reader to stop completely before moving on.

**Example:** I enjoy writing. It helps me express my thoughts.

### The Comma (,)
Used to indicate a short pause, to separate items in a list, and to separate clauses.

**Examples:**
- In a list: I bought apples, oranges, and bananas.
- With clauses: When I finish my homework, I can play outside.

### The Question Mark (?)
Used at the end of a direct question.

**Example:** Have you completed your assignment?

### The Exclamation Point (!)
Used to show strong emotion or emphasis.

**Example:** We won the championship!

## Practice Makes Perfect

Remember, using punctuation correctly takes practice. As you read books and articles, pay attention to how punctuation is used. Try reading your writing aloud—often, you can hear where punctuation belongs.

In the exercises that follow, you''ll practice identifying and using punctuation correctly. This will help make your writing clearer and more effective!',
  1, -- Mechanics & Grammar
  true, -- Has rich content (markdown)
  2    -- Difficulty
);

-- Insert example article content for Sequencing & Logic
INSERT INTO article_examples (
  title,
  description,
  content,
  content_layer_id,
  has_rich_content,
  difficulty
) VALUES (
  'Building Strong Paragraphs',
  'How to structure paragraphs with topic sentences, supporting details, and transitions',
  '# Building Strong Paragraphs

A well-structured paragraph is like a mini-essay. It presents a single main idea, supports it with details, and connects to the broader argument of your writing.

## The Parts of a Paragraph

### Topic Sentence
The topic sentence states the main idea of the paragraph. It''s usually the first sentence and tells the reader what the paragraph will be about.

**Example:** *The invention of the printing press revolutionized how information spread through society.*

### Supporting Details
Supporting details provide evidence, examples, or explanations that develop the main idea. These might include:
- Facts and statistics
- Examples and illustrations
- Quotations from experts
- Personal experiences

**Example:** *After Gutenberg developed movable type in 1440, books could be produced much faster than before. Previously, monks might spend years copying a single manuscript by hand. Now, hundreds of identical copies could be created in a fraction of the time. This led to more affordable books and wider literacy across Europe.*

### Concluding Sentence
Many paragraphs include a concluding sentence that summarizes the main point or transitions to the next paragraph.

**Example:** *This democratization of knowledge set the stage for the Renaissance and later the Scientific Revolution.*

## Creating Logical Flow

### Order and Sequence
Arrange your supporting details in a logical order:
- Chronological (time sequence)
- Spatial (physical arrangement)
- Order of importance
- Problem to solution
- Cause to effect

### Transitions
Use transition words and phrases to connect ideas within and between paragraphs:

- To add information: *additionally, furthermore, moreover*
- To show time: *meanwhile, subsequently, later*
- To compare: *similarly, likewise, in the same way*
- To contrast: *however, nevertheless, on the other hand*
- To show cause/effect: *therefore, consequently, as a result*

## Practice Paragraph

Here''s an example of a well-structured paragraph:

*Regular exercise offers numerous benefits for mental health. Studies show that physical activity releases endorphins, chemicals in the brain that act as natural painkillers and mood elevators. Additionally, exercise reduces levels of stress hormones like cortisol and adrenaline. Many people who exercise regularly report better sleep quality, which further improves mental well-being. Moreover, participating in physical activities can provide opportunities for social interaction and community building, reducing feelings of isolation. These mental health benefits make exercise an important component of overall wellness, beyond just physical fitness.*

In the exercises that follow, you''ll practice identifying and creating well-structured paragraphs with clear main ideas and logical organization.',
  2, -- Sequencing & Logic
  true, -- Has rich content (markdown)
  3    -- Difficulty
); 