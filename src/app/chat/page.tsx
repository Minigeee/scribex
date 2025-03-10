import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  return (
    <div className='container mx-auto h-[calc(100vh-4rem)] py-6'>
      <div className='flex h-full flex-col overflow-hidden rounded-lg border'>
        <ChatInterface />
      </div>
    </div>
  );
}
