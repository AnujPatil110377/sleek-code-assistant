import requests
import json

def test_mips_simulator():
    # API endpoint
    url = 'http://localhost:5000/simulate'
    
    # Read the test program file
    with open('factorial.asm', 'rb') as f:
        files = {'file': ('test1.asm', f)}
        
        # Send POST request
        response = requests.post(url, files=files)
        
        # Check if request was successful
        if response.status_code == 200:
            result = response.json()
            
            # Print results in a formatted way
            print("=== Simulation Results ===")
            
            print("\nConsole Output:")
            print(result['console_output'])
            
            print("\nRegister Values:")
            registers = result['registers']
            for reg_name, value in registers.items():
                if value != 0:  # Only print non-zero registers
                    print(f"${reg_name}: {value}")
            
            print("\nMemory Values:")
            memory = result['memory']
            for addr, value in memory.items():
                print(f"Address {addr}: {value}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

if __name__ == '__main__':
    test_mips_simulator()