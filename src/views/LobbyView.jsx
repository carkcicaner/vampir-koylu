import React, { useState } from 'react';
import { Crown, Users, Play, Shuffle, Skull, Copy, LogOut } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const LobbyView = ({ gameData, gameCode, user, setView, playSound, assignRoles }) => {
  const [assigningRoles, setAssigningRoles] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentPlayer = gameData?.players?.find(p => p.uid === user.uid);
  const isHost = currentPlayer?.isHost || false;

  const assignRandomRoles = async () => {
    playSound('click');
    setAssigningRoles(true);
    
    const players = gameData.players || [];
    const vampireCount = gameData.settings?.vampireCount || 2;
    
    const roles = assignRoles(players, vampireCount);
    
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      roles: roles,
      rolesAssigned: true
    });
    
    playSound('success');
    setAssigningRoles(false);
  };

  const startGame = async () => {
    playSound('click');
    if (isHost) {
      if (!gameData.roles || Object.keys(gameData.roles).length === 0) {
        await assignRandomRoles();
      }
      
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
        status: 'story'
      });
      setView('story');
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    playSound('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveGame = () => {
    playSound('click');
    setView('home');
  };

  const getRoleBadge = (playerUid) => {
    const role = gameData?.roles?.[playerUid];
    if (!role) return null;
    
    return role === 'vampire' ? (
      <span className="text-xs bg-red-900/30 px-2 py-1 rounded text-red-300 flex items-center gap-1">
        <Skull size={10} /> Vampir
      </span>
    ) : (
      <span className="text-xs bg-blue-900/30 px-2 py-1 rounded text-blue-300">Köylü</span>
    );
  };

  return (
    <div className="min-h-screen p-6 animate-fadeIn">
      {/* Oyun Kodu */}
      <div className="max-w-md mx-auto mb-8">
        <div className="glass-panel p-6 rounded-2xl text-center">
          <h2 className="text-xl font-cinzel text-white mb-2">ODA KODU</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-black/40 px-6 py-4 rounded-xl border border-white/10">
              <span className="text-4xl font-mono tracking-widest text-white">{gameCode}</span>
            </div>
            <button
              onClick={copyGameCode}
              className="p-3 bg-blue-800 hover:bg-blue-700 rounded-xl transition-colors"
              title="Kodu Kopyala"
            >
              {copied ? (
                <span className="text-green-400 text-sm">✓</span>
              ) : (
                <Copy size={20} className="text-white" />
              )}
            </button>
          </div>
          <p className="text-white/60 text-sm mt-3">
            Bu kodu arkadaşlarınızla paylaşın
          </p>
        </div>
      </div>

      {/* Oyuncu Listesi */}
      <div className="max-w-md mx-auto mb-24">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-cinzel text-white flex items-center gap-2">
              <Users size={24} /> OYUNCULAR
            </h3>
            <span className="text-white/70">
              {gameData?.players?.length || 0}/10
            </span>
          </div>
          
          <div className="space-y-3">
            {gameData?.players?.map((player, index) => (
              <div
                key={player.uid}
                className={`p-4 rounded-xl flex items-center justify-between ${
                  player.uid === user.uid
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                } transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-center">
                      {player.isHost ? (
                        <Crown className="text-yellow-400" size={20} />
                      ) : (
                        <span className="text-white font-bold">{index + 1}</span>
                      )}
                    </div>
                    {player.isHost && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Crown size={10} className="text-black" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel font-bold text-white">
                        {player.name}
                      </span>
                      {player.uid === user.uid && (
                        <span className="text-xs bg-blue-900/50 px-2 py-1 rounded">Siz</span>
                      )}
                    </div>
                    {gameData?.roles?.[player.uid] && (
                      <div className="mt-1">
                        {getRoleBadge(player.uid)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {player.isHost && (
                    <span className="text-yellow-400 text-sm flex items-center gap-1">
                      <Crown size={14} /> Kurucu
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Roller atanmışsa bilgi */}
          {gameData?.roles && Object.keys(gameData.roles).length > 0 && (
            <div className="mt-6 p-4 bg-green-900/20 rounded-xl border border-green-800/50">
              <p className="text-green-300 text-sm text-center">
                ✓ Roller atandı! Oyuncular rolleri giriş ekranında görecek.
              </p>
              <div className="flex justify-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-white/70 text-xs">
                    Vampir: {Object.values(gameData.roles).filter(r => r === 'vampire').length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-white/70 text-xs">
                    Köylü: {Object.values(gameData.roles).filter(r => r === 'villager').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Host Kontrolleri */}
      {isHost && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto">
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={assignRandomRoles}
                disabled={assigningRoles || (gameData?.players?.length || 0) < 3}
                className="flex-1 py-4 bg-purple-800 text-white rounded-xl font-bold font-cinzel flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Shuffle size={20} />
                {assigningRoles ? 'ROL ATANIYOR...' : 'ROLLERİ DAĞIT'}
              </button>
              
              <button
                onClick={startGame}
                disabled={(gameData?.players?.length || 0) < 3 || !gameData?.roles}
                className="flex-1 py-4 bg-gradient-to-r from-red-800 to-red-600 text-white rounded-xl font-bold font-cinzel flex items-center justify-center gap-2 hover:brightness-110 transition-colors disabled:opacity-50"
              >
                <Play size={20} />
                OYUNU BAŞLAT
              </button>
            </div>
            
            <div className="text-center text-sm text-white/60">
              {!gameData?.roles ? (
                <p>Önce "ROLLERİ DAĞIT" butonuna tıklayın.</p>
              ) : (gameData?.players?.length || 0) < 3 ? (
                <p>Oyunu başlatmak için en az 3 oyuncu gerekiyor.</p>
              ) : (
                <p>Tüm oyuncular hazırsa "OYUNU BAŞLAT" butonuna tıklayın.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Çıkış Butonu */}
      {!isHost && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto">
          <button
            onClick={leaveGame}
            className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold font-cinzel flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <LogOut size={20} />
            ODADAN AYRIL
          </button>
        </div>
      )}
    </div>
  );
};