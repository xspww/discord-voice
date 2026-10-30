require('dotenv').config();

const rawTokens = process.env.TOKENS || process.env.TOKEN || '';
const tokens = rawTokens
    .split(',')
    .map(t => t.trim())
    .filter(t => t && t !== 'PUT_DISCORD_USER_TOKEN_HERE');

const rawChannelIds = process.env.CHANNEL_IDS || process.env.CHANNEL_ID || '';
const channelIds = rawChannelIds
    .split(',')
    .map(id => id.trim())
    .filter(id => id && id !== 'PUT_VOICE_CHANNEL_ID_HERE');

if (tokens.length === 0) {
    console.error('[ERROR] Add a TOKEN to the .env file before you start.');
    process.exit(1);
}

if (channelIds.length === 0) {
    console.error('[ERROR] Add CHANNEL_ID or CHANNEL_IDS to the .env file before you start.');
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