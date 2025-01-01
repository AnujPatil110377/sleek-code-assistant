import { SimulatorState } from '@/utils/mipsSimulator';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
  message: string, 
  simulatorState?: SimulatorState
): Promise<string> {
  try {
    console.log('Generating response for:', message);
    
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not found. Please set VITE_GROQ_API_KEY in your environment variables.');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specialized in MIPS assembly programming. 
            When explaining code:
            1. Use clear section headers with double line breaks before and after
            2. Format code blocks with proper indentation and comments
            3. Use bullet points with extra spacing between items
            4. Add descriptive comments for each code section
            5. Keep explanations concise but clear
            6. Use markdown formatting for better readability
            7. Add horizontal rules (---) between major sections

            Available MIPS Instructions and Features: you cannot use any other instructions or features
            - Basic arithmetic: add, sub, addi, mul
            - Logical operations: and, or, andi, ori, xor, nor, sll, srl
            - Memory access: lw, sw
            - Control flow: beq, bne, j, jal, jr
            - Special instructions: la (load address), li (load immediate), lui
            - System calls (syscall):
              * v0=1: print integer in a0
              * v0=4: print string at address in a0
              * v0=10: exit program
            
            Memory and Register Conventions:
            - Data segment starts at 0x10010000
            - Stack pointer (sp) initialized to 0x7FFFFFFC
            - Register zero always contains 0
            
            Current State: ${simulatorState ? 
              `\nPC: ${simulatorState.pc}\nRegisters: ${JSON.stringify(simulatorState.registers)}\nMemory: ${JSON.stringify(simulatorState.memory)}` 
              : 'No simulator state available'}`
          },
          {
            role: 'user',
            content: message,
          }
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
    return data.choices[0]?.message?.content || "No response generated";
    
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
} 