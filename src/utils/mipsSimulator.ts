import { SimulatorState } from '../types/simulator';
import { registerMap, getRegisterNumber } from './registers';
import { parseProgram } from './parser';
import { createInitialState, saveState, loadState } from './state';

export class MIPSSimulator {
  private state: SimulatorState;

  constructor() {
    this.state = createInitialState();
  }

  loadProgram(code: string) {
    const { instructions, labels, memory } = parseProgram(code);
    this.state.instructions = instructions;
    this.state.labels = labels;
    this.state.memory = { ...this.state.memory, ...memory };
    this.state.pc = 0;
    this.state.running = true;
    this.state.terminated = false;
  }

  step(): boolean {
    if (!this.state.running || this.state.terminated) {
      return false;
    }

    if (this.state.pc >= this.state.instructions.length * 4) {
      this.state.terminated = true;
      this.state.running = false;
      return false;
    }

    const instruction = this.state.instructions[this.state.pc / 4];
    this.executeInstruction(instruction);
    return true;
  }

  private executeInstruction(instruction: string) {
    // Implementation will be in simulator.ts
    // This is just a stub for now
    this.state.pc += 4;
  }

  getState(): SimulatorState {
    return { ...this.state };
  }

  setState(newState: SimulatorState) {
    this.state = { ...newState };
  }

  reset() {
    this.state = createInitialState();
  }
}

export { registerMap, getRegisterNumber, parseProgram, createInitialState, saveState, loadState };