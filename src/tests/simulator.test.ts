import { runMIPSProgram } from '../index';

describe('MIPS Simulator Tests', () => {
  test('Basic Arithmetic', () => {
    const program = `
      .text
      main:
        li $t0, 5        # Load 5 into $t0
        li $t1, 3        # Load 3 into $t1
        add $t2, $t0, $t1  # $t2 = $t0 + $t1
        li $v0, 1        # Print integer syscall
        move $a0, $t2    # Move sum to $a0
        syscall
        li $v0, 10       # Exit
        syscall
    `;

    const outputs = [];
    const originalLog = console.log;
    console.log = (msg) => outputs.push(msg);
    
    runMIPSProgram(program, false);
    
    console.log = originalLog;
    
    expect(outputs).toContain('Output (int): 8');
  });

  test('Memory Operations', () => {
    const program = `
      .data
      message: .asciiz "Hello"    # String in memory (starts at address 0)
      numbers: .word 42, 123, 456  # Array of words (starts at address 1000)
      buffer:  .space 8           # Allocate 8 bytes (starts after numbers)

      .text
      main:
          # Load and print the string
          li $v0, 4              
          la $a0, message        # Should load address 0
          syscall

          # Load and print first number (42)
          lw $t0, numbers        # Should load from address 1000
          li $v0, 1              
          move $a0, $t0
          syscall

          # Store value in buffer
          li $t1, 0x12345678     
          la $t2, buffer         # Should load address after numbers
          sw $t1, 0($t2)         
          lw $t3, 0($t2)         
          
          # Print stored value
          li $v0, 1
          move $a0, $t3
          syscall

          # Exit
          li $v0, 10
          syscall
    `;

    const outputs = [];
    const originalLog = console.log;
    console.log = (msg) => outputs.push(msg);

    runMIPSProgram(program, false);
    
    console.log = originalLog;

    // Verify string output (from address 0)
    expect(outputs).toContain('Output (string): Hello');

    // Verify number outputs (from address 1000)
    expect(outputs).toContain('Output (int): 42');
    expect(outputs).toContain('Output (int): 305419896');  // 0x12345678 in decimal

    // Verify memory contents are displayed correctly
    expect(outputs.some(output => 
      output.includes('Address 0x0: 48')  // 'H' at address 0
    )).toBeTruthy();
    expect(outputs.some(output => 
      output.includes('Address 0x1: 65')  // 'e' at address 1
    )).toBeTruthy();
    expect(outputs.some(output => 
      output.includes('Address 0x3E8: 2A')  // 42 in hex at address 1000 (0x3E8)
    )).toBeTruthy();
  });

  test('Factorial Calculation', () => {
    const program = `
      .data
      prompt: .asciiz "Factorial of 10 is: "

      .text
      main:
          # Print prompt
          li $v0, 4
          la $a0, prompt
          syscall

          # Calculate factorial of 10
          li $a0, 10       # Input number n = 10
          jal factorial    # Call factorial function
          move $a0, $v0    # Move result to $a0 for printing
          
          # Print result
          li $v0, 1
          syscall
          
          # Exit
          li $v0, 10
          syscall

      factorial:
          # Base case: if n <= 1, return 1
          slti $t0, $a0, 2     # Set $t0 to 1 if $a0 < 2
          beq $t0, $zero, recurse  # If n >= 2, recurse
          li $v0, 1            # Return 1 for n <= 1
          jr $ra              # Return to caller

      recurse:
          # Save registers to stack
          addi $sp, $sp, -8    # Make space on stack
          sw $ra, 4($sp)       # Save return address
          sw $a0, 0($sp)       # Save n
          
          # Calculate factorial(n-1)
          addi $a0, $a0, -1    # n = n - 1
          jal factorial        # Call factorial(n-1)
          
          # Multiply n * factorial(n-1)
          lw $a0, 0($sp)       # Restore original n
          mul $v0, $v0, $a0    # result = n * factorial(n-1)
          
          # Restore stack and return
          lw $ra, 4($sp)       # Restore return address
          addi $sp, $sp, 8     # Restore stack pointer
          jr $ra              # Return to caller
    `;

    const outputs = [];
    const originalLog = console.log;
    console.log = (msg) => outputs.push(msg);

    runMIPSProgram(program, true);  // Set to true for debugging
    
    console.log = originalLog;

    // Log all outputs for debugging
    console.log('Test outputs:', outputs);

    // Verify output
    expect(outputs).toContain('Output (string): Factorial of 10 is: ');
    expect(outputs).toContain('Output (int): 3628800'); // 10! = 3,628,800
  });

  test('Data Section Integer Operations', () => {
    const program = `
      .data
      numbers: .word 42, 10, 5    # Array of integers starting at address 1000
      result:  .word 0            # Space for result
      msg1:    .asciiz "Sum is: "
      msg2:    .asciiz "\\nProduct is: "

      .text
      main:
          # Load integers from memory
          la $t0, numbers     # Get base address of numbers array
          lw $t1, 0($t0)     # Load 42
          lw $t2, 4($t0)     # Load 10
          lw $t3, 8($t0)     # Load 5

          # Calculate sum (42 + 10 + 5 = 57)
          add $t4, $t1, $t2   # t4 = 42 + 10
          add $t4, $t4, $t3   # t4 = (42 + 10) + 5

          # Print "Sum is: "
          li $v0, 4
          la $a0, msg1
          syscall

          # Print sum
          li $v0, 1
          move $a0, $t4
          syscall

          # Calculate product (42 * 10 * 5 = 2100)
          mul $t5, $t1, $t2   # t5 = 42 * 10
          mul $t5, $t5, $t3   # t5 = (42 * 10) * 5

          # Print "Product is: "
          li $v0, 4
          la $a0, msg2
          syscall

          # Print product
          li $v0, 1
          move $a0, $t5
          syscall

          # Store result back to memory
          la $t0, result
          sw $t5, 0($t0)      # Store product in result

          # Exit
          li $v0, 10
          syscall
    `;

    const outputs = [];
    const originalLog = console.log;
    console.log = (msg) => outputs.push(msg);

    runMIPSProgram(program, true);  // Enable debug output
    
    console.log = originalLog;

    // Log outputs for debugging
    console.log('Test outputs:', outputs);

    // Verify outputs
    expect(outputs).toContain('Output (string): Sum is: ');
    expect(outputs).toContain('Output (int): 57');        // 42 + 10 + 5
    expect(outputs).toContain('Output (string): \nProduct is: ');
    expect(outputs).toContain('Output (int): 2100');      // 42 * 10 * 5

    // Verify memory operations
    expect(outputs.some(output => 
      output.includes('Loading word from 1000:')  // First number (42)
    )).toBeTruthy();
    expect(outputs.some(output => 
      output.includes('Loading word from 1004:')  // Second number (10)
    )).toBeTruthy();
    expect(outputs.some(output => 
      output.includes('Loading word from 1008:')  // Third number (5)
    )).toBeTruthy();
    expect(outputs.some(output => 
      output.includes('Storing word at')          // Storing result
    )).toBeTruthy();
  });
}); 