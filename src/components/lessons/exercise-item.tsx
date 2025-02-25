import { useState } from 'react';
import type { ExerciseWithProgress } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExerciseItemProps {
  exercise: ExerciseWithProgress;
  onComplete?: (exerciseId: string, score: number) => void;
}

export function ExerciseItem({ exercise, onComplete }: ExerciseItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  
  const isCompleted = exercise.user_progress?.completed || false;
  const lastScore = exercise.user_progress?.score || 0;
  
  // This is a placeholder for exercise validation
  // In a real implementation, this would be more sophisticated based on exercise type
  const handleSubmit = () => {
    // Simple validation for demo purposes
    const isCorrect = userAnswer.toLowerCase().includes('correct');
    const score = isCorrect ? 100 : Math.floor(Math.random() * 60);
    
    setFeedback({
      message: isCorrect 
        ? 'Great job! Your answer is correct.' 
        : 'Your answer needs some improvement. Try again!',
      isCorrect
    });
    
    if (onComplete) {
      onComplete(exercise.id, score);
    }
  };
  
  return (
    <Card className={`border ${isCompleted ? 'border-green-500/30 bg-green-50/10' : 'border-primary/20'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{exercise.title}</CardTitle>
          {isCompleted && (
            <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Completed • Score: {lastScore}%
            </div>
          )}
        </div>
        <CardDescription>{exercise.description}</CardDescription>
      </CardHeader>
      
      {isExpanded ? (
        <>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <p className="whitespace-pre-wrap">{exercise.content}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor={`answer-${exercise.id}`} className="block text-sm font-medium">
                Your Answer
              </label>
              <textarea
                id={`answer-${exercise.id}`}
                rows={4}
                className="w-full p-2 border rounded-md"
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
            </div>
            
            {feedback && (
              <div className={`p-3 rounded-md ${feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {feedback.message}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsExpanded(false)}>
              Collapse
            </Button>
            <Button onClick={handleSubmit}>
              Submit Answer
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsExpanded(true)}
          >
            {isCompleted ? 'Review Exercise' : 'Start Exercise'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 