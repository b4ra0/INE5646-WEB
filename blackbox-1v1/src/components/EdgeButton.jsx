import React from 'react'

export default function EdgeButton({ idx, onFire, label, disabled }){
  return <button className="edgeBtn" onClick={()=>onFire(idx)} disabled={disabled}>{label}</button>;
}
