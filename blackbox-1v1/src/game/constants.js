export const SIZE = 8;

export const N_ATOMS = 5;

export const DIRS = {
  UP:    { dr: -1, dc: 0, k: 'U' },
  DOWN:  { dr: 1,  dc: 0, k: 'D' },
  LEFT:  { dr: 0,  dc: -1, k: 'L' },
  RIGHT: { dr: 0,  dc: 1,  k: 'R' },
};

export const range = (n) => Array.from({ length: n }, (_, i) => i);
