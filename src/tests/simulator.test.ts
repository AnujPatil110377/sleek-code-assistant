import { runMIPSProgram } from '../index';

describe('MIPS Simulator Tests', () => {
  // Helper function to capture console output
  const captureConsoleOutput = (fn: () => void): string[] => {
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    console.log = (msg) => logs.push(msg);
    console.error = (msg) => logs.push(`ERROR: ${msg}`);
    
    fn();
    
    console.log = originalLog;
    console.error = originalError;
    return logs;
  };

  // Helper function to print test outputs
  const printTestOutputs = (testName: string, outputs: string[]) => {
    console.log('\n' + '='.repeat(50));
    console.log(`Test: ${testName}`);
    console.log('='.repeat(50));
    outputs.forEach(output => console.log(output));
    console.log('='.repeat(50) + '\n');
  };

  test('Factorial Calculation', () => {
    const program = `
      .text
      main:
          li $a0, 5       # Calculate factorial of 5
          jal factorial
          move $a0, $v0   # Move result to $a0
          li $v0, 1       # Print result
          syscall
          li $v0, 10      # Exit
          syscall

      factorial:
          # If input is 0 or 1, return 1
          li $v0, 1
          beq $a0, $zero, done
          beq $a0, $v0, done
          
          # Save return address and input
          addi $sp, $sp, -8
          sw $ra, 4($sp)
          sw $a0, 0($sp)
          
          # Calculate factorial of n-1
          addi $a0, $a0, -1
          jal factorial
          
          # Restore input and multiply
          lw $a0, 0($sp)
          lw $ra, 4($sp)
          addi $sp, $sp, 8
          mul $v0, $a0, $v0
          
      done:
          jr $ra
    `;
    
    const outputs = captureConsoleOutput(() => {
      runMIPSProgram(program, false);  // Set to true for step-by-step execution
    });

    printTestOutputs('Factorial of 5', outputs);
    
    // The factorial of 5 should be 120
    expect(outputs).toContain('Output (int): 120');
  });

  test('Basic Arithmetic with Detailed Output', () => {
    const program = `
      .text
      main:
        li $t0, 5        # Load 5 into $t0
        li $t1, 3        # Load 3 into $t1
        add $t2, $t0, $t1  # $t2 = $t0 + $t1
        li $v0, 1        # syscall 1 (print_int)
        move $a0, $t2    # move result to $a0
        syscall          # Should print 8
        
        li $v0, 10       # Exit
        syscall
    `;
    
    const outputs = captureConsoleOutput(() => {
      runMIPSProgram(program, false);
    });

    printTestOutputs('Basic Arithmetic', outputs);
    expect(outputs).toContain('Output (int): 8');
  });

  test('String Output with Memory Check', () => {
    const program = `
      .data
      message: .asciiz "Hello, MIPS!"

      .text
      main:
        li $v0, 4        # syscall 4 (print_str)
        la $a0, message  # load address of message
        syscall
        
        li $v0, 10       # Exit
        syscall
    `;
    
    const outputs = captureConsoleOutput(() => {
      runMIPSProgram(program, false);
    });

    printTestOutputs('String Output', outputs);
    expect(outputs).toContain('Output (string): Hello, MIPS!');
  });

  test('Loop with Counter', () => {
    const program = `
      .text
      main:
        li $t0, 0        # Initialize counter
        li $t1, 3        # Loop limit
      
      loop:
        beq $t0, $t1, exit  # Exit if counter = limit
        
        li $v0, 1        # Print current counter
        move $a0, $t0
        syscall
        
        addi $t0, $t0, 1   # Increment counter
        j loop            # Jump back to loop
        
      exit:
        li $v0, 10       # Exit
        syscall
    `;
    
    const outputs = captureConsoleOutput(() => {
      runMIPSProgram(program, false);
    });

    printTestOutputs('Loop Counter', outputs);
    expect(outputs).toContain('Output (int): 0');
    expect(outputs).toContain('Output (int): 1');
    expect(outputs).toContain('Output (int): 2');
  });
}); 