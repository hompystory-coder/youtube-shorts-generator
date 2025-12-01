const response1 = {"success":true,"data":[{"id":"img_1","name":"배경1.jpg","url":"https://example.com"}],"total":3};
const response2 = {"success":true,"music":[{"id":"bgm_1","name":"음악1.mp3"}],"total":2};

// Test new parsing logic
const images = response1.data || response1.images || [];
const music = response2.data || response2.music || [];

console.log('✅ Images:', images.length, '- Names:', images.map(i => i.name).join(', '));
console.log('✅ Music:', music.length, '- Names:', music.map(m => m.name).join(', '));
