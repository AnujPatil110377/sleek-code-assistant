import { SimulatorState } from '@/utils/mipsSimulator';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let contextHistory: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];

export const formatResponse = (response: string): string => {
  return response
    // Handle code blocks with simple formatting
    .replace(/```(mips|assembly)?\n([\s\S]*?)```/g, '<div class="code-block bg-gray-800 p-2 my-2 font-mono whitespace-pre">$2</div>')
    // Handle lists
    .replace(/- (.*)/g, '• $1\n')
    // Handle emphasis
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle line breaks
    .replace(/\n/g, '<br />');
};

export async function generateGroqResponse(
  messages: { role: 'user' | 'ai'; content: string }[],
  simulatorState?: SimulatorState
): Promise<string> {
  try {
    console.log('Generating response for messages:', messages);
    
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not found. Please set VITE_GROQ_API_KEY in your environment variables.');
    }

    // Convert 'ai' role to 'assistant' for API compatibility
    const convertedMessages = messages.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specialized in MIPS assembly programming. 
            When explaining code, keep responses concise and focused on MIPS assembly.`
          },
          ...convertedMessages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from Groq');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "No response generated";
    
    console.log('Groq response content:', content);
    return content;

  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
} 
