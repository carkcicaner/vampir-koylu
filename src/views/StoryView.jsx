import React, { useEffect, useState } from 'react';
import { Moon, Skull, Users, Shield } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const StoryView = ({ gameData, gameCode, user, setView, playSound }) => {
  const [countdown, setCountdown] = useState(5);
  const [showRole, setShowRole] = useState(false);
  
  const currentPlayer = gameData?.players?.find(p => p.uid === user.uid);
  const playerRole = gameData?.roles?.[user.uid];
  const isVampire = playerRole === 'vampire';
  
  // Diğer vampirleri bul
  const otherVampires = gameData?.players?.filter(p => 
    p.uid !== user.uid && gameData?.roles?.[p.uid] === 'vampire'
  ) || [];

  useEffect(() => {
    playSound('transition');
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowRole(true);
          playSound('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleReady = async () => {
    playSound('click');
    if (gameData?.hostId === user.uid) {
      // Süre başlat
      const discussionTime = 300; // 5 dakika
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
        status: 'discussion',
        timerEnd: Date.now() + (discussionTime * 1000),
        round: (gameData.round || 1)
      });
    }
    setView('game');
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl text-center space-y-8">
        {!showRole ? (
          <>
            <div className="space-y-4">
              <Moon className="mx-auto text-yellow-500 animate-pulse" size={50} />
              <h2 className="text-3xl font-cinzel text-yellow-400">GECE</h2>
              <p className="text-white/70 font-inter">Rolünüz açıklanıyor...</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-black/40 rounded-full border-4 border-yellow-500/50">
                <span className="text-3xl font-mono text-yellow-400">{countdown}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              {isVampire ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full"></div>
                    <Skull className="relative mx-auto text-red-500" size={60} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-cinzel text-red-400 mb-2">VAMPİRSİN!</h3>
                    <p className="text-white/80 font-inter text-sm">
                      Amacın diğer vampirle birlikte köylüleri kandırmak ve oyunu kazanmak.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full"></div>
                    <Users className="relative mx-auto text-blue-500" size={60} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-cinzel text-blue-400 mb-2">KÖYLÜSÜN!</h3>
                    <p className="text-white/80 font-inter text-sm">
                      Amacın vampirleri bulup oylamak ve köyü kurtarmak.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Diğer vampirleri göster (sadece vampirler için) */}
              {isVampire && otherVampires.length > 0 && (
                <div className="mt-6 p-4 bg-red-900/30 rounded-xl border border-red-800/50">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Shield className="text-red-400" size={20} />
                    <h4 className="font-cinzel text-red-300">DİĞER VAMPİR</h4>
                    <Shield className="text-red-400" size={20} />
                  </div>
                  <div className="space-y-2">
                    {otherVampires.map(vampire => (
                      <div 
                        key={vampire.uid} 
                        className="bg-black/40 p-3 rounded-lg border border-red-700/50"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Skull className="text-red-400" size={18} />
                          <span className="font-cinzel font-bold text-white">{vampire.name}</span>
                          <Skull className="text-red-400" size={18} />
                        </div>
                        <p className="text-red-400/70 text-xs mt-1">
                          Sizinle aynı takımda. Birbirinizi koruyun!
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Özel yetenekler bilgisi */}
              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <h4 className="font-cinzel text-white/80 text-sm mb-2">ÖZEL YETENEKLER:</h4>
                {isVampire ? (
                  <ul className="text-left text-sm text-white/60 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>Geceleri diğer vampirle konuşabilirsin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>Köylüleri yanıltmak için strateji geliştir</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>Diğer vampiri korumaya çalış</span>
                    </li>
                  </ul>
                ) : (
                  <ul className="text-left text-sm text-white/60 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Gözlem yap ve şüpheli davranışları not et</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Diğer köylülerle işbirliği yap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Vampirleri tespit etmek için sorular sor</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
            
            <button
              onClick={handleReady}
              className="w-full py-4 bg-gradient-to-r from-purple-800 to-purple-600 text-white font-bold font-cinzel rounded-xl hover:brightness-110 hover:scale-[1.02] transition-all mt-6"
            >
              HAZIRIM
            </button>
          </>
        )}
      </div>
    </div>
  );
};