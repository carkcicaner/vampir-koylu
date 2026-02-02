import React from 'react';
import { Share2, Crown, Play, Clock } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

const STORIES = [
  { intro: "Gece çöktü.", location: "Mahzende", victim: "Rahip", clue: "kanlı bir haç ile", modifier: "KORKU: Ekran titreyebilir!" },
  { intro: "Sis bastırdı.", location: "Ormanda", victim: "Avcı", clue: "kendi okuyla", modifier: "SESSİZLİK: Fısıldayın." }
];

export const LobbyView = ({ gameCode, gameData, user, setView, setGameCode, setLoading, setError }) => {
  
  const startNewRound = async () => {
    if (!gameData) return;
    const players = [...gameData.players];
    const totalVampires = gameData.settings.vampireCount;
    
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    const newRoles = {};
    players.forEach((p, index) => {
      newRoles[p.uid] = index < totalVampires ? 'vampire' : 'villager';
    });

    const t = STORIES[Math.floor(Math.random() * STORIES.length)];
    const storyText = `${t.intro} Olay ${t.location} gerçekleşti. ${t.victim} ölü bulundu... ${t.clue}.`;

    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      status: 'story',
      roles: newRoles,
      story: { text: storyText, modifier: t.modifier },
      timerEnd: null, deadPlayers: [], votes: {}, lastResult: null
    });
  };
  
  return (
    <div className="min-h-screen p-6 flex flex-col items-center max-w-xl mx-auto animate-fadeIn">
      <div className="glass-panel w-full p-6 rounded-2xl mb-6 flex justify-between items-center border-l-4 border-l-red-600">
        <div>
          <p className="text-xs text-red-400 font-cinzel tracking-[0.2em] mb-1">GİZLİ ODA</p>
          <p className="text-4xl font-mono font-bold text-white tracking-wider text-glow-white">{gameCode}</p>
        </div>
        <button onClick={() => {navigator.clipboard.writeText(gameCode); alert("Kopyalandı")}} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <Share2 className="text-slate-400" size={20} />
        </button>
      </div>

      <div className="w-full flex-1 mb-24 space-y-3">
        {gameData?.players?.map((p, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl flex items-center gap-4 group hover:bg-white/5 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-cinzel ${p.isHost ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'}`}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <span className="text-slate-200 font-inter font-medium block">{p.name}</span>
              <span className="text-xs text-slate-500">{p.isHost ? 'Oyun Kurucusu' : 'Bekliyor...'}</span>
            </div>
            {p.isHost && <Crown size={16} className="text-yellow-500" />}
          </div>
        ))}
      </div>

      {gameData?.hostId === user?.uid ? (
        <div className="fixed bottom-6 w-full max-w-xl px-6 z-20">
          <button onClick={startNewRound} className="w-full py-4 rounded-xl bg-gradient-to-r from-red-900 to-red-700 text-white font-bold font-cinzel shadow-[0_0_40px_rgba(220,38,38,0.4)] animate-float flex items-center justify-center gap-2">
            <Play fill="currentColor" size={20} /> OYUNU BAŞLAT
          </button>
        </div>
      ) : (
        <div className="fixed bottom-8 text-slate-500 font-cinzel text-sm animate-pulse flex items-center gap-2">
          <Clock size={14} /> KURUCU BEKLENİYOR...
        </div>
      )}
    </div>
  );
};