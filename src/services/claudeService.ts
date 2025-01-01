import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/integrations/supabase/client';
import { SimulatorState } from '@/utils/mipsSimulator';

async function getAnthropicKey() {
  try {
    console.log('Fetching Anthropic API key from Supabase...');
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'ANTHROPIC_API_KEY')
      .maybeSingle();

    if (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
    
    if (!data) {
      console.error('API key not found in secrets');
      throw new Error('API key not found in Supabase secrets. Please add it using the form above.');
    }

    console.log('Successfully retrieved API key');
    return data.value;
  } catch (error) {
    console.error('Error in getAnthropicKey:', error);
    throw new Error('Could not retrieve API key. Please ensure it is properly set in Supabase secrets.');
  }
}

export async function generateClaudeResponse(
  message: string, 
  simulatorState?: SimulatorState
) {
  try {
    console.log('Generating Claude response for:', message);
    
    const apiKey = await getAnthropicKey();
    console.log('API key retrieved, initializing Anthropic client');

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

    console.log('Sending request to Claude API...');
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