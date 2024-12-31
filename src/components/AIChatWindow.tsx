'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

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

  const handleSendMessage = async () => {
    if (!input.trim()) return

    try {
      setIsLoading(true)
      console.log('Sending message:', input)
      
      // Add user message to chat with proper typing
      const newMessages: Message[] = [
        ...messages,
        { role: 'user' as const, content: input }
      ]
      setMessages(newMessages)
      setInput('')

      // Simulate AI response with a delay
      setTimeout(() => {
        const aiResponse: Message = {
          role: 'ai',
          content: "I'm here to help you with the MIPS simulator! You can ask me questions about MIPS assembly, how to use the simulator, or get help debugging your code."
        }
        setMessages(prev => [...prev, aiResponse])
        setIsLoading(false)
      }, 1000)

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-96 h-[500px] bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h3 className="text-sm font-medium">MIPS Assistant</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>×</Button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`rounded-lg p-2 max-w-[80%] ${
                  msg.role === 'ai' ? 'bg-gray-700' : 'bg-green-600'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                placeholder="Ask a question..."
                rows={2}
              />
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send'
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