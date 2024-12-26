import { runMIPSProgram } from '../index';

// Test program that calculates factorial of 5
const factorialProgram = `
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

// Run the program
console.log('Testing factorial program:');
runMIPSProgram(factorialProgram); 