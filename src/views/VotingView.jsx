import React, { useState } from 'react';
import { Fingerprint, User, Ghost } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const VotingView = ({ gameData, gameCode, user }) => {
  const [selectedVote, setSelectedVote] = useState(null);

  const castVote = async (targetUid) => {
    if (gameData.deadPlayers.includes(user.uid)) return;
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      [`votes.${user.uid}`]: targetUid
    });
    setSelectedVote(targetUid);
  };

  const finalizeVoting = async () => {
    if (!gameData) return;
    const votes = gameData.votes || {};
    const voteCounts = {};
    Object.values(votes).forEach(id => voteCounts[id] = (voteCounts[id] || 0) + 1);

    let maxVotes = 0;
    let eliminatedUid = null;
    Object.entries(voteCounts).forEach(([uid, count]) => {
      if (count > maxVotes) { maxVotes = count; eliminatedUid = uid; }
    });

    let resultData = { method: 'no_vote' };
    let newDeadPlayers = [...(gameData.deadPlayers || [])];

    if (eliminatedUid) {
      newDeadPlayers.push(eliminatedUid);
      resultData = {
        name: gameData.players.find(p => p.uid === eliminatedUid)?.name || 'Bilinmeyen',
        role: gameData.roles[eliminatedUid],
        method: 'lynch',
        voteCount: maxVotes
      };
    }

    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      status: 'result',
      deadPlayers: newDeadPlayers,
      lastResult: resultData,
      timerEnd: null
    });
  };

  return (
    <div className="min-h-screen p-6 pb-24 flex flex-col items-center">
      <div className="text-center mb-8">
        <Fingerprint className="mx-auto text-red-500 mb-2 animate-pulse" size={40} />
        <h2 className="text-3xl font-cinzel text-white text-glow-red">YARGILAMA</h2>
        <p className="text-red-400/60 font-inter text-sm mt-1">Hain kim? Kararını ver.</p>
      </div>

      <div className="w-full max-w-md space-y-3">
        {gameData?.players?.map(p => {
          const isDead = gameData.deadPlayers?.includes(p.uid);
          const isSelected = selectedVote === p.uid;
          
          return (
            <button
              key={p.uid}
              disabled={isDead || gameData.votes?.[user.uid]}
              onClick={() => castVote(p.uid)}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition-all duration-300 border relative overflow-hidden group ${isDead ? 'opacity-40 grayscale bg-slate-900 border-slate-800' : isSelected ? 'bg-red-900/40 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'glass-panel border-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-4 relative z-10">
                {isDead ? <Ghost className="text-slate-500" /> : <User className={isSelected ? "text-red-400" : "text-slate-400"} />}
                <span className={`font-cinzel font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{p.name}</span>
              </div>
              {isSelected && <div className="relative z-10"><Fingerprint className="text-red-500" /></div>}
            </button>
          )
        })}
      </div>

      {gameData?.hostId === user?.uid && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20">
          <button onClick={finalizeVoting} className="w-full py-4 bg-gradient-to-r from-red-900 to-red-700 text-white font-bold font-cinzel rounded-xl">SONUÇLARI AÇIKLA</button>
        </div>
      )}
    </div>
  );
};