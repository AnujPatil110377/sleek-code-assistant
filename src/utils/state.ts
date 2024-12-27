import { SimulatorState } from '../types/simulator';
import { registerMap } from './registers';

export const createInitialState = (): SimulatorState => ({
  registers: Object.keys(registerMap).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as { [key: string]: number }),
  memory: {},
  pc: 0,
  running: false,
  labels: {},
  terminated: false,
  instructions: []
});

export const saveState = (state: SimulatorState): string => {
  return JSON.stringify(state);
};

export const loadState = (savedState: string): SimulatorState => {
  return JSON.parse(savedState);
};