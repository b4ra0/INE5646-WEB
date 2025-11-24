import { SIZE } from './constants'

export const inside = (r,c)=> r>=0 && r<SIZE && c>=0 && c<SIZE;

export function edgeIndexFromExit(r,c){
  if(r===-1 && c>=0 && c<SIZE) return c;
  if(c===SIZE && r>=0 && r<SIZE) return SIZE+r;
  if(r===SIZE && c>=0 && c<SIZE) return SIZE*2 + (SIZE-1-c);
  if(c===-1 && r>=0 && r<SIZE) return SIZE*3 + (SIZE-1-r);
  return null;
}

export function entryFromEdgeIndex(idx){
  const per=SIZE;
  if(idx<per) return { r:-1, c:idx, dir:{dr:1,dc:0,k:'D'} };
  if(idx<per*2) return { r:idx-per, c:SIZE, dir:{dr:0,dc:-1,k:'L'} };
  if(idx<per*3) return { r:SIZE, c:per-1-(idx-per*2), dir:{dr:-1,dc:0,k:'U'} };
  return { r:per-1-(idx-per*3), c:-1, dir:{dr:0,dc:1,k:'R'} };
}
