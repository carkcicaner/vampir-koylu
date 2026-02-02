import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldAlert } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

const DISCUSSION_TIME = 600;

export const StoryView = ({ gameData, gameCode, user }) => {
  const [typedStory, setTypedStory] = useState('');

  useEffect(() => {
    if (gameData?.story?.text) {
      setTypedStory('');
      let i = 0;
      const text = gameData.story.text;
      const timer = setInterval(() => {
        if (i < text.length) {
          setTypedStory((prev) => prev + text.charAt(i));
          i++;
        } else { clearInterval(timer); }
      }, 40);
      return () => clearInterval(timer);
    }
  }, [gameData?.story]);

  const startDiscussionPhase = async () => {
    if (gameData.hostId !== user.uid) return alert("Sadece kurucu devam ettirebilir.");
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      status: 'discussion',
      timerEnd: Date.now() + (DISCUSSION_TIME * 1000)
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fadeIn relative">
      <div className="glass-panel max-w-lg w-full p-8 rounded-sm border-y-4 border-y-red-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[#e0c9a6] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        <div className="flex justify-center mb-6">
          <BookOpen size={48} className="text-red-700/80 drop-shadow-[0_0_15px_rgba(185,28,28,0.5)]" />
        </div>
        <div className="font-cinzel text-lg md:text-xl text-slate-200 leading-loose text-center min-h-[150px] mb-8 typing-cursor">
          {typedStory}
        </div>
        <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg flex gap-3 items-start mb-8">
          <ShieldAlert className="text-red-500 shrink-0 mt-1" />
          <p className="text-red-400 text-sm font-inter italic">{gameData?.story?.modifier}</p>
        </div>
        {gameData.hostId === user.uid ? (
          <button onClick={startDiscussionPhase} className="w-full py-4 bg-slate-800 text-slate-300 font-cinzel rounded-xl hover:bg-slate-700">DEVAM ET</button>
        ) : (
          <div className="text-center text-slate-500 text-sm animate-pulse">Kurucu bekleniyor...</div>
        )}
      </div>
    </div>
  );
};