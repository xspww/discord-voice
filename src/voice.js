const { Client, Constants } = require('djs-selfbot-v13');
const { selfDeaf, selfMute } = require('./config');

// Discord บังคับใช้ E2EE (DAVE Protocol) กับคอลเสียง/วิดีโอทั้งหมดตั้งแต่ 1 มีนาคม 2026
// ไลบรารี djs-selfbot-v13 เวอร์ชันใหม่รองรับ DAVE อยู่แล้ว และการเข้าห้องแบบ gateway-only
// (ไม่ส่งสื่อ) ไม่จำเป็นต้องติดตั้ง opus / sodium / ffmpeg เพิ่มเติม
//
// อ้างอิง: https://github.com/002-sans/djs-selfbot-v13

const RECONNECT_DELAY_MS = 5_000;
const RECONNECT_MAX_ATTEMPTS = 5;
const WATCHDOG_INTERVAL_MS = 60_000;

const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms); });

async function fetchTargetChannel(client, channelId, sessionIndex) {
    const channel = await client.channels.fetch(channelId);

    if (!channel || (!channel.isVoice() && channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE')) {
        console.error(`❌ [Session #${sessionIndex + 1}] ไม่พบห้องเสียง (Voice / Stage) สำหรับ ID: ${channelId}`);
        return null;
    }

    return channel;
}

// joinVoice ของ djs-selfbot-v13 เป็น idempotent: ถ้า session เดียวกันอยู่ในห้องเดิมอยู่แล้ว
// จะอัปเดตเฉพาะสถานะ mute / deaf โดยไม่ต้องถอยออกแล้วเข้าใหม่
async function joinTargetVoice(client, channel, sessionIndex) {
    console.log(`🔄 [Session #${sessionIndex + 1}] กำลังเข้าห้องเสียง: "${channel.name}" (เซิร์ฟเวอร์: ${channel.guild.name})...`);

    const session = await client.voice.joinVoice(channel, {
        mute: selfMute,
        deaf: selfDeaf,
    });

    console.log(`✅ [Session #${sessionIndex + 1}] เข้าห้องเสียง "${channel.name}" (${channel.guild.name}) สำเร็จแล้ว!`);
    return session;
}

async function joinWithRetry(client, channel, sessionIndex, attempt = 1) {
    try {
        await joinTargetVoice(client, channel, sessionIndex);
    } catch (err) {
        if (attempt >= RECONNECT_MAX_ATTEMPTS) {
            console.error(`❌ [Session #${sessionIndex + 1}] เข้าห้องเสียงไม่สำเร็จหลังพยายาม ${attempt} ครั้ง:`, err.message);
            return;
        }

        console.error(`⚠️ [Session #${sessionIndex + 1}] เข้าห้องเสียงไม่สำเร็จ (ครั้งที่ ${attempt}/${RECONNECT_MAX_ATTEMPTS}):`, err.message);
        await sleep(RECONNECT_DELAY_MS * attempt);
        return joinWithRetry(client, channel, sessionIndex, attempt + 1);
    }
}

// คอยดูแลห้องเสียงตลอด 24/7: กลับเข้าห้องเมื่อโดนเตะ / ถูกย้ายห้อง / หลุดแบบเงียบ ๆ
function startMaintenanceLoop(client, channel, sessionIndex) {
    let joinInFlight = null;

    const ensureConnection = () => {
        if (joinInFlight) return joinInFlight;

        joinInFlight = joinWithRetry(client, channel, sessionIndex)
            .catch(err => {
                console.error(`❌ [Session #${sessionIndex + 1}] เชื่อมต่อห้องเสียงใหม่ไม่สำเร็จ:`, err.message);
            })
            .finally(() => {
                joinInFlight = null;
            });

        return joinInFlight;
    };

    client.on(Constants.Events.VOICE_STATE_UPDATE, (_oldState, newState) => {
        if (newState.id !== client.user.id) return;
        if (newState.channelId === channel.id) return;

        console.log(`⚠️ [Session #${sessionIndex + 1}] หลุดจากห้อง "${channel.name}"! กำลังพยายามเชื่อมต่อใหม่...`);
        ensureConnection();
    });

    const watchdog = setInterval(() => {
        const state = client.voiceStates.cache.get(client.user.id);
        const session = client.voice.session;

        if (state?.channelId === channel.id && session && !session.disconnected) return;

        console.log(`⏰ [Session #${sessionIndex + 1}] Watchdog: ยังไม่ได้อยู่ในห้อง "${channel.name}" กำลังเชื่อมต่อใหม่...`);
        ensureConnection();
    }, WATCHDOG_INTERVAL_MS);
    watchdog.unref();
}

async function startSession(token, channelId, sessionIndex) {
    const client = new Client();

    client.on('ready', async () => {
        console.log(`==================================================`);
        console.log(`[+] Session #${sessionIndex + 1} ล็อกอินสำเร็จ: ${client.user.tag} (${client.user.id})`);
        console.log(`==================================================`);

        try {
            const channel = await fetchTargetChannel(client, channelId, sessionIndex);
            if (!channel) return;

            await joinWithRetry(client, channel, sessionIndex);
            startMaintenanceLoop(client, channel, sessionIndex);
        } catch (err) {
            console.error(`❌ [Session #${sessionIndex + 1}] เกิดข้อผิดพลาด:`, err.message);
        }
    });

    client.login(token).catch(err => {
        console.error(`❌ [Session #${sessionIndex + 1}] ล็อกอินล้มเหลว:`, err.message);
    });
}

module.exports = {
    startSession
};
