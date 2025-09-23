import { useMemo, useState } from 'react'
import { SIZE, N_ATOMS } from '../game/constants'
import { hasAtom, randomAtoms } from '../game/atoms'
import { shootRay } from '../game/ray'

export default function useGame(){
  const [mode,setMode] = useState('bot');
  const [atoms,setAtoms] = useState(()=>randomAtoms(N_ATOMS));
  const [flags,setFlags] = useState(new Set());
  const [shots,setShots] = useState([]);
  const [revealed,setRevealed] = useState(false);
  const [locked,setLocked] = useState(false);

  // PvP
  const [pvpPhase,setPvpPhase] = useState('setup'); // 'setup' | 'play'
  const [pvpRound,setPvpRound] = useState(1); // 1 or 2
  const [setter,setSetter] = useState('A');
  const [shooter,setShooter] = useState('B');
  const [pvpScores,setPvpScores] = useState({A:0,B:0});
  const [roundFinished,setRoundFinished] = useState(false);
  const [matchOver,setMatchOver] = useState(false);

  function resetCommon(){ setFlags(new Set()); setShots([]); setRevealed(false); setLocked(false); setRoundFinished(false); }

  function resetForMode(next){
    setMode(next);
    if(next==='bot'){ setAtoms(randomAtoms(N_ATOMS)); }
    else{ setAtoms([]); setPvpPhase('setup'); setPvpRound(1); setSetter('A'); setShooter('B'); setPvpScores({A:0,B:0}); setMatchOver(false); }
    resetCommon();
  }

  function toggleFlag(r,c){
    if(locked) return;
    if(mode==='pvp' && pvpPhase!=='play') return;
    const key=r*SIZE+c;
    setFlags(prev=>{ const n=new Set(prev); if(n.has(key)) n.delete(key); else n.add(key); return n; });
  }
  
  function toggleAtomSetup(r,c){
    if(mode!=='pvp' || pvpPhase!=='setup') return;
    setAtoms(prev=>{
      const exists = prev.some(a=>a.r===r&&a.c===c);
      if(exists) return prev.filter(a=>!(a.r===r&&a.c===c));
      if(prev.length>=N_ATOMS) return prev;
      return [...prev,{r,c}];
    });
  }
  function startPvpRound(){ if(mode!=='pvp') return; if(atoms.length!==N_ATOMS) return; setPvpPhase('play'); }
  
  function fire(edgeIdx){
    if(locked) return;
    if(mode==='pvp' && pvpPhase!=='play') return;
    const res = shootRay(atoms, edgeIdx);
    setShots(s=>[...s, {entry:edgeIdx, result:res, id:s.length+1}]);
  }

  function reveal(){ setRevealed(true); }

  const attemptScore = useMemo(()=>{
    const rays = shots.length;
    let wrong = 0;
    flags.forEach(key=>{ const r=Math.floor(key/SIZE), c=key%SIZE; if(!hasAtom(atoms,r,c)) wrong+=1; });
    return rays + wrong*5;
  }, [shots,flags,atoms]);

  function checkGuesses(){
    setLocked(true);
    if(mode==='pvp' && pvpPhase==='play' && !roundFinished){
      setPvpScores(sc=>({...sc, [shooter]: sc[shooter] + attemptScore}));
      setRoundFinished(true);
    }
  }

  function nextRoundSwap(){
    if(mode!=='pvp' || !roundFinished || pvpRound!==1) return;
    setPvpRound(2); setSetter('B'); setShooter('A'); setAtoms([]); setPvpPhase('setup'); resetCommon();
  }

  function endMatchNewPvp(){ if(mode!=='pvp') return; setMatchOver(true); }

  function newGame(){ if(mode==='bot'){ setAtoms(randomAtoms(N_ATOMS)); resetCommon(); } else { resetForMode('pvp'); } }

  return { mode,setMode, atoms,flags,shots,revealed,locked, attemptScore,
    resetForMode,toggleFlag,fire,reveal,checkGuesses,newGame,
    pvpPhase,pvpRound,setter,shooter,pvpScores,roundFinished,matchOver,
    toggleAtomSetup,startPvpRound,nextRoundSwap,endMatchNewPvp };
}
