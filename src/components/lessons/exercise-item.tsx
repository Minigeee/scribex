import { useState, useMemo, useEffect } from 'react';
import type { ExerciseWithProgress } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle } from 'lucide-react';

interface ExerciseItemProps {
  exercise: ExerciseWithProgress;
  onComplete?: (exerciseId: string, score: number, userAnswers: Record<string, any>) => void;
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

export function ExerciseItem({ exercise, onComplete }: ExerciseItemProps) {
  const [isExpanded, setIsExpanded] = useState(!exercise.user_progress?.completed);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<Record<string | number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const isCompleted = exercise.user_progress?.completed || false;
  const lastScore = exercise.user_progress?.score || 0;
  
  // Parse the solution based on exercise type
  const parsedSolution = exercise.solution ? JSON.parse(JSON.stringify(exercise.solution)) : null;
  
  // Load saved answers when component mounts
  useEffect(() => {
    if (exercise.user_progress?.user_answers) {
      try {
        const savedAnswers = exercise.user_progress.user_answers as Record<string, any>;
        setUserAnswers(savedAnswers);
      } catch (error) {
        console.error('Error parsing saved answers:', error);
      }
    }
  }, [exercise.user_progress?.user_answers]);
  
  // Parse the content to extract individual questions
  const parsedContent = useMemo(() => {
    // For exercise types that don't have numbered questions, return the content as is
    if (exercise.exercise_type === 'rewrite' || exercise.exercise_type === 'free_response') {
      return {
        introduction: exercise.content,
        questions: []
      };
    }
    
    const content = exercise.content;
    
    // Split the content into introduction and questions
    const lines = content.split('\n');
    let introduction = '';
    const questions: ParsedQuestion[] = [];
    
    let currentQuestionText = '';
    let currentQuestionId = 0;
    
    let foundFirstQuestion = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line starts a new question (numbered format)
      const questionMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
      
      if (questionMatch) {
        foundFirstQuestion = true;
        
        // If we already have a question in progress, save it
        if (currentQuestionId > 0) {
          questions.push({
            id: currentQuestionId,
            text: currentQuestionText.trim()
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
    
    // Add the last question if there is one
    if (currentQuestionId > 0) {
      questions.push({
        id: currentQuestionId,
        text: currentQuestionText.trim()
      });
    }
    
    return {
      introduction: introduction.trim(),
      questions
    };
  }, [exercise.content, exercise.exercise_type]);
  
  const handleAnswerChange = (questionId: string | number, value: any) => {
    // Reset wrong answer state when user changes their answer
    setWrongAnswers(prev => ({
      ...prev,
      [questionId]: false
    }));
    
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleSubmit = () => {
    let score = 0;
    let feedbackMessage = '';
    let isCorrect = false;
    const newWrongAnswers: Record<string | number, boolean> = {};
    
    setIsSubmitted(true);
    
    switch (exercise.exercise_type) {
      case 'multiple_choice': {
        if (parsedSolution?.questions) {
          const questions = parsedSolution.questions as MultipleChoiceQuestion[];
          let correctCount = 0;
          
          questions.forEach(question => {
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
          let correctCount = 0;
          
          // TODO : Add AI scoring
          blanks.forEach(blank => {
            const userAnswer = userAnswers[blank.id]?.toLowerCase().trim() || '';
            const correctAnswer = blank.corrected.toLowerCase();
            
            // Simple check - in a real app, you might want more sophisticated matching
            if (correctAnswer.includes(userAnswer) && userAnswer.length > 0) {
              correctCount++;
            } else {
              newWrongAnswers[blank.id] = true;
            }
          });
          
          score = Math.round((correctCount / blanks.length) * 100);
          isCorrect = score >= 70;
          feedbackMessage = isCorrect 
            ? 'Well done! Your answers are correct.' 
            : 'Some of your answers need improvement.';
        }
        break;
      }
      
      case 'rewrite': {
        // For rewrite exercises, we'll use a simplified scoring approach
        // In a real app, you might want to use AI or more sophisticated text comparison
        const userText = userAnswers['rewrite'] || '';
        
        // TODO : Add AI scoring
        if (userText.length > 50) {
          // Basic length check as a simple validation
          score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100 for demo
          isCorrect = score >= 70;
          feedbackMessage = isCorrect 
            ? 'Your rewrite shows good improvement in organization and flow.' 
            : 'Your rewrite could use more work on organization and clarity.';
          
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
        // For free response, we'll also use a simplified approach
        const userText = userAnswers['free_response'] || '';
        
        // TODO : Add AI scoring
        if (userText.length > 100) {
          // Basic length check as a simple validation
          score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100 for demo
          isCorrect = true;
          feedbackMessage = 'Thank you for your thoughtful response!';
        } else {
          score = Math.floor(Math.random() * 50) + 20; // Random score between 20-70 for demo
          isCorrect = false;
          feedbackMessage = 'Your response could be more detailed and thorough.';
          newWrongAnswers['free_response'] = true;
        }
        break;
      }
      
      default:
        score = 0;
        feedbackMessage = 'Unable to evaluate this exercise type.';
        break;
    }
    
    setWrongAnswers(newWrongAnswers);
    setFeedback({
      message: feedbackMessage,
      isCorrect
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
  };
  
  const renderMultipleChoiceQuestion = (question: ParsedQuestion, solutionQuestion: MultipleChoiceQuestion, index: number) => {
    const isWrong = isSubmitted && wrongAnswers[question.id];
    
    return (
      <div key={question.id} className={`p-4 border rounded-md space-y-3 ${
        isWrong ? 'border-red-500' : 'border-muted'
      }`}>
        <h3 className="font-medium">Question {index + 1}</h3>
        <p className="text-sm mb-3">{question.text}</p>
        
        <RadioGroup 
          value={userAnswers[question.id]?.toString()}
          onValueChange={(value: string) => handleAnswerChange(question.id, parseInt(value))}
          className="space-y-2"
        >
          {solutionQuestion.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center space-x-2">
              <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}-option${optionIndex}`} />
              <Label htmlFor={`q${question.id}-option${optionIndex}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
        
        {isWrong && !isCompleted && (
          <div className="mt-3 p-2 text-sm rounded-md bg-red-50 text-red-700 flex items-start gap-2">
            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Incorrect answer. Please try again.</p>
          </div>
        )}
        
        {isCompleted && (
          <div className={`mt-3 p-2 text-sm rounded-md ${
            userAnswers[question.id] === solutionQuestion.correctIndex 
              ? 'bg-green-50 text-green-700' 
              : 'bg-amber-50 text-amber-700'
          }`}>
            <p className="font-medium">
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
  
  const renderFillBlankQuestion = (question: ParsedQuestion, blankQuestion: FillBlankQuestion, index: number) => {
    const isWrong = isSubmitted && wrongAnswers[question.id];
    
    return (
      <div key={question.id} className={`p-4 border rounded-md space-y-3 ${
        isWrong ? 'border-red-500' : 'border-muted'
      }`}>
        <h3 className="font-medium">Sentence {index + 1}</h3>
        <p className="text-muted-foreground">{blankQuestion.original}</p>
        <div className="flex flex-col space-y-2">
          <Label htmlFor={`blank-${question.id}`}>Your correction:</Label>
          <Input
            id={`blank-${question.id}`}
            value={userAnswers[question.id] ?? blankQuestion.original}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your correction..."
            className={isWrong ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
        </div>
        
        {isWrong && !isCompleted && (
          <div className="mt-3 p-2 text-sm rounded-md bg-red-50 text-red-700 flex items-start gap-2">
            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Your answer needs improvement.</p>
          </div>
        )}
        
        {isCompleted && (
          <div className="p-2 text-sm bg-green-50 text-green-700 rounded-md">
            <p className="font-medium">Sample correct answer:</p>
            <p>{blankQuestion.corrected}</p>
            <p className="mt-1 text-xs">{blankQuestion.explanation}</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderMultipleChoice = () => {
    if (!parsedSolution?.questions) return null;
    
    const questions = parsedSolution.questions as MultipleChoiceQuestion[];
    
    return (
      <div className="space-y-4">
        {parsedContent.questions.map((question, index) => {
          const solutionQuestion = questions.find(q => q.id === question.id);
          if (!solutionQuestion) return null;
          
          return renderMultipleChoiceQuestion(question, solutionQuestion, index);
        })}
      </div>
    );
  };
  
  const renderFillBlank = () => {
    if (!parsedSolution?.blanks) return null;
    
    const blanks = parsedSolution.blanks as FillBlankQuestion[];
    
    return (
      <div className="space-y-4">
        {parsedContent.questions.map((question, index) => {
          const blankQuestion = blanks.find(b => b.id === question.id);
          if (!blankQuestion) return null;
          
          return renderFillBlankQuestion(question, blankQuestion, index);
        })}
      </div>
    );
  };
  
  const renderRewrite = () => {
    const rewriteSolution = parsedSolution as RewriteExercise;
    const isWrong = isSubmitted && wrongAnswers['rewrite'];
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rewrite-answer">Your rewritten version:</Label>
          <Textarea
            id="rewrite-answer"
            rows={6}
            value={userAnswers['rewrite'] || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange('rewrite', e.target.value)}
            placeholder="Rewrite the text here..."
            className={`w-full ${isWrong ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>
        
        {isWrong && !isCompleted && (
          <div className="p-2 text-sm rounded-md bg-red-50 text-red-700 flex items-start gap-2">
            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Your rewrite needs improvement. Please check the criteria and try again.</p>
          </div>
        )}
        
        {rewriteSolution?.criteria && (
          <div className="bg-muted p-3 rounded-md">
            <h3 className="font-medium mb-2">Evaluation Criteria:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {rewriteSolution.criteria.map((criterion, index) => (
                <li key={index}>{criterion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {isCompleted && rewriteSolution?.example_solution && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md">
            <h3 className="font-medium mb-1">Example Solution:</h3>
            <p className="text-sm">{rewriteSolution.example_solution}</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderFreeResponse = () => {
    const freeResponseSolution = parsedSolution as FreeResponseExercise;
    const isWrong = isSubmitted && wrongAnswers['free_response'];
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="free-response-answer">Your response:</Label>
          <Textarea
            id="free-response-answer"
            rows={8}
            value={userAnswers['free_response'] || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange('free_response', e.target.value)}
            placeholder="Write your response here..."
            className={`w-full ${isWrong ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>
        
        {isWrong && !isCompleted && (
          <div className="p-2 text-sm rounded-md bg-red-50 text-red-700 flex items-start gap-2">
            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Your response could be more detailed and thorough. Please review the criteria.</p>
          </div>
        )}
        
        {freeResponseSolution?.evaluation_criteria && (
          <div className="bg-muted p-3 rounded-md">
            <h3 className="font-medium mb-2">Evaluation Criteria:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {freeResponseSolution.evaluation_criteria.map((criterion, index) => (
                <li key={index}>
                  <span className="font-medium">{criterion.criterion}</span> ({criterion.weight}%) - {criterion.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isCompleted && freeResponseSolution?.example_solution && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md">
            <h3 className="font-medium mb-1">Example Response:</h3>
            <p className="text-sm">{freeResponseSolution.example_solution}</p>
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
          <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
            Unsupported exercise type: {exercise.exercise_type}
          </div>
        );
    }
  };
  
  return (
    <Card className={`border ${isCompleted 
      ? 'border-green-500/30 bg-green-50/10' 
      : isSubmitted 
        ? 'border-amber-500/30' 
        : 'border-primary/20'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{exercise.title}</CardTitle>
          {isCompleted ? (
            <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Completed • Score: {lastScore}%</span>
            </div>
          ) : isSubmitted ? (
            <div className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
              <span>In Progress • Score: {lastScore}%</span>
            </div>
          ) : null}
        </div>
        <CardDescription>{exercise.description}</CardDescription>
      </CardHeader>
      
      {isExpanded ? (
        <>
          <CardContent className="space-y-4">
            {/* Show introduction text if available */}
            {parsedContent.introduction && (
              <div className="bg-muted p-4 rounded-md">
                <p className="whitespace-pre-wrap">{parsedContent.introduction}</p>
              </div>
            )}
            
            {renderExerciseContent()}
            
            {feedback && (
              <div className={`p-3 rounded-md ${feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {feedback.message}
                {feedback.isCorrect && lastScore >= 90 && (
                  <p className="mt-1 text-sm font-medium">
                    This exercise is now marked as completed!
                  </p>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsExpanded(false)}>
              Collapse
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isCompleted}
              variant={isCompleted ? "outline" : "default"}
            >
              {isCompleted ? "Already Completed" : "Submit Answer"}
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardFooter>
          <Button 
            variant="outline" 
            className={`w-full ${isCompleted ? 'border-green-500/30 hover:border-green-500/50 text-green-700' : ''}`}
            onClick={() => setIsExpanded(true)}
          >
            {isCompleted ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
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