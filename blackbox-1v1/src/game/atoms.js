import { SIZE } from './constants'

export const hasAtom = (atoms,r,c)=> atoms.some(a=>a.r===r && a.c===c);

export function randomAtoms(count){
  const cells=[];
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) cells.push({r,c});
  const out=[];
  while(out.length<count && cells.length){
    const i = Math.floor(Math.random()*cells.length);
    out.push(cells[i]); cells.splice(i,1);
  }
  return out;
}
