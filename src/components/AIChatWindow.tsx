'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Bot, Send } from 'lucide-react'
import { generateGroqResponse, formatResponse } from '@/services/groqService'

type Message = {
  role: 'user' | 'ai';
  content: string;
}

const AIChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const chatWindowRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    try {
      setIsLoading(true)
      const newMessage: Message = { role: 'user', content: input }
      setMessages(prev => [...prev, newMessage])
      setInput('')

      const allMessages = [...messages, newMessage]
      console.log('Messages being sent:', allMessages)

      const validMessages = allMessages.map(msg => ({
        role: msg.role as 'user' | 'ai',
        content: msg.content
      })).filter(msg => 
        msg.role === 'user' || msg.role === 'ai'
      )

      console.log('Valid messages:', validMessages)

      console.log('Final payload being sent to API:', {
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specialized in MIPS assembly programming. 
            When explaining code, keep responses concise and focused on MIPS assembly.`
          },
          ...validMessages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = await generateGroqResponse(validMessages)

      const aiResponse: Message = {
        role: 'ai',
        content: response
      }
      setMessages(prev => [...prev, aiResponse])

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleFullScreen = () => {
    if (chatWindowRef.current) {
      if (!document.fullscreenElement) {
        chatWindowRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }

  const renderMessage = (content: string) => {
    return (
      <div 
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ 
          __html: formatResponse(content) 
        }} 
      />
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 shadow-lg"
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm font-medium">MIPS Bot</span>
      </Button>

      {isOpen && (
        <div ref={chatWindowRef} className="absolute top-12 right-0 w-96 h-[500px] bg-gray-900 rounded-lg shadow-xl border border-gray-800 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-gray-800 bg-gray-800">
            <Bot className="w-6 h-6 text-blue-500" />
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-white">MIPS Bot</h3>
              <span className="text-xs text-green-500">Online</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-gray-400 hover:text-white"
              onClick={toggleFullScreen}
            >
              {document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-gray-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              ×
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`rounded-lg p-2 max-w-[80%] ${
                  msg.role === 'ai' 
                    ? 'bg-gray-800 text-white whitespace-pre-wrap text-sm' 
                    : 'bg-blue-600 text-white text-sm'
                }`}>
                  {msg.role === 'ai' ? renderMessage(msg.content) : msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-800">
            <div className="flex gap-2 items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Ask anything about MIPS..."
                rows={1}
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 h-auto"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIChatWindow