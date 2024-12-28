import { SimulatorState } from '../types/simulator';
import { registerMap } from './registers';

export const createInitialState = (): SimulatorState => ({
  registers: Object.keys(registerMap).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as { [key: string]: number }),
  memory: {},
  pc: 0x00400000, // Starting address for text segment
  running: false,
  labels: {},
  terminated: false,
  instructions: [],
  breakpoints: new Set()
});

export const saveState = (state: SimulatorState): string => {
  const saveObj = {
    ...state,
    breakpoints: Array.from(state.breakpoints)
  };
  return JSON.stringify(saveObj);
};

export const loadState = (savedState: string): SimulatorState => {
  const parsed = JSON.parse(savedState);
  return {
    ...parsed,
    breakpoints: new Set(parsed.breakpoints)
  };
};