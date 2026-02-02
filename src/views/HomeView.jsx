import React from 'react';
import { Crown, Users, Maximize2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const HomeView = ({ 
  playerName, 
  setPlayerName, 
  setView, 
  user, 
  setLoading, 
  setError, 
  setGameCode, 
  loading, 
  vampireCount, 
  setVampireCount,
  playSound 
}) => {

  const createGame = async () => {
    if (!playerName.trim()) {
      setError('İsim girilmeli.');
      playSound('error');
      return;
    }
    
    playSound('click');
    setLoading(true);
    localStorage.setItem('vampire_player_name', playerName);
    
    // Benzersiz bir oyun kodu oluştur
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newCode = '';
    for (let i = 0; i < 4; i++) {
      newCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', newCode), {
        hostId: user.uid,
        code: newCode,
        status: 'lobby',
        createdAt: Date.now(),
        settings: { vampireCount },
        story: { text: '', modifier: '' },
        players: [{ uid: user.uid, name: playerName, isHost: true }],
        roles: {}, 
        deadPlayers: [], 
        votes: {}, 
        lastResult: null,
        timerEnd: null,
        round: 1
      });
      
      playSound('success');
      setGameCode(newCode);
      setView('lobby');
    } catch (error) {
      console.error("Oyun oluşturma hatası:", error);
      setError('Oyun oluşturulurken hata: ' + error.message);
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  // Tam ekran fonksiyonu
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .catch(err => console.log("Tam ekran hatası:", err));
    } else {
      document.exitFullscreen()
        .catch(err => console.log("Tam ekran çıkış hatası:", err));
    }
  };

  const Logo = () => (
    <div className="relative text-center mb-8">
      <div className="absolute inset-0 bg-red-600 blur-[80px] opacity-20"></div>
      <h1 className="font-cinzel font-black text-6xl text-white tracking-tighter drop-shadow-2xl relative z-10">
        VAMPİR <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800 text-5xl mt-[-5px] text-glow-red">KÖYLÜ</span>
      </h1>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fadeIn">
      {/* Tam Ekran Butonu */}
      <button
        onClick={() => {
          playSound('click');
          toggleFullscreen();
        }}
        className="fixed top-4 right-4 z-50 p-3 bg-black/30 hover:bg-black/50 rounded-xl backdrop-blur-sm border border-white/10 transition-all hover:scale-110 group"
        title="Tam Ekran Yap"
      >
        <Maximize2 size={20} className="text-white group-hover:text-red-400 transition-colors" />
      </button>
      
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative">
        <Logo />
        <div className="space-y-6">
          <div className="relative">
            <input 
              placeholder="İSMİNİZ..." 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-red-500/50 outline-none font-inter hover:border-white/20 transition-colors"
              maxLength={15}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  createGame();
                }
              }}
            />
            {playerName && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/50">
                {playerName.length}/15
              </div>
            )}
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-3 font-cinzel text-sm text-red-400">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.493 2.853a.75.75 0 00-1.486-.205L7.545 6H4a1 1 0 000 2h3.347l-1.27 5.852a.75.75 0 001.486.205L7.955 14h4.09l.772 3.147a.75.75 0 001.486-.205L12.653 12H16a1 1 0 100-2h-3.347l1.27-5.852a.75.75 0 00-1.486-.205L12.045 6H7.955l-.772-3.147z" clipRule="evenodd" />
                </svg>
                VAMPİR SAYISI
              </span>
              <span className="bg-red-900/30 px-3 py-1 rounded-full border border-red-800/50">{vampireCount}</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (vampireCount > 1) {
                    setVampireCount(vampireCount - 1);
                    playSound('click');
                  }
                }}
                disabled={vampireCount <= 1}
                className="w-8 h-8 flex items-center justify-center bg-red-900/50 rounded-lg disabled:opacity-30 hover:bg-red-800 transition-colors"
              >
                <span className="text-white font-bold">-</span>
              </button>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={vampireCount} 
                onChange={(e) => {
                  setVampireCount(Number(e.target.value));
                  playSound('click');
                }} 
                className="flex-1 h-2 bg-slate-800 rounded-lg accent-red-600 cursor-pointer hover:accent-red-500 transition-colors"
              />
              <button 
                onClick={() => {
                  if (vampireCount < 5) {
                    setVampireCount(vampireCount + 1);
                    playSound('click');
                  }
                }}
                disabled={vampireCount >= 5}
                className="w-8 h-8 flex items-center justify-center bg-red-900/50 rounded-lg disabled:opacity-30 hover:bg-red-800 transition-colors"
              >
                <span className="text-white font-bold">+</span>
              </button>
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={createGame} 
              disabled={loading || !playerName.trim()} 
              className="relative bg-gradient-to-r from-red-900 to-red-700 text-white py-4 rounded-xl font-bold font-cinzel hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:brightness-100 flex items-center justify-center gap-2 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <Crown size={18} className="group-hover:rotate-12 transition-transform" /> 
              {loading ? 'OLUŞTURULUYOR...' : 'ODA KUR'}
            </button>
            
            <button 
              onClick={() => {
                playSound('click');
                setView('join');
              }} 
              className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 rounded-xl font-bold font-cinzel hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <Users size={18} className="group-hover:scale-110 transition-transform" /> 
              ODAYA KATIL
            </button>
          </div>
          
          <div className="text-center text-white/40 text-xs pt-4 border-t border-white/10">
            <p>Oyun Kur'u tıklayarak yeni bir oda oluşturabilir</p>
            <p>veya Odaya Katıl'ı tıklayarak mevcut bir odaya katılabilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
};