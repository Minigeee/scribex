import {
  gradeFillBlankExercise,
  gradeFreeResponseExercise,
  gradeRewriteExercise,
  UserLevel,
} from '@/app/actions/grade-exercise';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { ExerciseWithProgress } from '@/lib/types';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/**
 * Maps a user's character level to a proficiency level for grading purposes
 * @param characterLevel The user's character level (1-100)
 * @returns The corresponding proficiency level
 */
export function mapCharacterLevelToProficiency(
  characterLevel: number
): UserLevel {
  if (characterLevel <= 10) return 'beginner';
  if (characterLevel <= 30) return 'intermediate';
  if (characterLevel <= 60) return 'advanced';
  return 'expert';
}

interface ExerciseItemProps {
  exercise: ExerciseWithProgress;
  onComplete?: (
    exerciseId: string,
    score: number,
    userAnswers: Record<string, any>
  ) => void;
  userLevel?: number; // User's character level (1-100)
}

type MultipleChoiceQuestion = {
  id: number;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type FillBlankQuestion = {
  id: number;
  original: string;
  corrected: string;
  explanation: string;
};

type RewriteExercise = {
  criteria: string[];
  example_solution: string;
};

type FreeResponseCriterion = {
  criterion: string;
  weight: number;
  description: string;
};

type FreeResponseExercise = {
  evaluation_criteria: FreeResponseCriterion[];
  example_solution: string;
};

// New interface for parsed questions
interface ParsedQuestion {
  id: number;
  text: string;
}

export function ExerciseItem({
  exercise,
  onComplete,
  userLevel = 15,
}: ExerciseItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    !exercise.user_progress?.completed
  );
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
  } | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<
    Record<string | number, boolean>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [detailedFeedback, setDetailedFeedback] = useState<
    Record<string | number, string>
  >({});

  // Convert user level to proficiency category
  const proficiencyLevel = useMemo(
    () => mapCharacterLevelToProficiency(userLevel),
    [userLevel]
  );

  const isCompleted = exercise.user_progress?.completed || false;
  const lastScore = exercise.user_progress?.score || 0;

  // Parse the solution based on exercise type
  const parsedSolution = exercise.solution
    ? JSON.parse(JSON.stringify(exercise.solution))
    : null;

  // Load saved answers when component mounts
  useEffect(() => {
    if (exercise.user_progress?.user_answers) {
      try {
        const savedAnswers = exercise.user_progress.user_answers as Record<
          string,
          any
        >;
        setUserAnswers(savedAnswers);
      } catch (error) {
        console.error('Error parsing saved answers:', error);
      }
    }
  }, [exercise.user_progress?.user_answers]);

  // Parse the content to extract individual questions
  const parsedContent = useMemo(() => {
    // For exercise types that don't have numbered questions, return the content as is
    if (
      exercise.exercise_type === 'rewrite' ||
      exercise.exercise_type === 'free_response'
    ) {
      return {
        introduction: exercise.content,
        questions: [],
      };
    }

    const content = exercise.content;

    // Split the content into introduction and questions
    const lines = content.split('\n').map((line) => line.trim());
    let introduction = '';
    const questions: ParsedQuestion[] = [];

    let currentQuestionText = '';
    let currentQuestionId = 0;

    let foundFirstQuestion = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this line starts a new question (numbered format)
      const questionMatch = line.match(/^\s*(\d+)[\.\)]\s+(.+)$/);

      if (questionMatch) {
        foundFirstQuestion = true;

        // If we already have a question in progress, save it
        if (currentQuestionId > 0) {
          questions.push({
            id: currentQuestionId,
            text: currentQuestionText.trim(),
          });
        }

        // Start a new question
        currentQuestionId = parseInt(questionMatch[1]);
        currentQuestionText = questionMatch[2];
      } else if (foundFirstQuestion) {
        // Continue with the current question
        currentQuestionText += '\n' + line;
      } else {
        // Still in the introduction
        introduction += line + '\n';
      }
    }
    console.log(lines, questions);

    // Add the last question if there is one
    if (currentQuestionId > 0) {
      questions.push({
        id: currentQuestionId,
        text: currentQuestionText.trim(),
      });
    }

    return {
      introduction: introduction.trim(),
      questions,
    };
  }, [exercise.content, exercise.exercise_type]);

  const handleAnswerChange = (questionId: string | number, value: any) => {
    // Reset wrong answer state when user changes their answer
    setWrongAnswers((prev) => ({
      ...prev,
      [questionId]: false,
    }));

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    let score = 0;
    let feedbackMessage = '';
    let isCorrect = false;
    const newWrongAnswers: Record<string | number, boolean> = {};
    const newDetailedFeedback: Record<string | number, string> = {};

    setIsSubmitted(true);
    setIsGrading(true);

    try {
      switch (exercise.exercise_type) {
        case 'multiple_choice': {
          if (parsedSolution?.questions) {
            const questions =
              parsedSolution.questions as MultipleChoiceQuestion[];
            let correctCount = 0;

            questions.forEach((question) => {
              // Store wrong answers
              if (userAnswers[question.id] !== question.correctIndex) {
                newWrongAnswers[question.id] = true;
              } else {
                correctCount++;
              }
            });

            score = Math.round((correctCount / questions.length) * 100);
            isCorrect = score >= 80;
            feedbackMessage = isCorrect
              ? 'Great job! You answered most questions correctly.'
              : 'You might want to review some of your answers.';
          }
          break;
        }

        case 'fill_blank': {
          if (parsedSolution?.blanks) {
            const blanks = parsedSolution.blanks as FillBlankQuestion[];
            let totalScore = 0;
            let gradedCount = 0;

            // Use AI grading for each blank
            for (const blank of blanks) {
              const userAnswer = userAnswers[blank.id]?.trim() || '';

              if (userAnswer.length > 0) {
                // Get the question text from parsedContent
                const question = parsedContent.questions.find(
                  (q) => q.id === blank.id
                );
                const questionContext = question
                  ? question.text
                  : blank.original;

                // Grade this specific blank with user's proficiency level
                const result = await gradeFillBlankExercise(
                  userAnswer,
                  blank.corrected,
                  questionContext,
                  proficiencyLevel
                );

                // Store the detailed feedback
                newDetailedFeedback[blank.id] = result.feedback;

                // Add to total score
                totalScore += result.score;
                gradedCount++;

                // Mark as wrong if score is below threshold
                if (result.score < 90) {
                  newWrongAnswers[blank.id] = true;
                }
              } else {
                // Empty answer is automatically wrong
                newWrongAnswers[blank.id] = true;
                newDetailedFeedback[blank.id] = 'No answer provided.';
              }
            }

            // Calculate average score
            score = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;
            isCorrect = score >= 70;
            feedbackMessage = isCorrect
              ? 'Well done! Your answers are correct.'
              : 'Some of your answers need improvement.';
          }
          break;
        }

        case 'rewrite': {
          const userText = userAnswers['rewrite'] || '';
          const rewriteSolution = parsedSolution as RewriteExercise;

          if (userText.length > 0 && rewriteSolution) {
            // Use AI to grade the rewrite with user's proficiency level
            const result = await gradeRewriteExercise(
              userText,
              rewriteSolution.criteria || [],
              rewriteSolution.example_solution || '',
              exercise.content, // Use the exercise content as context
              proficiencyLevel
            );

            score = result.score;
            feedbackMessage = result.feedback;
            isCorrect = score >= 70;
            newDetailedFeedback['rewrite'] = result.feedback;

            if (!isCorrect) {
              newWrongAnswers['rewrite'] = true;
            }
          } else {
            score = 0;
            isCorrect = false;
            feedbackMessage = 'Please provide a more complete rewrite.';
            newWrongAnswers['rewrite'] = true;
          }
          break;
        }

        case 'free_response': {
          const userText = userAnswers['free_response'] || '';
          const freeResponseSolution = parsedSolution as FreeResponseExercise;

          if (userText.length > 0 && freeResponseSolution) {
            // Use AI to grade the free response with user's proficiency level
            const result = await gradeFreeResponseExercise(
              userText,
              freeResponseSolution.evaluation_criteria || [],
              freeResponseSolution.example_solution || '',
              exercise.content, // Use the exercise content as context
              proficiencyLevel
            );

            score = result.score;
            feedbackMessage = result.feedback;
            isCorrect = score >= 90; // Consider 70+ as passing
            newDetailedFeedback['free_response'] = result.feedback;

            if (!isCorrect) {
              newWrongAnswers['free_response'] = true;
            }
          } else {
            score = 0;
            isCorrect = false;
            feedbackMessage = 'Please provide a more detailed response.';
            newWrongAnswers['free_response'] = true;
            newDetailedFeedback['free_response'] = 'No response provided.';
          }
          break;
        }

        default:
          score = 0;
          feedbackMessage = 'Unable to evaluate this exercise type.';
          break;
      }

      setWrongAnswers(newWrongAnswers);
      setDetailedFeedback(newDetailedFeedback);
      setFeedback({
        message: feedbackMessage,
        isCorrect,
      });

      // Only call onComplete if there's a score (even if not passing)
      // This ensures we track all attempts
      if (onComplete) {
        // Pass the exercise ID, score, and user answers to the parent component
        onComplete(exercise.id, score, userAnswers);

        // The parent component (LessonClient) will handle updating the UI
        // based on whether the score meets the completion threshold (90%)
        const isNowCompleted = score >= 90;

        if (isNowCompleted && !isCompleted) {
          // We could add some immediate visual feedback here
          // but the parent will update the exercise prop on the next render
          console.log(`Exercise ${exercise.id} completed with score: ${score}`);
        }
      }
    } catch (error) {
      console.error('Error grading exercise:', error);
      setFeedback({
        message:
          'There was an error grading your submission. Please try again.',
        isCorrect: false,
      });
    } finally {
      setIsGrading(false);
    }
  };

  const renderMultipleChoiceQuestion = (
    question: ParsedQuestion,
    solutionQuestion: MultipleChoiceQuestion,
    index: number
  ) => {
    const isWrong = isSubmitted && wrongAnswers[question.id];

    return (
      <div
        key={question.id}
        className={`space-y-3 rounded-md border p-4 ${
          isWrong ? 'border-red-500' : 'border-muted'
        }`}
      >
        <h3 className='font-medium'>Question {index + 1}</h3>
        <p className='mb-3 text-sm'>{question.text}</p>

        <RadioGroup
          value={userAnswers[question.id]?.toString()}
          onValueChange={(value: string) =>
            handleAnswerChange(question.id, parseInt(value))
          }
          className='space-y-2'
        >
          {solutionQuestion.options.map((option, optionIndex) => (
            <div key={optionIndex} className='flex items-center space-x-2'>
              <RadioGroupItem
                value={optionIndex.toString()}
                id={`q${question.id}-option${optionIndex}`}
              />
              <Label htmlFor={`q${question.id}-option${optionIndex}`}>
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {isWrong && !isCompleted && (
          <div className='mt-3 flex items-start gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700'>
            <XCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            <p>Incorrect answer. Please try again.</p>
          </div>
        )}

        {isCompleted && (
          <div
            className={`mt-3 rounded-md p-2 text-sm ${
              userAnswers[question.id] === solutionQuestion.correctIndex
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            <p className='font-medium'>
              {userAnswers[question.id] === solutionQuestion.correctIndex
                ? 'Correct!'
                : `Incorrect. The correct answer is: ${solutionQuestion.options[solutionQuestion.correctIndex]}`}
            </p>
            <p>{solutionQuestion.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderFillBlankQuestion = (
    question: ParsedQuestion,
    blankQuestion: FillBlankQuestion,
    index: number
  ) => {
    const isWrong = isSubmitted && wrongAnswers[question.id];
    const questionFeedback = detailedFeedback[question.id];

    return (
      <div
        key={question.id}
        className={`space-y-3 rounded-md border p-4 ${
          isWrong ? 'border-red-500' : 'border-muted'
        }`}
      >
        <h3 className='font-medium'>Sentence {index + 1}</h3>
        <p className='text-muted-foreground'>{blankQuestion.original}</p>
        <div className='flex flex-col space-y-2'>
          <Label htmlFor={`blank-${question.id}`}>Your correction:</Label>
          <Input
            id={`blank-${question.id}`}
            value={userAnswers[question.id] ?? blankQuestion.original}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleAnswerChange(question.id, e.target.value)
            }
            placeholder='Enter your correction...'
            className={
              isWrong ? 'border-red-500 focus-visible:ring-red-500' : ''
            }
          />
        </div>

        {isWrong && !isCompleted && (
          <div className='mt-3 flex items-start gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700'>
            <XCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            <p>Your answer needs improvement.</p>
          </div>
        )}

        {isSubmitted && questionFeedback && (
          <div
            className={`mt-3 rounded-md p-2 text-sm ${isWrong ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}
          >
            <p className='font-medium'>Feedback:</p>
            <p>{questionFeedback}</p>
          </div>
        )}

        {isCompleted && (
          <div className='rounded-md bg-green-50 p-2 text-sm text-green-700'>
            <p className='font-medium'>Sample correct answer:</p>
            <p>{blankQuestion.corrected}</p>
            <p className='mt-1 text-xs'>{blankQuestion.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderMultipleChoice = () => {
    if (!parsedSolution?.questions) return null;

    const questions = parsedSolution.questions as MultipleChoiceQuestion[];

    return (
      <div className='space-y-4'>
        {parsedContent.questions.map((question, index) => {
          const solutionQuestion = questions.find((q) => q.id === question.id);
          if (!solutionQuestion) return null;

          return renderMultipleChoiceQuestion(
            question,
            solutionQuestion,
            index
          );
        })}
      </div>
    );
  };

  const renderFillBlank = () => {
    if (!parsedSolution?.blanks) return null;

    const blanks = parsedSolution.blanks as FillBlankQuestion[];

    return (
      <div className='space-y-4'>
        {parsedContent.questions.map((question, index) => {
          const blankQuestion = blanks.find((b) => b.id === question.id);
          if (!blankQuestion) return null;

          return renderFillBlankQuestion(question, blankQuestion, index);
        })}
      </div>
    );
  };

  const renderRewrite = () => {
    const rewriteSolution = parsedSolution as RewriteExercise;
    const isWrong = isSubmitted && wrongAnswers['rewrite'];
    const rewriteFeedback = detailedFeedback['rewrite'];

    return (
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='rewrite-answer'>Your rewritten version:</Label>
          <Textarea
            id='rewrite-answer'
            rows={6}
            value={userAnswers['rewrite'] || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleAnswerChange('rewrite', e.target.value)
            }
            placeholder='Rewrite the text here...'
            className={`w-full ${isWrong ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>

        {isWrong && !isCompleted && (
          <div className='flex items-start gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700'>
            <XCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            <p>
              Your rewrite needs improvement. Please check the criteria and try
              again.
            </p>
          </div>
        )}

        {isSubmitted && rewriteFeedback && (
          <div
            className={`rounded-md p-2 text-sm ${isWrong ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}
          >
            <p className='font-medium'>Feedback:</p>
            <p>{rewriteFeedback}</p>
          </div>
        )}

        {rewriteSolution?.criteria && (
          <div className='rounded-md bg-muted p-3'>
            <h3 className='mb-2 font-medium'>Evaluation Criteria:</h3>
            <ul className='list-disc space-y-1 pl-5 text-sm'>
              {rewriteSolution.criteria.map((criterion, index) => (
                <li key={index}>{criterion}</li>
              ))}
            </ul>
          </div>
        )}

        {isCompleted && rewriteSolution?.example_solution && (
          <div className='rounded-md bg-green-50 p-3 text-green-700'>
            <h3 className='mb-1 font-medium'>Example Solution:</h3>
            <p className='text-sm'>{rewriteSolution.example_solution}</p>
          </div>
        )}
      </div>
    );
  };

  const renderFreeResponse = () => {
    const freeResponseSolution = parsedSolution as FreeResponseExercise;
    const isWrong = isSubmitted && wrongAnswers['free_response'];
    const responseFeedback = detailedFeedback['free_response'];

    return (
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='free-response-answer'>Your response:</Label>
          <Textarea
            id='free-response-answer'
            rows={8}
            value={userAnswers['free_response'] || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleAnswerChange('free_response', e.target.value)
            }
            placeholder='Write your response here...'
            className={`w-full ${isWrong ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>

        {isWrong && !isCompleted && (
          <div className='flex items-start gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700'>
            <XCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            <p>
              Your response could be more detailed and thorough. Please review
              the criteria.
            </p>
          </div>
        )}

        {isSubmitted && responseFeedback && (
          <div
            className={`rounded-md p-2 text-sm ${isWrong ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}
          >
            <p className='font-medium'>Feedback:</p>
            <p>{responseFeedback}</p>
          </div>
        )}

        {freeResponseSolution?.evaluation_criteria && (
          <div className='rounded-md bg-muted p-3'>
            <h3 className='mb-2 font-medium'>Evaluation Criteria:</h3>
            <ul className='list-disc space-y-1 pl-5 text-sm'>
              {freeResponseSolution.evaluation_criteria.map(
                (criterion, index) => (
                  <li key={index}>
                    <span className='font-medium'>{criterion.criterion}</span> (
                    {criterion.weight}%) - {criterion.description}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {isCompleted && freeResponseSolution?.example_solution && (
          <div className='rounded-md bg-green-50 p-3 text-green-700'>
            <h3 className='mb-1 font-medium'>Example Response:</h3>
            <p className='text-sm'>{freeResponseSolution.example_solution}</p>
          </div>
        )}
      </div>
    );
  };

  const renderExerciseContent = () => {
    switch (exercise.exercise_type) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'fill_blank':
        return renderFillBlank();
      case 'rewrite':
        return renderRewrite();
      case 'free_response':
        return renderFreeResponse();
      default:
        return (
          <div className='rounded-md bg-amber-50 p-4 text-amber-800'>
            Unsupported exercise type: {exercise.exercise_type}
          </div>
        );
    }
  };

  return (
    <Card
      className={`border ${
        isCompleted
          ? 'border-green-500/30 bg-green-50/10'
          : isSubmitted
            ? 'border-amber-500/30'
            : 'border-primary/20'
      }`}
    >
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl'>{exercise.title}</CardTitle>
          {isCompleted ? (
            <div className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800'>
              <CheckCircle className='h-3 w-3' />
              <span>Completed • Score: {lastScore}%</span>
            </div>
          ) : isSubmitted ? (
            <div className='flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800'>
              <span>In Progress • Score: {lastScore}%</span>
            </div>
          ) : null}
        </div>
        <CardDescription>{exercise.description}</CardDescription>
      </CardHeader>

      {isExpanded ? (
        <>
          <CardContent className='space-y-4'>
            {/* Show introduction text if available */}
            {parsedContent.introduction && (
              <div className='rounded-md bg-muted p-4'>
                <p className='whitespace-pre-wrap'>
                  {parsedContent.introduction}
                </p>
              </div>
            )}

            {renderExerciseContent()}
          </CardContent>

          <CardFooter className='flex justify-between'>
            <Button variant='outline' onClick={() => setIsExpanded(false)}>
              Collapse
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCompleted || isGrading}
              variant={isCompleted ? 'outline' : 'default'}
            >
              {isCompleted ? (
                'Already Completed'
              ) : isGrading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Grading...
                </>
              ) : (
                'Submit Answer'
              )}
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardFooter>
          <Button
            variant='outline'
            className={`w-full ${isCompleted ? 'border-green-500/30 text-green-700 hover:border-green-500/50' : ''}`}
            onClick={() => setIsExpanded(true)}
          >
            {isCompleted ? (
              <span className='flex items-center gap-1.5'>
                <CheckCircle className='h-4 w-4' />
                Review Completed Exercise
              </span>
            ) : (
              'Start Exercise'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
