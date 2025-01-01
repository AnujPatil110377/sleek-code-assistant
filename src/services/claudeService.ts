import { Groq } from 'groq';
import { SimulatorState } from '@/utils/mipsSimulator';

const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true,
});

export async function generateGroqResponse(
  message: string, 
  simulatorState?: SimulatorState
) {
  try {
    console.log('Generating Groq response for:', message);
    
    let systemPrompt = `You are Groq, an AI assistant specialized in MIPS assembly programming. 
    You help users understand and debug MIPS code, explaining concepts clearly and providing specific examples.
    Keep responses concise and focused on MIPS assembly.`;

    if (simulatorState) {
      systemPrompt += `\nCurrent simulator state:
      PC: ${simulatorState.pc}
      Registers: ${JSON.stringify(simulatorState.registers)}
      Memory: ${JSON.stringify(simulatorState.memory)}`;
    }

    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('Groq response received:', response.choices[0]?.message?.content);
    
    return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error('Error generating Groq response:', error);
    throw new Error('Failed to generate response from Groq');
  }
}