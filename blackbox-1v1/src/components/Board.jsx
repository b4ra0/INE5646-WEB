import React from 'react'
import { SIZE, N_ATOMS, range } from '../game/constants'
import { hasAtom } from '../game/atoms'
import Cell from './Cell'
import EdgeButton from './EdgeButton'

export default function Board({ atoms, flags, revealAtoms, canPlaceAtoms, onToggleFlag, onToggleAtom, onFire, edgesDisabled }){
  return (
    <div className="row" style={{flexDirection:'column', gap:8}}>
      {/* Top edge */}
      <div className="edgeRow" style={{gap:6}}>
        {range(SIZE).map(c=>(<EdgeButton key={c} idx={c} onFire={onFire} label={`T${c+1}`} disabled={edgesDisabled} />))}
      </div>

      <div className="row" style={{gap:8}}>
        {/* Left edge */}
        <div className="edgeCol" style={{gap:6}}>
          {range(SIZE).map(r=>(<EdgeButton key={r} idx={SIZE*3 + (SIZE-1-r)} onFire={onFire} label={`L${r+1}`} disabled={edgesDisabled} />))}
        </div>

        {/* Grid */}
        <div className="grid">
          {range(SIZE).flatMap(r => range(SIZE).map(c => {
            const key = r*SIZE+c;
            const isAtom = hasAtom(atoms, r, c);
            const flagged = flags.has(key);
            return (
              <Cell key={key} r={r} c={c}
                flagged={flagged}
                showAtom={revealAtoms && isAtom}
                onClick={()=> canPlaceAtoms ? onToggleAtom(r,c) : onToggleFlag(r,c)}
              />
            );
          }))}
        </div>

        {/* Right edge */}
        <div className="edgeCol" style={{gap:6}}>
          {range(SIZE).map(r=>(<EdgeButton key={r} idx={SIZE + r} onFire={onFire} label={`R${r+1}`} disabled={edgesDisabled} />))}
        </div>
      </div>

      {/* Bottom edge */}
      <div className="edgeRow" style={{gap:6}}>
        {range(SIZE).map(c=>(<EdgeButton key={c} idx={SIZE*2 + (SIZE-1-c)} onFire={onFire} label={`B${c+1}`} disabled={edgesDisabled} />))}
      </div>
    </div>
  )
}
