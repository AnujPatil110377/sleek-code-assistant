import Anthropic from '@anthropic-ai/sdk';
import { SimulatorState } from '@/utils/mipsSimulator';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Add this line to allow browser usage
});

export async function generateClaudeResponse(
  message: string, 
  simulatorState?: SimulatorState
) {
  try {
    console.log('Generating Claude response for:', message);
    
    let systemPrompt = `You are Claude, an AI assistant specialized in MIPS assembly programming. 
    You help users understand and debug MIPS code, explaining concepts clearly and providing specific examples.
    Keep responses concise and focused on MIPS assembly.`;

    if (simulatorState) {
      systemPrompt += `\nCurrent simulator state:
      PC: ${simulatorState.pc}
      Registers: ${JSON.stringify(simulatorState.registers)}
      Memory: ${JSON.stringify(simulatorState.memory)}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: message,
      }],
    });

    console.log('Claude response received:', response.content);
    
    // Handle different content block types
    const content = response.content[0];
    if ('text' in content) {
      return content.text;
    } else {
      // Handle other content types or return a default message
      return "I apologize, but I can only process text responses at the moment.";
    }
  } catch (error) {
    console.error('Error generating Claude response:', error);
    throw new Error('Failed to generate response from Claude');
  }
}