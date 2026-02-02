import React, { useState, useEffect, useRef } from 'react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef(null);
  const previousViewRef = useRef('home');

  // Ses efektleri
  const playSound = (soundName) => {
    if (!audioRef.current) return;
    
    const sounds = {
      click: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
      success: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3',
      error: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
      transition: 'https://assets.mixkit.co/sfx/preview/mixkit-game-show-wrong-answer-buzz-950.mp3',
      timer: 'https://assets.mixkit.co/sfx/preview/mixkit-retro-game-emergency-alarm-1000.mp3'
    };
    
    if (sounds[soundName]) {
      const audio = new Audio(sounds[soundName]);
      audio.volume = 0.3;
      audio.play().catch(e => console.log("Ses oynatma hatası:", e));
    }
  };

  // Tam ekran yönetimi
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.log("Tam ekran hatası:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.log("Tam ekran çıkış hatası:", err));
    }
  };

  useEffect(() => {
    // ESC tuşu ile tam ekrandan çık
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Sayfa yüklendiğinde tam ekran olması için bir buton ekleyeceğiz
    // Kullanıcı etkileşimi gerektiği için otomatik tam ekran yapmıyoruz
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Görünüm değiştiğinde ses çal
    if (view !== previousViewRef.current) {
      playSound('transition');
      previousViewRef.current = view;
    }
  }, [view]);

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
        
        // Oyun durumuna göre görünüm geçişi
        if (data.status === 'lobby' && view !== 'lobby') {
          setView('lobby');
          playSound('success');
        }
        if (data.status === 'story' && view !== 'story') {
          setView('story');
          playSound('transition');
        }
        if (data.status === 'discussion' && view !== 'game') {
          setView('game');
          playSound('transition');
        }
        if (data.status === 'voting' && view !== 'voting') {
          setView('voting');
          playSound('transition');
        }
        if (data.status === 'result' && view !== 'result') {
          setView('result');
          playSound('transition');
        }
      } else {
        setError('Oda kapatıldı.'); 
        setView('home');
        playSound('error');
      }
    });
    return () => unsub();
  }, [gameCode, user]);

  useEffect(() => {
    if ((gameData?.status === 'discussion' || gameData?.status === 'voting') && gameData?.timerEnd) {
      const interval = setInterval(() => {
        // Sunucu zamanı ile senkronize sayaç
        const now = Date.now();
        const timerEnd = gameData.timerEnd;
        
        // timerEnd bir Firestore Timestamp ise
        if (timerEnd && typeof timerEnd === 'object' && timerEnd.seconds) {
          const endTime = timerEnd.seconds * 1000 + Math.floor(timerEnd.nanoseconds / 1000000);
          const diff = Math.ceil((endTime - now) / 1000);
          setTimeLeft(diff > 0 ? diff : 0);
          
          // Son 10 saniyede ses efekti
          if (diff > 0 && diff <= 10) {
            playSound('timer');
          }
        } else if (typeof timerEnd === 'number') {
          // timerEnd bir sayı ise (millisaniye)
          const diff = Math.ceil((timerEnd - now) / 1000);
          setTimeLeft(diff > 0 ? diff : 0);
          
          // Son 10 saniyede ses efekti
          if (diff > 0 && diff <= 10) {
            playSound('timer');
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [gameData]);

  const JoinView = () => (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fadeIn">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md space-y-6 relative">
        <h2 className="text-2xl font-cinzel text-center text-blue-400">GİRİŞ KODU</h2>
        <input 
          maxLength={4} 
          value={gameCode} 
          onChange={(e) => {
            // Sadece harf ve rakam kabul et
            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            setGameCode(value);
          }} 
          placeholder="XXXX" 
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono uppercase text-white outline-none focus:border-blue-500" 
        />
        {error && (
          <div className="text-red-400 text-center text-sm animate-pulse">
            {error}
          </div>
        )}
        <div className="flex gap-4">
          <button 
            onClick={() => {
              playSound('click');
              setView('home');
            }} 
            className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-xl font-bold font-cinzel hover:bg-slate-700 transition-colors"
          >
            GERİ
          </button>
          <button 
            onClick={async () => {
              if(!playerName) {
                setError("İsim giriniz");
                playSound('error');
                return;
              }
              
              if(gameCode.length !== 4) {
                setError("Kod 4 karakter olmalı");
                playSound('error');
                return;
              }
              
              setLoading(true);
              setError('');
              playSound('click');
              
              const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'games'));
              const snap = await getDocs(q);
              
              if(snap.docs.some(d => d.id === gameCode)) {
                try {
                  await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
                    players: arrayUnion({ uid: user.uid, name: playerName, isHost: false })
                  });
                  localStorage.setItem('vampire_player_name', playerName);
                  setView('lobby');
                  playSound('success');
                } catch (err) {
                  setError("Odaya katılırken hata: " + err.message);
                  playSound('error');
                }
              } else { 
                setError("Oda bulunamadı"); 
                playSound('error');
              }
              setLoading(false);
            }} 
            className="flex-1 py-4 bg-blue-800 text-white rounded-xl font-bold font-cinzel hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading || gameCode.length !== 4}
          >
            {loading ? "GİRİLİYOR..." : "GİR"}
          </button>
        </div>
      </div>
    </div>
  );

  // Tam Ekran Butonu
  const FullscreenButton = () => (
    <button
      onClick={() => {
        playSound('click');
        toggleFullscreen();
      }}
      className="fixed top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
      title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
    >
      {isFullscreen ? (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
        </svg>
      )}
    </button>
  );

  // Ana uygulama props'ları
  const props = { 
    user, 
    gameCode, 
    setGameCode, 
    gameData, 
    playerName, 
    setPlayerName, 
    setLoading, 
    loading, 
    setError, 
    setView, 
    vampireCount, 
    setVampireCount, 
    timeLeft,
    playSound // Ses fonksiyonunu tüm view'lere aktar
  };

  return (
    <>
      <Background />
      <FullscreenButton />
      
      {view === 'home' && <HomeView {...props} />}
      {view === 'join' && <JoinView />}
      {view === 'lobby' && <LobbyView {...props} />}
      {view === 'story' && <StoryView {...props} />}
      {view === 'game' && <GameView {...props} />}
      {view === 'voting' && <VotingView {...props} />}
      {view === 'result' && <ResultView {...props} />}
      
      {/* Ses referansı */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </>
  );
}