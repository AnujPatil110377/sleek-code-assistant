import { Groq } from '@groq-cloud/sdk';
import { SimulatorState } from '@/utils/mipsSimulator';

const groq = new Groq({
  apiKey: process.env.VITE_GROQ_API_KEY || '',
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

    const response = await groq.messages.create({
      model: 'groq-model',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: message,
      }],
    });

    console.log('Groq response received:', response.content);
    
    // Handle different content block types
    const content = response.content[0];
    if ('text' in content) {
      return content.text;
    } else {
      // Handle other content types or return a default message
      return "I apologize, but I can only process text responses at the moment.";
    }
  } catch (error) {
    console.error('Error generating Groq response:', error);
    throw new Error('Failed to generate response from Groq');
  }
}