const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { selfDeaf, selfMute } = require('./config');

async function startSession(token, channelId, sessionIndex) {
    const client = new Client({ checkUpdate: false });

    client.on('ready', async () => {
        console.log(`==================================================`);
        console.log(`[+] Session #${sessionIndex + 1} ล็อกอินสำเร็จ: ${client.user.tag} (${client.user.id})`);
        console.log(`==================================================`);

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel || (!channel.isVoice() && channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE')) {
                console.error(`❌ [Session #${sessionIndex + 1}] ไม่พบห้องเสียงสำหรับ ID: ${channelId}`);
                return;
            }

            console.log(`🔄 [Session #${sessionIndex + 1}] กำลังเข้าห้องเสียง: "${channel.name}" (เซิร์ฟเวอร์: ${channel.guild.name})...`);

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: selfDeaf,
                selfMute: selfMute,
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`✅ [Session #${sessionIndex + 1}] เข้าห้องเสียง "${channel.name}" (${channel.guild.name}) สำเร็จแล้ว!`);
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                console.log(`⚠️ [Session #${sessionIndex + 1}] หลุดจากห้อง "${channel.name}"! กำลังพยายามเชื่อมต่อใหม่...`);
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (e) {
                    if (connection) connection.destroy();
                    setTimeout(() => startSession(token, channelId, sessionIndex), 5000);
                }
            });

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
