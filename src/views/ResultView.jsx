import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const ResultView = ({ gameData, gameCode, user }) => {
  const r = gameData?.lastResult;

  const startNewRound = async () => {
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      status: 'lobby',
      timerEnd: null
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-red-900/10 animate-pulse mix-blend-overlay pointer-events-none"></div>
      
      <h2 className="text-slate-500 font-cinzel tracking-[0.5em] text-sm uppercase mb-12">İNFAZ SONUCU</h2>
      
      {r?.method === 'no_vote' ? (
        <div className="text-slate-400 font-cinzel text-xl">Kimse suçlu bulunamadı...</div>
      ) : (
        <div className="space-y-4 animate-float">
          <h1 className="text-6xl font-black font-cinzel text-white drop-shadow-2xl">{r?.name}</h1>
          <p className="text-xl text-slate-400 font-inter italic">aslında bir...</p>
          <div className={`text-6xl font-black font-cinzel tracking-tighter py-4 ${r?.role === 'vampire' ? 'text-red-600 text-glow-red' : 'text-blue-500 text-glow-blue'}`}>
            {r?.role === 'vampire' ? 'VAMPİRDİ' : 'KÖYLÜYDÜ'}
          </div>
        </div>
      )}

      {gameData?.hostId === user?.uid && (
         <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20">
           <button onClick={startNewRound} className="w-full py-4 bg-slate-800 text-white font-bold font-cinzel rounded-xl">LOBİYE DÖN</button>
         </div>
      )}
    </div>
  );
};