import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, getDocs, query, collection, updateDoc, arrayUnion } from 'firebase/firestore';

import { auth, db, APP_ID } from './config/firebase';
import { HomeView } from './views/HomeView';
import { LobbyView } from './views/LobbyView';
import { StoryView } from './views/StoryView';
import { GameView } from './views/GameView';
import { VotingView } from './views/VotingView';
import { ResultView } from './views/ResultView';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [gameCode, setGameCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vampireCount, setVampireCount] = useState(2);
  const [timeLeft, setTimeLeft] = useState(null);

  const Background = () => (
    <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_rgba(139,0,0,0.15),_transparent_70%)] animate-fog mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_rgba(25,25,112,0.15),_transparent_70%)] animate-fog mix-blend-screen" style={{ animationDelay: '-10s' }}></div>
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if(localStorage.getItem('vampire_player_name')) setPlayerName(localStorage.getItem('vampire_player_name'));
    });
  }, []);

  useEffect(() => {
    if (!gameCode || !user) return;
    const unsub = onSnapshot(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGameData(data);
        if (data.status === 'lobby') setView('lobby');
        if (data.status === 'story') setView('story');
        if (data.status === 'discussion') setView('game');
        if (data.status === 'voting') setView('voting');
        if (data.status === 'result') setView('result');
      } else {
        setError('Oda kapatıldı.'); setView('home');
      }
    });
    return () => unsub();
  }, [gameCode, user]);

  useEffect(() => {
    if ((gameData?.status === 'discussion' || gameData?.status === 'voting') && gameData?.timerEnd) {
      const interval = setInterval(() => {
        const diff = Math.ceil((gameData.timerEnd - Date.now()) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameData]);

  const JoinView = () => (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fadeIn">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md space-y-6">
        <h2 className="text-2xl font-cinzel text-center text-blue-400">GİRİŞ KODU</h2>
        <input maxLength={4} value={gameCode} onChange={(e) => setGameCode(e.target.value.toUpperCase())} placeholder="XXXX" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono uppercase text-white outline-none focus:border-blue-500" />
        <div className="flex gap-4">
          <button onClick={() => setView('home')} className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-xl font-bold font-cinzel">GERİ</button>
          <button onClick={async () => {
            if(!playerName) return setError("İsim gir");
            setLoading(true);
            const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'games'));
            const snap = await getDocs(q);
            if(snap.docs.some(d => d.id === gameCode)) {
               await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
                 players: arrayUnion({ uid: user.uid, name: playerName, isHost: false })
               });
               setView('lobby');
            } else { setError("Oda yok"); }
            setLoading(false);
          }} className="flex-1 py-4 bg-blue-800 text-white rounded-xl font-bold font-cinzel">GİR</button>
        </div>
      </div>
    </div>
  );

  const props = { user, gameCode, setGameCode, gameData, playerName, setPlayerName, setLoading, loading, setError, setView, vampireCount, setVampireCount, timeLeft };

  return (
    <>
      <Background />
      {view === 'home' && <HomeView {...props} />}
      {view === 'join' && <JoinView />}
      {view === 'lobby' && <LobbyView {...props} />}
      {view === 'story' && <StoryView {...props} />}
      {view === 'game' && <GameView {...props} />}
      {view === 'voting' && <VotingView {...props} />}
      {view === 'result' && <ResultView {...props} />}
    </>
  );
}