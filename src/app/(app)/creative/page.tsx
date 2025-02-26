'use client';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BrainIcon,
  LightbulbIcon,
  RefreshCwIcon,
  SparklesIcon,
} from 'lucide-react';
import { useState } from 'react';

export default function CreativePage() {
  const [prompt, setPrompt] = useState('');

  // This is a placeholder for the actual AI-generated suggestions
  // In a real app, this would call an API to get suggestions
  const generateSuggestions = () => {
    console.log('Generating suggestions for:', prompt);
    // In a real app, this would make an API call
  };

  return (
    <div className='container mx-auto space-y-8 px-5 py-6 md:py-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Creative Tools</h1>
        <p className='mt-2 text-muted-foreground'>
          Get inspiration and overcome writer's block
        </p>
      </div>

      <Tabs defaultValue='inspiration' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='inspiration'>
            <LightbulbIcon className='mr-2 h-4 w-4' />
            Writing Inspiration
          </TabsTrigger>
          <TabsTrigger value='writers-block'>
            <BrainIcon className='mr-2 h-4 w-4' />
            Writer's Block
          </TabsTrigger>
        </TabsList>

        <TabsContent value='inspiration' className='mt-6 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Writing Prompts</CardTitle>
              <CardDescription>
                Get inspired with these writing prompts for different genres
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {[
                  {
                    title: 'Mystery',
                    prompt:
                      "A detective finds a strange object at a crime scene that doesn't belong there.",
                    color: 'bg-purple-100 text-purple-800',
                  },
                  {
                    title: 'Science Fiction',
                    prompt:
                      'A student discovers they can communicate with technology in a unique way.',
                    color: 'bg-blue-100 text-blue-800',
                  },
                  {
                    title: 'Fantasy',
                    prompt:
                      'A ordinary object in your home suddenly reveals magical properties.',
                    color: 'bg-amber-100 text-amber-800',
                  },
                  {
                    title: 'Historical',
                    prompt:
                      'Write a letter from the perspective of someone living during an important historical event.',
                    color: 'bg-green-100 text-green-800',
                  },
                  {
                    title: 'Adventure',
                    prompt:
                      'A character discovers a map hidden in an unexpected place.',
                    color: 'bg-red-100 text-red-800',
                  },
                  {
                    title: 'Persuasive',
                    prompt:
                      'Argue for or against allowing students to use AI tools for writing assignments.',
                    color: 'bg-indigo-100 text-indigo-800',
                  },
                ].map((item, index) => (
                  <Card key={index} className='overflow-hidden'>
                    <CardHeader className='pb-2'>
                      <div
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${item.color}`}
                      >
                        {item.title}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm'>{item.prompt}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant='outline' size='sm' className='w-full'>
                        <SparklesIcon className='mr-2 h-4 w-4' />
                        Use This Prompt
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <Button className='w-full'>
                <RefreshCwIcon className='mr-2 h-4 w-4' />
                Generate New Prompts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='writers-block' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Writer's Block Assistant</CardTitle>
              <CardDescription>
                Stuck on your writing? Describe what you're working on and get
                suggestions to help you move forward.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Input
                  placeholder="Describe what you're writing about or where you're stuck..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button onClick={generateSuggestions}>
                  <SparklesIcon className='mr-2 h-4 w-4' />
                  Generate
                </Button>
              </div>

              <div className='rounded-lg border p-4'>
                <h3 className='mb-2 font-medium'>
                  Suggestions will appear here
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Enter a description of your writing project or where you're
                  stuck, and our AI will provide suggestions to help you
                  overcome writer's block.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
