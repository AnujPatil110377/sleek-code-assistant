import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{text: string, isUser: boolean}>;
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

const ChatPanel = ({
  isOpen,
  onClose,
  messages,
  message,
  onMessageChange,
  onSendMessage,
}: ChatPanelProps) => {
  return (
    <div className={cn("chat-panel", !isOpen && "closed")}>
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium">AI Assistant</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "mb-4 p-3 rounded-lg",
              msg.isUser
                ? "bg-primary text-primary-foreground ml-8"
                : "bg-muted text-muted-foreground mr-8"
            )}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Ask for help..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;