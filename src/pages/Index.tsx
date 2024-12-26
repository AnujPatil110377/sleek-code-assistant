import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import OutputPanel from '@/components/OutputPanel';
import ChatPanel from '@/components/ChatPanel';

const initialCode = `# MIPS Assembly Code
.data
    hello: .asciiz "Hello, world! This string is from MIPS!\\n"
    space: .asciiz " "

.text
    # Print the string
    addi $v0, $zero, 4
    la $a0, hello
    syscall

    # Print numbers 0 to 4
    addi $s0, $zero, 0
loop:
    sltiu $t0, $s0, 10
    beq $t0, $zero, end`;

const Index = () => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);

  const handleRunCode = () => {
    setOutput('Hello, world! This string is from MIPS!\n0 1 2 3 4');
    console.log('Running MIPS code:', code);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-16 border-b flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold">MIPS Code Editor</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </nav>

      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <CodeEditor 
          code={code} 
          onChange={(value) => setCode(value || '')} 
          onRun={handleRunCode}
        />
        <OutputPanel output={output} />
      </div>

      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        message={message}
        onMessageChange={setMessage}
        onSendMessage={() => {
          if (!message.trim()) return;
          setMessages(prev => [...prev, { text: message, isUser: true }]);
          setMessage('');
        }}
      />
    </div>
  );
};

export default Index;