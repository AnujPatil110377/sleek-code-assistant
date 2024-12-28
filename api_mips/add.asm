.text
main:
    li $t0, 5
    li $t1, 3
    add $t2, $t0, $t1
    li $v0, 1
    add $a0, $t2, $zero
    syscall
    li $v0, 10
    syscall