import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/integrations/supabase/client';
import { SimulatorState } from '@/utils/mipsSimulator';

async function getAnthropicKey() {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'ANTHROPIC_API_KEY')
      .single();

    if (error) throw error;
    if (!data?.value) throw new Error('API key not found');
    return data.value;
  } catch (error) {
    console.error('Error fetching Anthropic API key:', error);
    throw new Error('Could not retrieve API key');
  }
}

export async function generateClaudeResponse(
  message: string, 
  simulatorState?: SimulatorState
) {
  try {
    console.log('Generating Claude response for:', message);
    
    const apiKey = await getAnthropicKey();
    if (!apiKey) {
      throw new Error('API key not found. Please set up your Anthropic API key in Supabase secrets.');
    }

    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });

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
      return "I apologize, but I can only process text responses at the moment.";
    }
  } catch (error) {
    console.error('Error generating Claude response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response from Claude';
    throw new Error(errorMessage);
  }
}