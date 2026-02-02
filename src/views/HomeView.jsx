import React from 'react';
import { Crown, Users } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const HomeView = ({ playerName, setPlayerName, setView, user, setLoading, setError, setGameCode, loading, vampireCount, setVampireCount }) => {

  const createGame = async () => {
    if (!playerName.trim()) return setError('İsim girilmeli.');
    setLoading(true);
    localStorage.setItem('vampire_player_name', playerName);
    const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', newCode), {
      hostId: user.uid,
      code: newCode,
      status: 'lobby',
      createdAt: new Date().toISOString(),
      settings: { vampireCount },
      story: { text: '', modifier: '' },
      players: [{ uid: user.uid, name: playerName, isHost: true }],
      roles: {}, deadPlayers: [], votes: {}, lastResult: null
    });
    
    setGameCode(newCode);
    setView('lobby');
    setLoading(false);
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
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative">
        <Logo />
        <div className="space-y-6">
          <input 
            placeholder="İSMİNİZ..." 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-red-500/50 outline-none font-inter"
          />
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between mb-2 font-cinzel text-sm text-red-400">
              <span>VAMPİR SAYISI</span>
              <span>{vampireCount}</span>
            </div>
            <input type="range" min="1" max="5" value={vampireCount} onChange={(e) => setVampireCount(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg accent-red-600 cursor-pointer" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={createGame} disabled={loading} className="bg-gradient-to-r from-red-900 to-red-700 text-white py-4 rounded-xl font-bold font-cinzel hover:brightness-110 flex items-center justify-center gap-2">
               <Crown size={18} /> {loading ? '...' : 'KUR'}
            </button>
            <button onClick={() => setView('join')} className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 rounded-xl font-bold font-cinzel hover:brightness-110 flex items-center justify-center gap-2">
               <Users size={18} /> KATIL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};