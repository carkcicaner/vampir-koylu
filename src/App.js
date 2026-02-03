// App.js'de createGame fonksiyonuna rol atama ekleyelim
const assignRoles = (players, vampireCount) => {
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
  
  return roles;
};

// createGame fonksiyonunu güncelle
const createGame = async () => {
  // ... mevcut kodlar
  
  const players = [{ uid: user.uid, name: playerName, isHost: true }];
  const roles = assignRoles(players, vampireCount);
  
  await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'games', newCode), {
    // ... diğer alanlar
    roles: roles,
    // ... devamı
  });
  
  // ... devamı
};