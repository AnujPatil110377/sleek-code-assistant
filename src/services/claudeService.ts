import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/integrations/supabase/client';

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

export async function generateClaudeResponse(message: string) {
  try {
    const apiKey = await getAnthropicKey();
    console.log('Initializing Anthropic client...');

    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    console.log('Sending message to Claude...');
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: "You are a helpful MIPS assembly programming assistant. You help users understand and debug MIPS code, explaining concepts clearly and providing specific examples.",
      messages: [{
        role: 'user',
        content: message,
      }],
    });

    console.log('Claude response received');
    
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