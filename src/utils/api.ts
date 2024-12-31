import { API_URL } from '../config/env';

export interface SimulationResponse {
  success: boolean;
  data?: {
    registers: { [key: string]: number };
    memory: { [address: string]: string };
    console_output: string;
    pc: number;
  };
  error?: string;
}

const API_BASE_URL ='https://anujpatil.pythonanywhere.com'  // Replace with your actual production URL
    

  export async function simulateCode(code: string): Promise<SimulationResponse> {
  try {
    console.log('=== Sending simulation request ===');
    
    // Normalize line endings and remove extra whitespace
    const normalizedCode = code.replace(/\r\n/g, '\n').trim();
    console.log('Normalized Code:', normalizedCode);

    const response = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        code: normalizedCode 
      }),
    });

    console.log('Response status:', response.status);

    // Check if the response is OK
    if (!response.ok) {
      console.error('Response not OK:', response.statusText);
      const errorText = await response.text();
      return {
        success: false,
        error: `Error: ${response.status} - ${errorText || response.statusText}`,
      };
    }

    // Parse the response JSON
    const data: SimulationResponse = await response.json();
    console.log('Response data:', data);

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: 'Failed to connect to the simulation server. Please try again later.',
    };
  }
}