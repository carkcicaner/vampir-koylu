import React, { useEffect } from 'react';
import { Trophy, Skull, Users, Sword, RotateCcw } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const ResultView = ({ gameData, gameCode, user, setView, playSound }) => {
  const lastResult = gameData?.lastResult;
  const players = gameData?.players || [];
  const deadPlayers = gameData?.deadPlayers || [];
  const roles = gameData?.roles || {};

  useEffect(() => {
    playSound('transition');
  }, []);

  // Kazananı belirle
  const getWinner = () => {
    const alivePlayers = players.filter(p => !deadPlayers.includes(p.uid));
    const aliveVampires = alivePlayers.filter(p => roles[p.uid] === 'vampire');
    const aliveVillagers = alivePlayers.filter(p => roles[p.uid] === 'villager');

    if (aliveVampires.length === 0) {
      return { team: 'villagers', message: 'KÖYLÜLER KAZANDI!' };
    } else if (aliveVampires.length >= aliveVillagers.length) {
      return { team: 'vampires', message: 'VAMPİRLER KAZANDI!' };
    }
    return { team: 'ongoing', message: 'OYUN DEVAM EDİYOR' };
  };

  const winner = getWinner();

  const startNextRound = async () => {
    playSound('click');
    if (gameData?.hostId === user.uid) {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
        status: 'discussion',
        timerEnd: Date.now() + (300 * 1000), // 5 dakika
        round: (gameData.round || 1) + 1,
        votes: {}
      });
      setView('game');
    }
  };

  const restartGame = async () => {
    playSound('click');
    if (gameData?.hostId === user.uid) {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
        status: 'lobby',
        deadPlayers: [],
        votes: {},
        lastResult: null,
        timerEnd: null
      });
      setView('lobby');
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center animate-fadeIn">
      <div className="w-full max-w-2xl">
        {/* Kazanan Gösterimi */}
        <div className={`glass-panel p-8 rounded-2xl mb-8 text-center ${
          winner.team === 'villagers' 
            ? 'border-2 border-blue-500/50' 
            : winner.team === 'vampires' 
              ? 'border-2 border-red-500/50' 
              : 'border-2 border-yellow-500/50'
        }`}>
          <div className="flex justify-center mb-6">
            {winner.team === 'villagers' ? (
              <Trophy className="text-blue-400" size={60} />
            ) : winner.team === 'vampires' ? (
              <Trophy className="text-red-400" size={60} />
            ) : (
              <Sword className="text-yellow-400" size={60} />
            )}
          </div>
          
          <h2 className={`text-4xl font-cinzel font-bold mb-4 ${
            winner.team === 'villagers' 
              ? 'text-blue-400 text-glow-blue' 
              : winner.team === 'vampires' 
                ? 'text-red-400 text-glow-red' 
                : 'text-yellow-400'
          }`}>
            {winner.message}
          </h2>
          
          {lastResult?.method === 'lynch' && (
            <div className="mt-6 p-4 bg-black/40 rounded-xl">
              <p className="text-white/80 mb-2">
                <span className="font-bold">{lastResult.name}</span> oylama sonucu elendi!
              </p>
              <div className="inline-flex items-center gap-2 bg-red-900/30 px-4 py-2 rounded-full mt-2">
                <span className="text-red-300">Rolü: {lastResult.role === 'vampire' ? 'Vampir' : 'Köylü'}</span>
                <span className="text-white/70">•</span>
                <span className="text-white/70">Oy Sayısı: {lastResult.voteCount}</span>
              </div>
            </div>
          )}
          
          {lastResult?.method === 'tie' && (
            <div className="mt-6 p-4 bg-yellow-900/20 rounded-xl border border-yellow-800/50">
              <p className="text-yellow-300 mb-2">⏰ Beraberlik!</p>
              <p className="text-white/70 text-sm">
                Aynı oy sayısına sahip {lastResult.tiedPlayers.length} oyuncu var.
              </p>
            </div>
          )}
        </div>

        {/* Oyuncu Durumları */}
        <div className="glass-panel p-6 rounded-2xl mb-8">
          <h3 className="text-xl font-cinzel text-white mb-6 text-center">OYUNCU DURUMLARI</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map(player => {
              const role = roles[player.uid];
              const isDead = deadPlayers.includes(player.uid);
              const isVampire = role === 'vampire';
              
              return (
                <div 
                  key={player.uid}
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    isDead 
                      ? 'bg-slate-900/50 opacity-70' 
                      : winner.team === 'villagers' && !isVampire
                        ? 'bg-blue-900/30 border border-blue-800/50'
                        : winner.team === 'vampires' && isVampire
                          ? 'bg-red-900/30 border border-red-800/50'
                          : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isVampire 
                        ? 'bg-red-900/50 border border-red-700/50' 
                        : 'bg-blue-900/50 border border-blue-700/50'
                    }`}>
                      {isVampire ? (
                        <Skull className={isDead ? "text-slate-500" : "text-red-400"} size={24} />
                      ) : (
                        <Users className={isDead ? "text-slate-500" : "text-blue-400"} size={24} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-cinzel font-bold ${
                          isDead ? 'text-slate-500' : 'text-white'
                        }`}>
                          {player.name}
                        </span>
                        {player.uid === user.uid && (
                          <span className="text-xs bg-blue-900/50 px-2 py-1 rounded">Siz</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          isVampire 
                            ? 'bg-red-900/50 text-red-300' 
                            : 'bg-blue-900/50 text-blue-300'
                        }`}>
                          {isVampire ? 'Vampir' : 'Köylü'}
                        </span>
                        {isDead && (
                          <span className="text-xs bg-slate-800/50 px-2 py-1 rounded text-slate-400">ÖLÜ</span>
                        )}
                        {!isDead && winner.team !== 'ongoing' && (
                          <span className="text-xs bg-green-900/30 px-2 py-1 rounded text-green-400">CANLI</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {winner.team !== 'ongoing' && (
                      <div className={`text-sm font-cinzel ${
                        (winner.team === 'villagers' && !isVampire) || 
                        (winner.team === 'vampires' && isVampire)
                          ? 'text-yellow-400'
                          : 'text-slate-500'
                      }`}>
                        {(winner.team === 'villagers' && !isVampire) || 
                         (winner.team === 'vampires' && isVampire)
                          ? '🎉 KAZANDI'
                          : '😞 KAYBETTİ'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="glass-panel p-6 rounded-2xl mb-8">
          <h3 className="text-xl font-cinzel text-white mb-6 text-center">İSTATİSTİKLER</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-900/20 rounded-xl">
              <p className="text-3xl font-cinzel text-blue-400">
                {players.filter(p => roles[p.uid] === 'villager' && !deadPlayers.includes(p.uid)).length}
              </p>
              <p className="text-white/70 text-sm mt-1">Canlı Köylü</p>
            </div>
            
            <div className="text-center p-4 bg-red-900/20 rounded-xl">
              <p className="text-3xl font-cinzel text-red-400">
                {players.filter(p => roles[p.uid] === 'vampire' && !deadPlayers.includes(p.uid)).length}
              </p>
              <p className="text-white/70 text-sm mt-1">Canlı Vampir</p>
            </div>
            
            <div className="text-center p-4 bg-slate-900/20 rounded-xl">
              <p className="text-3xl font-cinzel text-white">
                {deadPlayers.length}
              </p>
              <p className="text-white/70 text-sm mt-1">Ölü Oyuncu</p>
            </div>
            
            <div className="text-center p-4 bg-purple-900/20 rounded-xl">
              <p className="text-3xl font-cinzel text-purple-400">
                {gameData?.round || 1}
              </p>
              <p className="text-white/70 text-sm mt-1">Tur</p>
            </div>
          </div>
        </div>

        {/* Host Kontrolleri */}
        {gameData?.hostId === user?.uid && (
          <div className="fixed bottom-6 left-0 right-0 px-6 max-w-2xl mx-auto">
            <div className="flex gap-4">
              {winner.team === 'ongoing' ? (
                <button
                  onClick={startNextRound}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white font-bold font-cinzel rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-colors"
                >
                  <RotateCcw size={20} />
                  SONRAKİ TURA GEÇ
                </button>
              ) : (
                <button
                  onClick={restartGame}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-800 to-purple-600 text-white font-bold font-cinzel rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-colors"
                >
                  <RotateCcw size={20} />
                  YENİ OYUN BAŞLAT
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};