import React from 'react'
import { SIZE } from '../game/constants'

const sideOf = (edge)=>{
  if(edge==null) return '?';
  if(edge<SIZE) return 'Top';
  if(edge<SIZE*2) return 'Right';
  if(edge<SIZE*3) return 'Bottom';
  return 'Left';
};

export default function History({ shots }){
  return (
    <div>
      <h3>Ray history</h3>
      <div className="row">
        {shots.map(s=>{
          let text=''; if(s.result.type==='HIT') text=`HIT ${s.entry}`; else if(s.result.type==='REFLECTION') text=`REFLECT ${s.entry}`; else if(s.result.type==='EXIT') text=`EXIT ${s.entry}->${s.result.exit}`;
          return <span key={s.id} className="badge">{text}</span>;
        })}
        {shots.length===0 && <span className="small">Nenhum raio ainda. Clique em uma borda (T/L/R/B).</span>}
      </div>
      {shots.length>0 && (
        <div style={{marginTop:8, overflow:'auto'}}>
          <table className="table">
            <thead><tr>
              <th>#</th><th>Entrada</th><th>Lado ent.</th><th>Resultado</th><th>Saída</th><th>Lado saída</th>
            </tr></thead>
            <tbody>
              {shots.map((s,i)=>(
                <tr key={s.id}>
                  <td>{i+1}</td><td>{s.entry}</td><td>{sideOf(s.entry)}</td><td>{s.result.type}</td>
                  <td>{s.result.type==='EXIT'?s.result.exit:'-'}</td><td>{s.result.type==='EXIT'?sideOf(s.result.exit):'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
