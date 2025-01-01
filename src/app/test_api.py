import unittest
from api import app
import json

class TestMIPSSimulator(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_hello_world_program(self):
        # Test case 1: Hello World program with normalized line endings
        test_code = (
            ".data\n"
            "    hello: .asciiz \"Hello, World!\\n\"\n"
            "\n"
            ".text\n"
            "    addi $v0, $zero, 4\n"
            "    la $a0, hello\n"
            "    syscall"
        )
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['console_output'], "Hello, World!\n")
        self.assertIn('v0', data['data']['registers'])
        self.assertEqual(data['data']['registers']['v0'], 4)
        # Check if a0 contains the correct memory address (0x10010000)
        self.assertEqual(data['data']['registers']['a0'], 0x10010000)

    def test_arithmetic_operations(self):
        # Test case 2: Basic arithmetic
        test_code = '''
.text
    addi $t0, $zero, 5    # t0 = 5
    addi $t1, $zero, 3    # t1 = 3
    add $t2, $t0, $t1     # t2 = t0 + t1
        '''
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['registers']['t0'], 5)
        self.assertEqual(data['data']['registers']['t1'], 3)
        self.assertEqual(data['data']['registers']['t2'], 8)

    def test_invalid_code(self):
        # Test case 3: Invalid MIPS code
        test_code = '''
.text
    invalid_instruction $t0, $t1
    '''
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('error', data)
        # We don't strictly check the status code anymore since we handle errors at different levels
        self.assertIn(response.status_code, [400, 500])

    def test_memory_operations(self):
        # Test case 4: Memory operations
        test_code = '''
.data
    var: .word 42

.text
    lw $t0, var      # Load word from memory
    sw $t0, 4($zero) # Store word to memory
        '''
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['registers']['t0'], 42)

    def test_step_execution_initialization(self):
        # Test case 5: Initialize step execution
        test_code = '''
.text
    addi $t0, $zero, 5    # t0 = 5
    addi $t1, $zero, 3    # t1 = 3
    add $t2, $t0, $t1     # t2 = t0 + t1
        '''
        
        # Test initialization
        response = self.app.post('/api/init-step',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertIn('session_id', data)
        self.assertEqual(data['total_instructions'], 3)
        
        return data['session_id']

    def test_step_execution(self):
        # First initialize the session
        session_id = self.test_step_execution_initialization()
        
        # Test first step (addi $t0, $zero, 5)
        response = self.app.post('/api/step',
                               data=json.dumps({'session_id': session_id}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertFalse(data['completed'])
        self.assertEqual(data['data']['registers']['t0'], 5)
        self.assertEqual(data['data']['pc'], 4)
        self.assertEqual(data['data']['current_instruction'].strip(), 'addi $t0, $zero, 5')
        
        # Test second step (addi $t1, $zero, 3)
        response = self.app.post('/api/step',
                               data=json.dumps({'session_id': session_id}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertFalse(data['completed'])
        self.assertEqual(data['data']['registers']['t1'], 3)
        self.assertEqual(data['data']['pc'], 8)
        self.assertEqual(data['data']['current_instruction'].strip(), 'addi $t1, $zero, 3')
        
        # Test final step (add $t2, $t0, $t1)
        response = self.app.post('/api/step',
                               data=json.dumps({'session_id': session_id}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertFalse(data['completed'])
        self.assertEqual(data['data']['registers']['t2'], 8)
        self.assertEqual(data['data']['pc'], 12)
        self.assertEqual(data['data']['current_instruction'].strip(), 'add $t2, $t0, $t1')
        
        # Test stepping after program completion
        response = self.app.post('/api/step',
                               data=json.dumps({'session_id': session_id}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertTrue(data['completed'])

    def test_step_invalid_session(self):
        # Test stepping with invalid session ID
        response = self.app.post('/api/step',
                               data=json.dumps({'session_id': 'invalid_session_id'}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        
        self.assertFalse(data['success'])
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Invalid session')

    def test_step_complex_program(self):
        # Test case with a more complex program including memory operations and syscalls
        test_code = '''
.data
    message: .asciiz "Test\\n"

.text
    # Print string
    li $v0, 4
    la $a0, message
    syscall
        '''
        
        # Initialize stepping
        response = self.app.post('/api/init-step',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        session_id = data['session_id']
        
        # Step through each instruction
        output = ''
        completed = False
        while not completed:
            response = self.app.post('/api/step',
                                   data=json.dumps({'session_id': session_id}),
                                   content_type='application/json')
            
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            
            if data['completed']:
                completed = True
            else:
                if 'console_output' in data['data']:
                    output += data['data']['console_output']
        
        self.assertEqual(output.strip(), "Test")

    def test_move_instruction(self):
        # Test case: Move instruction
        test_code = '''
.text
    li $t0, 42        # Load 42 into $t0
    move $t1, $t0     # Copy value from $t0 to $t1
    move $t2, $t1     # Copy value from $t1 to $t2
        '''
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        # Verify that the value was correctly copied through the registers
        self.assertEqual(data['data']['registers']['t0'], 42)
        self.assertEqual(data['data']['registers']['t1'], 42)
        self.assertEqual(data['data']['registers']['t2'], 42)

    def test_move_step_execution(self):
        # Test case: Move instruction with step execution
        test_code = '''
.text
    li $t0, 42        # Load 42 into $t0
    move $t1, $t0     # Copy value from $t0 to $t1
        '''
        
        # Initialize step execution
        init_response = self.app.post('/api/init-step',
                                    data=json.dumps({'code': test_code}),
                                    content_type='application/json')
        
        self.assertEqual(init_response.status_code, 200)
        init_data = json.loads(init_response.data)
        session_id = init_data['session_id']
        
        # First step: li $t0, 42
        step1_response = self.app.post('/api/step',
                                     data=json.dumps({'session_id': session_id}),
                                     content_type='application/json')
        
        self.assertEqual(step1_response.status_code, 200)
        step1_data = json.loads(step1_response.data)
        
        self.assertTrue(step1_data['success'])
        self.assertEqual(step1_data['data']['registers']['t0'], 42)
        
        # Second step: move $t1, $t0
        step2_response = self.app.post('/api/step',
                                     data=json.dumps({'session_id': session_id}),
                                     content_type='application/json')
        
        self.assertEqual(step2_response.status_code, 200)
        step2_data = json.loads(step2_response.data)
        
        self.assertTrue(step2_data['success'])
        self.assertEqual(step2_data['data']['registers']['t0'], 42)
        self.assertEqual(step2_data['data']['registers']['t1'], 42)

if __name__ == '__main__':
    unittest.main() 