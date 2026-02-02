import React, { useState } from 'react';
import { Clock, Skull, ShieldAlert } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

const VOTING_TIME = 300;

export const GameView = ({ gameData, gameCode, user, timeLeft }) => {
  const [cardFlipped, setCardFlipped] = useState(false);
  const myRole = gameData?.roles?.[user.uid];

  const startVotingPhase = async () => {
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      status: 'voting',
      timerEnd: Date.now() + (VOTING_TIME * 1000),
      votes: {}
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 pb-24">
      <div className="w-full max-w-md mb-8 relative">
        <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between border-red-500/20">
          <div className="flex items-center gap-2 text-red-400">
            <Clock className="animate-pulse" size={18} />
            <span className="font-cinzel text-xs tracking-widest">TARTIŞMA</span>
          </div>
          <span className="font-mono text-2xl font-bold text-white">{timeLeft ? `${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2,'0')}` : '0:00'}</span>
        </div>
      </div>

      <div className="perspective-1000 w-64 h-96 cursor-pointer group z-10 animate-float" onClick={() => setCardFlipped(!cardFlipped)}>
        <div className={`relative w-full h-full duration-700 preserve-3d transition-all ${cardFlipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute w-full h-full backface-hidden glass-panel rounded-2xl flex flex-col items-center justify-center border border-slate-600/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             <div className="relative z-10 border-2 border-slate-500/30 p-6 rounded-full bg-black/50 backdrop-blur-sm">
               <Skull size={48} className="text-slate-400" />
             </div>
             <span className="mt-6 font-cinzel text-slate-500 tracking-[0.3em] text-sm">GİZLİ KİMLİK</span>
          </div>
          <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden shadow-2xl border-2 ${myRole === 'vampire' ? 'border-red-600 bg-red-950' : 'border-blue-500 bg-blue-950'}`}>
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
               {myRole === 'vampire' ? (
                 <>
                   <div className="text-red-500 animate-pulse mb-4"><Skull size={80} /></div>
                   <h3 className="text-4xl font-cinzel font-black text-white text-glow-red mb-2">VAMPİR</h3>
                   <p className="text-red-200 text-xs font-inter opacity-80">Gece senin krallığın.</p>
                 </>
               ) : (
                 <>
                   <div className="text-blue-400 mb-4"><ShieldAlert size={80} /></div>
                   <h3 className="text-3xl font-cinzel font-black text-white text-glow-blue mb-2">KÖYLÜ</h3>
                   <p className="text-blue-200 text-xs font-inter opacity-80">Gözlerini açık tut.</p>
                 </>
               )}
            </div>
          </div>
        </div>
      </div>

      {gameData?.hostId === user?.uid && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20">
          <button onClick={startVotingPhase} className="w-full py-4 bg-red-900 text-white font-bold font-cinzel rounded-xl hover:bg-red-800">OYLAMAYI BAŞLAT</button>
        </div>
      )}
    </div>
  );
};