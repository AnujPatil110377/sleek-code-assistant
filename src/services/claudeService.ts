import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = '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';

export async function generateClaudeResponse(message: string) {
  try {
    console.log('Initializing Anthropic client...');

    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY,
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