import React, { useState } from 'react';
import { MessageSquare, Users, Skull, Shield, Clock } from 'lucide-react';

export const GameView = ({ gameData, gameCode, user, timeLeft, playSound }) => {
  const [message, setMessage] = useState('');
  
  const currentPlayer = gameData?.players?.find(p => p.uid === user.uid);
  const playerRole = gameData?.roles?.[user.uid];
  const isVampire = playerRole === 'vampire';
  const isDead = gameData?.deadPlayers?.includes(user.uid);
  
  // Diğer vampirleri bul
  const otherVampires = gameData?.players?.filter(p => 
    p.uid !== user.uid && gameData?.roles?.[p.uid] === 'vampire'
  ) || [];
  
  const sendMessage = async () => {
    if (!message.trim() || isDead) return;
    playSound('click');
    setMessage('');
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Başlık */}
      <div className="text-center mb-6">
        <MessageSquare className="mx-auto text-blue-400 mb-2" size={40} />
        <h2 className="text-3xl font-cinzel text-white">TARTIŞMA</h2>
        
        {/* Zamanlayıcı */}
        {timeLeft !== null && (
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-900/30 px-4 py-2 rounded-full border border-blue-800/50">
            <Clock className="text-blue-400" size={16} />
            <span className="text-white font-mono text-sm">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Oyuncu Listesi */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel text-white flex items-center gap-2">
                <Users size={20} /> OYUNCULAR
              </h3>
              <span className="text-white/50 text-sm">
                {gameData?.players?.length || 0} kişi
              </span>
            </div>
            
            <div className="space-y-3">
              {gameData?.players?.map(p => {
                const playerRole = gameData?.roles?.[p.uid];
                const isPlayerDead = gameData?.deadPlayers?.includes(p.uid);
                const isPlayerVampire = playerRole === 'vampire';
                
                return (
                  <div
                    key={p.uid}
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      isPlayerDead 
                        ? 'bg-slate-900/50 opacity-60 border border-slate-800' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    } transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {isPlayerDead && (
                          <div className="absolute inset-0 bg-red-500/20 rounded-full"></div>
                        )}
                        {isPlayerVampire ? (
                          <Skull className="text-red-400" size={24} />
                        ) : (
                          <Users className="text-blue-400" size={24} />
                        )}
                      </div>
                      <div>
                        <span className={`font-cinzel font-bold ${isPlayerDead ? 'text-slate-500' : 'text-white'}`}>
                          {p.name} {p.uid === gameData?.hostId && "👑"}
                        </span>
                        <div className="flex gap-2 mt-1">
                          {isPlayerDead && (
                            <span className="text-xs bg-red-900/30 px-2 py-1 rounded">ÖLÜ</span>
                          )}
                          {isPlayerVampire && isVampire && !isPlayerDead && (
                            <span className="text-xs bg-red-900/50 px-2 py-1 rounded text-red-300">VAMPİR</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {isPlayerDead ? (
                        <span className="text-xs text-slate-500">Oy Kullanamaz</span>
                      ) : (
                        <span className="text-xs text-green-400">Aktif</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Sohbet Kutusu */}
          <div className="mt-6 glass-panel p-6 rounded-2xl">
            <h3 className="font-cinzel text-white mb-4">TARTIŞMA</h3>
            <div className="space-y-4">
              <div className="h-40 overflow-y-auto p-3 bg-black/30 rounded-lg">
                <p className="text-white/50 text-center py-8">
                  Tartışma başlamak için mesaj yazın...
                </p>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isDead ? "Ölüler konuşamaz..." : "Mesajınız..."}
                  disabled={isDead}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={isDead || !message.trim()}
                  className="bg-blue-700 text-white px-6 py-3 rounded-xl font-cinzel hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  GÖNDER
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sağ: Bilgi Paneli */}
        <div className="space-y-6">
          {/* Rol Bilgisi */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-cinzel text-white mb-4 flex items-center gap-2">
              <Shield size={20} /> ROLÜN
            </h3>
            
            <div className="text-center space-y-4">
              {isVampire ? (
                <div className="space-y-3">
                  <Skull className="mx-auto text-red-400" size={40} />
                  <div>
                    <p className="text-red-300 font-cinzel text-lg">VAMPİR</p>
                    <p className="text-white/70 text-sm mt-1">
                      Köylüleri kandır, kazan!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Users className="mx-auto text-blue-400" size={40} />
                  <div>
                    <p className="text-blue-300 font-cinzel text-lg">KÖYLÜ</p>
                    <p className="text-white/70 text-sm mt-1">
                      Vampirleri bul, köyü kurtar!
                    </p>
                  </div>
                </div>
              )}
              
              {isDead && (
                <div className="mt-4 p-3 bg-red-900/30 rounded-lg border border-red-800/50">
                  <p className="text-red-300 text-sm">🎭 Rolünüzü açıklamayın!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Vampir Takımı (sadece vampirler için) */}
          {isVampire && otherVampires.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border-2 border-red-800/50">
              <h3 className="font-cinzel text-red-300 mb-4 flex items-center gap-2">
                <Skull size={20} /> VAMPİR TAKIMI
              </h3>
              
              <div className="space-y-3">
                {otherVampires.map(vampire => (
                  <div 
                    key={vampire.uid} 
                    className="p-3 bg-red-900/30 rounded-lg border border-red-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skull className="text-red-400" size={18} />
                        <span className="font-cinzel font-bold text-white">{vampire.name}</span>
                      </div>
                      {gameData?.deadPlayers?.includes(vampire.uid) ? (
                        <span className="text-xs bg-red-900/50 px-2 py-1 rounded text-slate-400">ÖLÜ</span>
                      ) : (
                        <span className="text-xs bg-green-900/30 px-2 py-1 rounded text-green-400">CANLI</span>
                      )}
                    </div>
                    
                    {/* Strateji ipuçları */}
                    <div className="mt-2 text-xs text-red-400/70">
                      {!gameData?.deadPlayers?.includes(vampire.uid) && (
                        <p>• Onu korumaya çalış</p>
                      )}
                      <p>• İşaretleşmek için gizli kodlar kullanın</p>
                    </div>
                  </div>
                ))}
                
                {/* Takım stratejisi */}
                <div className="mt-4 p-3 bg-black/40 rounded-lg">
                  <p className="text-red-300 text-sm font-bold mb-1">STRATEJİ:</p>
                  <ul className="text-xs text-red-400/70 space-y-1">
                    <li>• Birbirinizi savunun ama belli etmeyin</li>
                    <li>• Şüpheleri başkalarına yönlendirin</li>
                    <li>• Tutarlı hikayeler oluşturun</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Oyun İstatistikleri */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-cinzel text-white mb-4">DURUM</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Canlı Oyuncular:</span>
                <span className="text-white font-cinzel">
                  {gameData?.players?.filter(p => !gameData?.deadPlayers?.includes(p.uid)).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Ölü Oyuncular:</span>
                <span className="text-white font-cinzel">
                  {gameData?.deadPlayers?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Tur:</span>
                <span className="text-white font-cinzel">
                  {gameData?.round || 1}
                </span>
              </div>
              {isVampire && (
                <div className="flex justify-between items-center">
                  <span className="text-red-300">Takım Arkadaşı:</span>
                  <span className="text-red-300 font-cinzel">
                    {otherVampires.length} kişi
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Ölü oyuncular için mesaj */}
      {isDead && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 border border-red-800 p-4 rounded-xl max-w-md text-center">
          <p className="text-red-300 font-cinzel">💀 ÖLÜSÜNÜZ!</p>
          <p className="text-white/70 text-sm mt-1">
            Artık oy kullanamazsınız ama tartışmaya katılabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
};