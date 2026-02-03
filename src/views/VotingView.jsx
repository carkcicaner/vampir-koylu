import React, { useState } from 'react';
import { Fingerprint, User, Ghost, CheckCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const VotingView = ({ gameData, gameCode, user, timeLeft, playSound }) => {
  const [selectedVote, setSelectedVote] = useState(null);

  const currentPlayer = gameData?.players?.find(p => p.uid === user.uid);
  const isDead = currentPlayer ? gameData?.deadPlayers?.includes(currentPlayer.uid) : false;
  
  const castVote = async (targetUid) => {
    if (isDead) return;
    
    playSound('click');
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      [`votes.${user.uid}`]: targetUid
    });
    setSelectedVote(targetUid);
  };

  const finalizeVoting = async () => {
    if (!gameData) return;
    
    playSound('click');
    const votes = gameData.votes || {};
    const voteCounts = {};
    
    Object.values(votes).forEach(id => {
      if (id) {
        voteCounts[id] = (voteCounts[id] || 0) + 1;
      }
    });

    let maxVotes = 0;
    let eliminatedUid = null;
    let tie = false;
    const voteEntries = Object.entries(voteCounts);
    
    voteEntries.forEach(([uid, count]) => {
      if (count > maxVotes) { 
        maxVotes = count; 
        eliminatedUid = uid;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    });

    let resultData = { method: 'no_vote' };
    let newDeadPlayers = [...(gameData.deadPlayers || [])];

    if (eliminatedUid && !tie && maxVotes > 0) {
      if (!newDeadPlayers.includes(eliminatedUid)) {
        newDeadPlayers.push(eliminatedUid);
      }
      resultData = {
        name: gameData.players.find(p => p.uid === eliminatedUid)?.name || 'Bilinmeyen',
        role: gameData.roles?.[eliminatedUid] || 'Köylü',
        method: 'lynch',
        voteCount: maxVotes,
        tie: false
      };
    } else if (tie) {
      const tiedPlayers = voteEntries.filter(([_, count]) => count === maxVotes).map(([uid]) => uid);
      resultData = {
        method: 'tie',
        tiedPlayers: tiedPlayers.map(uid => ({
          name: gameData.players.find(p => p.uid === uid)?.name || 'Bilinmeyen',
          role: gameData.roles?.[uid] || 'Köylü'
        })),
        voteCount: maxVotes
      };
    }

    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      status: 'result',
      deadPlayers: newDeadPlayers,
      lastResult: resultData,
      timerEnd: null,
      votes: {}
    });
  };

  const allPlayers = gameData?.players || [];
  const votes = gameData?.votes || {};
  const playersWhoVoted = Object.keys(votes);
  const isTimeUp = timeLeft <= 0;

  return (
    <div className="min-h-screen p-6 pb-24 flex flex-col items-center animate-fadeIn">
      {/* Başlık */}
      <div className="text-center mb-8">
        <Fingerprint className="mx-auto text-red-500 mb-2 animate-pulse" size={40} />
        <h2 className="text-3xl font-cinzel text-white text-glow-red mb-2">YARGILAMA</h2>
        <p className="text-red-400/60 font-inter text-sm">Hain kim? Kararını ver.</p>
        
        {/* Zamanlayıcı */}
        {timeLeft !== null && (
          <div className="mt-4 inline-flex items-center gap-2 bg-red-900/30 px-4 py-2 rounded-full border border-red-800/50">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-white font-mono text-sm">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Oy Kullananlar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center text-sm text-white/60 mb-2 px-2">
          <span>Oy Kullananlar: {playersWhoVoted.length}/{allPlayers.filter(p => !gameData?.deadPlayers?.includes(p.uid)).length}</span>
          <span>{isTimeUp ? "Süre Doldu!" : "Oy Kullanılıyor..."}</span>
        </div>
        
        {/* Oy kullanan oyuncuların listesi */}
        <div className="flex flex-wrap gap-2 mb-4">
          {allPlayers.map(p => {
            const votedFor = votes[p.uid];
            const isThisPlayerDead = gameData?.deadPlayers?.includes(p.uid);
            
            if (votedFor && !isThisPlayerDead) {
              const targetPlayer = allPlayers.find(player => player.uid === votedFor);
              return (
                <div key={p.uid} className="flex items-center gap-1 bg-red-900/20 px-3 py-1 rounded-full border border-red-800/30">
                  <CheckCircle size={12} className="text-green-400" />
                  <span className="text-white/80 text-xs">{p.name} → {targetPlayer?.name}</span>
                </div>
              );
            }
            return null;
          }).filter(Boolean)}
        </div>
      </div>

      {/* Oyuncu Listesi */}
      <div className="w-full max-w-md space-y-3">
        {allPlayers.map(p => {
          const isDead = gameData?.deadPlayers?.includes(p.uid);
          const isSelected = selectedVote === p.uid;
          const hasVoted = votes[user?.uid] === p.uid;
          const playerVote = votes[p.uid];
          const votedForPlayer = playerVote ? allPlayers.find(pl => pl.uid === playerVote) : null;
          
          return (
            <button
              key={p.uid}
              disabled={isDead || votes[user?.uid] || isTimeUp}
              onClick={() => castVote(p.uid)}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition-all duration-300 border relative overflow-hidden group ${
                isDead 
                  ? 'opacity-50 bg-slate-900/50 border-slate-700 cursor-not-allowed' 
                  : votes[user?.uid] 
                    ? 'cursor-default' 
                    : 'hover:scale-[1.02] hover:border-red-400/50'
              } ${
                hasVoted 
                  ? 'bg-red-900/40 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                  : 'bg-black/20 border-white/10'
              }`}
            >
              {/* Oyuncu Bilgisi */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  {isDead ? (
                    <Ghost className="text-slate-500" size={24} />
                  ) : (
                    <User className={hasVoted ? "text-red-400" : "text-slate-300"} size={24} />
                  )}
                  {playerVote && !isDead && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                      <Fingerprint size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <span className={`font-cinzel font-bold block ${hasVoted ? 'text-white' : 'text-slate-300'}`}>
                    {p.name} {p.uid === gameData?.hostId && "👑"}
                  </span>
                  {votedForPlayer && !isDead && (
                    <span className="text-xs text-red-400/70">→ {votedForPlayer.name}</span>
                  )}
                </div>
              </div>
              
              {/* Durum İşaretleri */}
              <div className="flex items-center gap-2">
                {hasVoted && (
                  <CheckCircle className="text-green-400" size={20} />
                )}
                {isDead && (
                  <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800/50 rounded">ÖLÜ</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bilgi Mesajı */}
      <div className="mt-6 text-center text-white/50 text-sm max-w-md">
        {isDead ? (
          <p>Ölü olduğunuz için oy kullanamazsınız.</p>
        ) : votes[user?.uid] ? (
          <p className="text-green-400">✔ Oyunuzu kullandınız: {allPlayers.find(p => p.uid === votes[user.uid])?.name}</p>
        ) : isTimeUp ? (
          <p className="text-red-400">⏰ Süre doldu! Oyunuz kullanılamadı.</p>
        ) : (
          <p>Oy vermek için bir oyuncuya tıklayın.</p>
        )}
      </div>

      {/* Host Butonu */}
      {gameData?.hostId === user?.uid && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20 animate-fadeIn">
          <button 
            onClick={finalizeVoting}
            disabled={!isTimeUp && Object.keys(votes).length < allPlayers.filter(p => !gameData?.deadPlayers?.includes(p.uid)).length}
            className="w-full py-4 bg-gradient-to-r from-red-900 to-red-700 text-white font-bold font-cinzel rounded-xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Fingerprint size={20} />
            SONUÇLARI AÇIKLA
            {!isTimeUp && (
              <span className="text-xs font-normal opacity-80">
                ({Object.keys(votes).length}/{allPlayers.filter(p => !gameData?.deadPlayers?.includes(p.uid)).length})
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};