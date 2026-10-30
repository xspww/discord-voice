const { Client, Constants } = require('djs-selfbot-v13');
const { selfDeaf, selfMute } = require('./config');

// Discord requires E2EE (DAVE protocol) for all voice and video calls since March 1, 2026.
// The djs-selfbot-v13 library supports DAVE. A gateway-only join (no media) does not need
// opus, sodium, or ffmpeg.
//
// Reference: https://github.com/002-sans/djs-selfbot-v13

const RECONNECT_DELAY_MS = 5_000;
const RECONNECT_MAX_ATTEMPTS = 5;
const WATCHDOG_INTERVAL_MS = 60_000;

const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms); });

async function fetchTargetChannel(client, channelId, sessionIndex) {
    const channel = await client.channels.fetch(channelId);

    if (!channel || (!channel.isVoice() && channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE')) {
        console.error(`[Session #${sessionIndex + 1}] Voice or stage channel not found for ID: ${channelId}`);
        return null;
    }

    return channel;
}

// joinVoice in djs-selfbot-v13 is idempotent: if the same session is already in the same
// channel, it updates mute and deaf state only.
async function joinTargetVoice(client, channel, sessionIndex) {
    console.log(`[Session #${sessionIndex + 1}] Joining voice channel: "${channel.name}" (server: ${channel.guild.name})...`);

    const session = await client.voice.joinVoice(channel, {
        mute: selfMute,
        deaf: selfDeaf,
    });

    console.log(`[Session #${sessionIndex + 1}] Joined voice channel "${channel.name}" (${channel.guild.name}).`);
    return session;
}

async function joinWithRetry(client, channel, sessionIndex, attempt = 1) {
    try {
        await joinTargetVoice(client, channel, sessionIndex);
    } catch (err) {
        if (attempt >= RECONNECT_MAX_ATTEMPTS) {
            console.error(`[Session #${sessionIndex + 1}] Failed to join voice channel after ${attempt} attempts:`, err.message);
            return;
        }

        console.error(`[Session #${sessionIndex + 1}] Failed to join voice channel (attempt ${attempt}/${RECONNECT_MAX_ATTEMPTS}):`, err.message);
        await sleep(RECONNECT_DELAY_MS * attempt);
        return joinWithRetry(client, channel, sessionIndex, attempt + 1);
    }
}

// Keep the session in the voice channel 24/7. Rejoin after a kick, a channel move, or a silent drop.
function startMaintenanceLoop(client, channel, sessionIndex) {
    let joinInFlight = null;

    const dropStaleSession = () => {
        // Clear the reference only. Do not call disconnect in a blocking way.
        // joinVoice then runs preJoinCleanup to leave the old channel itself.
        if (client.voice.session) {
            client.voice.session = null;
        }
    };

    const ensureConnection = () => {
        if (joinInFlight) return joinInFlight;

        // Drop a stale session before reconnect so joinVoice does not treat it as idempotent.
        dropStaleSession();

        joinInFlight = joinWithRetry(client, channel, sessionIndex)
            .catch(err => {
                console.error(`[Session #${sessionIndex + 1}] Reconnect to voice channel failed:`, err.message);
            })
            .finally(() => {
                joinInFlight = null;
            });

        return joinInFlight;
    };

    client.on(Constants.Events.VOICE_STATE_UPDATE, (_oldState, newState) => {
        if (newState.id !== client.user.id) return;
        if (joinInFlight) return; // Reconnect is already in progress.

        // Handle only this channel's guild. Voice state from another session's guild must not
        // trigger a reconnect in this session.
        if (channel.guild && newState.guild?.id && newState.guild.id !== channel.guild.id) return;

        if (newState.channelId === channel.id) return;

        console.log(`[Session #${sessionIndex + 1}] Left voice channel "${channel.name}". Reconnecting...`);
        dropStaleSession();
        ensureConnection();
    });

    const watchdog = setInterval(() => {
        // Use this guild's voice state only. client.user.voice can return state from another guild.
        const state = channel.guild
            ? channel.guild.voiceStates.cache.get(client.user.id)
            : client.voiceStates.cache.get(client.user.id);
        const session = client.voice.session;

        // The account is definitely in another channel. Reconnect.
        if (state && state.channelId && state.channelId !== channel.id) {
            console.log(`[Session #${sessionIndex + 1}] Watchdog: moved to another channel (${state.channelId}). Reconnecting...`);
            dropStaleSession();
            ensureConnection();
            return;
        }

        // The session is missing or disconnected. Reconnect.
        if (!session || session.disconnected) {
            console.log(`[Session #${sessionIndex + 1}] Watchdog: not in voice channel "${channel.name}". Reconnecting...`);
            ensureConnection();
            return;
        }

        // State is unknown (cache lag) or the session is still in this channel. Keep it.
    }, WATCHDOG_INTERVAL_MS);
    watchdog.unref();
}

async function startSession(token, channelId, sessionIndex) {
    const client = new Client();

    client.on('ready', async () => {
        console.log(`==================================================`);
        console.log(`[+] Session #${sessionIndex + 1} logged in: ${client.user.tag} (${client.user.id})`);
        console.log(`==================================================`);

        try {
            const channel = await fetchTargetChannel(client, channelId, sessionIndex);
            if (!channel) return;

            await joinWithRetry(client, channel, sessionIndex);
            startMaintenanceLoop(client, channel, sessionIndex);
        } catch (err) {
            console.error(`[Session #${sessionIndex + 1}] Error:`, err.message);
        }
    });

    client.login(token).catch(err => {
        console.error(`[Session #${sessionIndex + 1}] Login failed:`, err.message);
    });
}

module.exports = {
    startSession
};