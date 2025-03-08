'use server';

import { generateCompletion, systemMessage, userMessage } from '@/lib/utils/ai';

// Define the grading scale
export type GradeLevel = 'bad' | 'needs improvement' | 'satisfactory' | 'good' | 'excellent';

// Define user proficiency levels
export type UserLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Map grade levels to numeric scores based on user level
// This creates a more forgiving scale for beginners and stricter for experts
const GRADE_SCORE_MAP: Record<UserLevel, Record<GradeLevel, number>> = {
  beginner: {
    bad: 75,
    'needs improvement': 85,
    satisfactory: 90,
    good: 95,
    excellent: 100
  },
  intermediate: {
    bad: 70,
    'needs improvement': 80,
    satisfactory: 90,
    good: 95,
    excellent: 100
  },
  advanced: {
    bad: 65,
    'needs improvement': 75,
    satisfactory: 85,
    good: 95,
    excellent: 100
  },
  expert: {
    bad: 60,
    'needs improvement': 70,
    satisfactory: 80,
    good: 90,
    excellent: 100
  }
};

// Interface for the grading result
export interface GradingResult {
  score: number;
  feedback: string;
  gradeLevel: GradeLevel;
}

/**
 * Grade a fill-in-the-blank exercise using AI
 */
export async function gradeFillBlankExercise(
  userAnswer: string,
  correctAnswer: string,
  questionContext: string,
  userLevel: UserLevel = 'intermediate'
): Promise<GradingResult> {
  const prompt = `
You are grading a fill-in-the-blank exercise for a ${userLevel} level student. 
The student's task was to correct a sentence.

Original sentence context: ${questionContext}
Correct answer: ${correctAnswer}
Student's answer: ${userAnswer}

Grade the student's answer on a scale of:
- bad (completely incorrect)
- needs improvement (partially correct but with significant issues)
- satisfactory (mostly correct with minor issues)
- good (correct with very minor issues)
- excellent (perfectly correct)

${getLevelSpecificInstructions(userLevel)}

Provide a brief, constructive feedback explaining the grade.
Format your response exactly as:
Grade: [grade level]
Feedback: [your feedback]
`;

  return await gradeWithAI(prompt, userLevel);
}

/**
 * Grade a rewrite exercise using AI
 */
export async function gradeRewriteExercise(
  userAnswer: string,
  criteria: string[],
  exampleSolution: string,
  exerciseContext: string,
  userLevel: UserLevel = 'intermediate'
): Promise<GradingResult> {
  const criteriaText = criteria.map(c => `- ${c}`).join('\n');
  
  const prompt = `
You are grading a rewrite exercise for a ${userLevel} level student where they had to rewrite a text according to specific criteria.

Exercise context: ${exerciseContext}

Evaluation criteria:
${criteriaText}

Example solution: ${exampleSolution}

Student's answer: ${userAnswer}

Grade the student's answer on a scale of:
- bad (fails to meet most criteria)
- needs improvement (meets some criteria but has significant issues)
- satisfactory (meets most criteria with some issues)
- good (meets almost all criteria with minor issues)
- excellent (meets all criteria exceptionally well)

${getLevelSpecificInstructions(userLevel)}

Provide brief, constructive feedback explaining the grade.
Format your response exactly as:
Grade: [grade level]
Feedback: [your feedback]
`;

  return await gradeWithAI(prompt, userLevel);
}

/**
 * Grade a free response exercise using AI
 */
export async function gradeFreeResponseExercise(
  userAnswer: string,
  evaluationCriteria: Array<{ criterion: string; weight: number; description: string }>,
  exampleSolution: string,
  exerciseContext: string,
  userLevel: UserLevel = 'intermediate'
): Promise<GradingResult> {
  const criteriaText = evaluationCriteria
    .map(c => `- ${c.criterion} (${c.weight}%): ${c.description}`)
    .join('\n');
  
  const prompt = `
You are grading a free response exercise for a ${userLevel} level student where they had to write a response according to specific criteria.

Exercise context: ${exerciseContext}

Evaluation criteria:
${criteriaText}

Example solution: ${exampleSolution}

Student's answer: ${userAnswer}

Grade the student's answer on a scale of:
- bad (fails to meet most criteria)
- needs improvement (meets some criteria but has significant issues)
- satisfactory (meets most criteria with some issues)
- good (meets almost all criteria with minor issues)
- excellent (meets all criteria exceptionally well)

${getLevelSpecificInstructions(userLevel)}

Provide brief, constructive feedback explaining the grade, considering the weighted importance of each criterion.
Format your response exactly as:
Grade: [grade level]
Feedback: [your feedback]
`;

  return await gradeWithAI(prompt, userLevel);
}

/**
 * Get level-specific grading instructions based on user level
 */
function getLevelSpecificInstructions(userLevel: UserLevel): string {
  switch (userLevel) {
    case 'beginner':
      return 'As this is a beginner student, focus on encouraging progress and basic understanding. Be more lenient with minor errors but ensure core concepts are grasped.';
    case 'intermediate':
      return 'For this intermediate student, balance encouragement with higher expectations. They should demonstrate good understanding with only occasional errors.';
    case 'advanced':
      return 'This advanced student should demonstrate thorough understanding and precision. Hold them to higher standards while still providing constructive feedback.';
    case 'expert':
      return 'For this expert-level student, apply rigorous standards. They should demonstrate mastery, nuanced understanding, and minimal errors.';
    default:
      return '';
  }
}

/**
 * Helper function to call the AI and parse the response
 */
async function gradeWithAI(prompt: string, userLevel: UserLevel = 'intermediate'): Promise<GradingResult> {
  try {
    const response = await generateCompletion(
      {
        messages: [
          systemMessage('You are an expert educational grader. Grade the student response according to the provided criteria and their proficiency level.'),
          userMessage(prompt)
        ],
        temperature: 0.3, // Lower temperature for more consistent grading
      },
      {
        provider: 'google', // Using Google's model for grading
        modelName: 'gemini-2.0-flash',
      }
    );

    // Parse the response to extract grade and feedback
    const text = response.text.trim();
    
    // Extract grade level
    const gradeMatch = text.match(/Grade:\s*(bad|needs improvement|satisfactory|good|excellent)/i);
    const gradeLevel = gradeMatch 
      ? (gradeMatch[1].toLowerCase() as GradeLevel) 
      : 'satisfactory'; // Default to satisfactory if parsing fails
    
    // Extract feedback
    const feedbackMatch = text.match(/Feedback:\s*([\s\S]*)/i);
    const feedback = feedbackMatch 
      ? feedbackMatch[1].trim() 
      : 'No specific feedback provided.';
    
    // Get numeric score from grade level based on user level
    const score = GRADE_SCORE_MAP[userLevel][gradeLevel];
    
    return {
      score,
      feedback,
      gradeLevel
    };
  } catch (error) {
    console.error('Error grading with AI:', error);
    // Fallback to a default grade if AI fails
    return {
      score: 85,
      feedback: 'Your answer has been automatically graded due to a technical issue with the AI grader.',
      gradeLevel: 'satisfactory'
    };
  }
} 