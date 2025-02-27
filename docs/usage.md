# Usage Examples

A collection of usage examples for various components in this project.

**Note:** When adding new examples, keep them concise but complete.

## Database Types

Import types from `@/lib/database.types`:

```typescript
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from '@/lib/database.types';

// Row type (full database record)
type Ticket = Tables<'tickets'>;

// Insert type (for creating new records)
type NewTicket = TablesInsert<'tickets'>;

// Update type (for modifying existing records)
type TicketUpdate = TablesUpdate<'tickets'>;

// Enum type (for status, priority, etc)
type TicketStatus = Enums<'ticket_status'>; // 'open' | 'closed' | etc

// Common patterns
type TicketWithRelations = Tables<'tickets'> & {
  contact: Tables<'contacts'>;
  messages: Tables<'messages'>[];
};

// Form data (all fields optional)
type TicketForm = Partial<TablesInsert<'tickets'>>;
```

## Supabase Clients

### Server Components

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function PrivatePage() {
  const client = await createClient();
  const { data: tickets } = await client.from('tickets').select('*');

  // ...
}
```

### Client Components

```tsx
import { createClient } from '@/lib/supabase/client';

// Client is a singleton, no need to await
const supabase = createClient();

// Example usage in a component
const { data } = await supabase.from('tickets').select();
```

## Authentication

### Client Side Authentication

```tsx
// Example usage of useAuth hook in a component
import { useAuth } from '@/lib/hooks/use-auth';

function AuthenticatedComponent() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      Welcome {user.email}!
      {/* Access other user properties like user.id, user.user_metadata etc */}
    </div>
  );
}
```

## Toast Notifications

We use Sonner for toast notifications. The Toaster component is already included in the app's providers.

## React Flow

```tsx
import React from 'react';
import { ReactFlow } from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
 
const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
 
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} />
    </div>
  );
}
```

### Custom Nodes

```tsx
import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
 
const handleStyle = { left: 10 };
 
function TextUpdaterNode({ data }) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);
 
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      />
    </>
  );
}
```

## AI Utilities

```tsx
// Direct usage with any provider (server side only)
import { generateCompletion, systemMessage, userMessage } from '@/lib/utils/ai';

// Use this if on client side
// import { generateCompletion } from '@/app/actions/generate-completion';

const response = await generateCompletion(
  {
    messages: [
      systemMessage('You are a helpful assistant.'),
      userMessage('Tell me about React'),
    ],
  },
  {
    provider: 'google', // 'openai', 'anthropic', 'mistral', 'groq', 'custom'
    modelName: 'gemini-2.0-flash',
  }
);
```
