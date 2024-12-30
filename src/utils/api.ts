export interface SimulationResponse {
  success: boolean;
  data?: {
    registers: { [key: string]: number };
    memory: { [address: string]: string };
    console_output: string;
  };
  error?: string;
}

export async function simulateCode(code: string): Promise<SimulationResponse> {
  try {
    console.log('=== Sending simulation request ===');
    console.log('Code:', code);

    const response = await fetch('http://localhost:5000/api/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('Response not OK:', response.statusText);
      return {
        success: false,
        error: `Error: ${response.statusText}`
      };
    }

    const data = await response.json();
    console.log('Response data:', data);

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: 'Failed to connect to simulation server'
    };
  }
} 