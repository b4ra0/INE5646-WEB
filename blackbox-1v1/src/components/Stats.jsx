import React, { useMemo } from 'react'
import { SIZE } from '../game/constants'

const sideOf = (edge)=>{
  if(edge==null) return '?';
  if(edge<SIZE) return 'Top';
  if(edge<SIZE*2) return 'Right';
  if(edge<SIZE*3) return 'Bottom';
  return 'Left';
};

export default function Stats({ shots }){
  const { bySide, results, exitsBySide } = useMemo(()=>{
    const bySide={Top:0,Right:0,Bottom:0,Left:0};
    const results={HIT:0,REFLECTION:0,EXIT:0};
    const exitsBySide={Top:0,Right:0,Bottom:0,Left:0};
    shots.forEach(s=>{
      bySide[sideOf(s.entry)]++;
      results[s.result.type]=(results[s.result.type]||0)+1;
      if(s.result.type==='EXIT') exitsBySide[sideOf(s.result.exit)]++;
    });
    return { bySide, results, exitsBySide };
  }, [shots]);

  return (
    <div>
      <h3>Histórico / Estatísticas</h3>
      <div className="stats">
        <div className="card">
          <div><b>Entradas por lado</b></div>
          <ul>
            <li>Top: <b>{bySide.Top}</b></li>
            <li>Right: <b>{bySide.Right}</b></li>
            <li>Bottom: <b>{bySide.Bottom}</b></li>
            <li>Left: <b>{bySide.Left}</b></li>
          </ul>
        </div>
        <div className="card">
          <div><b>Resultados</b></div>
          <ul>
            <li>HIT: <b>{results.HIT}</b></li>
            <li>REFLECTION: <b>{results.REFLECTION}</b></li>
            <li>EXIT: <b>{results.EXIT}</b></li>
          </ul>
        </div>
        <div className="card" style={{gridColumn:'1 / span 2'}}>
          <div><b>Saídas por lado</b></div>
          <ul style={{columns:2}}>
            <li>Top: <b>{exitsBySide.Top}</b></li>
            <li>Right: <b>{exitsBySide.Right}</b></li>
            <li>Bottom: <b>{exitsBySide.Bottom}</b></li>
            <li>Left: <b>{exitsBySide.Left}</b></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
