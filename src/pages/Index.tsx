import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    // Simulate code execution
    setOutput('Hello, world! This string is from MIPS!\n0 1 2 3 4');
    console.log('Running MIPS code:', code);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I've analyzed your code. The syntax looks correct. You can try running it to see the output.", 
        isUser: false 
      }]);
    }, 1000);
    setMessage('');
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

      <div className="editor-container">
        <div className="code-editor">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Code Editor</h2>
            <Button onClick={handleRunCode} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run Code
            </Button>
          </div>
          <Editor
            height="calc(100% - 3rem)"
            defaultLanguage="mips"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="output-panel">
          <h2 className="text-lg font-medium mb-4">Output & Registers</h2>
          <div className="mb-4 p-4 bg-secondary rounded-lg">
            <h3 className="text-sm font-medium mb-2">Program Output</h3>
            <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Registers</h3>
            <div className="overflow-x-auto">
              <table className="registers-table">
                <thead>
                  <tr>
                    <th>Register</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>$zero</td>
                    <td>0x00000000</td>
                  </tr>
                  <tr>
                    <td>$v0</td>
                    <td>0x00000004</td>
                  </tr>
                  <tr>
                    <td>$a0</td>
                    <td>0x10000000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("chat-panel", !isChatOpen && "closed")}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium">AI Assistant</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsChatOpen(false)}
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
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask for help..."
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;