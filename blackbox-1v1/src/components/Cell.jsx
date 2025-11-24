import React from 'react'

export default function Cell({ r,c, onClick, flagged, showAtom }){
  const cls = 'cell' + (flagged?' flag':'') + (showAtom?' atom':'');
  return <button className={cls} onClick={onClick} title={`(${r+1},${c+1})`}>{flagged?'⚑':showAtom?'●':''}</button>;
}
