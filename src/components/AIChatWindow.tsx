'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const AIChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([])
  const [input, setInput] = useState('')

  return (
    <div className="fixed top-16 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 h-96 bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h3 className="text-sm font-medium">Chat with AI Assistant</h3>
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
          </div>

          <div className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Ask a question..."
              />
              <Button className="bg-green-600 hover:bg-green-700">Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIChatWindow 