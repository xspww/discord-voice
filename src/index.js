const { tokens, channelIds } = require('./config');
const { startSession } = require('./voice');

console.log(`Starting ${channelIds.length} session(s) (E2EE / DAVE protocol ready)...`);

// Support several channels with one token: create one gateway session per channel.
// Discord lets one account stay in several voice channels when each uses its own session or device.
// Start sessions one at a time with a delay to avoid rate limits during login.
(async () => {
    for (let index = 0; index < channelIds.length; index++) {
        // Reuse the first token when there are fewer tokens than channels.
        const token = tokens[index] || tokens[0];
        startSession(token, channelIds[index], index);
        if (index < channelIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
})();