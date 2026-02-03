// LobbyView'de role atama butonu ekleyelim
import React, { useState } from 'react';
import { Crown, Users, Play, Shuffle, Skull } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, APP_ID } from '../config/firebase';

export const LobbyView = ({ gameData, gameCode, user, setView, playSound }) => {
  const [assigningRoles, setAssigningRoles] = useState(false);

  const assignRandomRoles = async () => {
    playSound('click');
    setAssigningRoles(true);
    
    const players = gameData.players || [];
    const vampireCount = gameData.settings?.vampireCount || 2;
    
    // Karıştır
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const roles = {};
    
    // Vampirleri seç
    for (let i = 0; i < Math.min(vampireCount, shuffled.length); i++) {
      roles[shuffled[i].uid] = 'vampire';
    }
    
    // Kalanları köylü yap
    for (let i = vampireCount; i < shuffled.length; i++) {
      roles[shuffled[i].uid] = 'villager';
    }
    
    // Rolleri kaydet
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
      roles: roles,
      rolesAssigned: true
    });
    
    playSound('success');
    setAssigningRoles(false);
  };

  const startGame = async () => {
    playSound('click');
    if (gameData.hostId === user.uid) {
      // Roller atanmamışsa otomatik ata
      if (!gameData.roles || Object.keys(gameData.roles).length === 0) {
        await assignRandomRoles();
      }
      
      // Oyunu başlat
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', gameCode), {
        status: 'story'
      });
      setView('story');
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* ... diğer kodlar ... */}
      
      {/* Host kontrol butonları */}
      {gameData?.hostId === user.uid && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto">
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
          
          {/* Bilgilendirme */}
          <div className="mt-4 text-center text-sm text-white/60">
            {!gameData?.roles && (
              <p>Önce "ROLLERİ DAĞIT" butonuna tıklayın.</p>
            )}
            {(gameData?.players?.length || 0) < 3 && (
              <p>Oyunu başlatmak için en az 3 oyuncu gerekiyor.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};