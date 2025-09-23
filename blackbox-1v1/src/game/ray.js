import { DIRS } from './constants'
import { inside, edgeIndexFromExit, entryFromEdgeIndex } from './boardMath'
import { hasAtom } from './atoms'

export function shootRay(atoms, entryIdx){
  const entry = entryIdx;
  let { r, c, dir } = entryFromEdgeIndex(entryIdx);
  let nr = r + dir.dr, nc = c + dir.dc;

  if (inside(nr, nc) && hasAtom(atoms, nr, nc)) return { type: 'HIT' };
  const aheadLeft  = inside(nr, nc - 1) && hasAtom(atoms, nr, nc - 1);
  const aheadRight = inside(nr, nc + 1) && hasAtom(atoms, nr, nc + 1);
  if (aheadLeft && aheadRight) return { type: 'REFLECTION' };

  let cr=r, cc=c, d=dir;
  for (let steps=0; steps<1000; steps++){
    const tr=cr+d.dr, tc=cc+d.dc;
    if (!inside(tr, tc)) {
      const exitEdge = edgeIndexFromExit(tr, tc);
      if (exitEdge === entry) return { type: 'REFLECTION' };
      return { type: 'EXIT', exit: exitEdge };
    }
    if (hasAtom(atoms, tr, tc)) return { type: 'HIT' };

    const ld = inside(tr, tc - 1) && hasAtom(atoms, tr, tc - 1);
    const rd = inside(tr, tc + 1) && hasAtom(atoms, tr, tc + 1);
    if (ld && rd) return { type: 'REFLECTION' };

    if (ld || rd){
      if (ld && !rd){
        if (d.k==='U') d = DIRS.RIGHT; else if (d.k==='D') d = DIRS.LEFT; else if (d.k==='L') d = DIRS.UP; else d = DIRS.DOWN;
      } else if (rd && !ld){
        if (d.k==='U') d = DIRS.LEFT; else if (d.k==='D') d = DIRS.RIGHT; else if (d.k==='L') d = DIRS.DOWN; else d = DIRS.UP;
      }
      continue;
    }
    cr = tr; cc = tc;
  }
  return { type: 'EXIT', exit: null };
}
