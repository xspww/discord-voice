const { tokens, channelIds } = require('./config');
const { startSession } = require('./voice');

console.log(`🚀 กำลังเริ่มการทำงานทั้งหมด ${channelIds.length} Session(s) (E2EE / DAVE Protocol ready)...`);

// Discord จำกัด 1 account ให้อยู่ใน 1 ห้องเสียงพร้อมกัน
// ดังนั้น 1 token ต้องใช้กับ 1 channel เท่านั้น
if (tokens.length < channelIds.length) {
    console.error(`❌ [ERROR] จำนวน TOKEN (${tokens.length}) น้อยกว่าจำนวน CHANNEL (${channelIds.length})`);
    console.error('   1 Discord account อยู่ได้เพียง 1 ห้องเสียงพร้อมกัน');
    console.error('   กรุณาใส่ TOKEN เพิ่มให้เท่ากับจำนวนห้อง (1 token ต่อ 1 ห้อง)');
    process.exit(1);
}

// เริ่มทีละ session พร้อมหน่วงเวลา เพื่อเลี่ยง rate limit ตอน login หลาย account
(async () => {
    for (let index = 0; index < channelIds.length; index++) {
        const token = tokens[index];
        startSession(token, channelIds[index], index);
        if (index < channelIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
})();
