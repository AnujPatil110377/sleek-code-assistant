import Anthropic from '@anthropic-ai/sdk';
import { SimulatorState } from '@/utils/mipsSimulator';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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
    return response.content[0].text;
  } catch (error) {
    console.error('Error generating Claude response:', error);
    throw new Error('Failed to generate response from Claude');
  }
}