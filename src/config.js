require('dotenv').config();

const rawTokens = process.env.TOKENS || process.env.TOKEN || '';
const tokens = rawTokens
    .split(',')
    .map(t => t.trim())
    .filter(t => t && t !== 'ใส่_DISCORD_USER_TOKEN_ที่นี่');

const rawChannelIds = process.env.CHANNEL_IDS || process.env.CHANNEL_ID || '';
const channelIds = rawChannelIds
    .split(',')
    .map(id => id.trim())
    .filter(id => id && id !== 'ใส่_VOICE_CHANNEL_ID_ที่นี่');

if (tokens.length === 0) {
    console.error('❌ [ERROR] กรุณาใส่ TOKEN ในไฟล์ .env ก่อนเริ่มทำงาน!');
    process.exit(1);
}

if (channelIds.length === 0) {
    console.error('❌ [ERROR] กรุณาใส่ CHANNEL_ID หรือ CHANNEL_IDS ในไฟล์ .env ก่อนเริ่มทำงาน!');
    process.exit(1);
}

const selfDeaf = process.env.SELF_DEAF !== 'false';
const selfMute = process.env.SELF_MUTE !== 'false';

module.exports = {
    tokens,
    channelIds,
    selfDeaf,
    selfMute
};
