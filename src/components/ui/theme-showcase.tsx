'use client';

import { RPG_COLORS } from '@/lib/theme';
import { Badge } from './badge';
import { Button } from './button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';

/**
 * ThemeShowcase Component
 *
 * This component demonstrates the ScribexX theme elements and how to use them.
 * It serves as a reference for developers implementing the UI.
 */
export function ThemeShowcase() {
  return (
    <div className='space-y-8 p-6'>
      <h1 className='text-3xl font-bold text-primary'>
        ScribexX Theme Showcase
      </h1>
      <p className='text-muted-foreground'>
        This component demonstrates the Synthwave + Cyberpunk + Botanical
        Futurism theme elements.
      </p>

      {/* Color Palette Section */}
      <section>
        <h2 className='mb-4 text-2xl font-semibold'>Color Palette</h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <ColorCard
            name='Neon Purple'
            color='bg-neon-purple'
            textColor='text-white'
          />
          <ColorCard
            name='Electric Blue'
            color='bg-electric-blue'
            textColor='text-white'
          />
          <ColorCard
            name='Cyber Green'
            color='bg-cyber-green'
            textColor='text-black'
          />
          <ColorCard
            name='Neon Pink'
            color='bg-neon-pink'
            textColor='text-white'
          />
          <ColorCard
            name='Digital Teal'
            color='bg-digital-teal'
            textColor='text-black'
          />
          <ColorCard
            name='Sunset Orange'
            color='bg-sunset-orange'
            textColor='text-black'
          />
          <ColorCard
            name='Metallic Gray'
            color='bg-muted'
            textColor='text-foreground'
          />
          <ColorCard
            name='Background'
            color='bg-background'
            textColor='text-foreground'
            border
          />
        </div>
      </section>

      {/* UI Elements Section */}
      <section>
        <h2 className='mb-4 text-2xl font-semibold'>UI Elements</h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Button variations using the theme colors
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-wrap gap-2'>
                <Button>Default</Button>
                <Button variant='secondary'>Secondary</Button>
                <Button variant='destructive'>Destructive</Button>
                <Button variant='outline'>Outline</Button>
                <Button variant='ghost'>Ghost</Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button className='bg-neon-purple hover:bg-neon-purple/90'>
                  Neon Purple
                </Button>
                <Button className='bg-electric-blue hover:bg-electric-blue/90'>
                  Electric Blue
                </Button>
                <Button className='bg-cyber-green text-black hover:bg-cyber-green/90'>
                  Cyber Green
                </Button>
                <Button className='bg-digital-teal text-black hover:bg-digital-teal/90'>
                  Digital Teal
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>
                Badge variations using the theme colors
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-wrap gap-2'>
                <Badge>Default</Badge>
                <Badge variant='secondary'>Secondary</Badge>
                <Badge variant='destructive'>Destructive</Badge>
                <Badge variant='outline'>Outline</Badge>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Badge className='bg-neon-purple'>Neon Purple</Badge>
                <Badge className='bg-electric-blue'>Electric Blue</Badge>
                <Badge className='bg-cyber-green text-black'>Cyber Green</Badge>
                <Badge className='bg-digital-teal text-black'>
                  Digital Teal
                </Badge>
                <Badge className='bg-sunset-orange text-black'>
                  Sunset Orange
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Special Effects Section */}
      <section>
        <h2 className='mb-4 text-2xl font-semibold'>Special Effects</h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Neon Glow Effects</CardTitle>
              <CardDescription>Elements with neon glow effects</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-wrap gap-4'>
                <Button className='neon-glow neon-purple-glow'>
                  Purple Glow
                </Button>
                <Button className='neon-glow neon-blue-glow'>Blue Glow</Button>
                <Button className='neon-glow neon-green-glow'>
                  Green Glow
                </Button>
                <Button className='neon-glow neon-pink-glow'>Pink Glow</Button>
              </div>
              <div className='flex flex-wrap gap-4'>
                <div className='rounded-md p-4 shadow-neon-purple'>
                  Shadow Glow Purple
                </div>
                <div className='rounded-md p-4 shadow-neon-blue'>
                  Shadow Glow Blue
                </div>
                <div className='rounded-md p-4 shadow-neon-green'>
                  Shadow Glow Green
                </div>
                <div className='rounded-md p-4 shadow-neon-pink'>
                  Shadow Glow Pink
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Background Effects</CardTitle>
              <CardDescription>Special background effects</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='gradient-bg flex h-24 items-center justify-center rounded-md'>
                Gradient Background
              </div>
              <div className='flex h-24 items-center justify-center rounded-md bg-cyber-grid'>
                Cyber Grid Background
              </div>
              <div className='glass-panel flex h-24 items-center justify-center rounded-md'>
                Glass Panel Effect
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* RPG Elements Section */}
      <section>
        <h2 className='mb-4 text-2xl font-semibold'>RPG Elements</h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Skill Nodes</CardTitle>
              <CardDescription>Skill tree node states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-4'>
                {Object.entries(RPG_COLORS.skillNode).map(([state, color]) => (
                  <div
                    key={state}
                    className='flex h-16 w-16 items-center justify-center rounded-full text-xs'
                    style={{
                      backgroundColor: color,
                      color: isLightColor(color) ? '#000' : '#fff',
                    }}
                  >
                    {state}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievement Ranks</CardTitle>
              <CardDescription>RPG rank indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-4'>
                {Object.entries(RPG_COLORS.ranks).map(([rank, color]) => (
                  <div
                    key={rank}
                    className='flex h-16 w-16 items-center justify-center rounded-md text-2xl font-bold'
                    style={{
                      backgroundColor: color,
                      color: isLightColor(color) ? '#000' : '#fff',
                    }}
                  >
                    {rank}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Helper component for color showcase
function ColorCard({
  name,
  color,
  textColor,
  border = false,
}: {
  name: string;
  color: string;
  textColor: string;
  border?: boolean;
}) {
  return (
    <div
      className={`rounded-md p-4 ${color} ${textColor} ${border ? 'border' : ''} flex h-24 items-center justify-center`}
    >
      {name}
    </div>
  );
}

// Helper function to determine if a color is light (for text contrast)
function isLightColor(color: string): boolean {
  // For hex colors
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }
  // Default for non-hex colors
  return false;
}
