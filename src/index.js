const { tokens, channelIds } = require('./config');
const { startSession } = require('./voice');

console.log(`🚀 กำลังเริ่มการทำงานทั้งหมด ${channelIds.length} Session(s)...`);

channelIds.forEach((channelId, index) => {
    // If multiple tokens provided, map by index, otherwise use the token for all sessions
    const token = tokens[index] || tokens[0];
    startSession(token, channelId, index);
});
